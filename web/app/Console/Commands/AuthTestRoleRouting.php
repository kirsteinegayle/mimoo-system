<?php

namespace App\Console\Commands;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Courier\RiderManagementController;
use App\Http\Controllers\SellerDashboardController;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Rollback-only checks for web login/registration routing and the admin lists.
 *
 *   php artisan auth:test-role-routing
 */
class AuthTestRoleRouting extends Command
{
    protected $signature = 'auth:test-role-routing';

    protected $description = 'Rollback-only tests: role redirect, login-page role gate, hub/courier route access, registration roles + queues, admin filter/sort, brand name';

    private const PASSWORD = 'Check#Pass123';

    private array $rows = [];

    private int $failed = 0;

    private array $storedFiles = [];

    private string $token;

    public function handle(): int
    {
        $this->token = 'ZRR' . Str::upper(Str::random(6));
        $counts = $this->counts();
        $originalEnv = app()['env'];

        // CSRF is skipped only when the app runs as "testing" in the console.
        app()['env'] = 'testing';
        Notification::fake();

        DB::beginTransaction();
        try {
            $this->runTests();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
            app()['env'] = $originalEnv;
            Auth::forgetGuards();
            foreach ($this->storedFiles as $f) {
                Storage::disk('local')->delete($f);
            }
        }

        $this->check('rollback: counts unchanged', json_encode($this->counts()) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($this->counts()));

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
        $roles = [
            'buyer'     => ['account_type' => 'buyer', 'role' => 'buyer'],
            'seller'    => ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'ZRR Seller Shop'],
            'logistics' => ['account_type' => 'logistics', 'role' => 'logistics_staff'],
            'courier'   => ['account_type' => 'logistics', 'role' => 'courier'],
            'rider'     => ['account_type' => 'logistics', 'role' => 'rider'],
            'admin'     => ['account_type' => 'buyer', 'role' => 'admin'],
        ];
        $u = [];
        foreach ($roles as $tag => $attrs) {
            $u[$tag] = $this->makeUser($tag, $attrs);
        }

        // 1. Role -> redirect after login (no portal = no gate)
        $expectHome = [
            'buyer' => '/homepage', 'seller' => '/seller/dashboard', 'logistics' => '/logistics/dashboard',
            'courier' => '/courier/dashboard', 'admin' => '/admin',
        ];
        foreach ($expectHome as $tag => $home) {
            $res = $this->login($u[$tag], null);
            $this->check("redirect {$tag} -> {$home}", $this->path($res), $home, 'HTTP ' . $res->getStatusCode());
            $this->check("  session exists for {$tag}", Auth::guard('web')->check() ? 'yes' : 'no', 'yes', '');
        }

        // 2. Login page vs allowed role matrix (portal = page that posted the form)
        $matrix = [
            'buyer'     => ['buyer'],
            'seller'    => ['seller'],
            'logistics' => ['logistics'],
            'courier'   => ['courier'],
            'rider'     => [],
        ];
        foreach ($matrix as $portal => $allowed) {
            foreach (['buyer', 'seller', 'logistics', 'courier', 'rider'] as $tag) {
                DB::table('sessions')->where('user_id', $u[$tag]->id)->delete();
                $res = $this->login($u[$tag], $portal);
                $in = Auth::guard('web')->check();
                $sessions = DB::table('sessions')->where('user_id', $u[$tag]->id)->count();
                if (in_array($tag, $allowed, true)) {
                    $this->check("{$portal} login accepts {$tag}", $in ? 'yes' : 'no', 'yes', $this->path($res));
                } else {
                    $this->check("{$portal} login rejects {$tag}", ($in || $sessions > 0) ? 'SESSION' : 'rejected', 'rejected',
                        $this->errorOf($res) ?: 'no message');
                    $this->check("  {$portal}/{$tag} message shown", $this->errorOf($res) !== '' ? 'yes' : 'no', 'yes', '');
                }
            }
        }
        $res = $this->login($u['seller'], 'logistics');
        $this->check('seller on Logistics login: clear message', str_contains($this->errorOf($res), 'Logistics login') ? 'yes' : 'no', 'yes', $this->errorOf($res));
        $wrongPw = $this->post('/login', ['email' => $u['seller']->email, 'password' => 'wrong-pass', 'portal' => 'seller']);
        $this->check('wrong password still fails', Auth::guard('web')->check() ? 'LOGGED IN' : 'rejected', 'rejected', 'HTTP ' . $wrongPw->getStatusCode());

