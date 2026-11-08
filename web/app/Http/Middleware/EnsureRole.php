<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Allowed roles for this route
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        $userRole = $user->role ?? $user->account_type;

        if (!in_array($userRole, $roles)) {
            // Redirect to their correct dashboard
            $home = match ($userRole) {
                'seller' => '/seller/dashboard',
                'logistics_staff' => '/logistics/dashboard',
                'courier' => '/courier/dashboard',
                'admin' => '/admin/dashboard',
                'buyer' => '/homepage',
                default => '/homepage',
            };

            return redirect($home)->with('error', 'You do not have permission to access that page.');
        }

        return $next($request);
    }
}
