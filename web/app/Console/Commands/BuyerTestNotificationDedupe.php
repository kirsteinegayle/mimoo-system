<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderDeliveryController;
use App\Http\Controllers\SellerOrderController;
use App\Models\BuyerNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\User;
use App\Services\BuyerNotificationService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\DatabaseTransactionsManager as TestTransactionsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests: rider "out for delivery" gives the buyer exactly ONE
 * notification ("Out for delivery", no extra "Order shipped"), while other
 * flows that move an order to shipped (seller) still send "Order shipped".
 *
 * Runs inside ONE wrapper transaction that is ALWAYS rolled back. The
 * Laravel testing transaction manager is swapped in for the run (same as the
 * DatabaseTransactions test trait) so DB::afterCommit() notifications fire
 * when the controllers' own transactions commit, as in production.
 *
 *   php artisan buyer:test-notification-dedupe
 */
class BuyerTestNotificationDedupe extends Command
{
    protected $signature = 'buyer:test-notification-dedupe';

    protected $description = 'Rollback-only tests: one buyer notification per rider out-for-delivery, Order shipped still sent by other flows';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $usable = fn () => Order::whereNotNull('buyer_id')
            ->whereHas('buyer', fn ($q) => $q->where('account_type', 'buyer'))
            ->whereHas('items')
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->whereNotIn('id', DB::table('delivery_jobs')->select('order_id'))
            ->orderBy('id')
            ->get()
            ->reject(fn (Order $o) => $o->hasOpenReturn())
            ->values();
        $orders  = $usable();
        $courier = User::where('role', 'courier')->orderBy('id')->first()
            ?? User::where('account_type', 'logistics')->orderBy('id')->first();
        if ($orders->count() < 2 || ! $courier) {
            $this->error('Need 2 open orders (buyer, items, no delivery job) and a courier account.');
            return self::FAILURE;
        }
        [$riderOrder, $sellerOrder] = [$orders[0], $orders[1]];

        $counts = $this->counts();
        $before = $this->orderSnapshot([$riderOrder->id, $sellerOrder->id]);

        $conn     = DB::connection();
        $original = app('db.transactions');
        $manager  = new TestTransactionsManager([$conn->getName()]);
        $conn->setTransactionManager($manager);
        app()->instance('db.transactions', $manager);