        // 3. Hub / courier route access
        $areas = [
            ['GET', '/logistics/dashboard', ['logistics']],
            ['GET', '/logistics/courier-applications', ['logistics']],
            ['POST', '/api/logistics/courier-applications/0/approve', ['logistics']],
            ['GET', '/courier/dashboard', ['courier', 'logistics']],
            ['GET', '/courier/rider-management', ['courier', 'logistics']],
            ['POST', '/api/courier/scan-parcel', ['courier', 'logistics']],
        ];
        foreach ($areas as [$method, $uri, $ok]) {
            foreach (['buyer', 'seller', 'logistics', 'courier', 'rider'] as $tag) {
                $status = $this->as($u[$tag], $method, $uri);
                $expect403 = ! in_array($tag, $ok, true);
                $this->check("{$method} {$uri} as {$tag}", $status === 403 ? '403' : "not-403 ({$status})", $expect403 ? '403' : "not-403 ({$status})", '');
            }
        }

        // 4. Registration: logistics form -> logistics_staff, courier form -> courier
        $logi = $this->register('logistics');
        $cour = $this->register('courier');
        $legacy = $this->register(null);
        $this->check('register/logistics -> role', $logi->role, 'logistics_staff', 'account_type=' . $logi->account_type);
        $this->check('register/courier -> role', $cour->role, 'courier', 'account_type=' . $cour->account_type);
        $this->check('register without applicant_type -> role (legacy)', $legacy->role, 'courier', '');
        $this->check('registered logistics status', $logi->status, 'pending', '');
        $bad = false;
        try {
            $this->register('rider');
        } catch (ValidationException) {
            $bad = true;
        }
        $this->check('applicant_type=rider rejected', $bad ? 'yes' : 'no', 'yes', '');

        // 5. Queues
        foreach ([$logi, $cour, $legacy] as $x) {
            $x->forceFill(['verification_status' => 'verified'])->save();
        }
        $rider = Rider::create([
            'first_name' => 'ZRR', 'last_name' => 'Rider', 'birthdate' => '1995-01-01', 'gender' => 'male',
            'contact_number' => $this->phone(), 'email' => 'zrr.rider.' . Str::lower(Str::random(6)) . '@check.invalid',
            'rider_id' => 'ZRR-' . Str::upper(Str::random(6)), 'username' => 'zrr_' . Str::lower(Str::random(6)), 'password' => Hash::make(self::PASSWORD),
            'service_areas' => ['Manila'], 'vehicle_type' => 'motorcycle', 'region' => 'NCR', 'city_municipality' => 'Manila',
            'barangay' => 'Test', 'government_id' => 'zrr.png', 'verification_status' => 'pending',
        ]);

        $admin = app(AdminController::class);
        $adminLogi = $this->inertia(fn () => $admin->logisticsApproval($this->listReq(['q' => 'ZRR'])));
        $adminLogiIds = collect($adminLogi['props']['registrations'])->pluck('id')->all();
        $this->check('admin logistics queue has the logistics company', in_array($logi->id, $adminLogiIds, true) ? 'yes' : 'no', 'yes', '');
        $this->check('admin logistics queue has NO courier application', in_array($cour->id, $adminLogiIds, true) || in_array($legacy->id, $adminLogiIds, true) ? 'LEAK' : 'no', 'no', '');

