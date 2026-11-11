<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\CourierDeliveryController;
use App\Http\Controllers\Api\RiderAuthController;
use App\Http\Controllers\Courier\RiderManagementController;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * CHECK: courier approves a rider application -> rider can log in to the rider app.
 *
 * Everything runs inside ONE transaction that is ALWAYS rolled back
 * (test courier facility, riders rows, users row, courier_personnel, tokens).
 * Net effect on the database: none. Passwords are never printed.
 *
 *   php artisan rider-approve:check
 *   php artisan rider-approve:check --courier=391
 */
class RiderApproveCheck extends Command
{
    protected $signature = 'rider-approve:check {--courier= : courier users.id (default: first role=courier user)}';

    protected $description = 'Rollback-only check: rider approval creates a rider-app login, idempotent, buyer email blocked';

    private array $rows = [];

    public function handle(): int
    {
        $courier = $this->option('courier')
            ? User::find((int) $this->option('courier'))
            : User::where('role', 'courier')->orderBy('id')->first();
        if (! $courier) {
            $this->error('No courier user found.');
            return self::FAILURE;
        }
        $buyer = User::where('role', 'buyer')->orderBy('id')->first();
        $this->info("Courier #{$courier->id} ({$courier->email})");

        $before = [
            'riders' => Rider::count(),
            'users' => User::count(),
            'personnel' => CourierPersonnel::count(),
        ];

        $tag = 'rcheck' . Str::lower(Str::random(6));
        $email = "{$tag}@mimoo-check.test";
        $plain = Str::random(16) . 'aA1!';

        DB::beginTransaction();
        try {
            Auth::setUser($courier);
            $mgmt = app(RiderManagementController::class);

            // Fixture: an Active branch of this courier (inside rollback only).
            $branchId = DB::table('courier_facilities')->insertGetId([
                'courier_id' => $courier->id, 'facility_name' => "CHECK {$tag}", 'facility_code' => strtoupper($tag),
                'facility_type' => 'Branch', 'status' => 'Active', 'region' => 'CHECK', 'city' => 'Santa Cruz',
                'address' => 'CHECK', 'manager_name' => 'CHECK', 'contact_number' => '09000000000',
                'coverage_cities' => json_encode(['Santa Cruz']), 'created_at' => now(), 'updated_at' => now(),
            ]);

            // 1. Pending application (same shape as RiderRegistrationController::store).
            $rider = $this->makeRider($email, $tag, Hash::make($plain));
            $res = $mgmt->approve($this->req($courier, ['assigned_branch_id' => $branchId]), $rider->id);
            $this->row('approve pending application', $res->getStatusCode(), 200, $res->getData(true)['message'] ?? json_encode($res->getData(true)));

            $rider->refresh();
            $user = User::where('email', $email)->first();
            $p = $user ? CourierPersonnel::where('user_id', $user->id)->first() : null;
            $this->row('riders row approved/active/branch', $rider->verification_status . '/' . $rider->employment_status . '/' . ($rider->assigned_branch_id == $branchId ? 'branch' : 'no-branch'), 'approved/active/branch', "courier_company_id={$rider->courier_company_id}");
            $this->row('users row role/type/status/verify', $user ? "{$user->role}/{$user->account_type}/{$user->status}/{$user->verification_status}" : 'missing', 'rider/logistics/approved/verified', $user ? "user #{$user->id}" : '');
            $this->row('password hash copied (not rehashed)', $user && $user->password === $rider->password ? 'same' : 'different', 'same', 'Hash::check(registration pw) = ' . ($user && Hash::check($plain, $user->password) ? 'true' : 'false'));
            $this->row('courier_personnel row', $p ? "{$p->status}/{$p->role}/" . ($p->courier_id == $courier->id ? 'own' : 'other') : 'missing', 'active/rider/own', $p ? "personnel #{$p->id} {$p->name}" : '');

            // 2. Rider app login with the registration email + password.
            $login = app(RiderAuthController::class)->login(Request::create('/api/rider-app/login', 'POST', ['email' => $email, 'password' => $plain]));
            $this->row('rider-app login', $login->getStatusCode(), 200, $login->getStatusCode() === 200 ? 'token issued (rolled back)' : ($login->getData(true)['message'] ?? ''));

            // 3. GET /api/courier-app/delivery-riders (lists checked-in riders only: fixture check-in, rolled back)
            $p?->update(['is_online' => true, 'last_checked_in_at' => now()]);
            $list =collect(app(CourierDeliveryController::class)->riders($this->req($courier))->getData(true)['data'] ?? []);
            $mine = $p ? $list->firstWhere('personnel_id', $p->id) : null;
            $this->row('in delivery-riders', $mine ? 'yes' : 'no', 'yes', $list->count() . ' rider(s)');
            $this->row('delivery-riders vehicle_type', $mine['vehicle_type'] ?? 'null', 'motorcycle', 'from riders.vehicle_type');

            // 4. Pickup personnel list (same query as PickupManagementController::index).
            $pickup = CourierPersonnel::where('courier_id', $courier->id)->where('status', 'active')->pluck('id');
            $this->row('in pickup personnel list', $p && $pickup->contains($p->id) ? 'yes' : 'no', 'yes', $pickup->count() . ' active personnel');

            // 5. Second approve: idempotent, no duplicates.
            $res2 = $mgmt->approve($this->req($courier, ['assigned_branch_id' => $branchId]), $rider->id);
            $nUsers = User::where('email', $email)->count();
            $nPers = $user ? CourierPersonnel::where('user_id', $user->id)->count() : 0;
            $this->row('second approve', $res2->getStatusCode(), 200, $res2->getData(true)['message'] ?? '');
            $this->row('no duplicates (users/personnel)', "{$nUsers}/{$nPers}", '1/1', '');

            // 6. Existing buyer email is blocked; buyer untouched.
            if ($buyer) {
                $snap = [$buyer->password, $buyer->role, $buyer->account_type];
                $r2 = $this->makeRider($buyer->email, $tag . 'b', Hash::make($plain));
                $res3 = $mgmt->approve($this->req($courier, ['assigned_branch_id' => $branchId]), $r2->id);
                $buyer->refresh();
                $r2->refresh();
                $this->row('approve with buyer email', $res3->getStatusCode(), 409, $res3->getData(true)['error'] ?? '');
                $this->row('buyer pw/role unchanged', [$buyer->password, $buyer->role, $buyer->account_type] === $snap ? 'yes' : 'no', 'yes', "buyer #{$buyer->id}");
                $this->row('blocked application still pending', $r2->verification_status, 'pending', 'no personnel: ' . (CourierPersonnel::where('user_id', $buyer->id)->exists() ? 'NO' : 'ok'));
            } else {
                $this->row('approve with buyer email', '-', 409, 'skipped: no buyer user');
            }

            // 7. Deactivated personnel cannot log in (same rule reject() relies on).
            if ($p) {
                $p->update(['status' => 'inactive']);
                $login2 = app(RiderAuthController::class)->login(Request::create('/api/rider-app/login', 'POST', ['email' => $email, 'password' => $plain]));
                $this->row('login after personnel inactive', $login2->getStatusCode(), 403, $login2->getData(true)['message'] ?? '');
            }
        } catch (\Throwable $e) {
            $this->row('EXCEPTION', get_class($e), '-', $e->getMessage());
        } finally {
            DB::rollBack();
            Auth::logout();
        }

        $after = [
            'riders' => Rider::count(),
            'users' => User::count(),
            'personnel' => CourierPersonnel::count(),
        ];
        $this->row('rollback: counts unchanged', $after === $before ? 'yes' : 'no', 'yes', json_encode($after));
        $this->row('rollback: test email gone', User::where('email', $email)->exists() || Rider::where('email', $email)->exists() ? 'no' : 'yes', 'yes', '');

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        $failed = collect($this->rows)->filter(fn ($r) => str_contains((string) $r[1], '✗'))->count();
        $failed ? $this->error("{$failed} check(s) failed.") : $this->info('All checks passed. Database unchanged (rolled back).');

        return $failed ? self::FAILURE : self::SUCCESS;
    }

