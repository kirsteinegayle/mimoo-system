<?php

namespace App\Http\Controllers\Api;

use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Rider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * Courier app (/api/courier-app/*): read-only Rider Management, company
 * profile and change password. Route middleware: ['auth:sanctum',
 * 'courier.role'] — every query is scoped to the logged-in courier.
 *
 *   GET  /riders                   riders of this courier (read-only; approve/reject stay on the web)
 *   GET  /profile                  courier company profile (same data as web Company Settings / Account)
 *   POST /profile/change-password  { current_password, password, password_confirmation }
 */
class CourierAppAccountController extends CourierBaseController
{
    /** GET /api/courier-app/riders */
    public function riders(Request $request): JsonResponse
    {
        $courier = $request->user();

        $personnel = CourierPersonnel::where('courier_id', $courier->id)
            ->where('role', 'rider')
            ->with('user:id,email,role,account_type,status,verification_status')
            ->orderByDesc('is_online')
            ->orderBy('name')
            ->get();

        // Approved application of this courier (riders.email = users.email): vehicle, plate.
        $apps = Rider::where('courier_company_id', $courier->id)
            ->where('verification_status', 'approved')
            ->get(['email', 'vehicle_type', 'plate_number', 'verification_status'])
            ->keyBy(fn ($r) => strtolower((string) $r->email));

        $activeJobs = DeliveryJob::whereIn('personnel_id', $personnel->pluck('id'))
            ->whereIn('status', DeliveryJob::ACTIVE_STATUSES)
            ->selectRaw('personnel_id, COUNT(*) AS c')
            ->groupBy('personnel_id')
            ->pluck('c', 'personnel_id');

        $rows = $personnel->map(function (CourierPersonnel $p) use ($apps, $activeJobs) {
            $u   = $p->user;
            $app = $u ? $apps->get(strtolower((string) $u->email)) : null;
            $accountReady = $u
                && ($u->role ?? $u->account_type) === 'rider'
                && $u->status === 'approved'
                && $u->verification_status === 'verified';

            return [
                'personnel_id'         => $p->id,
                'user_id'              => $p->user_id,
                'name'                 => $p->name,
                'contact_number'       => $p->contact_number,
                'status'               => $p->status,
                'approved'             => (bool) $accountReady,
                'application_status'   => $app?->verification_status,
                'vehicle_type'         => $app?->vehicle_type,
                'plate_number'         => $app?->plate_number,
                'is_online'            => (bool) $p->is_online,
                'last_checked_in_at'   => $p->last_checked_in_at?->toIso8601String(),
                'active_delivery_jobs' => (int) ($activeJobs[$p->id] ?? 0),
            ];
        })->values();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'total'  => $rows->count(),
                'online' => $rows->where('is_online', true)->count(),
                'note'   => 'Approve or reject rider applications on the web (Rider Management).',
            ],
        ]);
    }

    /** GET /api/courier-app/profile */
    public function profile(Request $request): JsonResponse
    {
        $u = $request->user();
        $contact = trim(($u->contact_first_name ?? $u->first_name ?? '') . ' ' . ($u->contact_last_name ?? $u->last_name ?? ''));

        return response()->json([
            'data' => [
                'id'               => $u->id,
                'name'             => $contact !== '' ? $contact : (string) $u->name,
                'email'            => $u->email,
                'company_name'     => $u->company_name ?? $u->business_name ?? $u->name,
                'phone'            => $u->company_contact_number ?? $u->contact_number,
                'business_address' => $u->business_address,
                'status'           => $u->status === 'approved' ? 'active' : (string) $u->status,
                'duty_status'      => 'off_duty', // duty is not supported by the backend yet
                'documents'        => [],
            ],
        ]);
    }

    /** POST /api/courier-app/profile/change-password */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', Password::default(), 'confirmed', 'different:current_password'],
        ], [
            'password.different' => 'The new password must be different from the current password.',
        ]);

        $user = $request->user();
        if (! Hash::check($data['current_password'], (string) $user->password)) {
            return response()->json([
                'message' => 'The current password is incorrect.',
                'errors'  => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        $user->forceFill(['password' => Hash::make($data['password'])])->save();
        // Sign out every device (the app logs in again with the new password).
        $user->tokens()->delete();

        return response()->json(['message' => 'Password changed. Please log in again.']);
    }
}
