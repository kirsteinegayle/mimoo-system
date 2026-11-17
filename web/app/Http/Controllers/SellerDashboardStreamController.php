<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SellerDashboardStreamController extends Controller
{
    /**
     * Server-Sent Events stream for real-time seller dashboard updates.
     * 
     * Sends updates every 5 seconds with current stock, sold count, and revenue.
     */
    public function stream(Request $request): StreamedResponse
    {
        $seller = Auth::user();

        if ($seller->account_type !== 'seller') {
            abort(403);
        }

        return response()->stream(function () use ($seller) {
            // Close session to prevent blocking
            session_write_close();
            
            // Disable default output buffering
            if (ob_get_level()) {
                ob_end_clean();
            }
            
            // Set reasonable execution time (5 minutes max)
            set_time_limit(300);
            
            // Send initial connection success message
            echo "data: " . json_encode(['status' => 'connected', 'timestamp' => now()->toIso8601String()]) . "\n\n";
            if (ob_get_level() > 0) ob_flush();
            flush();

            // Keep connection alive
            $maxIterations = 60; // 5 minutes (60 * 5 seconds)
            $iteration = 0;
            
            while ($iteration < $maxIterations) {
                // Check if connection is still alive
                if (connection_aborted()) {
                    break;
                }

                try {
                    // Get current stats
                    $stats = $this->getSellerStats($seller->id);

                    // Send SSE event
                    echo "data: " . json_encode($stats) . "\n\n";
                    
                    // Flush output buffer
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                } catch (\Exception $e) {
                    // Send error event
                    echo "data: " . json_encode(['error' => 'Failed to fetch stats', 'timestamp' => now()->toIso8601String()]) . "\n\n";
                    if (ob_get_level() > 0) ob_flush();
                    flush();
                }

                // Wait 5 seconds before next update
                sleep(5);
                $iteration++;
            }
            
            // Send closing message
            echo "data: " . json_encode(['status' => 'closing', 'timestamp' => now()->toIso8601String()]) . "\n\n";
            if (ob_get_level() > 0) ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    /**
     * Get current seller statistics.
     */
    private function getSellerStats(int $sellerId): array
    {
        // Get all products for seller
        $products = Product::where('seller_id', $sellerId)->get();

        // Calculate total stock
        $totalStock = $products->sum('stock');

        // Calculate total sold (only from valid orders)
        $totalSold = \App\Support\SoldStats::total($sellerId);

        // Calculate total revenue (only from valid orders)
        $totalRevenue = OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($query) {
                $query->whereNotIn('status', ['cancelled', 'failed']);
            })
            ->selectRaw('SUM(quantity * unit_price) as revenue')
            ->value('revenue') ?? 0;

        // Get recent orders (last 10)
        $recentOrders = OrderItem::where('seller_id', $sellerId)
            ->with('order')
            ->whereHas('order', function ($query) {
                $query->whereNotIn('status', ['cancelled', 'failed']);
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'order_id' => $item->order_id,
                    'order_number' => 'MIM-' . str_pad($item->order_id, 8, '0', STR_PAD_LEFT),
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'total' => (float) ($item->quantity * $item->unit_price),
                    'status' => \App\Http\Controllers\SellerDashboardController::mapOrderStatus((string) $item->order->status, $item->order->tracking_status),
                    'created_at' => $item->created_at->diffForHumans(),
                    'is_new' => $item->created_at->greaterThan(now()->subMinutes(5)),
                ];
            });

        // Product-level stats (top 5 products by revenue)
        $topProducts = Product::where('seller_id', $sellerId)
            ->withCount([
                'orderItems as total_sold' => function ($query) {
                    $query->select(\DB::raw('COALESCE(SUM(quantity), 0)'))
                        ->whereHas('order', function ($q) {
                            $q->whereNotIn('status', ['cancelled', 'failed']);
                        });
                }
            ])
            ->having('total_sold', '>', 0)
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock' => $product->stock,
                    'sold' => $product->total_sold,
                    'status' => $product->status,
                ];
            });

        return [
            'timestamp' => now()->toIso8601String(),
            'total_stock' => $totalStock,
            'total_sold' => (int) $totalSold,
            'total_revenue' => (float) $totalRevenue,
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
        ];
    }
}
