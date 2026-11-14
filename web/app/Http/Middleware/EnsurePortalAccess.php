<?php

namespace App\Http\Middleware;

use App\Support\PortalRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Path-based role gate for the logistics hub and courier web areas, so no route
 * in those areas can be opened by another role (seller, buyer, rider, ...).
 *
 *   /logistics/*, /api/logistics/*  -> logistics_staff
 *   /courier/*,   /api/courier/*    -> courier, logistics_staff (existing access kept)
 *
 * Guests pass through (the route's own `auth` middleware handles them).
 * A signed-in user with the wrong role gets 403.
 */
class EnsurePortalAccess
{
    /** path pattern => allowed roles */
    private const AREAS = [
        'logistics/*'     => ['logistics_staff'],
        'api/logistics/*' => ['logistics_staff'],
        'courier/*'       => ['courier', 'logistics_staff'],
        'api/courier/*'   => ['courier', 'logistics_staff'],
    ];

    /** Public pages inside those prefixes. */
    private const PUBLIC_PATHS = ['logistics/pending-approval'];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $request->is(...self::PUBLIC_PATHS)) {
            return $next($request);
        }

        foreach (self::AREAS as $pattern => $roles) {
            if ($request->is($pattern) && ! in_array(PortalRole::roleOf($user), $roles, true)) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'You do not have access to this area.'], 403);
                }
                abort(403, 'You do not have access to this area.');
            }
        }

        return $next($request);
    }
}
