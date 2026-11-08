<?php

namespace App\Http\Controllers\Api\Concerns;

/**
 * Adds a constructor-time middleware that returns 403 if the authenticated
 * Sanctum user does not have role='courier'.
 *
 * Usage: add  `use EnforcesCourierRole;`  inside any controller class.
 */
trait EnforcesCourierRole
{
    protected function bootEnforcesCourierRole(): void
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (! $user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            $role = $user->role ?? $user->account_type;
            if ($role !== 'courier') {
                return response()->json(['message' => 'This endpoint is for courier accounts only.'], 403);
            }
            return $next($request);
        });
    }
}
