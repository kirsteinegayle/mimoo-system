<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BuyerProductReportController;
use App\Http\Controllers\ProductController;
use App\Models\BuyerNotification;
use App\Models\Product;
use App\Models\ProductReport;
use App\Models\SellerNotification;
use App\Models\User;
use App\Services\ProductReportNotificationService;
use App\Services\ProductReportService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\DatabaseTransactionsManager as TestTransactionsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests for product reports: buyer mobile API, web endpoint
 * (shape unchanged), shared rules, and admin decision notifications
 * (reporter + seller, no reporter identity, no doubles).
 *
 * ONE wrapper transaction, ALWAYS rolled back; the testing transaction
 * manager makes DB::afterCommit() run when the admin action commits.
 *
 *   php artisan buyer:test-product-report
 */
class BuyerTestProductReport extends Command
{
    protected $signature = 'buyer:test-product-report';

    protected $description = 'Rollback-only tests: product report (mobile API + web), validation, duplicates, admin decision notifications';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $product = Product::whereHas('seller', fn ($q) => $q->where('account_type', 'seller')->where('status', 'approved'))
            ->orderBy('id')->first();
        if (! $product) {
            $this->error('Need at least one product of an approved seller.');
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
            $this->runTests($product);
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
        $this->check('rollback: product not deleted', Product::find($product->id) ? 'yes' : 'NO', 'yes', "product #{$product->id}");

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
        $api = app(BuyerProductReportController::class);
        $web = app(ProductController::class);
        $pid = (int) $product->id;

        // 0. Routes
        $r = $this->route('POST', 'api/buyer/products/{id}/report');
        $mw = $r ? $r->gatherMiddleware() : [];
        $this->check('route mobile: sanctum + throttle', $r && in_array('auth:sanctum', $mw, true) && collect($mw)->contains(fn ($m) => str_starts_with($m, 'throttle:')) ? 'yes' : 'NO', 'yes', implode(',', $mw));
        $w = $this->route('POST', 'api/products/{id}/report');
        $this->check('route web: still session auth', $w && in_array('auth', $w->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', $w ? implode(',', $w->gatherMiddleware()) : 'missing');

        // Fixtures (rolled back)
        $seller = User::find($product->seller_id);
        $buyerA = $this->makeUser('buyer.a', ['account_type' => 'buyer', 'role' => 'buyer']);
        $buyerB = $this->makeUser('buyer.b', ['account_type' => 'buyer', 'role' => 'buyer']);
        $buyerC = $this->makeUser('buyer.c', ['account_type' => 'buyer', 'role' => 'buyer']);
        $sellerNotif0 = $this->sellerRemoved($seller);
        $valid = ['reason' => 'counterfeit', 'description' => 'Looks like a fake item.'];

        // 1. Valid report (mobile)
        $res = $this->hit(fn () => $api->store($this->req($buyerA, $valid), $pid));
        $repA = (int) ($res['body']['data']['id'] ?? 0);
        $this->check('mobile valid: status / report status', $res['status'] . '/' . ($res['body']['data']['status'] ?? '-'), '201/pending', $res['body']['message'] ?? '');
        $this->check('mobile valid: row in table', ProductReport::where('id', $repA)->where('reported_by', $buyerA->id)->where('product_id', $pid)->where('reason', 'counterfeit')->exists() ? 'yes' : 'NO', 'yes', "report #{$repA}");

        // 2. Validation
        foreach ([
            'blank reason'       => ['reason' => '', 'description' => 'x'],
            'wrong reason'       => ['reason' => 'scam', 'description' => 'x'],
            'blank description'  => ['reason' => 'spam', 'description' => '   '],
            'description 501'    => ['reason' => 'spam', 'description' => str_repeat('a', ProductReportService::MAX_DESCRIPTION + 1)],
        ] as $label => $data) {
            $res = $this->hit(fn () => $api->store($this->req($buyerB, $data), $pid));
            $this->check("validation: {$label}", $res['status'] . '/' . (empty($res['body']['message']) ? 'no-msg' : 'msg'), '422/msg', Str::limit($res['body']['message'] ?? '', 60));
        }
        $this->check('validation: nothing stored', ProductReport::where('reported_by', $buyerB->id)->count(), 0, '');

        // 3. Duplicate (pending) / guest / not buyer / own product / missing product
        $res = $this->hit(fn () => $api->store($this->req($buyerA, $valid), $pid));
        $this->check('duplicate pending: rejected', $res['status'] . '/' . ($res['body']['reason'] ?? '-'), '409/already_reported', $res['body']['message'] ?? '');
        $this->check('duplicate: still one row', ProductReport::where('reported_by', $buyerA->id)->where('product_id', $pid)->count(), 1, '');
        $guest = Request::create('/check', 'POST', $valid);
        $guest->setUserResolver(fn () => null);
        $this->check('guest: 401', $this->hit(fn () => $api->store($guest, $pid))['status'], 401, '+ auth:sanctum on route');
        $this->check('seller account (mobile): 403', $this->hit(fn () => $api->store($this->req($seller, $valid), $pid))['status'], 403, '');
        $this->check('own product (service)', ProductReportService::submit($seller, $product, $valid)['error'], ProductReportService::ERR_OWN, '');
        Auth::setUser($seller);
        $res = $this->hit(fn () => $web->reportProduct($this->req($seller, $valid), $pid));
        $this->check('own product (web): rejected', $res['status'] . '/' . ($res['body']['error'] ?? '-'), '400/You cannot report your own product.', '');
        $this->check('missing product: 404', $this->hit(fn () => $api->store($this->req($buyerB, $valid), 999999999))['status'], 404, '');

        // 4. Web endpoint: same rules, shape unchanged
        Auth::setUser($buyerC);
        $res = $this->hit(fn () => $web->reportProduct($this->req($buyerC, $valid), $pid));
        $this->check('web valid: status / keys', $res['status'] . '/' . $this->keys($res['body']) . '/' . $this->keys($res['body']['report'] ?? []), '201/message,report/id,reason,status', '');
        $res = $this->hit(fn () => $web->reportProduct($this->req($buyerC, $valid), $pid));
        $this->check('web duplicate: shape', $res['status'] . '/' . ($res['body']['error'] ?? '-'), '400/You have already reported this product.', '');
        try {
            $web->reportProduct($this->req($buyerB, ['reason' => 'nope', 'description' => '']), $pid);
            $this->check('web validation: 422', 'no exception', 'ValidationException', '');
        } catch (ValidationException $e) {
            $this->check('web validation: 422', $e->status, 422, implode(',', array_keys($e->errors())));
        }

        // 5. Admin reject (dismiss) → one buyer notification, NO seller notification
        $res = $this->hit(fn () => $web->adminRejectReport($this->req($buyerA, ['notes' => 'Item checked, authentic.']), $repA));
        $this->check('admin reject: status', $res['status'] . '/' . ($res['body']['report']['status'] ?? '-'), '200/rejected', '');
        $this->check('reject: buyer A notif', $this->buyerNotifs($buyerA), 1, '');
        $n = BuyerNotification::where('buyer_id', $buyerA->id)->where('type', 'product_report')->latest('id')->first();
        $this->check('reject: notif title / status / url', ($n->title ?? '-') . '|' . ($n->data['status'] ?? '-') . '|' . ($n->data['url'] ?? '-'),
            "Your report was reviewed|rejected|/product/{$pid}", Str::limit($n->body ?? '', 60));
        $this->check('reject: admin notes not shared', str_contains((string) ($n->body ?? ''), 'authentic') ? 'LEAK' : 'no', 'no', '');
        $this->check('reject: no seller notif', $this->sellerRemoved($seller) - $sellerNotif0, 0, '');
        $res = $this->hit(fn () => $web->adminRejectReport($this->req($buyerA, ['notes' => 'again']), $repA));
        $this->check('reject again: refused', $res['status'], 400, '');
        ProductReportNotificationService::reviewed(ProductReport::find($repA), $product);
        $this->check('reject replay: no double', $this->buyerNotifs($buyerA), 1, '');
        $this->check('other buyers: no notif', $this->buyerNotifs($buyerB) + $this->buyerNotifs($buyerC), 0, '');

        // 6. After review, the same buyer may report again (web rule: only pending blocks)
        $res = $this->hit(fn () => $api->store($this->req($buyerA, $valid), $pid));
        $repA2 = (int) ($res['body']['data']['id'] ?? 0);
        $this->check('re-report after review: allowed', $res['status'], 201, '');

        // 7. Admin approve (remove product) → one buyer notif + one seller notif without reporter identity
        $res = $this->hit(fn () => $api->store($this->req($buyerB, ['reason' => 'misleading', 'description' => 'Wrong photos.']), $pid));
        $repB = (int) ($res['body']['data']['id'] ?? 0);
        $res = $this->hit(fn () => $web->adminApproveReport($this->req($buyerB, []), $repB));
        $this->check('admin approve: status', $res['status'] . '/' . ($res['body']['report']['status'] ?? '-'), '200/approved', '');
        $this->check('approve: product soft-deleted', Product::find($pid) ? 'NO' : 'yes', 'yes', '');
        $this->check('approve: buyer B notif', $this->buyerNotifs($buyerB), 1, '');
        $nb = BuyerNotification::where('buyer_id', $buyerB->id)->where('type', 'product_report')->first();
        $this->check('approve: buyer notif status', $nb->data['status'] ?? '-', 'approved', Str::limit($nb->body ?? '', 60));
        $this->check('approve: seller notif', $this->sellerRemoved($seller) - $sellerNotif0, 1, '');
        $sn = SellerNotification::where('seller_id', $seller->id)->where('type', 'product_removed')->latest('id')->first();
        $text = json_encode([$sn->title ?? '', $sn->message ?? '', $sn->data ?? []]);
        $leak = collect([$buyerB->name, $buyerB->email, $buyerB->first_name . ' ' . $buyerB->last_name, 'Wrong photos', 'misleading'])
            ->filter(fn ($s) => $s && stripos($text, (string) $s) !== false)->values()->all();
        $this->check('seller notif: no reporter identity', $leak ? 'LEAK: ' . implode(',', $leak) : 'none', 'none', Str::limit($sn->message ?? '', 60));
        $this->check('seller notif: data keys / url', $this->keys($sn->data ?? []) . '|' . ($sn->url ?? '-'), 'product_id|/seller/products', '');
        $res = $this->hit(fn () => $web->adminApproveReport($this->req($buyerB, []), $repB));
        $this->check('approve again: refused', $res['status'], 400, '');
        ProductReportNotificationService::reviewed(ProductReport::find($repB), Product::withTrashed()->find($pid));
        $this->check('approve replay: no doubles', $this->buyerNotifs($buyerB) . '/' . ($this->sellerRemoved($seller) - $sellerNotif0), '1/1', '');

        // 8. Second report on the already-removed product: reporter told, seller not told twice
        $res = $this->hit(fn () => $web->adminApproveReport($this->req($buyerA, []), $repA2));
        $this->check('approve 2nd report: status', $res['status'], 200, '');
        $this->check('approve 2nd: buyer A now 2 (rejected+approved)', $this->buyerNotifs($buyerA), 2, '');
        $this->check('approve 2nd: seller still 1', $this->sellerRemoved($seller) - $sellerNotif0, 1, '');

        // 9. Removed product can no longer be reported
        $this->check('report removed product: 404', $this->hit(fn () => $api->store($this->req($buyerC, $valid), $pid))['status'], 404, '');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function route(string $method, string $uri)
    {
        return collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === $uri && in_array($method, $r->methods(), true));
    }

    private function buyerNotifs(User $u): int
    {
        return BuyerNotification::where('buyer_id', $u->id)->where('type', 'product_report')->count();
    }

    private function sellerRemoved(User $u): int
    {
        return SellerNotification::where('seller_id', $u->id)->where('type', 'product_removed')->count();
    }

    private function keys(array $a): string
    {
        $k = array_keys($a);
        sort($k);
        return implode(',', $k);
    }

    private function hit(\Closure $fn): array
    {
        /** @var JsonResponse $res */
        $res = $fn();
        return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
    }

    private function req(User $user, array $data = []): Request
    {
        $r = Request::create('/check', 'POST', $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "Report Test {$tag}",
            'first_name' => 'Report',
            'last_name'  => "Test {$tag}",
            'email'      => "report-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
            'status'     => 'approved',
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'product_reports'      => DB::table('product_reports')->count(),
            'buyer_notifications'  => DB::table('buyer_notifications')->count(),
            'seller_notifications' => DB::table('seller_notifications')->count(),
            'users'                => DB::table('users')->count(),
            'products_trashed'     => DB::table('products')->whereNotNull('deleted_at')->count(),
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
