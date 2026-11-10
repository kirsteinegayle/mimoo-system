<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures the authenticated Sanctum user has role='rider'.
 * Returns 403 otherwise.
 *
 * Registered in bootstrap/app.php as alias 'rider.role'.
 */
class EnsureRiderRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $role = $user->role ?? $user->account_type;

        if ($role !== 'rider') {
            return response()->json(['message' => 'This endpoint is for rider accounts only.'], 403);
        }

        return $next($request);
    }
}