        $courierApps = $this->as($u['logistics'], 'GET', '/logistics/courier-applications', true);
        $appIds = collect($courierApps['props']['applications'] ?? [])->pluck('id')->all();
        $this->check('logistics courier-applications has the courier application', in_array($cour->id, $appIds, true) ? 'yes' : 'no', 'yes', 'HTTP ' . ($courierApps['status'] ?? '?'));
        $this->check('logistics courier-applications has NO logistics company', in_array($logi->id, $appIds, true) ? 'LEAK' : 'no', 'no', '');

        $riderQueue = $this->inertia(fn () => app(RiderManagementController::class)->index(), $u['courier']);
        $riderIds = collect($riderQueue['props']['pendingApplications'] ?? [])->pluck('id')->all();
        $this->check('courier rider queue has the rider application', in_array($rider->id, $riderIds, true) ? 'yes' : 'no', 'yes', 'props: ' . implode(',', array_keys($riderQueue['props'])));
        $adminAll = $this->inertia(fn () => $admin->manageRegistrations());
        $this->check('admin lists have NO rider/courier users', collect($adminAll['props']['registrations'])->contains(fn ($r) => in_array($r['id'], [$u['courier']->id, $u['rider']->id, $cour->id], true)) ? 'LEAK' : 'no', 'no', '');

        $beforePending = $this->inertia(fn () => $admin->dashboard())['props']['attention']['pendingRegistrations'] ?? -1;
        $extra = $this->makeUser('pendingcourier', ['account_type' => 'logistics', 'role' => 'courier', 'status' => 'pending']);
        $afterPending = $this->inertia(fn () => $admin->dashboard())['props']['attention']['pendingRegistrations'] ?? -2;
        $this->check('admin pending count ignores courier applications', $afterPending, $beforePending, "extra user {$extra->id}");

        // 6. Admin filter / sort / pagination
        $base = now()->subDays(30);
        $sellers = [];
        for ($i = 1; $i <= 12; $i++) {
            $sellers[$i] = $this->makeUser("sel{$i}", [
                'account_type' => 'seller', 'role' => 'seller', 'verification_status' => 'verified',
                'status' => $i % 3 === 0 ? 'pending' : ($i % 3 === 1 ? 'approved' : 'disapproved'),
                'business_name' => "{$this->token} Brand {$i}", 'name' => "{$this->token} Seller {$i}",
            ]);
            DB::table('users')->where('id', $sellers[$i]->id)->update(['created_at' => $base->copy()->addDays($i)]);
        }
        $list = fn (array $q) => $this->inertia(fn () => $admin->sellerApproval($this->listReq($q + ['q' => $this->token])));
        $ids = fn (array $r) => collect($r['props']['registrations'])->pluck('id')->all();
        $asc = collect($sellers)->pluck('id')->values()->all();

        $r = $list([]);
        $this->check('default order = newest first', $ids($r) === array_slice(array_reverse($asc), 0, 10) ? 'yes' : 'no', 'yes', 'sort=' . $r['props']['filters']['sort']);
        $r = $list(['sort' => 'oldest']);
        $this->check('sort=oldest ascending', $ids($r) === array_slice($asc, 0, 10) ? 'yes' : 'no', 'yes', '');
        $r = $list(['sort' => 'newest']);
        $this->check('sort=newest descending', $ids($r) === array_slice(array_reverse($asc), 0, 10) ? 'yes' : 'no', 'yes', '');
        $this->check('pagination total/last_page', $r['props']['pagination']['total'] . '/' . $r['props']['pagination']['last_page'], '12/2', '');
        $p2 = $list(['sort' => 'oldest', 'page' => 2]);
        $this->check('page 2 continues the sort, no overlap', $ids($p2) === array_slice($asc, 10, 2) ? 'yes' : 'no', 'yes', 'rows=' . count($ids($p2)));
        $pend = $list(['status' => 'pending']);
        $allPending = collect($pend['props']['registrations'])->every(fn ($x) => $x['status'] === 'pending');
        $this->check('status=pending only pending, total 4', ($allPending ? 'ok' : 'MIXED') . '/' . $pend['props']['pagination']['total'], 'ok/4', '');
        $pendOld = $list(['status' => 'pending', 'sort' => 'oldest']);
        $expect = collect($sellers)->filter(fn ($s, $i) => $i % 3 === 0)->pluck('id')->values()->all();
        $this->check('filter + sort combined', $ids($pendOld) === $expect ? 'yes' : 'no', 'yes', '');
        $this->check('stats are not filtered', $pend['props']['stats']['total'] >= 12 ? 'yes' : 'no', 'yes', '');

