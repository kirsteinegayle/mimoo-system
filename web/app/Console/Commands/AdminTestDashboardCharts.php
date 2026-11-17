<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Admin\AdminController;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\AdminDashboardStats;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

/**
 * Rollback-only check of the admin dashboard chart datasets:
 *   salesTrend (30 days, completed only, missing days = 0),
 *   ordersByStatus (all statuses incl. extra ones present),
 *   topSellers (completed item revenue per seller, top 5).
 * Inserts known orders, compares against the "before" snapshot, rolls back.
 *
 *   php artisan admin:test-dashboard-charts
 */
class AdminTestDashboardCharts extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'admin:test-dashboard-charts';

    protected $description = 'Rollback-only: admin dashboard salesTrend / ordersByStatus / topSellers against known inserted rows';

    public function handle(): int
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->error('Need at least one product (used only as order_items.product_id).');
            return self::FAILURE;
        }

        return $this->runRolledBack(fn () => $this->runTests($p->id), ['orders', 'order_items', 'users']);
    }

    /** Order with given status / total / created_at, and items [[seller, qty, unit_price], ...]. */
    private function order(User $buyer, string $status, float $total, CarbonImmutable $createdUtc, array $items, int $productId): Order
    {
        $o = new Order();
        $o->forceFill([
            'buyer_id' => $buyer->id, 'status' => $status, 'total' => $total, 'payment_method' => 'cod',
            'shipping_name' => 'Flow Test Buyer', 'shipping_address' => 'Purok 1, Brgy. Test, Santa Cruz, Laguna', 'shipping_phone' => '09000000000',
            'created_at' => $createdUtc->toDateTimeString(), 'updated_at' => $createdUtc->toDateTimeString(),
        ])->saveQuietly();
        foreach ($items as [$seller, $qty, $price]) {
            $it = new OrderItem();
            $it->forceFill(['order_id' => $o->id, 'product_id' => $productId, 'seller_id' => $seller->id,
                'product_name' => 'Flow Test Chart Item', 'quantity' => $qty, 'unit_price' => $price])->saveQuietly();
        }
        return $o;
    }

    private function runTests(int $productId): void
    {
        $tz     = (string) config('app.display_timezone', 'Asia/Manila');
        $today  = CarbonImmutable::now($tz)->toDateString();
        $day3   = CarbonImmutable::now($tz)->subDays(3)->toDateString();
        $day5   = CarbonImmutable::now($tz)->subDays(5)->toDateString();
        $first  = CarbonImmutable::now($tz)->subDays(29)->toDateString();

        $trendBefore  = collect(AdminDashboardStats::salesTrend())->keyBy('date');
        $statusBefore = collect(AdminDashboardStats::ordersByStatus())->pluck('count', 'status');

        $buyer   = $this->makeUser('chart-buyer', ['account_type' => 'buyer', 'email_verified_at' => now()]);
        $sellerA = $this->makeUser('chart-seller-a', ['account_type' => 'seller', 'business_name' => 'Flow Test Chart Shop A']);
        $sellerB = $this->makeUser('chart-seller-b', ['account_type' => 'seller', 'business_name' => 'Flow Test Chart Shop B']);

        $nowUtc = CarbonImmutable::now('UTC');
        // O1 completed today: A 2 x 20M
        $this->order($buyer, 'completed', 40000000, $nowUtc->subMinute(), [[$sellerA, 2, 20000000]], $productId);
        // O2 completed 3 days ago, multi-seller: A 10M + B 25M
        $this->order($buyer, 'completed', 35000000, $nowUtc->subDays(3), [[$sellerA, 1, 10000000], [$sellerB, 1, 25000000]], $productId);
        // O3 cancelled today: B 50M (must NOT count in trend / sellers)
        $this->order($buyer, 'cancelled', 50000000, $nowUtc->subMinute(), [[$sellerB, 1, 50000000]], $productId);
        // O4 completed 40 days ago: B 10M (outside trend window, counts all-time for sellers)
        $this->order($buyer, 'completed', 10000000, $nowUtc->subDays(40), [[$sellerB, 1, 10000000]], $productId);
        // O5 shipped today (status only), O6 failed (extra status)
        $this->order($buyer, 'shipped', 1000, $nowUtc->subMinute(), [[$sellerA, 1, 1000]], $productId);
        $this->order($buyer, 'failed', 1000, $nowUtc->subMinute(), [[$sellerA, 1, 1000]], $productId);

        // ── salesTrend ────────────────────────────────────────────────────
        $trend = AdminDashboardStats::salesTrend();
        $after = collect($trend)->keyBy('date');
        $delta = fn (string $d, string $k) => round((float) ($after[$d][$k] ?? 0) - (float) ($trendBefore[$d][$k] ?? 0), 2);

        $this->check('trend: 30 rows', count($trend), 30);
        $this->check('trend: first / last date', $trend[0]['date'] . ' .. ' . end($trend)['date'], "{$first} .. {$today}");
        $contiguous = collect($trend)->every(fn ($r, $i) => $r['date'] === CarbonImmutable::parse($first)->addDays($i)->toDateString());
        $this->check('trend: one row per day, no gaps', $contiguous ? 'yes' : 'no', 'yes');
        $this->check('trend: today revenue +40M (cancelled excluded)', $delta($today, 'revenue'), 40000000);
        $this->check('trend: today orders +1', $delta($today, 'orders'), 1);
        $this->check('trend: 3 days ago revenue +35M', $delta($day3, 'revenue'), 35000000);
        $this->check('trend: 3 days ago orders +1', $delta($day3, 'orders'), 1);
        $this->check('trend: untouched day unchanged', $delta($day5, 'revenue') . '/' . $delta($day5, 'orders'), '0/0');
        $totalDelta = round(collect($trend)->sum('revenue') - $trendBefore->sum('revenue'), 2);
        $this->check('trend: window total +75M (40-day-old excluded)', $totalDelta, 75000000);

        // ── ordersByStatus ────────────────────────────────────────────────
        $status = collect(AdminDashboardStats::ordersByStatus())->pluck('count', 'status');
        $sd = fn (string $s) => (int) ($status[$s] ?? 0) - (int) ($statusBefore[$s] ?? 0);
        $this->check('status: completed +3', $sd('completed'), 3);
        $this->check('status: cancelled +1', $sd('cancelled'), 1);
        $this->check('status: shipped +1', $sd('shipped'), 1);
        $this->check('status: failed +1 (extra status listed)', $status->has('failed') ? $sd('failed') : 'missing', 1);
        $this->check('status: pending unchanged', $sd('pending'), 0);
        $always = collect(['pending', 'shipped', 'in_transit', 'completed', 'cancelled'])->every(fn ($s) => $status->has($s));
        $this->check('status: base statuses always present', $always ? 'yes' : 'no', 'yes');
        $this->check('status: sum = orders count', $status->sum(), Order::count());

        // ── topSellers ────────────────────────────────────────────────────
        $top = collect(AdminDashboardStats::topSellers());
        $a = $top->firstWhere('id', $sellerA->id);
        $b = $top->firstWhere('id', $sellerB->id);
        $this->check('sellers: at most 5', $top->count() <= 5 ? 'yes' : 'no', 'yes', (string) $top->count());
        $this->check('sellers: #1 is shop A', $top->first()['id'] ?? null, $sellerA->id, $top->first()['name'] ?? '');
        $this->check('sellers: A name / revenue / orders', $a ? "{$a['name']}/{$a['revenue']}/{$a['orders']}" : 'missing', 'Flow Test Chart Shop A/50000000/2');
        $this->check('sellers: B revenue / orders (cancelled excl.)', $b ? "{$b['revenue']}/{$b['orders']}" : 'missing', '35000000/2');
        $this->check('sellers: sorted by revenue desc', $top->pluck('revenue')->all() === $top->pluck('revenue')->sortDesc()->values()->all() ? 'yes' : 'no', 'yes');

        // ── Dashboard page props (same data reaches the page) ─────────────
        $res   = app(AdminController::class)->dashboard()->toResponse(Request::create('/admin/dashboard', 'GET', [], [], [], ['HTTP_X_INERTIA' => 'true']));
        $props = json_decode((string) $res->getContent(), true)['props'] ?? [];
        $this->check('page props: salesTrend 30 rows', count($props['salesTrend'] ?? []), 30);
        $this->check('page props: ordersByStatus present', isset($props['ordersByStatus']) ? 'yes' : 'no', 'yes');
        $this->check('page props: topSellers #1', $props['topSellers'][0]['name'] ?? '-', 'Flow Test Chart Shop A');
        $this->check('page props: revenueMTD still a number', is_numeric($props['stats']['revenueMTD'] ?? null) ? 'yes' : 'no', 'yes');
    }
}
