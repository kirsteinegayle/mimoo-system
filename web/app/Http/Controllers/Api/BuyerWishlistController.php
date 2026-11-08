<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Mobile buyer wishlist - Sanctum Bearer auth.
 *
 * Uses the same tables as the website: wishlists (one per buyer)
 * and wishlist_items (one row per product/variant).
 *
 * Requires: account_type = 'buyer' (403 otherwise).
 * Idempotency:
 *   POST   -> 200 if already in wishlist.
 *   DELETE -> 200 even if not in wishlist.
 */
class BuyerWishlistController extends Controller
{
    private function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can access the wishlist.'], 403);
        }
        return null;
    }

    private function imageUrl(Product $product): ?string
    {
        $images = $product->images ?? [];
        $idx    = $product->main_image_index ?? 0;
        if (empty($images[$idx])) {
            return null;
        }
        return url("/api/buyer/products/{$product->id}/image/{$idx}");
    }

    private function itemCount(int $buyerId): int
    {
        $wishlist = Wishlist::where('buyer_id', $buyerId)->first();
        return $wishlist ? $wishlist->items()->count() : 0;
    }

    private function wishlistRow(WishlistItem $entry): array
    {
        $product = $entry->product;

        if (! $product || $product->trashed()) {
            return [
                'product_id'      => $entry->product_id,
                'product_name'    => 'Product no longer available',
                'image_url'       => null,
                'price'           => 0,
                'sale_price'      => null,
                'effective_price' => 0,
                'is_on_sale'      => false,
                'stock'           => 0,
                'stock_status'    => 'Unavailable',
                'is_in_stock'     => false,
                'is_available'    => false,
                'added_at'        => $entry->created_at->toISOString(),
            ];
        }

        $isAvailable = $product->status === 'active'
            && $product->approval_status === 'approved';

        return [
            'product_id'      => $product->id,
            'product_name'    => $product->name,
            'image_url'       => $this->imageUrl($product),
            'price'           => (float) $product->price,
            'sale_price'      => $product->sale_price ? (float) $product->sale_price : null,
            'effective_price' => (float) ($product->sale_price ?? $product->price),
            'is_on_sale'      => $product->isOnSale(),
            'stock'           => $product->stock,
            'stock_status'    => $product->stock_status,
            'is_in_stock'     => $product->isInStock(),
            'is_available'    => $isAvailable,
            'added_at'        => $entry->created_at->toISOString(),
        ];
    }

    // GET /api/buyer/wishlist
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $wishlist = Wishlist::where('buyer_id', $request->user()->id)->first();

        $entries = $wishlist
            ? $wishlist->items()->with('product')->orderBy('created_at', 'desc')->get()
            : collect();

        return response()->json([
            'data' => $entries->map(fn ($e) => $this->wishlistRow($e))->values(),
        ]);
    }

    // POST /api/buyer/wishlist/{productId}
    public function store(Request $request, int $productId): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $product = Product::find($productId);

        if (! $product || $product->trashed()) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        if ($product->status !== 'active' || $product->approval_status !== 'approved') {
            return response()->json([
                'message' => 'This product is not available.',
            ], 422);
        }

        $buyerId  = $request->user()->id;
        $wishlist = Wishlist::getOrCreateForBuyer($buyerId);

        $existing = $wishlist->items()
            ->where('product_id', $productId)
            ->whereNull('variant_id')
            ->first();

        if ($existing) {
            return response()->json([
                'message'        => 'Product is already in your wishlist.',
                'wishlist_count' => $this->itemCount($buyerId),
            ]);
        }

        WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'product_id'  => $productId,
        ]);

        return response()->json([
            'message'        => 'Added to wishlist.',
            'wishlist_count' => $this->itemCount($buyerId),
        ]);
    }

    // DELETE /api/buyer/wishlist/{productId}
    public function destroy(Request $request, int $productId): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $buyerId  = $request->user()->id;
        $wishlist = Wishlist::where('buyer_id', $buyerId)->first();

        if ($wishlist) {
            $wishlist->items()->where('product_id', $productId)->delete();
        }

        return response()->json([
            'message'        => 'Removed from wishlist.',
            'wishlist_count' => $this->itemCount($buyerId),
        ]);
    }
}