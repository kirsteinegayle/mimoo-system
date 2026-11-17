<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Sales + commission figures for the admin (Generate Reports and Manage Commission).
 * Sales are per order item (quantity x unit_price) so multi-seller orders split correctly;
 * commission = platform rate (config/platform.php, 10%) x item sales.
 */
class SalesReport
{
    public const MAX_RANGE_DAYS = 366;

    public static function build(array $f): array
    {
        $rate = (float) config('platform.commission_rate');
        $whenSql = 'COALESCE(orders.completed_at, (SELECT MAX(dj.delivered_at) FROM delivery_jobs dj WHERE dj.order_id = orders.id), orders.created_at)';
        $when = DB::raw($whenSql);

        $q = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('users as sellers', 'sellers.id', '=', 'order_items.seller_id')
            ->whereBetween($when, [$f['from'] . ' 00:00:00', $f['to'] . ' 23:59:59']);

        if ($f['status'] === 'completed') {
            // Delivered or completed only: same rule as Order::scopeDelivered().
            $q->where(function ($w) {
                $w->where('orders.status', 'completed')
                    ->orWhere(fn ($d) => $d->whereIn('orders.status', ['shipped', 'in_transit', 'delivered'])->where('orders.tracking_status', 'delivered'));
            });
        } else {
            // same definition as Order::scopeSale(): not cancelled / failed / refunded
            $q->whereNotIn('orders.status', ['cancelled', 'failed'])
                ->where(fn ($w) => $w->whereNull('orders.payment_status')->orWhere('orders.payment_status', '!=', 'refunded'));
        }
        if ($f['seller_id']) {
            $q->where('order_items.seller_id', $f['seller_id']);
        }

        $rows = $q->orderBy($when, 'desc')->limit(5000)->get([
            'orders.id as order_id',
            'orders.status',
            DB::raw("$whenSql as happened_at"),
            'order_items.seller_id',
            DB::raw("COALESCE(NULLIF(sellers.business_name, ''), sellers.name, 'Unknown seller') as seller_name"),
            'order_items.product_name',
            'order_items.quantity',
            'order_items.unit_price',
        ]);

        $lines = $rows->map(function ($r) use ($rate) {
            $total = round((float) $r->quantity * (float) $r->unit_price, 2);

            return [
                'order_id' => (int) $r->order_id,
                'order_number' => 'MIM-' . str_pad((string) $r->order_id, 8, '0', STR_PAD_LEFT),
                'date' => substr((string) $r->happened_at, 0, 10),
                'seller_id' => $r->seller_id,
                'seller' => $r->seller_name,
                'product' => $r->product_name,
                'quantity' => (int) $r->quantity,
                'unit_price' => (float) $r->unit_price,
                'line_total' => $total,
                'commission' => round($total * $rate, 2),
                'status' => $r->status,
            ];
        });

        $group = fn ($items) => [
            'orders' => $items->pluck('order_id')->unique()->count(),
            'items' => (int) $items->sum('quantity'),
            'gross_sales' => round($items->sum('line_total'), 2),
            'commission' => round($items->sum('commission'), 2),
            'seller_net' => round($items->sum('line_total') - $items->sum('commission'), 2),
        ];

        return [
            'summary' => $group($lines) + ['commission_rate' => $rate],
            'by_seller' => $lines->groupBy('seller')->map(fn ($g, $name) => ['seller' => $name] + $group($g))
                ->sortByDesc('gross_sales')->values(),
            'by_day' => $lines->groupBy('date')->map(fn ($g, $d) => [
                'date' => $d,
                'orders' => $g->pluck('order_id')->unique()->count(),
                'gross_sales' => round($g->sum('line_total'), 2),
                'commission' => round($g->sum('commission'), 2),
            ])->sortKeys()->values(),
            'by_order' => $lines->groupBy('order_id')->map(fn ($g) => [
                'order_id' => $g->first()['order_id'],
                'order_number' => $g->first()['order_number'],
                'date' => $g->first()['date'],
                'seller' => $g->pluck('seller')->unique()->implode(', '),
                'gross_sales' => round($g->sum('line_total'), 2),
                'commission' => round($g->sum('commission'), 2),
                'status' => $g->first()['status'],
            ])->values(),
            'lines' => $lines->values(),
            'truncated' => $rows->count() >= 5000,
            'generated_at' => now()->format('M d, Y g:i A'),
        ];
    }
}
