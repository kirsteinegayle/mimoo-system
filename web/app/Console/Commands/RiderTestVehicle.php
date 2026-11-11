<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderAuthController;
use App\Http\Controllers\Courier\RiderManagementController;
use App\Http\Requests\RiderRegistrationRequest;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Rollback-only: vehicle type + plate number from Apply as Rider to the
 * rider app (validation → riders row → approve → Rider Management → GET /me).
 *
 *   php artisan rider:test-vehicle
 */
class RiderTestVehicle extends Command
{
    protected $signature = 'rider:test-vehicle';

    protected $description = 'Rollback-only: rider vehicle_type / plate_number apply -> approve -> Rider Management -> /me';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $courier = User::where('role', 'courier')->orderBy('id')->first();
        if (! $courier) {
            $this->error('No courier user found.');
            return self::FAILURE;
        }
        $before = $this->counts();

        DB::beginTransaction();
        try {
            $this->runTests($courier);
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

    private function runTests(User $courier): void
    {
        // 1. Apply as Rider validation (same FormRequest rules as the web form)
        foreach ([
            'motorcycle without plate' => [['vehicle_type' => 'motorcycle'], 'plate_number'],
            'bicycle without plate'    => [['vehicle_type' => 'bicycle'], null],
            'unknown vehicle "van"'    => [['vehicle_type' => 'van', 'plate_number' => 'X 1'], 'vehicle_type'],
            'plate over 50 chars'      => [['vehicle_type' => 'car', 'plate_number' => str_repeat('A', 51)], 'plate_number'],
            'car with plate'           => [['vehicle_type' => 'car', 'plate_number' => 'ABC 1234'], null],
        ] as $label => [$data, $expectError]) {
            $form = RiderRegistrationRequest::create('/register/rider', 'POST', $data);
            $rules = array_intersect_key($form->rules(), array_flip(['vehicle_type', 'plate_number']));
            $errors = Validator::make($data, $rules)->errors();
            $got = $expectError === null ? ($errors->isEmpty() ? 'ok' : 'errors: ' . implode(',', $errors->keys())) : ($errors->has($expectError) ? 'error' : 'no error');
            $this->check("validate: {$label}", $got, $expectError === null ? 'ok' : 'error', $errors->first() ?: '');
        }

        // 2. Application row → approve
        $tag   = 'vcheck' . Str::lower(Str::random(6));
        $email = "{$tag}@mimoo-check.test";
        $branchId = DB::table('courier_facilities')->insertGetId([
            'courier_id' => $courier->id, 'facility_name' => "CHECK {$tag}", 'facility_code' => strtoupper($tag),
            'facility_type' => 'Branch', 'status' => 'Active', 'region' => 'CHECK', 'city' => 'Santa Cruz',
            'address' => 'CHECK', 'manager_name' => 'CHECK', 'contact_number' => '09000000000',
            'coverage_cities' => json_encode(['Santa Cruz']), 'created_at' => now(), 'updated_at' => now(),
        ]);
        $rider = Rider::create([
            'first_name' => 'Vehicle', 'last_name' => 'Check ' . $tag, 'birthdate' => '1995-01-01', 'gender' => 'male',
            'contact_number' => '09001112222', 'email' => $email,
            'rider_id' => Rider::generateRiderId(), 'username' => $tag, 'password' => Hash::make(Str::random(16)),
            'employment_status' => 'inactive', 'service_areas' => ['Santa Cruz'],
            'vehicle_type' => 'tricycle', 'plate_number' => 'VHC 4321',
            'region' => 'CHECK', 'city_municipality' => 'Santa Cruz', 'barangay' => 'CHECK',
            'government_id' => 'check/none.jpg', 'verification_status' => 'pending',
            'privacy_policy_accepted' => true, 'privacy_accepted_at' => now(),
        ]);

        Auth::setUser($courier);
        $mgmt = app(RiderManagementController::class);
        $res = $mgmt->approve($this->req($courier, 'POST', ['assigned_branch_id' => $branchId]), $rider->id);
        $this->check('approve application', $res->getStatusCode(), 200, $res->getData(true)['message'] ?? '');
        $rider->refresh();
        $this->check('riders row keeps vehicle', "{$rider->vehicle_type}/{$rider->plate_number}", 'tricycle/VHC 4321', "status {$rider->verification_status}");

        // 3. Courier Rider Management shows it
        $page = $mgmt->index()->toResponse(tap($this->req($courier, 'GET'), fn ($r) => $r->headers->set('X-Inertia', 'true')));
        $props = json_decode($page->getContent(), true)['props'] ?? [];
        $row = collect($props['allRiders'] ?? [])->firstWhere('id', $rider->id);
        $this->check('Rider Management row', $row ? ($row['vehicle_type'] ?? '-') . '/' . ($row['plate_number'] ?? '-') : 'missing', 'tricycle/VHC 4321', '');

        // 4. Rider app GET /me
        $user = User::where('email', $email)->first();
        $me = app(RiderAuthController::class)->me($this->req($user, 'GET'))->getData(true)['data']['rider'] ?? [];
        $this->check('/me vehicle_type', $me['vehicle_type'] ?? 'null', 'tricycle', '');
        $this->check('/me plate_number', $me['plate_number'] ?? 'null', 'VHC 4321', '');
        $this->check('/me has is_online', array_key_exists('is_online', $me) ? json_encode($me['is_online']) : 'missing', 'false', '');

        // 5. Rider without an application (e.g. demo seed) → nulls, no error
        $plain = new User();
        $plain->forceFill(['name' => 'Vehicle Plain', 'email' => "{$tag}.plain@mimoo-check.test", 'password' => Str::random(32),
            'account_type' => 'logistics', 'role' => 'rider', 'status' => 'approved', 'verification_status' => 'verified'])->save();
        CourierPersonnel::create(['courier_id' => $courier->id, 'user_id' => $plain->id, 'name' => 'Vehicle Plain', 'role' => 'rider', 'status' => 'active']);
        $me2 = app(RiderAuthController::class)->me($this->req($plain, 'GET'));
        $d2  = $me2->getData(true)['data']['rider'] ?? [];
        $this->check('/me without application', $me2->getStatusCode() . '/' . json_encode($d2['vehicle_type'] ?? null) . '/' . json_encode($d2['plate_number'] ?? null), '200/null/null', (string) ($me2->getData(true)['message'] ?? ''));

        // 6. Application of ANOTHER courier with the same email is not used
        $otherCourier = User::where('role', 'courier')->where('id', '!=', $courier->id)->orderBy('id')->first();
        if ($otherCourier) {
            Rider::whereKey($rider->id)->update(['courier_company_id' => $otherCourier->id]);
            $me3 = app(RiderAuthController::class)->me($this->req($user, 'GET'))->getData(true)['data']['rider'] ?? [];
            $this->check('/me ignores other courier app', json_encode($me3['vehicle_type'] ?? null), 'null', "courier #{$otherCourier->id}");
        }
    }

    private function req(User $user, string $method, array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        app()->instance('request', $r);       // rebinding resets the user resolver to Auth…
        $r->setUserResolver(fn () => $user);  // …so set ours afterwards
        return $r;
    }

    private function counts(): array
    {
        return [
            'riders'            => DB::table('riders')->count(),
            'users'             => DB::table('users')->count(),
            'courier_personnel' => DB::table('courier_personnel')->count(),
            'courier_facilities'=> DB::table('courier_facilities')->count(),
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
