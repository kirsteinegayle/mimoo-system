<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    // Allowed MIME types for stored base64 product images
    private const ALLOWED_MIME = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    // ── Base buyer visibility scope ───────────────────────────────────────────

    private function visibleQuery()
    {
        return Product::with('seller:id,business_name,first_name,last_name,name,profile_photo')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('status', 'active')
            ->where('approval_status', 'approved');
        // SoftDeletes trait automatically excludes deleted_at IS NOT NULL rows.
    }

    /**
     * Adds total_sold exactly like the web homepage (routes/web.php '/homepage'):
     * SUM(quantity) of order items whose order is not cancelled/failed and was
     * created in the last 7 days.
     */
    private function withTotalSold($query)
    {
        return $query->withCount(['orderItems as total_sold' => function ($q) {
            $q->selectRaw('COALESCE(SUM(quantity), 0)')
                ->whereHas('order', function ($o) {
                    $o->where('status', '!=', 'cancelled')
                        ->where('status', '!=', 'failed')
                        ->where('created_at', '>=', now()->subDays(7));
                });
        }]);
    }

    /** Store photo URL served through GET /api/buyer/seller-photo/{type}/{filename}. */
    public static function sellerPhotoUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'store_photos/profiles/')) {
            return url('/api/buyer/seller-photo/profile/' . basename($path));
        }
        if (str_starts_with($path, 'store_photos/covers/')) {
            return url('/api/buyer/seller-photo/cover/' . basename($path));
        }
        return null; // anything else is not served
    }

    // ── Build absolute image URL for a given product + index ─────────────────

    /**
     * Return the absolute URL for the image endpoint, or null when the index
     * is out of range or the stored value is empty.
     */
    private function imageUrl(Product $product, int $index): ?string
    {
        $images = $product->images ?? [];
        if (!isset($images[$index]) || empty($images[$index])) {
            return null;
        }
        return url("/api/buyer/products/{$product->id}/image/{$index}");
    }

    /**
     * Map a variant array, replacing any inline base64 image with a URL.
     */
    private function mapVariant(array $variant, Product $product): array
    {
        // Variants store their image as a base64 string keyed as 'image'.
        // We expose a URL instead.
        $hasImg = !empty($variant['image']);
        return [
            'id'          => $variant['id'] ?? null,
            'combination' => $variant['combination'] ?? [],
            'sku'         => $variant['sku'] ?? null,
            'price'       => isset($variant['price']) ? (float) $variant['price'] : null,
            'stock'       => isset($variant['stock']) ? (int) $variant['stock'] : 0,
            'image_url'   => $hasImg
                ? url("/api/buyer/products/{$product->id}/variant-image/{$variant['id']}")
                : null,
        ];
    }

    // ── Shared product list row ───────────────────────────────────────────────

    private function listRow(Product $product): array
    {
        $mainIdx = $product->main_image_index ?? 0;

        return [
            'id'             => $product->id,
            'name'           => $product->name,
            'price'          => (float) $product->price,
            'sale_price'     => $product->sale_price ? (float) $product->sale_price : null,
            'effective_price'=> (float) ($product->sale_price ?? $product->price),
            'is_on_sale'     => $product->sale_price !== null && $product->sale_price < $product->price,
            'category'       => $product->category,
            'image_url'      => $this->imageUrl($product, $mainIdx),
            'stock'          => $product->stock,
            'stock_status'   => $product->stock_status,
            'is_in_stock'    => $product->isInStock(),
            'brand'          => $product->brand,
            'seller_id'      => $product->seller_id,
            'seller_name'    => $product->seller
                ? ($product->seller->business_name
                    ?: ($product->seller->name
                        ?: trim($product->seller->first_name . ' ' . $product->seller->last_name)))
                : null,
            // Same definition as the web homepage (7-day sold count)
            'total_sold'     => (int) ($product->total_sold ?? 0),
            'has_variants'   => (bool) $product->has_variants,
            // Real review aggregates (null avg when there are no reviews)
            'rating_avg'     => $product->reviews_avg_rating !== null
                ? round((float) $product->reviews_avg_rating, 1)
                : null,
            'rating_count'   => (int) ($product->reviews_count ?? 0),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/products
    // Public product list — status=active, approval_status=approved.
    // ?category=  ?search=  ?sort=newest|price_asc|price_desc  ?page=  ?per_page=
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = $this->visibleQuery();

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                // Same fields as the web homepage search
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Seller filter (for seller store page use later)
        if ($request->filled('seller_id')) {
            $query->where('seller_id', (int) $request->input('seller_id'));
        }

        $this->withTotalSold($query);

        // Sort — default 'popular' mirrors the web homepage ordering
        // (total_sold desc, then newest).
        switch ($request->input('sort', 'popular')) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'price_asc':
                $query->orderByRaw('COALESCE(sale_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(sale_price, price) DESC');
                break;
            default: // popular
                $query->orderBy('total_sold', 'desc')->orderBy('created_at', 'desc');
        }

        $perPage  = min((int) $request->input('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->map(fn ($p) => $this->listRow($p)),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'has_more'     => $products->hasMorePages(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/categories
    // Distinct categories of buyer-visible products, with product counts.
    // ─────────────────────────────────────────────────────────────────────────
    public function categories(): JsonResponse
    {
        $rows = Product::where('status', 'active')
            ->where('approval_status', 'approved')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->selectRaw('category, COUNT(*) as product_count')
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        return response()->json([
            'data' => $rows->map(fn ($r) => [
                'name'          => $r->category,
                'product_count' => (int) $r->product_count,
            ])->values(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/products/{id}
    // Single product detail.
    // ─────────────────────────────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $product = $this->withTotalSold($this->visibleQuery())->findOrFail($id);

        $images = $product->images ?? [];
        $imageUrls = [];
        foreach ($images as $i => $raw) {
            if (!empty($raw)) {
                $imageUrls[] = url("/api/buyer/products/{$product->id}/image/{$i}");
            }
        }

        $variants = null;
        if ($product->has_variants && is_array($product->variants)) {
            $variants = array_map(
                fn ($v) => $this->mapVariant($v, $product),
                $product->variants
            );
        }

        return response()->json([
            'data' => array_merge($this->listRow($product), [
                'description'    => $product->description,
                'sku'            => $product->sku,
                'weight'         => $product->weight ? (float) $product->weight : null,
                'images'         => $imageUrls,
                'variant_options'=> $product->variant_options,
                'variants'       => $variants,
                'is_low_stock'   => $product->isLowStock(),
                'low_stock_threshold' => $product->low_stock_threshold,
                'created_at'     => $product->created_at->toISOString(),
                'main_image_index' => (int) ($product->main_image_index ?? 0),
                // Same as web product page seller block
                'seller_profile_photo_url' => self::sellerPhotoUrl($product->seller?->profile_photo),
            ]),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/products/{id}/image/{index?}
    // Decode a stored base64 image and return it as binary with CORS headers.
    // index defaults to the product's main_image_index.
    // ─────────────────────────────────────────────────────────────────────────
    public function image(int $id, int $index = -1): Response
    {
        // Any visibility; if the product exists we serve the image even for
        // draft items (avoids broken images if admin previews). Adjust if needed.
        $product = Product::findOrFail($id);

        $images = $product->images ?? [];
        if ($index === -1) {
            $index = $product->main_image_index ?? 0;
        }

        if (!isset($images[$index]) || empty($images[$index])) {
            abort(404, 'Image not found.');
        }

        return $this->serveBase64Image($images[$index]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/products/{id}/variant-image/{variantId}
    // Serve a variant's base64 image as binary (same mechanism as image()).
    // ─────────────────────────────────────────────────────────────────────────
    public function variantImage(int $id, string $variantId): Response
    {
        $product  = Product::findOrFail($id);
        $variants = $product->variants ?? [];

        $image = null;
        foreach ($variants as $v) {
            if (($v['id'] ?? null) === $variantId) {
                $image = $v['image'] ?? null;
                break;
            }
        }

        if (empty($image)) {
            abort(404, 'Variant image not found.');
        }

        return $this->serveBase64Image($image);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Shared: decode and stream a base64 data-URL image
    // ─────────────────────────────────────────────────────────────────────────
    private function serveBase64Image(string $dataUrl): Response
    {
        // Expect: data:image/jpeg;base64,<data>
        if (!preg_match('/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s', $dataUrl, $matches)) {
            abort(404, 'Malformed image data.');
        }

        $mime   = strtolower($matches[1]);
        $b64    = $matches[2];

        if (!array_key_exists($mime, self::ALLOWED_MIME)) {
            abort(404, 'Unsupported image type.');
        }

        $binary = base64_decode($b64, strict: true);
        if ($binary === false || strlen($binary) === 0) {
            abort(404, 'Could not decode image.');
        }

        // ETag based on content hash (stable across requests)
        $etag = '"' . md5($b64) . '"';

        // Check If-None-Match for conditional GET
        if (request()->header('If-None-Match') === $etag) {
            return response('', 304);
        }

        return response($binary, 200, [
            'Content-Type'  => $mime,
            'Content-Length'=> strlen($binary),
            'Cache-Control' => 'public, max-age=86400',
            'ETag'          => $etag,
            // CORS — covered by HandleCors middleware on api/* routes,
            // but set explicitly for CanvasKit image fetches just in case.
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
