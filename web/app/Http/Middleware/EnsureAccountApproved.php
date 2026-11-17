<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountApproved
{
    /**
     * Handle an incoming request.
     *
     * Check if the authenticated user's account is approved.
     * Only applies to sellers and logistics - buyers are auto-approved.
     * - approved: allow access
     * - pending: logout and redirect to pending page
     * - disapproved: logout and redirect to login with error
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return $next($request);
        }

        // Suspended / deactivated by the admin: end the session with the reason.
        if ($blocked = \App\Support\AccountStatus::blockReason($user)) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors(['email' => $blocked]);
        }

        // Buyers don't need approval - skip this middleware for them
        if ($user->account_type === 'buyer') {
            return $next($request);
        }

        // Check approval status for sellers and logistics
        if ($user->status === 'pending') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            \App\Http\Controllers\Auth\ApprovalStatusController::remember($request, $user);

            return redirect()->route('register.pending')
                ->with('message', 'Your account is still pending approval.');
        }

        if ($user->status === 'disapproved') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('home')
                ->with('error', 'Your account application was not approved. Please contact support for more information.');
        }

        // Status is 'approved', proceed
        return $next($request);
    }
}
