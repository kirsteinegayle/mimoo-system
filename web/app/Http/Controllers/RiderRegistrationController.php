<?php

namespace App\Http\Controllers;

use App\Http\Requests\RiderRegistrationRequest;
use App\Models\Rider;
use App\Models\User;
use App\Models\CourierFacility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RiderRegistrationController extends Controller
{
    /**
     * Show the rider registration form
     */
    public function create()
    {
        return Inertia::render('logistics/RiderRegistration');
    }

    /**
     * Handle rider registration submission
     */
    public function store(RiderRegistrationRequest $request)
    {
        try {
            // Handle file uploads
            $profilePicturePath = $request->hasFile('profile_picture')
                ? $request->file('profile_picture')->store('riders/profile_pictures', 'public')
                : null;

            $governmentIdPath = $request->file('government_id')->store('riders/documents/government_ids', 'public');

            $driversLicensePath = $request->hasFile('drivers_license')
                ? $request->file('drivers_license')->store('riders/documents/drivers_licenses', 'public')
                : null;

            $vehicleOrCrPath = $request->hasFile('vehicle_or_cr')
                ? $request->file('vehicle_or_cr')->store('riders/documents/vehicle_registrations', 'public')
                : null;

            // Create rider record (branch will be assigned by courier during approval)
            $rider = Rider::create([
                // Personal Information
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'birthdate' => $request->birthdate,
                'gender' => $request->gender,
                'contact_number' => $request->contact_number,
                'email' => $request->email,
                'profile_picture' => $profilePicturePath,
                
                // Account Information
                'rider_id' => Rider::generateRiderId(),
                'username' => $request->username,
                'password' => Hash::make($request->password),
                
                // Branch Assignment (null - to be set by courier during approval)
                'courier_company_id' => null,
                'assigned_branch_id' => null,
                'employment_status' => 'inactive',
                
                // Delivery Information
                'service_areas' => $request->service_areas,
                'vehicle_type' => $request->vehicle_type,
                'plate_number' => $request->plate_number,
                'drivers_license_number' => $request->drivers_license_number,
                
                // Address Information
                'region' => $request->region,
                'province' => $request->province,
                'city_municipality' => $request->city_municipality,
                'barangay' => $request->barangay,
                'street_address' => $request->street_address,
                
                // Supporting Documents
                'government_id' => $governmentIdPath,
                'drivers_license' => $driversLicensePath,
                'vehicle_or_cr' => $vehicleOrCrPath,
                
                // Status & Verification
                'verification_status' => 'pending',
                
                // Privacy & Terms
                'privacy_policy_accepted' => $request->privacy_policy_accepted,
                'privacy_accepted_at' => now(),
            ]);

            // TODO: Send notification to all courier companies about new rider application
            // TODO: Send confirmation email to rider

            return response()->json([
                'success' => true,
                'message' => 'Rider registration submitted successfully. Courier companies will review your application.',
                'rider_id' => $rider->rider_id,
            ]);

        } catch (\Exception $e) {
            // Clean up uploaded files if registration fails
            if (isset($profilePicturePath)) Storage::disk('public')->delete($profilePicturePath);
            if (isset($governmentIdPath)) Storage::disk('public')->delete($governmentIdPath);
            if (isset($driversLicensePath)) Storage::disk('public')->delete($driversLicensePath);
            if (isset($vehicleOrCrPath)) Storage::disk('public')->delete($vehicleOrCrPath);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Show registration pending page
     */
    public function pending()
    {
        return Inertia::render('logistics/RiderRegistrationPending');
    }
}
