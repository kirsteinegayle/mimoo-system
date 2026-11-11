<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RiderManagementController extends Controller
{
    /**
     * Display the rider management page
     */
    public function index()
    {
        $courier = auth()->user();

        // Get ALL pending applications (not filtered by courier - they can see all)
        $pendingApplications = Rider::where('verification_status', 'pending')
            ->with('assignedBranch')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rider) {
                return [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'full_name' => $rider->full_name,
                    'email' => $rider->email,
                    'contact_number' => $rider->contact_number,
                    'assigned_branch' => $rider->assigned_branch_id ? [
                        'id' => $rider->assigned_branch_id,
                        'name' => $rider->assignedBranch->facility_name ?? 'N/A',
                        'code' => $rider->assignedBranch->facility_code ?? 'N/A',
                    ] : null,
                    'vehicle_type' => $rider->vehicle_type,
                    'plate_number' => $rider->plate_number,
                    'employment_status' => $rider->employment_status,
                    'verification_status' => $rider->verification_status,
                    'is_available_for_delivery' => $rider->is_available_for_delivery,
                    'service_areas' => $rider->service_areas,
                    // Address information
                    'region' => $rider->region,
                    'province' => $rider->province,
                    'municipality_city' => $rider->city_municipality,
                    'barangay' => $rider->barangay,
                    'street_address' => $rider->street_address,
                    'postal_code' => null, // riders table has no postal_code column
                    'created_at' => $rider->created_at->toISOString(),
                ];
            });

        // Get riders already approved by this courier company
        $allRiders = Rider::where('courier_company_id', $courier->id)
            ->whereIn('verification_status', ['approved', 'rejected'])
            ->with('assignedBranch')
            ->orderBy('verification_status', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rider) {
                return [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'full_name' => $rider->full_name,
                    'email' => $rider->email,
                    'contact_number' => $rider->contact_number,
                    'assigned_branch' => [
                        'id' => $rider->assigned_branch_id,
                        'name' => $rider->assignedBranch->facility_name ?? 'N/A',
                        'code' => $rider->assignedBranch->facility_code ?? 'N/A',
                    ],
                    'vehicle_type' => $rider->vehicle_type,
                    'plate_number' => $rider->plate_number,
                    'employment_status' => $rider->employment_status,
                    'verification_status' => $rider->verification_status,
                    'is_available_for_delivery' => $rider->is_available_for_delivery,
                    'service_areas' => $rider->service_areas,
                    // Address information
                    'region' => $rider->region,
                    'province' => $rider->province,
                    'municipality_city' => $rider->city_municipality,
                    'barangay' => $rider->barangay,
                    'street_address' => $rider->street_address,
                    'postal_code' => null, // riders table has no postal_code column
                    'created_at' => $rider->created_at->toISOString(),
                ];
            });

        // Get courier's branches for assignment
        $branches = \App\Models\CourierFacility::where('courier_id', $courier->id)
            ->where('status', 'Active')
            ->orderBy('facility_type', 'asc')
            ->orderBy('facility_name', 'asc')
            ->get()
            ->map(function ($facility) {
                return [
                    'id' => $facility->id,
                    'name' => $facility->facility_name,
                    'code' => $facility->facility_code,
                    'type' => $facility->facility_type,
                    'city' => $facility->municipality_city,
                ];
            });

        return Inertia::render('courier/RiderManagement', [
            'auth' => [
                'user' => [
                    'id' => $courier->id,
                    'name' => $courier->name,
                    'email' => $courier->email,
                    'account_type' => $courier->account_type,
                ],
            ],
            'company' => [
                'name' => $courier->company_name ?? $courier->business_name ?? 'Courier Company',
                'contact_person' => trim(($courier->contact_first_name ?? '') . ' ' . ($courier->contact_last_name ?? '')),
            ],
            'pendingApplications' => $pendingApplications,
            'allRiders' => $allRiders,
            'branches' => $branches,
        ]);
    }

    /**
     * Approve a rider application
     */
    public function approve(Request $request, $id)
    {
        $courier = auth()->user();

        $response = DB::transaction(function () use ($request, $id, $courier) {
            // Lock the application row so two concurrent approvals cannot both pass.
            // (Not restricted to courier_company_id since branch is not assigned yet.)
            $rider = Rider::whereKey($id)->lockForUpdate()->firstOrFail();

            // Repeat approval by the same courier: only (re)ensure the login account. No duplicates.
            if ($rider->verification_status === 'approved' && (int) $rider->courier_company_id === (int) $courier->id) {
                $result = $this->ensureRiderAccount($rider, $courier);
                if ($result['error']) {
                    return response()->json(['error' => $result['error']], 409);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'This rider was already approved. Their rider app account is active.',
                    'user_id' => $result['user']->id,
                    'personnel_id' => $result['personnel']->id,
                    'linked_existing_user' => $result['linked_existing_user'],
                ]);
            }

            if ($rider->verification_status !== 'pending') {
                return response()->json([
                    'error' => 'This application has already been processed.',
                ], 400);
            }

            // Validate branch assignment
            $request->validate([
                'assigned_branch_id' => 'required|exists:courier_facilities,id',
            ]);

            // Verify branch belongs to this courier
            $branch = \App\Models\CourierFacility::findOrFail($request->assigned_branch_id);
            if ($branch->courier_id !== $courier->id) {
                return response()->json([
                    'error' => 'Selected branch does not belong to your company.',
                ], 403);
            }

            // Create / link the rider-app login first; on conflict nothing has been written yet.
            $result = $this->ensureRiderAccount($rider, $courier);
            if ($result['error']) {
                return response()->json(['error' => $result['error']], 409);
            }

            $rider->update([
                'verification_status' => 'approved',
                'verified_at' => now(),
                'verified_by' => $courier->id,
                'courier_company_id' => $courier->id,
                'assigned_branch_id' => $request->assigned_branch_id,
                'employment_status' => 'active',
            ]);

            // TODO: Send email notification to rider about approval

            return response()->json([
                'success' => true,
                'message' => $result['linked_existing_user']
                    ? 'Rider application approved and linked to the existing rider account with the same email.'
                    : 'Rider application approved. The rider can now log in to the rider app with their registered email and password.',
                'user_id' => $result['user']->id,
                'personnel_id' => $result['personnel']->id,
                'linked_existing_user' => $result['linked_existing_user'],
            ]);
        });

        return $this->respond($request, $response);
    }

    /**
     * The Rider Management page posts with the Inertia router, which needs a
     * redirect, not JSON. For Inertia visits: flash the message and go back.
     * Other callers (API / rider-approve:check) still get the JSON response.
     */
    private function respond(Request $request, JsonResponse $response)
    {
        if (! $request->header('X-Inertia')) {
            return $response;
        }

        $data = $response->getData(true);
        $ok = $response->getStatusCode() < 400 && ($data['success'] ?? false);

        Inertia::flash($ok
            ? ['success' => $data['message'] ?? 'Done.']
            : ['error' => $data['error'] ?? $data['message'] ?? 'Something went wrong. Please try again.']);

        return back(303);
    }

    /**
     * Create or link the users row + courier_personnel row that the rider app
     * logs in with (see Api\RiderAuthController::login).
     * Link key: riders.email = users.email (both unique).
     * Never overwrites the password or role of a non-rider (buyer/seller/...) account.
     *
     * @return array{error: ?string, user: ?User, personnel: ?CourierPersonnel, linked_existing_user: bool}
     */
    private function ensureRiderAccount(Rider $rider, User $courier): array
    {
        $fail = fn (string $msg) => ['error' => $msg, 'user' => null, 'personnel' => null, 'linked_existing_user' => false];

        $email = strtolower(trim((string) $rider->email));
        if ($email === '') {
            return $fail('This application has no email address, so a rider app login cannot be created.');
        }

        $user = User::where('email', $email)->lockForUpdate()->first();
        $linked = (bool) $user;

        if ($user) {
            $role = $user->role ?? $user->account_type;
            if ($role !== 'rider') {
                return $fail("The email {$email} is already used by another Mimoo account (not a rider). Ask the rider to apply again with a different email.");
            }
        }

        $personnel = $user ? CourierPersonnel::where('user_id', $user->id)->lockForUpdate()->first() : null;
        if ($personnel && (int) $personnel->courier_id !== (int) $courier->id) {
            return $fail('This rider account is already linked to another courier company.');
        }

        if (! $user) {
            $usernameFree = $rider->username && ! User::where('username', $rider->username)->exists();
            $user = User::create([
                'name' => mb_substr($rider->full_name, 0, 255),
                'first_name' => $rider->first_name,
                'last_name' => $rider->last_name,
                'email' => $email,
                'username' => $usernameFree ? $rider->username : null,
                'contact_number' => $rider->contact_number,
                // Already a bcrypt hash from registration: the 'hashed' cast keeps it as-is (no rehash).
                'password' => $rider->password,
                'account_type' => 'logistics',
                'role' => 'rider',
                'status' => 'approved',
                'verification_status' => 'verified',
                'approved_at' => now(),
                'privacy_policy_accepted' => (bool) $rider->privacy_policy_accepted,
            ]);
        } else {
            // Existing rider account: make sure it may log in. Password is left untouched.
            $user->update([
                'account_type' => 'logistics',
                'role' => 'rider',
                'status' => 'approved',
                'verification_status' => 'verified',
            ]);
        }

        if ($personnel) {
            if ($personnel->status !== 'active') {
                $personnel->update(['status' => 'active']);
            }
        } else {
            $personnel = CourierPersonnel::create([
                'courier_id' => $courier->id,
                'user_id' => $user->id,
                'name' => mb_substr($rider->full_name, 0, 100),
                'contact_number' => mb_substr((string) $rider->contact_number, 0, 20),
                'role' => 'rider',
                'status' => 'active',
            ]);
        }

        return ['error' => null, 'user' => $user, 'personnel' => $personnel, 'linked_existing_user' => $linked];
    }

    /**
     * Reject a rider application
     */
    public function reject(Request $request, $id)
    {
        return $this->respond($request, $this->rejectApplication($request, $id));
    }

    private function rejectApplication(Request $request, $id): JsonResponse
    {
        $courier = auth()->user();

        // Find rider by ID (not restricted to courier_company_id)
        $rider = Rider::findOrFail($id);

        if ($rider->verification_status !== 'pending') {
            return response()->json([
                'error' => 'This application has already been processed.',
            ], 400);
        }

        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        $rider->update([
            'verification_status' => 'rejected',
            'verified_at' => now(),
            'verified_by' => $courier->id,
            'rejection_reason' => $request->reason,
            'courier_company_id' => $courier->id, // Track which courier rejected
        ]);

        // Make sure a linked rider-app account (if any) can no longer log in.
        $linkedUserId = User::where('email', strtolower(trim((string) $rider->email)))->where('role', 'rider')->value('id');
        if ($linkedUserId) {
            CourierPersonnel::where('user_id', $linkedUserId)->update(['status' => 'inactive']);
        }

        // TODO: Send email notification to rider about rejection with reason

        return response()->json([
            'success' => true,
            'message' => 'Rider application rejected.',
        ]);
    }
}
