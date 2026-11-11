<?php

namespace App\Console\Commands;

use App\Http\Controllers\Seller\NotificationController;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SellerNotification;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\DatabaseTransactionsManager as TestTransactionsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Rollback-only tests for seller notifications (table, service hooks,
 * seller JSON routes and feed page).
 *
 * ONE wrapper transaction, ALWAYS rolled back. The Laravel testing
 * transaction manager is swapped in for the run (same as the
 * DatabaseTransactions test trait) so DB::afterCommit() inserts run when the
 * inner work "commits", as in production. Existing orders are never written.
 *
 *   php artisan seller:test-notifications
 */
class SellerTestNotifications extends Command
{
    protected $signature = 'seller:test-notifications';

    protected $description = 'Rollback-only tests: seller notifications per step (no duplicates), access, unread, read one/all';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $products = DB::table('products')->select('seller_id', DB::raw('MIN(id) AS pid'))
            ->whereNotNull('seller_id')->groupBy('seller_id')->orderBy('seller_id')->limit(2)->get();
        $courier   = User::where('role', 'courier')->orderBy('id')->first();
        $personnel = CourierPersonnel::whereNotNull('user_id')->where('role', 'rider')->orderBy('id')->first();
        if ($products->count() < 2 || ! $courier || ! $personnel) {
            $this->error('Need products from 2 sellers, a courier and a rider personnel row.');
            return self::FAILURE;
        }

        $counts = $this->counts();

        $conn     = DB::connection();
        $original = app('db.transactions');
        $manager  = new TestTransactionsManager([$conn->getName()]);
        $conn->setTransactionManager($manager);
        app()->instance('db.transactions', $manager);

