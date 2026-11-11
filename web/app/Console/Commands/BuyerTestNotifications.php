<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BuyerNotificationController;
use App\Http\Controllers\Buyer\NotificationController;
use App\Models\BuyerNotification;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Rollback-only tests for the buyer web notifications (bell + feed page).
 *
 * Fixture buyers, a non-buyer and their notifications are created inside ONE
 * transaction that is ALWAYS rolled back. orders.* is never touched.
 *
 *   php artisan buyer:test-notifications
 */
class BuyerTestNotifications extends Command
{
    protected $signature = 'buyer:test-notifications';

    protected $description = 'Rollback-only tests: buyer notifications list, unread count, mark read, ownership, pagination';

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
        $api  = app(BuyerNotificationController::class);
        $page = app(NotificationController::class);
        $per  = NotificationController::PER_PAGE;

        // 0. Routes registered (web, session auth)
        foreach ([
            'GET buyer/notifications'                => ['GET', 'buyer/notifications', 'auth'],
            'GET buyer/notifications/feed'           => ['GET', 'buyer/notifications/feed', 'auth'],
            'POST buyer/notifications/{id}/read'     => ['POST', 'buyer/notifications/{id}/read', 'auth'],
            'POST buyer/notifications/read-all'      => ['POST', 'buyer/notifications/read-all', 'auth'],
        ] as $label => [$method, $uri, $mw]) {
            $route = collect(Route::getRoutes()->getRoutes())
                ->first(fn ($r) => $r->uri() === $uri && in_array($method, $r->methods(), true));
            $ok = $route && in_array($mw, $route->gatherMiddleware(), true);
            $this->check("route {$label}", $ok ? 'yes' : 'NO', 'yes', $route ? implode(',', $route->gatherMiddleware()) : 'missing');
        }

        // Fixtures (rolled back): buyer A (per+5 rows, 3 unread), buyer B (2 rows), a seller.
        $buyerA = $this->makeUser('a', ['account_type' => 'buyer', 'role' => null]);
        $buyerB = $this->makeUser('b', ['account_type' => 'buyer', 'role' => null]);
        $seller = $this->makeUser('s', ['account_type' => 'seller', 'role' => null]);

        $totalA = $per + 5;
        $idsA   = [];
        for ($i = 1; $i <= $totalA; $i++) {
            $idsA[] = BuyerNotification::create([
                'buyer_id' => $buyerA->id,
                'type'     => 'order_status',
                'title'    => "Test A {$i}",
                'body'     => "Body A {$i}",
                'data'     => ['order_id' => 1],
                'read_at'  => $i <= $totalA - 3 ? now() : null, // the 3 newest are unread
            ])->id;
        }
        $bRow = BuyerNotification::create(['buyer_id' => $buyerB->id, 'type' => 'delivery_chat', 'title' => 'Test B 1', 'body' => 'B', 'data' => []]);
        BuyerNotification::create(['buyer_id' => $buyerB->id, 'type' => 'delivery_chat', 'title' => 'Test B 2', 'body' => 'B', 'data' => []]);
        $this->check('fixture: 2 buyers, 1 seller', 'ok', 'ok', "A #{$buyerA->id} ({$totalA}), B #{$buyerB->id} (2)");

        // 1. Feed page (Inertia): own rows only, newest first, unread count, pagination
        $p1 = $this->inertia(fn () => $page->index($this->req($buyerA, 'GET', ['page' => 1])));
        $n1 = $p1['props']['notifications'] ?? [];
        $ids1 = array_column($n1['data'] ?? [], 'id');
        $this->check('page 1: status', $p1['status'], 200, 'component=' . ($p1['component'] ?? '?'));
        $this->check('page 1: component', $p1['component'] ?? '', 'BuyerNotifications', '');
        $this->check('page 1: row count', count($ids1), $per, "per_page={$per}");
        $this->check('page 1: only buyer A rows', count(array_diff($ids1, $idsA)), 0, 'foreign ids on page');
        $sorted = $ids1;
        rsort($sorted);
        $this->check('page 1: newest first', $ids1 === $sorted && ($ids1[0] ?? null) === max($idsA) ? 'yes' : 'NO', 'yes', 'first id ' . ($ids1[0] ?? '-'));
        $this->check('page 1: unread_count', $n1['meta']['unread_count'] ?? '?', 3, '');
        $this->check('page 1: total / last_page', ($n1['meta']['total'] ?? '?') . '/' . ($n1['meta']['last_page'] ?? '?'), "{$totalA}/2", '');

