<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Support\PortalRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Seller replies to reviews of THEIR OWN products (session auth, seller only).
 *
 * GET  /seller/reviews/feed          JSON list of reviews on my products
 * POST /seller/reviews/{id}/reply    { reply }  (required, max 500; 404 if not my product)
 *
 * Writes reviews.seller_reply only (the buyer web pages and the mobile API
 * already expose that column). Replying again replaces the previous reply.
 */
class ReviewsController extends Controller
{
    public const REPLY_MAX = 500;
    public const PER_PAGE  = 10;

    private function sellerId(Request $request): int
    {
        $user = $request->user();
        abort_unless($user && PortalRole::roleOf($user) === 'seller', 403, 'Only seller accounts can access reviews.');

        return (int) $user->id;
    }

    private function mine(int $sellerId)
    {
        return Review::where(function ($q) use ($sellerId) {
            $q->whereHas('orderItem', fn ($i) => $i->where('seller_id', $sellerId))
                ->orWhereHas('product', fn ($p) => $p->where('seller_id', $sellerId));
        });
    }

    public function feed(Request $request): JsonResponse
    {
        $sellerId = $this->sellerId($request);
        $filter   = (string) $request->query('filter', 'all'); // all | unreplied | replied

        $page = $this->mine($sellerId)
            ->with(['product:id,name', 'orderItem:id,order_id,product_name', 'buyer:id,name,first_name'])
            ->when($filter === 'unreplied', fn ($q) => $q->where(fn ($w) => $w->whereNull('seller_reply')->orWhere('seller_reply', '')))
            ->when($filter === 'replied', fn ($q) => $q->whereNotNull('seller_reply')->where('seller_reply', '<>', ''))
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['*'], 'page', max(1, (int) $request->query('page', 1)));

        return response()->json([
            'data' => collect($page->items())->map(fn (Review $r) => $this->format($r))->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'per_page'     => $page->perPage(),
                'total'        => $page->total(),
            ],
        ]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $sellerId = $this->sellerId($request);

        $review = $this->mine($sellerId)->whereKey($id)->first();
        if (! $review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        $data = $request->validate([
            'reply' => ['required', 'string', 'max:' . self::REPLY_MAX],
        ], [
            'reply.required' => 'Please write a reply.',
            'reply.max'      => 'Your reply must not exceed ' . self::REPLY_MAX . ' characters.',
        ]);

        $text = trim($data['reply']);
        if ($text === '') {
            return response()->json(['message' => 'Please write a reply.', 'errors' => ['reply' => ['Please write a reply.']]], 422);
        }

        $review->forceFill(['seller_reply' => $text])->save();

        return response()->json(['message' => 'Reply saved.', 'data' => $this->format($review->load(['product:id,name', 'orderItem:id,order_id,product_name', 'buyer:id,name,first_name']))]);
    }

    private function format(Review $r): array
    {
        $buyer = trim((string) ($r->buyer?->first_name ?: $r->buyer?->name));

        return [
            'id'           => $r->id,
            'product_name' => $r->product?->name ?? $r->orderItem?->product_name ?? 'Product',
            'buyer_name'   => $buyer !== '' ? mb_substr($buyer, 0, 1) . str_repeat('*', 4) : 'Buyer',
            'rating'       => (int) $r->rating,
            'comment'      => $r->comment,
            'seller_reply' => $r->seller_reply,
            'created_at'   => $r->created_at?->toISOString(),
        ];
    }
}
