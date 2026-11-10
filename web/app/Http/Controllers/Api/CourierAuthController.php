<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CourierAuthController extends Controller
{
    /**
     * POST /api/courier-app/login
     *
     * Authenticates a logistics user with role='courier'.
     * Generic 401 on wrong credentials — does not reveal whether an email exists.
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

        // Must be an approved logistics account with the courier role.
        // Both checks are required: account_type='logistics' AND role='courier'.
        if ($user->account_type !== 'logistics' || $user->role !== 'courier') {
            return response()->json(['message' => 'This app is for courier accounts only.'], 401);
        }

        // Must be approved and email-verified.
        if ($user->status !== 'approved') {
            return response()->json(['message' => 'Your account has not been approved yet.'], 401);
        }
        if ($user->verification_status !== 'verified') {
            return response()->json(['message' => 'Please verify your email before logging in.'], 401);
        }

        // Revoke any previous courier-app tokens to keep sessions clean.
        $user->tokens()->where('name', 'courier-app')->delete();

        $token = $user->createToken('courier-app', ['courier-app'])->plainTextToken;

        return response()->json([
            'data' => [
                'courier' => [
                    'id'                 => $user->id,
                    'email'              => $user->email,
                    'company_name'       => $user->company_name ?? $user->business_name,
                    'contact_first_name' => $user->contact_first_name ?? $user->first_name,
                    'contact_last_name'  => $user->contact_last_name  ?? $user->last_name,
                    'role'               => $user->role,
                    'account_type'       => $user->account_type,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * POST /api/courier-app/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * GET /api/courier-app/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'courier' => [
                    'id'                 => $user->id,
                    'email'              => $user->email,
                    'company_name'       => $user->company_name ?? $user->business_name,
                    'contact_first_name' => $user->contact_first_name ?? $user->first_name,
                    'contact_last_name'  => $user->contact_last_name  ?? $user->last_name,
                    'role'               => $user->role,
                    'account_type'       => $user->account_type,
                ],
            ],
        ]);
    }
}
