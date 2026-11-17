<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\ShippingService;
use Illuminate\Console\Command;

/**
 * Gives ACTIVE orders that were placed before logistics routing existed (orders.logistics_id is null) a logistics,
 * using the same selection rule as checkout (coverage, lowest fee, default, oldest). Finished orders
 * (delivered / completed / cancelled / failed / refunded) are left untouched. Totals and fees are never changed.
 *
 * Reversible: every row it fills gets a "Backfilled:" prefix on logistics_reason, and --rollback clears exactly those rows.
 *
 *   php artisan orders:backfill-logistics --dry-run     count only
 *   php artisan orders:backfill-logistics               apply
 *   php artisan orders:backfill-logistics --rollback    undo
 */
class BackfillOrderLogistics extends Command
{
    protected $signature = 'orders:backfill-logistics {--dry-run : Show what would change without writing} {--rollback : Undo a previous backfill}';

    protected $description = 'Assign a logistics to active legacy orders (reversible, additive: only fills empty logistics_id)';

    public const MARK = 'Backfilled: ';

    public function handle(): int
    {
        if ($this->option('rollback')) {
            $n = Order::where('logistics_reason', 'like', self::MARK . '%')->update(['logistics_id' => null, 'logistics_reason' => null]);
            $this->info("Rolled back {$n} order(s).");

            return self::SUCCESS;
        }

        $dry = (bool) $this->option('dry-run');
        $done = 0;
        $skipped = 0;
        $query = Order::whereNull('logistics_id')
            ->whereNotIn('status', ['delivered', 'completed', 'cancelled', 'failed'])
            ->where(fn ($w) => $w->whereNull('payment_status')->orWhere('payment_status', '!=', 'refunded'));

        $total = (clone $query)->count();
        $query->with('items.product')->chunkById(200, function ($orders) use (&$done, &$skipped, $dry) {
            foreach ($orders as $o) {
                $r = $o->recipient();
                $weight = (float) ($o->parcel_weight ?: ShippingService::weightOf($o->items->map(fn ($i) => ['weight' => $i->product?->weight, 'quantity' => $i->quantity])));
                $q = ShippingService::quote($r['city'] ?? null, $r['province'] ?? null, $weight);
                if (! $q['logistics_id']) {
                    $skipped++; // no approved logistics exists at all

                    continue;
                }
                if (! $dry) {
                    // forceFill + saveQuietly: no model events / notifications, only these two columns change
                    $o->forceFill(['logistics_id' => $q['logistics_id'], 'logistics_reason' => mb_substr(self::MARK . $q['reason'], 0, 250)])->saveQuietly();
                }
                $done++;
            }
        });

        $this->info(($dry ? '[dry run] ' : '') . "Active orders without logistics: {$total}. " . ($dry ? 'Would assign' : 'Assigned') . ": {$done}. Skipped (no logistics available): {$skipped}.");

        return self::SUCCESS;
    }
}
