<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        
        // Check if email is verified (skip for logistics/courier accounts)
        if ($user->account_type !== 'logistics' && $user->verification_status === 'unverified') {
            auth()->logout();
            return redirect()->route('otp.show', ['email' => $user->email])
                ->withErrors(['email' => 'Please verify your email address before logging in.']);
        }

        // Check if account is approved (for sellers and logistics)
        if (in_array($user->account_type, ['seller', 'logistics']) && $user->status === 'pending') {
            auth()->logout();
            return redirect()->route('register.pending')
                ->with('message', 'Your account is pending approval. You will receive an email once approved.');
        }

        // Check if account was rejected
        if (in_array($user->account_type, ['seller', 'logistics']) && $user->status === 'rejected') {
            auth()->logout();
            return redirect()->route('login')
                ->withErrors(['email' => 'Your account application was rejected. Please contact support for more information.']);
        }

        // DEBUG: Show me exactly what's happening
        \Log::info('LOGIN REDIRECT DEBUG', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'account_type' => $user->account_type,
            'role' => $user->role,
            'status' => $user->status,
            'company_name' => $user->company_name ?? null,
        ]);

        // Redirect based on role and status
        // IMPORTANT: Check account_type FIRST before role for logistics companies
        $home = match (true) {
            // Logistics companies (registered via logistics registration form)
            $user->account_type === 'logistics' => match ($user->status) {
                'approved' => '/logistics',
                'pending' => redirect()->route('register.pending'),
                'rejected' => redirect()->route('login')->withErrors(['email' => 'Your logistics application was rejected.']),
                default => '/login',
            },
            // Courier branch staff (actual courier personnel)
            $user->role === 'courier' => match ($user->status) {
                'approved' => '/courier/dashboard',
                'pending' => redirect()->route('register.pending'),
                'rejected' => redirect()->route('login')->withErrors(['email' => 'Your courier application was rejected.']),
                default => '/login',
            },
            // Other roles
            $user->role === 'seller' || $user->account_type === 'seller' => '/seller/dashboard',
            $user->role === 'logistics_staff' => '/logistics/dashboard',
            $user->role === 'admin' => '/admin/dashboard',
            $user->role === 'buyer' || $user->account_type === 'buyer' => '/homepage',
            default => '/homepage',
        };

        // If courier status returned a redirect, return it directly
        if ($home instanceof \Illuminate\Http\RedirectResponse) {
            return $home;
        }

        \Log::info('REDIRECTING TO: ' . $home);

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect($home);
    }
}
