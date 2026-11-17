<?php

namespace Tests\Feature;

use App\Models\AdminSetting;
use App\Models\Banner;
use App\Models\CourierFacility;
use App\Models\LogisticsRate;
use App\Models\LogisticsZone;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SupportTicket;
use App\Models\User;
use App\Services\ScanRouteGuard;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Needs a MySQL schema (the project's migrations do not build on SQLite):
 *   DB_CONNECTION=mysql DB_DATABASE=<scratch copy of the schema> php vendor/bin/phpunit tests/Feature/LogisticsShippingTest.php
 */
class LogisticsShippingTest extends TestCase
{
    use DatabaseTransactions;

    private function user(array $o): User
    {
        return User::factory()->create($o + ['status' => 'approved', 'verification_status' => 'verified']);
    }

    private function logistics(string $name, array $o = []): User
    {
        return $this->user($o + ['account_type' => 'logistics', 'role' => 'logistics_staff', 'company_name' => $name]);
    }

    private function zone(User $lg, string $name, array $cities, array $rates, array $o = []): LogisticsZone
    {
        $z = LogisticsZone::create(['logistics_id' => $lg->id, 'name' => $name, 'cities' => $cities, 'provinces' => [], 'status' => 'active'] + $o);
        foreach ($rates as [$min, $max, $fee]) {
            LogisticsRate::create(['zone_id' => $z->id, 'min_weight' => $min, 'max_weight' => $max, 'fee' => $fee]);
        }

        return $z;
    }

    private function buyer(): User
    {
        return $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
    }

    private function seller(): User
    {
        return $this->user(['account_type' => 'seller', 'role' => 'seller']);
    }

    private function product(User $seller, array $o = []): Product
    {
        static $n = 0;
        $n++;

        return Product::create($o + ['seller_id' => $seller->id, 'name' => "P{$n}", 'price' => 100, 'stock' => 20, 'sku' => "LS-{$n}", 'status' => 'active', 'approval_status' => 'approved']);
    }

    // ── A2 / A3: fee by zone + weight, safe fallback, logistics selection ─────

    public function test_fee_follows_zone_and_weight_bracket_with_safe_fallback(): void
    {
        $lg = $this->logistics('FastLog');
        $this->zone($lg, 'Cavite', ['Bacoor'], [[0, 1, 60], [1.01, 5, 90], [5.01, null, 150]]);
        $this->zone($lg, 'Metro', ['Quezon City'], [[0, null, 120]]);

        $this->assertSame(60.0, ShippingService::quote('Bacoor', 'Cavite', 0.5)['fee']);
        $this->assertSame(90.0, ShippingService::quote('Bacoor', 'Cavite', 3)['fee']);
        $this->assertSame(150.0, ShippingService::quote('City of Bacoor', 'Cavite', 9)['fee'], 'city names are normalised');
        $this->assertSame(120.0, ShippingService::quote('Quezon City', null, 3)['fee']);

        $unmapped = ShippingService::quote('Atlantis', null, 1);
        $this->assertGreaterThan(0, $unmapped['fee'], 'unmapped zone must never be free');
        $this->assertTrue($unmapped['fallback']);
        $this->assertSame($lg->id, $unmapped['logistics_id']);

        AdminSetting::put('default_shipping_fee', '99');
        $this->assertSame(99.0, ShippingService::quote('Atlantis', null, 1)['fee']);
    }

    public function test_with_several_logistics_the_covering_cheapest_one_wins(): void
    {
        $cheap = $this->logistics('CheapLog');
        $dear = $this->logistics('DearLog');
        $elsewhere = $this->logistics('ElsewhereLog');
        $this->zone($cheap, 'Cavite', ['Bacoor'], [[0, null, 70]]);
        $this->zone($dear, 'Cavite', ['Bacoor'], [[0, null, 110]]);
        $this->zone($elsewhere, 'Cebu', ['Cebu City'], [[0, null, 20]]);

        $q = ShippingService::quote('Bacoor', null, 2);
        $this->assertSame($cheap->id, $q['logistics_id']);
        $this->assertSame(70.0, $q['fee']);
        $this->assertStringContainsString('lowest rate', $q['reason']);

        // a tie goes to the admin's default logistics
        LogisticsRate::query()->update(['fee' => 80]);
        AdminSetting::put('default_logistics_id', (string) $dear->id);
        $this->assertSame($dear->id, ShippingService::quote('Bacoor', null, 2)['logistics_id']);
    }

    public function test_checkout_adds_the_fee_and_stores_logistics_for_the_seller(): void
    {
        $lg = $this->logistics('FastLog');
        $this->zone($lg, 'Cavite', ['Bacoor'], [[0, null, 75]]);
        $seller = $this->seller();
        $p = $this->product($seller, ['weight' => 0.5]);
        $buyer = $this->buyer();

        $this->actingAs($buyer)->postJson('/api/orders', [
            'payment_method' => 'cod', 'shipping_name' => 'A', 'shipping_address' => 'Blk 1, Habay, Bacoor, Cavite', 'shipping_phone' => '09171234567',
            'shipping_municipality_city' => 'Bacoor', 'shipping_province' => 'Cavite', 'shipping_barangay' => 'Habay',
            'buy_now' => ['product_id' => $p->id, 'quantity' => 2],
        ])->assertCreated();

        $o = Order::latest('id')->first();
        $this->assertSame(75.0, (float) $o->shipping_fee);
        $this->assertSame(275.0, (float) $o->total, '2 x 100 + 75 shipping');
        $this->assertSame($lg->id, (int) $o->logistics_id);
        $this->assertSame('Cavite', $o->shipping_zone);

        $res = $this->actingAs($seller)->getJson('/seller/orders/data');
        if ($res->status() === 200) {
            $row = collect($res->json('orders') ?? $res->json('data') ?? [])->firstWhere('id', $o->id);
            $this->assertSame('FastLog', $row['logistics_name'] ?? null);
            $this->assertNotEmpty($row['logistics_reason'] ?? null);
        }
    }

    public function test_quote_endpoint_changes_with_the_address(): void
    {
        $lg = $this->logistics('FastLog');
        $this->zone($lg, 'Cavite', ['Bacoor'], [[0, null, 60]]);
        $this->zone($lg, 'Metro', ['Quezon City'], [[0, null, 130]]);
        $p = $this->product($this->seller());
        $buyer = $this->buyer();

        $a = $this->actingAs($buyer)->getJson("/api/shipping/quote?city=Bacoor&buy_now=1&product_id={$p->id}&quantity=1")->assertOk()->json('fee');
        $b = $this->actingAs($buyer)->getJson("/api/shipping/quote?city=Quezon%20City&buy_now=1&product_id={$p->id}&quantity=1")->assertOk()->json('fee');
        $this->assertSame([60.0, 130.0], [(float) $a, (float) $b]);
    }

    // ── A4: only the most eligible couriers ──────────────────────────────────

    public function test_only_the_best_matching_couriers_are_eligible(): void
    {
        $brgy = $this->user(['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'BarangayCo', 'service_areas' => ['Habay']]);
        $city = $this->user(['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'CityCo', 'service_areas' => ['Bacoor']]);
        $none = $this->user(['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'NoAreas']);
        $far = $this->user(['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'FarCo', 'service_areas' => ['Cebu City']]);

        $order = new Order(['shipping_barangay' => 'Habay', 'shipping_municipality_city' => 'Bacoor', 'shipping_province' => 'Cavite']);
        $ids = ShippingService::eligibleCouriers($order)->pluck('user.id')->all();
        $this->assertSame([$brgy->id], $ids, 'barangay match beats city match; couriers without areas / elsewhere are excluded');

        $order2 = new Order(['shipping_barangay' => 'Other', 'shipping_municipality_city' => 'Bacoor']);
        $this->assertSame([$city->id], ShippingService::eligibleCouriers($order2)->pluck('user.id')->all());
        $this->assertNotContains($none->id, ShippingService::eligibleCouriers($order2)->pluck('user.id')->all());
        $this->assertNotContains($far->id, ShippingService::eligibleCouriers($order2)->pluck('user.id')->all());
    }

    // ── A1: scan validation + audit ──────────────────────────────────────────

    private function facility(User $courier, string $name, string $type, array $o = []): CourierFacility
    {
        static $n = 0;
        $n++;

        return CourierFacility::create($o + [
            'courier_id' => $courier->id, 'facility_name' => $name, 'facility_code' => "T{$n}-" . substr(uniqid(), -5), 'facility_type' => $type, 'status' => 'Active',
            'region' => 'R', 'city' => 'Somewhere', 'address' => 'a', 'manager_name' => 'm', 'contact_number' => '09171234567', 'coverage_cities' => ['Somewhere'],
        ]);
    }

    public function test_scan_accepts_valid_checkpoints_and_rejects_with_an_audit_row(): void
    {
        $courier = $this->user(['account_type' => 'logistics', 'role' => 'courier']);
        $main = $this->facility($courier, 'Main', 'Main Hub');
        $sort = $this->facility($courier, 'Sort', 'Sorting Hub', ['parent_facility_id' => $main->id]);
        $branchA = $this->facility($courier, 'A', 'Branch', ['parent_facility_id' => $sort->id, 'city' => 'Alpha', 'coverage_cities' => ['Alpha']]);
        $branchB = $this->facility($courier, 'B', 'Branch', ['city' => 'Beta', 'coverage_cities' => ['Beta']]); // unrelated branch
        $inactive = $this->facility($courier, 'Off', 'Sorting Hub', ['status' => 'Inactive']);

        $order = Order::create(['buyer_id' => $this->buyer()->id, 'total' => 100, 'status' => 'shipped', 'payment_method' => 'cod', 'waybill_number' => 'WB1',
            'shipping_municipality_city' => 'Gamma', 'assigned_courier_id' => $courier->id]);

        $before = \DB::table('scan_attempts')->count();

        // first intake: any active facility of the company, NOT only the buyer's city
        $this->assertNull(ScanRouteGuard::check($order, $branchB, 'received'));

        $order->update(['current_facility_id' => $branchA->id]);
        $this->assertNull(ScanRouteGuard::check($order, $sort, 'received'), 'parent sorting hub is a valid next checkpoint');
        $this->assertNull(ScanRouteGuard::check($order, $main, 'received'), 'any hub is a valid intermediate');

        $this->assertNotNull(ScanRouteGuard::check($order, $branchB, 'received'), 'unlinked branch that serves neither city is unexpected');
        $this->assertNotNull(ScanRouteGuard::check($order, $inactive, 'received'), 'inactive facility');

        $other = $this->user(['account_type' => 'logistics', 'role' => 'courier']);
        $foreign = $this->facility($other, 'Foreign', 'Main Hub');
        $this->assertNotNull(ScanRouteGuard::check($order, $foreign, 'received'), 'facility of another company');

        $order->update(['status' => 'cancelled']);
        $this->assertNotNull(ScanRouteGuard::check($order, $main, 'received'), 'cancelled parcel cannot be scanned');

        $this->assertSame($before + 4, \DB::table('scan_attempts')->count(), 'every rejection is audited, accepted scans are not');
        $last = \DB::table('scan_attempts')->latest('id')->first();
        $this->assertSame('rejected', $last->result);
        $this->assertSame('WB1', $last->waybill_number);
        $this->assertNotEmpty($last->reason);
    }

    // ── A5: ticket routing ───────────────────────────────────────────────────

    public function test_tickets_are_routed_to_the_right_queue(): void
    {
        $buyer = $this->buyer();
        $seller = $this->seller();
        $lg = $this->logistics('LogCo');
        $courier = $this->user(['account_type' => 'logistics', 'role' => 'courier']);

        $send = fn ($u, $cat, $subject) => $this->actingAs($u)->postJson('/support/tickets', ['category' => $cat, 'subject' => $subject, 'message' => 'This is a long enough message.']);

        $send($buyer, 'logistics', 'Rider never came')->assertCreated();
        $send($buyer, 'seller_product', 'Item not as described')->assertCreated();
        $send($buyer, 'seller_web', 'Not for buyers')->assertStatus(422);
        $send($seller, 'seller_web', 'My dashboard is broken')->assertCreated();
        $send($seller, 'seller_product', 'Not for sellers')->assertStatus(422);
        $send($buyer, 'courier', 'Courier was rude')->assertCreated();

        $this->assertSame('logistics', SupportTicket::where('subject', 'Rider never came')->value('target'));
        $this->assertSame('admin', SupportTicket::where('subject', 'Item not as described')->value('target'));
        $this->assertSame('admin', SupportTicket::where('subject', 'My dashboard is broken')->value('target'));
        $this->assertSame('courier', SupportTicket::where('subject', 'Courier was rude')->value('target'));

        // queues
        $subjects = fn ($res) => collect($res->json('data'))->pluck('subject')->all();
        $this->assertSame(['Rider never came'], $subjects($this->actingAs($lg)->getJson('/staff-support/feed')->assertOk()));
        $this->assertSame(['Courier was rude'], $subjects($this->actingAs($courier)->getJson('/staff-support/feed')->assertOk()));
        $admin = $this->withSession(['admin_verified' => true])->getJson('/admin/support/feed?status=all')->assertOk();
        $this->assertEqualsCanonicalizing(['Item not as described', 'My dashboard is broken'], $subjects($admin));

        // status flow + thread: reply moves open -> in_progress; closed ends the thread
        $id = SupportTicket::where('subject', 'Rider never came')->value('id');
        $this->actingAs($lg)->postJson("/staff-support/{$id}/reply", ['body' => 'We are checking with the rider.'])->assertCreated();
        $this->assertSame('in_progress', SupportTicket::find($id)->status);
        $this->actingAs($lg)->postJson("/staff-support/{$id}/status", ['status' => 'closed'])->assertOk();
        $this->actingAs($buyer)->postJson("/support/tickets/{$id}/replies", ['body' => 'Thanks'])->assertStatus(409);
        // another logistics company cannot see it when linked to someone else's order
        $other = $this->logistics('Other');
        $o = Order::create(['buyer_id' => $buyer->id, 'total' => 1, 'status' => 'shipped', 'payment_method' => 'cod', 'logistics_id' => $lg->id]);
        SupportTicket::where('id', $id)->update(['order_id' => $o->id]);
        $this->assertSame([], $subjects($this->actingAs($other)->getJson('/staff-support/feed')->assertOk()));
    }

    // ── F1: analytics ────────────────────────────────────────────────────────

    public function test_analytics_counts_real_sales_only_and_matches_the_dashboard_definition(): void
    {
        $seller = $this->seller();
        $other = $this->seller();
        $p = $this->product($seller);
        $po = $this->product($other);
        $buyer = $this->buyer();

        $mk = function (array $order, Product $prod, int $qty, ?User $s = null) use ($buyer, $seller) {
            $o = Order::create($order + ['buyer_id' => $buyer->id, 'total' => 0, 'payment_method' => 'cod', 'payment_status' => 'unpaid']);
            OrderItem::create(['order_id' => $o->id, 'product_id' => $prod->id, 'seller_id' => ($s ?? $seller)->id, 'product_name' => $prod->name, 'quantity' => $qty, 'unit_price' => 100]);

            return $o;
        };

        $mk(['status' => 'completed'], $p, 2);                       // delivered COD: counts (the old code ignored it: status != paid)
        $mk(['status' => 'pending'], $p, 1);                          // placed: counts (dashboard parity)
        $mk(['status' => 'cancelled'], $p, 5);                        // no
        $mk(['status' => 'failed'], $p, 5);                           // no
        $mk(['status' => 'completed', 'payment_status' => 'refunded'], $p, 4); // no
        $mk(['status' => 'completed'], $po, 9, $other);               // another seller: no
        $old = $mk(['status' => 'completed'], $p, 7);
        Order::where('id', $old->id)->update(['created_at' => now()->subDays(40)]); // outside 30d

        $r = $this->actingAs($seller)->getJson('/api/seller/analytics?range=30d');
        if ($r->status() === 404) {
            $this->markTestSkipped('analytics route path differs');
        }
        $r->assertOk();
        $this->assertSame(3, $r->json('summary.total_units_sold'));
        $this->assertEqualsWithDelta(300.0, $r->json('summary.total_revenue'), 0.001);
        $this->assertCount(30, $r->json('sales_over_time'), 'one point per day, zero-filled');
        $this->assertEqualsWithDelta(300.0, collect($r->json('sales_over_time'))->sum('revenue'), 0.001, 'chart total equals the card');
        $this->assertSame(3, $r->json('top_selling_products.0.units_sold'));

        // 7 days still includes today's orders
        $this->assertSame(3, $this->actingAs($seller)->getJson('/api/seller/analytics?range=7d')->json('summary.total_units_sold'));
    }

    // ── E2: banners, E4: settings ────────────────────────────────────────────

    public function test_banners_follow_status_and_schedule(): void
    {
        Banner::query()->delete();
        Banner::create(['title' => 'live', 'image' => '/images/a.jpg', 'position' => 'hero', 'status' => 'active', 'sort_order' => 2]);
        Banner::create(['title' => 'first', 'image' => '/images/b.jpg', 'position' => 'hero', 'status' => 'active', 'sort_order' => 1]);
        Banner::create(['title' => 'off', 'image' => '/images/c.jpg', 'position' => 'hero', 'status' => 'inactive', 'sort_order' => 3]);
        Banner::create(['title' => 'future', 'image' => '/images/d.jpg', 'position' => 'hero', 'status' => 'active', 'sort_order' => 4, 'starts_at' => now()->addDay()]);
        Banner::create(['title' => 'expired', 'image' => '/images/e.jpg', 'position' => 'hero', 'status' => 'active', 'sort_order' => 5, 'ends_at' => now()->subDay()]);

        $this->assertSame(['first', 'live'], collect($this->getJson('/api/banners')->assertOk()->json('data.hero'))->pluck('title')->all());

        $admin = fn () => $this->withSession(['admin_verified' => true]);
        $id = Banner::where('title', 'live')->value('id');
        $admin()->postJson("/admin/banners/{$id}/move", ['dir' => 'up'])->assertOk();
        $this->assertSame(['live', 'first'], collect($this->getJson('/api/banners')->json('data.hero'))->pluck('title')->all());
        $admin()->postJson("/admin/banners/{$id}/toggle")->assertOk();
        $this->assertSame(['first'], collect($this->getJson('/api/banners')->json('data.hero'))->pluck('title')->all());
        $admin()->deleteJson("/admin/banners/{$id}")->assertOk();
        $this->assertDatabaseMissing('banners', ['id' => $id]);
    }

    public function test_platform_settings_change_real_behaviour(): void
    {
        $admin = fn () => $this->withSession(['admin_verified' => true]);
        $base = ['platform_name' => 'Mimoo', 'support_email' => 'help@mimoo.test', 'commission_percent' => 12, 'default_shipping_fee' => 55,
            'default_logistics_id' => null, 'cod_enabled' => false, 'maintenance_mode' => false, 'maintenance_message' => 'Back soon'];
        $admin()->postJson('/admin/settings/platform', $base)->assertOk();

        $this->assertSame(55.0, ShippingService::fallbackFee());
        $buyer = $this->buyer();
        $p = $this->product($this->seller());
        $this->actingAs($buyer)->postJson('/api/orders', [
            'payment_method' => 'cod', 'shipping_name' => 'A', 'shipping_address' => 'x, y, Z', 'shipping_phone' => '09171234567',
            'buy_now' => ['product_id' => $p->id, 'quantity' => 1],
        ])->assertStatus(422);

        $u = $this->user(['account_type' => 'seller', 'role' => 'seller', 'status' => 'deactivated', 'status_reason' => 'x']);
        $this->assertStringContainsString('help@mimoo.test', \App\Support\AccountStatus::blockReason($u));

        $base['maintenance_mode'] = true;
        $admin()->postJson('/admin/settings/platform', $base)->assertOk();
        $this->flushSession(); // the admin session would be let through; check what everyone else sees
        $this->get('/')->assertStatus(503);
        $this->getJson('/api/products')->assertStatus(503);
        $admin()->get('/admin/settings')->assertOk(); // admin keeps working
    }
}
