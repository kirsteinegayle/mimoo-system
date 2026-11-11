<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BuyerAddressController;
use App\Http\Controllers\Api\BuyerChatController;
use App\Models\BuyerAddress;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Rollback-only checks for buyer mobile/web parity items:
 *   - default address (mobile API): one default per buyer, ownership, guest 401
 *   - "Chat with seller" on ViewSeller: seller.id prop + /messages?seller_id
 *     start → one thread per buyer+seller
 *   - FAQ / Contact Support / payment methods: reported as NOT AVAILABLE
 *     (no web content, endpoint or table to mirror; would need a migration)
 *
 *   php artisan buyer:test-mobile-parity
 */
class BuyerTestMobileParity extends Command
{
    protected $signature = 'buyer:test-mobile-parity';

    protected $description = 'Rollback-only tests: default address, ViewSeller chat, one thread per seller; lists unavailable parity items';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $counts = $this->counts();

        DB::beginTransaction();
        try {
            $this->runTests();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($after));

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
        $addr = app(BuyerAddressController::class);
        $chat = app(BuyerChatController::class);

        // 0. Parity items without a web source (informational, not failures)
        $support = collect(Route::getRoutes()->getRoutes())->first(fn ($r) => preg_match('#(^|/)(support|help|faq)(/|$)#', $r->uri()) && ! str_starts_with($r->uri(), 'courier/') && ! str_starts_with($r->uri(), 'logistics/'));
        $this->rows[] = ['info: buyer support/FAQ route', $support ? $support->uri() : 'none', 'n/a', 'no web FAQ/support page, endpoint or table'];
        $this->rows[] = ['info: support table', DB::getSchemaBuilder()->hasTable('support_tickets') || DB::getSchemaBuilder()->hasTable('support_messages') ? 'exists' : 'none', 'n/a', 'Contact Support needs a migration'];
        $this->rows[] = ['info: saved payment methods table', DB::getSchemaBuilder()->hasTable('payment_methods') ? 'exists' : 'none', 'n/a', 'not built (needs migration; GCash/checkout off-limits)'];

