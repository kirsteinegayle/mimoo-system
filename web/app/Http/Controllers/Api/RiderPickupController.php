<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\RiderEarning;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentScan;
use App\Http\Controllers\Api\Concerns\ResolvesRiderHub;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
    use ResolvesRiderHub;

    /** shipment_scans.scan_type written when the rider hands a pickup to the hub. */
    public const SCAN_RIDER_DROP_OFF = 'rider_drop_off';

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
                // Additive: set once the rider dropped this pickup at the hub.
                'dropped_at_hub'        => $assignment->pickup_status === 'picked_up' && ($drop = $this->dropScan($assignment))
                    ? $this->dropPayload($drop)
                    : null,
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

        $riderId = $request->user()->id;
        $already = DB::transaction(function () use ($assignment, $riderId, $request) {
            // Row lock: two scans at the same time cannot both mark + earn.
            $locked = ShipmentAssignment::whereKey($assignment->id)->lockForUpdate()->first();

            // Re-check under the lock: the courier may have reassigned (or the
            // pickup changed) between findMine() and here. Same 404 / 422 as above.
            $personnel = $this->myPersonnel($request);
            if (! $locked || ! $personnel
                || $locked->assignment_status !== 'accepted'
                || (int) $locked->assigned_personnel_id !== (int) $personnel->id) {
                return response()->json(['message' => 'Pickup not found.'], 404);
            }
            if ($locked->pickup_status === 'picked_up') {
                return true;
            }
            if (! $locked->canTransitionTo('picked_up')) {
                return response()->json([
                    'message' => 'Cannot confirm pickup. Pickup must be scheduled first.',
                ], 422);
            }

            $now = now();
            $locked->update([
                'pickup_status' => 'picked_up',
                'picked_up_at'  => $now,
                'picked_up_by'  => $riderId,
            ]);

            // Pickup earning: one row per assignment (shipment_assignment_id is
            // unique in rider_earnings), so a repeated request never doubles it.
            RiderEarning::firstOrCreate(
                ['shipment_assignment_id' => $locked->id],
                [
                    'rider_user_id' => $riderId,
                    'order_id'      => $locked->order_id,
                    'type'          => RiderEarning::TYPE_PICKUP,
                    'amount'        => RiderEarning::PICKUP_RATE,
                    'earned_at'     => $now,
                ]
            );

            return false;
        });

        if ($already instanceof JsonResponse) {
            return $already; // failed the locked re-check: nothing written, no earning
        }
        if ($already) {
            return response()->json([
                'message'    => 'Pickup already confirmed.',
                'idempotent' => true,
            ]);
        }

        // Use a valid history enum value (matches courier-app behaviour)
        $assignment->addHistory(
            'accepted',
            $riderId,
            'Parcel picked up and scanned by rider'
        );

        return response()->json([
            'message' => 'Pickup confirmed. Parcel is ready for sorting.',
            'earned'  => RiderEarning::PICKUP_RATE,
        ]);
    }

    /**
     * POST /api/rider-app/pickups/{id}/drop-at-hub
     *
     * Records that the rider handed a picked-up parcel to their hub: ONE
     * shipment_scans row (scan_type = rider_drop_off) at the rider's branch
     * (riders.assigned_branch_id, see ResolvesRiderHub).
     *
     *   - only the assignment's rider (same findMine rule as scan) -> else 404
     *   - pickup must be picked_up -> else 422
     *   - rider must have a hub linked -> else 422
     *   - idempotent: a second call returns 200 and writes nothing
     *   - if the hub already scanned the parcel 'received', nothing is written
     *     (keeps the web received / archived parcel lists unchanged)
     *
     * Never writes orders.* or the hub's 'received' scans.
     */
    public function dropAtHub(Request $request, int $id): JsonResponse
    {
        $assignment = $this->findMine($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }
        if ($assignment->pickup_status !== 'picked_up') {
            return response()->json([
                'message' => 'Scan the parcel at the seller first. Only picked-up parcels can be dropped at the hub.',
            ], 422);
        }

        $user      = $request->user();
        $personnel = $this->myPersonnel($request);

        return DB::transaction(function () use ($assignment, $user, $personnel) {
            // Row lock: two taps at the same time cannot both write a scan.
            ShipmentAssignment::whereKey($assignment->id)->lockForUpdate()->first();

            $existing = $this->dropScan($assignment);
            if ($existing) {
                return response()->json([
                    'message'    => 'Already dropped at the hub.',
                    'idempotent' => true,
                    'data'       => $this->dropPayload($existing),
                ]);
            }

            $received = ShipmentScan::where('order_id', $assignment->order_id)
                ->where('scan_type', 'received')
                ->with('facility')
                ->latest('id')
                ->first();
            if ($received) {
                return response()->json([
                    'message'    => 'The hub already received this parcel.',
                    'idempotent' => true,
                    'data'       => $this->dropPayload($received),
                ]);
            }

            $hub = $this->riderHub($user, $personnel);
            if (! $hub) {
                return response()->json([
                    'message' => 'No hub is linked to your rider account yet. Ask your courier to set your branch.',
                ], 422);
            }

            $scan = ShipmentScan::create([
                'order_id'       => $assignment->order_id,
                'waybill_number' => $assignment->order->waybill_number,
                'courier_id'     => $assignment->courier_id,
                'facility_id'    => $hub->id,
                'scan_type'      => self::SCAN_RIDER_DROP_OFF,
                'scanned_by'     => trim((string) ($personnel?->name ?: $user->name)),
                'notes'          => "Dropped at hub by rider (pickup #{$assignment->id})",
            ]);
            $scan->setRelation('facility', $hub);

            return response()->json([
                'message' => "Dropped at {$hub->facility_name}.",
                'data'    => $this->dropPayload($scan),
            ], 201);
        });
    }

    /** The rider drop-off scan for this assignment's order + courier, if any. */
    private function dropScan(ShipmentAssignment $a): ?ShipmentScan
    {
        return ShipmentScan::where('order_id', $a->order_id)
            ->where('courier_id', $a->courier_id)
            ->where('scan_type', self::SCAN_RIDER_DROP_OFF)
            ->with('facility')
            ->latest('id')
            ->first();
    }

    private function dropPayload(ShipmentScan $scan): array
    {
        return [
            'scan_type'  => $scan->scan_type,
            'dropped_at' => $scan->created_at?->toIso8601String(),
            'hub'        => $this->hubPayload($scan->facility),
        ];
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
            // Additive: set once the rider dropped this pickup at the hub.
            'dropped_at_hub'        => $a->pickup_status === 'picked_up' && ($drop = $this->dropScan($a))
                ? $this->dropPayload($drop)
                : null,
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
