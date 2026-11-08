<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\EmailVerificationNotification;
use App\Notifications\PasswordResetNotification;
use App\Rules\PhilippineMobile;
use App\Rules\StrongPassword;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Buyer account security endpoints (auth:sanctum, buyer only).
 *
 * POST /api/buyer/change-password
 * POST /api/buyer/change-email/request
 * POST /api/buyer/change-email/verify
 * POST /api/buyer/change-phone/request
 * POST /api/buyer/change-phone/verify
 * POST /api/buyer/profile/photo
 * GET  /api/buyer/profile-photo/{filename}
 */
class BuyerAccountController extends Controller
{
    private const OTP_TTL        = 5;    // minutes
    private const OTP_MAX_WRONG  = 5;
    private const OTP_MAX_SENDS  = 3;    // per hour per user
    private const OTP_SEND_TTL   = 60;   // minutes for send-limit window

    // ── Shared helpers ────────────────────────────────────────────────────────

    private function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can access this endpoint.'], 403);
        }
        return null;
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /** Revoke all tokens EXCEPT the current one (keep current device logged in). */
    private function revokeOtherTokens(Request $request): void
    {
        $request->user()->tokens()
            ->where('id', '!=', $request->user()->currentAccessToken()->id)
            ->delete();
    }

    /** Invalidate web (database) sessions for this user. */
    private function invalidateWebSessions(User $user): void
    {
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/change-password
    // ─────────────────────────────────────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        // Per-user rate limit: 5 attempts per minute
        $limiterKey = 'change-password:' . $user->id;
        if (RateLimiter::tooManyAttempts($limiterKey, 5)) {
            return response()->json(['message' => 'Too many attempts. Please wait a moment.'], 429);
        }
        RateLimiter::hit($limiterKey, 60);

        $request->validate([
            'current_password'      => ['required', 'string'],
            'new_password'          => ['required', 'string', new StrongPassword(), 'confirmed'],
            'new_password_confirmation' => ['required', 'string'],
        ]);

        // Check current password (generic message — no user existence hint)
        if (! Hash::check($request->input('current_password'), (string) $user->password)) {
            return response()->json([
                'message' => 'The provided password is incorrect.',
                'errors'  => ['current_password' => ['The provided password is incorrect.']],
            ], 422);
        }

        // New password must differ from current
        if (Hash::check($request->input('new_password'), (string) $user->password)) {
            return response()->json([
                'message' => 'New password must be different from your current password.',
                'errors'  => ['new_password' => ['New password must be different from your current password.']],
            ], 422);
        }

        $user->update(['password' => $request->input('new_password')]);

        // Revoke all other Sanctum tokens (keep current device logged in)
        $this->revokeOtherTokens($request);

        // Invalidate web sessions
        $this->invalidateWebSessions($user);

        RateLimiter::clear($limiterKey);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/change-email/request
    // ─────────────────────────────────────────────────────────────────────────
    public function changeEmailRequest(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        $request->validate([
            'new_email' => ['required', 'email', 'max:255'],
            'password'  => ['required', 'string'],
        ]);

        if (! Hash::check($request->input('password'), (string) $user->password)) {
            return response()->json([
                'message' => 'The provided password is incorrect.',
                'errors'  => ['password' => ['The provided password is incorrect.']],
            ], 422);
        }

        $newEmail = strtolower(trim($request->input('new_email')));

        // Must differ from current
        if ($newEmail === strtolower(trim($user->email))) {
            return response()->json([
                'message' => 'New email must be different from your current email.',
                'errors'  => ['new_email' => ['New email must be different from your current email.']],
            ], 422);
        }

        // Case-insensitive uniqueness across ALL users (any account_type)
        $taken = User::whereRaw('LOWER(email) = ?', [$newEmail])
            ->where('id', '!=', $user->id)
            ->exists();

        if ($taken) {
            // Same message as registration — no OTP sent, but no timing difference either
            return response()->json([
                'message' => 'The new email has already been taken.',
                'errors'  => ['new_email' => ['This email is already registered.']],
            ], 422);
        }

        // Rate-limit sends: max 3 per hour per user
        $sendKey = 'email-change-sends:' . $user->id;
        $sends   = (int) Cache::get($sendKey, 0);
        if ($sends >= self::OTP_MAX_SENDS) {
            return response()->json([
                'message' => 'Too many verification emails sent. Please wait before requesting again.',
            ], 429);
        }

        $code = $this->generateCode();

        // Store hashed OTP — keyed by user ID (not email) so the user can't
        // scan for valid emails by trying different new_email values.
        Cache::put(
            'buyer_email_change:' . $user->id,
            ['hash' => Hash::make($code), 'new_email' => $newEmail, 'attempts' => 0],
            now()->addMinutes(self::OTP_TTL)
        );

        Cache::put($sendKey, $sends + 1, now()->addMinutes(self::OTP_SEND_TTL));

        // Send OTP to the NEW email (verifies ownership)
        if (app()->environment('local')) {
            \Log::info('[BuyerAccountController] change-email OTP issued', ['user_id' => $user->id, 'new_email' => $newEmail]);
        }
        try {
            Notification::route('mail', $newEmail)
                ->notifyNow(new EmailVerificationNotification($code));
        } catch (\Throwable $e) {
            \Log::warning('change-email OTP mail failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'A verification code has been sent to your new email address.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/change-email/verify
    // ─────────────────────────────────────────────────────────────────────────
    public function changeEmailVerify(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ], [
            'code.size'  => 'Verification code must be exactly 6 digits.',
            'code.regex' => 'Verification code must be exactly 6 digits.',
        ]);

        $cacheKey = 'buyer_email_change:' . $user->id;
        $entry    = Cache::get($cacheKey);

        if (! $entry) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['code' => ['Invalid or expired verification code.']],
            ], 422);
        }

        $attempts = (int) ($entry['attempts'] ?? 0);

        if ($attempts >= self::OTP_MAX_WRONG) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['code' => ['Invalid or expired verification code.']],
            ], 422);
        }

        if (! Hash::check($request->input('code'), $entry['hash'])) {
            $attempts++;
            if ($attempts >= self::OTP_MAX_WRONG) {
                Cache::forget($cacheKey);
            } else {
                Cache::put($cacheKey,
                    ['hash' => $entry['hash'], 'new_email' => $entry['new_email'], 'attempts' => $attempts],
                    now()->addMinutes(self::OTP_TTL));
            }
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['code' => ['Invalid or expired verification code.']],
            ], 422);
        }

        // ── Code correct — update email ────────────────────────────────────
        $newEmail = $entry['new_email'];

        // Double-check uniqueness at verify time (someone else may have taken it)
        $taken = User::whereRaw('LOWER(email) = ?', [$newEmail])
            ->where('id', '!=', $user->id)
            ->exists();
        if ($taken) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'This email address is no longer available. Please request a new code with a different email.',
            ], 422);
        }

        $user->update(['email' => $newEmail]);

        Cache::forget($cacheKey);
        Cache::forget('email-change-sends:' . $user->id);

        // Revoke other tokens (email changed — new logins with new email)
        $this->revokeOtherTokens($request);
        $this->invalidateWebSessions($user);

        return response()->json([
            'message' => 'Email address updated successfully.',
            'data'    => ['email' => $newEmail],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/change-phone/request
    // ─────────────────────────────────────────────────────────────────────────
    public function changePhoneRequest(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        // Normalize before validation
        $input = $request->all();
        if (isset($input['new_phone'])) {
            $input['new_phone'] = PhilippineMobile::normalize($input['new_phone']);
        }
        $request->merge($input);

        $request->validate([
            'new_phone' => ['required', 'string', new PhilippineMobile()],
            'password'  => ['required', 'string'],
        ]);

        if (! Hash::check($request->input('password'), (string) $user->password)) {
            return response()->json([
                'message' => 'The provided password is incorrect.',
                'errors'  => ['password' => ['The provided password is incorrect.']],
            ], 422);
        }

        $newPhone = PhilippineMobile::normalize($request->input('new_phone'));

        if ($newPhone === $user->contact_number) {
            return response()->json([
                'message' => 'New phone number must be different from your current number.',
                'errors'  => ['new_phone' => ['New phone number must be different from your current number.']],
            ], 422);
        }

        // Uniqueness across all users
        $taken = User::where('contact_number', $newPhone)
            ->where('id', '!=', $user->id)
            ->exists();
        if ($taken) {
            return response()->json([
                'message' => 'The new phone number has already been taken.',
                'errors'  => ['new_phone' => ['Mobile number is already in use.']],
            ], 422);
        }

        // Rate-limit sends: max 3 per hour per user
        $sendKey = 'phone-change-sends:' . $user->id;
        $sends   = (int) Cache::get($sendKey, 0);
        if ($sends >= self::OTP_MAX_SENDS) {
            return response()->json([
                'message' => 'Too many verification requests sent. Please wait before requesting again.',
            ], 429);
        }

        $code = $this->generateCode();

        Cache::put(
            'buyer_phone_change:' . $user->id,
            ['hash' => Hash::make($code), 'new_phone' => $newPhone, 'attempts' => 0],
            now()->addMinutes(self::OTP_TTL)
        );

        Cache::put($sendKey, $sends + 1, now()->addMinutes(self::OTP_SEND_TTL));

        // Send OTP to CURRENT email (no SMS gateway available)
        if (app()->environment('local')) {
            \Log::info('[BuyerAccountController] change-phone OTP issued', ['user_id' => $user->id]);
        }
        try {
            Notification::route('mail', $user->email)
                ->notifyNow(new PasswordResetNotification($code));
        } catch (\Throwable $e) {
            \Log::warning('change-phone OTP mail failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'A verification code has been sent to your email address.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/change-phone/verify
    // ─────────────────────────────────────────────────────────────────────────
    public function changePhoneVerify(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ], [
            'code.size'  => 'Verification code must be exactly 6 digits.',
            'code.regex' => 'Verification code must be exactly 6 digits.',
        ]);

        $cacheKey = 'buyer_phone_change:' . $user->id;
        $entry    = Cache::get($cacheKey);

        if (! $entry) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['code' => ['Invalid or expired verification code.']],
            ], 422);
        }

        $attempts = (int) ($entry['attempts'] ?? 0);

        if ($attempts >= self::OTP_MAX_WRONG) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['code' => ['Invalid or expired verification code.']],
            ], 422);
        }

        if (! Hash::check($request->input('code'), $entry['hash'])) {
            $attempts++;
            if ($attempts >= self::OTP_MAX_WRONG) {
                Cache::forget($cacheKey);
            } else {
                Cache::put($cacheKey,
                    ['hash' => $entry['hash'], 'new_phone' => $entry['new_phone'], 'attempts' => $attempts],
                    now()->addMinutes(self::OTP_TTL));
            }
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['code' => ['Invalid or expired verification code.']],
            ], 422);
        }

        // ── Code correct — update phone ────────────────────────────────────
        $newPhone = $entry['new_phone'];

        // Double-check uniqueness
        if (User::where('contact_number', $newPhone)->where('id', '!=', $user->id)->exists()) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'This phone number is no longer available.',
            ], 422);
        }

        $user->update(['contact_number' => $newPhone]);

        Cache::forget($cacheKey);
        Cache::forget('phone-change-sends:' . $user->id);

        return response()->json([
            'message' => 'Phone number updated successfully.',
            'data'    => ['contact_number' => $newPhone],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/profile/photo
    // ─────────────────────────────────────────────────────────────────────────
    public function uploadPhoto(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        if (! $request->hasFile('photo')) {
            return response()->json([
                'message' => 'No photo provided.',
                'errors'  => ['photo' => ['No photo provided.']],
            ], 422);
        }

        $file = $request->file('photo');

        // Validate size (max 5 MB) before reading content
        if ($file->getSize() > 5 * 1024 * 1024) {
            return response()->json([
                'message' => 'Photo must not be larger than 5 MB.',
                'errors'  => ['photo' => ['Photo must not be larger than 5 MB.']],
            ], 422);
        }

        // Validate MIME type from file content, not extension
        $mime = $file->getMimeType();
        if (! in_array($mime, ['image/jpeg', 'image/png'], true)) {
            return response()->json([
                'message' => 'Only JPG and PNG images are accepted.',
                'errors'  => ['photo' => ['Only JPG and PNG images are accepted.']],
            ], 422);
        }

        // Confirm it's a real image using getimagesize on the temp path
        $tmpPath = $file->getRealPath();
        if ($tmpPath && @getimagesize($tmpPath) === false) {
            return response()->json([
                'message' => 'Only JPG and PNG images are accepted.',
                'errors'  => ['photo' => ['Only JPG and PNG images are accepted.']],
            ], 422);
        }

        // Random filename (no user-supplied names) — prevent enumeration
        $ext      = $mime === 'image/png' ? 'png' : 'jpg';
        $filename = 'buyer_photo_' . $user->id . '_' . Str::random(16) . '.' . $ext;

        // Delete old photo
        if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        // Store new photo in buyer_photos/ directory
        Storage::disk('public')->putFileAs('buyer_photos', $file, $filename);

        $user->profile_photo = 'buyer_photos/' . $filename;
        $user->save();

        $photoUrl = url(Storage::url('buyer_photos/' . $filename));

        return response()->json([
            'message' => 'Profile photo updated.',
            'data'    => ['profile_photo_url' => $photoUrl],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/profile-photo/{filename}
    // Serves ONLY files from buyer_photos/ — no path traversal.
    // ─────────────────────────────────────────────────────────────────────────
    public function servePhoto(string $filename): Response
    {
        // Reject any path components (no /, \, .., or encoded variants)
        if (preg_match('/[\/\\\\]|\.\./', $filename) || $filename !== basename($filename)) {
            abort(404);
        }

        // Only allow the exact filename pattern we generate
        if (! preg_match('/^buyer_photo_\d+_[A-Za-z0-9]{16}\.(jpg|png)$/', $filename)) {
            abort(404);
        }

        $path = 'buyer_photos/' . $filename;

        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $contents = Storage::disk('public')->get($path);
        $mime     = str_ends_with($filename, '.png') ? 'image/png' : 'image/jpeg';
        $etag     = '"' . md5($contents) . '"';

        if (request()->header('If-None-Match') === $etag) {
            return response('', 304);
        }

        return response($contents, 200, [
            'Content-Type'                => $mime,
            'Cache-Control'               => 'public, max-age=86400',
            'ETag'                        => $etag,
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
