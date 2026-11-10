<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Authentication for the Mimoo Rider mobile app.
 *
 * A rider is a users row with:
 *   account_type = 'logistics'
 *   role         = 'rider'
 *   status       = 'approved'
 *   verification_status = 'verified'
 *
 * AND must have an active courier_personnel row linked via
 * courier_personnel.user_id = users.id  (role IN ('rider','driver')).
 *
 * Generic 401 on bad credentials — no email-existence leakage.
 */
class RiderAuthController extends Controller
{
    /**
     * POST /api/rider-app/login
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($data['email']));
        $user  = User::where('email', $email)->first();

        // Generic credential check — no user-existence leakage.
        if (! $user || ! Hash::check($data['password'], (string) $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        // Must be a rider account.
        $role = $user->role ?? $user->account_type;
        if ($role !== 'rider') {
            return response()->json(['message' => 'This app is for rider accounts only.'], 401);
        }

        // Must be approved and email-verified.
        if ($user->status !== 'approved') {
            return response()->json(['message' => 'Your account has not been approved yet.'], 401);
        }
        if ($user->verification_status !== 'verified') {
            return response()->json(['message' => 'Please verify your email before logging in.'], 401);
        }

        // Must have an active linked personnel record.
        $personnel = CourierPersonnel::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $personnel) {
            return response()->json([
                'message' => 'No active rider profile is linked to this account. Contact your logistics company.',
            ], 403);
        }

        // Revoke any previous rider-app tokens (one active session at a time).
        $user->tokens()->where('name', 'rider-app')->delete();

        $token = $user->createToken('rider-app', ['rider-app'])->plainTextToken;

        return response()->json([
            'data' => [
                'rider' => $this->riderPayload($user, $personnel),
                'token' => $token,
            ],
        ]);
    }

    /**
     * POST /api/rider-app/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * GET /api/rider-app/me
     */
    public function me(Request $request): JsonResponse
    {
        $user      = $request->user();
        $personnel = CourierPersonnel::where('user_id', $user->id)->first();

        if (! $personnel) {
            return response()->json(['message' => 'Rider profile not found.'], 404);
        }

        return response()->json([
            'data' => [
                'rider' => $this->riderPayload($user, $personnel),
            ],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function riderPayload(User $user, CourierPersonnel $personnel): array
    {
        return [
            'user_id'        => $user->id,
            'personnel_id'   => $personnel->id,
            'email'          => $user->email,
            'name'           => $personnel->name,
            'contact_number' => $personnel->contact_number,
            'role'           => $user->role,
            'courier_id'     => $personnel->courier_id,
            'status'         => $personnel->status,
        ];
    }
}
