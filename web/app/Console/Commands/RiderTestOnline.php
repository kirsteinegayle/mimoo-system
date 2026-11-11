<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\CourierDeliveryController;
use App\Http\Controllers\Api\RiderAuthController;
use App\Http\Controllers\Api\RiderShiftController;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * Rollback-only: rider online status (check-in / check-out) and the
 * readyRiders() filter used by delivery-riders and delivery assignment.
 * Uses fixture couriers/riders only.
 *
 *   php artisan rider:test-online
 */
class RiderTestOnline extends Command
{
    protected $signature = 'rider:test-online';

    protected $description = 'Rollback-only: rider check-in/out, own row only, idempotent, readyRiders online filter';

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

        $this->check('rollback: unchanged', json_encode($this->counts()) === json_encode($before) ? 'yes' : 'NO', 'yes', json_encode($before));

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
        $shift    = app(RiderShiftController::class);
        $delivery = app(CourierDeliveryController::class);

        foreach (['rider-app/check-in', 'rider-app/check-out'] as $uri) {
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === "api/{$uri}" && in_array('POST', $r->methods(), true));
            $mw = $route ? $route->gatherMiddleware() : [];
            $this->check("route POST {$uri}", $route && in_array('auth:sanctum', $mw, true) && in_array('rider.role', $mw, true) ? 'yes' : 'NO', 'yes', implode(',', $mw));
        }

        // Fixtures: courier A (riders r1, r2, unapproved r4), courier B (rider r3)
        $courierA = $this->makeUser('courier.a', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified']);
        $courierB = $this->makeUser('courier.b', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'approved', 'verification_status' => 'verified']);
        [$r1, $p1] = $this->makeRider('r1', $courierA);
        [$r2, $p2] = $this->makeRider('r2', $courierA);
        [$r3, $p3] = $this->makeRider('r3', $courierB);
        [$r4, $p4] = $this->makeRider('r4', $courierA, ['status' => 'pending']);
        $app1 = $this->makeApplication($r1, $courierA);

        // 1. Everyone offline by default → clear empty list
        $list = $this->riders($delivery, $courierA);
        $this->check('default: all offline', ($list['ids'] === [] ? 'empty' : implode(',', $list['ids'])) . ' / ' . ($list['message'] ?? '-'), 'empty / No riders are online right now.', '');

        // 2. Check-in (own row) + idempotent repeat
        $r = $this->hit(fn () => $shift->checkIn($this->req($r1)));
        $this->check('r1 check-in', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . json_encode($r['body']['data']['is_online'] ?? null), '200/false/true', $r['body']['message'] ?? '');
        $firstAt = CourierPersonnel::find($p1->id)->last_checked_in_at?->toIso8601String();
        $this->check('r1 last_checked_in_at set', $firstAt ? 'yes' : 'NO', 'yes', (string) $firstAt);
        $this->check('r1 application mirrored', (int) Rider::find($app1->id)->is_available_for_delivery, 1, 'riders.is_available_for_delivery');
        $r = $this->hit(fn () => $shift->checkIn($this->req($r1)));
        $this->check('r1 check-in again', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null), '200/true', $r['body']['message'] ?? '');
        $this->check('repeat keeps last_checked_in_at', CourierPersonnel::find($p1->id)->last_checked_in_at?->toIso8601String() === $firstAt ? 'yes' : 'NO', 'yes', '');
        $this->check('r2 untouched by r1', (int) CourierPersonnel::find($p2->id)->is_online, 0, '');

        // 3. readyRiders: approved + same courier + online only
        $this->hit(fn () => $shift->checkIn($this->req($r3)));   // other courier, online
        $this->hit(fn () => $shift->checkIn($this->req($r4)));   // unapproved user, online
        $list = $this->riders($delivery, $courierA);
        $this->check('A list = r1 only', implode(',', $list['ids']), (string) $p1->id, "r2 offline, r3 other courier, r4 unapproved (#{$p4->id})");
        $this->check('B list = r3 only', implode(',', $this->riders($delivery, $courierB)['ids']), (string) $p3->id, '');
        $this->check('readyRiders(A) has r1', $this->ready($delivery, $courierA, $p1) ? 'yes' : 'no', 'yes', 'assign() uses the same query');
        $this->check('readyRiders(A) has offline r2', $this->ready($delivery, $courierA, $p2) ? 'yes' : 'no', 'no', '');
        $this->check('readyRiders(A) has r3', $this->ready($delivery, $courierA, $p3) ? 'yes' : 'no', 'no', '');

        // 4. /me shows status
        $me = app(RiderAuthController::class)->me($this->req($r1))->getData(true)['data']['rider'] ?? [];
        $this->check('/me is_online', json_encode($me['is_online'] ?? null), 'true', (string) ($me['last_checked_in_at'] ?? ''));

        // 5. Check-out: r1 offline, r2 online → list = r2
        $this->hit(fn () => $shift->checkIn($this->req($r2)));
        $r = $this->hit(fn () => $shift->checkOut($this->req($r1)));
        $this->check('r1 check-out', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null) . '/' . json_encode($r['body']['data']['is_online'] ?? null), '200/false/false', $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $shift->checkOut($this->req($r1)));
        $this->check('r1 check-out again', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? null), '200/true', '');
        $this->check('r1 application mirrored off', (int) Rider::find($app1->id)->is_available_for_delivery, 0, '');
        $this->check('r2 still online', (int) CourierPersonnel::find($p2->id)->is_online, 1, '');
        $this->check('A list after check-out', implode(',', $this->riders($delivery, $courierA)['ids']), (string) $p2->id, 'offline r1 not listed');

        // 6. Inactive personnel cannot check in
        $p2->update(['status' => 'inactive', 'is_online' => false]);
        $r = $this->hit(fn () => $shift->checkIn($this->req($r2)));
        $this->check('inactive personnel check-in', $r['status'], 404, $r['body']['message'] ?? '');
        $this->check('A list: nobody online', count($this->riders($delivery, $courierA)['ids']), 0, '');
    }

    private function riders(CourierDeliveryController $c, User $courier): array
    {
        $body = $c->riders($this->req($courier))->getData(true);
        return ['ids' => array_column($body['data'] ?? [], 'personnel_id'), 'message' => $body['meta']['message'] ?? null];
    }

    private function ready(CourierDeliveryController $c, User $courier, CourierPersonnel $p): bool
    {
        $m = new \ReflectionMethod($c, 'readyRiders');
        $m->setAccessible(true);
        return $m->invoke($c, $courier->id)->whereKey($p->id)->exists();
    }

    private function makeRider(string $tag, User $courier, array $userAttrs = []): array
    {
        $u = $this->makeUser($tag, array_merge(['account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved', 'verification_status' => 'verified'], $userAttrs));
        $p = CourierPersonnel::create(['courier_id' => $courier->id, 'user_id' => $u->id, 'name' => "Online Test {$tag}", 'role' => 'rider', 'status' => 'active']);
        return [$u, $p];
    }

    private function makeApplication(User $u, User $courier): Rider
    {
        return Rider::create([
            'first_name' => 'Online', 'last_name' => 'Check', 'birthdate' => '1995-01-01', 'gender' => 'male',
            'contact_number' => '09001112222', 'email' => $u->email, 'rider_id' => Rider::generateRiderId(),
            'username' => 'onl' . Str::lower(Str::random(8)), 'password' => Hash::make(Str::random(16)),
            'courier_company_id' => $courier->id, 'employment_status' => 'active', 'service_areas' => ['Santa Cruz'],
            'vehicle_type' => 'motorcycle', 'plate_number' => 'ONL 1', 'region' => 'CHECK', 'city_municipality' => 'Santa Cruz',
            'barangay' => 'CHECK', 'government_id' => 'check/none.jpg', 'verification_status' => 'approved',
            'privacy_policy_accepted' => true, 'privacy_accepted_at' => now(),
        ]);
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'     => "Online Test {$tag}",
            'email'    => "online-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password' => Str::random(32),
        ], $attrs))->save();
        return $user;
    }

    private function hit(\Closure $fn): array
    {
        /** @var JsonResponse $res */
        $res = $fn();
        return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
    }

    private function req(User $user, string $method = 'POST'): Request
    {
        $r = Request::create('/check', $method);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function counts(): array
    {
        return [
            'users'             => DB::table('users')->count(),
            'riders'            => DB::table('riders')->count(),
            'courier_personnel' => DB::table('courier_personnel')->count(),
            'online'            => DB::table('courier_personnel')->where('is_online', true)->count(),
            'personnel_updated' => (string) DB::table('courier_personnel')->max('updated_at'),
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
