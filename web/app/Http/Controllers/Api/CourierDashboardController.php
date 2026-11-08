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

        return response()->json(['data' => $stats]);
    }
}
