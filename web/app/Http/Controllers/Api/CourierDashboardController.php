<?php

namespace App\Http\Controllers\Api;

use App\Models\ShipmentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierDashboardController extends CourierBaseController
{
    /**
     * GET /api/courier-app/dashboard
     * Real counts from shipment_assignments, scoped to the auth courier.
     */
    public function index(Request $request): JsonResponse
    {
        $courierId = $request->user()->id;

        $base = fn () => ShipmentAssignment::where('courier_id', $courierId);

        $stats = [
            // Awaiting acceptance decision
            'incoming_shipments' => $base()->where('assignment_status', 'pending')->count(),

            // Accepted, awaiting scheduled pickup
            'pending_pickups'    => $base()
                ->where('assignment_status', 'accepted')
                ->where('pickup_status', 'pending_pickup')
                ->count(),

            // Scheduled for today
            'scheduled_today'    => $base()
                ->where('assignment_status', 'accepted')
                ->where('pickup_status', 'scheduled')
                ->whereDate('scheduled_date', today())
                ->count(),

            // Picked up today
            'picked_up_today'    => $base()
                ->where('assignment_status', 'accepted')
                ->where('pickup_status', 'picked_up')
                ->whereDate('picked_up_at', today())
                ->count(),

            // Currently failing / need rescheduling
            'failed'             => $base()
                ->where('assignment_status', 'accepted')
                ->where('pickup_status', 'failed')
                ->count(),

            // Assignments expiring within 2 hours (pending only)
            'expiring_soon'      => $base()
                ->where('assignment_status', 'pending')
                ->where('acceptance_deadline', '>', now())
                ->where('acceptance_deadline', '<=', now()->addHours(2))
                ->count(),
        ];

        // Quick Actions badges (additive keys): work still needing a rider
        // (same numbers as the New Assign tab) and riders online now.
        $branches = \App\Services\BranchAssignService::summary($courierId);
        $stats['new_pickups_unassigned'] = array_sum(array_column($branches, 'new_pickups'));
        $stats['deliveries_waiting']     = array_sum(array_column($branches, 'deliveries'));
        $stats['online_riders']          = \App\Models\CourierPersonnel::where('courier_id', $courierId)
            ->where('role', 'rider')->where('status', 'active')->where('is_online', true)->count();

        return response()->json(['data' => $stats]);
    }

    /**
     * GET /api/courier-app/activity?limit=15&type=shipment|pickup|hub|delivery
     * Recent Activity of the company, newest first (CourierActivityService).
     */
    public function activity(Request $request): JsonResponse
    {
        $data = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'type'  => ['nullable', 'string', 'in:' . implode(',', \App\Services\CourierActivityService::TYPES)],
        ]);

        return response()->json(['data' => \App\Services\CourierActivityService::recent(
            (int) $request->user()->id, (int) ($data['limit'] ?? 15), $data['type'] ?? null
        )]);
    }
}