        $conn->beginTransaction();
        try {
            $this->runTests($products->all(), $courier, $personnel);
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            $conn->rollBack();
            $conn->setTransactionManager($original);
            app()->instance('db.transactions', $original);
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

    private function runTests(array $products, User $courier, CourierPersonnel $personnel): void
    {
        $ctrl = app(NotificationController::class);

        // 0. Routes
        foreach ([['GET', 'seller/notifications'], ['GET', 'seller/notifications/feed'],
                  ['POST', 'seller/notifications/{id}/read'], ['POST', 'seller/notifications/read-all']] as [$m, $uri]) {
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === $uri && in_array($m, $r->methods(), true));
            $this->check("route {$m} {$uri}", $route && in_array('auth', $route->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', $route ? implode(',', $route->gatherMiddleware()) : 'missing');
        }

        // Fixtures (rolled back)
        $sellerA = User::find($products[0]->seller_id);
        $sellerB = User::find($products[1]->seller_id);
        $sellerC = $this->makeUser('seller.c', ['account_type' => 'seller', 'role' => 'seller']);
        $buyer   = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $base    = ['A' => $this->countFor($sellerA), 'B' => $this->countFor($sellerB)];

        // 1. New order: 2 items of A + 1 of B → one "New order" each
        $order = Order::create(['buyer_id' => $buyer->id, 'status' => 'pending', 'total' => 300, 'payment_method' => 'cod',
            'shipping_name' => 'Notif Test', 'shipping_address' => 'Test St', 'shipping_phone' => '09000000000']);
        foreach ([[$products[0], 1], [$products[0], 2], [$products[1], 1]] as [$p, $q]) {
            OrderItem::create(['order_id' => $order->id, 'product_id' => $p->pid, 'seller_id' => $p->seller_id,
                'product_name' => 'Notif Test Item', 'quantity' => $q, 'unit_price' => 100]);
        }
        $this->step('new order', $sellerA, $sellerB, $base, 1, 'order_placed');

        // 2. Picked up (any pickup flow updates the assignment) → one each; repeats add none
        $sa = ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $courier->id, 'assigned_by' => $courier->id,
            'assigned_at' => now(), 'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted',
            'pickup_status' => 'scheduled', 'assigned_personnel_id' => $personnel->id]);
        $sa->update(['pickup_status' => 'picked_up', 'picked_up_at' => now()]);
        $sa->update(['picked_up_at' => now()->addMinute()]);           // same status, other field
        $sa->update(['pickup_status' => 'scheduled']);
        $sa->update(['pickup_status' => 'picked_up']);                  // replayed step
        $this->step('picked up (+ replays)', $sellerA, $sellerB, $base, 2, 'picked_up');

        // 3. Delivery steps
        $job = DeliveryJob::create(['order_id' => $order->id, 'rider_user_id' => $personnel->user_id, 'personnel_id' => $personnel->id,
            'courier_id' => $personnel->courier_id, 'assigned_by' => $personnel->courier_id,
            'status' => DeliveryJob::STATUS_ASSIGNED, 'cod_amount' => 0, 'assigned_at' => now()]);
        $this->step('job assigned (no notification)', $sellerA, $sellerB, $base, 2, 'picked_up');

        $job->update(['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY, 'out_for_delivery_at' => now()]);
        $job->update(['out_for_delivery_at' => now()->addMinute()]);   // no status change
        $this->step('out for delivery (attempt 1)', $sellerA, $sellerB, $base, 3, 'out_for_delivery');

        $job->update(['status' => DeliveryJob::STATUS_FAILED, 'attempt_count' => 1]);
        $this->step('delivery failed (attempt 1)', $sellerA, $sellerB, $base, 4, 'delivery_failed');

        $job->update(['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY]);
        $this->step('out for delivery (attempt 2)', $sellerA, $sellerB, $base, 5, 'out_for_delivery');

        $job->update(['status' => DeliveryJob::STATUS_DELIVERED, 'attempt_count' => 2, 'delivered_at' => now()]);
        $job->update(['otp_verified_at' => now()]);                     // later write, same status
        // Replay the same "delivered" event (e.g. a retried request): dedupe_key blocks it.
        $replay = $job->fresh();
        $replay->setRawAttributes(array_merge($replay->getAttributes(), ['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY]), true);
        $replay->status = DeliveryJob::STATUS_DELIVERED;
        $replay->syncChanges();
        \App\Services\SellerNotificationService::deliveryJobUpdated($replay);
        $this->step('delivered (+ repeat)', $sellerA, $sellerB, $base, 6, 'delivered');

        $this->check('seller C (no items): none', $this->countFor($sellerC), 0, '');
        $this->check('buyer has no seller rows', $this->countFor($buyer), 0, '');
        $this->check('dedupe keys unique per seller', SellerNotification::where('seller_id', $sellerA->id)->whereNotNull('dedupe_key')
            ->select('dedupe_key')->groupBy('dedupe_key')->havingRaw('COUNT(*) > 1')->count(), 0, '');

        // 4. Access + unread + read one/all (via controller)
        $feedA = $this->hit(fn () => $ctrl->feed($this->req($sellerA, 'GET')));
        $unreadA0 = SellerNotification::where('seller_id', $sellerA->id)->whereNull('read_at')->count();
        $this->check('A feed: status / unread', $feedA['status'] . '/' . ($feedA['body']['meta']['unread_count'] ?? '?'), "200/{$unreadA0}", '');
        $idsA = array_column($feedA['body']['data'] ?? [], 'id');
        $this->check('A feed: only own rows', SellerNotification::whereIn('id', $idsA)->where('seller_id', '!=', $sellerA->id)->count(), 0, count($idsA) . ' rows');
        $first = $feedA['body']['data'][0] ?? [];
        $this->check('A feed: newest + bell shape', ($first['title'] ?? '-') . '|' . ($first['data']['url'] ?? '-') . '|' . (isset($first['body']) ? 'body' : '-'), 'Order delivered|/seller/orders|body', '');

        $bRow = SellerNotification::where('seller_id', $sellerB->id)->latest('id')->first();
        $r = $this->hit(fn () => $ctrl->markRead($this->req($sellerA, 'POST'), $bRow->id));
        $this->check("A marks B's row", $r['status'], 404, '');
        $this->check("B's row still unread", $bRow->fresh()->read_at === null ? 'yes' : 'NO', 'yes', '');

        $own = SellerNotification::where('seller_id', $sellerA->id)->whereNull('read_at')->latest('id')->first();
        $r = $this->hit(fn () => $ctrl->markRead($this->req($sellerA, 'POST'), $own->id));
        $this->check('A marks own row', $r['status'] . '/' . ($r['body']['unread_count'] ?? '?'), '200/' . ($unreadA0 - 1), '');
        $r = $this->hit(fn () => $ctrl->markRead($this->req($sellerA, 'POST'), $own->id));
        $this->check('A marks it again (idempotent)', $r['status'] . '/' . ($r['body']['unread_count'] ?? '?'), '200/' . ($unreadA0 - 1), '');

        $unreadB0 = SellerNotification::where('seller_id', $sellerB->id)->whereNull('read_at')->count();
        $r = $this->hit(fn () => $ctrl->markAllRead($this->req($sellerA, 'POST')));
        $this->check('A read-all', $r['status'] . '/' . ($r['body']['unread_count'] ?? '?'), '200/0', '');
        $this->check('A unread in DB', SellerNotification::where('seller_id', $sellerA->id)->whereNull('read_at')->count(), 0, '');
        $this->check('B unread untouched', SellerNotification::where('seller_id', $sellerB->id)->whereNull('read_at')->count(), $unreadB0, '');

        foreach (['feed' => fn () => $ctrl->feed($this->req($buyer, 'GET')),
                  'read-all' => fn () => $ctrl->markAllRead($this->req($buyer, 'POST')),
                  'read' => fn () => $ctrl->markRead($this->req($buyer, 'POST'), $bRow->id)] as $label => $fn) {
            $this->check("buyer: {$label}", $this->hit($fn)['status'], 403, '');
        }

        // 5. Feed page (Inertia)
        $pg = $this->inertia(fn () => $ctrl->page($this->req($sellerA, 'GET')));
        $this->check('A page: component', ($pg['status'] ?? '?') . '/' . ($pg['component'] ?? '-'), '200/seller/SellerNotifications', 'total=' . ($pg['props']['notifications']['meta']['total'] ?? '?'));
        $pb = $this->inertia(fn () => $ctrl->page($this->req($buyer, 'GET')));
        $this->check('buyer: page', $pb['status'], 403, '');
    }

    /** Checks both sellers got exactly $n new rows since $base, newest of $type. */
    private function step(string $label, User $a, User $b, array $base, int $n, string $type): void
    {
        foreach (['A' => $a, 'B' => $b] as $k => $s) {
            $got  = $this->countFor($s) - $base[$k];
            $last = SellerNotification::where('seller_id', $s->id)->latest('id')->value('type');
            $this->check("{$label}: seller {$k}", "{$got}/{$last}", "{$n}/{$type}", "seller #{$s->id}");
        }
    }

    private function countFor(User $u): int
    {
        return SellerNotification::where('seller_id', $u->id)->count();
    }

    private function inertia(\Closure $fn): array
    {
        try {
            $res = $fn();
            $req = Request::create('/seller/notifications', 'GET');
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
            'name'       => "SNotif Test {$tag}",
            'first_name' => 'SNotif',
            'last_name'  => "Test {$tag}",
            'email'      => "snotif-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'seller_notifications' => DB::table('seller_notifications')->count(),
            'buyer_notifications'  => DB::table('buyer_notifications')->count(),
            'orders'               => DB::table('orders')->count(),
            'order_items'          => DB::table('order_items')->count(),
            'shipment_assignments' => DB::table('shipment_assignments')->count(),
            'delivery_jobs'        => DB::table('delivery_jobs')->count(),
            'users'                => DB::table('users')->count(),
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
