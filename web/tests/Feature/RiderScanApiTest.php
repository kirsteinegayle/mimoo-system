<?php

namespace Tests\Feature;

use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Rider scanner API (POST /api/rider-app/scan-waybill and the pickup scan audit).
 * Needs a MySQL scratch schema (see LogisticsShippingTest): DB_CONNECTION=mysql DB_DATABASE=<scratch>.
 */
class RiderScanApiTest extends TestCase
{
    use DatabaseTransactions;

    private User $courier;
    private User $rider;
    private CourierPersonnel $person;

    protected function setUp(): void
    {
        parent::setUp();
        $this->courier = User::factory()->create(['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified', 'company_name' => 'CourierCo']);
        $this->rider = User::factory()->create(['account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved', 'verification_status' => 'verified']);
        $this->person = CourierPersonnel::create(['courier_id' => $this->courier->id, 'user_id' => $this->rider->id, 'name' => 'Rico', 'contact_number' => '09171234567', 'role' => 'rider', 'status' => 'active']);
    }

    private function order(string $waybill, array $o = []): Order
    {
        $buyer = User::factory()->create(['account_type' => 'buyer', 'role' => 'buyer', 'status' => 'approved']);

        return Order::create($o + ['buyer_id' => $buyer->id, 'total' => 100, 'status' => 'shipped', 'payment_method' => 'cod', 'waybill_number' => $waybill, 'assigned_courier_id' => $this->courier->id]);
    }

