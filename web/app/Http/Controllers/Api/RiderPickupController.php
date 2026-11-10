<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Rider pickup endpoints.
 *
 * A rider sees ONLY shipment assignments where:
 *   assignment_status = 'accepted'
 *   assigned_personnel_id = their own courier_personnel.id
 *
 * All rules are copied exactly from CourierPickupController (confirm logic,
 * canTransitionTo, waybill match). No new business rules invented.
 *
 * Route middleware: ['auth:sanctum', 'rider.role']
 */
class RiderPickupController extends Controller
{
    /**
     * GET /api/rider-app/pickups
     * Assignments assigned to MY personnel record only.
     */
    public function index(Request $request): JsonResponse
    {
        $personnel = $this->myPersonnel($request);
        if (! $personnel) {
            return response()->json(['message' => 'Rider profile not found.'], 404);
        }

        $query = ShipmentAssignment::with(['order.items'])
            ->where('assignment_status', 'accepted')
            ->where('assigned_personnel_id', $personnel->id);

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

        $items = $paginated->map(fn ($a) => $this->summarise($a));

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * GET /api/rider-app/pickups/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $assignment = $this->findMine($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        $order = $assignment->order;

        return response()->json([
            'data' => [
                'id'                    => $assignment->id,
                'waybill_number'        => $order->waybill_number,
                'order_number'          => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'pickup_status'         => $assignment->pickup_status,
                'scheduled_date'        => $assignment->scheduled_date?->format('M d, Y'),
                'scheduled_time_window' => $assignment->scheduled_time_window,
                'attempt_count'         => $assignment->attempt_count,
                'failure_reason'        => $assignment->failure_reason,
                'pickup_instructions'   => $assignment->pickup_instructions,
                'seller'                => $this->sellerFromOrder($order),
                'shipping_address'      => $order->shipping_address,
                'payment_method'        => $order->payment_method,
                'total_amount'          => $order->total,
                'items_count'           => $order->items->count(),
                'weight'                => $assignment->weight,
            ],
        ]);
    }

    /**
     * POST /api/rider-app/pickups/{id}/scan
     *
     * Rules copied exactly from CourierPickupController::confirm():
     *   - assignment must be accepted + assigned to me
     *   - canTransitionTo('picked_up') — must be scheduled first
     *   - waybill must match exactly
     *   - idempotent: already picked_up returns 200 with a note
     */
    public function scan(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'waybill_number' => ['required', 'string'],
        ], [
            'waybill_number.required' => 'Please enter or scan the waybill number.',
        ]);

        $assignment = $this->findMine($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        // Idempotent: already confirmed by this rider
        if ($assignment->pickup_status === 'picked_up') {
            return response()->json([
                'message'    => 'Pickup already confirmed.',
                'idempotent' => true,
            ]);
        }

        if (! $assignment->canTransitionTo('picked_up')) {
            return response()->json([
                'message' => 'Cannot confirm pickup. Pickup must be scheduled first.',
            ], 422);
        }

        $actual  = $assignment->order->waybill_number;
        $scanned = trim($request->waybill_number);

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

        // Use a valid history enum value (matches courier-app behaviour)
        $assignment->addHistory(
            'accepted',
            $request->user()->id,
            'Parcel picked up and scanned by rider'
        );

        return response()->json(['message' => 'Pickup confirmed. Parcel is ready for sorting.']);
    }

    /**
     * GET /api/rider-app/history
     * Historical pickups (picked_up or cancelled) for this rider.
     */
    public function history(Request $request): JsonResponse
    {
        $personnel = $this->myPersonnel($request);
        if (! $personnel) {
            return response()->json(['message' => 'Rider profile not found.'], 404);
        }

        $perPage = min((int) ($request->per_page ?? 20), 50);

        $paginated = ShipmentAssignment::with(['order'])
            ->where('assignment_status', 'accepted')
            ->where('assigned_personnel_id', $personnel->id)
            ->whereIn('pickup_status', ['picked_up', 'cancelled', 'failed'])
            ->orderBy('picked_up_at', 'desc')
            ->orderBy('last_attempt_at', 'desc')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        $items = $paginated->map(fn ($a) => $this->summarise($a));

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Find an accepted assignment that belongs to this rider's personnel record. */
    private function findMine(Request $request, int $id): ?ShipmentAssignment
    {
        $personnel = $this->myPersonnel($request);
        if (! $personnel) {
            return null;
        }

        return ShipmentAssignment::with('order.items')
            ->where('id', $id)
            ->where('assignment_status', 'accepted')
            ->where('assigned_personnel_id', $personnel->id)
            ->first();
    }

    /** Get the courier_personnel row linked to the authenticated user. */
    private function myPersonnel(Request $request): ?CourierPersonnel
    {
        return CourierPersonnel::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();
    }

    private function summarise(ShipmentAssignment $a): array
    {
        $order = $a->order;

        return [
            'id'                    => $a->id,
            'waybill_number'        => $order->waybill_number,
            'order_number'          => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            'pickup_status'         => $a->pickup_status,
            'scheduled_date'        => $a->scheduled_date?->format('M d, Y'),
            'scheduled_time_window' => $a->scheduled_time_window ?? 'Not scheduled',
            'attempt_count'         => $a->attempt_count,
            'picked_up_at'          => $a->picked_up_at?->format('M d, Y H:i'),
        ];
    }

    private function sellerFromOrder($order): ?array
    {
        if ($order->items->isEmpty()) {
            return null;
        }
        $seller = \App\Models\User::find($order->items->first()->seller_id);
        if (! $seller) {
            return null;
        }

        return [
            'name'    => $seller->business_name ?? $seller->name,
            'phone'   => $seller->contact_number,
            'address' => trim(implode(', ', array_filter([
                $seller->street_address,
                $seller->municipality_city,
                $seller->province,
            ]))),
        ];
    }
}
