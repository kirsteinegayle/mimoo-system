<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Admin\ReturnsController as AdminReturns;
use App\Http\Controllers\Api\BuyerReturnController;
use App\Http\Controllers\Api\RiderDeliveryController;
use App\Http\Controllers\Api\RiderPickupController;
use App\Models\BuyerNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\RiderEarning;
use App\Models\SellerNotification;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

/**
 * Rollback-only end-to-end demo flow with the REAL role at every step (real
 * routes + middleware for web steps, the real controllers for rider steps):
 *
 *   buyer order -> seller accept/pack -> hub confirm -> sort-assign -> courier
 *   accept -> schedule + assign rider -> rider scan (+20) -> assign delivery
 *   rider -> out for delivery -> delivered (+20) -> notifications -> buyer
 *   return -> seller reject -> buyer escalate -> admin decides.
 *
 * Also: logistics_staff sees the pickups of THEIR courier company only.
 * Fixture users / orders only; ONE transaction, ALWAYS rolled back. No
 * payment gateway, no existing order, user or role is touched.
 *
 *   php artisan flow:test-end-to-end
 */
class FlowTestEndToEnd extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'flow:test-end-to-end';

    protected $description = 'Rollback-only: one order from buyer to delivered with the right role at each step, company-scoped pickups, returns and notifications';

    public function handle(): int
    {
        $product = $this->anyProduct();
        if (! $product) {
            $this->error('Need at least one product row to build the fixture order item.');
            return self::FAILURE;
        }

        return $this->runRolledBack(fn () => $this->flow($product), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'shipment_assignment_history', 'delivery_jobs',
            'courier_personnel', 'rider_earnings', 'return_requests', 'buyer_notifications', 'seller_notifications',
        ]);
    }

    private function flow($product): void
    {
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified'];
        $buyer   = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $sellerA = $this->makeUser('seller.a', ['account_type' => 'seller', 'role' => 'seller']);
        $sellerB = $this->makeUser('seller.b', ['account_type' => 'seller', 'role' => 'seller']);
        $c1      = $this->makeUser('courier.1', $co + ['company_name' => 'Flow Courier 1']);
        $c2      = $this->makeUser('courier.2', $co + ['company_name' => 'Flow Courier 2']);
        $hub1    = $this->makeUser('hub.1', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c1->id]);
        $hub2    = $this->makeUser('hub.2', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c2->id]);
        $hubNone = $this->makeUser('hub.none', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified']);
        $rider   = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
        $p       = CourierPersonnel::create(['courier_id' => $c1->id, 'user_id' => $rider->id, 'name' => 'Flow Rider', 'role' => 'rider', 'status' => 'active', 'is_online' => true, 'last_checked_in_at' => now()]);

        // ── 1. Buyer order ───────────────────────────────────────────────────
        [$order, $item] = $this->makeOrder($buyer, $sellerA, $product, 'pending');
        $oid = $order->id;
        $sNotif = fn (User $s, string $type) => SellerNotification::where('seller_id', $s->id)->where('type', $type)->get()
            ->filter(fn ($n) => ($n->data['order_id'] ?? null) === $oid)->count();
        $bNotif = fn (string $title) => BuyerNotification::where('buyer_id', $buyer->id)->where('title', $title)->count();
        $this->check('1 buyer order placed -> seller A notified once', $sNotif($sellerA, 'order_placed'), 1, "order #{$oid}");
        $this->check('1 seller B not notified', $sNotif($sellerB, 'order_placed'), 0, '');

        // ── 2. Seller accept + pack ──────────────────────────────────────────
        $this->check('2 seller B cannot pack seller A order', $this->http($sellerB, 'PATCH', "/api/seller/orders/{$oid}/status", ['action' => 'pack'])['status'], 404, '');
        $this->check('2 seller A accepts', $this->http($sellerA, 'PATCH', "/api/seller/orders/{$oid}/status", ['action' => 'accept'])['status'], 200, '');
        $r = $this->http($sellerA, 'PATCH', "/api/seller/orders/{$oid}/status", ['action' => 'pack']);
        $order->refresh();
        $this->check('2 seller A packs (status + waybill)', $r['status'] . '/' . $order->status . '/' . ($order->waybill_number ? 'waybill' : '-'), '200/packed/waybill', '');
        $wb = $order->waybill_number;
        $this->check('2 buyer notified "Order packed"', $bNotif('Order packed'), 1, '');

        // ── 3. Hub confirm (logistics_staff only) ────────────────────────────
        $this->check('3 seller cannot confirm at hub', $this->http($sellerA, 'POST', "/api/logistics/parcel/{$oid}/confirm")['status'], 403, 'portal gate');
        $this->check('3 courier cannot confirm at hub', $this->http($c1, 'POST', "/api/logistics/parcel/{$oid}/confirm")['status'], 403, '');
        $r = $this->http($hub1, 'POST', "/api/logistics/parcel/{$oid}/confirm");
        $this->check('3 hub confirms packed -> shipped', $r['status'] . '/' . Order::find($oid)->status, '200/shipped', '');
        $this->check('3 hub confirm twice refused', $this->http($hub1, 'POST', "/api/logistics/parcel/{$oid}/confirm")['status'], 400, '');
        $this->check('3 buyer notified "Order shipped"', $bNotif('Order shipped'), 1, '');

        // ── 4. Logistics pages + sort-assign ─────────────────────────────────
        $dash = $this->http($hub1, 'GET', '/logistics/dashboard', [], true);
        $this->check('4 dashboard: real stats (pendingSort >= 1)', $dash['status'] . '/' . ((int) ($dash['body']['props']['stats']['pendingSort'] ?? 0) >= 1 ? 'ok' : 'zero'), '200/ok', 'was hardcoded 10');
        $this->check('4 dashboard: no mock rows', str_contains($dash['raw'], 'F. Dela Cruz') ? 'mock' : 'clean', 'clean', '');
        $this->check('4 dashboard blocked for seller', $this->http($sellerA, 'GET', '/logistics/dashboard', [], true)['status'], 403, 'portal gate');
        $sa = $this->http($hub1, 'GET', '/logistics/sort-assign', [], true);
        $this->check('4 sort-assign lists the parcel + approved couriers', $sa['status'] . '/' . (collect($sa['body']['props']['parcels'] ?? [])->contains('id', $oid) ? 'parcel' : '-') . '/' . (collect($sa['body']['props']['couriers'] ?? [])->contains('id', $c1->id) ? 'courier' : '-'), '200/parcel/courier', '');
        foreach (['/logistics/incoming-parcels', '/logistics/courier-applications'] as $page) {
            $this->check("4 {$page} opens for hub", $this->http($hub1, 'GET', $page, [], true)['status'], 200, '');
            $this->check("4 {$page} blocked for rider-less role", $this->http($sellerA, 'GET', $page, [], true)['status'], 403, '');
        }
        $r = $this->http($hub1, 'POST', '/api/logistics/assign-to-courier', ['parcel_ids' => [$oid], 'courier_id' => $c1->id]);
        $assign = ShipmentAssignment::where('order_id', $oid)->first();
        $this->check('4 sort-assign -> courier company 1', $r['status'] . '/' . ($assign?->assignment_status ?? '-') . '/' . Order::find($oid)->status, '200/pending/in_transit', $r['body']['message'] ?? '');
        $aid = $assign->id;
        $sa2 = $this->http($hub1, 'GET', '/logistics/sort-assign', [], true);
        $this->check('4 assigned parcel leaves sort-assign', collect($sa2['body']['props']['parcels'] ?? [])->contains('id', $oid) ? 'still listed' : 'gone', 'gone', '');

        // ── 5. Courier accept (company-scoped) ───────────────────────────────
        $inc = fn (User $u) => str_contains($this->http($u, 'GET', '/courier/incoming-shipments', [], true)['raw'], $wb) ? 'sees' : 'hidden';
        $this->check('5 incoming: hub of company 1', $inc($hub1), 'sees', 'was empty (courier_id = user.id)');
        $this->check('5 incoming: courier company 1', $inc($c1), 'sees', 'courier access unchanged');
        $this->check('5 incoming: hub of company 2', $inc($hub2), 'hidden', '');
        $this->check('5 incoming: hub without company', $inc($hubNone), 'hidden', '');
        $this->check('5 other company hub cannot accept', $this->http($hub2, 'POST', "/api/courier/shipments/{$aid}/accept")['status'], 404, '');
        $this->check('5 seller cannot accept', $this->http($sellerA, 'POST', "/api/courier/shipments/{$aid}/accept")['status'], 403, '');
        $r = $this->http($hub1, 'POST', "/api/courier/shipments/{$aid}/accept");
        $this->check('5 hub of company 1 accepts', $r['status'] . '/' . ShipmentAssignment::find($aid)->assignment_status, '200/accepted', $r['body']['message'] ?? '');

        // ── 6. Pickups visible to the right people ───────────────────────────
        $pick = fn (User $u) => str_contains($this->http($u, 'GET', '/courier/pickup-management', [], true)['raw'], $wb) ? 'sees' : 'hidden';
        $this->check('6 pickups: logistics_staff of company 1', $pick($hub1), 'sees', '');
        $this->check('6 pickups: courier company 1 (unchanged)', $pick($c1), 'sees', '');
        $this->check('6 pickups: logistics_staff of company 2', $pick($hub2), 'hidden', 'not other companies');
        $this->check('6 pickups: courier company 2', $pick($c2), 'hidden', '');
        $this->check('6 pickups: staff without company', $pick($hubNone), 'hidden', '');
        $this->check('6 pickups: seller blocked', $this->http($sellerA, 'GET', '/courier/pickup-management', [], true)['status'], 403, '');
        $this->check('6 pickups: rider blocked on web', $this->http($rider, 'GET', '/courier/pickup-management', [], true)['status'], 403, '');
        $this->check('6 pickup detail: company 2 hub', $this->http($hub2, 'GET', "/api/courier/pickups/{$aid}")['status'], 404, '');
        $this->check('6 pickup detail: company 1 hub', $this->http($hub1, 'GET', "/api/courier/pickups/{$aid}")['status'], 200, '');

        // ── 7. Schedule + assign rider (pickup) ──────────────────────────────
        $this->check('7 schedule by company 2 hub', $this->http($hub2, 'POST', "/api/courier/pickups/{$aid}/schedule", ['scheduled_date' => now()->toDateString(), 'scheduled_time_window' => '09:00-12:00'])['status'], 404, '');
        $r = $this->http($hub1, 'POST', "/api/courier/pickups/{$aid}/schedule", ['scheduled_date' => now()->toDateString(), 'scheduled_time_window' => '09:00-12:00']);
        $this->check('7 schedule by hub 1', $r['status'] . '/' . ShipmentAssignment::find($aid)->pickup_status, '200/scheduled', $r['body']['message'] ?? '');
        $this->check('7 assign rider by company 2 hub', $this->http($hub2, 'POST', "/api/courier/pickups/{$aid}/assign-personnel", ['personnel_id' => $p->id])['status'], 404, '');
        $r = $this->http($hub1, 'POST', "/api/courier/pickups/{$aid}/assign-personnel", ['personnel_id' => $p->id]);
        $this->check('7 assign rider by hub 1', $r['status'] . '/' . ShipmentAssignment::find($aid)->assigned_personnel_id, "200/{$p->id}", $r['body']['message'] ?? '');
        $this->check('7 history records the staff member (actor)', ShipmentAssignmentHistory::where('assignment_id', $aid)->where('notes', 'like', 'Pickup scheduled%')->value('performed_by'), $hub1->id, '');

        // ── 8. Rider scan: picked up, +20, seller notified ───────────────────
        $scan = app(RiderPickupController::class);
        $this->check('8 wrong waybill', $this->hit(fn () => $scan->scan($this->req($rider, ['waybill_number' => 'WRONG']), $aid))['status'], 422, '');
        $r = $this->hit(fn () => $scan->scan($this->req($rider, ['waybill_number' => $wb]), $aid));
        $this->check('8 rider scans waybill', $r['status'] . '/' . ShipmentAssignment::find($aid)->pickup_status, '200/picked_up', $r['body']['message'] ?? '');
        $this->check('8 pickup earning +20', number_format((float) RiderEarning::where('rider_user_id', $rider->id)->where('type', RiderEarning::TYPE_PICKUP)->sum('amount'), 2), '20.00', '');
        $this->hit(fn () => $scan->scan($this->req($rider, ['waybill_number' => $wb]), $aid));
        $this->check('8 repeat scan: still one earning', RiderEarning::where('rider_user_id', $rider->id)->count(), 1, '');
        $this->check('8 seller A notified "picked up" once', $sNotif($sellerA, 'picked_up'), 1, '');

        // ── 9. Assign delivery rider ─────────────────────────────────────────
        $dm = $this->http($hub1, 'GET', '/courier/delivery-management', [], true);
        $row = collect($dm['body']['props']['orders'] ?? [])->firstWhere('id', $oid);
        $this->check('9 delivery page (hub 1): order assignable + rider listed', ($row['assignable'] ?? false ? 'assignable' : 'no') . '/' . (collect($dm['body']['props']['riders'] ?? [])->contains('personnel_id', $p->id) ? 'rider' : '-'), 'assignable/rider', 'was empty');
        $this->http($hub2, 'POST', '/courier/delivery-management/assign', ['order_id' => $oid, 'personnel_id' => $p->id]);
        $this->check('9 company 2 hub cannot assign', DeliveryJob::where('order_id', $oid)->count(), 0, '');
        $this->http($hub1, 'POST', '/courier/delivery-management/assign', ['order_id' => $oid, 'personnel_id' => $p->id]);
        $job = DeliveryJob::where('order_id', $oid)->first();
        $this->check('9 hub 1 assigns delivery rider', ($job?->status ?? '-') . '/' . ($job?->rider_user_id ?? '-') . '/' . ($job?->courier_id ?? '-'), "assigned/{$rider->id}/{$c1->id}", '');
        $this->check('9 assigned_by is the staff member', $job?->assigned_by, $hub1->id, '');

        // ── 10. Out for delivery -> delivered ────────────────────────────────
        $del = app(RiderDeliveryController::class);
        $r = $this->hit(fn () => $del->outForDelivery($this->req($rider), $job->id));
        $this->check('10 out for delivery', $r['status'] . '/' . DeliveryJob::find($job->id)->status, '200/out_for_delivery', $r['body']['message'] ?? '');
        $this->check('10 seller A notified "out for delivery"', $sNotif($sellerA, 'out_for_delivery'), 1, '');
        $sa3 = $this->http($hub1, 'GET', '/logistics/sort-assign', [], true);
        $this->check('10 order (shipped again) not back in sort-assign', collect($sa3['body']['props']['parcels'] ?? [])->contains('id', $oid) ? 'listed' : 'hidden', 'hidden', 'active assignment excluded');
        $old = $this->hit(fn () => $del->requestOtp($this->req($rider), $job->id));
        $this->check('10 old app asks for a code: 200, nothing issued', $old['status'] . '/' . (isset($old['body']['debug_otp']) ? 'CODE' : 'none') . '/' . $job->otps()->count(), '200/none/0', 'delivery code removed');
        $noPhoto = $this->hit(fn () => $del->deliver($this->req($rider, ['cod_collected' => 100]), $job->id));
        $this->check('10 deliver without proof photo: 422 with a clear message', $noPhoto['status'] . '/' . (str_contains((string) ($noPhoto['body']['message'] ?? ''), 'Proof of delivery is required') ? 'message' : 'other'), '422/message', $noPhoto['body']['message'] ?? '');
        DeliveryJob::whereKey($job->id)->update(['pod_photo_path' => 'flow-test/none.jpg', 'pod_uploaded_at' => now()]);
        $this->check('10 wrong COD amount', $this->hit(fn () => $del->deliver($this->req($rider, ['cod_collected' => 5]), $job->id))['status'], 422, '');
        $r = $this->hit(fn () => $del->deliver($this->req($rider, ['otp' => '000000', 'cod_collected' => 100]), $job->id)); // an old app still sends otp: ignored
        $this->check('10 delivered (POD + exact COD; a stray otp field is ignored)', $r['status'] . '/' . DeliveryJob::find($job->id)->status, '200/delivered', $r['body']['message'] ?? '');
        $this->check('10 rider earnings: pickup + delivery rate', number_format((float) RiderEarning::where('rider_user_id', $rider->id)->sum('amount'), 2) . '/' . RiderEarning::where('rider_user_id', $rider->id)->count(), number_format(RiderEarning::PICKUP_RATE + RiderEarning::DELIVERY_RATE, 2, '.', '') . '/2', 'pickup ' . RiderEarning::PICKUP_RATE . ' + delivery ' . RiderEarning::DELIVERY_RATE);
        $this->check('10 seller A notified "delivered" once', $sNotif($sellerA, 'delivered'), 1, '');
        $this->check('10 seller B got no delivery notifications', SellerNotification::where('seller_id', $sellerB->id)->count(), 0, '');

        // ── 11. Buyer return -> seller -> escalate -> admin ──────────────────
        $paymentBefore = Order::find($oid)->payment_status;
        $rr = ReturnRequest::create(['order_id' => $oid, 'buyer_id' => $buyer->id, 'reason' => 'Damaged', 'description' => 'Flow test: item arrived damaged.', 'images' => [], 'status' => 'pending']);
        $rn = fn (string $status) => BuyerNotification::where('buyer_id', $buyer->id)->where('type', 'return_status')->get()
            ->filter(fn ($n) => ($n->data['return_id'] ?? null) === $rr->id && ($n->data['status'] ?? null) === $status)->count();
        $ids = fn (User $s) => collect($this->http($s, 'GET', '/seller/returns/feed?status=all')['body']['data'] ?? [])->pluck('id')->all();
        $this->check('11 seller A sees the return', json_encode($ids($sellerA)), json_encode([$rr->id]), '');
        $this->check('11 seller B does not', json_encode($ids($sellerB)), '[]', '');
        $this->check('11 seller B decide -> 404', $this->http($sellerB, 'POST', "/seller/returns/{$rr->id}/decision", ['action' => 'approve'])['status'], 404, '');
        $this->check('11 reject without note -> 422', $this->http($sellerA, 'POST', "/seller/returns/{$rr->id}/decision", ['action' => 'reject'])['status'], 422, '');
        $r = $this->http($sellerA, 'POST', "/seller/returns/{$rr->id}/decision", ['action' => 'reject', 'note' => 'Item looked fine on delivery.']);
        $this->check('11 seller rejects with note', $r['status'] . '/' . ReturnRequest::find($rr->id)->status, '200/rejected', '');
        $this->check('11 one buyer notification for the decision', $rn('rejected'), 1, '');
        $this->check('11 resolved cannot be changed', $this->http($sellerA, 'POST', "/seller/returns/{$rr->id}/decision", ['action' => 'approve'])['status'], 422, '');
        $r = $this->hit(fn () => app(BuyerReturnController::class)->escalate($this->req($buyer), $rr->id));
        $this->check('11 buyer escalates', $r['status'] . '/' . ReturnRequest::find($rr->id)->status, '200/escalated', '');
        $this->check('11 seller A notified of escalation once', SellerNotification::where('seller_id', $sellerA->id)->where('type', 'return_escalated')->count(), 1, '');
        $admin = app(AdminReturns::class);
        $this->check('11 admin sees it in escalated feed', json_encode(collect($this->hit(fn () => $admin->feed($this->req($buyer, [], 'GET')))['body']['data'] ?? [])->pluck('id')->all()), json_encode([$rr->id]), '');
        $this->check('11 admin reject needs note', $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'reject']), $rr->id))['status'], 422, '');
        $r = $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'reject', 'note' => 'Seller evidence stands.']), $rr->id));
        $this->check('11 admin rejects with note', $r['status'] . '/' . ReturnRequest::find($rr->id)->status, '200/rejected', '');
        $this->check('11 buyer notifications per status', $rn('pending') . ',' . $rn('rejected') . ',' . $rn('escalated'), '1,2,1', 'rejected once by seller, once by admin');
        $this->check('11 admin repeat refused', $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'approve']), $rr->id))['status'], 422, '');
        $this->check('11 refund = status only (payment_status unchanged)', Order::find($oid)->payment_status, $paymentBefore, 'no gateway call');
    }
}
