<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BuyerOrderController;
use App\Http\Controllers\Api\BuyerReturnController;
use App\Http\Controllers\Api\BuyerReviewController;
use App\Http\Controllers\Buyer\MyReviewsController;
use App\Http\Controllers\OrderController;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Rollback-only tests for buyer web returns/refunds + reviews. The web uses
 * session routes to the SAME controllers as the mobile app, plus shared
 * eligibility flags (ReturnReviewRules). Uploaded test photos are deleted.
 *
 *   php artisan buyer:test-web-returns-reviews
 */
class BuyerTestWebReturnsReviews extends Command
{
    protected $signature = 'buyer:test-web-returns-reviews';

    protected $description = 'Rollback-only tests: web returns + reviews (same rules/endpoints as mobile), access, validation, mobile shape, product reviews';

    /** 1x1 PNG (valid for finfo + getimagesize). */
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    private const MOBILE_ORDER_KEYS = ['id', 'order_number', 'status', 'payment_status', 'payment_method', 'total', 'item_count', 'can_cancel',
        'created_at', 'shipping_name', 'shipping_address', 'shipping_phone', 'return_status', 'return_id', 'can_return',
        'tracking_status', 'tracking_message', 'tracking_updated_at', 'items'];
    private const MOBILE_ITEM_KEYS = ['review', 'can_review', 'id', 'product_id', 'product_name', 'seller_id', 'seller_name', 'image_url',
        'quantity', 'unit_price', 'subtotal', 'variant_id', 'variant_snapshot'];

    private array $rows = [];

    private int $failed = 0;

    private array $tmpFiles = [];

