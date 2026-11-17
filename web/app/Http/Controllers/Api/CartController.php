<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Mobile buyer cart — Sanctum Bearer auth.
 *
 * NOTE ON VARIANT UNIQUENESS: The cart_items table has a unique key on
 * (cart_id, product_id) with NO variant_id column in that key. This means
 * the database enforces one row per product per cart regardless of variant.
 * This mirrors the website's CartController exactly: adding the same product
 * with a different variant merges into the existing row (quantity is summed
 * or replaced). We replicate that behaviour here.
 *
 * APPROVAL DIFFERENCE vs. web CartController:
 * The website's CartController only checks status='active' when adding.
 * This API additionally requires approval_status='approved'. The website's
 * controller is NOT changed — this is intentional and documented here so the
 * team is aware of the discrepancy.
 */
class CartController extends Controller
{
    // ── Shared buyer guard ────────────────────────────────────────────────────

    private function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyers can access the cart.'], 403);
        }
        return null;
    }

    // ── Build the image URL for a product's main image ────────────────────────

    private function imageUrl(Product $product): ?string
    {
        $images = $product->images ?? [];
        $idx    = $product->main_image_index ?? 0;
        if (empty($images[$idx])) {
            return null;
        }
        return url("/api/buyer/products/{$product->id}/image/{$idx}");
    }

    // ── Shared cart-item row builder ──────────────────────────────────────────

    private function itemRow(CartItem $item): array
    {
        $product = $item->product;

        if (! $product || $product->trashed()) {
            return [
                'id'               => $item->id,
                'product_id'       => $item->product_id,
                'product_name'     => 'Product no longer available',
                'image_url'        => null,
                'unit_price'       => 0,
                'regular_price'    => 0,
                'is_on_sale'       => false,
                'quantity'         => $item->quantity,
                'line_total'       => 0,
                'max_quantity'     => 0,
                'stock_status'     => 'Unavailable',
                'is_valid'         => false,
                'validation_issue' => 'Product no longer available',
                'variant_id'       => $item->variant_id,
                'variant_snapshot' => $item->variant_snapshot,
            ];
        }

        return [
            'id'               => $item->id,
            'product_id'       => $product->id,
            'product_name'     => $product->name,
            'image_url'        => $this->imageUrl($product),
            'unit_price'       => (float) ($product->sale_price ?? $product->price),
            'regular_price'    => (float) $product->price,
            'is_on_sale'       => $product->isOnSale(),
            'quantity'         => $item->quantity,
            'line_total'       => (float) $item->line_total,
            'max_quantity'     => $product->stock,
            'max_per_checkout' => (int) config('checkout.max_quantity_per_product', 10),
            'stock_status'     => $product->stock_status,
            'is_valid'         => $item->isValid(),
            'validation_issue' => $item->getValidationIssue(),
            'variant_id'       => $item->variant_id,
            'variant_snapshot' => $item->variant_snapshot,
        ];
    }

    // ── GET /api/buyer/cart ───────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $cart = Cart::with(['items.product'])
            ->where('buyer_id', $request->user()->id)
            ->first();

        if (! $cart) {
            return response()->json([
                'items'       => [],
                'subtotal'    => 0,
                'total'       => 0,
                'total_items' => 0,
            ]);
        }

        $rows = $cart->items->map(fn ($i) => $this->itemRow($i))->values();

        return response()->json([
            'items'       => $rows,
            'subtotal'    => (float) $cart->subtotal,
            'total'       => (float) $cart->subtotal,
            'total_items' => $cart->total_items,
        ]);
    }

    // ── POST /api/buyer/cart/items ────────────────────────────────────────────

    public function addItem(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $validated = $request->validate([
            'product_id'      => ['required', 'integer', 'exists:products,id'],
            'quantity'        => ['required', 'integer', 'min:1'],
            'variant_id'      => ['nullable', 'string'],
            'replace_quantity' => ['nullable', 'boolean'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // ── Stricter than web: also require approval_status = approved ────────
        if ($product->trashed()) {
            return response()->json(['message' => 'This product is no longer available.'], 422);
        }
        if ($product->status !== 'active' || $product->sellerIsBlocked()) {
            return response()->json(['message' => 'This product is not available for purchase.'], 422);
        }
        if ($product->approval_status !== 'approved') {
            return response()->json(['message' => 'This product is not approved for sale.'], 422);
        }

        // Determine effective stock (variant or product)
        $stockToCheck = $product->stock;
        $variantData  = null;

        if (
            ! empty($validated['variant_id']) &&
            $product->has_variants &&
            is_array($product->variants)
        ) {
            $variant = collect($product->variants)
                ->firstWhere('id', $validated['variant_id']);
            if ($variant) {
                $stockToCheck = $variant['stock'];
                $variantData  = $variant;
            }
        }

        if ($stockToCheck == 0) {
            return response()->json(['message' => 'This product is out of stock.'], 422);
        }

        // Enforce max quantity per product per checkout
        $maxPerCheckout = (int) config('checkout.max_quantity_per_product', 10);
        $existingQty = 0;
        if (empty($validated['replace_quantity'])) {
            $existingQty = (int) CartItem::whereHas('cart', fn ($q) => $q->where('buyer_id', $request->user()->id))
                ->where('product_id', $product->id)->value('quantity');
        }
        if ((int) $validated['quantity'] + $existingQty > $maxPerCheckout) {
            return response()->json([
                'message' => "You can only buy up to {$maxPerCheckout} units of the same product per checkout.",
                'max_per_checkout' => $maxPerCheckout,
            ], 422);
        }

        // Cap quantity silently (same as website)
        $qty = min((int) $validated['quantity'], $stockToCheck);

        DB::beginTransaction();
        try {
            $cart = Cart::getOrCreateForBuyer($request->user()->id);

            // unique key is (cart_id, product_id) — variant_id is NOT in key
            // → same product with any variant merges into the same row (web behaviour)
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->first();

            if ($cartItem) {
                $replace  = (bool) ($validated['replace_quantity'] ?? false);
                $newQty   = $replace ? $qty : $cartItem->quantity + $qty;
                $newQty   = min($newQty, $stockToCheck);
                $cartItem->quantity = $newQty;
                // Buy Now (replace) with a different variant: switch the line
                // to the chosen variant so the order saves what was shown.
                // (variant_snapshot isn't fillable, so assign directly.)
                if ($replace && ! empty($validated['variant_id'])) {
                    $cartItem->variant_id       = $validated['variant_id'];
                    $cartItem->variant_snapshot = $variantData;
                }
                $cartItem->save();
                $message = 'Cart updated successfully.';
            } else {
                $cartItem = CartItem::create([
                    'cart_id'    => $cart->id,
                    'product_id' => $product->id,
                    'variant_id' => $validated['variant_id'] ?? null,
                    'quantity'   => $qty,
                ]);
                if ($variantData) {
                    $cartItem->variant_snapshot = $variantData;
                    $cartItem->save();
                }
                $message = 'Added to cart successfully.';
            }

            DB::commit();

            return response()->json([
                'message'    => $message,
                'cart_item'  => ['id' => $cartItem->id, 'quantity' => $cartItem->quantity],
                'cart_count' => $cart->fresh()->total_items,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add to cart.'], 500);
        }
    }

    // ── PATCH /api/buyer/cart/items/{id} ─────────────────────────────────────

    public function updateItem(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $cartItem = CartItem::with(['cart', 'product'])->find($id);

        // 404 for missing OR items belonging to another buyer's cart
        if (! $cartItem || $cartItem->cart->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = $cartItem->product;

        if (! $product || $product->trashed() || $product->status !== 'active') {
            return response()->json(['message' => 'This product is no longer available.'], 422);
        }

        $maxPerCheckout = (int) config('checkout.max_quantity_per_product', 10);
        if ($validated['quantity'] > $maxPerCheckout) {
            return response()->json([
                'message' => "You can only buy up to {$maxPerCheckout} units of the same product per checkout.",
                'max_per_checkout' => $maxPerCheckout,
            ], 422);
        }

        if ($validated['quantity'] > $product->stock) {
            return response()->json([
                'message'      => "Only {$product->stock} items available in stock.",
                'max_quantity' => $product->stock,
            ], 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message'    => 'Quantity updated.',
            'cart_item'  => [
                'id'         => $cartItem->id,
                'quantity'   => $cartItem->quantity,
                'line_total' => (float) $cartItem->line_total,
            ],
            'cart_count' => $cartItem->cart->fresh()->total_items,
        ]);
    }

    // ── DELETE /api/buyer/cart/items/{id} ────────────────────────────────────

    public function removeItem(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $cartItem = CartItem::with('cart')->find($id);

        if (! $cartItem || $cartItem->cart->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $cart = $cartItem->cart;
        $cartItem->delete();

        return response()->json([
            'message'    => 'Item removed from cart.',
            'cart_count' => $cart->fresh()->total_items,
        ]);
    }

    // ── DELETE /api/buyer/cart ────────────────────────────────────────────────

    public function clear(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $cart = Cart::where('buyer_id', $request->user()->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'message'    => 'Cart cleared.',
            'cart_count' => 0,
        ]);
    }
}
