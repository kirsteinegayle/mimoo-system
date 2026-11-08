<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SellerFollow;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

/**
 * Public seller profile endpoint for the mobile buyer app.
 *
 * GET /api/buyer/sellers/{id}
 *   — 404 if user does not exist or account_type !== 'seller'
 *   — 404 if seller status is not 'approved'
 *   — returns safe public fields only (no email, contact_number, street_address,
 *     id_document, permits, password, etc.)
 *
 * Photos:
 *   profile_photo and cover_photo are stored as relative file paths in the DB
 *   (e.g. "store_photos/profiles/profile_42_17…jpg").
 *   Storage::url() resolves them to the public storage URL
 *   (e.g. /storage/store_photos/profiles/…).
 *   The storage:link symlink at web/public/storage is confirmed to exist.
 */
class BuyerSellerController extends Controller
{
    // ── Photo URL helper ──────────────────────────────────────────────────────

    private function photoUrl(?string $path): ?string
    {
        // Served via GET /api/buyer/seller-photo/{type}/{filename} (CORS +
        // Cache-Control) so Flutter Web can load it; null for anything else.
        return ProductController::sellerPhotoUrl($path);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/seller-photo/{type}/{filename}   type: profile | cover
    // Serves ONLY store_photos/profiles and store_photos/covers. No traversal.
    // ─────────────────────────────────────────────────────────────────────────
    public function servePhoto(string $type, string $filename): Response
    {
        $folders = ['profile' => 'store_photos/profiles', 'cover' => 'store_photos/covers'];
        if (! isset($folders[$type])) {
            abort(404);
        }
        if (preg_match('/[\/\\\\]|\.\./', $filename) || $filename !== basename($filename)) {
            abort(404);
        }
        // Filenames written by SellerStorePhotoController: {type}_{userId}_{time}.{ext}
        if (! preg_match('/^' . $type . '_\d+_\d+\.(jpe?g|png)$/i', $filename)) {
            abort(404);
        }

        $path = $folders[$type] . '/' . $filename;
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $contents = Storage::disk('public')->get($path);
        $etag     = '"' . md5($contents) . '"';
        if (request()->header('If-None-Match') === $etag) {
            return response('', 304);
        }

        return response($contents, 200, [
            'Content-Type'                => preg_match('/\.png$/i', $filename) ? 'image/png' : 'image/jpeg',
            'Cache-Control'               => 'public, max-age=86400',
            'ETag'                        => $etag,
            'X-Content-Type-Options'      => 'nosniff',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    // ── Location string (non-sensitive) ──────────────────────────────────────

    private function location(User $seller): ?string
    {
        $parts = [];
        if (! empty($seller->municipality_city)) {
            $parts[] = $seller->municipality_city;
        }
        // For NCR sellers there's no province; fall back to region.
        if (! empty($seller->province)) {
            $parts[] = $seller->province;
        } elseif (! empty($seller->region)) {
            $parts[] = $seller->region;
        }
        return $parts ? implode(', ', $parts) : null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/sellers/{id}
    // ─────────────────────────────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $seller = User::find($id);

        if (! $seller || $seller->account_type !== 'seller' || $seller->status !== 'approved') {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        // Display name: prefer business_name, fall back to full name.
        $displayName = ! empty($seller->business_name)
            ? $seller->business_name
            : trim($seller->first_name . ' ' . $seller->last_name);

        // Count only buyer-visible products for this seller.
        $totalProducts = Product::where('seller_id', $seller->id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->count();

        return response()->json([
            'data' => [
                'id'                => $seller->id,
                'display_name'      => $displayName,
                'profile_photo_url' => $this->photoUrl($seller->profile_photo),
                'cover_photo_url'   => $this->photoUrl($seller->cover_photo),
                'joined_date'       => $seller->created_at->toISOString(),
                'total_products'    => $totalProducts,
                'line_of_business'  => $seller->line_of_business,
                'location'          => $this->location($seller),
                'followers_count'   => SellerFollow::where('seller_id', $seller->id)->count(),
                // Same as the web store page stat (all non-cancelled/failed orders)
                'total_sold'        => (int) \App\Models\OrderItem::whereHas('product', fn ($q) => $q->where('seller_id', $seller->id))
                    ->whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled')->where('status', '!=', 'failed'))
                    ->sum('quantity'),
                // Public route: resolve the optional Bearer token manually.
                // false when there's no (valid) token.
                'is_following'      => ($viewer = auth('sanctum')->user())
                    ? SellerFollow::where('seller_id', $seller->id)->where('buyer_id', $viewer->id)->exists()
                    : false,
            ],
        ]);
    }
}
