<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\ShipmentAssignment;
use App\Models\User;
use App\Services\BranchAssignService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Rollback-only test of the courier app "New Assign" per branch:
 * branch grouping (seller city → coverage, parcel → current facility),
 * riders only from their own branch, other companies 404, role gate.
 *
 *   php artisan courier:test-branch-assign
 */
class CourierTestBranchAssign extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'courier:test-branch-assign';

    protected $description = 'Rollback-only: courier app New Assign per branch (grouping, branch-only riders, isolation)';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'courier_personnel', 'courier_facilities', 'riders', 'delivery_jobs',
        ]);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }

        // ── unit: city normalisation ────────────────────────────────────────
        $this->check('normCity "City of Calamba" = "Calamba City" = "calamba"',
            BranchAssignService::normCity('City of Calamba') . '|' . BranchAssignService::normCity('Calamba City') . '|' . BranchAssignService::normCity(' calamba '), 'calamba|calamba|calamba', '');

        // ── fixtures ────────────────────────────────────────────────────────
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified'];
        $c1 = $this->makeUser('courier.1', $co);
        $c2 = $this->makeUser('courier.2', $co);
        $hub = $this->makeUser('hub', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c1->id]);
        $buyer = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $sellerA = $this->makeUser('seller.a', ['account_type' => 'seller', 'role' => 'seller', 'municipality_city' => 'Lumban', 'province' => 'Laguna']);
        $sellerX = $this->makeUser('seller.x', ['account_type' => 'seller', 'role' => 'seller', 'municipality_city' => 'Nowhere Town', 'province' => 'Laguna']);
        $sellerC = $this->makeUser('seller.c', ['account_type' => 'seller', 'role' => 'seller', 'municipality_city' => 'Calamba', 'province' => 'Laguna']);

        $fac = fn (string $name, string $type, string $city, array $cov) => CourierFacility::create([
            'courier_id' => $c1->id, 'facility_name' => $name, 'facility_code' => 'BT-' . Str::upper(Str::random(6)), 'facility_type' => $type,
            'status' => 'Active', 'region' => 'CALABARZON', 'province' => 'Laguna', 'city' => $city, 'address' => 'Test',
            'manager_name' => 'Test', 'contact_number' => '09000000000', 'coverage_cities' => $cov,
        ]);
        $brA = $fac('BT Branch A', 'Branch', 'Lumban', ['Lumban', 'Majayjay']);
        $brB = $fac('BT Branch B', 'Branch', 'Pila', ['Pila']);
        $hubC = $fac('BT Calamba Hub', 'Sorting Hub', 'City of Calamba', ['City of Calamba']);

        $rider = function (string $tag, ?CourierFacility $branch, bool $online = true) use ($c1) {
            $u = $this->makeUser($tag, ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
            $p = CourierPersonnel::create(['courier_id' => $c1->id, 'user_id' => $u->id, 'name' => "BT {$tag}", 'role' => 'rider', 'status' => 'active', 'is_online' => $online, 'last_checked_in_at' => now()]);
            $this->riderRow($u, $c1->id, $branch?->id);
            return $p;
        };
        $rA = $rider('rider.a', $brA);
        $rB = $rider('rider.b', $brB);
        $rNone = $rider('rider.none', null);

        $assignment = function ($order, string $pickup) use ($c1) {
            return ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id, 'assigned_at' => now(),
                'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted', 'accepted_at' => now(), 'pickup_status' => $pickup]);
        };
        [$o1] = $this->makeOrder($buyer, $sellerA, $p, 'in_transit');      // pickup → Branch A
        $a1 = $assignment($o1, 'pending_pickup');
        [$o2] = $this->makeOrder($buyer, $sellerX, $p, 'in_transit');      // pickup → no branch
        $a2 = $assignment($o2, 'scheduled');
        [$o4] = $this->makeOrder($buyer, $sellerC, $p, 'in_transit');      // pickup → Calamba hub ("Calamba" vs "City of Calamba")
        $assignment($o4, 'pending_pickup');
        [$o3] = $this->makeOrder($buyer, $sellerA, $p, 'in_transit');      // delivery waiting at Branch A
        $assignment($o3, 'picked_up');
        $o3->forceFill(['current_facility_id' => $brA->id])->saveQuietly();

        // ── summary ─────────────────────────────────────────────────────────
        $sum = collect($this->http($c1, 'GET', '/api/courier-app/branch-assign')['body']['data'] ?? []);
        $a = $sum->firstWhere('id', $brA->id);
        $this->check('summary: Branch A new pickups / deliveries / riders', ($a['new_pickups'] ?? '-') . '/' . ($a['deliveries'] ?? '-') . '/' . ($a['riders'] ?? '-'), '1/1/1', '');
        $this->check('summary: Branch B is empty but listed', ($sum->firstWhere('id', $brB->id)['pickups'] ?? '-') . '/' . ($sum->firstWhere('id', $brB->id)['riders'] ?? '-'), '0/1', '');
        $this->check('summary: "City of Calamba" hub gets the Calamba seller', $sum->firstWhere('id', $hubC->id)['pickups'] ?? '-', 1, 'city normalisation');
        $this->check('summary: outside-coverage pickup in "No branch"', $sum->firstWhere('id', 0)['pickups'] ?? 'missing', 1, 'nothing disappears');
        $this->check('summary: branches listed first', $sum->first()['type'] ?? '-', 'Branch', '');

        // ── branch queue ────────────────────────────────────────────────────
        $q = $this->http($c1, 'GET', "/api/courier-app/branch-assign/{$brA->id}")['body']['data'] ?? [];
        $this->check('Branch A: pickup listed as new', json_encode(collect($q['pickups'] ?? [])->map(fn ($x) => [$x['id'], $x['is_new']])->all()), json_encode([[$a1->id, true]]), '');
        $this->check('Branch A: delivery listed', json_encode(collect($q['deliveries'] ?? [])->pluck('order_id')->all()), json_encode([$o3->id]), '');
        $this->check('Branch A: only its own riders', json_encode(collect($q['riders'] ?? [])->pluck('personnel_id')->all()), json_encode([$rA->id]), '');
        $this->check('unknown branch id', $this->http($c1, 'GET', '/api/courier-app/branch-assign/99999999')['status'], 404, '');

        // ── assign pickup ───────────────────────────────────────────────────
        $pick = fn (int $branch, int $id, int $pid) => $this->http($c1, 'POST', "/api/courier-app/branch-assign/{$branch}/pickups/{$id}", ['personnel_id' => $pid]);
        $this->check('pickup: rider of another branch refused', $pick($brA->id, $a1->id, $rB->id)['status'], 422, '');
        $this->check('pickup: rider with no branch refused', $pick($brA->id, $a1->id, $rNone->id)['status'], 422, '');
        $this->check('pickup: item of another branch refused', $pick($brA->id, $a2->id, $rA->id)['status'], 404, '');
        $r = $pick($brA->id, $a1->id, $rA->id);
        $this->check('pickup: own-branch rider assigned', $r['status'] . '/' . ShipmentAssignment::whereKey($a1->id)->value('assigned_personnel_id'), "200/{$rA->id}", $r['body']['message'] ?? '');
        $this->check('pickup: no longer "new" in the summary', collect($this->http($c1, 'GET', '/api/courier-app/branch-assign')['body']['data'])->firstWhere('id', $brA->id)['new_pickups'], 0, '');
        $r = $pick(0, $a2->id, $rNone->id);
        $this->check('pickup: "No branch" work → any company rider', $r['status'], 200, $r['body']['message'] ?? '');

        // ── assign delivery ─────────────────────────────────────────────────
        $del = fn (int $branch, int $oid, int $pid) => $this->http($c1, 'POST', "/api/courier-app/branch-assign/{$branch}/deliveries/{$oid}", ['personnel_id' => $pid]);
        $this->check('delivery: rider of another branch refused', $del($brA->id, $o3->id, $rB->id)['status'], 422, '');
        $this->check('delivery: parcel not at that branch', $del($brB->id, $o3->id, $rB->id)['status'], 404, '');
        $r = $del($brA->id, $o3->id, $rA->id);
        $this->check('delivery: own-branch rider → job created', $r['status'] . '/' . DeliveryJob::where('order_id', $o3->id)->value('personnel_id'), "201/{$rA->id}", $r['body']['message'] ?? '');
        $this->check('delivery: second assign refused (not waiting anymore)', $del($brA->id, $o3->id, $rA->id)['status'], 404, '');

        // ── dashboard Quick Actions counts + Recent Activity (#5) ────────────
        $dash = $this->http($c1, 'GET', '/api/courier-app/dashboard')['body']['data'] ?? [];
        $this->check('dashboard: new_pickups_unassigned / deliveries_waiting', ($dash['new_pickups_unassigned'] ?? '-') . '/' . ($dash['deliveries_waiting'] ?? '-'),
            '1/0', 'only the Calamba pickup is still unassigned; o3 got a job');
        $this->check('dashboard: online_riders', $dash['online_riders'] ?? '-', 3, '');
        $act = collect($this->http($c1, 'GET', '/api/courier-app/activity?limit=50')['body']['data'] ?? []);
        $this->check('activity: rider assignments are logged', ($act->contains('title', 'Pickup rider assigned') ? 'pickup' : '-') . '/' . ($act->contains('title', 'Delivery rider assigned') ? 'delivery' : '-'), 'pickup/delivery', '');
        $this->check('activity: newest first', $act->pluck('at')->all() === $act->pluck('at')->sortDesc()->values()->all() ? 'yes' : 'NO', 'yes', '');
        $this->check('activity: type filter', collect($this->http($c1, 'GET', '/api/courier-app/activity?type=delivery')['body']['data'] ?? [])->pluck('type')->unique()->implode(','), 'delivery', '');
        $this->check('activity: bad type refused', $this->http($c1, 'GET', '/api/courier-app/activity?type=hack')['status'], 422, '');
        $this->check('activity: other company sees none of it', collect($this->http($c2, 'GET', '/api/courier-app/activity?limit=50')['body']['data'] ?? [])->whereIn('order_id', [$o1->id, $o2->id, $o3->id])->count(), 0, '');

        // ── isolation + roles ───────────────────────────────────────────────
        $this->check('other courier company: branch 404', $this->http($c2, 'GET', "/api/courier-app/branch-assign/{$brA->id}")['status'], 404, '');
        $this->check('other courier company: assign 404', $this->http($c2, 'POST', "/api/courier-app/branch-assign/{$brA->id}/pickups/{$a1->id}", ['personnel_id' => $rA->id])['status'], 404, '');
        $this->check('other courier company sees none of c1 work', collect($this->http($c2, 'GET', '/api/courier-app/branch-assign')['body']['data'] ?? [])->sum('pickups'), 0, '');
        $this->check('logistics staff: courier-app is courier-only', $this->http($hub, 'GET', '/api/courier-app/branch-assign')['status'], 403, '');
        $this->check('seller blocked', $this->http($sellerA, 'GET', '/api/courier-app/branch-assign')['status'], 403, '');
    }

    /** riders row (approved application) linking the user's email to a branch; required columns get dummy values. */
    private function riderRow(User $u, int $courierId, ?int $branchId): void
    {
        $row = [
            'email' => $u->email, 'courier_company_id' => $courierId, 'assigned_branch_id' => $branchId,
            'first_name' => 'BT', 'last_name' => 'Rider', 'verification_status' => 'approved', 'employment_status' => 'active',
            'vehicle_type' => 'motorcycle', 'gender' => 'other', 'birthdate' => '1990-01-01',
            'rider_id' => 'BT-' . Str::upper(Str::random(10)), 'username' => 'bt' . Str::lower(Str::random(12)),
            'password' => Str::random(32), 'created_at' => now(), 'updated_at' => now(),
        ];
        foreach (DB::select('SHOW COLUMNS FROM riders') as $col) {
            if (array_key_exists($col->Field, $row) || $col->Null === 'YES' || $col->Default !== null || $col->Extra === 'auto_increment') {
                continue;
            }
            $t = strtolower($col->Type);
            $row[$col->Field] = match (true) {
                str_starts_with($t, 'enum(') => trim(explode(',', substr($t, 5))[0], "')"),
                $t === 'json' || $t === 'longtext' => '[]',
                str_contains($t, 'int') || str_contains($t, 'decimal') => 0,
                str_contains($t, 'date') || str_contains($t, 'time') => now(),
                default => 'BT',
            };
        }
        DB::table('riders')->insert($row);
    }
}
