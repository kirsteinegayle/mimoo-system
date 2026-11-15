<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\AdminSetting;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin panel: Notifications and Settings (master-code session, admin.verified).
 *
 *   GET  /admin/notifications            page
 *   GET  /admin/notifications/feed       ?filter=all|unread&page=   (syncs new events first)
 *   GET  /admin/notifications/unread-count
 *   POST /admin/notifications/{id}/read
 *   POST /admin/notifications/read-all
 *   GET  /admin/settings                 page
 *   POST /admin/settings/profile         { display_name, email }
 *   POST /admin/settings/password        { current_code, new_code, new_code_confirmation }
 *
 * The admin team has no users row, so "password" is the panel access code:
 * once changed here its bcrypt hash is stored in admin_settings and replaces
 * ADMIN_MASTER_CODE (the .env value is never read back or shown).
 */
class AdminAccountController extends Controller
{
    public const CODE_KEY = 'access_code_hash';

    private const PER_PAGE = 20;

    // ── Notifications ────────────────────────────────────────────────────────

    public function notificationsPage(): Response
    {
        return Inertia::render('admin/Notifications');
    }

    public function feed(Request $request): JsonResponse
    {
        AdminNotificationService::sync();

        $unreadOnly = $request->query('filter') === 'unread';
        $page = AdminNotification::query()
            ->when($unreadOnly, fn ($q) => $q->whereNull('read_at'))
            ->orderByDesc('created_at')->orderByDesc('id')
            ->paginate(self::PER_PAGE, ['*'], 'page', max(1, (int) $request->query('page', 1)));

        return response()->json([
            'data' => collect($page->items())->map(fn (AdminNotification $n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'title'      => $n->title,
                'body'       => $n->body,
                'link'       => $n->link,
                'read_at'    => $n->read_at?->toISOString(),
                'created_at' => $n->created_at?->toISOString(),
            ])->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'total'        => $page->total(),
                'unread'       => AdminNotification::whereNull('read_at')->count(),
            ],
        ])->header('Cache-Control', 'no-store, private');
    }

    public function unreadCount(): JsonResponse
    {
        AdminNotificationService::sync();

        return response()->json(['data' => ['unread' => AdminNotification::whereNull('read_at')->count()]])
            ->header('Cache-Control', 'no-store, private');
    }

    public function markRead(int $id): JsonResponse
    {
        $n = AdminNotification::find($id);
        if (! $n) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        if (! $n->read_at) {
            $n->forceFill(['read_at' => now()])->save();
        }

        return response()->json(['message' => 'Marked as read.']);
    }

    public function markAllRead(): JsonResponse
    {
        $marked = AdminNotification::whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.', 'data' => ['marked' => $marked]]);
    }

    // ── Settings ─────────────────────────────────────────────────────────────

    public function settingsPage(): Response
    {
        return Inertia::render('admin/Settings', [
            'profile' => [
                'display_name' => AdminSetting::get('display_name', 'mimoo Admin'),
                'email'        => AdminSetting::get('email', ''),
            ],
            'codeChangedAt' => AdminSetting::query()->whereKey(self::CODE_KEY)->value('updated_at'),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'display_name' => ['required', 'string', 'min:2', 'max:60'],
            'email'        => ['nullable', 'email', 'max:255'],
        ], [
            'display_name.required' => 'Please enter a display name.',
            'email.email'           => 'Please enter a valid email address.',
        ]);

        AdminSetting::put('display_name', trim($data['display_name']));
        AdminSetting::put('email', trim((string) ($data['email'] ?? '')));

        return response()->json(['message' => 'Profile saved.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_code' => ['required', 'string'],
            'new_code'     => ['required', 'string', 'min:10', 'max:128', 'confirmed', 'different:current_code'],
        ], [
            'current_code.required' => 'Enter the current access code.',
            'new_code.min'          => 'The new access code must be at least 10 characters.',
            'new_code.confirmed'    => 'The new access codes do not match.',
            'new_code.different'    => 'The new access code must be different from the current one.',
        ]);

        if (! self::codeMatches($data['current_code'])) {
            return response()->json([
                'message' => 'The current access code is incorrect.',
                'errors'  => ['current_code' => ['The current access code is incorrect.']],
            ], 422);
        }

        AdminSetting::put(self::CODE_KEY, Hash::make($data['new_code']));

        return response()->json(['message' => 'Access code changed. Use the new code next time you sign in.']);
    }

    /** The stored hash (if set) replaces the .env master code. Constant-time either way. */
    public static function codeMatches(string $input): bool
    {
        $hash = AdminSetting::get(self::CODE_KEY);
        if ($hash) {
            return Hash::check($input, $hash);
        }

        $master = (string) config('app.admin_master_code');

        return $master !== '' && hash_equals($master, $input);
    }
}
