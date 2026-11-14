<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SellerDashboardController extends Controller
{
    /**
     * Display the seller dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $sellerId = $user->id;

        // FILTER: Only include orders from Oct 11, 2026 onwards (when real data started)
        $startDate = '2026-10-11 06:00:00';

        // Get all products for this seller
        $products = Product::where('seller_id', $sellerId)->get();
        $productIds = $products->pluck('id');

        // Calculate current month stats for chart
        $currentMonthStart = now()->startOfMonth();
        $currentMonthEnd = now()->endOfMonth();
        
        $currentMonthSalesTotal = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate, $currentMonthStart, $currentMonthEnd) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate)
                    ->whereBetween('created_at', [$currentMonthStart, $currentMonthEnd]);
            })
            ->selectRaw('SUM(quantity * unit_price) as revenue')
            ->value('revenue') ?? 0;
            
        $currentMonthOrdersCount = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate, $currentMonthStart, $currentMonthEnd) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate)
                    ->whereBetween('created_at', [$currentMonthStart, $currentMonthEnd]);
            })
            ->distinct('order_id')
            ->count('order_id');

        // Get last 6 months of sales data for chart
        $monthlySales = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $sales = OrderItem::whereIn('product_id', $productIds)
                ->whereHas('order', function ($query) use ($startDate, $monthStart, $monthEnd) {
                    $query->whereNotIn('status', ['cancelled', 'failed'])
                        ->where('created_at', '>=', $startDate)
                        ->whereBetween('created_at', [$monthStart, $monthEnd]);
                })
                ->selectRaw('SUM(quantity * unit_price) as revenue')
                ->value('revenue') ?? 0;
                
            $monthlySales[] = [
                'month' => $monthStart->format('M'),
                'sales' => (float) $sales,
            ];
        }

        // Calculate total sales (only from valid orders after start date)
        $totalSales = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate);
            })
            ->selectRaw('SUM(quantity * unit_price) as revenue')
            ->value('revenue') ?? 0;

        // Calculate previous month sales for growth (with date filter)
        $previousMonthSales = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate)
                    ->whereBetween('created_at', [
                        now()->subMonths(2)->startOfMonth(),
                        now()->subMonth()->endOfMonth()
                    ]);
            })
            ->selectRaw('SUM(quantity * unit_price) as revenue')
            ->value('revenue') ?? 0;

        $currentMonthSales = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate)
                    ->whereBetween('created_at', [
                        now()->startOfMonth(),
                        now()->endOfMonth()
                    ]);
            })
            ->selectRaw('SUM(quantity * unit_price) as revenue')
            ->value('revenue') ?? 0;

        // Calculate sales growth percentage
        $salesGrowth = 0;
        if ($previousMonthSales > 0) {
            $salesGrowth = (($currentMonthSales - $previousMonthSales) / $previousMonthSales) * 100;
        } elseif ($currentMonthSales > 0) {
            $salesGrowth = 100; // 100% growth if previous was 0 but current has sales
        }

        // Count total orders (with date filter)
        $totalOrders = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate);
            })
            ->distinct('order_id')
            ->count('order_id');

        // Count pending orders (to prepare) - includes both 'pending' and 'paid' status (with date filter)
        $pendingOrders = DB::table('order_items')
            ->whereIn('product_id', $productIds)
            ->whereIn('order_id', function ($query) use ($startDate) {
                $query->select('id')
                    ->from('orders')
                    ->whereIn('status', ['pending', 'paid'])
                    ->where('created_at', '>=', $startDate);
            })
            ->distinct()
            ->count('order_id');

        // Count low stock items (stock <= 10)
        $lowStockCount = Product::where('seller_id', $sellerId)
            ->where('stock', '<=', 10)
            ->where('stock', '>', 0)
            ->count();

        // Get recent orders (grouped by order, showing total) - with date filter
        $recentOrders = Order::whereHas('items', function ($query) use ($productIds) {
                $query->whereIn('product_id', $productIds);
            })
            ->with(['buyer', 'items' => function ($query) use ($productIds) {
                $query->whereIn('product_id', $productIds);
            }])
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                // Get seller's items from this order
                $sellerItems = $order->items;
                $itemNames = $sellerItems->pluck('product_name')->implode(', ');
                $sellerTotal = $sellerItems->sum(fn($item) => $item->quantity * $item->unit_price);
                
                return [
                    'id' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'buyer_name' => $order->buyer->name ?? 'Unknown',
                    'item' => $itemNames ?: 'N/A',
                    'total' => (float) $sellerTotal,
                    'status' => $this->mapOrderStatus($order->status),
                    'date' => $order->created_at->format('M d, Y'),
                ];
            });

        // Get top products by revenue (with date filter)
        $topProducts = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($query) use ($startDate) {
                $query->whereNotIn('status', ['cancelled', 'failed'])
                    ->where('created_at', '>=', $startDate);
            })
            ->select('product_id', 'product_name')
            ->selectRaw('SUM(quantity) as units_sold')
            ->selectRaw('SUM(quantity * unit_price) as revenue')
            ->groupBy('product_id', 'product_name')
            ->orderBy('revenue', 'desc')
            ->limit(5)
            ->get()
            ->values()
            ->map(function ($item, $index) use ($totalSales) {
                $sharePercent = $totalSales > 0 ? ($item->revenue / $totalSales) * 100 : 0;
                return [
                    'rank' => $index + 1,
                    'name' => $item->product_name,
                    'units_sold' => (int) $item->units_sold,
                    'revenue' => (float) $item->revenue,
                    'share_percent' => round($sharePercent, 1),
                ];
            });

        // Get low stock items
        $lowStockItems = Product::where('seller_id', $sellerId)
            ->where('stock', '<=', 10)
            ->where('stock', '>', 0)
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                $reorderPoint = 10; // Default reorder point
                $percentage = ($product->stock / $reorderPoint) * 100;
                return [
                    'name' => $product->name,
                    'reorder_point' => $reorderPoint,
                    'current_stock' => $product->stock,
                    'percentage' => round($percentage, 0),
                ];
            });

        return Inertia::render('seller/SellerDashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                    'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                    'cover_photo' => $user->cover_photo ? asset('storage/' . $user->cover_photo) : null,
                ],
            ],
            'seller' => [
                'store_name' => $user->business_name ?? $user->name,
                'business_name' => $user->business_name,
                'profile_photo_url' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'cover_photo_url' => $user->cover_photo ? asset('storage/' . $user->cover_photo) : null,
            ],
            'stats' => [
                'total_sales' => (float) $totalSales,
                'sales_growth' => round($salesGrowth, 1),
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'store_rating' => 0, // TODO: Calculate from reviews when implemented
                'total_reviews' => 0, // TODO: Count from reviews when implemented
                'to_prepare' => $pendingOrders,
                'low_stock_count' => $lowStockCount,
                'new_messages' => 0, // TODO: Count from messages when implemented
                'new_reviews' => 0, // TODO: Count from reviews when implemented
                'current_month_sales' => (float) $currentMonthSalesTotal,
                'current_month_orders' => $currentMonthOrdersCount,
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'lowStockItems' => $lowStockItems,
            'chartData' => [
                'monthly_sales' => $monthlySales,
            ],
        ]);
    }

    /**
     * Map order status to display status.
     */
    private function mapOrderStatus(string $status): string
    {
        return match ($status) {
            'pending' => 'To Ship',
            'paid' => 'To Ship',
            'packed' => 'To Ship',
            'shipped', 'in_transit' => 'In Transit',
            'completed' => 'Delivered',
            default => ucfirst($status),
        };
    }

    /**
     * Save the seller's store (brand) name. It lives in users.business_name so the
     * admin seller list and detail read the same value the seller sees.
     */
    public function updateStoreName(Request $request)
    {
        $data = $request->validate([
            'store_name' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $user = Auth::user();
        $user->business_name = trim($data['store_name']);
        $user->save();

        return back()->with('success', 'Store name saved.');
    }
}