    private function makeRider(string $email, string $tag, string $hash): Rider
    {
        return Rider::create([
            'first_name' => 'Check', 'last_name' => 'Rider ' . $tag, 'birthdate' => '1995-01-01', 'gender' => 'male',
            'contact_number' => '09001112222', 'email' => $email,
            'rider_id' => Rider::generateRiderId(), 'username' => $tag, 'password' => $hash,
            'courier_company_id' => null, 'assigned_branch_id' => null, 'employment_status' => 'inactive',
            'service_areas' => ['Santa Cruz'], 'vehicle_type' => 'motorcycle', 'plate_number' => 'CHK-123',
            'region' => 'CHECK', 'city_municipality' => 'Santa Cruz', 'barangay' => 'CHECK',
            'government_id' => 'check/none.jpg', 'verification_status' => 'pending',
            'privacy_policy_accepted' => true, 'privacy_accepted_at' => now(),
        ]);
    }

    private function req(User $user, array $data = []): Request
    {
        $r = Request::create('/check', $data ? 'POST' : 'GET', $data);
        $r->setUserResolver(fn () => $user);
        app()->instance('request', $r);
        return $r;
    }

    private function row(string $check, $got, $expected, string $note): void
    {
        $mark = (string) $got === (string) $expected ? '' : '  ✗';
        $this->rows[] = [$check, $got . $mark, $expected, mb_strimwidth($note, 0, 70, '…')];
    }
}
