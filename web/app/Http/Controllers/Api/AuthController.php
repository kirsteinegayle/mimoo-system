<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailVerification;
use App\Models\User;
use App\Notifications\EmailVerificationNotification;
use App\Rules\PhilippineMobile;
use App\Rules\StrongPassword;
use App\Rules\ValidName;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'       => ['required', 'email'],
            'password'    => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], (string) $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($user->verification_status !== 'verified') {
            return response()->json(['message' => 'Please verify your email first.'], 403);
        }

        // Ang non-buyer ay kailangang aprubado muna ng admin.
        if ($user->account_type !== 'buyer' && $user->status !== 'approved') {
            return response()->json(['message' => 'Your account is not approved yet.'], 403);
        }

        $token = $user->createToken($data['device_name'] ?? 'mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    /** Login para sa buyer app: tugma sa inaasahang sagot ng Flutter. */
    public function buyerLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], (string) $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($user->account_type !== 'buyer') {
            return response()->json(['message' => 'This app is for buyer accounts only.'], 401);
        }

        if ($user->verification_status !== 'verified') {
            return response()->json(['message' => 'Please verify your email first.'], 403);
        }

        $token = $user->createToken('buyer-app')->plainTextToken;

        return response()->json([
            'data' => [
                'buyer' => [
                    'id'               => $user->id,
                    'first_name'       => $user->first_name,
                    'last_name'        => $user->last_name,
                    'email'            => $user->email,
                    'contact_number'   => $user->contact_number,
                    'street_address'   => $user->street_address,
                    'barangay'         => $user->barangay,
                    'municipality_city'=> $user->municipality_city,
                    'province'         => $user->province,
                    'region'           => $user->region,
                ],
                'token' => $token,
            ],
        ]);
    }

    public function buyerLogout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id'               => $user->id,
                'first_name'       => $user->first_name,
                'last_name'        => $user->last_name,
                'email'            => $user->email,
                'contact_number'   => $user->contact_number,
                'street_address'   => $user->street_address,
                'barangay'         => $user->barangay,
                'municipality_city'=> $user->municipality_city,
                'province'         => $user->province,
                'region'           => $user->region,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Buyer registration + email verification (mobile app)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Register a new buyer account from the mobile app.
     *
     * Field mapping from Flutter → DB:
     *   mobile           → contact_number  (normalized to 09XXXXXXXXX)
     *   date_of_birth    → birthday        (YYYY-MM-DD)
     *   terms_accepted   → privacy_policy_accepted
     *
     * Differences from the web CreateNewUser action:
     *   - id_document is NULLABLE here (mobile registration skips document
     *     upload; it can be completed later from the profile screen).
     *     The web form still requires id_document — do NOT change that rule.
     *   - No file uploads (mobile sends JSON only).
     *   - account_type is always 'buyer'; address fields are plain strings.
     */
    public function buyerRegister(Request $request): JsonResponse
    {
        // Normalize before validation (same as CreateNewUser)
        $input = $request->all();
        $input['email']          = trim($input['email'] ?? '');
        $input['contact_number'] = PhilippineMobile::normalize($input['mobile'] ?? '');
        $input['first_name']     = trim($input['first_name'] ?? '');
        $input['last_name']      = trim($input['last_name'] ?? '');

        $request->merge($input);

        $validated = $request->validate([
            // ── Personal details ──────────────────────────────────────────
            'first_name'     => ['required', 'string', new ValidName()],
            'last_name'      => ['required', 'string', new ValidName()],
            'middle_initial' => ['nullable', 'string', 'max:1'],
            'sex'            => ['required', 'in:male,female'],
            'email'          => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'contact_number' => ['required', 'string', new PhilippineMobile(), 'unique:users,contact_number'],
            'date_of_birth'  => ['required', 'date', 'before:-18 years'],
            'terms_accepted' => ['required', 'accepted'],

            // ── Address (same as web; stored as plain strings) ────────────
            // province is nullable for NCR (web stores 'N/A' or empty string for NCR buyers)
            // district is nullable for non-NCR buyers
            'region'           => ['required', 'string', 'max:100'],
            'province'         => ['nullable', 'string', 'max:100'],
            'district'         => ['nullable', 'string', 'max:255'],
            'municipality_city'=> ['required', 'string', 'max:100'],
            'barangay'         => ['required', 'string', 'max:100'],
            'street_address'   => ['required', 'string', 'max:255'],

            // ── Security ──────────────────────────────────────────────────
            'password'       => ['required', 'string', new StrongPassword(), 'confirmed'],
        ], [
            'date_of_birth.before'     => 'You must be at least 18 years old.',
            'contact_number.unique'    => 'Mobile number is already in use.',
            'email.unique'             => 'This email is already registered.',
            'terms_accepted.required'  => 'You must accept the Terms and Privacy Policy.',
            'terms_accepted.accepted'  => 'You must accept the Terms and Privacy Policy.',
        ]);

        // Wrap user creation + OTP in a transaction for atomicity
        [$user, $otpCode] = DB::transaction(function () use ($validated, $input) {
            $user = User::create([
                'name'               => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'first_name'         => $validated['first_name'],
                'last_name'          => $validated['last_name'],
                'middle_initial'     => $validated['middle_initial'] ?? null,
                'sex'                => $validated['sex'],
                'email'              => $validated['email'],
                'contact_number'     => $input['contact_number'], // already normalized
                'birthday'           => $validated['date_of_birth'],
                'account_type'       => 'buyer',
                'region'             => $validated['region'],
                'province'           => $validated['province'] ?? null,
                'district'           => $validated['district'] ?? null,
                'municipality_city'  => $validated['municipality_city'],
                'barangay'           => $validated['barangay'],
                'street_address'     => $validated['street_address'],
                'privacy_policy_accepted' => true,
                'password'           => $validated['password'], // model casts to hashed
                'status'             => 'pending',
                'verification_status'=> 'unverified',
            ]);

            $verification = EmailVerification::createForEmail($user->email);

            return [$user, $verification->code];
        });

        // Log OTP in local environment only (never log codes in staging/production)
        if (app()->environment('local')) {
            \Log::info('Mobile registration OTP created', ['email' => $user->email, 'code' => $otpCode]);
        }

        try {
            Notification::route('mail', $user->email)
                ->notifyNow(new EmailVerificationNotification($otpCode));
        } catch (\Throwable $e) {
            \Log::warning('Mobile registration OTP email failed (buyer can resend)', [
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Registration successful. Check your email for the 6-digit verification code.',
            'data'    => ['email' => $user->email],
        ], 201);
    }

    /**
     * Verify a buyer's email using the 6-digit OTP code.
     * Reuses EmailVerification::findValid() — same logic as the web controller.
     */
    public function buyerVerifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code'  => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ], [
            'code.size'  => 'Verification code must be exactly 6 digits.',
            'code.regex' => 'Verification code must be exactly 6 digits.',
        ]);

        $verification = EmailVerification::findValid($request->email, $request->code);

        if (! $verification) {
            // Distinguish expired vs. just-wrong for a better UX message
            $expired = EmailVerification::where('email', $request->email)
                ->where('code', $request->code)
                ->where('verified', false)
                ->first();

            $msg = ($expired && $expired->isExpired())
                ? 'Code expired. Please request a new code.'
                : 'Invalid verification code.';

            return response()->json([
                'message' => $msg,
                'errors'  => ['code' => [$msg]],
            ], 422);
        }

        // Mark OTP as used and update the user — same fields as the web controller
        $verification->update(['verified' => true]);

        User::where('email', $request->email)->update([
            'verification_status' => 'verified',
            'email_verified_at'   => now(),
        ]);

        return response()->json(['message' => 'Email verified.']);
    }

    /**
     * Re-send the 6-digit OTP to a buyer who has not yet verified their email.
     * Same logic as EmailVerificationController::resendOtp().
     */
    public function buyerResendCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->verification_status === 'verified') {
            return response()->json([
                'message' => 'This email is already verified.',
                'errors'  => ['email' => ['This email is already verified.']],
            ], 422);
        }

        $verification = EmailVerification::createForEmail($request->email);

        try {
            Notification::route('mail', $request->email)
                ->notifyNow(new EmailVerificationNotification($verification->code));
        } catch (\Throwable $e) {
            \Log::error('Mobile resend OTP failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not send the verification email. Please try again.',
            ], 500);
        }

        return response()->json(['message' => 'A new verification code has been sent to your email.']);
    }
}