        $p2 = $this->inertia(fn () => $page->index($this->req($buyerA, 'GET', ['page' => 2])));
        $ids2 = array_column($p2['props']['notifications']['data'] ?? [], 'id');
        $this->check('page 2: row count', count($ids2), 5, '');
        $this->check('page 2: no overlap with page 1', count(array_intersect($ids1, $ids2)), 0, '');
        $this->check('page 1+2 = all of A', count(array_unique(array_merge($ids1, $ids2))), $totalA, '');
        $p9 = $this->inertia(fn () => $page->index($this->req($buyerA, 'GET', ['page' => 9])));
        $this->check('page 9 (past end): empty', count($p9['props']['notifications']['data'] ?? [1]), 0, '');

        // 2. Buyer only: seller gets 403 on page and JSON
        $ps = $this->inertia(fn () => $page->index($this->req($seller, 'GET')));
        $this->check('seller: feed page', $ps['status'], 403, '');
        $r = $this->hit(fn () => $api->index($this->req($seller, 'GET')));
        $this->check('seller: bell JSON', $r['status'], 403, '');
        $r = $this->hit(fn () => $api->markAllRead($this->req($seller, 'POST')));
        $this->check('seller: mark all', $r['status'], 403, '');

        // 3. Bell JSON (same feed the dropdown uses)
        $r = $this->hit(fn () => $api->index($this->req($buyerB, 'GET')));
        $this->check('buyer B: bell JSON rows', $r['status'] . '/' . count($r['body']['data'] ?? []), '200/2', 'unread=' . ($r['body']['meta']['unread_count'] ?? '?'));
        $this->check('buyer B: unread_count', $r['body']['meta']['unread_count'] ?? '?', 2, '');
        $r = $this->hit(fn () => $api->index($this->req($buyerA, 'GET')));
        $this->check('buyer A: bell JSON has no B rows', in_array($bRow->id, array_column($r['body']['data'] ?? [], 'id'), true) ? 'NO' : 'yes', 'yes', '');

        // 4. Ownership: A cannot read or mark B's notification
        $r = $this->hit(fn () => $api->markRead($this->req($buyerA, 'POST'), $bRow->id));
        $this->check("A marks B's row", $r['status'], 404, $r['body']['message'] ?? '');
        $this->check("B's row still unread", BuyerNotification::find($bRow->id)->read_at === null ? 'yes' : 'NO', 'yes', '');
        $r = $this->hit(fn () => $api->markRead($this->req($seller, 'POST'), $bRow->id));
        $this->check("seller marks B's row", $r['status'], 403, '');
        $r = $this->hit(fn () => $api->markRead($this->req($buyerA, 'POST'), 999999999));
        $this->check('A marks missing id', $r['status'], 404, '');

        // 5. Mark one as read (idempotent)
        $target = max($idsA);
        $r = $this->hit(fn () => $api->markRead($this->req($buyerA, 'POST'), $target));
        $this->check('A marks own unread', $r['status'] . '/' . ($r['body']['unread_count'] ?? '?'), '200/2', "id {$target}");
        $this->check('row has read_at', BuyerNotification::find($target)->read_at !== null ? 'yes' : 'NO', 'yes', '');
        $r = $this->hit(fn () => $api->markRead($this->req($buyerA, 'POST'), $target));
        $this->check('A marks it again', $r['status'] . '/' . ($r['body']['unread_count'] ?? '?'), '200/2', 'idempotent');

        // 6. Mark all as read: only A's rows
        $r = $this->hit(fn () => $api->markAllRead($this->req($buyerA, 'POST')));
        $this->check('A mark all', $r['status'] . '/' . ($r['body']['unread_count'] ?? '?'), '200/0', '');
        $this->check('A unread in DB', BuyerNotification::where('buyer_id', $buyerA->id)->whereNull('read_at')->count(), 0, '');
        $this->check('B unread untouched', BuyerNotification::where('buyer_id', $buyerB->id)->whereNull('read_at')->count(), 2, '');
        $p1 = $this->inertia(fn () => $page->index($this->req($buyerA, 'GET')));
        $this->check('feed page unread after mark all', $p1['props']['notifications']['meta']['unread_count'] ?? '?', 0, '');
    }

    /** Calls an Inertia action and returns status, component and props (403 → status only). */
    private function inertia(\Closure $fn): array
    {
        try {
            $res  = $fn();
            $req  = Request::create('/buyer/notifications', 'GET');
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

    private function req(User $user, string $method, array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "Notif Test {$tag}",
            'first_name' => 'Notif',
            'last_name'  => "Test {$tag}",
            'email'      => "notif-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'buyer_notifications' => DB::table('buyer_notifications')->count(),
            'users'               => DB::table('users')->count(),
            'orders'              => DB::table('orders')->count(),
            'orders_updated_max'  => (string) DB::table('orders')->max('updated_at'),
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
