<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * GET /my-reviews — the buyer's own reviews (session auth, buyer accounts
 * only). Editing goes through PUT /buyer/reviews/{id} (same controller and
 * rules as the mobile app: once, within 30 days). There is no delete in the
 * mobile app or API, so none here either.
 */
class MyReviewsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->account_type === 'buyer', 403);

        $reviews = Review::with('product:id,name,images,main_image_index', 'orderItem:id,order_id,product_name,variant_snapshot')
            ->where('buyer_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Review $r) => [
                'id'           => $r->id,
                'product_id'   => $r->product_id,
                'product_name' => $r->product?->name ?? $r->orderItem?->product_name ?? 'Product',
                'product_url'  => $r->product ? '/product/' . $r->product_id : null,
                'order_id'     => $r->orderItem?->order_id,
                'rating'       => $r->rating,
                'comment'      => $r->comment,
                'images'       => collect($r->images ?? [])->map(fn ($p) => url('/api/buyer/review-photo/' . basename($p)))->values(),
                'is_edited'    => $r->edited_at !== null,
                'can_edit'     => $r->canBeEdited(),
                'seller_reply' => $r->seller_reply,
                'created_at'   => $r->created_at?->toISOString(),
            ])
            ->values();

        return Inertia::render('BuyerReviews', ['reviews' => $reviews]);
    }
}
