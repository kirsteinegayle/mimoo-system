<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

/**
 * Seller analytics. One definition of a "sale", shared with the seller dashboard and the admin sales
 * report: an order line of this seller on an order that is not cancelled, failed or refunded
 * (Order::scopeSale). The time window is the last N calendar days INCLUDING today, by order date, the
 * same date the Orders page shows. Money = quantity x unit_price of THIS seller's lines only
 * (no shipping fee, no other sellers' items in a mixed order).
 */
class SellerAnalyticsController extends Controller
{
    /**
     * Get seller analytics data.
     * Supports range: 7d, 30d, 90d
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Only sellers can access this endpoint
        if ($user->account_type !== 'seller') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $range = $request->query('range', '30d');
        $days = $this->getDaysFromRange($range);
        $from = now()->subDays($days - 1)->startOfDay();

        if (! Product::where('seller_id', $user->id)->exists() && ! OrderItem::where('seller_id', $user->id)->exists()) {
            return response()->json($this->getEmptyAnalytics());
        }

        // Inventory cards (live products only)
        $products = Product::where('seller_id', $user->id);
        $totalProducts = (clone $products)->count();
        $totalStockUnits = (int) (clone $products)->sum('stock');
        $lowStockItems = (clone $products)->whereRaw('stock > 0 AND stock <= COALESCE(low_stock_threshold, 5)')->count();
        $outOfStockItems = (clone $products)->where('stock', 0)->count();

        // This seller's sale lines in the window (by seller_id, so deleted products still count)
        $lines = fn () => OrderItem::where('seller_id', $user->id)
            ->whereHas('order', fn ($q) => $q->sale()->where('created_at', '>=', $from));

        $totalUnitsSold = (int) $lines()->sum('quantity');
        $totalRevenue = (float) ($lines()->selectRaw('SUM(quantity * unit_price) as revenue')->value('revenue') ?? 0);

        // Sales over time: one point per calendar day, zero-filled
        $byDay = $lines()->with('order:id,created_at')->get(['order_id', 'quantity', 'unit_price'])
            ->groupBy(fn ($i) => $i->order->created_at->toDateString());
        $salesOverTime = collect(range(0, $days - 1))->map(function ($n) use ($from, $byDay) {
            $d = $from->copy()->addDays($n)->toDateString();
            $rows = $byDay[$d] ?? collect();

            return [
                'date' => $d,
                'revenue' => round((float) $rows->sum(fn ($i) => $i->quantity * $i->unit_price), 2),
                'units' => (int) $rows->sum('quantity'),
            ];
        })->values();

        // Top selling products (units), same lines
        $topSellingProducts = $lines()->selectRaw('product_id, MAX(product_name) as name, SUM(quantity) as units_sold')
            ->groupBy('product_id')->orderByDesc('units_sold')->limit(10)->get()
            ->map(function ($row) {
                $product = Product::withTrashed()->find($row->product_id);

                return [
                    'id' => (int) $row->product_id,
                    'name' => $product?->name ?? $row->name,
                    'units_sold' => (int) $row->units_sold,
                    'image' => $product?->main_image,
                ];
            })->values();

        // Stock levels per product
        $stockLevels = Product::where('seller_id', $user->id)
            ->select('id', 'name', 'stock', 'low_stock_threshold')
            ->orderBy('stock', 'asc')
            ->take(20)
            ->get()
            ->map(function ($product) {
                $threshold = $product->low_stock_threshold ?? 5;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock' => $product->stock,
                    'threshold' => $threshold,
                    'status' => $product->stock == 0 ? 'out' : ($product->stock <= $threshold ? 'low' : 'ok'),
                ];
            });

        return response()->json([
            'summary' => [
                'total_products' => $totalProducts,
                'total_stock_units' => $totalStockUnits,
                'low_stock_items' => $lowStockItems,
                'out_of_stock_items' => $outOfStockItems,
                'total_units_sold' => $totalUnitsSold,
                'total_revenue' => round($totalRevenue, 2),
            ],
            'sales_over_time' => $salesOverTime,
            'top_selling_products' => $topSellingProducts,
            'stock_levels' => $stockLevels,
            'range' => $range,
            'days' => $days,
            'from' => $from->toDateString(),
            'to' => Carbon::today()->toDateString(),
        ]);
    }

    /**
     * Convert range string to days.
     */
    private function getDaysFromRange(string $range): int
    {
        return match ($range) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            default => 30,
        };
    }

    /**
     * Return empty analytics structure for sellers with no products.
     */
    private function getEmptyAnalytics(): array
    {
        return [
            'summary' => [
                'total_products' => 0,
                'total_stock_units' => 0,
                'low_stock_items' => 0,
                'out_of_stock_items' => 0,
                'total_units_sold' => 0,
                'total_revenue' => 0.0,
            ],
            'sales_over_time' => [],
            'top_selling_products' => [],
            'stock_levels' => [],
            'range' => '30d',
            'days' => 30,
        ];
    }
}
