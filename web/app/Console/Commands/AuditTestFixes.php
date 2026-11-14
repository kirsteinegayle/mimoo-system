<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\CodRemittance;
use App\Models\CourierFacility;
use App\Models\CourierNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Models\SellerNotification;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Rollback-only tests for the fixes of the final audit:
 *  F1 auto-complete never completes undelivered / returned / in-flight parcels
 *  F2 debug routes are dev-only and logistics-only
 *  F3 courier parcel lookup only shows the company's own parcels
 *  F4 facility parcel lists work for the company's logistics_staff
 *  F5 seller is notified of a new return request (once)
 *  F6 courier company is notified when a rider remits COD (once)
 *
 *   php artisan audit:test-fixes
 */
class AuditTestFixes extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'audit:test-fixes';

    protected $description = 'Rollback-only: auto-complete guard, debug routes, parcel lookup scope, facility lists for staff, return + COD notifications';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'delivery_jobs', 'courier_personnel', 'courier_facilities',
            'return_requests', 'seller_notifications', 'courier_notifications', 'cod_remittances', 'shipment_scans',
        ]);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified'];
        $buyer   = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller  = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);
        $seller2 = $this->makeUser('seller.2', ['account_type' => 'seller', 'role' => 'seller']);
        $c1      = $this->makeUser('courier.1', $co);
        $c2      = $this->makeUser('courier.2', $co);
        $hub1    = $this->makeUser('hub.1', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c1->id]);
        $hub2    = $this->makeUser('hub.2', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c2->id]);
        $rider   = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
        $pers    = CourierPersonnel::create(['courier_id' => $c1->id, 'user_id' => $rider->id, 'name' => 'Audit Rider', 'role' => 'rider', 'status' => 'active']);
        $mk = function (string $status = 'shipped') use ($buyer, $seller, $p) {
            $o = $this->makeOrder($buyer, $seller, $p, $status)[0];
            $o->forceFill(['waybill_number' => 'MIMWB-AUD-' . strtoupper(\Illuminate\Support\Str::random(8))])->saveQuietly();
            DB::table('orders')->where('id', $o->id)->update(['updated_at' => now()->subDays(10)]);
            return $o->fresh();
        };
        $job = fn (Order $o, string $status) => DeliveryJob::create(['order_id' => $o->id, 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id,
            'assigned_by' => $c1->id, 'status' => $status, 'cod_amount' => 0, 'assigned_at' => now()]);
        $asg = fn (Order $o, string $a = 'accepted', string $pk = 'picked_up') => ShipmentAssignment::create(['order_id' => $o->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id,
            'assigned_at' => now(), 'acceptance_deadline' => now()->addDay(), 'assignment_status' => $a, 'pickup_status' => $pk]);

        // ── F1 auto-complete ────────────────────────────────────────────────
        $legacy = $mk();                                   // old flow: no job, no assignment
        $deliv  = $mk(); $asg($deliv); $job($deliv, DeliveryJob::STATUS_DELIVERED);
        $ret    = $mk(); $asg($ret);   $job($ret, DeliveryJob::STATUS_RETURN_TO_SENDER);
        $fail   = $mk(); $asg($fail);  $job($fail, DeliveryJob::STATUS_FAILED);
        $out    = $mk(); $asg($out);   $job($out, DeliveryJob::STATUS_OUT_FOR_DELIVERY);
        $held   = $mk(); $asg($held, 'accepted', 'scheduled'); // still with the courier, no job yet
        $ids    = [$legacy->id, $deliv->id, $ret->id, $fail->id, $out->id, $held->id];
        $elig   = \App\Console\Commands\AutoCompleteOrders::deliverableScope(Order::whereIn('id', $ids))->pluck('id')->sort()->values()->all();
        $this->check('F1 eligible: old-flow order and delivered order only', json_encode($elig), json_encode(collect([$legacy->id, $deliv->id])->sort()->values()->all()), '');
        Artisan::call('orders:auto-complete', ['--days' => 7]);
        $st = fn (Order $o) => Order::find($o->id)->status;
        $this->check('F1 command: returned-to-sender parcel stays shipped', $st($ret), 'shipped', 'was completed');
        $this->check('F1 command: failed delivery stays shipped', $st($fail), 'shipped', '');
        $this->check('F1 command: out for delivery stays shipped', $st($out), 'shipped', '');
        $this->check('F1 command: parcel still with the courier stays shipped', $st($held), 'shipped', '');
        $this->check('F1 command: delivered parcel completes', $st($deliv), 'completed', 'unchanged behaviour');
        $this->check('F1 command: old-flow order completes', $st($legacy), 'completed', 'unchanged behaviour');
        $this->check('F1 completed_at stamped on the ones that completed', (Order::find($deliv->id)->completed_at ? 'yes' : 'NO') . '/' . (Order::find($ret->id)->completed_at ? 'STAMPED' : 'none'), 'yes/none', '');

        // ── F2 debug routes ─────────────────────────────────────────────────
        config(['app.debug' => false]);
        $this->check('F2 /test-seller-dashboard without debug: 404', $this->http(null, 'GET', '/test-seller-dashboard')['status'], 404, 'was open to the public');
        $this->check('F2 /api/debug/waybills as logistics_staff, no debug: 404', $this->http($hub1, 'GET', '/api/debug/waybills')['status'], 404, '');
        config(['app.debug' => true]);
        $this->check('F2 /api/debug/waybills as seller (debug on): refused', $this->http($seller, 'GET', '/api/debug/waybills')['status'], 404, 'was open to every approved user');
        $this->check('F2 /api/debug/waybills as buyer: refused', $this->http($buyer, 'GET', '/api/debug/waybills')['status'], 404, '');
        $this->check('F2 /api/debug/waybills as logistics_staff (debug on)', $this->http($hub1, 'GET', '/api/debug/waybills')['status'], 200, 'dev only');

        // ── F3 parcel lookup scope ──────────────────────────────────────────
        $o = $mk('in_transit');
        $asg($o, 'accepted', 'scheduled');
        $unassigned = $mk('shipped');
        $look = fn (User $u, Order $x) => $this->http($u, 'GET', '/api/courier/parcel/' . $x->waybill_number)['status'];
        $this->check("F3 lookup: the company's own parcel", $look($c1, $o), 200, '');
        $this->check('F3 lookup: logistics_staff of the company', $look($hub1, $o), 200, '');
        $this->check("F3 lookup: another company can't see the buyer's details", $look($c2, $o), 404, 'was 200 with name / phone / address');
        $this->check('F3 lookup: other company staff', $look($hub2, $o), 404, '');
        $this->check('F3 lookup: unassigned parcel', $look($c1, $unassigned), 404, '');
        $this->check('F3 lookup: seller blocked', $look($seller, $o), 403, '');

        // ── F4 facility parcel lists for staff ──────────────────────────────
        $f1 = CourierFacility::create(['courier_id' => $c1->id, 'facility_name' => 'Audit F1', 'facility_code' => 'AUD-F1-' . $c1->id, 'facility_type' => 'branch', 'status' => 'Active',
            'region' => 'R', 'city' => 'C', 'address' => 'A', 'manager_name' => 'M', 'contact_number' => '0', 'coverage_cities' => '[]']);
        $this->check('F4 received-parcels: courier', $this->http($c1, 'GET', "/api/courier/facility/{$f1->id}/received-parcels")['status'], 200, '');
        $this->check('F4 received-parcels: logistics_staff of the company', $this->http($hub1, 'GET', "/api/courier/facility/{$f1->id}/received-parcels")['status'], 200, 'was 403');
        $this->check('F4 archived-parcels: logistics_staff of the company', $this->http($hub1, 'GET', "/api/courier/facility/{$f1->id}/archived-parcels")['status'], 200, '');
        $this->check("F4 other company can't read the facility", $this->http($hub2, 'GET', "/api/courier/facility/{$f1->id}/received-parcels")['status'], 403, '');
        $this->check('F4 parcel-scanning page lists the facility for staff', collect($this->http($hub1, 'GET', '/courier/parcel-scanning', [], true)['body']['props']['facilities'] ?? [])->contains('id', $f1->id) ? 'listed' : 'missing', 'listed', 'was empty');

        // ── F5 seller notified of a new return request ──────────────────────
        [$ro] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        $rn = fn (User $s, ReturnRequest $r) => SellerNotification::where('seller_id', $s->id)->where('type', 'return_requested')->get()
            ->filter(fn ($n) => ($n->data['return_id'] ?? null) === $r->id)->count();
        $rr = ReturnRequest::create(['order_id' => $ro->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged', 'description' => 'Audit test: broken.', 'images' => [], 'status' => 'pending']);
        $this->check('F5 seller notified once of the new return', $rn($seller, $rr), 1, '');
        $this->check('F5 link goes to /seller/returns', SellerNotification::where('seller_id', $seller->id)->where('type', 'return_requested')->value('url'), '/seller/returns', '');
        $rr->update(['description' => 'Audit test: still broken.']);
        $rr->update(['status' => 'approved']);
        $this->check('F5 later changes do not notify again', $rn($seller, $rr), 1, '');
        $this->check('F5 other seller not notified', $rn($seller2, $rr), 0, '');
        [$mo] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        OrderItem::create(['order_id' => $mo->id, 'product_id' => $p->id, 'seller_id' => $seller2->id, 'product_name' => 'x', 'quantity' => 1, 'unit_price' => 1]);
        $mr = ReturnRequest::create(['order_id' => $mo->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged', 'description' => 'Audit test: broken.', 'images' => [], 'status' => 'pending']);
        $this->check('F5 multi-seller order: both sellers notified once', $rn($seller, $mr) . '/' . $rn($seller2, $mr), '1/1', '');
        $this->check('F5 the bell feed shows it', collect($this->http($seller, 'GET', '/seller/notifications/feed')['body']['data'] ?? [])->contains('type', 'return_requested') ? 'yes' : 'NO', 'yes', '');

        // ── F6 courier notified of a COD remittance ─────────────────────────
        $cn = fn () => CourierNotification::where('courier_id', $c1->id)->where('type', 'cod_remitted')->count();
        $rem = CodRemittance::create(['reference' => 'RMT-AUD-1', 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id,
            'amount' => 250, 'parcels_count' => 2, 'status' => 'submitted', 'remitted_at' => now()]);
        $this->check('F6 courier notified once when a rider remits COD', $cn(), 1, '');
        $rem->update(['notes' => 'edited']);
        $this->check('F6 editing the remittance does not notify again', $cn(), 1, '');
        $this->check('F6 other company not notified', CourierNotification::where('courier_id', $c2->id)->count(), 0, '');
        $feed = collect($this->http($hub1, 'GET', '/courier/notifications/feed')['body']['data'] ?? []);
        $this->check('F6 logistics_staff of the company sees it in the bell', $feed->contains('type', 'cod_remitted') ? 'yes' : 'NO', 'yes', '');
        $app = collect($this->api($c1, '/api/courier-app/notifications')['data'] ?? [])->firstWhere('type', 'cod_remitted');
        $this->check('F6 courier app list includes it', $app ? $app['category'] : 'missing', 'system', 'category system');

        // ── F7 courier dashboard shows real numbers ─────────────────────────
        $dash = $this->http($c1, 'GET', '/courier/dashboard', [], true);
        $s = $dash['body']['props']['stats'] ?? [];
        $held = ShipmentAssignment::where('courier_id', $c1->id);
        $this->check('F7 pending_pickups = accepted + not picked up (not the fixed 8)', $s['pending_pickups'] ?? '-', (clone $held)->where('assignment_status', 'accepted')->whereIn('pickup_status', ['pending_pickup', 'scheduled'])->count(), '');
        $this->check('F7 exceptions = failed pickups + failed / returned jobs (not the fixed 3)', $s['exceptions'] ?? '-', (clone $held)->where('assignment_status', 'accepted')->where('pickup_status', 'failed')->count()
            + DeliveryJob::where('courier_id', $c1->id)->whereIn('status', ['failed', 'return_to_sender'])->count(), '');
        $this->check('F7 no fixed demo numbers (15 / 42 / 23)', ($s['incoming_shipments'] ?? 0) === 15 && ($s['in_transit'] ?? 0) === 42 && ($s['deliveries_today'] ?? 0) === 23 ? 'FIXED' : 'real', 'real', '');
        $this->check('F7 other company starts at zero', json_encode(array_sum($this->http($c2, 'GET', '/courier/dashboard', [], true)['body']['props']['stats'] ?? ['x' => 1])), '0', '');
        $this->check('F7 staff of the company sees the company numbers', $this->http($hub1, 'GET', '/courier/dashboard', [], true)['body']['props']['stats']['pending_pickups'] ?? '-', $s['pending_pickups'] ?? 'x', '');

        // ── F8 seller rating is real, not 4.5 ───────────────────────────────
        $none = $this->http($buyer, 'GET', "/api/seller/{$seller2->id}/store")['body']['stats'] ?? [];
        $this->check('F8 seller without reviews: rating 0, 0 reviews', ($none['rating'] ?? '-') . '/' . ($none['total_reviews'] ?? '-'), '0/0', 'was 4.5 for everyone');
        [$ro2, $ri2] = $this->makeOrder($buyer, $seller2, $p, 'completed');
        \App\Models\Review::create(['order_item_id' => $ri2->id, 'product_id' => $p->id, 'buyer_id' => $buyer->id, 'rating' => 5, 'comment' => 'Audit review']);
        [$ro3, $ri3] = $this->makeOrder($buyer, $seller2, $p, 'completed');
        \App\Models\Review::create(['order_item_id' => $ri3->id, 'product_id' => $p->id, 'buyer_id' => $buyer->id, 'rating' => 2, 'comment' => 'Audit review 2']);
        $with = $this->http($buyer, 'GET', "/api/seller/{$seller2->id}/store")['body']['stats'] ?? [];
        $this->check('F8 two reviews (5 and 2): rating 3.5 from 2 reviews', ($with['rating'] ?? '-') . '/' . ($with['total_reviews'] ?? '-'), '3.5/2', '');
        $this->check('F8 only that seller reviews counted', ($this->http($buyer, 'GET', "/api/seller/{$seller->id}/store")['body']['stats']['total_reviews'] ?? '-'), 0, '');
        $tsx = (string) file_get_contents(resource_path('js/pages/ViewSeller.tsx')) . (string) file_get_contents(resource_path('js/pages/ProductDetail.tsx'));
        $this->check('F8 no fake "Top Rated Merchant" badge, fake seller-card stars hidden', (str_contains($tsx, 'Top Rated Merchant') ? 'BADGE' : 'ok') . '/' . (str_contains($tsx, "totalReviews > 0 ? 'flex' : 'hidden'") ? 'ok' : 'SHOWN'), 'ok/ok', '');
    }

    private function api(User $u, string $uri): array
    {
        $token = $u->createToken('audit')->plainTextToken;
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $res = app()->handle(\Illuminate\Http\Request::create($uri, 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer ' . $token]));

        return json_decode((string) $res->getContent(), true) ?? [];
    }
}
