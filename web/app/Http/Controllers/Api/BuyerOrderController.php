<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyerAddress;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\StockLog;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Mobile buyer order endpoints (Sanctum Bearer auth).
 *
 * NOTE: The checkout and cancel logic in this controller mirrors
 * web\app\Http\Controllers\OrderController@store and @cancel EXACTLY,
 * with two additional rules for the mobile API:
 *   1. Only 'cod' is accepted as payment_method (gcash/paymongo are rejected 422).
 *   2. Products must also have approval_status = 'approved' (the web only checks status = 'active').
 *
 * Do NOT modify web\OrderController when changing this file.
 *
 * NOTE FOR THE TEAM:
 *   - The website's OrderController accepts 'gcash' and 'paymongo' but does NOT collect
 *     any actual payment for them — no gateway is integrated. The server just stores the
 *     payment_method string. Inform the team before enabling these on mobile.
 */
class BuyerOrderController extends Controller
{
    // ── Shared buyer guard ────────────────────────────────────────────────────

    private function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyers can access orders.'], 403);
        }
        return null;
    }

    // ── Build image URL for a product (mirrors Api\ProductController) ──────

    private function imageUrl(Product $product): ?string
    {
        $images = $product->images ?? [];
        $idx    = $product->main_image_index ?? 0;
        if (empty($images[$idx])) return null;
        return url("/api/buyer/products/{$product->id}/image/{$idx}");
    }

    // ── Format a single order for list / detail responses ────────────────────

    private function formatOrder(Order $order, bool $detail = false): array
    {
        // Reviews for this order's items (one per item) — Module 3
        $reviews = Review::whereIn('order_item_id', $order->items->pluck('id'))
            ->get()->keyBy('order_item_id');
        $reviewWindowOpen = $order->status === 'completed'
            && $order->updated_at->copy()->addDays(Review::REVIEW_WINDOW_DAYS)->isFuture();

        // Latest return request — Module 4
        $latestReturn = ReturnRequest::where('order_id', $order->id)->latest('id')->first();
        $hasOpenReturn = $latestReturn && $latestReturn->isOpen();
        $canReturn = in_array($order->status, ['shipped', 'completed'], true)
            && $order->updated_at->copy()->addDays(ReturnRequest::REQUEST_WINDOW_DAYS)->isFuture()
            && ! $hasOpenReturn;

        $items = $order->items->map(function ($item) use ($detail, $reviews, $reviewWindowOpen) {
            $review = $reviews->get($item->id);
            $row = [
                'review'           => $review ? [
                    'id'       => $review->id,
                    'rating'   => $review->rating,
                    'comment'  => $review->comment,
                    'can_edit' => $review->canBeEdited(),
                ] : null,
                'can_review'       => ! $review && $reviewWindowOpen,
                'id'               => $item->id,
                'product_id'       => $item->product_id,
                'product_name'     => $item->product_name,
                // Real numeric seller id (used by the app to open the store)
                'seller_id'        => $item->seller_id,
                'seller_name'      => $item->seller
                    ? (! empty($item->seller->business_name)
                        ? $item->seller->business_name
                        : trim($item->seller->first_name . ' ' . $item->seller->last_name))
                    : null,
                'image_url'        => $item->product ? $this->imageUrl($item->product) : null,
                'quantity'         => $item->quantity,
                'unit_price'       => (float) $item->unit_price,
                'subtotal'         => (float) ($item->quantity * $item->unit_price),
                'variant_id'       => $item->variant_id,
                'variant_snapshot' => $item->variant_snapshot,
            ];
            return $row;
        });

        return [
            'id'               => $order->id,
            'order_number'     => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            'status'           => $order->status,
            'payment_status'   => $order->payment_status,
            'payment_method'   => $order->payment_method,
            'total'            => (float) $order->total,
            'item_count'       => $order->items->count(),
            'can_cancel'       => $order->canBeCancelled(),
            'created_at'       => $order->created_at->format('M d, Y'),
            'shipping_name'    => $order->shipping_name,
            'shipping_address' => $order->shipping_address,
            'shipping_phone'   => $order->shipping_phone,
            'return_status'    => $latestReturn?->status,
            'return_id'        => $latestReturn?->id,
            'can_return'       => $canReturn,
            // Delivery tracking (display only; same values as buyer web).
            'tracking_status'     => $order->tracking_status,
            'tracking_message'    => $order->tracking_message,
            'tracking_updated_at' => $order->tracking_updated_at?->format('M d, Y h:i A'),
            'items'            => $items->values(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/checkout
    //
    // Mirrors: web\app\Http\Controllers\OrderController@store
    // Differences from web:
    //   - Only 'cod' allowed (422 for anything else)
    //   - Also requires approval_status = 'approved'
    // ─────────────────────────────────────────────────────────────────────────
    public function checkout(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $validated = $request->validate([
            // Mobile: only cod is accepted; 422 for gcash/paymongo
            'payment_method'   => ['required', 'in:cod'],
            // address_id (address book) — when present, shipping_* are copied
            // from the saved address at order time (snapshot). Legacy clients
            // that send shipping_* directly still work.
            'address_id'       => ['nullable', 'integer'],
            'shipping_name'    => ['required_without:address_id', 'nullable', 'string', 'max:255'],
            'shipping_address' => ['required_without:address_id', 'nullable', 'string', 'max:500'],
            'shipping_phone'   => ['required_without:address_id', 'nullable', 'string', 'max:20'],
            'idempotency_key'  => ['nullable', 'string', 'max:64'],
            'cart_item_ids'    => ['nullable', 'array'],
            'cart_item_ids.*'  => ['integer'],
            'voucher_code'     => ['nullable', 'string', 'max:50'],
        ], [
            'payment_method.in' => 'GCash is not available yet. Please choose Cash on Delivery.',
        ]);

        $user = $request->user();

        // ── Address book snapshot ─────────────────────────────────────────────
        if (! empty($validated['address_id'])) {
            $address = BuyerAddress::where('buyer_id', $user->id)->find($validated['address_id']);
            if (! $address) {
                return response()->json(['message' => 'Address not found.'], 404);
            }
            $validated['shipping_name']    = $address->recipient_name;
            $validated['shipping_address'] = mb_substr($address->fullAddress(), 0, 500);
            $validated['shipping_phone']   = $address->phone;
        }

        // ── Idempotency: return existing order instead of a new one ──────────
        // Mirrors web OrderController@store idempotency check
        if (! empty($validated['idempotency_key'])) {
            $existing = Order::where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existing) {
                return response()->json([
                    'message'      => 'Order already placed.',
                    'order_id'     => $existing->id,
                    'order_number' => 'MIM-' . str_pad($existing->id, 8, '0', STR_PAD_LEFT),
                    'total'        => (float) $existing->total,
                ], 200);
            }
        }

        try {
            DB::beginTransaction();

            // 1. Load buyer's cart (with lock — mirrors web)
            $cart = Cart::with('items.product.seller')
                ->where('buyer_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $cart || $cart->items->isEmpty()) {
                DB::rollBack();
                return response()->json(['message' => 'Your cart is empty.'], 400);
            }

            // Filter items if specific cart_item_ids provided
            $cartItems = $cart->items;
            if (! empty($validated['cart_item_ids'])) {
                $cartItems = $cartItems->filter(
                    fn ($item) => in_array($item->id, $validated['cart_item_ids'])
                );
            }

            if ($cartItems->isEmpty()) {
                DB::rollBack();
                return response()->json(['message' => 'No items selected for checkout.'], 400);
            }

            // 2. Pre-validate all items before touching stock
            $productIds = [];
            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;

                if (! $product || $product->trashed()) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "'{$cartItem->product_id}' is no longer available.",
                    ], 422);
                }

                // Mobile adds approval_status check (web only checks status)
                if ($product->status !== 'active' || $product->approval_status !== 'approved') {
                    DB::rollBack();
                    return response()->json([
                        'message' => "'{$product->name}' is not available for purchase.",
                    ], 422);
                }

                if ($product->seller_id === $user->id) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "You cannot purchase your own product '{$product->name}'.",
                    ], 422);
                }

                $productIds[] = $product->id;
            }

            // Sort product IDs — prevents deadlocks (mirrors web)
            sort($productIds);

            // 3. Atomic stock deduction per product (mirrors web exactly)
            $orderItems = [];
            $total      = 0;

            foreach ($productIds as $productId) {
                $cartItem = $cartItems->firstWhere('product_id', $productId);
                $quantity = $cartItem->quantity;

                $affected = Product::where('id', $productId)
                    ->where('stock', '>=', $quantity)
                    ->update([
                        'stock'      => DB::raw("stock - {$quantity}"),
                        'updated_at' => now(),
                    ]);

                if ($affected === 0) {
                    $product = Product::find($productId);
                    DB::rollBack();
                    return response()->json([
                        'message'         => "Insufficient stock for '{$product->name}'. Only {$product->stock} left.",
                        'product_name'    => $product->name,
                        'available_stock' => $product->stock,
                    ], 400);
                }

                // Reload to get updated stock
                $product  = Product::find($productId);
                $oldStock = $product->stock + $quantity;
                $unitPrice = $product->sale_price ?? $product->price;
                $total    += $unitPrice * $quantity;

                $orderItems[] = [
                    'product_id'       => $product->id,
                    'seller_id'        => $product->seller_id,
                    'product_name'     => $product->name, // snapshot
                    'variant_id'       => $cartItem->variant_id ?? null,
                    'variant_snapshot' => $cartItem->variant_snapshot
                        ? json_encode($cartItem->variant_snapshot)
                        : null,
                    'quantity'         => $quantity,
                    'unit_price'       => $unitPrice,
                ];

                // 4a. Write StockLog (reason: 'order') — mirrors web
                StockLog::log(
                    productId:   $product->id,
                    change:      -$quantity,
                    oldStock:    $oldStock,
                    newStock:    $product->stock,
                    reason:      'order',
                    referenceId: null // updated after order created
                );

                // 4b. Mark product out_of_stock if stock hits 0 — mirrors web
                if ($product->stock === 0) {
                    $product->update(['status' => 'out_of_stock']);
                }
            }

            // 5. Create order (mirrors web)
            $voucherDiscount = 0.0;
            $voucherUsage    = null;
            $appliedVoucher  = null;

            if (! empty($validated['voucher_code'])) {
                $code    = strtoupper(trim($validated['voucher_code']));
                $voucher = Voucher::where('code', $code)->first();

                if (! $voucher || ! $voucher->isValid()) {
                    DB::rollBack();
                    return response()->json(['message' => 'Invalid or expired voucher code.'], 422);
                }

                $vu = VoucherUsage::where('voucher_id', $voucher->id)
                    ->where('user_id', $user->id)
                    ->first();

                if (! $vu) {
                    DB::rollBack();
                    return response()->json(['message' => 'You need to claim this voucher first.'], 422);
                }

                if ($vu->used_at !== null) {
                    DB::rollBack();
                    return response()->json(['message' => 'You have already used this voucher.'], 422);
                }

                if ($total < $voucher->min_purchase) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Minimum spend of ₱' . number_format($voucher->min_purchase, 2) . ' required for this voucher.',
                    ], 422);
                }

                $voucherDiscount = (float) $voucher->calculateDiscount($total);
                $total           = max(0, round($total - $voucherDiscount, 2));
                $voucherUsage    = $vu;
                $appliedVoucher  = $voucher;
            }

            $order = Order::create([
                'buyer_id'        => $user->id,
                'total'           => $total,
                'status'          => 'pending',
                'payment_status'  => 'unpaid',
                'payment_method'  => $validated['payment_method'],
                'shipping_name'   => $validated['shipping_name'],
                'shipping_address'=> $validated['shipping_address'],
                'shipping_phone'  => $validated['shipping_phone'],
                'idempotency_key' => $validated['idempotency_key'] ?? null,
            ]);

            foreach ($orderItems as &$item) {
                $item['order_id'] = $order->id;
            }
            OrderItem::insert($orderItems);

            // Record voucher usage (mirrors web OrderController)
            if ($appliedVoucher && $voucherUsage) {
                $voucherUsage->update([
                    'order_id'        => $order->id,
                    'discount_amount' => $voucherDiscount,
                    'used_at'         => now(),
                ]);
            }

            // 6. Update StockLog reference_id with the new order id — mirrors web
            StockLog::where('reference_id', null)
                ->where('reason', 'order')
                ->whereIn('product_id', $productIds)
                ->where('created_at', '>=', now()->subSeconds(10))
                ->update(['reference_id' => (string) $order->id]);

            // 7. Clear cart items AFTER commit (only selected items) — mirrors web
            if (! empty($validated['cart_item_ids'])) {
                CartItem::whereIn('id', $validated['cart_item_ids'])->delete();
            } else {
                $cart->items()->delete();
            }

            DB::commit();

            Log::info("Mobile order {$order->id} placed by buyer {$user->id}");

            return response()->json([
                'message'          => 'Order placed successfully!',
                'order_id'         => $order->id,
                'order_number'     => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'voucher_discount' => $voucherDiscount,
                'total'            => (float) $order->total,
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Mobile checkout failed: ' . $e->getMessage());
            return response()->json(['message' => 'Checkout failed. Please try again.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/checkout/preview
    //
    // Returns merchandise total, discount, and final total without placing an
    // order. Also returns why a voucher is not applicable ("Spend ₱X more").
    // ─────────────────────────────────────────────────────────────────────────
    public function checkoutPreview(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $request->validate([
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'cart_item_ids'=> ['nullable', 'array'],
            'cart_item_ids.*' => ['integer'],
        ]);

        $user = $request->user();

        // Load cart
        $cart = Cart::with('items.product')
            ->where('buyer_id', $user->id)
            ->first();

        $cartItems = $cart?->items ?? collect();
        if (! empty($request->input('cart_item_ids'))) {
            $cartItems = $cartItems->filter(
                fn ($i) => in_array($i->id, $request->input('cart_item_ids'))
            );
        }

        $merchandise = $cartItems->sum(function ($item) {
            $product = $item->product;
            if (! $product) return 0;
            $price = $product->sale_price ?? $product->price;
            return (float) $price * $item->quantity;
        });

        $discount      = 0.0;
        $voucherStatus = null; // null = no voucher provided

        if (! empty($request->input('voucher_code'))) {
            $code    = strtoupper(trim($request->input('voucher_code')));
            $voucher = Voucher::where('code', $code)->first();

            if (! $voucher) {
                $voucherStatus = 'Voucher not found.';
            } elseif ($voucher->status !== 'active' || now()->gt($voucher->valid_until)) {
                $voucherStatus = 'This voucher has expired.';
            } elseif (now()->lt($voucher->valid_from)) {
                $voucherStatus = 'This voucher is not yet available.';
            } else {
                $vu = VoucherUsage::where('voucher_id', $voucher->id)
                    ->where('user_id', $user->id)
                    ->first();
                if (! $vu) {
                    $voucherStatus = 'You need to claim this voucher first.';
                } elseif ($vu->used_at !== null) {
                    $voucherStatus = 'You have already used this voucher.';
                } elseif ($merchandise < $voucher->min_purchase) {
                    $gap = $voucher->min_purchase - $merchandise;
                    $voucherStatus = 'Spend ₱' . number_format($gap, 2) . ' more to use this voucher.';
                } else {
                    $discount      = (float) $voucher->calculateDiscount($merchandise);
                    $voucherStatus = 'applied';
                }
            }
        }

        $total = max(0, round($merchandise - $discount, 2));

        return response()->json([
            'data' => [
                'merchandise_total' => round($merchandise, 2),
                'voucher_discount'  => $discount,
                'total'             => $total,
                'voucher_status'    => $voucherStatus,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/orders
    // Paginated list of the buyer's own orders. Optional ?status= filter.
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $query = Order::with(['items.product', 'items.seller:id,business_name,first_name,last_name'])
            ->where('buyer_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->paginate(10);

        return response()->json([
            'data' => collect($orders->items())->map(fn ($o) => $this->formatOrder($o)),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
                'has_more'     => $orders->hasMorePages(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/orders/{id}
    // Single order detail — 404 if it doesn't belong to the buyer.
    // ─────────────────────────────────────────────────────────────────────────
    public function show(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $order = Order::with(['items.product', 'items.seller:id,business_name,first_name,last_name'])
            ->where('buyer_id', $request->user()->id)
            ->find($id);

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => $this->formatOrder($order, true)]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/orders/{id}/receive
    // Buyer confirms delivery: shipped → completed.
    //   404 if not the buyer's order; 200 (idempotent) if already completed;
    //   422 if not shipped, or if the order has an open return request.
    // The Order model's updated hook creates the "Order completed" notification.
    // ─────────────────────────────────────────────────────────────────────────
    public function receive(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $result = DB::transaction(function () use ($request, $id) {
            $order = Order::where('buyer_id', $request->user()->id)
                ->lockForUpdate()
                ->find($id);

            if (! $order) {
                return response()->json(['message' => 'Order not found.'], 404);
            }
            if ($order->status === 'completed') {
                return response()->json(['message' => 'Order already received.'], 200);
            }
            if ($order->status !== 'shipped') {
                return response()->json([
                    'message' => 'Only shipped orders can be marked as received.',
                    'errors'  => ['order' => ['Only shipped orders can be marked as received.']],
                ], 422);
            }
            if ($order->hasOpenReturn()) {
                return response()->json([
                    'message' => 'This order has an open return request and cannot be marked as received yet.',
                    'errors'  => ['order' => ['This order has an open return request and cannot be marked as received yet.']],
                ], 422);
            }

            $order->update(['status' => 'completed']);

            return response()->json(['message' => 'Order received. Thank you!']);
        });

        if ($result->getStatusCode() === 200) {
            Log::info("Mobile order {$id} received by buyer {$request->user()->id}");
        }

        return $result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/orders/{id}/cancel
    //
    // Mirrors: web\app\Http\Controllers\OrderController@cancel
    // Differences: accepts optional 'reason' (not stored — no column exists).
    //              Returns 404 (not 403) when order doesn't belong to buyer.
    // ─────────────────────────────────────────────────────────────────────────
    public function cancel(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        // reason is accepted but NOT stored (no cancel_reason column in orders)
        $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            DB::beginTransaction();

            // 404 for orders that don't belong to this buyer (mirrors ownership rule)
            $order = Order::with('items.product')
                ->where('buyer_id', $request->user()->id)
                ->lockForUpdate()
                ->find($id);

            if (! $order) {
                DB::rollBack();
                return response()->json(['message' => 'Order not found.'], 404);
            }

            // Idempotency: already cancelled — check BEFORE canBeCancelled
            // so that re-cancelling a cancelled order returns 200, not 400.
            if ($order->status === 'cancelled') {
                DB::commit();
                return response()->json(['message' => 'Order already cancelled.'], 200);
            }

            if (! $order->canBeCancelled()) {
                DB::rollBack();
                return response()->json(['message' => 'This order cannot be cancelled.'], 400);
            }

            // Restore stock for each item — mirrors web exactly
            foreach ($order->items as $item) {
                $product = $item->product;
                if ($product && ! $product->trashed()) {
                    $oldStock = $product->stock;
                    $newStock = $oldStock + $item->quantity;

                    $product->update(['stock' => $newStock]);

                    StockLog::log(
                        productId:   $product->id,
                        change:      $item->quantity,
                        oldStock:    $oldStock,
                        newStock:    $newStock,
                        reason:      'order_cancelled',
                        referenceId: (string) $order->id
                    );

                    // Reactivate product if it was out_of_stock — mirrors web
                    if ($product->status === 'out_of_stock' && $newStock > 0) {
                        $product->update(['status' => 'active']);
                    }
                }
            }

            $order->update(['status' => 'cancelled']);

            // Restore voucher if one was used on this order
            $voucherUsage = VoucherUsage::where('order_id', $order->id)->first();
            if ($voucherUsage) {
                $voucher = Voucher::find($voucherUsage->voucher_id);
                if ($voucher && $voucher->valid_until->gt(now())) {
                    // Reset the usage record back to claimed-only (not used)
                    $voucherUsage->update([
                        'order_id'        => null,
                        'discount_amount' => null,
                        'used_at'         => null,
                    ]);
                    // Decrement global usage_count
                    $voucher->decrement('usage_count');
                    // If voucher was auto-expired due to usage limit, re-activate
                    if ($voucher->status === 'expired'
                        && $voucher->usage_limit !== null
                        && $voucher->fresh()->usage_count < $voucher->usage_limit)
                    {
                        $voucher->update(['status' => 'active']);
                    }
                }
            }

            DB::commit();

            Log::info("Mobile order {$order->id} cancelled by buyer {$order->buyer_id}");

            return response()->json(['message' => 'Order cancelled successfully.']);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Mobile order cancellation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to cancel order.'], 500);
        }
    }
}
