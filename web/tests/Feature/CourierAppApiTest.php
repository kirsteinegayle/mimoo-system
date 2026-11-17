<?php

namespace Tests\Feature;

use App\Models\CourierFacility;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Courier mobile API (/api/courier-app/*). Needs a MySQL scratch schema, see LogisticsShippingTest. */
class CourierAppApiTest extends TestCase
{
    use DatabaseTransactions;

    private function courier(): User
    {
        return User::factory()->create(['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified', 'company_name' => 'CourierCo']);
    }

    private function facility(User $c, string $name, string $type, array $o = []): CourierFacility
    {
        return CourierFacility::create($o + ['courier_id' => $c->id, 'facility_name' => $name, 'facility_code' => $name . uniqid(), 'facility_type' => $type, 'status' => 'Active',
            'region' => 'R', 'city' => $name, 'address' => 'a', 'manager_name' => 'm', 'contact_number' => '09171234567', 'coverage_cities' => [$name]]);
    }

    public function test_mobile_scan_applies_the_same_rules_and_audits_rejections(): void
    {
        $c = $this->courier();
        Sanctum::actingAs($c);
        $main = $this->facility($c, 'Main', 'Main Hub');
        $off = $this->facility($c, 'Off', 'Sorting Hub', ['status' => 'Inactive']);
        $buyer = User::factory()->create(['account_type' => 'buyer', 'role' => 'buyer', 'status' => 'approved']);
        $order = Order::create(['buyer_id' => $buyer->id, 'total' => 1, 'status' => 'shipped', 'payment_method' => 'cod', 'waybill_number' => 'MOB1', 'assigned_courier_id' => $c->id, 'shipping_municipality_city' => 'Faraway']);
        ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $c->id, 'assigned_by' => $c->id, 'assigned_at' => now(), 'assignment_status' => 'accepted', 'pickup_status' => 'picked_up', 'weight' => 1, 'acceptance_deadline' => now()->addDay()]);

        $audit = fn () => \DB::table('scan_attempts')->where('waybill_number', 'MOB1')->count();

        // rejected: inactive facility. Parcel and tracking untouched, one audit row, a specific reason.
        $r = $this->postJson('/api/courier-app/scan-parcel', ['waybill_number' => 'MOB1', 'facility_id' => $off->id])->assertStatus(422);
        $this->assertStringContainsString('inactive', $r->json('message'));
        $this->assertNull($order->fresh()->current_facility_id);
        $this->assertSame(0, \DB::table('shipment_scans')->where('order_id', $order->id)->count());
        $this->assertSame(1, $audit());

        // accepted: first intake at any active facility of the company (not only the buyer's city)
        $this->postJson('/api/courier-app/scan-parcel', ['waybill_number' => 'MOB1', 'facility_id' => $main->id])->assertOk();
        $this->assertSame($main->id, (int) $order->fresh()->current_facility_id);
        $this->assertSame(1, $audit(), 'accepted scans are not audit rejections');

        // repeat scan at the same facility = bad sequence
        $this->postJson('/api/courier-app/scan-parcel', ['waybill_number' => 'MOB1', 'facility_id' => $main->id])->assertStatus(422);
        $this->assertSame(2, $audit());

        // unknown waybill is audited too
        $this->postJson('/api/courier-app/scan-parcel', ['waybill_number' => 'NOPE', 'facility_id' => $main->id])->assertStatus(404);
        $this->assertSame(1, \DB::table('scan_attempts')->where('waybill_number', 'NOPE')->count());
    }

    public function test_mobile_has_the_web_features_with_the_same_data(): void
    {
        $c = $this->courier();
        Sanctum::actingAs($c);
        $a = $this->facility($c, 'Main', 'Main Hub');
        $b = $this->facility($c, 'Branch', 'Branch', ['parent_facility_id' => $a->id]);
        $buyer = User::factory()->create(['account_type' => 'buyer', 'role' => 'buyer', 'status' => 'approved']);
        $o = Order::create(['buyer_id' => $buyer->id, 'total' => 1, 'status' => 'in_transit', 'payment_method' => 'cod', 'waybill_number' => 'MOB2', 'assigned_courier_id' => $c->id, 'current_facility_id' => $b->id]);

        // Sorting & Transfers
        $this->getJson('/api/courier-app/transfers-data')->assertOk()->assertJsonPath('parcels.0.waybill', 'MOB2');
        $this->postJson('/api/courier-app/transfers', ['waybill_number' => 'MOB2', 'to_facility_id' => $a->id])->assertOk();
        $this->assertSame($a->id, (int) $o->fresh()->current_facility_id);

        // Company settings
        $this->postJson('/api/courier-app/company-settings', ['business_email' => 'x@y.test', 'company_contact_number' => '09171230000', 'business_address' => 'Somewhere', 'service_areas' => ['Habay']])->assertOk();
        $this->assertSame(['Habay'], $this->getJson('/api/courier-app/company-settings')->assertOk()->json('data.service_areas'));

        // COD remittance list (empty but valid) and confirm of an unknown id
        $this->getJson('/api/courier-app/cod-remittances')->assertOk()->assertJsonStructure(['data', 'meta' => ['awaiting_amount', 'awaiting_count']]);
        $this->postJson('/api/courier-app/cod-remittances/999999/confirm')->assertNotFound();

        // Support: courier queue (routed tickets) + own tickets to admin
        $t = SupportTicket::create(['user_id' => $buyer->id, 'user_role' => 'buyer', 'category' => 'courier', 'target' => 'courier', 'subject' => 'Rude rider', 'message' => 'long enough message here', 'status' => 'open']);
        $this->assertSame(['Rude rider'], collect($this->getJson('/api/courier-app/staff-support/feed')->assertOk()->json('data'))->pluck('subject')->all());
        $this->postJson("/api/courier-app/staff-support/{$t->id}/reply", ['body' => 'Looking into it'])->assertCreated();
        $this->postJson("/api/courier-app/staff-support/{$t->id}/status", ['status' => 'resolved'])->assertOk();
        $this->assertSame('resolved', $t->fresh()->status);
        $this->postJson('/api/courier-app/support/tickets', ['category' => 'technical', 'subject' => 'App problem', 'message' => 'The scanner closes by itself.'])->assertCreated();
        $this->assertSame('admin', SupportTicket::where('subject', 'App problem')->value('target'));

        // Facilities incl. inactive for management
        $this->assertCount(2, $this->getJson('/api/courier-app/facilities?status=all')->assertOk()->json('data'));
    }
}
