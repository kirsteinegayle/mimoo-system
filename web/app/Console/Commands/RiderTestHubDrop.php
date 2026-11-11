<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderAuthController;
use App\Http\Controllers\Api\RiderPickupController;
use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\Order;
use App\Models\Rider;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentScan;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests: rider "drop at hub" + real hub in the rider profile.
 *
 * Fixture courier facility, riders (one with an approved application linked
 * to that branch), assignment and scans are created inside ONE transaction
 * that is ALWAYS rolled back. orders.* and demo data are never touched.
 *
 *   php artisan rider:test-hub-drop
 */
class RiderTestHubDrop extends Command
{
    protected $signature = 'rider:test-hub-drop';

    protected $description = 'Rollback-only tests: POST /pickups/{id}/drop-at-hub and hub in the rider profile';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $order = Order::whereNotNull('waybill_number')
            ->whereNotExists(fn ($q) => $q->select(DB::raw(1))->from('shipment_assignments')
                ->whereColumn('shipment_assignments.order_id', 'orders.id')
                ->whereIn('assignment_status', ['pending', 'accepted'])
                ->where('pickup_status', '<>', 'cancelled'))
            ->orderBy('id')->first();
        $courier = User::where('role', 'courier')->orderBy('id')->first()
            ?? User::where('account_type', 'logistics')->orderBy('id')->first();
        $otherCourier = User::where('id', '!=', $courier?->id)
            ->where(fn ($q) => $q->where('role', 'courier')->orWhere('account_type', 'logistics'))
            ->orderBy('id')->first();
        if (! $order || ! $courier || ! $otherCourier) {
            $this->error('Need an order with a waybill (no active assignment) and two courier accounts.');
            return self::FAILURE;
        }

        $counts      = $this->counts();
        $orderBefore = Order::whereKey($order->id)->first()->toArray();

