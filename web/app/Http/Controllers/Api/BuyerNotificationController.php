<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\BuyerNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * In-app notifications (auth:sanctum, buyer only). No push / Firebase.
 *
 * GET  /api/buyer/notifications            (?page=, includes meta.unread_count)
 * POST /api/buyer/notifications/{id}/read
 * POST /api/buyer/notifications/read-all
 */
class BuyerNotificationController extends Controller
{
    use BuyerApiHelpers;

    private function format(BuyerNotification $n): array
    {
        return [
            'id'         => $n->id,
            'type'       => $n->type,
            'title'      => $n->title,
            'body'       => $n->body,
            'data'       => $n->data ?? (object) [],
            'is_read'    => $n->read_at !== null,
            'read_at'    => $n->read_at?->toISOString(),
            'created_at' => $n->created_at?->toISOString(),
        ];
    }

    private function unreadCount(int $buyerId): int
    {
        return BuyerNotification::where('buyer_id', $buyerId)->whereNull('read_at')->count();
    }

    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        $page = BuyerNotification::where('buyer_id', $buyerId)
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'data' => collect($page->items())->map(fn ($n) => $this->format($n))->values(),
            'meta' => [
                'unread_count' => $this->unreadCount($buyerId),
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'has_more'     => $page->hasMorePages(),
            ],
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        $n = BuyerNotification::where('buyer_id', $buyerId)->find($id);
        if (! $n) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        if ($n->read_at === null) {
            $n->update(['read_at' => now()]);
        }

        return response()->json([
            'message'      => 'Marked as read.',
            'unread_count' => $this->unreadCount($buyerId),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        BuyerNotification::where('buyer_id', $buyerId)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.', 'unread_count' => 0]);
    }
}