        // 7. Brand name: shown in admin list + detail, and the seller can change it
        $row = collect($r['props']['registrations'])->firstWhere('id', $sellers[12]->id);
        $this->check('admin list shows brand name', $row['business_name'] ?? null, "{$this->token} Brand 12", '');
        $detail = $admin->getSellerDetails($sellers[12]->id)->getData(true);
        $this->check('admin detail shows brand name', $detail['business_name'] ?? null, "{$this->token} Brand 12", '');

        $newName = "{$this->token} Renamed";
        $req = Request::create('/seller/store-name', 'PUT', ['store_name' => $newName]);
        $req->setUserResolver(fn () => $sellers[12]);
        Auth::guard('web')->setUser($sellers[12]);
        app(SellerDashboardController::class)->updateStoreName($req);
        $after = $this->inertia(fn () => $admin->sellerApproval($this->listReq(['q' => 'Renamed'])));
        $this->check('store name edit appears in admin list', collect($after['props']['registrations'])->firstWhere('id', $sellers[12]->id)['business_name'] ?? null, $newName, '');
        $rt = app('router')->getRoutes()->getByName('seller.store-name');
        $this->check('PUT /seller/store-name requires role:seller', $rt && in_array('role:seller', $rt->gatherMiddleware(), true) ? 'yes' : 'no', 'yes', '');
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private function register(?string $applicant): User
    {
        $n = random_int(10000000, 99999999);
        $input = [
            'first_name' => 'Zrr', 'last_name' => 'Applicant', 'email' => 'zrr.reg.' . Str::lower(Str::random(8)) . '@check.invalid',
            'contact_number' => $this->phone(), 'account_type' => 'logistics',
            'password' => self::PASSWORD, 'password_confirmation' => self::PASSWORD, 'privacy_policy_accepted' => '1',
            'company_name' => 'ZRR Express', 'trade_name' => 'ZRR', 'business_email' => 'biz' . $n . '@check.invalid',
            'business_address' => '1 Test St', 'company_contact_number' => $this->phone(),
            'rep_contact_number' => $this->phone(), 'sec_registration_no' => 'SEC-' . $n,
            'rep_full_name' => 'Zrr Rep', 'contact_position' => 'Manager', 'regions_served' => ['NCR'], 'cities_served' => ['Manila'],
            'delivery_services' => ['standard'],
            'valid_id' => UploadedFile::fake()->create('id.pdf', 10, 'application/pdf'),
            'proof_of_address' => UploadedFile::fake()->create('poa.pdf', 10, 'application/pdf'),
            'business_permit' => UploadedFile::fake()->create('permit.pdf', 10, 'application/pdf'),
        ];
        if ($applicant !== null) {
            $input['applicant_type'] = $applicant;
        }
        $user = app(CreateNewUser::class)->create($input);
        foreach (['valid_id', 'proof_of_address', 'business_permit', 'sec_certificate', 'operating_permits', 'company_logo'] as $col) {
            if (is_string($user->{$col}) && $user->{$col} !== '') {
                $this->storedFiles[] = $user->{$col};
            }
        }
        return $user->fresh();
    }

