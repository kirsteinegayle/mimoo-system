<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\CourierNotification;
use App\Support\CourierCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Courier company notifications (session auth). Courier users read their own
 * rows; logistics_staff read the rows of the company they belong to
 * (CourierCompanyResolver). Anyone else: 403 (also gated by the /courier/* portal middleware).
 *
 * GET  /courier/notifications            Inertia page
 * GET  /courier/notifications/feed       JSON for the bell (same shape as the seller/buyer feed)
 * POST /courier/notifications/{id}/read  404 when not this company's row
 * POST /courier/notifications/read-all
 */
class NotificationController extends Controller
{
    public const PER_PAGE = 15;

    private function companyId(Request $request): ?int
    {
        $user = $request->user();

        return $user ? CourierCompanyResolver::resolveId($user) : null;
    }

    public static function format(CourierNotification $n): array
    {
        $url = $n->url ?: '/courier/dashboard';

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

    public static function feedFor(int $courierId, int $page = 1): array
    {
        $p = CourierNotification::where('courier_id', $courierId)->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['*'], 'page', max(1, $page));

        return [
            'data' => collect($p->items())->map(fn ($n) => self::format($n))->values()->all(),
            'meta' => [
                'unread_count' => self::unread($courierId),
                'current_page' => $p->currentPage(),
                'last_page'    => $p->lastPage(),
                'per_page'     => $p->perPage(),
                'total'        => $p->total(),
                'has_more'     => $p->hasMorePages(),
            ],
        ];
    }

    private static function unread(int $courierId): int
    {
        return CourierNotification::where('courier_id', $courierId)->whereNull('read_at')->count();
    }

    private function forbidden(): JsonResponse
    {
        return response()->json(['message' => 'Only courier and logistics accounts linked to a courier company can access this endpoint.'], 403);
    }

    public function page(Request $request): Response
    {
        $id = $this->companyId($request);
        abort_unless($id, 403);
        $user = $request->user();

        return Inertia::render('courier/Notifications', [
            'auth'    => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
            'notifications' => self::feedFor($id, (int) $request->query('page', 1)),
        ]);
    }

    public function feed(Request $request): JsonResponse
    {
        $id = $this->companyId($request);

        return $id ? response()->json(self::feedFor($id, (int) $request->query('page', 1))) : $this->forbidden();
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $cid = $this->companyId($request);
        if (! $cid) {
            return $this->forbidden();
        }

        $n = CourierNotification::where('courier_id', $cid)->find($id);
        if (! $n) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        if ($n->read_at === null) {
            $n->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Marked as read.', 'unread_count' => self::unread($cid)]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $cid = $this->companyId($request);
        if (! $cid) {
            return $this->forbidden();
        }

        CourierNotification::where('courier_id', $cid)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.', 'unread_count' => 0]);
    }
}
