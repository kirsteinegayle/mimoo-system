<?php

namespace Tests\Feature;

use App\Models\CourierFacility;
use App\Models\LogisticsRate;
use App\Models\LogisticsZone;
use App\Models\Order;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Needs a MySQL scratch schema (see LogisticsShippingTest). */
class RemainingItemsTest extends TestCase
{
    use DatabaseTransactions;

    private function user(array $o): User
    {
        return User::factory()->create($o + ['status' => 'approved', 'verification_status' => 'verified']);
    }

    public function test_ticket_attachments_are_validated_stored_privately_and_access_controlled(): void
    {
        Storage::fake('local');
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        $other = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        $lg = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $payload = ['category' => 'logistics', 'subject' => 'Rider problem', 'message' => 'The rider did not come at all.'];

        // rejected: wrong type, too big, too many
        $this->actingAs($buyer)->post('/support/tickets', $payload + ['attachments' => [UploadedFile::fake()->create('x.exe', 10, 'application/x-msdownload')]], ['Accept' => 'application/json'])->assertStatus(422);
        $this->actingAs($buyer)->post('/support/tickets', $payload + ['attachments' => [UploadedFile::fake()->create('big.pdf', 6000, 'application/pdf')]], ['Accept' => 'application/json'])->assertStatus(422);
        $this->actingAs($buyer)->post('/support/tickets', $payload + ['attachments' => array_map(fn ($i) => UploadedFile::fake()->create("f{$i}.pdf", 10, 'application/pdf'), range(1, 4))], ['Accept' => 'application/json'])->assertStatus(422);
        $this->assertSame(0, SupportTicket::count());

        // accepted
        $r = $this->actingAs($buyer)->post('/support/tickets', $payload + ['attachments' => [UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf')]], ['Accept' => 'application/json'])->assertCreated();
        $id = $r->json('data.id');
        $file = $r->json('data.attachments.0');
        $this->assertSame('proof.pdf', $file['name']);
        $this->assertFalse($file['is_image']);
        $stored = \DB::table('support_ticket_attachments')->first();
        $this->assertStringNotContainsString('proof', $stored->path, 'stored under a random name');
        Storage::disk('local')->assertExists($stored->path);

        // who can open it: owner yes, a logistics account (queue is theirs, no order link) yes, another buyer no, guest no
        $url = $file['url'];
        $this->actingAs($buyer)->get($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->actingAs($lg)->get($url)->assertOk();
        $this->actingAs($other)->get($url)->assertNotFound();
        auth()->logout();
        $this->flushSession();
        $this->get($url)->assertRedirect();

        // staff reply with attachment shows on the buyer's thread
        $this->actingAs($lg)->post("/staff-support/{$id}/reply", ['body' => 'Photo of the receipt', 'attachments' => [UploadedFile::fake()->create('r.jpg', 20, 'image/jpeg')]], ['Accept' => 'application/json'])->assertCreated();
        $thread = $this->actingAs($buyer)->getJson("/support/tickets/{$id}")->assertOk()->json('data');
        $this->assertTrue($thread['replies'][0]['attachments'][0]['is_image']);

        // admin can open through the admin route
        $this->withSession(['admin_verified' => true])->get('/admin/support/attachments/' . $stored->id)->assertOk();
    }

    public function test_facility_checklists_crud_is_scoped_to_the_company(): void
    {
        $courier = $this->user(['account_type' => 'logistics', 'role' => 'courier']);
        $otherCourier = $this->user(['account_type' => 'logistics', 'role' => 'courier']);
        // logistics staff work on their courier company's facilities
        $c = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff', 'courier_company_id' => $courier->id]);
        $other = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff', 'courier_company_id' => $otherCourier->id]);
        $f = CourierFacility::create(['courier_id' => $courier->id, 'facility_name' => 'Main', 'facility_code' => 'CK' . uniqid(), 'facility_type' => 'Main Hub', 'status' => 'Active', 'region' => 'R', 'city' => 'X', 'address' => 'a', 'manager_name' => 'm', 'contact_number' => '09171234567', 'coverage_cities' => ['X']]);

        $id = $this->actingAs($c)->postJson("/logistics/facilities/{$f->id}/checklist", ['type' => 'inbound', 'title' => 'Verify seal'])->assertCreated()->json('id');
        $this->actingAs($c)->postJson("/logistics/facilities/{$f->id}/checklist", ['type' => 'bogus', 'title' => 'x'])->assertStatus(422);
        $this->actingAs($c)->putJson("/logistics/checklist-items/{$id}", ['is_done' => true])->assertOk();
        $row = $this->actingAs($c)->getJson("/logistics/facilities/{$f->id}/checklist")->assertOk()->json('data.0');
        $this->assertTrue($row['is_done']);
        $this->assertNotNull($row['done_at']);
        $this->actingAs($c)->postJson("/logistics/facilities/{$f->id}/checklist/reset", ['type' => 'inbound'])->assertOk();
        $this->assertFalse($this->actingAs($c)->getJson("/logistics/facilities/{$f->id}/checklist")->json('data.0.is_done'));

        $this->actingAs($other)->getJson("/logistics/facilities/{$f->id}/checklist")->assertNotFound();
        $this->actingAs($other)->putJson("/logistics/checklist-items/{$id}", ['is_done' => true])->assertNotFound();
        $this->actingAs($c)->deleteJson("/logistics/checklist-items/{$id}")->assertOk();
        $this->assertSame([], $this->actingAs($c)->getJson("/logistics/facilities/{$f->id}/checklist")->json('data'));
    }

    public function test_backfill_assigns_active_orders_only_and_rolls_back(): void
    {
        $lg = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff', 'company_name' => 'LogCo']);
        $zone = LogisticsZone::create(['logistics_id' => $lg->id, 'name' => 'Cavite', 'cities' => ['Bacoor'], 'provinces' => [], 'status' => 'active']);
        LogisticsRate::create(['zone_id' => $zone->id, 'min_weight' => 0, 'max_weight' => null, 'fee' => 70]);
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        $mk = fn ($status, $extra = []) => Order::create($extra + ['buyer_id' => $buyer->id, 'total' => 100, 'status' => $status, 'payment_method' => 'cod', 'shipping_municipality_city' => 'Bacoor', 'shipping_province' => 'Cavite']);
        $active = $mk('shipped');
        $done = $mk('completed');
        $cancelled = $mk('cancelled');
        $refunded = $mk('shipped', ['payment_status' => 'refunded']);
        $already = $mk('shipped', ['logistics_id' => 999999]);

        $this->artisan('orders:backfill-logistics --dry-run')->assertSuccessful();
        $this->assertNull($active->fresh()->logistics_id, 'dry run writes nothing');

        $this->artisan('orders:backfill-logistics')->assertSuccessful();
        $this->assertSame($lg->id, (int) $active->fresh()->logistics_id);
        $this->assertStringStartsWith('Backfilled:', $active->fresh()->logistics_reason);
        foreach ([$done, $cancelled, $refunded] as $o) {
            $this->assertNull($o->fresh()->logistics_id);
        }
        $this->assertSame(999999, (int) $already->fresh()->logistics_id, 'existing assignments are never touched');
        $this->assertEqualsWithDelta(100, (float) $active->fresh()->total, 0.001, 'totals unchanged');

        $this->artisan('orders:backfill-logistics --rollback')->assertSuccessful();
        $this->assertNull($active->fresh()->logistics_id);
        $this->assertSame(999999, (int) $already->fresh()->logistics_id);
    }

    public function test_finished_legacy_orders_are_not_shown_to_unrelated_logistics(): void
    {
        $a = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        Order::create(['buyer_id' => $buyer->id, 'total' => 1, 'status' => 'completed', 'payment_method' => 'cod', 'waybill_number' => 'LEG1']);
        $this->assertSame(0, $this->actingAs($a)->getJson('/logistics/monitoring-data')->json('summary.total'));
    }

    public function test_buyer_app_shipping_quote_matches_the_web_fee_and_is_never_free(): void
    {
        $lg = $this->user(['account_type' => 'logistics', 'role' => 'logistics_staff']);
        $z = LogisticsZone::create(['logistics_id' => $lg->id, 'name' => 'Cavite', 'cities' => ['Bacoor'], 'provinces' => [], 'status' => 'active']);
        LogisticsRate::create(['zone_id' => $z->id, 'min_weight' => 0, 'max_weight' => null, 'fee' => 65]);
        $buyer = $this->user(['account_type' => 'buyer', 'role' => 'buyer']);
        Sanctum::actingAs($buyer);

        $q = $this->getJson('/api/buyer/shipping/quote?city=Bacoor&province=Cavite')->assertOk()->json('data');
        $this->assertSame(65.0, (float) $q['shipping_fee']);
        $far = $this->getJson('/api/buyer/shipping/quote?city=Atlantis')->assertOk()->json('data');
        $this->assertGreaterThan(0, $far['shipping_fee']);
        $this->assertTrue($far['standard_rate']);
        $this->getJson('/api/buyer/shipping/quote?address_id=999999')->assertNotFound();
        $this->assertCount(0, $this->getJson('/api/banners')->assertOk()->json('data.hero') ?: [], 'banner endpoint answers (empty is fine)');
    }

    public function test_abandoned_signup_window_comes_from_one_config_value(): void
    {
        $this->assertSame(30, config('platform.abandoned_registration_minutes'));
    }
}
