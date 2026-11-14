<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Api\RiderPickupController;
use App\Http\Controllers\SellerDashboardController;
use App\Models\BuyerNotification;
use App\Models\CodRemittance;
use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\RiderEarning;
use App\Models\RiderNotification;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use App\Models\ShipmentScan;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Rollback-only tests for the gaps closed in the order / return flow:
 *  1 parcel scanning refuses unassigned parcels      5 hub receives a returned parcel
 *  2 stuck in_transit orders are reopened            6 history action values never fail
 *  3 seller in_transit stage / dashboard label       7 legacy seller order status calls are guarded
 *  4 courier COD confirmation (once, right actor)    8 no double assign / earning / pickup
 *
 *   php artisan flow:test-gaps
 */
class FlowTestGaps extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'flow:test-gaps';

    protected $description = 'Rollback-only: parcel scan guard, stuck orders, seller stages, COD confirm, hub return receiving, history actions, legacy seller api, duplicates';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'shipment_assignment_history', 'shipment_scans', 'delivery_jobs',
            'courier_personnel', 'courier_facilities', 'cod_remittances', 'rider_earnings', 'rider_notifications', 'buyer_notifications',
        ]);
    }

    private function facility(User $courier, string $tag): CourierFacility
    {
        return CourierFacility::create(['courier_id' => $courier->id, 'facility_name' => "Gap {$tag}", 'facility_code' => 'GAP-' . strtoupper($tag) . '-' . $courier->id,
            'facility_type' => 'branch', 'status' => 'Active', 'region' => 'R', 'city' => 'C', 'address' => 'A', 'manager_name' => 'M',
            'contact_number' => '0', 'coverage_cities' => '[]']);
    }

    private function assignment(Order $o, User $c, string $assignStatus = 'accepted', string $pickup = 'pending_pickup'): ShipmentAssignment
    {
        return ShipmentAssignment::create(['order_id' => $o->id, 'courier_id' => $c->id, 'assigned_by' => $c->id, 'assigned_at' => now(),
            'acceptance_deadline' => now()->addDay(), 'assignment_status' => $assignStatus, 'pickup_status' => $pickup]);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified'];
        $buyer  = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);
        $c1     = $this->makeUser('courier.1', $co + ['company_name' => 'Gap C1']);
        $c2     = $this->makeUser('courier.2', $co + ['company_name' => 'Gap C2']);
        $hub1   = $this->makeUser('hub.1', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c1->id]);
        $hub2   = $this->makeUser('hub.2', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c2->id]);
        $rider  = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
        $pers   = CourierPersonnel::create(['courier_id' => $c1->id, 'user_id' => $rider->id, 'name' => 'Gap Rider', 'role' => 'rider', 'status' => 'active', 'is_online' => true, 'last_checked_in_at' => now()]);
        $f1 = $this->facility($c1, 'one');
        $f2 = $this->facility($c2, 'two');
        $mk = function (string $status = 'shipped') use ($buyer, $seller, $p) {
            $o = $this->makeOrder($buyer, $seller, $p, $status)[0];
            $o->forceFill(['waybill_number' => 'MIMWB-GAP-' . strtoupper(\Illuminate\Support\Str::random(8))])->saveQuietly();
            return $o->fresh();
        };
        $scan = fn (User $u, Order $o, CourierFacility $f) => $this->http($u, 'POST', '/api/courier/scan-parcel', ['waybill_number' => $o->waybill_number, 'facility_id' => $f->id]);

        // ── 1. Parcel scanning ──────────────────────────────────────────────
        $o1 = $mk('shipped');
        $this->check('1 unassigned parcel is refused', $scan($hub1, $o1, $f1)['status'], 422, 'was accepted before');
        $this->check('1 no scan row written', ShipmentScan::where('order_id', $o1->id)->count(), 0, '');
        $a1 = $this->assignment($mk('in_transit'), $c1, 'pending');
        $this->check('1 assignment not accepted yet: refused', $scan($hub1, $a1->order()->first(), $f1)['status'], 422, '');
        $o2 = $mk('in_transit');
        $this->assignment($o2, $c1, 'accepted');
        $this->check("1 other company's facility: refused", $scan($hub1, $o2, $f2)['status'], 403, '');
        $this->check('1 other company cannot scan it', $scan($hub2, $o2, $f2)['status'], 422, 'not their parcel');
        $r = $scan($hub1, $o2, $f1);
        $this->check('1 accepted parcel, logistics_staff of the company: scanned in', $r['status'] . '/' . ShipmentScan::where('order_id', $o2->id)->value('scan_type'), '200/received', $r['body']['message'] ?? '');
        $this->check('1 courier company itself can scan too (unchanged)', $scan($c1, $o2, $f1)['status'], 200, '');
        $this->check('1 seller blocked', $scan($seller, $o2, $f1)['status'], 403, '');

        // ── 2. Stuck in_transit orders ──────────────────────────────────────
        $bn = fn (Order $o) => BuyerNotification::where('buyer_id', $buyer->id)->where('title', 'Order shipped')->get()->filter(fn ($n) => ($n->data['order_id'] ?? null) === $o->id)->count();
        $o3 = $mk('in_transit');
        $a3 = $this->assignment($o3, $c1, 'pending');
        $before = $bn($o3);
        $r = $this->http($hub1, 'POST', "/api/courier/shipments/{$a3->id}/reject", ['reason' => 'Out of our service area today.']);
        $this->check('2 courier rejects the shipment', $r['status'] . '/' . ShipmentAssignment::find($a3->id)->assignment_status, '200/rejected', '');
        $this->check('2 order is back to shipped (not stuck)', Order::find($o3->id)->status, 'shipped', '');
        $this->check('2 buyer not notified "shipped" again', $bn($o3), $before, '');
        $lst = $this->http($hub1, 'GET', '/logistics/sort-assign', [], true);
        $this->check('2 it is listed in Sort & Assign again', collect($lst['body']['props']['parcels'] ?? [])->contains('id', $o3->id) ? 'listed' : 'missing', 'listed', '');

        $o4 = $mk('in_transit');
        $a4 = $this->assignment($o4, $c1, 'accepted', 'scheduled');
        $r = $this->http($hub1, 'POST', "/api/courier/pickups/{$a4->id}/cancel", ['reason' => 'Seller closed the shop today.']);
        $this->check('2 pickup cancelled by the courier', $r['status'] . '/' . ShipmentAssignment::find($a4->id)->pickup_status, '200/cancelled', $r['body']['message'] ?? '');
        $this->check('2 cancelled pickup: order back to shipped', Order::find($o4->id)->status, 'shipped', '');

        $o5 = $mk('in_transit');
        $a5 = $this->assignment($o5, $c1, 'accepted', 'picked_up');
        DeliveryJob::create(['order_id' => $o5->id, 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id,
            'status' => DeliveryJob::STATUS_ASSIGNED, 'cod_amount' => 0, 'assigned_at' => now()]);
        $a5->update(['pickup_status' => 'cancelled']);
        $this->check('2 order with a delivery job is NOT reopened', Order::find($o5->id)->status, 'in_transit', '');
        $o6 = $mk('in_transit');
        $this->assignment($o6, $c1, 'accepted');
        $this->check('2 order with an active assignment stays in_transit', json_encode(\App\Services\StuckOrderGuard::reopen($o6->id)) . '/' . Order::find($o6->id)->status, 'false/in_transit', '');
        $o7 = $mk('in_transit'); // old orphan row: no assignment at all
        $lst = $this->http($hub1, 'GET', '/logistics/sort-assign', [], true);
        $this->check('2 old orphan shows in Sort & Assign', collect($lst['body']['props']['parcels'] ?? [])->contains('id', $o7->id) ? 'listed' : 'missing', 'listed', '');
        $r = $this->http($hub1, 'POST', '/api/logistics/assign-to-courier', ['parcel_ids' => [$o7->id], 'courier_id' => $c1->id]);
        $this->check('2 and can be assigned again', $r['status'] . '/' . ($r['body']['assigned_count'] ?? '-'), '200/1', '');
        $r = $this->http($hub1, 'POST', '/api/logistics/assign-to-courier', ['parcel_ids' => [$o7->id], 'courier_id' => $c1->id]);
        $this->check('8 assigning the same parcel twice: one active assignment', ($r['body']['assigned_count'] ?? '-') . '/' . ShipmentAssignment::where('order_id', $o7->id)->active()->count(), '0/1', 'second call skipped');

        // ── 3. Seller stage + dashboard label ───────────────────────────────
        $tsx = (string) file_get_contents(resource_path('js/pages/seller/SellerOrders.tsx'));
        $this->check("3 SellerOrders maps 'in_transit' to the in_transit stage", preg_match("/case 'in_transit':[^}]*return 'in_transit'/s", $tsx) ? 'yes' : 'NO', 'yes', 'default used to be "new"');
        $this->check('3 after Pack the optimistic stage is awaiting_pickup', str_contains($tsx, 'pack: "awaiting_pickup"') ? 'yes' : 'NO', 'yes', 'was in_transit');
        $m = new \ReflectionMethod(SellerDashboardController::class, 'mapOrderStatus');
        $m->setAccessible(true);
        $dash = app(SellerDashboardController::class);
        $this->check('3 dashboard label in_transit / shipped / packed', implode('/', [$m->invoke($dash, 'in_transit'), $m->invoke($dash, 'shipped'), $m->invoke($dash, 'packed')]), 'In Transit/In Transit/To Ship', '');
        $feed = $this->http($seller, 'GET', '/api/seller/orders');
        $this->check("3 seller orders API returns the raw status 'in_transit' for the page", collect($feed['body']['orders'] ?? $feed['body']['data'] ?? [])->contains('status', 'in_transit') ? 'yes' : 'no', 'yes', 'status ' . $feed['status']);

        // ── 4. COD confirmation ─────────────────────────────────────────────
        $o8 = $mk('shipped');
        $j8 = DeliveryJob::create(['order_id' => $o8->id, 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id,
            'status' => DeliveryJob::STATUS_DELIVERED, 'cod_amount' => 100, 'cod_collected' => 100, 'assigned_at' => now(), 'delivered_at' => now()]);
        $rem = CodRemittance::create(['reference' => 'RMT-GAP-1', 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id,
            'amount' => 100, 'parcels_count' => 1, 'status' => 'submitted', 'remitted_at' => now()]);
        $j8->update(['cod_remittance_id' => $rem->id]);
        $rn = fn () => RiderNotification::where('rider_user_id', $rider->id)->where('type', 'cod_confirmed')->count();
        $list = $this->http($hub1, 'GET', '/courier/cod-remittances');
        $this->check('4 staff of the company lists it', collect($list['body']['data'] ?? [])->contains('reference', 'RMT-GAP-1') ? 'listed' : 'missing', 'listed', '');
        $this->check('4 other company does not see it', json_encode(collect($this->http($hub2, 'GET', '/courier/cod-remittances')['body']['data'] ?? [])->pluck('id')->all()), '[]', '');
        $this->check('4 other company cannot confirm', $this->http($hub2, 'POST', "/courier/cod-remittances/{$rem->id}/confirm")['status'], 404, '');
        $this->check('4 seller cannot confirm', $this->http($seller, 'POST', "/courier/cod-remittances/{$rem->id}/confirm")['status'], 403, '');
        $this->check('4 rider cannot confirm', $this->http($rider, 'POST', "/courier/cod-remittances/{$rem->id}/confirm")['status'], 403, '');
        DeliveryJob::whereKey($j8->id)->update(['cod_collected' => 90]);
        $this->check('4 amount that does not match the cash collected is refused', $this->http($hub1, 'POST', "/courier/cod-remittances/{$rem->id}/confirm")['status'], 422, '');
        DeliveryJob::whereKey($j8->id)->update(['cod_collected' => 100]);
        $r = $this->http($hub1, 'POST', "/courier/cod-remittances/{$rem->id}/confirm");
        $rem->refresh();
        $this->check('4 staff confirms', $r['status'] . '/' . $rem->status . '/' . ($rem->confirmed_at ? 'stamped' : 'NULL'), '200/confirmed/stamped', '');
        $this->check('4 actor recorded', str_contains((string) $rem->notes, "user #{$hub1->id}") ? 'yes' : 'NO', 'yes', $rem->notes ?? '');
        $stamp = $rem->confirmed_at->toDateTimeString();
        $this->travel(3);
        $r = $this->http($c1, 'POST', "/courier/cod-remittances/{$rem->id}/confirm");
        $this->travelBack();
        $rem->refresh();
        $this->check('4 second confirm: idempotent, nothing changes', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . ($rem->confirmed_at->toDateTimeString() === $stamp ? 'same' : 'CHANGED') . '/' . substr_count((string) $rem->notes, 'Confirmed by'), '200/true/same/1', '');
        $this->check('4 rider notified exactly once', $rn(), 1, '');
        $this->check('4 page opens', $this->http($c1, 'GET', '/courier/cod-remittance', [], true)['status'], 200, '');

        // ── 5. Hub receives a returned parcel ───────────────────────────────
        $o9 = $mk('shipped');
        DeliveryJob::create(['order_id' => $o9->id, 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id,
            'status' => DeliveryJob::STATUS_RETURN_TO_SENDER, 'attempt_count' => 3, 'cod_amount' => 0, 'assigned_at' => now(), 'returned_at' => now()]);
        $this->assignment($o9, $c1, 'accepted', 'picked_up');
        $this->check('5 other company cannot receive it', $scan($hub2, $o9, $f2)['status'], 422, 'not their parcel');
        $r = $scan($hub1, $o9, $f1);
        $this->check('5 hub scans the returned parcel', $r['status'] . '/' . ShipmentScan::where('order_id', $o9->id)->value('scan_type') . '/' . Order::find($o9->id)->tracking_status, '200/return_received/returned_to_hub', $r['body']['message'] ?? '');
        $this->check('5 scanning it again is refused (once)', $scan($hub1, $o9, $f1)['status'], 422, '');
        $this->check('5 only one receiving scan', ShipmentScan::where('order_id', $o9->id)->where('scan_type', 'return_received')->count(), 1, '');

        // ── 6. History action values ────────────────────────────────────────
        $ha = $this->assignment($mk('in_transit'), $c1, 'accepted');
        $ok = [];
        foreach (['scheduled', 're-scheduled', 'picked_up', 'cancelled', 'failed_attempt', 'something_new', 'assigned', 're-assigned'] as $word) {
            try {
                $ha->addHistory($word, $hub1->id, 'gap test');
                $ok[] = 'ok';
            } catch (\Throwable $e) {
                $ok[] = 'ERR';
            }
        }
        $this->check('6 every history word is stored without a database error', implode(',', array_unique($ok)), 'ok', '');
        $this->check('6 stored values are all valid enum values', ShipmentAssignmentHistory::where('assignment_id', $ha->id)->whereNotIn('action', ['assigned', 'accepted', 'rejected', 're-assigned'])->count(), 0, '');
        $this->check('6 real wording kept in the notes', ShipmentAssignmentHistory::where('assignment_id', $ha->id)->where('notes', 'like', 'failed attempt%')->count(), 1, '');
        $ha2 = $this->assignment($mk('in_transit'), $c1, 'accepted', 'pending_pickup');
        $this->check('6 web schedule', $this->http($hub1, 'POST', "/api/courier/pickups/{$ha2->id}/schedule", ['scheduled_date' => now()->toDateString(), 'scheduled_time_window' => '09:00-12:00'])['status'], 200, '');
        $this->check('6 web reschedule', $this->http($hub1, 'POST', "/api/courier/pickups/{$ha2->id}/reschedule", ['scheduled_date' => now()->addDay()->toDateString(), 'scheduled_time_window' => '13:00-16:00', 'reason' => 'Seller asked for a later time.'])['status'], 200, '');
        $this->check('6 web record failed attempt', $this->http($hub1, 'POST', "/api/courier/pickups/{$ha2->id}/record-failed", ['reason' => 'Seller was not around.'])['status'], 200, '');

        // ── 7. Legacy seller order API ──────────────────────────────────────
        $seller2 = $this->makeUser('seller.2', ['account_type' => 'seller', 'role' => 'seller']);
        $so = $mk('pending');
        $call = fn (User $u, Order $o, array $d) => $this->http($u, 'PATCH', "/api/seller/orders/{$o->id}/status", $d);
        $this->check('7 legacy "pickup" action on a pending order refused (must be packed)', $call($seller, $so, ['action' => 'pickup'])['status'], 422, 'cannot skip packing');
        $this->check('7 legacy status=shipped on a pending order refused', $call($seller, $so, ['status' => 'shipped'])['status'], 422, '');
        $this->check('7 legacy status=completed refused', $call($seller, $so, ['status' => 'completed'])['status'], 422, '');
        $this->check('7 order unchanged by refused calls', Order::find($so->id)->status, 'pending', '');
        $this->check('7 another seller cannot touch it', $call($seller2, $so, ['action' => 'accept'])['status'], 404, '');
        $this->check('7 accept (pending -> paid)', $call($seller, $so, ['action' => 'accept'])['status'] . '/' . Order::find($so->id)->status, '200/paid', '');
        $this->check('7 accept twice refused', $call($seller, $so, ['action' => 'accept'])['status'], 422, '');
        $this->check('7 pack (paid -> packed, waybill)', $call($seller, $so, ['action' => 'pack'])['status'] . '/' . Order::find($so->id)->status . '/' . (Order::find($so->id)->waybill_number ? 'waybill' : '-'), '200/packed/waybill', '');
        $this->check('7 pack twice refused', $call($seller, $so, ['action' => 'pack'])['status'], 422, '');
        $this->check('7 pickup on a PACKED order still works (old shortcut, forward only)', $call($seller, $so, ['action' => 'pickup'])['status'] . '/' . Order::find($so->id)->status, '200/shipped', '');
        $this->check('7 and cannot go back: accept after shipped refused', $call($seller, $so, ['action' => 'accept'])['status'], 422, '');
        $so2 = $mk('in_transit');
        $this->check('7 pack on an order already with the courier refused (no going back)', $call($seller, $so2, ['action' => 'pack'])['status'] . '/' . Order::find($so2->id)->status, '422/in_transit', '');
        $this->check('7 legacy status=paid on a shipped order refused', $call($seller, $mk('shipped'), ['status' => 'paid'])['status'], 422, '');
        $so3 = $mk('pending');
        $this->check('7 legacy status=packed from pending still works', $call($seller, $so3, ['status' => 'packed'])['status'] . '/' . (Order::find($so3->id)->waybill_number ? 'waybill' : '-'), '200/waybill', '');
        $this->check('7 waybill_printed action still works', $call($seller, $so, ['action' => 'waybill_printed'])['status'], 200, '');

        // ── 8. Duplicates: earnings, pickup confirm, indexes ────────────────
        $o10 = $mk('in_transit');
        $a10 = $this->assignment($o10, $c1, 'accepted', 'scheduled');
        $a10->update(['assigned_personnel_id' => $pers->id]);
        $rp = app(RiderPickupController::class);
        for ($i = 0; $i < 3; $i++) {
            $this->hit(fn () => $rp->scan($this->req($rider, ['waybill_number' => $o10->waybill_number]), $a10->id));
        }
        $this->check('8 three scans: one pickup earning', RiderEarning::where('shipment_assignment_id', $a10->id)->count(), 1, '');
        $hist = ShipmentAssignmentHistory::where('assignment_id', $a10->id)->count();
        $r = $this->http($hub1, 'POST', "/api/courier/pickups/{$a10->id}/confirm", ['scanned_waybill' => $o10->waybill_number]);
        $this->check('8 staff confirm after the rider scan: idempotent, no new history', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . (ShipmentAssignmentHistory::where('assignment_id', $a10->id)->count() - $hist), '200/true/0', '');
        $this->check('8 picked_up_by stays the rider', ShipmentAssignment::find($a10->id)->picked_up_by, $rider->id, '');
        $o11 = $mk('in_transit');
        $a11 = $this->assignment($o11, $c1, 'accepted', 'scheduled');
        $this->http($hub1, 'POST', "/api/courier/pickups/{$a11->id}/confirm", ['scanned_waybill' => $o11->waybill_number]);
        $r = $this->http($hub1, 'POST', "/api/courier/pickups/{$a11->id}/confirm", ['scanned_waybill' => $o11->waybill_number]);
        $this->check('8 confirm twice: one history row, picked_up_by = the staff member', $r['status'] . '/' . ShipmentAssignmentHistory::where('assignment_id', $a11->id)->count() . '/' . ShipmentAssignment::find($a11->id)->picked_up_by, "200/1/{$hub1->id}", '');
        $idx = fn (string $t, string $i) => collect(DB::select("show index from {$t}"))->contains(fn ($x) => $x->Key_name === $i && (int) $x->Non_unique === 0) ? 'unique' : 'MISSING';
        $this->check('8 DB: one earning per delivery / pickup', $idx('rider_earnings', 'rider_earnings_delivery_job_id_unique') . '/' . $idx('rider_earnings', 'rider_earnings_shipment_assignment_id_unique'), 'unique/unique', '');
        $this->check('8 DB: one delivery job per order, one active assignment per order', $idx('delivery_jobs', 'delivery_jobs_order_id_unique') . '/' . $idx('shipment_assignments', 'idx_active_assignment_per_order'), 'unique/unique', '');
        $o12 = $mk('in_transit');
        $a12 = $this->assignment($o12, $c1, 'accepted', 'picked_up');
        $first = $this->http($hub1, 'POST', '/courier/delivery-management/assign', ['order_id' => $o12->id, 'personnel_id' => $pers->id]);
        $second = $this->http($hub1, 'POST', '/courier/delivery-management/assign', ['order_id' => $o12->id, 'personnel_id' => $pers->id]);
        $this->check('8 delivery assign twice: exactly one job', DeliveryJob::where('order_id', $o12->id)->count(), 1, "statuses {$first['status']}/{$second['status']}");
    }

    private function travel(int $s): void
    {
        \Illuminate\Support\Carbon::setTestNow(now()->addSeconds($s));
    }

    private function travelBack(): void
    {
        \Illuminate\Support\Carbon::setTestNow();
    }
}
