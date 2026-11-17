<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AccountStatus;
use App\Support\PortalRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Polled by the "pending approval" pages (sellers and logistics only; buyers need no approval).
 *
 * The browser is only trusted if THIS session proved ownership of the account earlier
 * (completed the email OTP, or signed in with the password and was turned away as pending).
 * That session key is what lets us log the user in the moment the admin approves them;
 * nobody can use this endpoint to sign in as an arbitrary account.
 */
class ApprovalStatusController extends Controller
{
    public const SESSION_KEY = 'pending_approval_user_id';

    /** Remember (in this browser session) which pending account may be auto-logged-in on approval. */
    public static function remember(Request $request, User $user): void
    {
        if (in_array($user->account_type, ['seller', 'logistics'], true)) {
            $request->session()->put(self::SESSION_KEY, $user->id);
        }
    }

    public function show(Request $request): JsonResponse
    {
        $user = Auth::user(); // already signed in (e.g. second tab): nothing to do but go home
        if ($user) {
            return response()->json(['state' => 'approved', 'redirect' => PortalRole::homeFor($user), 'message' => 'Your account is approved.']);
        }

        $id = $request->session()->get(self::SESSION_KEY);
        $pending = $id ? User::find($id) : null;
        if (! $pending || ! in_array($pending->account_type, ['seller', 'logistics'], true)) {
            return response()->json(['state' => 'unknown']);
        }

        if (AccountStatus::blockReason($pending)) {
            $request->session()->forget(self::SESSION_KEY);

            return response()->json(['state' => 'blocked']);
        }

        if (in_array($pending->status, ['rejected', 'disapproved'], true)) {
            $request->session()->forget(self::SESSION_KEY);

            return response()->json(['state' => 'rejected', 'message' => 'Your account application was not approved. Please contact support for more information.']);
        }

        if ($pending->status !== 'approved' || $pending->verification_status === 'unverified') {
            return response()->json(['state' => 'pending']);
        }

        // Approved by the admin: sign them in and send them to their dashboard.
        Auth::login($pending);
        $request->session()->regenerate();
        $request->session()->forget(self::SESSION_KEY);

        return response()->json([
            'state' => 'approved',
            'redirect' => PortalRole::homeFor($pending),
            'message' => 'Good news! Your account was approved. Signing you in…',
        ]);
    }
}
