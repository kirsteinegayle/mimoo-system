<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get the buyer's cart with full product details.
     */
    public function index()
    {
        $user = Auth::user();

        // Only buyers can access cart
        if ($user->account_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can access cart.'], 403);
        }

        $cart = Cart::with(['items.product.seller:id,business_name,name'])
            ->where('buyer_id', $user->id)
            ->first();

        if (!$cart) {
            return response()->json([
                'items' => [],
                'subtotal' => 0,
                'total' => 0,
                'total_items' => 0,
                'has_invalid_items' => false,
            ]);
        }

        $items = $cart->items->map(function ($item) {
            $product = $item->product;
            
            // Handle deleted/archived products
            if (!$product || $product->trashed()) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => 'Product no longer available',
                    'quantity' => $item->quantity,
                    'unit_price' => 0,
                    'line_total' => 0,
                    'is_valid' => false,
                    'validation_issue' => 'Product no longer available',
                    'product' => null,
                ];
            }

            return [
                'id' => $item->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_image' => $product->main_image,
                'product_sku' => $product->sku,
                'seller_name' => $product->seller->business_name ?? $product->seller->name,
                'unit_price' => (float) ($product->sale_price ?? $product->price),
                'regular_price' => (float) $product->price,
                'is_on_sale' => $product->isOnSale(),
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
                'max_quantity' => $product->stock,
                'stock_status' => $product->stock_status,
                'is_valid' => $item->isValid(),
                'validation_issue' => $item->getValidationIssue(),
                'variant_id' => $item->variant_id,
                'variant_snapshot' => $item->variant_snapshot,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'status' => $product->status,
                    'stock' => $product->stock,
                ],
            ];
        });

        $hasInvalidItems = $items->contains('is_valid', false);

        return response()->json([
            'items' => $items->values(),
            'subtotal' => (float) $cart->subtotal,
            'total' => (float) $cart->subtotal, // Same as subtotal for now (no shipping/tax yet)
            'total_items' => $cart->total_items,
            'has_invalid_items' => $hasInvalidItems,
        ]);
    }

    /**
     * Add item to cart or increase quantity if already exists.
     */
    public function addItem(Request $request)
    {
        $user = Auth::user();

        // Only buyers can add to cart
        if ($user->account_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can add items to cart.'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|string',
            'replace_quantity' => 'nullable|boolean', // For Buy Now: replace instead of add
        ], [
            'product_id.required' => 'Product ID is required.',
            'product_id.exists' => 'Product not found.',
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be a whole number.',
            'quantity.min' => 'Quantity must be at least 1.',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Validate product is available
        if ($product->trashed()) {
            return response()->json(['error' => 'This product is no longer available.'], 422);
        }

        if ($product->status !== 'active') {
            return response()->json(['error' => 'This product is not available for purchase.'], 422);
        }

        // Determine stock to check (variant or product)
        $stockToCheck = $product->stock;
        $variantData = null;
        
        if (isset($validated['variant_id']) && $validated['variant_id'] && $product->has_variants && $product->variants) {
            $variant = collect($product->variants)->firstWhere('id', $validated['variant_id']);
            if ($variant) {
                $stockToCheck = $variant['stock'];
                $variantData = $variant;
            }
        }

        if ($stockToCheck == 0) {
            return response()->json(['error' => 'This product is out of stock.'], 422);
        }

        // Validate quantity doesn't exceed stock (CAP IT)
        $requestedQuantity = $validated['quantity'];
        if ($requestedQuantity > $stockToCheck) {
            $requestedQuantity = $stockToCheck;
        }

        try {
            DB::beginTransaction();

            // Get or create cart
            $cart = Cart::getOrCreateForBuyer($user->id);

            // Check if product+variant already in cart
            $variantIdToCheck = $validated['variant_id'] ?? null;
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->where(function($query) use ($variantIdToCheck) {
                    if ($variantIdToCheck === null) {
                        $query->whereNull('variant_id');
                    } else {
                        $query->where('variant_id', $variantIdToCheck);
                    }
                })
                ->first();

            if ($cartItem) {
                // Check if we should replace or add quantity
                $replaceMode = $validated['replace_quantity'] ?? false;
                
                if ($replaceMode) {
                    // Buy Now mode: Replace quantity (don't add to existing)
                    $newQuantity = $requestedQuantity;
                } else {
                    // Add to Cart mode: Add to existing quantity
                    $newQuantity = $cartItem->quantity + $requestedQuantity;
                }
                
                // Cap to stock
                if ($newQuantity > $stockToCheck) {
                    $newQuantity = $stockToCheck;
                }

                $cartItem->update(['quantity' => $newQuantity]);
                $message = 'Cart updated successfully.';
            } else {
                // Create new cart item
                $cartItemData = [
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $requestedQuantity,
                ];
                
                // Only add variant_id if it's set
                if (isset($validated['variant_id']) && $validated['variant_id']) {
                    $cartItemData['variant_id'] = $validated['variant_id'];
                }
                
                $cartItem = CartItem::create($cartItemData);
                
                // Store variant snapshot if variant selected
                if ($variantData) {
                    $cartItem->variant_snapshot = $variantData;
                    $cartItem->save();
                }
                
                $message = 'Added to cart successfully.';
            }

            DB::commit();

            // Reload relationships
            $cartItem->load('product');

            return response()->json([
                'message' => $message,
                'cart_item' => [
                    'id' => $cartItem->id,
                    'quantity' => $cartItem->quantity,
                ],
                'cart_count' => $cart->fresh()->total_items,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to add to cart.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(Request $request, $id)
    {
        $user = Auth::user();

        $cartItem = CartItem::with('cart', 'product')->findOrFail($id);

        // Verify ownership
        if ($cartItem->cart->buyer_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Validate quantity
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ], [
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be a whole number.',
            'quantity.min' => 'Quantity must be at least 1.',
        ]);

        $product = $cartItem->product;

        // Check product still available
        if (!$product || $product->trashed() || $product->status !== 'active') {
            return response()->json(['error' => 'This product is no longer available.'], 422);
        }

        // Cap quantity to available stock
        $newQuantity = $validated['quantity'];
        if ($newQuantity > $product->stock) {
            return response()->json([
                'error' => "Only {$product->stock} items available in stock.",
                'max_quantity' => $product->stock,
            ], 422);
        }

        $cartItem->update(['quantity' => $newQuantity]);

        return response()->json([
            'message' => 'Quantity updated successfully.',
            'cart_item' => [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
                'line_total' => $cartItem->line_total,
            ],
            'cart_count' => $cartItem->cart->fresh()->total_items,
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem($id)
    {
        $user = Auth::user();

        $cartItem = CartItem::with('cart')->findOrFail($id);

        // Verify ownership
        if ($cartItem->cart->buyer_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $cart = $cartItem->cart;
        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart.',
            'cart_count' => $cart->fresh()->total_items,
        ]);
    }

    /**
     * Get cart item count (for header badge).
     */
    public function getCount()
    {
        $user = Auth::user();

        if ($user->account_type !== 'buyer') {
            return response()->json(['count' => 0]);
        }

        $cart = Cart::where('buyer_id', $user->id)->first();

        return response()->json([
            'count' => $cart ? $cart->total_items : 0,
        ]);
    }
}
