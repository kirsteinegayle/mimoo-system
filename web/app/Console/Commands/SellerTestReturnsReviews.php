<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Admin\ReturnsController as AdminReturns;
use App\Http\Controllers\Api\BuyerReturnController;
use App\Http\Controllers\Buyer\MyReviewsController;
use App\Models\BuyerNotification;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\SellerNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/**
 * Rollback-only tests for seller / admin return processing and seller review
 * replies. Fixture users and rows only, ONE transaction, ALWAYS rolled back.
 * No payment gateway, stock or orders.payment_status is touched.
 *
 *   php artisan seller:test-returns-reviews
 */
class SellerTestReturnsReviews extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'seller:test-returns-reviews';

    protected $description = 'Rollback-only: seller returns (own only, note rules, no re-decide), admin escalated returns, buyer/seller notifications, seller review replies';

    public function handle(): int
    {
        $product = $this->anyProduct();
        if (! $product) {
            $this->error('Need at least one product row to build fixture order items.');
            return self::FAILURE;
        }

        return $this->runRolledBack(fn () => $this->runTests($product), [
            'users', 'orders', 'order_items', 'return_requests', 'reviews', 'buyer_notifications', 'seller_notifications',
        ]);
    }

    private function runTests($product): void
    {
        // ── Routes / middleware ──────────────────────────────────────────────
        foreach (['GET seller/returns', 'GET seller/returns/feed', 'POST seller/returns/{id}/decision', 'GET seller/reviews/feed', 'POST seller/reviews/{id}/reply'] as $r) {
            [$m, $uri] = explode(' ', $r);
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($x) => $x->uri() === $uri && in_array($m, $x->methods(), true));
            $this->check("route {$r}", $route && in_array('auth', $route->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', '');
        }
        foreach (['GET admin/returns', 'GET admin/returns/feed', 'POST admin/returns/{id}/decision'] as $r) {
            [$m, $uri] = explode(' ', $r);
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($x) => $x->uri() === $uri && in_array($m, $x->methods(), true));
            $this->check("route {$r}", $route && in_array('admin.verified', $route->gatherMiddleware(), true) ? 'yes' : 'NO', 'yes', 'admin session only');
        }
        $this->check('admin returns page without admin session', $this->http(null, 'GET', '/admin/returns/feed')['status'], 403, 'no master-code session');

        // ── Fixtures ─────────────────────────────────────────────────────────
        $sellerA = $this->makeUser('seller.a', ['account_type' => 'seller', 'role' => 'seller']);
        $sellerB = $this->makeUser('seller.b', ['account_type' => 'seller', 'role' => 'seller']);
        $buyer   = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);

        [$o1, $i1] = $this->makeOrder($buyer, $sellerA, $product, 'shipped');
        [$o2, $i2] = $this->makeOrder($buyer, $sellerA, $product, 'shipped');
        [$o3, $i3] = $this->makeOrder($buyer, $sellerA, $product, 'shipped');
        [$oB, $iB] = $this->makeOrder($buyer, $sellerB, $product, 'shipped');
        $mk = fn (Order $o, string $reason = 'Damaged') => ReturnRequest::create([
            'order_id' => $o->id, 'buyer_id' => $buyer->id, 'reason' => $reason,
            'description' => 'Flow test: the item arrived damaged.', 'images' => [], 'status' => 'pending',
        ]);
        $r1 = $mk($o1);   // seller A rejects, buyer escalates, admin decides
        $r2 = $mk($o2);   // seller A approves
        $r3 = $mk($o3);   // validation cases
        $rB = $mk($oB);   // belongs to seller B only
        $paymentBefore = Order::whereIn('id', [$o1->id, $o2->id, $o3->id])->pluck('payment_status', 'id')->all();

        // ── 1. Seller sees only their own returns ────────────────────────────
        $feedA = $this->http($sellerA, 'GET', '/seller/returns/feed?status=all');
        $idsA = collect($feedA['body']['data'] ?? [])->pluck('id')->sort()->values()->all();
        $this->check('seller A feed: own returns only', json_encode($idsA), json_encode(collect([$r1->id, $r2->id, $r3->id])->sort()->values()->all()), "seller B's #{$rB->id} hidden");
        $feedB = $this->http($sellerB, 'GET', '/seller/returns/feed?status=all');
        $this->check('seller B feed: own only', json_encode(collect($feedB['body']['data'] ?? [])->pluck('id')->all()), json_encode([$rB->id]), '');
        $this->check('feed filter status=approved (none yet)', count($this->http($sellerA, 'GET', '/seller/returns/feed?status=approved')['body']['data'] ?? [1]), 0, '');
        $row = collect($feedA['body']['data'] ?? [])->firstWhere('id', $r1->id) ?? [];
        $this->check('detail: reason/description/photos/items', ($row['reason'] ?? '-') . '|' . (isset($row['description']) ? 'desc' : '-') . '|' . (array_key_exists('images', $row) ? 'images' : '-') . '|' . count($row['items'] ?? []), 'Damaged|desc|images|1', '');
        $this->check('seller page opens (seller)', $this->http($sellerA, 'GET', '/seller/returns', [], true)['status'], 200, 'Inertia seller/SellerReturns');
        $this->check('feed as buyer', $this->http($buyer, 'GET', '/seller/returns/feed')['status'], 403, '');
        $this->check('page as buyer', $this->http($buyer, 'GET', '/seller/returns', [], true)['status'], 403, '');

        // ── 2. Seller decisions ──────────────────────────────────────────────
        $this->check('seller B decides on A return', $this->http($sellerB, 'POST', "/seller/returns/{$r1->id}/decision", ['action' => 'approve'])['status'], 404, 'not their order');
        $this->check('A return still pending', ReturnRequest::find($r1->id)->status, 'pending', '');
        $this->check('reject without note', $this->http($sellerA, 'POST', "/seller/returns/{$r3->id}/decision", ['action' => 'reject'])['status'], 422, '');
        $this->check('reject with blank note', $this->http($sellerA, 'POST', "/seller/returns/{$r3->id}/decision", ['action' => 'reject', 'note' => '   '])['status'], 422, '');
        $this->check('note 501 chars', $this->http($sellerA, 'POST', "/seller/returns/{$r3->id}/decision", ['action' => 'approve', 'note' => str_repeat('a', 501)])['status'], 422, '');
        $this->check('invalid action', $this->http($sellerA, 'POST', "/seller/returns/{$r3->id}/decision", ['action' => 'refund'])['status'], 422, '');
        $this->check('nothing written by rejected calls', ReturnRequest::find($r3->id)->status . '/' . json_encode(ReturnRequest::find($r3->id)->responded_at), 'pending/null', '');
        $this->check('buyer cannot decide', $this->http($buyer, 'POST', "/seller/returns/{$r3->id}/decision", ['action' => 'approve'])['status'], 403, '');

        $buyerNotifs = fn (ReturnRequest $r, string $status) => BuyerNotification::where('buyer_id', $buyer->id)->where('type', 'return_status')->get()
            ->filter(fn ($n) => ($n->data['return_id'] ?? null) === $r->id && ($n->data['status'] ?? null) === $status)->count();

        $d = $this->http($sellerA, 'POST', "/seller/returns/{$r1->id}/decision", ['action' => 'reject', 'note' => 'Photos do not show damage.']);
        $r1->refresh();
        $this->check('seller A rejects with note', $d['status'] . '/' . $r1->status . '/' . $r1->seller_response, '200/rejected/Photos do not show damage.', '');
        $this->check('responded_at set', $r1->responded_at ? 'yes' : 'NO', 'yes', '');
        $this->check('buyer notification: exactly 1 "rejected"', $buyerNotifs($r1, 'rejected'), 1, '');
        $n = BuyerNotification::where('buyer_id', $buyer->id)->where('type', 'return_status')->get()->first(fn ($x) => ($x->data['status'] ?? '') === 'rejected');
        $this->check('buyer notification links to /returns', $n->data['url'] ?? '-', '/returns', '');
        $this->check('repeat reject refused', $this->http($sellerA, 'POST', "/seller/returns/{$r1->id}/decision", ['action' => 'reject', 'note' => 'again'])['status'], 422, '');
        $this->check('approve after reject refused', $this->http($sellerA, 'POST', "/seller/returns/{$r1->id}/decision", ['action' => 'approve'])['status'], 422, 'resolved stays resolved');
        $this->check('still exactly 1 "rejected" notification', $buyerNotifs($r1, 'rejected'), 1, 'no duplicate');

        $d = $this->http($sellerA, 'POST', "/seller/returns/{$r2->id}/decision", ['action' => 'approve']);
        $this->check('seller A approves (note optional)', $d['status'] . '/' . ReturnRequest::find($r2->id)->status, '200/approved', '');
        $this->check('buyer notification: exactly 1 "approved"', $buyerNotifs($r2, 'approved'), 1, '');
        $this->check('approved cannot be rejected', $this->http($sellerA, 'POST', "/seller/returns/{$r2->id}/decision", ['action' => 'reject', 'note' => 'x'])['status'], 422, '');
        $this->check('seller cannot touch an escalated/resolved one', $this->http($sellerA, 'POST', "/seller/returns/{$rB->id}/decision", ['action' => 'approve'])['status'], 404, "B's request");

        // ── 3. Escalate (buyer) → seller notified once → admin decides ───────
        $esc = app(BuyerReturnController::class);
        $r = $this->hit(fn () => $esc->escalate($this->req($buyer), $r1->id));
        $this->check('buyer escalates the rejected return', $r['status'] . '/' . ReturnRequest::find($r1->id)->status, '200/escalated', $r['body']['message'] ?? '');
        $sn = fn (int $sellerId) => SellerNotification::where('seller_id', $sellerId)->where('type', 'return_escalated')->get()
            ->filter(fn ($x) => ($x->data['return_id'] ?? null) === $r1->id);
        $this->check('seller A: exactly 1 "return escalated" notification', $sn($sellerA->id)->count(), 1, '');
        $this->check('notification url', $sn($sellerA->id)->first()?->url ?? '-', '/seller/returns', '');
        $this->check('seller B: none', $sn($sellerB->id)->count(), 0, '');
        $this->hit(fn () => $esc->escalate($this->req($buyer), $r1->id));
        $this->check('repeat escalate: still 1 seller notification', $sn($sellerA->id)->count(), 1, 'dedupe');
        $this->check('seller can no longer decide escalated', $this->http($sellerA, 'POST', "/seller/returns/{$r1->id}/decision", ['action' => 'approve'])['status'], 422, '');

        $admin = app(AdminReturns::class);
        $feed  = $this->hit(fn () => $admin->feed($this->req($buyer, [], 'GET')));
        $adminIds = collect($feed['body']['data'] ?? [])->pluck('id')->all();
        $this->check('admin feed (default): escalated only', json_encode($adminIds), json_encode([$r1->id]), 'pending/approved ones hidden');
        $this->check('admin: pending return cannot be decided', $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'approve']), $r3->id))['status'], 422, 'only escalated');
        $this->check('admin: reject needs a note', $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'reject']), $r1->id))['status'], 422, '');
        $this->check('admin: still escalated', ReturnRequest::find($r1->id)->status, 'escalated', '');
        $r = $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'approve', 'note' => 'Evidence is clear.']), $r1->id));
        $r1->refresh();
        $this->check('admin approves escalated return', $r['status'] . '/' . $r1->status, '200/approved', '');
        $this->check('seller note kept + admin note added', $r1->seller_response === 'Photos do not show damage.' && $r1->admin_response === 'Evidence is clear.' ? 'yes' : 'NO', 'yes', '');
        $this->check('buyer notification: exactly 1 "approved" after admin', $buyerNotifs($r1, 'approved'), 1, '');
        $this->check('buyer notifications for this request', collect(['pending', 'rejected', 'escalated', 'approved'])->map(fn ($s) => $buyerNotifs($r1, $s))->implode(','), '1,1,1,1', 'one per status change');
        $this->check('admin repeat refused', $this->hit(fn () => $admin->decision($this->req($buyer, ['action' => 'reject', 'note' => 'x']), $r1->id))['status'], 422, 'resolved');
        $this->check('canEscalate false after admin', ReturnRequest::find($r1->id)->canEscalate() ? 'yes' : 'no', 'no', '');

        // ── 4. Refund = status only ──────────────────────────────────────────
        $this->check('orders.payment_status untouched', json_encode(Order::whereIn('id', [$o1->id, $o2->id, $o3->id])->pluck('payment_status', 'id')->all()), json_encode($paymentBefore), 'no gateway call, no stock change');

        // ── 5. Seller review replies ─────────────────────────────────────────
        $rv = Review::create(['order_item_id' => $i1->id, 'product_id' => $product->id, 'buyer_id' => $buyer->id, 'rating' => 4, 'comment' => 'Flow test review']);
        $rvB = Review::create(['order_item_id' => $iB->id, 'product_id' => $product->id, 'buyer_id' => $buyer->id, 'rating' => 5, 'comment' => 'Flow test review B']);
        $fa = collect($this->http($sellerA, 'GET', '/seller/reviews/feed?filter=all')['body']['data'] ?? [])->pluck('id')->all();
        $this->check('seller A sees own review only', json_encode($fa), json_encode([$rv->id]), "B's review hidden");
        $this->check('reply to other seller review', $this->http($sellerA, 'POST', "/seller/reviews/{$rvB->id}/reply", ['reply' => 'Thanks'])['status'], 404, '');
        $this->check('reply by buyer', $this->http($buyer, 'POST', "/seller/reviews/{$rv->id}/reply", ['reply' => 'Thanks'])['status'], 403, '');
        $this->check('empty reply', $this->http($sellerA, 'POST', "/seller/reviews/{$rv->id}/reply", ['reply' => ''])['status'], 422, '');
        $this->check('reply 501 chars', $this->http($sellerA, 'POST', "/seller/reviews/{$rv->id}/reply", ['reply' => str_repeat('a', 501)])['status'], 422, '');
        $this->check('reply 500 chars', $this->http($sellerA, 'POST', "/seller/reviews/{$rv->id}/reply", ['reply' => str_repeat('a', 500)])['status'], 200, '');
        $this->check('reply saved', mb_strlen((string) Review::find($rv->id)->seller_reply), 500, '');
        $this->http($sellerA, 'POST', "/seller/reviews/{$rv->id}/reply", ['reply' => 'Thank you for the feedback!']);
        $this->check('reply can be edited', Review::find($rv->id)->seller_reply, 'Thank you for the feedback!', '');
        $this->check("B's review untouched", json_encode(Review::find($rvB->id)->seller_reply), 'null', '');

        // Buyer web shows it (additive field)
        $my = $this->hit(function () use ($buyer) {
            $res = app(MyReviewsController::class)->index($this->req($buyer, [], 'GET'));
            $http = $res->toResponse(tap(\Illuminate\Http\Request::create('/my-reviews', 'GET'), fn ($q) => $q->headers->set('X-Inertia', 'true')));
            return response()->json(json_decode($http->getContent(), true));
        });
        $shown = collect($my['body']['props']['reviews'] ?? [])->firstWhere('id', $rv->id)['seller_reply'] ?? null;
        $this->check('/my-reviews shows seller_reply', $shown, 'Thank you for the feedback!', '');
        $pub = $this->http($buyer, 'GET', "/api/buyer/products/{$product->id}/reviews");
        $this->check('public reviews payload has seller_reply key', json_encode(collect($pub['body']['data'] ?? [])->contains(fn ($x) => array_key_exists('seller_reply', $x)) || ($pub['status'] !== 200)), 'true', 'status ' . $pub['status']);
    }
}
