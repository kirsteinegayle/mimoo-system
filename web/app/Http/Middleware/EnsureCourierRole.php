<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures the authenticated Sanctum user has role='courier'.
 * Returns 403 otherwise.
 *
 * Register in bootstrap/app.php as alias 'courier' or apply via ->middleware().
 */
class EnsureCourierRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $role = $user->role ?? $user->account_type;

        if ($role !== 'courier') {
            return response()->json(['message' => 'This endpoint is for courier accounts only.'], 403);
        }

        return $next($request);
    }
}