        DB::beginTransaction();
        try {
            $this->runTests($order, $courier, $otherCourier);
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', Str::limit(json_encode($after), 60));
        $this->check('orders row unchanged', Order::whereKey($order->id)->first()->toArray() === $orderBefore ? 'yes' : 'NO', 'yes', "order #{$order->id}");

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(Order $order, User $courier, User $otherCourier): void
    {
        $pickup = app(RiderPickupController::class);
        $auth   = app(RiderAuthController::class);

        // Fixtures (rolled back)
        $hub = CourierFacility::create([
            'courier_id' => $courier->id, 'facility_name' => 'CHECK Drop Hub', 'facility_code' => 'CHK' . Str::upper(Str::random(4)),
            'facility_type' => 'Branch', 'status' => 'Active', 'region' => 'Region IV-A', 'province' => 'Laguna', 'city' => 'Lumban',
            'address' => '1 Check St.', 'manager_name' => 'Check', 'contact_number' => '0', 'coverage_cities' => [],
        ]);
        [$rider, $personnel] = $this->makeRider($courier, 'a');
        [$otherRider]        = $this->makeRider($courier, 'b');
        $application = Rider::create([
            'first_name' => 'Hub', 'last_name' => 'Check', 'birthdate' => '1990-01-01', 'gender' => 'male',
            'contact_number' => '0', 'email' => $rider->email, 'rider_id' => Rider::generateRiderId(),
            'username' => 'hubcheck' . Str::lower(Str::random(5)), 'password' => Hash::make(Str::random(16)),
            'employment_status' => 'active', 'service_areas' => [], 'vehicle_type' => 'motorcycle', 'region' => 'X',
            'city_municipality' => 'X', 'barangay' => 'X', 'government_id' => 'x', 'privacy_policy_accepted' => true,
            'verification_status' => 'approved', 'courier_company_id' => $courier->id, 'assigned_branch_id' => $hub->id,
        ]);
        $sa = ShipmentAssignment::create([
            'order_id' => $order->id, 'courier_id' => $courier->id, 'assigned_by' => $courier->id, 'assigned_at' => now(),
            'assignment_status' => 'accepted', 'accepted_at' => now(), 'acceptance_deadline' => now()->addDay(),
            'pickup_status' => 'scheduled', 'assigned_personnel_id' => $personnel->id,
        ]);
        $this->check('fixture: hub, 2 riders, application, pickup', 'ok', 'ok', "hub #{$hub->id}, assignment #{$sa->id}, order #{$order->id}");

        $drops = fn () => ShipmentScan::where('order_id', $order->id)->where('scan_type', RiderPickupController::SCAN_RIDER_DROP_OFF)->count();

        // 1. Profile hub
        $me = $this->hit(fn () => $auth->me($this->req($rider, 'GET')))['body']['data']['rider'] ?? [];
        $this->check('profile hub (linked rider)', $me['hub']['name'] ?? 'null', 'CHECK Drop Hub', $me['hub']['address'] ?? '');
        $this->check('profile courier company', ($me['courier_company'] ?? null) !== null ? 'yes' : 'no', 'yes', (string) ($me['courier_company'] ?? ''));
        $meB = $this->hit(fn () => $auth->me($this->req($otherRider, 'GET')))['body']['data']['rider'] ?? [];
        $this->check('profile hub (no application)', array_key_exists('hub', $meB) ? json_encode($meB['hub']) : 'missing', 'null', 'courier_company ' . json_encode($meB['courier_company'] ?? null));
        $hub->update(['courier_id' => $otherCourier->id]);
        $meX = $this->hit(fn () => $auth->me($this->req($rider, 'GET')))['body']['data']['rider'] ?? [];
        $this->check('profile hub (branch of other courier)', array_key_exists('hub', $meX) ? json_encode($meX['hub']) : 'missing', 'null', 'not shown');
        $hub->update(['courier_id' => $courier->id]);

        // 2. Guards before pickup
        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($rider, 'POST'), $sa->id));
        $this->check('drop before picked_up', $r['status'] . '/' . $drops(), '422/0', $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($otherRider, 'POST'), $sa->id));
        $this->check('drop by other rider', $r['status'] . '/' . $drops(), '404/0', $r['body']['message'] ?? '');

        // 3. Pick up, then drop
        $r = $this->hit(fn () => $pickup->scan($this->req($rider, 'POST', ['waybill_number' => $order->waybill_number]), $sa->id));
        $this->check('rider scan (picked up)', $r['status'], 200, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($otherRider, 'POST'), $sa->id));
        $this->check('drop by other rider (picked up)', $r['status'] . '/' . $drops(), '404/0', $r['body']['message'] ?? '');

        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($rider, 'POST'), $sa->id));
        $this->check('drop at hub', $r['status'], 201, $r['body']['message'] ?? '');
        $scan = ShipmentScan::where('order_id', $order->id)->where('scan_type', RiderPickupController::SCAN_RIDER_DROP_OFF)->first();
        $this->check('scan row: facility / courier', ($scan?->facility_id ?? '-') . '/' . ($scan?->courier_id ?? '-'), "{$hub->id}/{$courier->id}", 'waybill ' . ($scan?->waybill_number ?? '-'));
        $this->check('scan row: scanned_by / type', ($scan?->scanned_by ?? '-') . '/' . ($scan?->scan_type ?? '-'), "{$personnel->name}/rider_drop_off", (string) ($scan?->notes ?? ''));
        $this->check('response hub', $r['body']['data']['hub']['name'] ?? '-', 'CHECK Drop Hub', (string) ($r['body']['data']['dropped_at'] ?? ''));

        // 4. Idempotent
        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($rider, 'POST'), $sa->id));
        $this->check('drop again (idempotent)', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . $drops(), '200/true/1', $r['body']['message'] ?? '');

        // 5. Pickup payloads show the drop
        $show = $this->hit(fn () => $pickup->show($this->req($rider, 'GET'), $sa->id))['body']['data'] ?? [];
        $this->check('GET /pickups/{id} dropped_at_hub', $show['dropped_at_hub']['hub']['name'] ?? 'null', 'CHECK Drop Hub', '');
        $list = collect($this->hit(fn () => $pickup->index($this->req($rider, 'GET')))['body']['data'] ?? [])->firstWhere('id', $sa->id);
        $this->check('GET /pickups list dropped_at_hub', $list ? ($list['dropped_at_hub'] !== null ? 'set' : 'null') : 'not listed', 'set', '');

        // 6. No hub linked -> 422 (fresh state: remove the drop row first)
        ShipmentScan::whereKey($scan->id)->delete();
        $application->update(['assigned_branch_id' => null]);
        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($rider, 'POST'), $sa->id));
        $this->check('drop with no hub linked', $r['status'] . '/' . $drops(), '422/0', $r['body']['message'] ?? '');
        $application->update(['assigned_branch_id' => $hub->id]);

        // 7. Hub already received the parcel -> nothing written
        ShipmentScan::create([
            'order_id' => $order->id, 'waybill_number' => $order->waybill_number, 'courier_id' => $courier->id,
            'facility_id' => $hub->id, 'scan_type' => 'received', 'scanned_by' => 'CHECK hub staff',
        ]);
        $r = $this->hit(fn () => $pickup->dropAtHub($this->req($rider, 'POST'), $sa->id));
        $this->check('drop after hub received', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . $drops(), '200/true/0', $r['body']['message'] ?? '');
        $this->check('pickup still picked_up', ShipmentAssignment::whereKey($sa->id)->value('pickup_status'), 'picked_up', '');
    }

    private function makeRider(User $courier, string $tag): array
    {
        $user = new User();
        $user->forceFill([
            'name' => "Hub Drop Test {$tag}", 'first_name' => 'Hub', 'last_name' => "Test {$tag}",
            'email' => "hub-drop.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password' => Str::random(32), 'account_type' => 'logistics', 'role' => 'rider',
            'status' => 'approved', 'verification_status' => 'verified',
        ])->save();
        $personnel = CourierPersonnel::create([
            'courier_id' => $courier->id, 'user_id' => $user->id,
            'name' => "Hub Drop Rider {$tag}", 'role' => 'rider', 'status' => 'active',
        ]);
        return [$user, $personnel];
    }

    private function hit(\Closure $fn): array
    {
        try {
            /** @var JsonResponse $res */
            $res = $fn();
            return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
        } catch (ValidationException $e) {
            return ['status' => 422, 'body' => ['message' => $e->getMessage()]];
        }
    }

    private function req(User $user, string $method, array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function counts(): array
    {
        $t = ['shipment_scans', 'shipment_assignments', 'shipment_assignment_history', 'riders', 'users',
              'courier_personnel', 'courier_facilities', 'rider_earnings'];
        return collect($t)->mapWithKeys(fn ($x) => [$x => DB::table($x)->count()])->all();
    }

    private function check(string $label, $got, $expected, string $note): void
    {
        $ok = (string) $got === (string) $expected;
        if (! $ok) {
            $this->failed++;
        }
        $this->rows[] = [$label, $got . ($ok ? '' : '  ✗'), $expected, Str::limit($note, 70)];
    }
}
