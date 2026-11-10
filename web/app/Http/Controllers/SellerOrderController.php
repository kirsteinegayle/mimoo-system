<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SellerOrderController extends Controller
{
    /**
     * Get seller's orders (orders containing their products).
     */
    public function index(): JsonResponse
    {
        $seller = Auth::user();

        if ($seller->account_type !== 'seller') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Get orders containing this seller's products
        $orders = Order::whereHas('items', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })
            ->with(['items' => function ($query) use ($seller) {
                $query->where('seller_id', $seller->id)->with('product');
            }, 'buyer:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'buyer_name' => $order->buyer->name,
                    'buyer_phone' => $order->shipping_phone,
                    'buyer_address' => $order->shipping_address,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'total' => (float) $order->items->sum(fn($item) => $item->quantity * $item->unit_price),
                    'item_count' => $order->items->count(),
                    'created_at' => $order->created_at->format('M d, Y h:i A'),
                    'waybill_number' => $order->waybill_number,
                    'waybill_generated_at' => $order->waybill_generated_at?->format('M d, Y h:i A'),
                    'waybill_printed_at' => $order->waybill_printed_at?->format('M d, Y h:i A'),
                    // Delivery tracking (display only)
                    'tracking_status' => $order->tracking_status,
                    'tracking_message' => $order->tracking_message,
                    'tracking_updated_at' => $order->tracking_updated_at?->format('M d, Y h:i A'),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'name' => $item->product_name,
                            'qty' => $item->quantity,
                            'price' => (float) $item->unit_price,
                            'stock_left' => $item->product ? $item->product->stock : null,
                            'variant_id' => $item->variant_id,
                            'variant_snapshot' => $item->variant_snapshot,
                        ];
                    }),
                ];
            });

        return response()->json(['orders' => $orders]);
    }

    /**
     * Get seller's recent orders for dashboard.
     */
    public function recent(): JsonResponse
    {
        $seller = Auth::user();

        if ($seller->account_type !== 'seller') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Get recent 10 orders
        $orders = Order::whereHas('items', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })
            ->where('status', '!=', 'cancelled')
            ->where('status', '!=', 'failed')
            ->with(['items' => function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'status' => $order->status,
                    'total' => (float) $order->items->sum(fn($item) => $item->quantity * $item->unit_price),
                    'item_count' => $order->items->sum('quantity'),
                    'created_at' => $order->created_at->diffForHumans(),
                    'is_new' => $order->created_at->greaterThan(now()->subMinutes(5)),
                ];
            });

        return response()->json(['orders' => $orders]);
    }

    /**
     * Update order status (seller can mark as shipped, completed, etc.).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $seller = Auth::user();

        // Ensure this order contains the seller's products
        $order = Order::whereHas('items', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })->findOrFail($id);

        // Check if action-based request (from SellerOrders page)
        if ($request->has('action')) {
            $action = $request->input('action');
            
            \Log::info("Order {$order->id} - Action: {$action}");
            
            // Map actions to status updates
            $newStatus = match ($action) {
                'accept' => 'paid',              // Accept order → mark as paid
                'pack' => 'packed',              // Packed, ready for logistics pickup (will show in incoming parcels)
                'pickup' => 'shipped',           // Handed to courier → shipped (deprecated)
                'waybill_printed' => null,       // No status change, just tracking
                default => null,
            };

            if ($newStatus) {
                // Auto-generate waybill when packing
                if ($action === 'pack' && !$order->hasWaybill()) {
                    $waybill = $order->generateWaybillNumber();
                    \Log::info("Order {$order->id} - Generated waybill: {$waybill}");
                }
                
                $order->update(['status' => $newStatus]);
                \Log::info("Order {$order->id} - Updated status to: {$newStatus}, waybill: " . $order->waybill_number);
                
                $messages = [
                    'accept' => 'Order accepted and now preparing.',
                    'pack' => 'Order packed and shipped. Now awaiting logistics pickup.',
                    'pickup' => 'Order handed to courier. Tracking started.',
                ];
                
                return response()->json([
                    'message' => $messages[$action] ?? 'Order updated successfully.',
                    'order' => [
                        'id' => $order->id,
                        'status' => $order->status,
                        'waybill_number' => $order->waybill_number,
                        'waybill_generated_at' => $order->waybill_generated_at,
                    ],
                ]);
            }
            
            // For waybill_printed, mark it and return
            if ($action === 'waybill_printed') {
                $order->markWaybillPrinted();
                
                return response()->json([
                    'message' => 'Waybill printed successfully.',
                    'order' => [
                        'id' => $order->id,
                        'status' => $order->status,
                        'waybill_number' => $order->waybill_number,
                        'waybill_printed_at' => $order->waybill_printed_at,
                    ],
                ]);
            }
            
            return response()->json(['error' => 'Invalid action.'], 400);
        }

        // Legacy status-based request
        $validated = $request->validate([
            'status' => ['required', 'in:paid,packed,shipped,completed'],
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Order status updated successfully.']);
    }
}
