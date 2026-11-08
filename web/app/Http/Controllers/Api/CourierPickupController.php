<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierPickupController extends CourierBaseController
{
    /**
     * GET /api/courier-app/pickups
     * Only accepted assignments (mirrors web PickupManagementController).
     */
    public function index(Request $request): JsonResponse
    {
        $courier = $request->user();

        $query = ShipmentAssignment::with(['order.items', 'personnel'])
            ->where('courier_id', $courier->id)
            ->where('assignment_status', 'accepted');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('pickup_status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('scheduled_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('scheduled_date', '<=', $request->date_to);
        }

        $perPage   = min((int) ($request->per_page ?? 20), 50);
        $paginated = $query
            ->orderByRaw("CASE
                WHEN pickup_status = 'pending_pickup' THEN 0
                WHEN scheduled_date IS NULL THEN 1
                ELSE 2
            END")
            ->orderBy('scheduled_date', 'asc')
            ->paginate($perPage);

        $items = $paginated->map(fn ($a) => [
            'id'                      => $a->id,
            'waybill_number'          => $a->order->waybill_number,
            'order_number'            => 'MIM-' . str_pad($a->order->id, 8, '0', STR_PAD_LEFT),
            'pickup_status'           => $a->pickup_status,
            'scheduled_date'          => $a->scheduled_date?->format('M d, Y'),
            'scheduled_time_window'   => $a->scheduled_time_window ?? 'Not scheduled',
            'assigned_personnel'      => $a->personnel?->name ?? 'Not assigned',
            'attempt_count'           => $a->attempt_count,
        ]);

        // Summary stats
        $base   = ShipmentAssignment::where('courier_id', $courier->id)->where('assignment_status', 'accepted');
        $stats  = [
            'pending_pickup'   => (clone $base)->where('pickup_status', 'pending_pickup')->count(),
            'scheduled_today'  => (clone $base)->where('pickup_status', 'scheduled')->whereDate('scheduled_date', today())->count(),
            'picked_up'        => (clone $base)->where('pickup_status', 'picked_up')->count(),
            'failed'           => (clone $base)->where('pickup_status', 'failed')->count(),
        ];

        // Personnel list
        $personnel = CourierPersonnel::where('courier_id', $courier->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'contact_number']);

        return response()->json([
            'data'      => $items,
            'stats'     => $stats,
            'personnel' => $personnel,
            'meta'      => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * POST /api/courier-app/pickups/{id}/schedule
     */
    public function schedule(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'scheduled_date'        => ['required', 'date', 'after_or_equal:today'],
            'scheduled_time_window' => ['required', 'string', 'max:50'],
        ]);

        $assignment = $this->findAccepted($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        if (! $assignment->canTransitionTo('scheduled')) {
            return response()->json(['message' => 'Cannot schedule pickup in its current status.'], 422);
        }

        $assignment->update([
            'pickup_status'         => 'scheduled',
            'scheduled_date'        => $request->scheduled_date,
            'scheduled_time_window' => $request->scheduled_time_window,
        ]);
        // 're-assigned' is the closest valid enum value for scheduling/updates
        $assignment->addHistory('re-assigned', $request->user()->id,
            "Pickup scheduled for {$request->scheduled_date} {$request->scheduled_time_window}");

        return response()->json(['message' => 'Pickup scheduled successfully.']);
    }

    /**
     * POST /api/courier-app/pickups/{id}/assign-personnel
     */
    public function assignPersonnel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'personnel_id' => ['required', 'integer'],
        ]);

        $courier = $request->user();

        // Verify personnel belongs to this courier.
        $personnel = CourierPersonnel::where('id', $request->personnel_id)
            ->where('courier_id', $courier->id)
            ->where('status', 'active')
            ->first();

        if (! $personnel) {
            return response()->json(['message' => 'Personnel not found or not active.'], 404);
        }

        $assignment = $this->findAccepted($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        $assignment->update(['assigned_personnel_id' => $personnel->id]);
        $assignment->addHistory('re-assigned', $courier->id, "Assigned to {$personnel->name}");

        return response()->json(['message' => 'Personnel assigned successfully.']);
    }

    /**
     * POST /api/courier-app/pickups/{id}/confirm
     * Verifies the scanned/typed waybill number before marking picked up.
     */
    public function confirm(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'scanned_waybill' => ['required', 'string'],
        ], [
            'scanned_waybill.required' => 'Please enter or scan the waybill number.',
        ]);

        $assignment = $this->findAccepted($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        if (! $assignment->canTransitionTo('picked_up')) {
            return response()->json([
                'message' => 'Cannot confirm pickup. Must be scheduled first.',
            ], 422);
        }

        $actual  = $assignment->order->waybill_number;
        $scanned = trim($request->scanned_waybill);

        if ($scanned !== $actual) {
            return response()->json([
                'message' => "Waybill mismatch. Expected: {$actual}",
            ], 422);
        }

        $assignment->update([
            'pickup_status' => 'picked_up',
            'picked_up_at'  => now(),
            'picked_up_by'  => $request->user()->id,
        ]);
        $assignment->addHistory('accepted', $request->user()->id, 'Parcel picked up and scanned');

        return response()->json(['message' => 'Pickup confirmed. Parcel is ready for sorting.']);
    }

    /**
     * POST /api/courier-app/pickups/{id}/record-failed
     */
    public function recordFailed(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'reason.required' => 'Please provide a reason for the failed attempt.',
            'reason.min'      => 'Reason must be at least 10 characters.',
        ]);

        $assignment = $this->findAccepted($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        if (! $assignment->canTransitionTo('failed')) {
            return response()->json(['message' => 'Cannot record failed attempt in current status.'], 422);
        }

        $count = $assignment->attempt_count + 1;
        $assignment->update([
            'pickup_status'   => 'failed',
            'failure_reason'  => trim($request->reason),
            'attempt_count'   => $count,
            'last_attempt_at' => now(),
        ]);
        $assignment->addHistory('rejected', $request->user()->id,
            "Attempt #{$count} failed. Reason: {$request->reason}");

        $warning = $count >= 3
            ? "Attempt #{$count}. Consider cancelling if pickup cannot be completed."
            : null;

        return response()->json([
            'message'       => 'Failed pickup attempt recorded.',
            'attempt_count' => $count,
            'warning'       => $warning,
        ]);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function findAccepted(Request $request, int $id): ?ShipmentAssignment
    {
        return ShipmentAssignment::with('order')
            ->where('courier_id', $request->user()->id)
            ->where('assignment_status', 'accepted')
            ->find($id);
    }
}
