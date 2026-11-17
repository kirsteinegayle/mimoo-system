<?php

namespace Tests\Feature;

use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/** Same setup as LogisticsShippingTest (MySQL scratch schema). */
class LogisticsPagesTest extends TestCase
{
    use DatabaseTransactions;

    private function user(array $o): User
    {
        return User::factory()->create($o + ['status' => 'approved', 'verification_status' => 'verified']);
    }

    public function test_zones_and_rates_crud_rejects_overlapping_brackets_and_other_companies(): void
    {
        $lg = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $other = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);

        $this->actingAs($lg)->postJson('/logistics/zones', ['name' => 'Empty'])->assertStatus(422); // needs a city / province
        $id = $this->actingAs($lg)->postJson('/logistics/zones', ['name' => 'Cavite', 'cities' => ['Bacoor'], 'status' => 'active'])->assertCreated()->json('id');

        $this->actingAs($lg)->postJson("/logistics/zones/{$id}/rates", ['min_weight' => 0, 'max_weight' => 2, 'fee' => 60])->assertCreated();
        $this->actingAs($lg)->postJson("/logistics/zones/{$id}/rates", ['min_weight' => 1, 'max_weight' => 3, 'fee' => 70])->assertStatus(422); // overlaps
        $this->actingAs($lg)->postJson("/logistics/zones/{$id}/rates", ['min_weight' => 2.01, 'max_weight' => null, 'fee' => 90])->assertCreated();

