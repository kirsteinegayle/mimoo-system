<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * For logistics/courier registrations: redirect directly to pending approval page.
     * Email verification can happen later when they try to login.
     */
    public function toResponse($request)
    {
        $user = Auth::user();

        // Immediately logout the newly registered user
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect directly to pending approval page for sellers/logistics
        // They don't need email verification before approval
        return redirect()->route('register.pending')
            ->with('message', 'Registration submitted! Please wait for admin approval. You will receive an email notification once your account is approved.');
    }
}
