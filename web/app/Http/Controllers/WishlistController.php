<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display the wishlist page.
     */
    public function show()
    {
        $user = Auth::user();

        // Only buyers can access wishlist
        if ($user->account_type !== 'buyer') {
            return redirect('/')->with('error', 'Only buyers can access wishlist.');
        }

        return Inertia::render('Wishlist', [
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Get the buyer's wishlist with full product details (API).
     */
    public function index()
    {
        $user = Auth::user();

        // Only buyers can access wishlist
        if ($user->account_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can access wishlist.'], 403);
        }

        $wishlist = Wishlist::with(['items.product.seller:id,business_name,name'])
            ->where('buyer_id', $user->id)
            ->first();

        if (!$wishlist) {
            return response()->json([
                'items' => [],
                'total_items' => 0,
            ]);
        }

        $items = $wishlist->items->map(function ($item) {
            $product = $item->product;
            
            // Handle deleted/archived products
            if (!$product || $product->trashed()) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => 'Product no longer available',
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
                'stock' => $product->stock,
                'stock_status' => $product->stock_status,
                'is_valid' => $item->isValid(),
                'validation_issue' => $item->getValidationIssue(),
                'variant_id' => $item->variant_id,
                'variant_snapshot' => $item->variant_snapshot,
                'notes' => $item->notes,
                'added_at' => $item->created_at->diffForHumans(),
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'status' => $product->status,
                    'stock' => $product->stock,
                    'category' => $product->category,
                    'has_variants' => $product->has_variants,
                ],
            ];
        });

        return response()->json([
            'items' => $items->values(),
            'total_items' => $wishlist->total_items,
        ]);
    }

    /**
     * Get wishlist count (API).
     */
    public function count()
    {
        $user = Auth::user();

        if ($user->account_type !== 'buyer') {
            return response()->json(['count' => 0]);
        }

        $wishlist = Wishlist::where('buyer_id', $user->id)->first();

        return response()->json([
            'count' => $wishlist ? $wishlist->total_items : 0,
        ]);
    }

    /**
     * Check if product is in wishlist (API).
     */
    public function check(Request $request)
    {
        $user = Auth::user();

        if ($user->account_type !== 'buyer') {
            return response()->json(['in_wishlist' => false]);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|string',
        ]);

        $wishlist = Wishlist::where('buyer_id', $user->id)->first();

        if (!$wishlist) {
            return response()->json(['in_wishlist' => false]);
        }

        $inWishlist = $wishlist->hasProduct(
            $validated['product_id'],
            $validated['variant_id'] ?? null
        );

        return response()->json(['in_wishlist' => $inWishlist]);
    }

    /**
     * Add item to wishlist.
     */
    public function addItem(Request $request)
    {
        $user = Auth::user();

        // Only buyers can add to wishlist
        if ($user->account_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can add items to wishlist.'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ], [
            'product_id.required' => 'Product ID is required.',
            'product_id.exists' => 'Product not found.',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Validate product is available
        if ($product->trashed()) {
            return response()->json(['error' => 'This product is no longer available.'], 422);
        }

        try {
            DB::beginTransaction();

            // Get or create wishlist
            $wishlist = Wishlist::getOrCreateForBuyer($user->id);

            // Check if product+variant already in wishlist
            $wishlistItem = WishlistItem::where('wishlist_id', $wishlist->id)
                ->where('product_id', $product->id)
                ->where('variant_id', $validated['variant_id'] ?? null)
                ->first();

            if ($wishlistItem) {
                return response()->json([
                    'message' => 'Item already in wishlist.',
                    'already_exists' => true,
                    'wishlist_count' => $wishlist->total_items,
                ], 200);
            }

            // Store variant snapshot if variant selected
            $variantData = null;
            if (isset($validated['variant_id']) && $validated['variant_id'] && $product->has_variants && $product->variants) {
                $variant = collect($product->variants)->firstWhere('id', $validated['variant_id']);
                if ($variant) {
                    $variantData = $variant;
                }
            }

            // Create new wishlist item
            $wishlistItem = WishlistItem::create([
                'wishlist_id' => $wishlist->id,
                'product_id' => $product->id,
                'variant_id' => $validated['variant_id'] ?? null,
                'variant_snapshot' => $variantData,
                'notes' => $validated['notes'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Added to wishlist successfully.',
                'wishlist_item' => [
                    'id' => $wishlistItem->id,
                ],
                'wishlist_count' => $wishlist->fresh()->total_items,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to add to wishlist.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove item from wishlist.
     */
    public function removeItem($id)
    {
        $user = Auth::user();

        $wishlistItem = WishlistItem::with('wishlist')->findOrFail($id);

        // Verify ownership
        if ($wishlistItem->wishlist->buyer_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $wishlistItem->delete();

        return response()->json([
            'message' => 'Removed from wishlist successfully.',
            'wishlist_count' => $wishlistItem->wishlist->fresh()->total_items,
        ]);
    }

    /**
     * Toggle item in wishlist (add if not exists, remove if exists).
     */
    public function toggleItem(Request $request)
    {
        $user = Auth::user();

        // Only buyers can toggle wishlist
        if ($user->account_type !== 'buyer') {
            return response()->json(['error' => 'Only buyers can modify wishlist.'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Get or create wishlist
            $wishlist = Wishlist::getOrCreateForBuyer($user->id);

            // Check if product+variant already in wishlist
            $wishlistItem = WishlistItem::where('wishlist_id', $wishlist->id)
                ->where('product_id', $validated['product_id'])
                ->where('variant_id', $validated['variant_id'] ?? null)
                ->first();

            if ($wishlistItem) {
                // Remove from wishlist
                $wishlistItem->delete();
                DB::commit();

                return response()->json([
                    'message' => 'Removed from wishlist.',
                    'in_wishlist' => false,
                    'wishlist_count' => $wishlist->fresh()->total_items,
                ]);
            } else {
                // Add to wishlist
                $product = Product::findOrFail($validated['product_id']);

                if ($product->trashed()) {
                    return response()->json(['error' => 'This product is no longer available.'], 422);
                }

                // Store variant snapshot if variant selected
                $variantData = null;
                if (isset($validated['variant_id']) && $validated['variant_id'] && $product->has_variants && $product->variants) {
                    $variant = collect($product->variants)->firstWhere('id', $validated['variant_id']);
                    if ($variant) {
                        $variantData = $variant;
                    }
                }

                WishlistItem::create([
                    'wishlist_id' => $wishlist->id,
                    'product_id' => $product->id,
                    'variant_id' => $validated['variant_id'] ?? null,
                    'variant_snapshot' => $variantData,
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Added to wishlist.',
                    'in_wishlist' => true,
                    'wishlist_count' => $wishlist->fresh()->total_items,
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update wishlist.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