        $zones = $this->actingAs($lg)->getJson('/logistics/zones-data')->assertOk()->json('zones');
        $this->assertCount(2, $zones[0]['rates']);
        $this->assertSame([], $this->actingAs($other)->getJson('/logistics/zones-data')->json('zones'));
        $this->actingAs($other)->putJson("/logistics/zones/{$id}", ['name' => 'Hijack', 'cities' => ['X']])->assertNotFound();
    }

    public function test_cod_trail_moves_from_courier_to_logistics_to_seller_once(): void
    {
        $lg = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $courier = $this->user(['account_type' => 'logistics', 'role' => 'courier']);
        $rider = $this->user(['account_type' => 'logistics', 'role' => 'rider']);
        $seller = $this->user(['account_type' => 'seller', 'role' => 'seller']);
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        $product = Product::create(['seller_id' => $seller->id, 'name' => 'P', 'price' => 100, 'stock' => 5, 'sku' => 'CS-1', 'status' => 'active', 'approval_status' => 'approved']);
        $order = Order::create(['buyer_id' => $buyer->id, 'total' => 230, 'shipping_fee' => 30, 'status' => 'completed', 'payment_method' => 'cod', 'logistics_id' => $lg->id, 'waybill_number' => 'CS1']);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'seller_id' => $seller->id, 'product_name' => 'P', 'quantity' => 2, 'unit_price' => 100]);
        $person = CourierPersonnel::create(['courier_id' => $courier->id, 'user_id' => $rider->id, 'name' => 'R', 'contact_number' => '09171234567', 'role' => 'rider', 'status' => 'active']);
        DeliveryJob::create(['order_id' => $order->id, 'rider_user_id' => $rider->id, 'personnel_id' => $person->id, 'courier_id' => $courier->id, 'status' => 'delivered',
            'cod_amount' => 230, 'cod_collected' => 230, 'assigned_at' => now(), 'delivered_at' => now()]);

        $d = $this->actingAs($lg)->getJson('/logistics/cod-data')->assertOk();
        $row = $d->json('data.0');
        $this->assertSame('collected', $row['status']);
        $this->assertEqualsWithDelta(230, $row['amount'], 0.001);
        $this->assertEqualsWithDelta(200 * (1 - config('platform.commission_rate')), $row['seller_payout'], 0.01);
        $this->assertEqualsWithDelta(230, $d->json('summary.with_courier'), 0.001);

        $id = $row['id'];
        $this->actingAs($lg)->postJson("/logistics/cod/{$id}/settled")->assertStatus(422);       // cannot skip a step
        $this->actingAs($lg)->postJson("/logistics/cod/{$id}/received")->assertOk();
        $this->actingAs($lg)->postJson("/logistics/cod/{$id}/received")->assertOk()->assertJson(['idempotent' => true]);
        $this->actingAs($lg)->postJson("/logistics/cod/{$id}/settled")->assertOk();
        $this->assertSame('settled_to_seller', $this->actingAs($lg)->getJson('/logistics/cod-data')->json('data.0.status'));
        $this->assertSame(1, \DB::table('cod_settlements')->where('order_id', $order->id)->count(), 'synced once, never duplicated');

        $other = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $this->actingAs($other)->postJson("/logistics/cod/{$id}/received")->assertNotFound();
    }

    public function test_monitoring_riders_and_reports_use_real_records(): void
    {
        $lg = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $courier = $this->user(['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'CourierCo']);
        $rider = $this->user(['account_type' => 'logistics', 'role' => 'rider']);
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        $order = Order::create(['buyer_id' => $buyer->id, 'total' => 100, 'status' => 'in_transit', 'payment_method' => 'cod', 'waybill_number' => 'MON1',
            'logistics_id' => $lg->id, 'assigned_courier_id' => $courier->id, 'shipping_municipality_city' => 'Bacoor', 'tracking_message' => 'Out for delivery']);
        $person = CourierPersonnel::create(['courier_id' => $courier->id, 'user_id' => $rider->id, 'name' => 'Rico', 'contact_number' => '09171234567', 'role' => 'rider', 'status' => 'active']);
        DeliveryJob::create(['order_id' => $order->id, 'rider_user_id' => $rider->id, 'personnel_id' => $person->id, 'courier_id' => $courier->id, 'status' => 'out_for_delivery',
            'cod_amount' => 100, 'assigned_at' => now()->subHour(), 'out_for_delivery_at' => now()]);

        $m = $this->actingAs($lg)->getJson('/logistics/monitoring-data')->assertOk();
        $row = $m->json('data.0');
        $this->assertSame('MON1', $row['waybill']);
        $this->assertSame('CourierCo', $row['courier']);
        $this->assertSame('Rico', $row['rider']);
        $this->assertSame(1, $m->json('summary.out_for_delivery'));
        $labels = collect($row['timeline'])->pluck('label')->implode('|');
        $this->assertStringContainsString('Out for delivery', $labels);
        $this->assertStringContainsString('Order placed', $labels);

        // a parcel routed to a different logistics is not visible
        $other = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $this->assertSame(0, $this->actingAs($other)->getJson('/logistics/monitoring-data')->json('summary.total'));

        // D6: refunds + buyer complaints about the delivery show up in reports
        $rr = \DB::table('return_requests')->insertGetId(array_filter(['order_id' => $order->id, 'buyer_id' => $buyer->id, 'status' => 'refunded', 'created_at' => now(), 'updated_at' => now(), 'reason' => 'damaged', 'description' => 'broken', 'images' => '[]'], fn ($v) => true));
        Refund::forceCreate(['return_request_id' => $rr, 'order_id' => $order->id, 'amount' => 100, 'method' => 'cod', 'idempotency_key' => 'k-' . uniqid(), 'status' => 'refunded']);
        \App\Models\Complaint::create(['buyer_id' => $buyer->id, 'order_id' => $order->id, 'courier_id' => $courier->id, 'type' => 'courier_conduct', 'description' => 'Rider was rude at the door', 'status' => 'open']);
        $rep = $this->actingAs($lg)->getJson('/logistics/reports-data')->assertOk();
        $this->assertSame(1, $rep->json('summary.refunds'));
        $this->assertSame(1, $rep->json('summary.incidents'));
        $this->assertSame('Buyer complaint (app)', $rep->json('incidents.0.source'));

        // D2: riders
        $this->actingAs($courier)->getJson('/logistics/riders-data')->assertForbidden(); // logistics_staff only
        $this->actingAs($lg)->getJson('/logistics/riders-data')->assertOk();
        $this->actingAs($lg)->postJson('/logistics/riders', ['name' => 'Nina', 'contact_number' => 'bad'])->assertStatus(422);
        $this->actingAs($lg)->postJson('/logistics/riders', ['name' => 'Nina', 'contact_number' => '09171230000'])->assertCreated();
    }

    public function test_accounts_approval_filters_by_role_and_stores_the_rejection_reason(): void
    {
        $sellerApplicant = $this->user(['account_type' => 'seller', 'role' => 'seller', 'status' => 'pending', 'business_name' => 'ShopOne']);
        $logisticsApplicant = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff', 'status' => 'pending', 'company_name' => 'LogOne']);
        $admin = fn () => $this->withSession(['admin_verified' => true]);

        $admin()->get('/admin/accounts-approval?type=seller')->assertOk()
            ->assertInertia(fn ($p) => $p->component('admin/AccountsApproval')->where('type', 'seller')->where('rows.0.name', 'ShopOne')->where('counts.logistics.pending', 1));
        $admin()->get('/admin/accounts-approval?type=logistics')->assertOk()
            ->assertInertia(fn ($p) => $p->where('type', 'logistics')->where('rows.0.name', 'LogOne'));
        $admin()->get('/admin/seller-approval')->assertRedirect('/admin/accounts-approval?type=seller');

        $admin()->post("/admin/seller-approval/{$sellerApplicant->id}/disapprove", ['reason' => 'Permit expired'])->assertRedirect();
        $sellerApplicant->refresh();
        $this->assertSame('disapproved', $sellerApplicant->status);
        $this->assertSame('Permit expired', $sellerApplicant->status_reason);
        $admin()->post("/admin/logistics-approval/{$logisticsApplicant->id}/approve")->assertRedirect();
        $this->assertSame('approved', $logisticsApplicant->fresh()->status);
    }

    public function test_transfers_follow_the_scan_rules_and_company_settings_drive_courier_eligibility(): void
    {
        $courier = $this->user(['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'CourierCo']);
        $mk = fn ($name, $type, $o = []) => \App\Models\CourierFacility::create($o + ['courier_id' => $courier->id, 'facility_name' => $name, 'facility_code' => $name . uniqid(),
            'facility_type' => $type, 'status' => 'Active', 'region' => 'R', 'city' => $name, 'address' => 'a', 'manager_name' => 'm', 'contact_number' => '09171234567', 'coverage_cities' => [$name]]);
        $main = $mk('Main', 'Main Hub');
        $branch = $mk('Branch1', 'Branch', ['parent_facility_id' => $main->id]);
        $stray = $mk('Stray', 'Branch');
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        $order = Order::create(['buyer_id' => $buyer->id, 'total' => 10, 'status' => 'in_transit', 'payment_method' => 'cod', 'waybill_number' => 'TR1',
            'assigned_courier_id' => $courier->id, 'current_facility_id' => $branch->id, 'shipping_municipality_city' => 'Elsewhere']);

        $this->actingAs($courier)->postJson('/courier/transfers', ['waybill_number' => 'TR1', 'to_facility_id' => $stray->id])->assertStatus(422);   // unexpected facility
        $this->assertSame($branch->id, (int) $order->fresh()->current_facility_id, 'rejected transfer changes nothing');
        $this->assertSame(1, \DB::table('scan_attempts')->where('waybill_number', 'TR1')->where('scan_type', 'transferred')->count());
        $this->actingAs($courier)->postJson('/courier/transfers', ['waybill_number' => 'TR1', 'to_facility_id' => $main->id])->assertOk();           // parent hub
        $this->assertSame($main->id, (int) $order->fresh()->current_facility_id);
        $this->assertSame('transferred', \App\Models\ShipmentScan::where('order_id', $order->id)->latest('id')->value('scan_type'));
        $this->actingAs($courier)->getJson('/courier/transfers-data')->assertOk()->assertJsonPath('parcels.0.waybill', 'TR1');

        $this->actingAs($courier)->postJson('/courier/company-settings', [
            'business_email' => 'ops@courier.test', 'company_contact_number' => '09171230000', 'business_address' => 'Somewhere 1',
            'service_areas' => ['Habay ', 'Habay'], 'cities_served' => ['Bacoor'], 'pickup_available' => 'yes',
        ])->assertOk();
        $this->assertSame(['Habay'], $courier->fresh()->service_areas);
        $this->actingAs($courier)->postJson('/courier/company-settings', ['business_email' => 'bad'])->assertStatus(422);
        $o = new Order(['shipping_barangay' => 'Habay', 'shipping_municipality_city' => 'Bacoor']);
        $this->assertSame([$courier->id], \App\Services\ShippingService::eligibleCouriers($o)->pluck('user.id')->all());
    }
}
