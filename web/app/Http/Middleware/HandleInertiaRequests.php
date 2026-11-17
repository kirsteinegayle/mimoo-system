<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'max_per_checkout' => (int) config('checkout.max_quantity_per_product', 10),
            'name' => config('app.name'),
            'auth' => [
                // Same serialisation as before, plus `avatar` (URL or null) for the
                // shared headers/sidebars. Built by App\Support\AvatarUrl.
                'user' => ($u = $request->user())
                    ? $u->toArray() + ['avatar' => \App\Support\AvatarUrl::forUser($u)]
                    : null,
            ],
            // Current user's avatar for every header/sidebar. A separate key because
            // many pages pass their own `auth` prop, which replaces the shared one.
            'currentAvatar' => fn () => ($cu = $request->user())
                ? ['url' => \App\Support\AvatarUrl::forUser($cu), 'name' => (string) ($cu->business_name ?: ($cu->company_name ?? null) ?: $cu->name)]
                : null,
            // Published admin announcements for this user's role (buyer / seller / courier dashboards).
            'announcements' => fn () => \App\Models\Announcement::forUser($request->user()),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
