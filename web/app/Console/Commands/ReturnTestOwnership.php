<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Services\ReturnDecisionService;
use Illuminate\Console\Command;

/**
 * Rollback-only: return_requests.seller_id ownership (set on create, NULL for
 * multi-seller, fallback to order items when NULL, seller_id wins when set),
 * decided_by, and the separate admin_response column.
 *
 *   php artisan return:test-ownership
 */
class ReturnTestOwnership extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'return:test-ownership';

    protected $description = 'Rollback-only: return seller_id ownership, multi-seller NULL fallback, decided_by, admin_response';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), ['users', 'orders', 'order_items', 'return_requests']);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $buyer = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $sa    = $this->makeUser('seller.a', ['account_type' => 'seller', 'role' => 'seller']);
        $sb    = $this->makeUser('seller.b', ['account_type' => 'seller', 'role' => 'seller']);
        $sc    = $this->makeUser('seller.c', ['account_type' => 'seller', 'role' => 'seller']);

        $mk = fn (Order $o) => ReturnRequest::create(['order_id' => $o->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged',
            'description' => 'Flow test: broken item.', 'images' => [], 'status' => 'pending']);
        $feed = fn ($seller) => collect($this->http($seller, 'GET', '/seller/returns/feed?status=all')['body']['data'] ?? [])->pluck('id')->sort()->values()->all();
        $dec = fn ($seller, $r, $d = ['action' => 'approve']) => $this->http($seller, 'POST', "/seller/returns/{$r->id}/decision", $d)['status'];

        // single-seller order -> seller_id set on create
        [$o1] = $this->makeOrder($buyer, $sa, $p, 'shipped');
        $r1 = $mk($o1);
        $this->check('single seller: seller_id set on create', $r1->fresh()->seller_id, $sa->id, '');
        $this->check('owner sees it', json_encode($feed($sa)), json_encode([$r1->id]), '');
        $this->check('other seller does not', json_encode($feed($sb)), '[]', '');
        $this->check('other seller decide -> 404', $dec($sb, $r1), 404, '');

        // multi-seller order -> NULL, old rule (order items) for both
        [$o2] = $this->makeOrder($buyer, $sa, $p, 'shipped');
        OrderItem::create(['order_id' => $o2->id, 'product_id' => $p->id, 'seller_id' => $sb->id, 'product_name' => 'x', 'quantity' => 1, 'unit_price' => 5]);
        $r2 = $mk($o2);
        $this->check('multi-seller: seller_id stays NULL', json_encode($r2->fresh()->seller_id), 'null', 'not guessed');
        $this->check('multi-seller: both sellers see it (fallback)', json_encode([in_array($r2->id, $feed($sa)), in_array($r2->id, $feed($sb))]), '[true,true]', '');
        $this->check('multi-seller: unrelated seller does not', json_encode(in_array($r2->id, $feed($sc))), 'false', '');
        $this->check('multi-seller: seller B decides', $dec($sb, $r2, ['action' => 'reject', 'note' => 'No damage visible.']), 200, '');
        $r2->refresh();
        $this->check('decided_by = the seller, seller_response set, admin_response empty', $r2->decided_by . '|' . $r2->seller_response . '|' . json_encode($r2->admin_response), "{$sb->id}|No damage visible.|null", '');
        $this->check('multi-seller: seller A cannot re-decide', $dec($sa, $r2), 422, 'resolved');

        // seller_id wins over the items when set
        [$o3] = $this->makeOrder($buyer, $sa, $p, 'shipped');
        $r3 = $mk($o3);
        $r3->forceFill(['seller_id' => $sc->id])->saveQuietly();
        $this->check('seller_id set: that seller sees it even without items', json_encode(in_array($r3->id, $feed($sc))), 'true', '');
        $this->check('seller_id set: item seller does NOT (seller_id decides)', json_encode(in_array($r3->id, $feed($sa))), 'false', '');
        $this->check('seller_id set: item seller decide -> 404', $dec($sa, $r3), 404, '');
        $r3->forceFill(['seller_id' => $sa->id])->saveQuietly();

        // admin: admin_response + decided_by, seller note untouched
        $this->check('seller rejects (R3)', $dec($sa, $r3, ['action' => 'reject', 'note' => 'Seller says fine.']), 200, '');
        ReturnRequest::whereKey($r3->id)->update(['status' => 'escalated', 'escalated_at' => now()]);
        $res = ReturnDecisionService::admin($r3->id, 'approve', 'Evidence is clear.', null);
        $r3->refresh();
        $this->check('admin decision ok', json_encode($res['ok']) . '/' . $r3->status, 'true/approved', '');
        $this->check('admin note in admin_response', $r3->admin_response, 'Evidence is clear.', '');
        $this->check('seller_response NOT modified by admin', $r3->seller_response, 'Seller says fine.', 'no longer appended');
        $this->check('decided_by null for master-code admin (no user row)', json_encode($r3->decided_by), 'null', '');
        $api = app(\App\Http\Controllers\Api\BuyerReturnController::class);
        $row = $this->hit(fn () => $api->show($this->req($buyer, [], 'GET'), $r3->id));
        $this->check('buyer still sees both notes in seller_response (same shape)', str_contains((string) ($row['body']['data']['seller_response'] ?? ''), 'Seller says fine.') && str_contains((string) ($row['body']['data']['seller_response'] ?? ''), 'Evidence is clear.') ? 'yes' : 'NO', 'yes', 'status ' . $row['status']);
        $this->check('buyer payload has no extra key', array_key_exists('admin_response', $row['body']['data'] ?? []) ? 'EXTRA' : 'same shape', 'same shape', '');

        $admin2 = ReturnDecisionService::admin($r3->id, 'reject', 'again', 5);
        $this->check('admin repeat refused', json_encode($admin2['ok']), 'false', '');
        [$o4] = $this->makeOrder($buyer, $sa, $p, 'shipped');
        $r4 = $mk($o4);
        ReturnRequest::whereKey($r4->id)->update(['status' => 'escalated', 'escalated_at' => now()]);
        ReturnDecisionService::admin($r4->id, 'reject', 'Not eligible.', $sa->id);
        $this->check('decided_by = admin user id when known', $r4->fresh()->decided_by, $sa->id, '');
    }
}