        $conn->beginTransaction();
        try {
            $this->runTests($riderOrder, $sellerOrder, $courier);
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            $conn->rollBack();
            $conn->setTransactionManager($original);
            app()->instance('db.transactions', $original);
            Auth::forgetUser();
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($after));
        $this->check('rollback: orders rows unchanged', $this->orderSnapshot([$riderOrder->id, $sellerOrder->id]) === $before ? 'yes' : 'NO', 'yes', "orders #{$riderOrder->id}, #{$sellerOrder->id}");

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(Order $order, Order $sellerOrder, User $courier): void
    {
        $rider = app(RiderDeliveryController::class);

        // Fixtures (rolled back): order in_transit with a job for a fixture rider, another buyer.
        DB::table('orders')->where('id', $order->id)->update(['status' => 'in_transit']); // no model events
        $paymentBefore = $order->payment_status;
        [$riderUser, $personnel] = $this->makeRider($courier);
        $otherBuyer = $this->makeUser('buyer.other', ['account_type' => 'buyer', 'role' => null]);
        $job = DeliveryJob::create([
            'order_id'      => $order->id,
            'rider_user_id' => $riderUser->id,
            'personnel_id'  => $personnel->id,
            'courier_id'    => $courier->id,
            'assigned_by'   => $courier->id,
            'status'        => DeliveryJob::STATUS_ASSIGNED,
            'cod_amount'    => 0,
            'assigned_at'   => now(),
        ]);
        $this->check('fixture: in_transit order + job', 'ok', 'ok', "order #{$order->id}, job #{$job->id}, buyer #{$order->buyer_id}");

        // 1. Rider out for delivery → exactly one buyer notification
        $mark = (int) BuyerNotification::max('id');
        $r = $this->hit(fn () => $rider->outForDelivery($this->req($riderUser, 'POST'), $job->id));
        $this->check('rider out-for-delivery', $r['status'], 200, $r['body']['message'] ?? '');
        $new  = BuyerNotification::where('id', '>', $mark)->get();
        $mine = $new->where('buyer_id', $order->buyer_id);
        $this->check('buyer: new notifications', $mine->count(), 1, $mine->pluck('title')->implode(' | '));
        $this->check('buyer: title', $mine->first()?->title ?? '-', 'Out for delivery', $mine->first()?->body ?? '');
        $this->check('buyer: no "Order shipped"', $mine->where('title', 'Order shipped')->count(), 0, '');
        $this->check('buyer: data.order_id / tracking', ($mine->first()?->data['order_id'] ?? '-') . '/' . ($mine->first()?->data['tracking_status'] ?? '-'), "{$order->id}/out_for_delivery", '');
        $this->check('other buyers: none', $new->where('buyer_id', '!=', $order->buyer_id)->count(), 0, "other buyer #{$otherBuyer->id}");

        $o = Order::find($order->id);
        $this->check('orders.status in_transit -> shipped', $o->status, 'shipped', 'unchanged sync rule');
        $this->check('orders.payment_status unchanged', $o->payment_status, $paymentBefore, '');
        $this->check('tracking: out_for_delivery entry', $o->tracking_status, 'out_for_delivery', Str::limit((string) $o->tracking_message, 60));
        $trackedAt = (string) $o->tracking_updated_at;

        // 2. Repeat the request → idempotent, nothing new
        $mark2 = (int) BuyerNotification::max('id');
        $r = $this->hit(fn () => $rider->outForDelivery($this->req($riderUser, 'POST'), $job->id));
        $this->check('repeat out-for-delivery', $r['status'] . '/' . json_encode($r['body']['idempotent'] ?? false), '200/true', $r['body']['message'] ?? '');
        $this->check('repeat: no new notifications', BuyerNotification::where('id', '>', $mark2)->count(), 0, '');
        $this->check('repeat: tracking untouched', (string) Order::find($order->id)->tracking_updated_at === $trackedAt ? 'yes' : 'NO', 'yes', '');

        // 3. Next step (failed attempt) → its own tracking entry + one notification
        $mark3 = (int) BuyerNotification::max('id');
        $r = $this->hit(fn () => $rider->fail($this->req($riderUser, 'POST', ['reason' => 'buyer_not_around']), $job->id));
        $this->check('rider fail attempt', $r['status'], 200, $r['body']['message'] ?? '');
        $n3 = BuyerNotification::where('id', '>', $mark3)->get();
        $this->check('fail: buyer notifications', $n3->where('buyer_id', $order->buyer_id)->count() . '/' . $n3->count(), '1/1', $n3->pluck('title')->implode(' | '));
        $o = Order::find($order->id);
        $this->check('tracking: separate failed entry', $o->tracking_status, 'delivery_failed', Str::limit((string) $o->tracking_message, 60));
        $this->check('fail: orders.status unchanged', $o->status, 'shipped', '');

        // 4. Second attempt out for delivery (order already shipped) → 1 notification
        $mark4 = (int) BuyerNotification::max('id');
        $r = $this->hit(fn () => $rider->outForDelivery($this->req($riderUser, 'POST'), $job->id));
        $this->check('attempt 2 out-for-delivery', $r['status'], 200, $r['body']['message'] ?? '');
        $n4 = BuyerNotification::where('id', '>', $mark4)->get();
        $this->check('attempt 2: notifications', $n4->count() . ':' . $n4->pluck('title')->implode('|'), '1:Out for delivery', '');
        $this->check('tracking: out_for_delivery again', Order::find($order->id)->tracking_status, 'out_for_delivery', '');

        // 5. Suppression never leaks (also after an exception inside the scope)
        try {
            BuyerNotificationService::withoutOrderStatusNotification(fn () => throw new \RuntimeException('boom'));
        } catch (\RuntimeException) {
            // expected
        }

        // 6. Seller flow (pickup → shipped) still sends "Order shipped"
        DB::table('orders')->where('id', $sellerOrder->id)->update(['status' => 'packed']); // fixture, no events
        $sellerId = (int) DB::table('order_items')->where('order_id', $sellerOrder->id)->value('seller_id');
        $seller   = User::find($sellerId);
        Auth::setUser($seller);
        $mark6 = (int) BuyerNotification::max('id');
        $r = $this->hit(fn () => app(SellerOrderController::class)->updateStatus(Request::create('/check', 'PATCH', ['action' => 'pickup']), $sellerOrder->id));
        $this->check('seller pickup -> shipped', $r['status'] . '/' . ($r['body']['order']['status'] ?? '?'), '200/shipped', "seller #{$sellerId}");
        $n6 = BuyerNotification::where('id', '>', $mark6)->get();
        $this->check('seller flow: "Order shipped" sent', $n6->where('buyer_id', $sellerOrder->buyer_id)->where('title', 'Order shipped')->count(), 1, $n6->pluck('title')->implode(' | '));
        $this->check('seller flow: only that buyer', $n6->where('buyer_id', '!=', $sellerOrder->buyer_id)->count(), 0, '');

        // 7. Seller legacy status=shipped also still notifies
        DB::table('orders')->where('id', $sellerOrder->id)->update(['status' => 'packed']);
        $mark7 = (int) BuyerNotification::max('id');
        $r = $this->hit(fn () => app(SellerOrderController::class)->updateStatus(Request::create('/check', 'PATCH', ['status' => 'shipped']), $sellerOrder->id));
        $this->check('seller legacy status=shipped', $r['status'], 200, $r['body']['message'] ?? '');
        $this->check('legacy flow: "Order shipped" sent', BuyerNotification::where('id', '>', $mark7)->where('title', 'Order shipped')->count(), 1, '');
    }

    private function makeRider(User $courier): array
    {
        $user = $this->makeUser('rider', [
            'account_type' => 'logistics', 'role' => 'rider',
            'status' => 'approved', 'verification_status' => 'verified',
        ]);
        $personnel = CourierPersonnel::create([
            'courier_id' => $courier->id, 'user_id' => $user->id,
            'name' => 'Dedupe Test Rider', 'role' => 'rider', 'status' => 'active',
        ]);
        return [$user, $personnel];
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "Dedupe Test {$tag}",
            'first_name' => 'Dedupe',
            'last_name'  => "Test {$tag}",
            'email'      => "dedupe-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
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
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function orderSnapshot(array $ids): array
    {
        return DB::table('orders')->whereIn('id', $ids)->orderBy('id')
            ->get(['id', 'status', 'payment_status', 'tracking_status', 'tracking_message', 'tracking_updated_at', 'updated_at'])
            ->map(fn ($r) => (array) $r)->all();
    }

    private function counts(): array
    {
        return [
            'buyer_notifications' => DB::table('buyer_notifications')->count(),
            'rider_notifications' => DB::table('rider_notifications')->count(),
            'delivery_jobs'       => DB::table('delivery_jobs')->count(),
            'delivery_otps'       => DB::table('delivery_otps')->count(),
            'users'               => DB::table('users')->count(),
            'courier_personnel'   => DB::table('courier_personnel')->count(),
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
