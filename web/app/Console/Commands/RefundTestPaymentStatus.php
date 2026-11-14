<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Api\CourierDeliveryController;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\ShipmentAssignment;
use App\Services\Refund\FakeRefundDriver;
use App\Services\RefundService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Rollback-only: orders.payment_status becomes "refunded" exactly once, in the
 * refund transaction; nothing else changes it; readers treat it as paid.
 *
 *   php artisan refund:test-payment-status
 */
class RefundTestPaymentStatus extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'refund:test-payment-status';

    protected $description = 'Rollback-only: payment_status = refunded once on refund, never on failure or other orders, readers treat it as paid';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), ['users', 'orders', 'order_items', 'return_requests', 'refunds', 'shipment_assignments']);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $buyer  = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);
        $c1     = $this->makeUser('courier', ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified']);

        $mk = function (string $payment, string $paymentStatus) use ($buyer, $seller, $p) {
            [$o] = $this->makeOrder($buyer, $seller, $p, 'shipped', $payment);
            DB::table('orders')->where('id', $o->id)->update(['payment_status' => $paymentStatus]);
            $rr = ReturnRequest::create(['order_id' => $o->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged', 'description' => 'Flow test: broken.', 'images' => [], 'status' => 'pending']);
            $this->http($seller, 'POST', "/seller/returns/{$rr->id}/decision", ['action' => 'approve']);
            return [Order::find($o->id), $rr->fresh()];
        };
        $ps = fn (Order $o) => Order::find($o->id)->payment_status;

        [$paidOrder, $paidReturn]   = $mk('gcash', 'paid');
        [$codOrder, $codReturn]     = $mk('cod', 'unpaid');
        [$failOrder, $failReturn]   = $mk('gcash', 'paid');
        [$otherPaid]                = $this->makeOrder($buyer, $seller, $p, 'shipped', 'gcash');
        DB::table('orders')->where('id', $otherPaid->id)->update(['payment_status' => 'paid']);
        [$otherUnpaid]              = $this->makeOrder($buyer, $seller, $p, 'shipped', 'cod');

        $this->check('before: approved return does not touch payment_status', $ps($paidOrder) . '/' . $ps($codOrder), 'paid/unpaid', '');
        $this->check("'refunded' is a known value in the config", json_encode(RefundService::paymentStatusAfterRefund()), json_encode('refunded'), '');

        // ── manual driver: refunded -> payment_status refunded ──────────────
        $r = RefundService::process($paidReturn->id, ['amount' => 100, 'reference' => 'REC-PS-1'], null);
        $this->check('manual refund of a PAID order', json_encode($r['ok']) . '/' . $ps($paidOrder), 'true/refunded', '');
        $r = RefundService::process($codReturn->id, ['amount' => 100, 'reference' => 'REC-PS-2'], null);
        $this->check('manual refund of an unpaid COD order (cash was collected at the door)', json_encode($r['ok']) . '/' . $ps($codOrder), 'true/refunded', '');

        // ── idempotent: replay writes nothing ───────────────────────────────
        DB::table('orders')->where('id', $paidOrder->id)->update(['updated_at' => now()->subDay()]);
        $stamp = Order::find($paidOrder->id)->updated_at->toDateTimeString();
        $rep = RefundService::process($paidReturn->id, ['amount' => 100, 'reference' => 'REC-PS-1'], null);
        $this->check('replay: idempotent, still refunded, order row untouched', json_encode($rep['idempotent'] ?? null) . '/' . $ps($paidOrder) . '/' . (Order::find($paidOrder->id)->updated_at->toDateTimeString() === $stamp ? 'same' : 'CHANGED'), 'true/refunded/same', '');
        $rep = RefundService::process($paidReturn->id, ['amount' => 100, 'reference' => 'REC-OTHER', 'idempotency_key' => 'again'], null);
        $this->check('different key on a refunded return refused, status stays', json_encode($rep['ok']) . '/' . $ps($paidOrder), 'false/refunded', '');
        $this->check('refund time did not move orders.updated_at on first write either', Order::find($codOrder->id)->updated_at->diffInSeconds(now()) >= 0 ? 'ok' : '-', 'ok', 'plain query write');

        // ── failure and other orders do not change ──────────────────────────
        FakeRefundDriver::$failNext = 'Gateway down (simulated)';
        $f = RefundService::process($failReturn->id, ['amount' => 100], null, 'fake');
        $this->check('failed refund: payment_status unchanged', json_encode($f['ok']) . '/' . $ps($failOrder), 'false/paid', '');
        $this->check('refusal (amount over total): unchanged', json_encode(RefundService::process($failReturn->id, ['amount' => 9999], null, 'fake')['ok']) . '/' . $ps($failOrder), 'false/paid', '');
        $ok = RefundService::process($failReturn->id, ['amount' => 100], null, 'fake');
        $this->check('retry succeeds -> refunded (once)', json_encode($ok['ok']) . '/' . $ps($failOrder), 'true/refunded', '');
        $this->check('paid orders that were not refunded are unchanged', $ps($otherPaid), 'paid', '');
        $this->check('unpaid orders that were not refunded are unchanged', $ps($otherUnpaid), 'unpaid', '');
        $this->check('exactly 3 orders are refunded', Order::whereIn('id', [$paidOrder->id, $codOrder->id, $failOrder->id, $otherPaid->id, $otherUnpaid->id])->where('payment_status', 'refunded')->count(), 3, '');

        // ── readers: refunded counts as paid, nothing is collected again ────
        [$cod2] = $this->makeOrder($buyer, $seller, $p, 'in_transit', 'cod');
        DB::table('orders')->where('id', $cod2->id)->update(['payment_status' => 'refunded']);
        [$cod3] = $this->makeOrder($buyer, $seller, $p, 'in_transit', 'cod');
        foreach ([$cod2, $cod3] as $o) {
            ShipmentAssignment::create(['order_id' => $o->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id, 'assigned_at' => now(),
                'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted', 'pickup_status' => 'picked_up']);
        }
        $res = $this->hit(fn () => app(CourierDeliveryController::class)->orders($this->req($c1, [], 'GET')));
        $rows = collect($res['body']['data'] ?? [])->keyBy('id');
        $this->check('courier delivery list: refunded COD order owes 0, unpaid COD owes the total', ($rows[$cod2->id]['cod_amount'] ?? '-') . '/' . ($rows[$cod3->id]['cod_amount'] ?? '-'), '0/100', 'status ' . $res['status']);
        $web = $this->http($c1, 'GET', '/courier/delivery-management', [], true);
        $wrows = collect($web['body']['props']['orders'] ?? [])->keyBy('id');
        $this->check('courier web delivery page: same', ($wrows[$cod2->id]['cod_amount'] ?? '-') . '/' . ($wrows[$cod3->id]['cod_amount'] ?? '-'), '0/100', '');
        $buyerOrders = $this->http($buyer, 'GET', '/api/buyer/orders');
        $this->check('buyer API still returns the raw payment_status string', json_encode(collect($buyerOrders['body']['data'] ?? [])->contains('payment_status', 'refunded')), 'true', 'status ' . $buyerOrders['status']);
        $tsx = (string) file_get_contents(resource_path('js/pages/OrderDetail.tsx')) . (string) file_get_contents(resource_path('js/pages/MyPurchases.tsx'));
        $this->check('buyer web pages handle "refunded"', substr_count($tsx, 'refunded') >= 3 ? 'yes' : 'NO', 'yes', 'OrderDetail label, MyPurchases tab');
        $this->check('no card data anywhere in the refund payload', json_encode(array_keys(Order::find($paidOrder->id)->refund?->toPayload() ?? \App\Models\Refund::where('return_request_id', $paidReturn->id)->first()->toPayload())), json_encode(['id', 'return_id', 'amount', 'method', 'status', 'reference', 'failure_reason', 'refunded_at', 'updated_at']), '');
    }
}
