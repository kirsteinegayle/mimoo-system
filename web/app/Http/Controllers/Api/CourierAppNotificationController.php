<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Courier app notifications (Sanctum + courier.role). Same rows as the web bell
 * (courier_notifications, written by CourierNotificationService); a courier only sees its own.
 *
 *   GET  /api/courier-app/notifications?filter=unread&category=pickups|deliveries|messages&page=
 *   GET  /api/courier-app/notifications/unread-count     { data: { unread } }
 *   POST /api/courier-app/notifications/read-all
 *   POST /api/courier-app/notifications/{id}/read        404 when not this courier's row
 *
 * Item shape = the app's CourierNotificationItem (category, type, title, body, is_read, created_at,
 * time_ago, related_type, related_id).
 */
class CourierAppNotificationController extends Controller
{
    private const PER_PAGE = 20;

    private const CATEGORY_TYPES = [
        'pickups'    => ['pickup_assigned', 'rider_assigned'],
        'deliveries' => ['delivery_rider_assigned', 'delivered', 'delivery_failed'],
        'messages'   => ['conversation_message'],
    ];

    private function category(string $type): string
    {
        foreach (self::CATEGORY_TYPES as $cat => $types) {
            if (in_array($type, $types, true)) {
                return $cat;
            }
        }

        return 'system';
    }

    private function format(CourierNotification $n): array
    {
        $d = $n->data ?? [];
        $related = isset($d['delivery_job_id']) ? ['delivery_job', $d['delivery_job_id']]
            : (isset($d['assignment_id']) ? ['pickup', $d['assignment_id']]
            : (isset($d['conversation_id']) ? ['conversation', $d['conversation_id']] : [null, null]));

        return [
            'id'           => $n->id,
            'category'     => $this->category($n->type),
            'type'         => $n->type,
            'title'        => $n->title,
            'body'         => $n->message,
            'is_read'      => $n->read_at !== null,
            'created_at'   => $n->created_at?->toISOString(),
            'time_ago'     => $n->created_at?->diffForHumans(),
            'related_type' => $related[0],
            'related_id'   => $related[1],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $id  = (int) $request->user()->id;
        $cat = (string) $request->query('category', 'all');
        $p = CourierNotification::where('courier_id', $id)
            ->when($request->query('filter') === 'unread', fn ($q) => $q->whereNull('read_at'))
            ->when(isset(self::CATEGORY_TYPES[$cat]), fn ($q) => $q->whereIn('type', self::CATEGORY_TYPES[$cat]))
            ->when($cat === 'system', fn ($q) => $q->whereNotIn('type', array_merge(...array_values(self::CATEGORY_TYPES))))
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['*'], 'page', max(1, (int) $request->query('page', 1)));

        return response()->json([
            'data' => collect($p->items())->map(fn ($n) => $this->format($n))->values(),
            'meta' => ['current_page' => $p->currentPage(), 'last_page' => $p->lastPage(), 'total' => $p->total()],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json(['data' => ['unread' => CourierNotification::where('courier_id', $request->user()->id)->whereNull('read_at')->count()]]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $n = CourierNotification::where('courier_id', $request->user()->id)->find($id);
        if (! $n) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        if ($n->read_at === null) {
            $n->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Marked as read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        CourierNotification::where('courier_id', $request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
