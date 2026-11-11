<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;

/**
 * Finds a rider's hub using links that already exist in the DB (no new column):
 *
 *   users.email = riders.email (approved application, same courier company)
 *     -> riders.assigned_branch_id -> courier_facilities (same courier)
 *
 * Riders created without an application (e.g. demo seeds) have no branch;
 * then only the courier company (courier_personnel.courier_id) is known.
 */
trait ResolvesRiderHub
{
    protected function riderHub(User $user, ?CourierPersonnel $personnel): ?CourierFacility
    {
        $email = strtolower(trim((string) $user->email));
        if ($email === '') {
            return null;
        }

        $application = Rider::whereRaw('LOWER(email) = ?', [$email])
            ->where('verification_status', 'approved')
            ->whereNotNull('assigned_branch_id')
            ->when($personnel, fn ($q) => $q->where('courier_company_id', $personnel->courier_id))
            ->latest('id')
            ->first(['id', 'courier_company_id', 'assigned_branch_id']);
        if (! $application) {
            return null;
        }

        return CourierFacility::whereKey($application->assigned_branch_id)
            ->where('courier_id', $personnel?->courier_id ?? $application->courier_company_id)
            ->first();
    }

    /** Hub payload for the rider app (null when no branch is linked). */
    protected function hubPayload(?CourierFacility $hub): ?array
    {
        if (! $hub) {
            return null;
        }
        $address = collect([$hub->address, $hub->city, $hub->province])
            ->map(fn ($p) => trim((string) $p))
            ->filter()
            ->unique()
            ->implode(', ');

        return [
            'id'      => $hub->id,
            'name'    => $hub->facility_name,
            'code'    => $hub->facility_code,
            'type'    => $hub->facility_type,
            'address' => $address !== '' ? $address : null,
            'city'    => $hub->city,
        ];
    }

    protected function courierCompanyName(?CourierPersonnel $personnel): ?string
    {
        if (! $personnel) {
            return null;
        }
        $courier = User::find($personnel->courier_id);
        $name = trim((string) ($courier?->company_name ?: $courier?->business_name ?: $courier?->name ?: ''));
        return $name !== '' ? $name : null;
    }
}
