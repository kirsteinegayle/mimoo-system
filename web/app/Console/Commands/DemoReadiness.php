<?php

namespace App\Console\Commands;

use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;
use App\Support\CourierCompanyResolver;
use Illuminate\Console\Command;

/**
 * READ-ONLY demo readiness check. Writes nothing and never changes a role.
 * For every role account it shows role, status and the links the demo flow
 * needs, then lists exactly what is missing and what to set.
 *
 *   php artisan demo:readiness
 */
class DemoReadiness extends Command
{
    protected $signature = 'demo:readiness';

    protected $description = 'Read-only: per role account, show status and required links, and list what is missing for the demo';

    /** @var string[] */
    private array $todo = [];

    public function handle(): int
    {
        $rows = [];

        foreach (['buyer', 'seller', 'logistics_staff', 'courier', 'rider'] as $role) {
            $users = User::where('role', $role)->orderBy('id')->get();
            if ($users->isEmpty()) {
                $rows[] = [$role, '-', '-', '-', 'NO ACCOUNT'];
                $this->todo[] = "[{$role}] no user with role '{$role}' exists. Register one (and approve it) before the demo.";
                continue;
            }
            foreach ($users as $u) {
                [$ok, $links, $missing] = $this->inspect($role, $u);
                $rows[] = [$role, "#{$u->id} {$u->email}", $this->status($u), $links, $ok ? 'READY' : 'MISSING: ' . implode('; ', $missing)];
            }
            $this->roleSummary($role, $users);
        }

        $rows[] = ['admin', 'master code', 'n/a', 'ADMIN_MASTER_CODE ' . (env('ADMIN_MASTER_CODE') ? 'set' : 'NOT SET'), env('ADMIN_MASTER_CODE') ? 'READY' : 'MISSING: set ADMIN_MASTER_CODE in .env'];
        if (! env('ADMIN_MASTER_CODE')) {
            $this->todo[] = '[admin] set ADMIN_MASTER_CODE in .env (admin signs in with the master code, there is no admin users row).';
        }
        $adminUsers = User::where('role', 'admin')->count();
        if ($adminUsers > 0) {
            $rows[] = ['admin', "{$adminUsers} users row(s) with role admin", '-', '-', 'info only'];
        }

        $this->table(['Role', 'Account', 'Status', 'Links', 'Result'], $rows);

        $this->newLine();
        if ($this->todo === []) {
            $this->info('Ready: every role has at least one complete account.');
        } else {
            $this->warn('To do before the demo (nothing was written):');
            foreach (array_values(array_unique($this->todo)) as $t) {
                $this->line(' - ' . $t);
            }
        }

        return self::SUCCESS;
    }

    private function status(User $u): string
    {
        return ($u->status ?? '-') . ' / ' . ($u->verification_status ?? '-');
    }

