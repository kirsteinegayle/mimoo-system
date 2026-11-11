<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SellerNotification;
use App\Services\SellerNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Seller in-app notifications (session auth, seller accounts only).
 *
 * GET  /seller/notifications            Inertia feed page (?page=)
 * GET  /seller/notifications/feed       JSON for the bell (same shape as the buyer feed)
 * POST /seller/notifications/{id}/read  404 when not this seller's row
 * POST /seller/notifications/read-all
 *
 * JSON items use the buyer feed shape (body = message, data.url = url) so
 * the shared NotificationBell component works unchanged.
 */
class NotificationController extends Controller
{
    public const PER_PAGE = 15;

    private function sellerId(Request $request): ?int
    {
        $user = $request->user();
        return $user && $user->account_type === 'seller' ? (int) $user->id : null;
    }

    private function forbidden(): JsonResponse
    {
        return response()->json(['message' => 'Only seller accounts can access this endpoint.'], 403);
    }

    public static function format(SellerNotification $n): array
    {
        $url = $n->url ?: SellerNotificationService::URL;
        return [
            'id'         => $n->id,
            'type'       => $n->type,
            'title'      => $n->title,
            'body'       => $n->message,
            'message'    => $n->message,
            'url'        => $url,
            'data'       => array_merge($n->data ?? [], ['url' => $url]),
            'is_read'    => $n->read_at !== null,
            'read_at'    => $n->read_at?->toISOString(),
            'created_at' => $n->created_at?->toISOString(),
        ];
    }

    public static function feedFor(int $sellerId, int $page = 1): array
    {
        $p = SellerNotification::where('seller_id', $sellerId)
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['*'], 'page', max(1, $page));

        return [
            'data' => collect($p->items())->map(fn ($n) => self::format($n))->values()->all(),
            'meta' => [
                'unread_count' => self::unreadCount($sellerId),
                'current_page' => $p->currentPage(),
                'last_page'    => $p->lastPage(),
                'per_page'     => $p->perPage(),
                'total'        => $p->total(),
                'has_more'     => $p->hasMorePages(),
            ],
        ];
    }

    private static function unreadCount(int $sellerId): int
    {
        return SellerNotification::where('seller_id', $sellerId)->whereNull('read_at')->count();
    }

    public function page(Request $request): Response
    {
        $sellerId = $this->sellerId($request);
        abort_unless($sellerId, 403);

        return Inertia::render('seller/SellerNotifications', [
            'notifications' => self::feedFor($sellerId, (int) $request->query('page', 1)),
        ]);
    }

    public function feed(Request $request): JsonResponse
    {
        $sellerId = $this->sellerId($request);
        if (! $sellerId) return $this->forbidden();

        return response()->json(self::feedFor($sellerId, (int) $request->query('page', 1)));
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $sellerId = $this->sellerId($request);
        if (! $sellerId) return $this->forbidden();

        $n = SellerNotification::where('seller_id', $sellerId)->find($id);
        if (! $n) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        if ($n->read_at === null) {
            $n->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Marked as read.', 'unread_count' => self::unreadCount($sellerId)]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $sellerId = $this->sellerId($request);
        if (! $sellerId) return $this->forbidden();

        SellerNotification::where('seller_id', $sellerId)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.', 'unread_count' => 0]);
    }
}
