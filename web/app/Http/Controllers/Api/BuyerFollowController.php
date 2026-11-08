<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\SellerFollow;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Follow store (auth:sanctum, buyer only).
 *
 * POST   /api/buyer/sellers/{id}/follow   — idempotent
 * DELETE /api/buyer/sellers/{id}/follow   — idempotent
 * GET    /api/buyer/following
 */
class BuyerFollowController extends Controller
{
    use BuyerApiHelpers;

    private function findSeller(int $id): ?User
    {
        $seller = User::find($id);
        if (! $seller || $seller->account_type !== 'seller' || $seller->status !== 'approved') {
            return null;
        }
        return $seller;
    }

    private function state(int $sellerId, int $buyerId): array
    {
        return [
            'is_following'    => SellerFollow::where('seller_id', $sellerId)->where('buyer_id', $buyerId)->exists(),
            'followers_count' => SellerFollow::where('seller_id', $sellerId)->count(),
        ];
    }

    // POST /api/buyer/sellers/{id}/follow
    public function follow(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $seller = $this->findSeller($id);
        if (! $seller) {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        $buyerId = $request->user()->id;
        SellerFollow::firstOrCreate(['buyer_id' => $buyerId, 'seller_id' => $seller->id]);

        return response()->json(['message' => 'Following store.'] + $this->state($seller->id, $buyerId));
    }

    // DELETE /api/buyer/sellers/{id}/follow
    public function unfollow(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $seller = $this->findSeller($id);
        if (! $seller) {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        $buyerId = $request->user()->id;
        SellerFollow::where('buyer_id', $buyerId)->where('seller_id', $seller->id)->delete();

        return response()->json(['message' => 'Unfollowed store.'] + $this->state($seller->id, $buyerId));
    }

    // GET /api/buyer/following
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $follows = SellerFollow::with('seller')
            ->where('buyer_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->filter(fn ($f) => $f->seller && $f->seller->account_type === 'seller' && $f->seller->status === 'approved');

        $data = $follows->map(function ($f) {
            $s = $f->seller;
            return [
                'seller_id'         => $s->id,
                'display_name'      => ! empty($s->business_name)
                    ? $s->business_name
                    : trim($s->first_name . ' ' . $s->last_name),
                'profile_photo_url' => ProductController::sellerPhotoUrl($s->profile_photo),
                'followers_count'   => SellerFollow::where('seller_id', $s->id)->count(),
                'followed_at'       => $f->created_at?->toISOString(),
            ];
        })->values();

        return response()->json(['data' => $data, 'meta' => ['count' => $data->count()]]);
    }
}
