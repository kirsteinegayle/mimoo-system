<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Api\BuyerReturnController;
use App\Models\Order;
use App\Services\ReturnReviewRules;
use Illuminate\Console\Command;

/**
 * Rollback-only: orders.shipped_at / completed_at are stamped the first time
 * the status becomes shipped / completed (through the real update paths), and
 * the 7-day return / 30-day review windows use them (updated_at only when NULL).
 *
 *   php artisan orders:test-timestamps
 */
class OrdersTestTimestamps extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'orders:test-timestamps';

    protected $description = 'Rollback-only: shipped_at / completed_at stamping and the return / review windows';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), ['users', 'orders', 'order_items']);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $buyer  = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);

        [$o] = $this->makeOrder($buyer, $seller, $p, 'pending');
        $this->check('new order: both NULL', json_encode([$o->shipped_at, $o->completed_at]), '[null,null]', '');
        $o->update(['status' => 'packed']);
        $this->check('packed: still NULL', json_encode($o->fresh()->shipped_at), 'null', '');

        // stamping through the real hub-confirm route (packed -> shipped)
        $hub = $this->makeUser('hub', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified']);
        $r = $this->http($hub, 'POST', "/api/logistics/parcel/{$o->id}/confirm");
        $o->refresh();
        $this->check('hub confirm -> shipped_at stamped', $r['status'] . '/' . ($o->shipped_at ? 'stamped' : 'NULL'), '200/stamped', '');
        $first = $o->shipped_at->toDateTimeString();
        $this->check('completed_at still NULL', json_encode($o->completed_at), 'null', '');

        // later shipped again (rider sync) keeps the first stamp
        $o->update(['status' => 'in_transit']);
        $this->travel(2);
        $o->update(['status' => 'shipped']);
        $this->check('shipped again keeps the first stamp', $o->fresh()->shipped_at->toDateTimeString(), $first, '');
        $this->travelBack();

        // completed through the mobile receive path
        $o->update(['status' => 'completed']);
        $this->check('completed -> completed_at stamped', $o->fresh()->completed_at ? 'stamped' : 'NULL', 'stamped', '');
        $this->check('shipped_at untouched by completion', $o->fresh()->shipped_at->toDateTimeString(), $first, '');

        // ── windows ─────────────────────────────────────────────────────────
        $set = fn (Order $x, array $a) => $x->forceFill($a)->saveQuietly();
        [$s1] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        $set($s1, ['shipped_at' => now()->subDays(10), 'updated_at' => now()]);
        $this->check('return: shipped_at 10d ago, updated_at now -> closed (new column used)', json_encode(ReturnReviewRules::returnWindowOpen($s1->fresh())), 'false', '');
        $set($s1, ['shipped_at' => now()->subDays(3)]);
        $this->check('return: shipped_at 3d ago -> open', json_encode(ReturnReviewRules::returnWindowOpen($s1->fresh())), 'true', '');
        [$s2] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        $set($s2, ['shipped_at' => null, 'updated_at' => now()->subDays(10)]);
        $this->check('return: NULL stamp falls back to updated_at (10d) -> closed', json_encode(ReturnReviewRules::returnWindowOpen($s2->fresh())), 'false', '');
        $set($s2, ['updated_at' => now()->subDays(2)]);
        $this->check('return: NULL stamp, updated_at 2d -> open', json_encode(ReturnReviewRules::returnWindowOpen($s2->fresh())), 'true', '');

        [$c1] = $this->makeOrder($buyer, $seller, $p, 'completed');
        $set($c1, ['completed_at' => now()->subDays(40), 'updated_at' => now()]);
        $this->check('review: completed_at 40d ago, updated_at now -> closed', json_encode(ReturnReviewRules::reviewWindowOpen($c1->fresh())), 'false', '');
        $set($c1, ['completed_at' => now()->subDays(5)]);
        $this->check('review: completed_at 5d ago -> open', json_encode(ReturnReviewRules::reviewWindowOpen($c1->fresh())), 'true', '');
        [$c2] = $this->makeOrder($buyer, $seller, $p, 'completed');
        $set($c2, ['completed_at' => null, 'updated_at' => now()->subDays(40)]);
        $this->check('review: NULL stamp falls back to updated_at (40d) -> closed', json_encode(ReturnReviewRules::reviewWindowOpen($c2->fresh())), 'false', '');
        $set($c2, ['updated_at' => now()->subDays(5)]);
        $this->check('review: NULL stamp, updated_at 5d -> open', json_encode(ReturnReviewRules::reviewWindowOpen($c2->fresh())), 'true', '');
        [$c3] = $this->makeOrder($buyer, $seller, $p, 'completed');
        $set($c3, ['shipped_at' => now()->subDays(60), 'completed_at' => now()->subDays(1)]);
        $this->check('return on completed order counts from completed_at, not shipped_at', json_encode(ReturnReviewRules::returnWindowOpen($c3->fresh())), 'true', '');

        // the mobile/web return endpoint uses the same rule
        $api = app(BuyerReturnController::class);
        $closed = $this->hit(fn () => $api->store($this->req($buyer, ['reason' => 'Damaged', 'description' => 'Flow test description.']), $s1->id + 0));
        $set($s1, ['shipped_at' => now()->subDays(10)]);
        $res = $this->hit(fn () => $api->store($this->req($buyer, ['reason' => 'Damaged', 'description' => 'Flow test description.']), $s1->id));
        $this->check('return endpoint refuses a closed window (7-day message)', $res['status'] . '/' . ($res['body']['errors']['order'][0] ?? $res['body']['message'] ?? '-'), '422/The 7-day return period for this order has ended.', '');
    }

    private function travel(int $seconds): void
    {
        \Illuminate\Support\Carbon::setTestNow(now()->addSeconds($seconds));
    }

    private function travelBack(): void
    {
        \Illuminate\Support\Carbon::setTestNow();
    }
}
