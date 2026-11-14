<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * orders:auto-complete
 *
 * Marks shipped orders as completed when the buyer hasn't confirmed receipt
 * within --days (default 7) of the order's last update (updated_at — there is
 * no shipped_at column). Orders with an open return request
 * (pending / approved / escalated) are skipped.
 *
 * Each order is saved individually through Eloquent so the Order model's
 * updated hook creates exactly one "Order completed" notification per order.
 */
class AutoCompleteOrders extends Command
{
    protected $signature = 'orders:auto-complete {--days=7 : Days after the last update before a shipped order is completed}';

    protected $description = 'Auto-complete shipped orders not confirmed by the buyer (skips orders with an open return request)';

    public function handle(): int
    {
        $days   = max(1, (int) $this->option('days'));
        $cutoff = now()->subDays($days);
        $done   = 0;

        self::deliverableScope(Order::where('status', 'shipped')
            ->where('updated_at', '<=', $cutoff)
            ->withoutOpenReturn())
            ->orderBy('id')
            ->chunkById(100, function ($orders) use (&$done) {
                foreach ($orders as $order) {
                    // Re-check under the current state to avoid racing a buyer
                    // who just received the order or opened a return.
                    $fresh = Order::find($order->id);
                    if (! $fresh || $fresh->status !== 'shipped' || $fresh->hasOpenReturn()
                        || ! self::deliverableScope(Order::whereKey($fresh->id))->exists()) {
                        continue;
                    }
                    $fresh->update(['status' => 'completed']);
                    $done++;
                }
            });

        Log::info("orders:auto-complete completed {$done} order(s) (cutoff {$days} days)");
        $this->info("Auto-completed {$done} order(s).");

        return self::SUCCESS;
    }

    /**
     * Only orders the buyer can really have received: never an order whose delivery job is not
     * delivered (assigned, out for delivery, failed, return to sender), and never one that is still
     * held by a courier company (active assignment) without a delivered job. Orders from the old
     * flow (no job, no assignment) keep completing as before.
     */
    public static function deliverableScope($query)
    {
        return $query
            ->whereNotExists(fn ($s) => $s->select(\Illuminate\Support\Facades\DB::raw(1))->from('delivery_jobs')
                ->whereColumn('delivery_jobs.order_id', 'orders.id')->where('delivery_jobs.status', '<>', 'delivered'))
            ->where(fn ($w) => $w->whereDoesntHave('shipmentAssignments', fn ($a) => $a->active())
                ->orWhereExists(fn ($s) => $s->select(\Illuminate\Support\Facades\DB::raw(1))->from('delivery_jobs')
                    ->whereColumn('delivery_jobs.order_id', 'orders.id')->where('delivery_jobs.status', 'delivered')));
    }
}
