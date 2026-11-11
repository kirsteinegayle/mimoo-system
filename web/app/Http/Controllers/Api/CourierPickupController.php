<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use App\Models\User;
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

        // Same filters as the web PickupManagementController.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('waybill_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('pickup_status', $request->status);
        }

        if ($request->filled('seller')) {
            $query->whereHas('order.items', function ($q) use ($request) {
                $q->where('seller_id', $request->seller);
            });
        }

        if ($request->filled('service_area')) {
            $area = $request->service_area;
            $query->whereHas('order.items', function ($q) use ($area) {
                $q->whereHas('product', function ($pq) use ($area) {
                    $pq->whereHas('seller', function ($sq) use ($area) {
                        $sq->where('municipality_city', 'like', "%{$area}%")
                           ->orWhere('province', 'like', "%{$area}%");
                    });
                });
            });
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

        $items = $paginated->map(function ($a) {
            $order  = $a->order;
            $seller = null;

            if ($order->items->isNotEmpty()) {
                $firstItem = $order->items->first();
                $seller = User::find($firstItem->seller_id);
            }

            $pickupAddress = 'Not provided';
            $serviceArea   = 'Not provided';
            if ($seller) {
                if ($seller->street_address) {
                    $pickupAddress = $seller->street_address;
                    if ($seller->municipality_city) {
                        $pickupAddress .= ', ' . $seller->municipality_city;
                    }
                    if ($seller->province) {
                        $pickupAddress .= ', ' . $seller->province;
                    }
                }
                $serviceArea = trim(($seller->municipality_city ?? '')
                    . ($seller->province ? ', ' . $seller->province : ''), ', ');
                $serviceArea = $serviceArea !== '' ? $serviceArea : 'Not provided';
            }

            return [
                'id'                      => $a->id,
                'waybill_number'          => $order->waybill_number,
                'order_number'            => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'seller_name'             => $seller ? ($seller->business_name ?? $seller->name) : 'N/A',
                'seller_id'               => $seller?->id,
                'seller_contact'          => $seller->contact_number ?? 'Not provided',
                'pickup_address'          => $pickupAddress,
                'service_area'            => $serviceArea,
                'pickup_status'           => $a->pickup_status,
                'scheduled_date'          => $a->scheduled_date?->format('M d, Y'),
                'scheduled_time_window'   => $a->scheduled_time_window ?? 'Not scheduled',
                'assigned_personnel'      => $a->personnel?->name ?? 'Not assigned',
                'attempt_count'           => $a->attempt_count,
            ];
        });

        // Summary stats — identical counters to the web page.
        $base   = ShipmentAssignment::where('courier_id', $courier->id)->where('assignment_status', 'accepted');
        $stats  = [
            'pending_pickup'   => (clone $base)->where('pickup_status', 'pending_pickup')->count(),
            'scheduled_today'  => (clone $base)->where('pickup_status', 'scheduled')->whereDate('scheduled_date', today())->count(),
            'assigned'         => (clone $base)->whereNotNull('assigned_personnel_id')
                ->whereIn('pickup_status', ['pending_pickup', 'scheduled'])->count(),
            'picked_up'        => (clone $base)->where('pickup_status', 'picked_up')->count(),
            'failed'           => (clone $base)->where('pickup_status', 'failed')->count(),
        ];

        // Personnel list
        $personnel = CourierPersonnel::where('courier_id', $courier->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'contact_number']);

        // Unique sellers — same list used by the web filter dropdown.
        $sellers = ShipmentAssignment::where('courier_id', $courier->id)
            ->where('assignment_status', 'accepted')
            ->with('order.items')
            ->get()
            ->pluck('order.items')
            ->flatten()
            ->pluck('seller_id')
            ->unique()
            ->map(function ($sellerId) {
                $seller = User::find($sellerId);

                return [
                    'id'   => $sellerId,
                    'name' => $seller ? ($seller->business_name ?? $seller->name) : 'Unknown',
                ];
            })
            ->values();

        return response()->json([
            'data'      => $items,
            'stats'     => $stats,
            'personnel' => $personnel,
            'sellers'   => $sellers,
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

        // Shared rules (same as web): rider personnel of this courier with an
        // active rider-app account; pickup not yet picked up / cancelled.
        // The assignment row is locked so a rider scan cannot race the reassign.
        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $courier, $id) {
            $assignment = ShipmentAssignment::where('courier_id', $courier->id)
                ->where('assignment_status', 'accepted')
                ->lockForUpdate()
                ->find($id);
            if (! $assignment) {
                return response()->json(['message' => 'Pickup not found.'], 404);
            }

            $check = \App\Services\PickupAssignmentRules::check($courier->id, (int) $request->personnel_id, $assignment);
            if (! $check['ok']) {
                return response()->json(['message' => $check['message']], $check['status']);
            }
            $personnel = $check['personnel'];

            $assignment->update(['assigned_personnel_id' => $personnel->id]);
            $assignment->addHistory('re-assigned', $courier->id, "Assigned to {$personnel->name}");

            return response()->json(['message' => 'Personnel assigned successfully.']);
        });
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

    /**
     * GET /api/courier-app/pickups/{id}
     * Pickup detail + history (mirrors the web pickup detail modal).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $assignment = ShipmentAssignment::with([
            'order.items',
            'personnel',
            'history.performer',
            'pickedUpBy',
        ])
            ->where('courier_id', $request->user()->id)
            ->where('assignment_status', 'accepted')
            ->find($id);

        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        $order  = $assignment->order;
        $seller = null;

        if ($order->items->isNotEmpty()) {
            $firstItem = $order->items->first();
            $sellerUser = User::find($firstItem->seller_id);
            if ($sellerUser) {
                $seller = [
                    'id'       => $sellerUser->id,
                    'name'     => $sellerUser->business_name ?? $sellerUser->name,
                    'email'    => $sellerUser->email,
                    'phone'    => $sellerUser->contact_number ?? 'Not provided',
                    'address'  => $sellerUser->street_address ?? 'Not provided',
                    'city'     => $sellerUser->municipality_city ?? 'Not provided',
                    'province' => $sellerUser->province ?? 'Not provided',
                ];
            }
        }

        $history = $assignment->history->map(fn ($h) => [
            'action'       => $h->action,
            'performed_by' => $h->performer->name ?? 'System',
            'notes'        => $h->notes,
            'created_at'   => $h->created_at->format('M d, Y H:i A'),
        ]);

        return response()->json([
            'data' => [
                'id'                    => $assignment->id,
                'waybill_number'        => $order->waybill_number,
                'order_number'          => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'pickup_status'         => $assignment->pickup_status,
                'weight'                => $assignment->weight ?? 'Not provided',
                'dimensions'            => $assignment->dimensions ?? 'Not provided',
                'pickup_instructions'   => $assignment->pickup_instructions ?? 'No special instructions',
                'scheduled_date'        => $assignment->scheduled_date?->format('M d, Y'),
                'scheduled_time_window' => $assignment->scheduled_time_window,
                'assigned_personnel'    => $assignment->personnel ? [
                    'id'      => $assignment->personnel->id,
                    'name'    => $assignment->personnel->name,
                    'role'    => $assignment->personnel->role,
                    'contact' => $assignment->personnel->contact_number,
                ] : null,
                'picked_up_at'          => $assignment->picked_up_at?->format('M d, Y H:i A'),
                'picked_up_by_name'     => $assignment->pickedUpBy?->name,
                'attempt_count'         => $assignment->attempt_count,
                'last_attempt_at'       => $assignment->last_attempt_at?->format('M d, Y H:i A'),
                'cancellation_reason'   => $assignment->cancellation_reason,
                'failure_reason'        => $assignment->failure_reason,
                'seller'                => $seller,
                'items_count'           => $order->items->count(),
                'history'               => $history,
            ],
        ]);
    }

    /**
     * POST /api/courier-app/pickups/{id}/reschedule
     * Same validation and status rules as the web controller.
     */
    public function reschedule(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'scheduled_date'        => ['required', 'date', 'after_or_equal:today'],
            'scheduled_time_window' => ['required', 'string', 'max:50'],
            'reason'                => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'reason.required' => 'Please provide a reason for rescheduling.',
            'reason.min'      => 'Reason must be at least 10 characters.',
        ]);

        $assignment = $this->findAccepted($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        if (! in_array($assignment->pickup_status, ['scheduled', 'failed'], true)) {
            return response()->json([
                'message' => 'Can only reschedule from scheduled or failed status.',
            ], 422);
        }

        $assignment->update([
            'pickup_status'         => 'scheduled',
            'scheduled_date'        => $request->scheduled_date,
            'scheduled_time_window' => $request->scheduled_time_window,
        ]);

        // The web records the invalid action 're-scheduled'. The enum only
        // allows assigned/accepted/rejected/re-assigned, so use 're-assigned'
        // (the schema-safe value) and keep the real wording in notes.
        $assignment->addHistory('re-assigned', $request->user()->id,
            "Rescheduled to {$request->scheduled_date} {$request->scheduled_time_window}. Reason: "
            . trim($request->reason));

        return response()->json(['message' => 'Pickup rescheduled successfully!']);
    }

    /**
     * POST /api/courier-app/pickups/{id}/cancel
     * Same validation and status rules as the web controller.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'reason.required' => 'Please provide a reason for cancellation.',
            'reason.min'      => 'Reason must be at least 10 characters.',
        ]);

        $assignment = $this->findAccepted($request, $id);
        if (! $assignment) {
            return response()->json(['message' => 'Pickup not found.'], 404);
        }

        if (! $assignment->canTransitionTo('cancelled')) {
            return response()->json([
                'message' => 'Cannot cancel pickup in current status.',
            ], 422);
        }

        $reason = trim($request->reason);
        if ($reason === '') {
            return response()->json([
                'message' => 'Cancellation reason cannot be empty or whitespace only.',
            ], 422);
        }

        $assignment->update([
            'pickup_status'       => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        // The web records the invalid action 'cancelled'. Use the schema-safe
        // 'rejected' value and keep the real wording in notes.
        $assignment->addHistory('rejected', $request->user()->id, "Pickup cancelled: {$reason}");

        return response()->json(['message' => 'Pickup cancelled.']);
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
