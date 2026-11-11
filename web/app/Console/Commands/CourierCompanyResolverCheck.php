<?php

namespace App\Console\Commands;

use App\Models\CourierPersonnel;
use App\Models\User;
use App\Support\CourierCompanyResolver;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Rollback-only check for App\Support\CourierCompanyResolver.
 *
 *   php artisan courier:test-company-resolver
 */
class CourierCompanyResolverCheck extends Command
{
    protected $signature = 'courier:test-company-resolver';

    protected $description = 'Rollback-only check: logistics_staff / rider / courier -> courier company resolver';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $before = [DB::table('users')->count(), DB::table('courier_personnel')->count(), (string) DB::table('users')->max('updated_at')];

        DB::beginTransaction();
        try {
            $courierA = $this->makeUser('courier.a', ['account_type' => 'logistics', 'role' => 'courier']);
            $courierB = $this->makeUser('courier.b', ['account_type' => 'logistics', 'role' => 'courier']);
            $seller   = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);

            $this->check('courier -> itself', CourierCompanyResolver::resolveId($courierA), $courierA->id);

            $staff = $this->makeUser('staff', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'courier_company_id' => $courierA->id]);
            $this->check('staff with column -> company', CourierCompanyResolver::resolveId($staff), $courierA->id);

            $staffNone = $this->makeUser('staff.none', ['account_type' => 'logistics', 'role' => 'logistics_staff']);
            $this->check('staff without link -> null', CourierCompanyResolver::resolveId($staffNone) ?? 'null', 'null');

            CourierPersonnel::create(['courier_id' => $courierB->id, 'user_id' => $staffNone->id, 'name' => 'Resolver staff', 'role' => 'staff', 'status' => 'active']);
            $this->check('staff via personnel row -> company', CourierCompanyResolver::resolveId($staffNone->fresh()), $courierB->id);

            $staffBad = $this->makeUser('staff.bad', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'courier_company_id' => $seller->id]);
            $this->check('staff linked to a non-courier -> null', CourierCompanyResolver::resolveId($staffBad) ?? 'null', 'null');

            $rider = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider']);
            CourierPersonnel::create(['courier_id' => $courierB->id, 'user_id' => $rider->id, 'name' => 'Resolver rider', 'role' => 'rider', 'status' => 'active']);
            $this->check('rider -> personnel courier', CourierCompanyResolver::resolveId($rider), $courierB->id);

            $this->check('seller -> null', CourierCompanyResolver::resolveId($seller) ?? 'null', 'null');
            $this->check('guest -> null', CourierCompanyResolver::resolveId(null) ?? 'null', 'null');

            $hub = User::where('role', 'logistics_staff')->orderBy('id')->first();
            if ($hub) {
                $this->rows[] = ['info: existing hub user', '#' . $hub->id, '-', 'resolves to ' . (CourierCompanyResolver::resolveId($hub) ?? 'null (no link set yet)')];
            }
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage(), 70)];
        } finally {
            DB::rollBack();
        }

        $after = [DB::table('users')->count(), DB::table('courier_personnel')->count(), (string) DB::table('users')->max('updated_at')];
        $this->check('rollback: unchanged', $after === $before ? 'yes' : 'NO', 'yes');

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'     => "Resolver Test {$tag}",
            'email'    => "resolver-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password' => Str::random(32),
        ], $attrs))->save();
        return $user;
    }

    private function check(string $label, $got, $expected): void
    {
        $ok = (string) $got === (string) $expected;
        if (! $ok) {
            $this->failed++;
        }
        $this->rows[] = [$label, $got . ($ok ? '' : '  ✗'), $expected, ''];
    }
}