        // 1. Route: default address is a Sanctum buyer route
        $r = collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === 'api/buyer/addresses/{id}/default' && in_array('POST', $r->methods(), true));
        $this->check('route POST api/buyer/addresses/{id}/default', $r && in_array('auth:sanctum', $r->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', $r ? implode(',', $r->gatherMiddleware()) : 'missing');

        // Fixtures (rolled back)
        $buyerA = $this->makeUser('buyer.a', ['account_type' => 'buyer', 'role' => 'buyer']);
        $buyerB = $this->makeUser('buyer.b', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'Parity Test Store']);
        $a1 = $this->makeAddress($buyerA, 'Home', true);
        $a2 = $this->makeAddress($buyerA, 'Work', false);
        $a3 = $this->makeAddress($buyerA, 'Other', false);
        $b1 = $this->makeAddress($buyerB, 'Home', true);

        // 2. Set default → exactly one default for the buyer
        $res = $this->hit(fn () => $addr->setDefault($this->req($buyerA), $a2->id));
        $this->check('set default (a2): status', $res['status'], 200, $res['body']['message'] ?? '');
        $this->check('set default (a2): one default = a2', $this->defaults($buyerA), (string) $a2->id, '');
        $listDefault = collect($res['body']['data'] ?? [])->where('is_default', true)->pluck('id')->implode(',');
        $this->check('response list: default flag', $listDefault, (string) $a2->id, '');
        $res = $this->hit(fn () => $addr->setDefault($this->req($buyerA), $a3->id));
        $this->check('set default (a3): one default = a3', $this->defaults($buyerA), (string) $a3->id, '');
        $res = $this->hit(fn () => $addr->setDefault($this->req($buyerA), $a3->id));
        $this->check('set default again: idempotent', $res['status'] . '/' . $this->defaults($buyerA), "200/{$a3->id}", '');

        // 3. Ownership / role / guest
        $res = $this->hit(fn () => $addr->setDefault($this->req($buyerA), $b1->id));
        $this->check("other buyer's address: 404", $res['status'], 404, '');
        $this->check("buyer B default untouched", $this->defaults($buyerB), (string) $b1->id, '');
        $this->check('buyer A default untouched by 404', $this->defaults($buyerA), (string) $a3->id, '');
        $this->check('seller account: 403', $this->hit(fn () => $addr->setDefault($this->req($seller), $a1->id))['status'], 403, '');
        $guest = Request::create("/api/buyer/addresses/{$a1->id}/default", 'POST', [], [], [], ['HTTP_ACCEPT' => 'application/json']);
        $status = app()->handle($guest)->getStatusCode();
        $this->check('guest (real HTTP kernel): 401', $status, 401, '');
        $this->check('guest changed nothing', $this->defaults($buyerA), (string) $a3->id, '');

        // 4. ViewSeller: seller.id prop for the "Chat with seller" button
        $view = Route::getRoutes()->getByName('seller.view');
        $pg = $this->inertia(fn () => ($view->getAction('uses'))((string) $seller->id));
        $this->check('ViewSeller: component / seller.id', ($pg['component'] ?? '-') . '/' . ($pg['props']['seller']['id'] ?? '-'), "ViewSeller/{$seller->id}", '');

        // 5. /messages?seller_id=X → one thread, however often it is opened
        $page = Route::getRoutes()->getByName('messages');
        $mp = $this->inertia(fn () => ($page->getAction('uses'))($this->req($buyerA, ['seller_id' => (string) $seller->id], 'GET')));
        $this->check('/messages?seller_id → startSellerId', $mp['props']['startSellerId'] ?? '-', $seller->id, '');
        $ids = [];
        for ($i = 0; $i < 3; $i++) {
            $ids[] = $this->hit(fn () => $chat->start($this->req($buyerA, ['seller_id' => $seller->id])))['body']['data']['id'] ?? 0;
        }
        $this->check('start x3: same thread', count(array_unique($ids)), 1, implode(',', $ids));
        $this->check('start x3: one thread in DB', ChatThread::where('buyer_id', $buyerA->id)->where('seller_id', $seller->id)->count(), 1, '');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function defaults(User $u): string
    {
        return BuyerAddress::where('buyer_id', $u->id)->where('is_default', true)->orderBy('id')->pluck('id')->implode(',');
    }

    private function makeAddress(User $u, string $label, bool $default): BuyerAddress
    {
        return BuyerAddress::create([
            'buyer_id' => $u->id, 'label' => $label, 'recipient_name' => 'Parity Test', 'phone' => '09170000000',
            'region' => 'Region XI', 'province' => 'Davao del Norte', 'municipality_city' => 'Tagum City',
            'barangay' => 'Apokon', 'street_address' => '1 Test St', 'is_default' => $default,
        ]);
    }

    private function inertia(\Closure $fn): array
    {
        try {
            $res = $fn();
            $req = Request::create('/check', 'GET');
            $req->headers->set('X-Inertia', 'true');
            $http = $res->toResponse($req);
            $page = json_decode($http->getContent(), true) ?? [];
            return ['status' => $http->getStatusCode(), 'component' => $page['component'] ?? null, 'props' => $page['props'] ?? []];
        } catch (HttpException $e) {
            return ['status' => $e->getStatusCode(), 'component' => null, 'props' => []];
        }
    }

    private function hit(\Closure $fn): array
    {
        /** @var JsonResponse $res */
        $res = $fn();
        return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
    }

    private function req(User $user, array $data = [], string $method = 'POST'): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "Parity Test {$tag}",
            'first_name' => 'Parity',
            'last_name'  => "Test {$tag}",
            'email'      => "parity-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
            'status'     => 'approved',
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'buyer_addresses' => DB::table('buyer_addresses')->count(),
            'chat_threads'    => DB::table('chat_threads')->count(),
            'users'           => DB::table('users')->count(),
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