    public function handle(): int
    {
        $product = Product::whereHas('seller', fn ($q) => $q->where('account_type', 'seller')->where('status', 'approved'))
            ->orderBy('id')->first();
        if (! $product) {
            $this->error('Need at least one product of an approved seller.');
            return self::FAILURE;
        }

        $counts  = $this->counts();
        $stored  = [];

        DB::beginTransaction();
        try {
            $this->runTests($product);
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            // Uploaded files are not covered by the DB rollback: collect, then delete.
            $stored = array_merge(
                ReturnRequest::where('description', 'like', 'WRR test%')->pluck('images')->flatten()->all(),
                Review::where('comment', 'like', 'WRR test%')->pluck('images')->flatten()->filter()->all()
            );
            DB::rollBack();
            foreach ($stored as $p) {
                if (is_string($p) && $p !== '') Storage::disk('public')->delete($p);
            }
            foreach ($this->tmpFiles as $f) @unlink($f);
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($after));
        $left = collect($stored)->filter(fn ($p) => is_string($p) && Storage::disk('public')->exists($p))->count();
        $this->check('test photos removed', $left, 0, count($stored) . ' stored during test');

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(Product $product): void
    {
        $ret = app(BuyerReturnController::class);
        $rev = app(BuyerReviewController::class);
        $web = app(OrderController::class);
        $mob = app(BuyerOrderController::class);

        // 0. Routes: web session routes → same controller actions as mobile
        foreach ([
            ['POST', 'buyer/orders/{id}/return', BuyerReturnController::class . '@store'],
            ['GET', 'buyer/returns', BuyerReturnController::class . '@index'],
            ['GET', 'buyer/returns/{id}', BuyerReturnController::class . '@show'],
            ['POST', 'buyer/returns/{id}/escalate', BuyerReturnController::class . '@escalate'],
            ['POST', 'buyer/orders/{orderId}/items/{itemId}/review', BuyerReviewController::class . '@store'],
            ['PUT', 'buyer/reviews/{id}', BuyerReviewController::class . '@update'],
            ['GET', 'my-reviews', MyReviewsController::class . '@index'],
        ] as [$m, $uri, $action]) {
            $r  = $this->route($m, $uri);
            $ok = $r && in_array('auth', $r->gatherMiddleware(), true) && $r->getActionName() === $action;
            $this->check("route {$m} {$uri}", $ok ? 'yes' : 'NO', 'yes', $r ? implode(',', $r->gatherMiddleware()) : 'missing');
        }
        $r = $this->route('GET', 'returns');
        $this->check('route GET returns (page, auth)', $r && in_array('auth', $r->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', '');

        // Fixtures (rolled back)
        $buyerA = $this->makeUser('buyer.a', ['account_type' => 'buyer', 'role' => 'buyer']);
        $buyerB = $this->makeUser('buyer.b', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = User::find($product->seller_id);
        [$completed, $itemC]  = $this->makeOrder($buyerA, $product, 'completed');
        [$shipped, $itemS]    = $this->makeOrder($buyerA, $product, 'shipped');
        [$pending, $itemP]    = $this->makeOrder($buyerA, $product, 'pending');
        [$completed2, $itemC2] = $this->makeOrder($buyerA, $product, 'completed');

        // 1. Eligibility flags: web == mobile
        Auth::setUser($buyerA);
        foreach ([[$completed, true, true], [$shipped, true, false], [$pending, false, false]] as [$o, $canRet, $canRev]) {
            $w  = $this->inertia(fn () => $web->show($o->id))['props']['order'] ?? [];
            $m  = $this->hit(fn () => $mob->show($this->req($buyerA, [], 'GET'), $o->id))['body']['data'] ?? [];
            $got = json_encode([$w['can_return'] ?? null, $w['items'][0]['can_review'] ?? null]);
            $this->check("flags {$o->status}: web can_return/can_review", $got, json_encode([$canRet, $canRev]), '');
            $this->check("flags {$o->status}: web == mobile", json_encode([$m['can_return'] ?? null, $m['items'][0]['can_review'] ?? null]), $got, '');
        }
        $m = $this->hit(fn () => $mob->show($this->req($buyerA, [], 'GET'), $completed->id))['body']['data'] ?? [];
        $this->check('mobile order shape unchanged', $this->keys($m), $this->sorted(self::MOBILE_ORDER_KEYS), '');
        $this->check('mobile item shape unchanged', $this->keys($m['items'][0] ?? []), $this->sorted(self::MOBILE_ITEM_KEYS), '');
        $mp = $this->inertia(fn () => $web->index());
        $row = collect($mp['props']['orders'] ?? [])->firstWhere('id', $completed->id) ?? [];
        $this->check('MyPurchases: flags + reasons', json_encode([$row['can_return'] ?? null, $row['can_review'] ?? null, $row['items'][0]['can_review'] ?? null]) . '/' . count($mp['props']['returnReasons'] ?? []),
            json_encode([true, true, true]) . '/' . count(ReturnRequest::REASONS), '');

        // 2. Return: eligible → created (web session call = same controller)
        $valid = ['reason' => ReturnRequest::REASONS[0], 'description' => 'WRR test: item arrived broken.'];
        $res = $this->hit(fn () => $ret->store($this->req($buyerA, $valid, 'POST', 1), $shipped->id));
        $rrId = (int) ($res['body']['data']['id'] ?? 0);
        $this->check('return eligible (shipped): 201', $res['status'] . '/' . ($res['body']['data']['status'] ?? '-'), '201/pending', $res['body']['message'] ?? '');
        $this->check('return row in table', ReturnRequest::where('id', $rrId)->where('order_id', $shipped->id)->where('buyer_id', $buyerA->id)->exists() ? 'yes' : 'NO', 'yes', "return #{$rrId}");
        $w = $this->inertia(fn () => $web->show($shipped->id))['props']['order'] ?? [];
        $this->check('after return: web flags', json_encode([$w['can_return'] ?? null, $w['return_status'] ?? null, $w['return_id'] ?? null]), json_encode([false, 'pending', $rrId]), '');

        // 3. Not eligible / duplicate / validation
        $res = $this->hit(fn () => $ret->store($this->req($buyerA, $valid, 'POST', 1), $pending->id));
        $this->check('return pending order: rejected', $res['status'], 422, $res['body']['message'] ?? '');
        $res = $this->hit(fn () => $ret->store($this->req($buyerA, $valid, 'POST', 1), $shipped->id));
        $this->check('duplicate open return: rejected', $res['status'], 422, $res['body']['message'] ?? '');
        $this->check('still one return on order', ReturnRequest::where('order_id', $shipped->id)->count(), 1, '');
        foreach ([
            'blank description' => ['reason' => ReturnRequest::REASONS[0], 'description' => ''],
            'short description' => ['reason' => ReturnRequest::REASONS[0], 'description' => 'WRR short'],
            'description 501'   => ['reason' => ReturnRequest::REASONS[0], 'description' => 'WRR test ' . str_repeat('a', 500)],
            'invalid reason'    => ['reason' => 'Changed my mind', 'description' => 'WRR test: long enough text.'],
        ] as $label => $data) {
            $this->check("return validation: {$label}", $this->status(fn () => $ret->store($this->req($buyerA, $data, 'POST', 1), $completed->id)), 422, '');
        }
        $this->check('return validation: no photo', $this->status(fn () => $ret->store($this->req($buyerA, $valid, 'POST', 0), $completed->id)), 422, 'photos required (1-5)');
        $this->check('return validation: nothing stored', ReturnRequest::where('order_id', $completed->id)->count(), 0, '');

        // 4. Access: other buyer
        $this->check("buyer B: show A's return", $this->hit(fn () => $ret->show($this->req($buyerB, [], 'GET'), $rrId))['status'], 404, '');
        $this->check("buyer B: return on A's order", $this->hit(fn () => $ret->store($this->req($buyerB, $valid, 'POST', 1), $completed->id))['status'], 404, '');
        $this->check("buyer B: escalate A's return", $this->hit(fn () => $ret->escalate($this->req($buyerB), $rrId))['status'], 404, '');
        $list = $this->hit(fn () => $ret->index($this->req($buyerB, [], 'GET')))['body']['data'] ?? [];
        $this->check('buyer B: returns list empty', count($list), 0, '');
        $this->check('seller account: 403', $this->hit(fn () => $ret->index($this->req($seller, [], 'GET')))['status'], 403, '');
        $this->check('escalate pending (not rejected)', $this->hit(fn () => $ret->escalate($this->req($buyerA), $rrId))['status'], 422, '');

        // 5. Guest (real HTTP kernel): JSON 401, pages redirect to login
        $this->check('guest GET /buyer/returns (JSON)', $this->kernel('GET', '/buyer/returns', true), 401, '');
        $this->check('guest GET /returns (page)', $this->kernel('GET', '/returns', false), 302, 'redirect to login');
        $this->check('guest GET /my-reviews (page)', $this->kernel('GET', '/my-reviews', false), 302, 'redirect to login');

        // 6. Reviews
        $res = $this->hit(fn () => $rev->store($this->req($buyerA, ['rating' => 5, 'comment' => 'WRR test: great item'], 'POST', 1), $completed->id, $itemC->id));
        $reviewId = (int) ($res['body']['data']['id'] ?? 0);
        $this->check('review completed item: 201', $res['status'] . '/' . json_encode($res['body']['data']['can_edit'] ?? null), '201/true', '');
        $this->check('review in table', Review::where('id', $reviewId)->where('order_item_id', $itemC->id)->where('buyer_id', $buyerA->id)->exists() ? 'yes' : 'NO', 'yes', '');
        $this->check('review shipped (not completed): rejected', $this->status(fn () => $rev->store($this->req($buyerA, ['rating' => 4]), $shipped->id, $itemS->id)), 422, '');
        $this->check('review pending: rejected', $this->status(fn () => $rev->store($this->req($buyerA, ['rating' => 4]), $pending->id, $itemP->id)), 422, '');
        $this->check('second review same item: rejected', $this->status(fn () => $rev->store($this->req($buyerA, ['rating' => 3]), $completed->id, $itemC->id)), 422, '');
        $this->check('still one review on item', Review::where('order_item_id', $itemC->id)->count(), 1, '');
        $this->check('review validation: no rating', $this->status(fn () => $rev->store($this->req($buyerA, ['comment' => 'WRR test']), $completed2->id, $itemC2->id)), 422, '');
        $this->check('review validation: rating 6', $this->status(fn () => $rev->store($this->req($buyerA, ['rating' => 6]), $completed2->id, $itemC2->id)), 422, '');
        $this->check('review validation: comment 501', $this->status(fn () => $rev->store($this->req($buyerA, ['rating' => 4, 'comment' => str_repeat('c', 501)]), $completed2->id, $itemC2->id)), 422, '');
        $this->check("buyer B: review A's item", $this->status(fn () => $rev->store($this->req($buyerB, ['rating' => 1]), $completed->id, $itemC->id)), 404, '');
        $this->check("buyer B: edit A's review", $this->status(fn () => $rev->update($this->req($buyerB, ['rating' => 1], 'PUT'), $reviewId)), 404, '');
        $this->check("A's review unchanged", Review::find($reviewId)?->rating, 5, '');
        $this->check('delete review: no route (same as mobile)', $this->route('DELETE', 'buyer/reviews/{id}') || $this->route('DELETE', 'api/buyer/reviews/{id}') ? 'exists' : 'none', 'none', '');
        $res = $this->hit(fn () => $rev->update($this->req($buyerA, ['rating' => 4, 'comment' => 'WRR test: edited'], 'PUT'), $reviewId));
        $this->check('owner edit once: 200', $res['status'] . '/' . ($res['body']['data']['rating'] ?? '-'), '200/4', '');
        $this->check('owner edit twice: rejected', $this->status(fn () => $rev->update($this->req($buyerA, ['rating' => 2], 'PUT'), $reviewId)), 422, '');
        Auth::setUser($buyerA); // kernel() above cleared the guards
        $w = $this->inertia(fn () => $web->show($completed->id))['props']['order'] ?? [];
        $this->check('web item after review', json_encode([$w['items'][0]['can_review'] ?? null, $w['items'][0]['review']['id'] ?? null, $w['items'][0]['review']['can_edit'] ?? null]),
            json_encode([false, $reviewId, false]), '');

        // 7. My reviews page: own only, buyer only
        $mr = $this->inertia(fn () => app(MyReviewsController::class)->index($this->req($buyerA, [], 'GET')));
        $ids = collect($mr['props']['reviews'] ?? [])->pluck('id')->all();
        $this->check('my-reviews: component / own review', ($mr['component'] ?? '-') . '/' . json_encode($ids), 'BuyerReviews/' . json_encode([$reviewId]), '');
        $mrB = $this->inertia(fn () => app(MyReviewsController::class)->index($this->req($buyerB, [], 'GET')));
        $this->check('my-reviews (buyer B): empty', count($mrB['props']['reviews'] ?? ['x']), 0, '');
        $this->check('my-reviews (seller): 403', $this->inertia(fn () => app(MyReviewsController::class)->index($this->req($seller, [], 'GET')))['status'], 403, '');

        // 8. ProductDetail: real reviews (same data as mobile public endpoint)
        $page = Route::getRoutes()->getByName('product.show');
        $pd = $this->inertia(fn () => ($page->getAction('uses'))((string) $product->id));
        $meta = $pd['props']['reviews']['meta'] ?? [];
        $pdIds = collect($pd['props']['reviews']['data'] ?? [])->pluck('id')->all();
        $this->check('ProductDetail: has real review', in_array($reviewId, $pdIds, true) ? 'yes' : 'NO', 'yes', 'count=' . ($meta['rating_count'] ?? '?'));
        $pub = $this->hit(fn () => $rev->productReviews(Request::create('/', 'GET', ['per_page' => 10]), $product->id))['body'];
        $this->check('ProductDetail == mobile endpoint', json_encode($pd['props']['reviews'] ?? null) === json_encode($pub) ? 'yes' : 'NO', 'yes', '');
        $this->check('ProductDetail: names masked', collect($pd['props']['reviews']['data'] ?? [])->contains(fn ($r) => str_contains($r['buyer_name'] ?? '', 'buyer.a')) ? 'LEAK' : 'masked', 'masked', '');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function makeOrder(User $buyer, Product $p, string $status): array
    {
        $o = Order::create(['buyer_id' => $buyer->id, 'status' => $status, 'total' => 100, 'payment_method' => 'cod',
            'shipping_name' => 'WRR Test', 'shipping_address' => 'Test St', 'shipping_phone' => '09000000000']);
        $o->forceFill(['status' => $status])->saveQuietly();
        $item = OrderItem::create(['order_id' => $o->id, 'product_id' => $p->id, 'seller_id' => $p->seller_id,
            'product_name' => 'WRR Test Item', 'quantity' => 1, 'unit_price' => 100]);
        return [$o->fresh(), $item];
    }

    private function photo(): UploadedFile
    {
        $f = tempnam(sys_get_temp_dir(), 'wrr');
        file_put_contents($f, base64_decode(self::PNG));
        $this->tmpFiles[] = $f;
        return new UploadedFile($f, 'photo.png', 'image/png', null, true);
    }

    private function req(User $user, array $data = [], string $method = 'POST', int $photos = 0): Request
    {
        $files = $photos > 0 ? ['images' => array_map(fn () => $this->photo(), range(1, $photos))] : [];
        $r = Request::create('/check', $method, $data, [], $files, ['HTTP_ACCEPT' => 'application/json']);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    /** Status of a controller call; ValidationException → its status (422). */
    private function status(\Closure $fn): int
    {
        try {
            return $fn()->getStatusCode();
        } catch (ValidationException $e) {
            return $e->status;
        }
    }

    private function hit(\Closure $fn): array
    {
        try {
            /** @var JsonResponse $res */
            $res = $fn();
            return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
        } catch (ValidationException $e) {
            return ['status' => $e->status, 'body' => ['message' => $e->getMessage(), 'errors' => $e->errors()]];
        }
    }

    private function kernel(string $method, string $uri, bool $json): int
    {
        Auth::forgetGuards();
        $server = $json ? ['HTTP_ACCEPT' => 'application/json', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'] : [];
        return app()->handle(Request::create($uri, $method, [], [], [], $server))->getStatusCode();
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

    private function route(string $method, string $uri)
    {
        return collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === $uri && in_array($method, $r->methods(), true));
    }

    private function keys(array $a): string
    {
        return $this->sorted(array_keys($a));
    }

    private function sorted(array $k): string
    {
        sort($k);
        return implode(',', $k);
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "WRR Test {$tag}",
            'first_name' => 'WRR',
            'last_name'  => "Test {$tag}",
            'email'      => "wrr-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
            'status'     => 'approved',
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'return_requests'     => DB::table('return_requests')->count(),
            'reviews'             => DB::table('reviews')->count(),
            'orders'              => DB::table('orders')->count(),
            'order_items'         => DB::table('order_items')->count(),
            'buyer_notifications' => DB::table('buyer_notifications')->count(),
            'users'               => DB::table('users')->count(),
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
