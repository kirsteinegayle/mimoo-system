<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Rules\ValidName;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Buyer profile read/update — Sanctum Bearer auth.
 *
 * Protected fields that are NEVER updated here:
 *   email, password, account_type, status, verification_status,
 *   id_document, business_*, dti_*, bir_*, sec_*, privacy_policy_accepted,
 *   approved_at, google_id, profile_photo, cover_photo
 *
 * Validation rules mirror the web registration (CreateNewUser / buyerRegister):
 *   - ValidName for first_name / last_name
 *   - PhilippineMobile for contact_number (normalised before validation)
 *   - contact_number unique ignoring own id
 *   - birthday before:-18 years (present in web registration — included here)
 */
class BuyerProfileController extends Controller
{
    // ── Safe fields that may be updated ──────────────────────────────────────
    private const UPDATABLE = [
        'first_name',
        'last_name',
        'middle_initial',
        'sex',
        // contact_number removed — use POST /api/buyer/change-phone/request instead
        'birthday',
        'region',
        'province',
        'district',
        'municipality_city',
        'barangay',
        'street_address',
    ];

    // ── Shared profile shape ──────────────────────────────────────────────────
    private function profileData($user): array
    {
        $photoUrl = null;
        if (! empty($user->profile_photo)) {
            $photoUrl = url(Storage::url($user->profile_photo));
        }

        return [
            'id'                => $user->id,
            'first_name'        => $user->first_name,
            'last_name'         => $user->last_name,
            // Display name — the website profile edits `name` only, so the app
            // shows this to reflect web changes (additive field).
            'name'              => $user->name,
            'middle_initial'    => $user->middle_initial,
            'email'             => $user->email,
            'contact_number'    => $user->contact_number,
            'birthday'          => $user->birthday?->format('Y-m-d'),
            'sex'               => $user->sex,
            'region'            => $user->region,
            'province'          => $user->province,
            'district'          => $user->district,
            'municipality_city' => $user->municipality_city,
            'barangay'          => $user->barangay,
            'street_address'    => $user->street_address,
            'profile_photo_url' => $photoUrl,
        ];
    }

    // ── Buyer guard ───────────────────────────────────────────────────────────
    private function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can access this endpoint.'], 403);
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/profile
    // ─────────────────────────────────────────────────────────────────────────
    public function show(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        return response()->json(['data' => $this->profileData($request->user())]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/buyer/profile
    //
    // Validation rules mirror web registration (CreateNewUser + buyerRegister):
    //   ValidName, PhilippineMobile, contact_number unique ignoring own id,
    //   birthday before:-18 years (present in web registration).
    //
    // All fields are optional (nullable) — partial updates are allowed.
    // Only UPDATABLE fields are written; all others are ignored even if sent.
    // ─────────────────────────────────────────────────────────────────────────
    public function update(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        // Normalize contact_number before validation (same as web registration)
        // Normalize name fields before validation
        $input = $request->only(self::UPDATABLE);
        if (isset($input['first_name'])) {
            $input['first_name'] = trim($input['first_name']);
        }
        if (isset($input['last_name'])) {
            $input['last_name'] = trim($input['last_name']);
        }

        $validated = validator($input, [
            'first_name'      => ['nullable', 'string', new ValidName()],
            'last_name'       => ['nullable', 'string', new ValidName()],
            'middle_initial'  => ['nullable', 'string', 'max:1'],
            'sex'             => ['nullable', 'in:male,female'],
            // contact_number no longer updatable via PUT /profile — use change-phone flow
            // birthday: before:-18 years, consistent with web registration
            'birthday'        => ['nullable', 'date', 'before:-18 years'],
            'region'          => ['nullable', 'string', 'max:100'],
            'province'        => ['nullable', 'string', 'max:100'],
            'district'        => ['nullable', 'string', 'max:255'],
            'municipality_city' => ['nullable', 'string', 'max:100'],
            'barangay'        => ['nullable', 'string', 'max:100'],
            'street_address'  => ['nullable', 'string', 'max:255'],
        ], [
            'birthday.before' => 'You must be at least 18 years old.',
        ])->validate();

        // Also update the computed `name` field for backward compat
        $firstName = $validated['first_name'] ?? $user->first_name;
        $lastName  = $validated['last_name']  ?? $user->last_name;
        $validated['name'] = trim($firstName . ' ' . $lastName);

        $user->fill($validated)->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data'    => $this->profileData($user->fresh()),
        ]);
    }
}
