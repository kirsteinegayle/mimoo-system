<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\CourierPickupController;
use App\Http\Controllers\Api\RiderPickupController;
use App\Http\Controllers\Courier\PickupManagementController;
use App\Models\CourierPersonnel;
use App\Models\Order;
use App\Models\RiderEarning;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests for pickup assignment rules (web + courier app share
 * App\Services\PickupAssignmentRules) and the locked re-check in the rider
 * pickup scan. Fixture couriers / riders / orders only; ONE transaction,
 * ALWAYS rolled back.
 *
 *   php artisan courier:test-pickup-assign
 */
class CourierTestPickupAssign extends Command
{
    protected $signature = 'courier:test-pickup-assign';

    protected $description = 'Rollback-only: pickup assign rules (rider + account + status) on web and app, and reassign race on rider scan';

    private array $rows = [];

    private int $failed = 0;

    private ?\Closure $onFindMine = null;

    public function handle(): int
    {
        $before = $this->counts();

        // Fires once on the rider scan's pre-lock findMine() query (simulates a
        // courier reassign that lands between findMine and the row lock).
        DB::listen(function ($q) {
            if ($this->onFindMine && str_starts_with(strtolower($q->sql), 'select')
                && str_contains($q->sql, 'shipment_assignments') && str_contains($q->sql, 'assigned_personnel_id')
                && ! str_contains(strtolower($q->sql), 'for update')) {
                $fn = $this->onFindMine;
                $this->onFindMine = null;
                $fn();
            }
        });

        DB::beginTransaction();
        try {
            $this->runTests();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
            Auth::forgetUser();
        }

        $this->check('rollback: counts unchanged', json_encode($this->counts()) === json_encode($before) ? 'yes' : 'NO', 'yes', json_encode($before));

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(): void
    {
        $web = app(PickupManagementController::class);
        $app = app(CourierPickupController::class);

        // ── Fixtures ────────────────────────────────────────────────────────
        $ready = ['account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved', 'verification_status' => 'verified'];
        $courierA = $this->makeUser('courier.a', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified']);
        $courierB = $this->makeUser('courier.b', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified']);
        $buyer    = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);

        [$r1, $p1] = $this->personnel($courierA, 'rider1', 'rider', $ready);
        [$r2, $p2] = $this->personnel($courierA, 'rider2', 'rider', $ready);
        [, $pDriver] = $this->personnel($courierA, 'driver', 'driver', $ready);
        [, $pStaff]  = $this->personnel($courierA, 'staff', 'staff', null);
        [, $pNoUser] = $this->personnel($courierA, 'nouser', 'rider', null);
        [, $pUnver]  = $this->personnel($courierA, 'unverified', 'rider', ['verification_status' => 'unverified'] + $ready);
        [, $pInact]  = $this->personnel($courierA, 'inactive', 'rider', $ready, 'inactive');
        [, $pOther]  = $this->personnel($courierB, 'otherco', 'rider', $ready);

        $sa = [];
        foreach (['pending_pickup', 'scheduled', 'failed', 'cancelled', 'race'] as $k) {
            $sa[$k] = $this->pickup($courierA, $buyer, $k === 'race' ? 'scheduled' : $k, $p1->id);
        }
        $this->check('fixture: 2 couriers, 8 personnel, 5 pickups', 'ok', 'ok', "courier A #{$courierA->id}");

        Auth::setUser($courierA);
        $both = function (string $label, ShipmentAssignment $a, CourierPersonnel $p, string $expect) use ($web, $app, $courierA) {
            $before = ShipmentAssignment::whereKey($a->id)->value('assigned_personnel_id');
            $w = $this->invoke(fn () => $web->assignPersonnel($this->req($courierA, ['personnel_id' => $p->id]), $a->id));
            $after = ShipmentAssignment::whereKey($a->id)->value('assigned_personnel_id');
            if ((int) $after !== (int) $before) {
                ShipmentAssignment::whereKey($a->id)->update(['assigned_personnel_id' => $before]); // reset for the app call
            }
            $x = $this->invoke(fn () => $app->assignPersonnel($this->req($courierA, ['personnel_id' => $p->id]), $a->id));
            $this->check("{$label} (web)", $w['status'], $expect, $w['body']['message'] ?? '');
            $this->check("{$label} (app)", $x['status'], $expect, $x['body']['message'] ?? '');
            if ($expect !== '200') {
                $this->check("{$label}: unchanged", (int) ShipmentAssignment::whereKey($a->id)->value('assigned_personnel_id'), (int) $before, '');
            }
            return [$w, $x];
        };

        // (a) non-rider personnel
        $both('(a) driver', $sa['scheduled'], $pDriver, '422');
        $both('(a) staff', $sa['scheduled'], $pStaff, '422');
        // (b) no rider-app account / account not active
        $both('(b) rider without user_id', $sa['scheduled'], $pNoUser, '422');
        $both('(b) rider user not verified', $sa['scheduled'], $pUnver, '422');
        $both('inactive personnel', $sa['scheduled'], $pInact, '404');
        // (e) other courier's personnel
        $both('(e) other courier personnel', $sa['scheduled'], $pOther, '404');
        // (d) assignable statuses
        foreach (['pending_pickup', 'scheduled', 'failed'] as $k) {
            [$w] = $both("(d) {$k} -> rider2", $sa[$k], $p2, '200');
            $this->check("(d) {$k}: assigned to rider2", (int) ShipmentAssignment::whereKey($sa[$k]->id)->value('assigned_personnel_id'), $p2->id, 'web shape success=' . json_encode($w['body']['success'] ?? null));
        }
        // cancelled → 422
        [$w] = $both('cancelled pickup', $sa['cancelled'], $p2, '422');
        $this->check('web 422 shape', json_encode($w['body']['success'] ?? null) . '|' . (isset($w['body']['message']) ? 'message' : '-'), 'false|message', '');
        // courier B cannot touch courier A's pickup
        Auth::setUser($courierB);
        $r = $this->invoke(fn () => $app->assignPersonnel($this->req($courierB, ['personnel_id' => $pOther->id]), $sa['scheduled']->id));
        $this->check("courier B on A's pickup (app)", $r['status'], 404, $r['body']['message'] ?? '');
        Auth::setUser($courierA);

        // (f) reassign lands between findMine() and the lock → old rider gets nothing
        $race  = $sa['race'];
        $wb    = Order::whereKey($race->order_id)->value('waybill_number');
        $scan  = app(RiderPickupController::class);
        $earn  = fn () => RiderEarning::where('shipment_assignment_id', $race->id)->count();
        $this->onFindMine = fn () => DB::table('shipment_assignments')->where('id', $race->id)->update(['assigned_personnel_id' => $p2->id]);
        $r = $this->invoke(fn () => $scan->scan($this->riderReq($r1, ['waybill_number' => $wb]), $race->id));
        $this->check('(f) hook fired (reassigned mid-scan)', $this->onFindMine === null ? 'yes' : 'NO', 'yes', '');
        $this->check('(f) old rider scan after reassign', $r['status'], 404, $r['body']['message'] ?? '');
        $this->check('(f) no picked_up / no earning', ShipmentAssignment::whereKey($race->id)->value('pickup_status') . '/' . $earn(), 'scheduled/0', '');

        // (g) the new rider scans → picked up + ₱20
        $r = $this->invoke(fn () => $scan->scan($this->riderReq($r2, ['waybill_number' => $wb]), $race->id));
        $this->check('(g) new rider scan', $r['status'] . '/' . json_encode($r['body']['earned'] ?? null), '200/' . json_encode(RiderEarning::PICKUP_RATE), $r['body']['message'] ?? '');
        $e = RiderEarning::where('shipment_assignment_id', $race->id)->first();
        $this->check('(g) earning rider / amount', ($e?->rider_user_id ?? '-') . '/' . ($e?->amount ?? '-'), "{$r2->id}/" . number_format(RiderEarning::PICKUP_RATE, 2, '.', ''), '');
        $this->check('(g) old rider has no earning', RiderEarning::where('rider_user_id', $r1->id)->count(), 0, '');
        $r = $this->invoke(fn () => $scan->scan($this->riderReq($r1, ['waybill_number' => $wb]), $race->id));
        $this->check('(g) old rider scans again', $r['status'], 404, 'not "already confirmed"');

        // (c) picked_up pickup cannot be reassigned (web + app)
        [$w, $x] = $both('(c) picked_up pickup', $race, $p1, '422');
        $this->check('(c) message', $x['body']['message'] ?? '-', 'Pickup already picked up; cannot reassign.', '');
    }

    /** Runs a controller call; 404 / 422 exceptions become status rows. */
    private function invoke(\Closure $fn): array
    {
        try {
            /** @var JsonResponse $res */
            $res = $fn();
            return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
        } catch (ModelNotFoundException $e) {
            return ['status' => 404, 'body' => ['message' => 'Not found (ModelNotFound)']];
        } catch (ValidationException $e) {
            return ['status' => 422, 'body' => ['message' => $e->getMessage()]];
        }
    }

    private function req(User $user, array $data): Request
    {
        $r = Request::create('/check', 'POST', $data);
        app()->instance('request', $r);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function riderReq(User $user, array $data): Request
    {
        return $this->req($user, $data);
    }

    private function personnel(User $courier, string $tag, string $role, ?array $userAttrs, string $status = 'active'): array
    {
        $user = $userAttrs ? $this->makeUser($tag, $userAttrs) : null;
        $p = CourierPersonnel::create([
            'courier_id' => $courier->id, 'user_id' => $user?->id, 'name' => "Assign Test {$tag}",
            'role' => $role, 'status' => $status,
        ]);
        return [$user, $p];
    }

    private function pickup(User $courier, User $buyer, string $status, int $personnelId): ShipmentAssignment
    {
        $order = Order::create([
            'buyer_id' => $buyer->id, 'status' => 'packed', 'total' => 100, 'payment_method' => 'cod',
            'shipping_name' => 'Assign Test', 'shipping_address' => 'Test St', 'shipping_phone' => '09000000000',
            'waybill_number' => 'MIMWB-ASSIGN-' . strtoupper(Str::random(8)), 'waybill_generated_at' => now(),
        ]);
        return ShipmentAssignment::create([
            'order_id' => $order->id, 'courier_id' => $courier->id, 'assigned_by' => $courier->id,
            'assigned_at' => now(), 'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted',
            'accepted_at' => now(), 'pickup_status' => $status, 'assigned_personnel_id' => $personnelId,
        ]);
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'     => "Assign Test {$tag}",
            'email'    => "assign-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password' => Str::random(32),
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'users'                => DB::table('users')->count(),
            'courier_personnel'    => DB::table('courier_personnel')->count(),
            'orders'               => DB::table('orders')->count(),
            'shipment_assignments' => DB::table('shipment_assignments')->count(),
            'rider_earnings'       => DB::table('rider_earnings')->count(),
            'sa_updated_max'       => (string) DB::table('shipment_assignments')->max('updated_at'),
        ];
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
