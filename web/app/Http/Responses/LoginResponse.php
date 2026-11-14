<?php

namespace App\Http\Responses;

use App\Support\PortalRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

/**
 * Post-login decision. The role -> home mapping lives in PortalRole::homeFor();
 * the login-page -> allowed-role gate lives in Fortify::authenticateUsing()
 * (FortifyServiceProvider), so a mismatched account never gets a session.
 */
class LoginResponse implements LoginResponseContract
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        // Email must be verified (logistics/courier accounts are exempt)
        if ($user->account_type !== 'logistics' && $user->verification_status === 'unverified') {
            auth()->logout();
            return redirect()->route('otp.show', ['email' => $user->email])
                ->withErrors(['email' => 'Please verify your email address before logging in.']);
        }

        // Sellers and logistics/courier accounts need admin/hub approval
        if (in_array($user->account_type, ['seller', 'logistics']) && $user->status === 'pending') {
            auth()->logout();
            return redirect()->route('register.pending')
                ->with('message', 'Your account is pending approval. You will receive an email once approved.');
        }

        if (in_array($user->account_type, ['seller', 'logistics']) && in_array($user->status, ['rejected', 'disapproved'], true)) {
            auth()->logout();
            return redirect()->route('login')
                ->withErrors(['email' => 'Your account application was rejected. Please contact support for more information.']);
        }

        // Riders have no web dashboard; they use the mobile app.
        if (PortalRole::roleOf($user) === 'rider') {
            auth()->logout();
            return redirect()->route('login')
                ->withErrors(['email' => PortalRole::denyReason('rider', $user)]);
        }

        $home = PortalRole::homeFor($user);

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect($home);
    }
}
