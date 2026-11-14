<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Admin\ReturnsController as AdminReturns;
use App\Http\Controllers\Api\BuyerReturnController;
use App\Models\BuyerNotification;
use App\Models\Order;
use App\Models\Refund;
use App\Models\ReturnRequest;
use App\Services\Refund\FakeRefundDriver;
use App\Services\RefundService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

/**
 * Rollback-only test of refunds: records, status flow, idempotency, one active
 * refund per return, failed + retry, manual and fake drivers, no live call,
 * payment_status only when the value is valid, no card data anywhere.
 *
 *   php artisan refund:test
 */
class RefundTest extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'refund:test';

    protected $description = 'Rollback-only: refund records, idempotency, one active refund per return, retry, drivers, no gateway call';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), ['users', 'orders', 'order_items', 'return_requests', 'refunds', 'buyer_notifications']);
    }

    private function runTests(): void
    {
        Http::preventStrayRequests();
        Http::fake(); // any accidental HTTP call would be recorded below

        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $stockBefore = DB::table('products')->sum('stock');

        $buyer  = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $buyer2 = $this->makeUser('buyer.2', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);

        $approved = function (string $payment = 'cod') use ($buyer, $seller, $p) {
            [$o] = $this->makeOrder($buyer, $seller, $p, 'shipped', $payment);
            $rr = ReturnRequest::create(['order_id' => $o->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged',
                'description' => 'Flow test: broken.', 'images' => [], 'status' => 'pending']);
            $this->http($seller, 'POST', "/seller/returns/{$rr->id}/decision", ['action' => 'approve']);
            return [$o->fresh(), $rr->fresh()];
        };
        $notifs = fn (ReturnRequest $rr, string $type, string $status) => BuyerNotification::where('buyer_id', $rr->buyer_id)->where('type', $type)->get()
            ->filter(fn ($n) => ($n->data['return_id'] ?? null) === $rr->id && ($n->data['status'] ?? null) === $status)->count();

        // ── structure / safety ──────────────────────────────────────────────
        $cols = Schema::getColumnListing('refunds');
        $this->check('refunds has no card / cvv / pin / token column', preg_grep('/card|cvv|cvc|pin|pan|token|number/i', $cols) ? 'FOUND' : 'none', 'none', implode(',', $cols));
        $this->check('only manual and fake drivers exist', implode(',', array_keys(config('refunds.drivers'))), 'manual,fake', 'no real gateway driver');
        $this->check('default driver is manual', config('refunds.driver'), 'manual', '');
        $this->check('return_stock flag is OFF by default', json_encode(config('refunds.return_stock')), 'false', '');
        $this->check("'refunded' is a known payment_status value (written once on refund)", json_encode(RefundService::paymentStatusAfterRefund()), json_encode('refunded'), 'see refund:test-payment-status');
        $route = collect(Route::getRoutes()->getRoutes())->first(fn ($x) => $x->uri() === 'admin/returns/{id}/refund');
        $this->check('refund route is admin-session only', $route && in_array('admin.verified', $route->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', '');
        $this->check('refund without admin session', $this->http(null, 'POST', '/admin/returns/1/refund', ['amount' => 1])['status'], 403, '');

        // ── manual driver (default) ─────────────────────────────────────────
        [$o1, $r1] = $approved('cod');
        $admin = app(AdminReturns::class);
        $call = fn (int $id, array $d) => $this->hit(function () use ($admin, $id, $d) {
            $req = Request::create("/admin/returns/{$id}/refund", 'POST', $d, [], [], ['HTTP_ACCEPT' => 'application/json']);
            app()->instance('request', $req);
            return $admin->refund($req, $id);
        });
        $this->check('seller-approved return reaches the admin refund list', in_array($r1->id, collect($this->hit(function () use ($admin, $buyer) {
            return $admin->feed($this->req($buyer, [], 'GET', ['status' => 'refund']));
        })['body']['data'] ?? [])->pluck('id')->all(), true) ? 'listed' : 'missing', 'listed', 'not escalated, still refundable');
        $this->check('manual: reference required', $call($r1->id, ['amount' => 100])['status'], 422, '');
        $this->check('manual: failed attempt is recorded as failed', Refund::where('return_request_id', $r1->id)->value('status'), 'failed', 'can be retried');
        $this->check('amount over order total', $call($r1->id, ['amount' => 100.01, 'reference' => 'REC-1'])['status'], 422, '');
        $this->check('amount zero', $call($r1->id, ['amount' => 0, 'reference' => 'REC-1'])['status'], 422, '');
        $this->check('amount missing', $call($r1->id, ['reference' => 'REC-1'])['status'], 422, '');
        $r = $call($r1->id, ['amount' => 100, 'reference' => 'REC-1001']);
        $this->check('manual: retry of the failed refund succeeds', $r['status'] . '/' . ($r['body']['data']['status'] ?? '-') . '/' . ($r['body']['data']['reference'] ?? '-'), '200/refunded/REC-1001', $r['body']['message'] ?? '');
        $this->check('still ONE refund row (retry reused it)', Refund::where('return_request_id', $r1->id)->count(), 1, '');
        $this->check('refund row: method from the order, gateway manual', Refund::where('return_request_id', $r1->id)->value('method') . '/' . Refund::where('return_request_id', $r1->id)->value('gateway'), 'cod/manual', '');
        $this->check('return request is now refunded', ReturnRequest::find($r1->id)->status, 'refunded', '');
        $this->check('buyer: exactly 1 "Refund completed" notification', $notifs($r1, 'return_status', 'refunded'), 1, '');
        $this->check('buyer: refund_status notifications for refunded', $notifs($r1, 'refund_status', 'refunded'), 0, 'covered by the return status change');
        $this->check('buyer: 1 "refund delayed" notification for the failed attempt', $notifs($r1, 'refund_status', 'failed'), 1, '');

        $again = $call($r1->id, ['amount' => 100, 'reference' => 'REC-1001']);
        $this->check('replay (same key): 200 idempotent', $again['status'] . '/' . json_encode($again['body']['idempotent'] ?? null), '200/true', '');
        $this->check('replay: no second refund, no extra notification', Refund::where('return_request_id', $r1->id)->count() . '/' . $notifs($r1, 'return_status', 'refunded'), '1/1', '');
        $this->check('different key on an active refund', $call($r1->id, ['amount' => 100, 'reference' => 'REC-2', 'idempotency_key' => 'other-key'])['status'], 422, 'one active refund per return');
        $this->check('reference of the stored refund unchanged', Refund::where('return_request_id', $r1->id)->value('reference'), 'REC-1001', '');

        // database-level guard: a second active row for the same return is impossible
        $dupe = 'no';
        try {
            DB::table('refunds')->insert(['return_request_id' => $r1->id, 'order_id' => $o1->id, 'amount' => 1, 'method' => 'cod', 'gateway' => 'manual',
                'idempotency_key' => 'raw-dup', 'status' => 'pending', 'active_return_id' => $r1->id, 'created_at' => now(), 'updated_at' => now()]);
            $dupe = 'INSERTED';
        } catch (\Throwable $e) {
            $dupe = 'refused by unique key';
        }
        $this->check('database refuses a 2nd active refund for a return', $dupe, 'refused by unique key', '');

        // ── states that are not refundable ──────────────────────────────────
        [$o2] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        $pending = ReturnRequest::create(['order_id' => $o2->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged', 'description' => 'Flow test: broken.', 'images' => [], 'status' => 'pending']);
        $this->check('pending return cannot be refunded', $call($pending->id, ['amount' => 10, 'reference' => 'X'])['status'], 422, '');
        $this->check('unknown return', $call(99999999, ['amount' => 10, 'reference' => 'X'])['status'], 404, '');
        $this->check('no refund row for a refused request', Refund::where('return_request_id', $pending->id)->count(), 0, '');

        // ── fake driver: failure then retry ─────────────────────────────────
        [$o3, $r3] = $approved('gcash');
        FakeRefundDriver::$calls = 0;
        FakeRefundDriver::$failNext = 'Gateway timeout (simulated)';
        $f = RefundService::process($r3->id, ['amount' => 50], null, 'fake');
        $row = Refund::where('return_request_id', $r3->id)->first();
        $this->check('fake: simulated failure', json_encode($f['ok']) . '/' . $row?->status . '/' . $row?->failure_reason, 'false/failed/Gateway timeout (simulated)', '');
        $this->check('failed refund frees the active slot', json_encode($row?->active_return_id), 'null', '');
        $this->check('return stays approved after a failure', ReturnRequest::find($r3->id)->status, 'approved', '');
        $this->check('buyer notified once about the failure', $notifs($r3, 'refund_status', 'failed'), 1, '');
        $this->check('method taken from the order (gcash)', $row?->method, 'gcash', '');
        $ok = RefundService::process($r3->id, ['amount' => 50], null, 'fake');
        $row = Refund::where('return_request_id', $r3->id)->first();
        $this->check('fake: retry succeeds on the same row', json_encode($ok['ok']) . '/' . $row->status . '/' . Refund::where('return_request_id', $r3->id)->count() . '/' . (str_starts_with((string) $row->reference, 'FAKE-') ? 'ref' : '-'), 'true/refunded/1/ref', '');
        $callsAfter = FakeRefundDriver::$calls;
        $rep = RefundService::process($r3->id, ['amount' => 50], null, 'fake');
        $this->check('fake: replay does not call the driver again', FakeRefundDriver::$calls . '/' . json_encode($rep['idempotent'] ?? null), "{$callsAfter}/true", '');
        $this->check('partial amount stored', (float) $row->amount, 50.0, 'amount may be lower than the order total');
        $this->check('1 completed notification only', $notifs($r3, 'return_status', 'refunded'), 1, '');

        // ── buyer view (web only) ───────────────────────────────────────────
        $mine = $this->http($buyer, 'GET', '/buyer/refunds');
        $this->check('buyer sees own refund status', $mine['status'] . '/' . ($mine['body']['data'][$r1->id]['status'] ?? '-') . '/' . ($mine['body']['data'][$r1->id]['reference'] ?? '-'), '200/refunded/REC-1001', '');
        $this->check('buyer payload hides internals', implode(',', array_keys($mine['body']['data'][$r1->id] ?? [])), 'status,amount,method,reference,refunded_at', '');
        $this->check("other buyer sees none of them", json_encode($this->http($buyer2, 'GET', '/buyer/refunds')['body']['data'] ?? 'x'), '[]', '');
        $this->check('seller account blocked', $this->http($seller, 'GET', '/buyer/refunds')['status'], 403, '');
        $api = app(BuyerReturnController::class);
        $row = $this->hit(fn () => $api->show($this->req($buyer, [], 'GET'), $r1->id));
        $this->check('mobile /returns payload has no new key', implode(',', array_keys($row['body']['data'] ?? [])), 'id,order_id,order_number,order_status,order_total,reason,description,images,status,seller_response,responded_at,escalated_at,can_escalate,created_at,updated_at', 'same shape');

        // ── nothing else touched ────────────────────────────────────────────
        $this->check('orders.payment_status = refunded on the refunded orders only', Order::whereIn('id', [$o1->id, $o3->id])->pluck('payment_status')->unique()->implode(','), 'refunded', 'no gateway call');
        $this->check('stock untouched', DB::table('products')->sum('stock'), $stockBefore, 'return_stock is off');
        $this->check('no outgoing HTTP call was made', count(Http::recorded()), 0, 'no live gateway call');
    }
}
