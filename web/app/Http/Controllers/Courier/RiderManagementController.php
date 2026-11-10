<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use Illuminate\Http\Request;
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
                    'municipality_city' => $rider->municipality_city,
                    'barangay' => $rider->barangay,
                    'street_address' => $rider->street_address,
                    'postal_code' => $rider->postal_code,
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
                    'municipality_city' => $rider->municipality_city,
                    'barangay' => $rider->barangay,
                    'street_address' => $rider->street_address,
                    'postal_code' => $rider->postal_code,
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
        
        // Find rider by ID (not restricted to courier_company_id since branch not assigned yet)
        $rider = Rider::findOrFail($id);

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

        $rider->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
            'verified_by' => $courier->id,
            'courier_company_id' => $courier->id,
            'assigned_branch_id' => $request->assigned_branch_id,
            'employment_status' => 'active',
        ]);

        // TODO: Send email notification to rider about approval
        // TODO: Send rider credentials

        return response()->json([
            'success' => true,
            'message' => 'Rider application approved successfully.',
        ]);
    }

    /**
     * Reject a rider application
     */
    public function reject(Request $request, $id)
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

        // TODO: Send email notification to rider about rejection with reason

        return response()->json([
            'success' => true,
            'message' => 'Rider application rejected.',
        ]);
    }
}
