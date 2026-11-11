<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\BuyerNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Buyer web notification feed page (session auth, buyer accounts only).
 *
 * GET /buyer/notifications?page=N  → Inertia page "BuyerNotifications"
 *
 * Read-only: mark one / mark all go through the existing session routes
 * /buyer/notifications/{id}/read and /buyer/notifications/read-all
 * (Api\BuyerNotificationController), and the bell keeps polling
 * /buyer/notifications/feed. Each buyer only ever sees their own rows.
 */
class NotificationController extends Controller
{
    public const PER_PAGE = 15;

    public static function format(BuyerNotification $n): array
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

    /** Paginated feed for one buyer, newest first. */
    public static function feedFor(int $buyerId, int $page = 1): array
    {
        $paginator = BuyerNotification::where('buyer_id', $buyerId)
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['*'], 'page', max(1, $page));

        return [
            'data' => collect($paginator->items())->map(fn ($n) => self::format($n))->values()->all(),
            'meta' => [
                'unread_count' => BuyerNotification::where('buyer_id', $buyerId)->whereNull('read_at')->count(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->account_type === 'buyer', 403);

        return Inertia::render('BuyerNotifications', [
            'notifications' => self::feedFor((int) $user->id, (int) $request->query('page', 1)),
        ]);
    }
}
