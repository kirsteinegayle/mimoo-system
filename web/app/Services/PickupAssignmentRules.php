<?php

namespace App\Services;

use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use App\Models\User;

/**
 * Shared rules for assigning a pickup (shipment_assignments.assigned_personnel_id)
 * to a rider. Used by BOTH assignPersonnel endpoints so web and courier app
 * behave the same:
 *   - Courier\PickupManagementController::assignPersonnel   (web)
 *   - Api\CourierPickupController::assignPersonnel          (courier app)
 *
 * Personnel (courier_personnel):
 *   same courier + status 'active'                → else 404 (unchanged behaviour)
 *   role 'rider' (enum: rider|driver|staff)        → else 422
 *   user_id set, and that user can log in to the rider app
 *   (role rider, status approved, verification_status verified — the same
 *   checks as Api\RiderAuthController::login)     → else 422
 *
 * Pickup (shipment_assignments.pickup_status):
 *   pending_pickup | scheduled | failed            → else 422 (picked_up / cancelled)
 *
 * Callers should pass the assignment row locked (lockForUpdate) so the
 * status check cannot race with a rider scan.
 */
class PickupAssignmentRules
{
    public const ASSIGNABLE_PICKUP_STATUSES = ['pending_pickup', 'scheduled', 'failed'];

    /**
     * @return array{ok: true, personnel: CourierPersonnel}|array{ok: false, status: int, message: string}
     */
    public static function check(int $courierId, int $personnelId, ShipmentAssignment $assignment): array
    {
        $personnel = CourierPersonnel::where('id', $personnelId)
            ->where('courier_id', $courierId)
            ->where('status', 'active')
            ->first();
        if (! $personnel) {
            return self::fail(404, 'Personnel not found or not active.');
        }

        if ($personnel->role !== 'rider') {
            return self::fail(422, "Only riders can be assigned to a pickup. {$personnel->name} is a {$personnel->role}.");
        }

        if (! $personnel->user_id) {
            return self::fail(422, "{$personnel->name} has no rider app account yet, so they cannot scan this pickup. Approve their rider application first.");
        }

        $user = User::find($personnel->user_id);
        $role = $user ? ($user->role ?? $user->account_type) : null;
        if (! $user || $role !== 'rider' || $user->status !== 'approved' || $user->verification_status !== 'verified') {
            return self::fail(422, "{$personnel->name}'s rider app account is not active (must be an approved, verified rider).");
        }

        $status = (string) $assignment->pickup_status;
        if (! in_array($status, self::ASSIGNABLE_PICKUP_STATUSES, true)) {
            return self::fail(422, match ($status) {
                'picked_up' => 'Pickup already picked up; cannot reassign.',
                'cancelled' => 'Pickup was cancelled; cannot reassign.',
                default     => "Pickup cannot be reassigned while it is {$status}.",
            });
        }

        return ['ok' => true, 'personnel' => $personnel];
    }

    private static function fail(int $status, string $message): array
    {
        return ['ok' => false, 'status' => $status, 'message' => $message];
    }
}