    private function assignment(Order $order, string $pickup = 'scheduled', ?CourierPersonnel $who = null): ShipmentAssignment
    {
        return ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $this->courier->id, 'assigned_by' => $this->courier->id, 'assigned_at' => now(),
            'assignment_status' => 'accepted', 'pickup_status' => $pickup, 'weight' => 1, 'acceptance_deadline' => now()->addDay(),
            'assigned_personnel_id' => ($who ?? $this->person)->id]);
    }

    private function audit(string $waybill)
    {
        return \DB::table('scan_attempts')->where('waybill_number', $waybill);
    }

    private function scan(string $code, ?string $intent = null)
    {
        return $this->postJson('/api/rider-app/scan-waybill', array_filter(['waybill_number' => $code, 'intent' => $intent]));
    }

    public function test_pickup_scan_succeeds_for_the_assigned_rider_and_is_case_insensitive(): void
    {
        Sanctum::actingAs($this->rider);
        $order = $this->order('RSC1');
        $a = $this->assignment($order);

        $this->scan(' rsc1 ')->assertOk()->assertJsonPath('action', 'pickup')->assertJsonPath('waybill_number', 'RSC1');
        $this->assertSame('picked_up', $a->fresh()->pickup_status);

        // a repeat scan is refused with a clear reason, audited, and never earns twice
        $r = $this->scan('RSC1')->assertStatus(422);
        $this->assertStringContainsString('already picked up', $r->json('message'));
        $this->assertSame(1, $this->audit('RSC1')->count());
        $this->assertSame(1, \DB::table('rider_earnings')->where('shipment_assignment_id', $a->id)->count());
    }

    public function test_rejected_scans_change_nothing_return_the_reason_and_are_audited(): void
    {
        Sanctum::actingAs($this->rider);

        // unknown waybill
        $r = $this->scan('NOPE')->assertNotFound();
        $this->assertStringContainsString('No parcel found', $r->json('message'));
        $this->assertSame(1, $this->audit('NOPE')->count());

        // someone else's parcel: another rider is assigned
        $other = User::factory()->create(['account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved']);
        $otherPerson = CourierPersonnel::create(['courier_id' => $this->courier->id, 'user_id' => $other->id, 'name' => 'Other', 'contact_number' => '09170000000', 'role' => 'rider', 'status' => 'active']);
        $foreign = $this->order('RSC2');
        $fa = $this->assignment($foreign, 'scheduled', $otherPerson);
        $r = $this->scan('RSC2')->assertForbidden();
        $this->assertSame('This parcel is not assigned to you.', $r->json('message'));
        $this->assertSame('scheduled', $fa->fresh()->pickup_status);
        $this->assertSame(1, $this->audit('RSC2')->count());

        // my parcel but not scheduled yet (pickup pending): wrong sequence, specific reason
        $mine = $this->order('RSC3');
        $ma = $this->assignment($mine, 'pending_pickup');
        $r = $this->scan('RSC3')->assertStatus(422);
        $this->assertStringContainsString('scheduled first', $r->json('message'));
        $this->assertSame('pending_pickup', $ma->fresh()->pickup_status);
        $this->assertSame(0, \DB::table('rider_earnings')->where('shipment_assignment_id', $ma->id)->count());
        $row = \DB::table('scan_attempts')->where('order_id', $mine->id)->first();
        $this->assertNotNull($row);
        $this->assertSame('rejected', $row->result);
        $this->assertSame($this->rider->id, (int) $row->user_id);
        $this->assertSame($this->courier->id, (int) $row->courier_id);
        $this->assertSame(0, \DB::table('shipment_scans')->whereIn('order_id', [$foreign->id, $mine->id])->count());
    }

    public function test_scanning_for_a_specific_job_refuses_a_different_parcel(): void
    {
        Sanctum::actingAs($this->rider);
        $wanted = $this->order('RSC7');
        $other = $this->order('RSC8');
        $this->assignment($wanted);
        $oa = $this->assignment($other);

        $r = $this->postJson('/api/rider-app/scan-waybill', ['waybill_number' => 'RSC8', 'expected_waybill' => 'RSC7'])->assertStatus(422);
        $this->assertStringContainsString('Wrong parcel', $r->json('message'));
        $this->assertSame('scheduled', $oa->fresh()->pickup_status, 'the other parcel must not be picked up');
        $this->assertSame(1, $this->audit('RSC8')->count());

        $this->postJson('/api/rider-app/scan-waybill', ['waybill_number' => 'rsc7', 'expected_waybill' => 'RSC7'])->assertOk()->assertJsonPath('action', 'pickup');
    }

    public function test_pickup_endpoint_audits_a_waybill_mismatch(): void
    {
        Sanctum::actingAs($this->rider);
        $order = $this->order('RSC4');
        $a = $this->assignment($order);

        $r = $this->postJson("/api/rider-app/pickups/{$a->id}/scan", ['waybill_number' => 'WRONG'])->assertStatus(422);
        $this->assertStringContainsString('Waybill mismatch', $r->json('message'));
        $this->assertSame('scheduled', $a->fresh()->pickup_status);
        $this->assertSame(1, \DB::table('scan_attempts')->where('order_id', $order->id)->count());
    }

    public function test_delivery_scan_starts_the_delivery_only_for_the_assigned_rider(): void
    {
        $order = $this->order('RSC5', ['status' => 'in_transit']);
        $job = DeliveryJob::create(['order_id' => $order->id, 'rider_user_id' => $this->rider->id, 'personnel_id' => $this->person->id, 'courier_id' => $this->courier->id,
            'status' => 'assigned', 'cod_amount' => 100, 'assigned_at' => now()]);

        // a different rider cannot start it
        $other = User::factory()->create(['account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved']);
        CourierPersonnel::create(['courier_id' => $this->courier->id, 'user_id' => $other->id, 'name' => 'Other', 'contact_number' => '09170000000', 'role' => 'rider', 'status' => 'active']);
        Sanctum::actingAs($other);
        $this->scan('RSC5')->assertForbidden();
        $this->assertSame('assigned', $job->fresh()->status);
        $this->assertSame(1, $this->audit('RSC5')->count());

        Sanctum::actingAs($this->rider);
        $this->scan('RSC5')->assertOk()->assertJsonPath('action', 'delivery');
        $this->assertSame('out_for_delivery', $job->fresh()->status);

        // delivered parcels cannot be scanned again
        $job->update(['status' => 'delivered', 'delivered_at' => now()]);
        $r = $this->scan('RSC5')->assertStatus(422);
        $this->assertStringContainsString('already delivered', $r->json('message'));
        $this->assertSame('delivered', $job->fresh()->status);
    }

    public function test_handoff_requires_a_picked_up_parcel_and_records_one_drop_scan(): void
    {
        Sanctum::actingAs($this->rider);
        CourierFacility::create(['courier_id' => $this->courier->id, 'facility_name' => 'Main', 'facility_code' => 'M' . uniqid(), 'facility_type' => 'Main Hub', 'status' => 'Active',
            'region' => 'R', 'city' => 'Main', 'address' => 'a', 'manager_name' => 'm', 'contact_number' => '09171234567', 'coverage_cities' => ['Main']]);
        $order = $this->order('RSC6');
        $a = $this->assignment($order, 'scheduled');

        // not picked up yet: refused + audited, nothing written
        $r = $this->scan('RSC6', 'handoff')->assertStatus(422);
        $this->assertStringContainsString('Scan the parcel at the seller first', $r->json('message'));
        $this->assertSame(0, \DB::table('shipment_scans')->where('order_id', $order->id)->count());
        $this->assertSame(1, \DB::table('scan_attempts')->where('order_id', $order->id)->where('scan_type', 'rider_drop_off')->count());

        $a->update(['pickup_status' => 'picked_up', 'picked_up_at' => now()]);
        // picked up but this rider has no hub linked: specific reason, audited
        $r = $this->scan('RSC6', 'handoff')->assertStatus(422);
        $this->assertStringContainsString('No hub is linked', $r->json('message'));
        $this->assertSame(2, \DB::table('scan_attempts')->where('order_id', $order->id)->count());
    }

    public function test_requires_a_rider_account_and_a_waybill(): void
    {
        $buyer = User::factory()->create(['account_type' => 'buyer', 'role' => 'buyer', 'status' => 'approved']);
        Sanctum::actingAs($buyer);
        $this->scan('X')->assertForbidden();

        Sanctum::actingAs($this->rider);
        $this->postJson('/api/rider-app/scan-waybill', [])->assertStatus(422);
    }
}
