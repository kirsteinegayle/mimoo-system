<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Show the checkout page.
     */
    public function checkout(Request $request): Response
    {
        $user = Auth::user();

        // Only buyers can checkout
        if ($user->account_type !== 'buyer') {
            abort(403, 'Only buyers can checkout.');
        }

        // Get cart with items
        $cart = Cart::with(['items.product.seller:id,business_name,name'])
            ->where('buyer_id', $user->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return redirect()->route('cart')->with('error', 'Your cart is empty.');
        }

        // Get selected item IDs from query string (comma-separated: ?items=1,2,5)
        $selectedItemIds = [];
        if ($request->has('items') && !empty($request->input('items'))) {
            $selectedItemIds = array_map('intval', explode(',', $request->input('items')));
        }

        // Filter items based on selection (if no selection, use all items)
        $cartItems = $cart->items;
        if (!empty($selectedItemIds)) {
            $cartItems = $cartItems->filter(function ($item) use ($selectedItemIds) {
                return in_array($item->id, $selectedItemIds);
            });
        }

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart')->with('error', 'No items selected for checkout.');
        }

        // Validate all items
        $items = $cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'product_image' => $item->product->main_image,
                'seller_name' => $item->product->seller->business_name ?? $item->product->seller->name,
                'unit_price' => (float) ($item->product->sale_price ?? $item->product->price),
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
                'is_valid' => $item->isValid(),
                'validation_issue' => $item->getValidationIssue(),
            ];
        });

        // Check for invalid items
        if ($items->contains('is_valid', false)) {
            return redirect()->route('cart')->with('error', 'Some items in your cart are invalid. Please review before checkout.');
        }

        // Calculate totals for selected items only
        $subtotal = $items->sum('line_total');

        return Inertia::render('Checkout', [
            'cartItems' => $items->values(),
            'subtotal' => (float) $subtotal,
            'total' => (float) $subtotal,
        ]);
    }

    /**
     * Place an order (CRITICAL: ATOMIC TRANSACTION).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'in:cod,gcash,paymongo'],
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
            'cart_item_ids' => ['nullable', 'array'], // Selected cart item IDs
            'cart_item_ids.*' => ['integer'],
            'voucher_code' => ['nullable', 'string', 'max:50'], // Voucher code
        ]);

        $user = Auth::user();

        // Only buyers can place orders
        if ($user->account_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can place orders.'], 403);
        }

        // Check for duplicate submission (idempotency)
        if (!empty($validated['idempotency_key'])) {
            $existingOrder = Order::where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existingOrder) {
                return response()->json([
                    'message' => 'Order already placed.',
                    'order_id' => $existingOrder->id,
                    'order_number' => 'MIM-' . str_pad($existingOrder->id, 8, '0', STR_PAD_LEFT),
                ], 200);
            }
        }

        try {
            // START TRANSACTION
            DB::beginTransaction();

            // 1. Load buyer's cart
            $cart = Cart::with('items.product.seller')
                ->where('buyer_id', $user->id)
                ->lockForUpdate() // Lock cart during checkout
                ->first();

            if (!$cart || $cart->items->isEmpty()) {
                DB::rollBack();
                return response()->json(['error' => 'Your cart is empty.'], 400);
            }

            // Filter items if specific cart_item_ids provided
            $cartItems = $cart->items;
            if (!empty($validated['cart_item_ids'])) {
                $cartItems = $cartItems->filter(function ($item) use ($validated) {
                    return in_array($item->id, $validated['cart_item_ids']);
                });
            }

            if ($cartItems->isEmpty()) {
                DB::rollBack();
                return response()->json(['error' => 'No items selected for checkout.'], 400);
            }

            // 2. Re-validate every item on server
            $orderItems = [];
            $total = 0;
            $productIds = []; // For consistent ordering to avoid deadlocks

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;

                // Validation checks
                if (!$product || $product->trashed()) {
                    DB::rollBack();
                    return response()->json(['error' => "Product '{$cartItem->product->name}' is no longer available."], 400);
                }

                if ($product->status !== 'active') {
                    DB::rollBack();
                    return response()->json(['error' => "Product '{$product->name}' is not available for purchase."], 400);
                }

                // Seller cannot buy their own product
                if ($product->seller_id === $user->id) {
                    DB::rollBack();
                    return response()->json(['error' => "You cannot purchase your own product '{$product->name}'."], 400);
                }

                $productIds[] = $product->id;
            }

            // Sort product IDs to process in consistent order (prevent deadlocks)
            sort($productIds);

            // 3. ATOMIC STOCK DEDUCTION (process in sorted order)
            foreach ($productIds as $productId) {
                $cartItem = $cartItems->firstWhere('product_id', $productId);
                $quantity = $cartItem->quantity;

                // Lock row and attempt atomic deduction
                $affectedRows = Product::where('id', $productId)
                    ->where('stock', '>=', $quantity)
                    ->update([
                        'stock' => DB::raw("stock - {$quantity}"),
                        'updated_at' => now(),
                    ]);

                // If no rows affected, insufficient stock
                if ($affectedRows === 0) {
                    $product = Product::find($productId);
                    DB::rollBack();
                    return response()->json([
                        'error' => "Insufficient stock for '{$product->name}'. Only {$product->stock} left.",
                        'product_name' => $product->name,
                        'available_stock' => $product->stock,
                    ], 400);
                }

                // Reload product to get updated stock
                $product = Product::find($productId);
                $oldStock = $product->stock + $quantity; // Calculate old stock

                // Get current price (use sale price if available)
                $unitPrice = $product->sale_price ?? $product->price;
                $lineTotal = $unitPrice * $quantity;
                $total += $lineTotal;

                // Store order item data
                $orderItems[] = [
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'product_name' => $product->name, // Snapshot
                    'variant_id' => $cartItem->variant_id ?? null,
                    'variant_snapshot' => $cartItem->variant_snapshot ? json_encode($cartItem->variant_snapshot) : null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                ];

                // 5. Write StockLog entry
                StockLog::log(
                    productId: $product->id,
                    change: -$quantity,
                    oldStock: $oldStock,
                    newStock: $product->stock,
                    reason: 'order',
                    referenceId: null // Will update after order creation
                );

                // 6. If stock reaches 0, set status to out_of_stock
                if ($product->stock === 0) {
                    $product->update(['status' => 'out_of_stock']);
                }
            }

            // 3.5. Validate and apply voucher (if provided)
            $voucher = null;
            $voucherDiscount = 0;
            $voucherUsage = null;
            
            if (!empty($validated['voucher_code'])) {
                $voucher = \App\Models\Voucher::where('code', strtoupper($validated['voucher_code']))->first();
                
                if (!$voucher || !$voucher->isValid()) {
                    DB::rollBack();
                    return response()->json(['error' => 'Invalid or expired voucher code.'], 400);
                }
                
                // Check if user has CLAIMED this voucher
                $voucherUsage = \App\Models\VoucherUsage::where('voucher_id', $voucher->id)
                    ->where('user_id', $user->id)
                    ->first();
                
                if (!$voucherUsage) {
                    DB::rollBack();
                    return response()->json(['error' => 'You need to claim this voucher first before using it.'], 400);
                }
                
                // Check if already used
                if ($voucherUsage->used_at !== null) {
                    DB::rollBack();
                    return response()->json(['error' => 'You have already used this voucher.'], 400);
                }
                
                if ($total < $voucher->min_purchase) {
                    DB::rollBack();
                    return response()->json(['error' => "Minimum purchase of ₱" . number_format($voucher->min_purchase, 2) . " required for this voucher."], 400);
                }
                
                // Calculate discount
                $voucherDiscount = $voucher->calculateDiscount($total);
                
                // Apply discount to total
                $total = max(0, $total - $voucherDiscount);
            }

            // 4. Create Order
            $order = Order::create([
                'buyer_id' => $user->id,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'payment_method' => $validated['payment_method'],
                'shipping_name' => $validated['shipping_name'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_phone' => $validated['shipping_phone'],
                'idempotency_key' => $validated['idempotency_key'] ?? null,
            ]);

            // Create OrderItems
            foreach ($orderItems as &$item) {
                $item['order_id'] = $order->id;
            }
            OrderItem::insert($orderItems);

            // Record voucher usage (if voucher was applied)
            if ($voucher && $voucherUsage) {
                // Update the existing claim record to mark as used
                $voucherUsage->update([
                    'order_id' => $order->id,
                    'discount_amount' => $voucherDiscount,
                    'used_at' => now(),
                ]);
            }

            // Update StockLog reference_id with order ID
            StockLog::where('reference_id', null)
                ->where('reason', 'order')
                ->whereIn('product_id', $productIds)
                ->where('created_at', '>=', now()->subSeconds(5))
                ->update(['reference_id' => (string) $order->id]);

            // 7. Clear only the checked out items from cart
            if (!empty($validated['cart_item_ids'])) {
                CartItem::whereIn('id', $validated['cart_item_ids'])->delete();
            } else {
                // If no specific items provided, clear entire cart
                $cart->items()->delete();
            }

            // COMMIT TRANSACTION
            DB::commit();

            Log::info("Order {$order->id} placed successfully by buyer {$user->id}");

            return response()->json([
                'message' => 'Order placed successfully!',
                'order_id' => $order->id,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Checkout failed. Please try again.'], 500);
        }
    }

    /**
     * Show order success page.
     */
    public function success(Request $request): Response
    {
        $orderId = $request->query('order_id');
        $order = Order::with('items.product')->findOrFail($orderId);

        // Ensure buyer can only see their own order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('OrderSuccess', [
            'order' => [
                'id' => $order->id,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'total' => (float) $order->total,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'shipping_name' => $order->shipping_name,
                'shipping_address' => $order->shipping_address,
                'shipping_phone' => $order->shipping_phone,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'items' => $order->items->map(fn($item) => [
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ],
        ]);
    }

    /**
     * List buyer's orders.
     */
    public function index(): Response
    {
        $orders = $this->getOrdersData();

        return Inertia::render('MyPurchases', [
            'orders' => $orders,
            'returnReasons' => \App\Models\ReturnRequest::REASONS,
        ]);
    }

    /**
     * Get orders data as JSON (for refresh).
     */
    public function getData(): JsonResponse
    {
        $orders = $this->getOrdersData();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Distinct sellers of an order (for "Chat with seller"): [{id, name}].
     * Expects items.seller to be loaded.
     */
    private function orderSellers(Order $order): array
    {
        return $order->items
            ->filter(fn ($item) => $item->seller_id && $item->seller)
            ->unique('seller_id')
            ->map(fn ($item) => [
                'id'   => (int) $item->seller_id,
                'name' => $item->seller->business_name ?: $item->seller->name,
            ])
            ->values()
            ->all();
    }

    /**
     * Return + review state of an order for the buyer web (same rules as the
     * mobile API via ReturnReviewRules). Additive fields only.
     *
     * @return array{order: array, items: array<int, array>}
     */
    private function returnReviewState(Order $order): array
    {
        $latest  = \App\Services\ReturnReviewRules::latestReturn($order);
        $open    = \App\Services\ReturnReviewRules::reviewWindowOpen($order);
        $reviews = \App\Models\Review::whereIn('order_item_id', $order->items->pluck('id'))->get()->keyBy('order_item_id');

        $items = [];
        foreach ($order->items as $item) {
            $review = $reviews->get($item->id);
            $items[$item->id] = [
                'review'     => $review ? [
                    'id'       => $review->id,
                    'rating'   => $review->rating,
                    'comment'  => $review->comment,
                    'can_edit' => $review->canBeEdited(),
                ] : null,
                'can_review' => ! $review && $open,
            ];
        }

        return [
            'order' => [
                'can_return'    => \App\Services\ReturnReviewRules::canReturn($order, $latest),
                'return_status' => $latest?->status,
                'return_id'     => $latest?->id,
                'reviewed'      => $reviews->isNotEmpty(),
                'can_review'    => collect($items)->contains(fn ($i) => $i['can_review']),
            ],
            'items' => $items,
        ];
    }

    /**
     * Get formatted orders data.
     */
    private function getOrdersData(): array
    {
        return Order::where('buyer_id', Auth::id())
            ->with(['items.product', 'items.seller', 'assignedCourier'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                // Return/review flags (additive): same rules as the mobile API.
                $rr = $this->returnReviewState($order);
                return [
                'id' => $order->id,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'waybill_number' => $order->waybill_number,
                'total' => (float) $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'item_count' => $order->items->count(),
                'created_at' => $order->created_at->format('M d, Y'),
                'can_cancel' => $order->canBeCancelled(),
                // Tracking information
                'tracking_message' => $order->tracking_message,
                'tracking_updated_at' => $order->tracking_updated_at?->format('M d, Y h:i A'),
                'assigned_courier_name' => $order->assignedCourier ? ($order->assignedCourier->company_name ?? $order->assignedCourier->business_name) : null,
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_image' => $item->product?->main_image,
                    'seller_name' => $item->seller?->name,
                    'seller_id' => $item->seller_id,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) ($item->quantity * $item->unit_price),
                    'variant_id' => $item->variant_id,
                    'variant_snapshot' => $item->variant_snapshot,
                ] + ($rr['items'][$item->id] ?? [])),
                'sellers' => $this->orderSellers($order),
            ] + $rr['order'];
            })
            ->toArray();
    }

    /**
     * Show single order detail.
     */
    public function show(int $id): Response
    {
        $order = Order::with(['items.product', 'items.seller', 'assignedCourier', 'currentFacility'])->findOrFail($id);

        // Ensure buyer can only see their own order
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        $rr = $this->returnReviewState($order);

        return Inertia::render('OrderDetail', [
            'order' => [
                'id' => $order->id,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'waybill_number' => $order->waybill_number,
                'total' => (float) $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'shipping_name' => $order->shipping_name,
                'shipping_address' => $order->shipping_address,
                'shipping_phone' => $order->shipping_phone,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'can_cancel' => $order->canBeCancelled(),
                // Tracking information
                'tracking_status' => $order->tracking_status,
                'tracking_message' => $order->tracking_message,
                'tracking_updated_at' => $order->tracking_updated_at?->format('M d, Y h:i A'),
                'assigned_courier_name' => $order->assignedCourier ? ($order->assignedCourier->company_name ?? $order->assignedCourier->business_name) : null,
                'current_facility_name' => $order->currentFacility ? $order->currentFacility->facility_name : null,
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_image' => $item->product?->main_image,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) $item->subtotal,
                    'seller_id' => $item->seller_id,
                    'seller_name' => $item->seller ? ($item->seller->business_name ?: $item->seller->name) : null,
                ] + ($rr['items'][$item->id] ?? [])),
                'sellers' => $this->orderSellers($order),
            ] + $rr['order'],
            // Same list as the mobile API validates against.
            'returnReasons' => \App\Models\ReturnRequest::REASONS,
        ]);
    }

    /**
     * Cancel an order and restore stock (ATOMIC).
     */
    public function cancel(int $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $order = Order::with('items.product')->lockForUpdate()->findOrFail($id);

            // Buyer can only cancel their own order
            if ($order->buyer_id !== Auth::id()) {
                DB::rollBack();
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            // Check if order can be cancelled
            if (!$order->canBeCancelled()) {
                DB::rollBack();
                return response()->json(['error' => 'This order cannot be cancelled.'], 400);
            }

            // Idempotency: if already cancelled, do nothing
            if ($order->status === 'cancelled') {
                DB::commit();
                return response()->json(['message' => 'Order already cancelled.'], 200);
            }

            // Restore stock for each item
            foreach ($order->items as $item) {
                $product = $item->product;
                if ($product && !$product->trashed()) {
                    $oldStock = $product->stock;
                    $newStock = $oldStock + $item->quantity;

                    $product->update(['stock' => $newStock]);

                    // Log stock restoration
                    StockLog::log(
                        productId: $product->id,
                        change: $item->quantity,
                        oldStock: $oldStock,
                        newStock: $newStock,
                        reason: 'order_cancelled',
                        referenceId: (string) $order->id
                    );

                    // If product was out_of_stock, set back to active
                    if ($product->status === 'out_of_stock' && $newStock > 0) {
                        $product->update(['status' => 'active']);
                    }
                }
            }

            // Update order status
            $order->update(['status' => 'cancelled']);

            DB::commit();

            Log::info("Order {$order->id} cancelled by buyer {$order->buyer_id}");

            return response()->json(['message' => 'Order cancelled successfully.'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order cancellation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel order.'], 500);
        }
    }
}