    /** @return array{0: bool, 1: string, 2: string[]} */
    private function inspect(string $role, User $u): array
    {
        $missing = [];
        // Buyers are auto-approved (EnsureAccountApproved skips them); User does not
        // implement MustVerifyEmail, so the `verified` middleware never blocks anyone.
        if ($role !== 'buyer' && $u->status !== 'approved') {
            $missing[] = "status is '{$u->status}', set users.status = 'approved'";
        }
        $links = '-';

        switch ($role) {
            case 'seller':
                $products = \App\Models\Product::where('seller_id', $u->id)->count();
                $links = "products: {$products}";
                if ($products === 0) {
                    $missing[] = 'no products';
                }
                break;

            case 'courier':
                $areas = $this->areas($u);
                $facilities = CourierFacility::where('courier_id', $u->id)->where('status', 'Active')->count();
                $riders = CourierPersonnel::where('courier_id', $u->id)->where('role', 'rider')->where('status', 'active')->count();
                $links = "service_areas: {$areas}, hubs/branches: {$facilities}, riders: {$riders}";
                if ($u->account_type !== 'logistics') {
                    $missing[] = "account_type is '{$u->account_type}', must be 'logistics' for Sort & Assign to list this courier";
                }
                if ($areas === 0) {
                    $missing[] = 'service_areas empty (set users.service_areas, e.g. ["Santa Cruz"])';
                }
                if ($facilities === 0) {
                    $missing[] = 'no active branch/hub in courier_facilities (Courier > Branch & Facility)';
                }
                if ($riders === 0) {
                    $missing[] = 'no active rider in courier_personnel';
                }
                break;

            case 'logistics_staff':
                $company = CourierCompanyResolver::resolve($u);
                $links = 'courier_company_id: ' . ($u->courier_company_id ?: 'null')
                    . ' -> company: ' . ($company ? "#{$company->id} " . ($company->company_name ?? $company->name) : 'NONE');
                if (! $company) {
                    // Prefer the approved courier that is actually set up (branches + riders).
                    $courier = User::where('role', 'courier')->where('status', 'approved')->get()
                        ->sortByDesc(fn ($c) => CourierFacility::where('courier_id', $c->id)->count() * 10
                            + CourierPersonnel::where('courier_id', $c->id)->where('role', 'rider')->count())
                        ->first();
                    $missing[] = 'courier company not resolved: set users.courier_company_id = '
                        . ($courier ? "{$courier->id} ({$courier->email})" : '<id of an approved courier user>')
                        . " for user #{$u->id}";
                }
                break;

            case 'rider':
                $p = CourierPersonnel::where('user_id', $u->id)->where('status', 'active')->first();
                $app = Rider::whereRaw('LOWER(email) = ?', [strtolower((string) $u->email)])->latest('id')->first();
                $hub = $app?->assigned_branch_id ? CourierFacility::find($app->assigned_branch_id) : null;
                $links = 'personnel: ' . ($p ? "#{$p->id} (courier #{$p->courier_id}, " . ($p->is_online ? 'online' : 'offline') . ')' : 'NONE')
                    . ', rider-hub: ' . ($hub ? $hub->facility_name : 'none')
                    . ', vehicle: ' . ($app?->vehicle_type ?? '-');
                if ($u->verification_status !== 'verified') {
                    $missing[] = "verification_status is '{$u->verification_status}', must be 'verified' to log in to the rider app";
                }
                if (! $p) {
                    $missing[] = 'no active courier_personnel row (user_id = this user, role rider)';
                } elseif ($p->role !== 'rider') {
                    $missing[] = "courier_personnel.role is '{$p->role}', must be 'rider'";
                }
                if (! $hub) {
                    $missing[] = 'no rider-hub: riders.assigned_branch_id -> courier_facilities (optional for scans, needed for hub drop)';
                }
                break;

            case 'buyer':
                $links = 'orders: ' . \App\Models\Order::where('buyer_id', $u->id)->count()
                    . ', addresses: ' . \App\Models\BuyerAddress::where('buyer_id', $u->id)->count();
                break;
        }

        return [$missing === [], $links, $missing];
    }

    private function areas(User $u): int
    {
        $a = $u->service_areas;
        if (is_string($a)) {
            $a = json_decode($a, true);
        }

        return is_array($a) ? count($a) : 0;
    }

    private function roleSummary(string $role, $users): void
    {
        if ($role === 'seller' || $role === 'buyer') {
            return;
        }
        if ($role === 'courier' && $users->where('status', 'approved')->isEmpty()) {
            $this->todo[] = '[courier] no APPROVED courier company: Sort & Assign only lists approved couriers (users.status = approved).';
        }
        if ($role === 'logistics_staff') {
            $linked = $users->filter(fn ($u) => CourierCompanyResolver::resolve($u) !== null);
            if ($linked->isEmpty()) {
                $this->todo[] = '[logistics_staff] no hub user resolves to a courier company, so pickups/incoming/delivery pages stay empty for them. Set users.courier_company_id on the hub user.';
            }
        }
        if ($role === 'rider' && $users->every(fn ($u) => ! CourierPersonnel::where('user_id', $u->id)->where('status', 'active')->exists())) {
            $this->todo[] = '[rider] no rider has an active courier_personnel row, so none can be assigned a pickup or delivery.';
        }
    }
}
