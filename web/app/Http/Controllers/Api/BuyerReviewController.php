<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

/**
 * Product reviews.
 *
 * POST /api/buyer/orders/{orderId}/items/{itemId}/review   (auth, buyer, multipart)
 * PUT  /api/buyer/reviews/{id}                             (auth, buyer; once, within 30 days)
 *      (multipart clients may POST with _method=PUT to replace photos)
 * GET  /api/buyer/products/{id}/reviews                    (public, names masked)
 * GET  /api/buyer/review-photo/{filename}                  (public image serving)
 *
 * Review window: the order must be 'completed' and order.updated_at + 30 days
 * must still be in the future. There is no completed_at column, so
 * updated_at is used as the completion time.
 */
class BuyerReviewController extends Controller
{
    use BuyerApiHelpers;

    private const FOLDER = 'review_photos';
    private const PREFIX = 'review';

    /** "Juan Dela Cruz" → "J***n D." */
    public static function maskName(?string $first, ?string $last): string
    {
        $first = trim((string) $first);
        $last  = trim((string) $last);
        if ($first === '') {
            return 'Anonymous';
        }
        $len    = mb_strlen($first);
        $masked = $len <= 2
            ? mb_substr($first, 0, 1) . '*'
            : mb_substr($first, 0, 1) . '***' . mb_substr($first, -1);
        return $last !== '' ? $masked . ' ' . mb_strtoupper(mb_substr($last, 0, 1)) . '.' : $masked;
    }

    private function format(Review $r, bool $public = true): array
    {
        $row = [
            'id'           => $r->id,
            'product_id'   => $r->product_id,
            'rating'       => $r->rating,
            'comment'      => $r->comment,
            'images'       => collect($r->images ?? [])->map(fn ($p) => $this->imageUrlFor($p, 'review-photo'))->values(),
            'buyer_name'   => self::maskName($r->buyer?->first_name, $r->buyer?->last_name),
            'variant'      => $r->orderItem?->variant_snapshot,
            'is_edited'    => $r->edited_at !== null,
            'seller_reply' => $r->seller_reply,
            'created_at'   => $r->created_at?->toISOString(),
        ];
        if (! $public) {
            $row['can_edit'] = $r->canBeEdited();
        }
        return $row;
    }

    private function validatePayload(Request $request): ?JsonResponse
    {
        $request->validate([
            'rating'  => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:500'],
        ], [
            'rating.required' => 'Please select a star rating.',
            'rating.between'  => 'Rating must be between 1 and 5 stars.',
            'comment.max'     => 'Comment must not exceed 500 characters.',
        ]);

        $files = $request->file('images', []);
        if (! is_array($files)) {
            $files = [$files];
        }
        if (count($files) > 5) {
            return $this->validationError('images', 'You can upload up to 5 photos only.');
        }
        foreach ($files as $file) {
            if ($msg = $this->imageError($file)) {
                return $this->validationError('images', $msg);
            }
        }
        return null;
    }

    private function storeFiles(Request $request): array
    {
        $files = $request->file('images', []);
        if (! is_array($files)) {
            $files = [$files];
        }
        return array_map(fn ($f) => $this->storeImage($f, self::FOLDER, self::PREFIX), $files);
    }

    // POST /api/buyer/orders/{orderId}/items/{itemId}/review
    public function store(Request $request, int $orderId, int $itemId): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $user = $request->user();

        $order = Order::where('buyer_id', $user->id)->find($orderId);
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }
        $item = $order->items()->find($itemId);
        if (! $item) {
            return response()->json(['message' => 'Order item not found.'], 404);
        }

        if ($order->status !== 'completed') {
            return $this->validationError('order', 'You can only review items from completed orders.');
        }
        if ($order->updated_at->copy()->addDays(Review::REVIEW_WINDOW_DAYS)->isPast()) {
            return $this->validationError('order', 'The 30-day review period for this order has ended.');
        }
        if (Review::where('order_item_id', $item->id)->exists()) {
            return $this->validationError('order_item', 'You have already reviewed this item.');
        }

        if ($err = $this->validatePayload($request)) return $err;

        $paths = $this->storeFiles($request);

        try {
            $review = Review::create([
                'order_item_id' => $item->id,
                'product_id'    => $item->product_id,
                'buyer_id'      => $user->id,
                'rating'        => (int) $request->input('rating'),
                'comment'       => $request->filled('comment') ? trim($request->input('comment')) : null,
                'images'        => $paths ?: null,
            ]);
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            foreach ($paths as $p) Storage::disk('public')->delete($p);
            return $this->validationError('order_item', 'You have already reviewed this item.');
        }

        return response()->json([
            'message' => 'Thank you for your review!',
            'data'    => $this->format($review->load('buyer', 'orderItem'), false),
        ], 201);
    }

    // PUT /api/buyer/reviews/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $review = Review::where('buyer_id', $request->user()->id)->find($id);
        if (! $review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }
        if ($review->edited_at !== null) {
            return $this->validationError('review', 'You can only edit a review once.');
        }
        if (! $review->canBeEdited()) {
            return $this->validationError('review', 'The 30-day edit period for this review has ended.');
        }

        if ($err = $this->validatePayload($request)) return $err;

        $data = [
            'rating'    => (int) $request->input('rating'),
            'comment'   => $request->filled('comment') ? trim($request->input('comment')) : null,
            'edited_at' => now(),
        ];

        if ($request->hasFile('images')) {
            $old           = $review->images ?? [];
            $data['images'] = $this->storeFiles($request);
            foreach ($old as $p) Storage::disk('public')->delete($p);
        }

        $review->update($data);

        return response()->json([
            'message' => 'Review updated.',
            'data'    => $this->format($review->fresh()->load('buyer', 'orderItem'), false),
        ]);
    }

    // GET /api/buyer/products/{id}/reviews  (public)
    public function productReviews(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $base  = Review::where('product_id', $product->id);
        $count = (clone $base)->count();
        $avg   = $count ? round((float) (clone $base)->avg('rating'), 1) : null;

        $breakdown = [];
        foreach ((clone $base)->selectRaw('rating, COUNT(*) c')->groupBy('rating')->pluck('c', 'rating') as $r => $c) {
            $breakdown[(string) $r] = (int) $c;
        }

        $perPage = min(max((int) $request->input('per_page', 10), 1), 50);
        $page    = (clone $base)->with('buyer:id,first_name,last_name', 'orderItem:id,variant_snapshot')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => collect($page->items())->map(fn ($r) => $this->format($r))->values(),
            'meta' => [
                'rating_avg'   => $avg,
                'rating_count' => $count,
                'breakdown'    => $breakdown,
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'has_more'     => $page->hasMorePages(),
            ],
        ]);
    }

    // GET /api/buyer/review-photo/{filename}
    public function servePhoto(string $filename): Response
    {
        return $this->serveStoredImage(self::FOLDER, self::PREFIX, $filename);
    }
}
