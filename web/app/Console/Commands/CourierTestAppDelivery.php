<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\CourierAppAccountController;
use App\Http\Controllers\Api\CourierDeliveryController;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\Rider;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests for the courier app Delivery Management, read-only
 * Rider Management, profile and change password (/api/courier-app/*).
 * Fixture couriers / riders / orders only; ONE transaction, ALWAYS rolled back.
 *
 *   php artisan courier:test-app-delivery
 */
class CourierTestAppDelivery extends Command
{
    protected $signature = 'courier:test-app-delivery';

    protected $description = 'Rollback-only: courier app delivery list/assign, awaiting pickup, other courier, offline rider, rider list, profile, change password';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $before = $this->counts();

        DB::beginTransaction();
        try {
            $this->runTests();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
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
        $del = app(CourierDeliveryController::class);
        $acc = app(CourierAppAccountController::class);

        foreach (['GET delivery-orders', 'GET delivery-riders', 'POST delivery-jobs', 'GET riders', 'GET profile', 'POST profile/change-password'] as $r) {
            [$m, $uri] = explode(' ', $r);
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($x) => $x->uri() === "api/courier-app/{$uri}" && in_array($m, $x->methods(), true));
            $mw = $route ? $route->gatherMiddleware() : [];
            $this->check("route {$r}", $route && in_array('courier.role', $mw, true) && in_array('auth:sanctum', $mw, true) ? 'yes' : 'NO', 'yes', implode(',', $mw));
        }

        // Fixtures
        $plain    = 'OldPass!' . Str::random(8) . '9a';
        $courierA = $this->makeUser('courier.a', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified', 'company_name' => 'Test Courier A', 'password' => Hash::make($plain)]);
        $courierB = $this->makeUser('courier.b', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified', 'company_name' => 'Test Courier B']);
        $buyer    = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        [$rOn, $pOn]   = $this->rider($courierA, 'online', true);
        [, $pOff]      = $this->rider($courierA, 'offline', false);
        [, $pB]        = $this->rider($courierB, 'otherco', true);
        $this->application($rOn, $courierA);

        $oReady  = $this->order($buyer, $courierA, 'picked_up');
        $oReady2 = $this->order($buyer, $courierA, 'picked_up');
        $oWait   = $this->order($buyer, $courierA, 'scheduled');
        $oOther  = $this->order($buyer, $courierB, 'picked_up');
        $this->check('fixture: 2 couriers, 3 riders, 4 orders', 'ok', 'ok', "courier A #{$courierA->id}");

        // 1. Delivery list (own orders only)
        $list = $this->byId($this->hit(fn () => $del->orders($this->req($courierA, 'GET')))['body']['data'] ?? []);
        $this->check('list: own orders only', implode(',', array_keys($list)), implode(',', [$oWait->id, $oReady2->id, $oReady->id]), "other courier order #{$oOther->id} not listed");
        $this->check('list: picked up = assignable', json_encode($list[$oReady->id]['assignable'] ?? null) . '/' . json_encode($list[$oReady->id]['picked_up'] ?? null), 'true/true', '');
        $this->check('list: awaiting pickup', json_encode($list[$oWait->id]['assignable'] ?? null) . '/' . json_encode($list[$oWait->id]['picked_up'] ?? null) . '/' . ($list[$oWait->id]['pickup_status'] ?? '-'), 'false/false/scheduled', 'app shows "Awaiting pickup", no button');

        // 2. Rider picker: online riders of this courier only
        $riders = array_column($this->hit(fn () => $del->riders($this->req($courierA, 'GET')))['body']['data'] ?? [], 'personnel_id');
        $this->check('delivery-riders: online own only', implode(',', $riders), (string) $pOn->id, "offline #{$pOff->id}, other courier #{$pB->id} hidden");

        // 3. Assign
        $r = $this->hit(fn () => $del->assign($this->req($courierA, 'POST', ['order_id' => $oReady->id, 'personnel_id' => $pOn->id])));
        $this->check('assign ready order -> online rider', $r['status'], 201, $r['body']['message'] ?? '');
        $row = $this->byId($this->hit(fn () => $del->orders($this->req($courierA, 'GET')))['body']['data'] ?? [])[$oReady->id] ?? [];
        $this->check('list after assign', json_encode($row['assignable'] ?? null) . '/' . ($row['job']['rider_name'] ?? '-'), 'false/' . $pOn->name, 'job ' . ($row['job']['status'] ?? '-'));
        $r = $this->hit(fn () => $del->assign($this->req($courierA, 'POST', ['order_id' => $oWait->id, 'personnel_id' => $pOn->id])));
        $this->check('assign awaiting-pickup order', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $del->assign($this->req($courierA, 'POST', ['order_id' => $oReady2->id, 'personnel_id' => $pOff->id])));
        $this->check('assign offline rider', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $del->assign($this->req($courierA, 'POST', ['order_id' => $oReady2->id, 'personnel_id' => $pB->id])));
        $this->check("assign other courier's rider", $r['status'], 404, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $del->assign($this->req($courierB, 'POST', ['order_id' => $oReady2->id, 'personnel_id' => $pB->id])));
        $this->check("courier B assigns A's order", $r['status'], 403, $r['body']['message'] ?? '');
        $this->check('no extra jobs', DeliveryJob::whereIn('order_id', [$oReady2->id, $oWait->id])->count(), 0, '');

        // 4. Rider Management (read-only, own riders only)
        $rm = $this->hit(fn () => $acc->riders($this->req($courierA, 'GET')));
        $byP = collect($rm['body']['data'] ?? [])->keyBy('personnel_id');
        $this->check('riders: own only', $byP->keys()->sort()->implode(','), collect([$pOn->id, $pOff->id])->sort()->implode(','), "other courier #{$pB->id} hidden");
        $on = $byP[$pOn->id] ?? [];
        $this->check('riders: online rider row', json_encode($on['is_online'] ?? null) . '/' . json_encode($on['approved'] ?? null) . '/' . ($on['vehicle_type'] ?? '-') . '/' . ($on['plate_number'] ?? '-') . '/' . ($on['active_delivery_jobs'] ?? '-'), 'true/true/motorcycle/TAD 1/1', '');
        $this->check('riders: offline rider', json_encode($byP[$pOff->id]['is_online'] ?? null), 'false', '');
        $this->check('riders: meta online/total', ($rm['body']['meta']['online'] ?? '?') . '/' . ($rm['body']['meta']['total'] ?? '?'), '1/2', $rm['body']['meta']['note'] ?? '');

        // 5. Profile
        $pf = $this->hit(fn () => $acc->profile($this->req($courierA, 'GET')));
        $this->check('profile', $pf['status'] . '/' . ($pf['body']['data']['company_name'] ?? '-') . '/' . ($pf['body']['data']['email'] ?? '-'), "200/Test Courier A/{$courierA->email}", '');

        // 6. Change password
        $courierA->createToken('test-app');
        $new = 'NewPass!' . Str::random(8) . '7b';
        $r = $this->hit(fn () => $acc->changePassword($this->req($courierA, 'POST', ['current_password' => 'wrong-' . $plain, 'password' => $new, 'password_confirmation' => $new])));
        $this->check('change-password: wrong current', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $acc->changePassword($this->req($courierA, 'POST', ['current_password' => $plain, 'password' => $new, 'password_confirmation' => $new . 'x'])));
        $this->check('change-password: confirmation mismatch', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $acc->changePassword($this->req($courierA, 'POST', ['current_password' => $plain, 'password' => $new, 'password_confirmation' => $new])));
        $this->check('change-password: ok', $r['status'], 200, $r['body']['message'] ?? '');
        $fresh = User::find($courierA->id);
        $this->check('new password hashed + works', (Hash::check($new, $fresh->password) && $fresh->password !== $new) ? 'yes' : 'NO', 'yes', '');
        $this->check('old password no longer works', Hash::check($plain, $fresh->password) ? 'NO' : 'yes', 'yes', '');
        $this->check('tokens revoked', $fresh->tokens()->count(), 0, '');
    }

    private function byId(array $rows): array
    {
        $out = [];
        foreach ($rows as $r) {
            $out[$r['id']] = $r;
        }
        return $out;
    }

    private function rider(User $courier, string $tag, bool $online): array
    {
        $u = $this->makeUser($tag, ['account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved', 'verification_status' => 'verified']);
        $p = CourierPersonnel::create(['courier_id' => $courier->id, 'user_id' => $u->id, 'name' => "App Test {$tag}",
            'role' => 'rider', 'status' => 'active', 'is_online' => $online, 'last_checked_in_at' => $online ? now() : null]);
        return [$u, $p];
    }

    private function application(User $u, User $courier): void
    {
        Rider::create([
            'first_name' => 'App', 'last_name' => 'Test', 'birthdate' => '1995-01-01', 'gender' => 'male',
            'contact_number' => '09001112222', 'email' => $u->email, 'rider_id' => Rider::generateRiderId(),
            'username' => 'tad' . Str::lower(Str::random(8)), 'password' => Hash::make(Str::random(16)),
            'courier_company_id' => $courier->id, 'employment_status' => 'active', 'service_areas' => ['Santa Cruz'],
            'vehicle_type' => 'motorcycle', 'plate_number' => 'TAD 1', 'region' => 'CHECK', 'city_municipality' => 'Santa Cruz',
            'barangay' => 'CHECK', 'government_id' => 'check/none.jpg', 'verification_status' => 'approved',
            'privacy_policy_accepted' => true, 'privacy_accepted_at' => now(),
        ]);
    }

    private function order(User $buyer, User $courier, string $pickupStatus): Order
    {
        $o = Order::create([
            'buyer_id' => $buyer->id, 'status' => 'in_transit', 'total' => 250, 'payment_method' => 'cod',
            'shipping_name' => 'App Test', 'shipping_address' => 'Test St', 'shipping_phone' => '09000000000',
            'waybill_number' => 'MIMWB-APP-' . strtoupper(Str::random(8)), 'waybill_generated_at' => now(),
            'assigned_courier_id' => $courier->id,
        ]);
        ShipmentAssignment::create([
            'order_id' => $o->id, 'courier_id' => $courier->id, 'assigned_by' => $courier->id, 'assigned_at' => now(),
            'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted', 'accepted_at' => now(),
            'pickup_status' => $pickupStatus,
        ]);
        return $o;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'     => "App Test {$tag}",
            'email'    => "app-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password' => Str::random(32),
        ], $attrs))->save();
        return $user;
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
        app()->instance('request', $r);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function counts(): array
    {
        return [
            'users'                => DB::table('users')->count(),
            'orders'               => DB::table('orders')->count(),
            'shipment_assignments' => DB::table('shipment_assignments')->count(),
            'delivery_jobs'        => DB::table('delivery_jobs')->count(),
            'courier_personnel'    => DB::table('courier_personnel')->count(),
            'riders'               => DB::table('riders')->count(),
            'tokens'               => DB::table('personal_access_tokens')->count(),
            'users_updated_max'    => (string) DB::table('users')->max('updated_at'),
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
