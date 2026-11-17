<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Real-data chart datasets for the admin dashboard.
 * Shared by AdminController::dashboard() and `php artisan admin:test-dashboard-charts`.
 */
class AdminDashboardStats
{
    /** Statuses always shown (even at 0), in lifecycle order. Others found in the DB are appended. */
    private const STATUS_ORDER = ['pending', 'paid', 'packed', 'shipped', 'in_transit', 'delivered', 'completed', 'cancelled'];

    private const ALWAYS_SHOWN = ['pending', 'shipped', 'in_transit', 'completed', 'cancelled'];

    private static function tz(): string
    {
        return (string) config('app.display_timezone', 'Asia/Manila');
    }

    /**
     * Last 30 days (Philippine dates, today included), one row per day, missing days = 0.
     * Completed orders only, bucketed by order created_at (same basis as revenueMTD).
     *
     * @return list<array{date: string, revenue: float, orders: int}>
     */
    public static function salesTrend(int $days = 30): array
    {
        $tz    = self::tz();
        $start = CarbonImmutable::now($tz)->startOfDay()->subDays($days - 1);

        $rows = [];
        for ($i = 0; $i < $days; $i++) {
            $d = $start->addDays($i)->toDateString();
            $rows[$d] = ['date' => $d, 'revenue' => 0.0, 'orders' => 0];
        }

        DB::table('orders')
            ->where('status', 'completed')
            ->where('created_at', '>=', $start->utc()->toDateTimeString())
            ->select(['created_at', 'total'])
            ->orderBy('id')
            ->lazy()
            ->each(function ($o) use (&$rows, $tz) {
                $d = CarbonImmutable::parse($o->created_at, 'UTC')->setTimezone($tz)->toDateString();
                if (isset($rows[$d])) {
                    $rows[$d]['revenue'] += (float) $o->total;
                    $rows[$d]['orders']++;
                }
            });

        return array_values(array_map(fn ($r) => ['date' => $r['date'], 'revenue' => round($r['revenue'], 2), 'orders' => $r['orders']], $rows));
    }

    /** @return list<array{status: string, count: int}> */
    public static function ordersByStatus(): array
    {
        $counts = DB::table('orders')
            ->select('status', DB::raw('COUNT(*) as c'))
            ->groupBy('status')
            ->pluck('c', 'status')
            ->mapWithKeys(fn ($c, $s) => [(string) ($s ?? 'unknown') => (int) $c])
            ->all();

        $keys = array_values(array_unique(array_merge(
            array_values(array_filter(self::STATUS_ORDER, fn ($s) => in_array($s, self::ALWAYS_SHOWN, true) || isset($counts[$s]))),
            array_keys($counts),
        )));

        return array_map(fn ($s) => ['status' => $s, 'count' => $counts[$s] ?? 0], $keys);
    }

    /**
     * Top sellers by completed revenue = sum of their order_items (quantity x unit_price) on completed orders.
     * `orders` = number of distinct completed orders containing that seller's items.
     *
     * @return list<array{id: int, name: string, revenue: float, orders: int}>
     */
    public static function topSellers(int $limit = 5): array
    {
        return DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->leftJoin('users as u', 'u.id', '=', 'oi.seller_id')
            ->where('o.status', 'completed')
            ->whereNotNull('oi.seller_id')
            ->groupBy('oi.seller_id', 'u.business_name', 'u.name')
            ->select([
                'oi.seller_id',
                'u.business_name',
                'u.name',
                DB::raw('SUM(oi.quantity * oi.unit_price) as revenue'),
                DB::raw('COUNT(DISTINCT oi.order_id) as orders'),
            ])
            ->orderByDesc('revenue')
            ->orderBy('oi.seller_id')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => [
                'id'      => (int) $r->seller_id,
                'name'    => trim((string) ($r->business_name ?: $r->name)) ?: "Seller #{$r->seller_id}",
                'revenue' => round((float) $r->revenue, 2),
                'orders'  => (int) $r->orders,
            ])
            ->values()
            ->all();
    }
}
