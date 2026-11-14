<?php

namespace App\Console\Commands\Concerns;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\DatabaseTransactionsManager as TestTransactionsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Shared plumbing for the rollback-only flow tests (flow:test-end-to-end,
 * seller:test-returns-reviews): one wrapper transaction that is ALWAYS rolled
 * back (with the testing transaction manager so DB::afterCommit inserts run,
 * as in production), fixture users, and real HTTP-kernel calls (routes +
 * middleware) as a given user with CSRF disabled for the run.
 */
trait RollbackFlowHelpers
{
    private array $rows = [];

    private int $failed = 0;

    /** Runs $body inside a rolled-back transaction and prints the result table. */
    private function runRolledBack(\Closure $body, array $countTables): int
    {
        $count = fn () => collect($countTables)->mapWithKeys(fn ($t) => [$t => DB::table($t)->count()])->all();
        $before = $count();

        $conn     = DB::connection();
        $original = app('db.transactions');
        $manager  = new TestTransactionsManager([$conn->getName()]);
        $conn->setTransactionManager($manager);
        app()->instance('db.transactions', $manager);

        // Real routes + middleware are exercised; only CSRF is switched off.
        app()->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app->make('encrypter')) extends PreventRequestForgery {
            protected function tokensMatch($request)
            {
                return true;
            }
        });

        $conn->beginTransaction();
        try {
            $body();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 90)];
        } finally {
            $conn->rollBack();
            $conn->setTransactionManager($original);
            app()->instance('db.transactions', $original);
            Auth::forgetGuards();
        }

        $this->check('rollback: counts unchanged', json_encode($count()) === json_encode($before) ? 'yes' : 'NO', 'yes', json_encode($before));

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    /** Real request through routes + middleware as $user (null = guest). @return array{status:int,body:array,raw:string} */
    private function http(?User $user, string $method, string $uri, array $data = [], bool $inertia = false): array
    {
        Auth::forgetGuards();
        Auth::shouldUse('web');
        if ($user) {
            Auth::guard('web')->setUser($user);
        }
        $server = ['HTTP_ACCEPT' => 'application/json', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'];
        if ($inertia) {
            $server['HTTP_X_INERTIA'] = 'true';
            $server['HTTP_X_INERTIA_VERSION'] = (string) app(HandleInertiaRequests::class)->version(Request::create($uri, 'GET'));
            unset($server['HTTP_ACCEPT']);
        }
        $res = app()->handle(Request::create($uri, $method, $data, [], [], $server));
        $raw = (string) $res->getContent();

        return ['status' => $res->getStatusCode(), 'body' => json_decode($raw, true) ?? [], 'raw' => $raw];
    }

    /** Controller call; validation / 404 exceptions become status rows. */
    private function hit(\Closure $fn): array
    {
        try {
            /** @var JsonResponse $res */
            $res = $fn();
            return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
        } catch (ValidationException $e) {
            return ['status' => 422, 'body' => ['message' => $e->getMessage()]];
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return ['status' => 404, 'body' => ['message' => 'Not found']];
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return ['status' => $e->getStatusCode(), 'body' => ['message' => $e->getMessage()]];
        }
    }

    private function req(User $user, array $data = [], string $method = 'POST', array $query = []): Request
    {
        $r = Request::create('/check', $method, $method === 'GET' ? $query : $data, [], [], ['HTTP_ACCEPT' => 'application/json']);
        app()->instance('request', $r); // rebinding resets the user resolver, so set it afterwards
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "Flow Test {$tag}",
            'first_name' => 'Flow',
            'last_name'  => "Test {$tag}",
            'email'      => "flow-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
            'status'     => 'approved',
        ], $attrs))->save();
        return $user;
    }

    /** Existing product used only as the item's product_id (its own seller is irrelevant: order_items.seller_id decides). */
    private function anyProduct(): ?Product
    {
        return Product::orderBy('id')->first();
    }

    /** @return array{0: Order, 1: OrderItem} */
    private function makeOrder(User $buyer, User $seller, Product $p, string $status, string $payment = 'cod'): array
    {
        $o = Order::create(['buyer_id' => $buyer->id, 'status' => 'pending', 'total' => 100, 'payment_method' => $payment,
            'shipping_name' => 'Flow Test Buyer', 'shipping_address' => 'Purok 1, Brgy. Test, Santa Cruz, Laguna', 'shipping_phone' => '09000000000']);
        $item = OrderItem::create(['order_id' => $o->id, 'product_id' => $p->id, 'seller_id' => $seller->id,
            'product_name' => 'Flow Test Item', 'quantity' => 1, 'unit_price' => 100]);
        if ($status !== 'pending') {
            $o->forceFill(['status' => $status])->saveQuietly();
        }
        return [$o->fresh(), $item];
    }

    private function check(string $label, $got, $expected, string $note = ''): void
    {
        $ok = (string) $got === (string) $expected;
        if (! $ok) {
            $this->failed++;
        }
        $this->rows[] = [$label, $got . ($ok ? '' : '  ✗'), $expected, Str::limit($note, 90)];
    }
}