    private function phone(): string
    {
        return '09' . str_pad((string) random_int(0, 999999999), 9, '0', STR_PAD_LEFT);
    }

    private function listReq(array $q): Request
    {
        $req = Request::create('/admin/list', 'GET', $q);
        app()->instance('request', $req); // the paginator reads ?page from the global request
        return $req;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name' => "ZRR Test {$tag}", 'first_name' => 'ZRR', 'last_name' => "Test {$tag}",
            'email' => "zrr.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password' => Hash::make(self::PASSWORD), 'status' => 'approved',
            'verification_status' => 'verified', 'email_verified_at' => now(),
        ], $attrs))->save();
        return $user;
    }

    private function post(string $uri, array $data)
    {
        $this->freshSession();
        // A distinct client IP per attempt keeps the login rate limiter out of the way.
        return app()->handle(Request::create($uri, 'POST', $data, [], [], ['HTTP_ACCEPT' => 'text/html', 'REMOTE_ADDR' => '10.' . random_int(1, 250) . '.' . random_int(1, 250) . '.' . random_int(1, 250)]));
    }

    /** The session store is a singleton: wipe it so each request starts as a new browser. */
    private function freshSession(): void
    {
        Auth::forgetGuards();
        $store = app('session.store');
        $store->flush();
        $store->setId(null);
    }

    private function login(User $user, ?string $portal)
    {
        $data = ['email' => $user->email, 'password' => self::PASSWORD];
        if ($portal !== null) {
            $data['portal'] = $portal;
        }
        return $this->post('/login', $data);
    }

    private function path($res): string
    {
        $loc = $res->headers->get('Location') ?? '';
        return parse_url($loc, PHP_URL_PATH) ?: '(none)';
    }

    /** First `email` error flashed by the last request ('' if none). */
    private function errorOf($res): string
    {
        $errors = app('session.store')->get('errors');
        if ($errors instanceof \Illuminate\Support\ViewErrorBag) {
            return (string) $errors->getBag('default')->first('email');
        }
        if (is_array($errors)) {
            $first = $errors['email'] ?? $errors['default']['messages']['email'] ?? $errors['default']['email'] ?? null;
            return is_array($first) ? (string) ($first[0] ?? '') : (string) $first;
        }
        return '';
    }
    /** Status (or Inertia payload when $page) of a kernel request made as $user. */
    private function as(User $user, string $method, string $uri, bool $page = false): int|array
    {
        $this->freshSession();
        Auth::guard('web')->setUser($user);
        $server = $page ? ['HTTP_X_INERTIA' => 'true', 'HTTP_X_INERTIA_VERSION' => (string) \Inertia\Inertia::getVersion(), 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'] : ['HTTP_ACCEPT' => 'application/json'];
        $res = app()->handle(Request::create($uri, $method, [], [], [], $server));
        if (! $page) {
            return $res->getStatusCode();
        }
        $json = json_decode($res->getContent(), true) ?? [];
        return ['status' => $res->getStatusCode(), 'props' => $json['props'] ?? []];
    }

    private function inertia(\Closure $fn, ?User $as = null): array
    {
        try {
            if ($as) {
                Auth::forgetGuards();
                Auth::guard('web')->setUser($as);
            }
            $res = $fn();
            $req = Request::create('/check', 'GET');
            $req->headers->set('X-Inertia', 'true');
            $http = $res->toResponse($req);
            $page = json_decode($http->getContent(), true) ?? [];
            return ['status' => $http->getStatusCode(), 'props' => $page['props'] ?? []];
        } catch (HttpException $e) {
            return ['status' => $e->getStatusCode(), 'props' => []];
        }
    }

    private function counts(): array
    {
        return [
            'users' => DB::table('users')->count(),
            'riders' => DB::table('riders')->count(),
            'sessions' => DB::table('sessions')->count(),
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
