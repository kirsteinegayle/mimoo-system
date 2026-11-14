<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PickupManagementController extends Controller
{
    /**
     * Display pickup management page.
     * CRITICAL: Only show assignments where assignment_status='accepted'
     */
    public function index(Request $request)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        // Build query - MUST filter by assignment_status='accepted'
        $query = ShipmentAssignment::with([
            'order.items',
            'personnel',
        ])
        ->where('courier_id', $user->id)
        ->where('assignment_status', 'accepted'); // CRITICAL: only accepted assignments

        // Apply filters
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

        // Sort: scheduled date soonest first, unscheduled pending at top
        $pickups = $query->orderByRaw("
            CASE 
                WHEN pickup_status = 'pending_pickup' THEN 0
                WHEN scheduled_date IS NULL THEN 1
                ELSE 2
            END
        ")
        ->orderBy('scheduled_date', 'asc')
        ->paginate(20)
        ->withQueryString();

        // Transform data
        $pickupRequests = $pickups->map(function ($assignment) {
            $order = $assignment->order;
            
            // Get seller info from first item
            $sellerName = 'N/A';
            $sellerId = null;
            $sellerContact = 'Not provided';
            $pickupAddress = 'Not provided';
            $serviceArea = 'Not provided';
            
            if ($order->items->isNotEmpty()) {
                $firstItem = $order->items->first();
                $sellerId = $firstItem->seller_id;
                $seller = User::find($sellerId);
                
                if ($seller) {
                    $sellerName = $seller->business_name ?? $seller->name;
                    $sellerContact = $seller->contact_number ?? 'Not provided';
                    
                    // Pickup address
                    if ($seller->street_address) {
                        $pickupAddress = $seller->street_address;
                        if ($seller->municipality_city) {
                            $pickupAddress .= ', ' . $seller->municipality_city;
                        }
                        if ($seller->province) {
                            $pickupAddress .= ', ' . $seller->province;
                        }
                    }
                    
                    // Service area (municipality + province)
                    $serviceArea = ($seller->municipality_city ?? '') . 
                                 ($seller->province ? ', ' . $seller->province : '');
                }
            }

            return [
                'id' => $assignment->id,
                'waybill_number' => $order->waybill_number,
                'seller_name' => $sellerName,
                'seller_id' => $sellerId,
                'seller_contact' => $sellerContact,
                'pickup_address' => $pickupAddress,
                'service_area' => trim($serviceArea, ', ') ?: 'Not provided',
                'scheduled_date' => $assignment->scheduled_date?->format('M d, Y'),
                'scheduled_time_window' => $assignment->scheduled_time_window ?? 'Not scheduled',
                'assigned_personnel' => $assignment->personnel?->name ?? 'Not assigned',
                'pickup_status' => $assignment->pickup_status,
                'attempt_count' => $assignment->attempt_count,
            ];
        });

        // Get summary stats - MUST filter by assignment_status='accepted'
        $baseQuery = ShipmentAssignment::where('courier_id', $user->id)
            ->where('assignment_status', 'accepted'); // CRITICAL

        $stats = [
            'pending_pickup' => (clone $baseQuery)->where('pickup_status', 'pending_pickup')->count(),
            'scheduled_today' => (clone $baseQuery)
                ->where('pickup_status', 'scheduled')
                ->whereDate('scheduled_date', today())
                ->count(),
            'assigned' => (clone $baseQuery)
                ->whereNotNull('assigned_personnel_id')
                ->whereIn('pickup_status', ['pending_pickup', 'scheduled'])
                ->count(),
            'picked_up' => (clone $baseQuery)->where('pickup_status', 'picked_up')->count(),
            'failed' => (clone $baseQuery)->where('pickup_status', 'failed')->count(),
        ];

        // Get unique sellers
        $sellers = ShipmentAssignment::where('courier_id', $user->id)
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
                    'id' => $sellerId,
                    'name' => $seller ? ($seller->business_name ?? $seller->name) : 'Unknown',
                ];
            })
            ->filter()
            ->values();

        // Get active personnel for this courier
        $personnel = CourierPersonnel::where('courier_id', $user->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'contact_number']);

        return Inertia::render('courier/PickupManagement', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name ?? 'Courier Company',
                'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? '')),
            ],
            'pickups' => $pickupRequests,
            'stats' => $stats,
            'sellers' => $sellers,
            'personnel' => $personnel,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'all',
                'seller' => $request->seller,
                'service_area' => $request->service_area,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'pagination' => [
                'current_page' => $pickups->currentPage(),
                'last_page' => $pickups->lastPage(),
                'per_page' => $pickups->perPage(),
                'total' => $pickups->total(),
                'links' => $pickups->linkCollection()->toArray(),
            ],
        ]);
    }

    /**
     * Get pickup details.
     */
    public function show($id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $assignment = ShipmentAssignment::with([
            'order.items',
            'personnel',
            'history.performer',
            'pickedUpBy',
        ])
        ->where('courier_id', $user->id)
        ->where('assignment_status', 'accepted') // Only accepted
        ->findOrFail($id);

        $order = $assignment->order;

        // Get seller details
        $sellerDetails = null;
        if ($order->items->isNotEmpty()) {
            $firstItem = $order->items->first();
            $seller = User::find($firstItem->seller_id);
            if ($seller) {
                $sellerDetails = [
                    'id' => $seller->id,
                    'name' => $seller->business_name ?? $seller->name,
                    'email' => $seller->email,
                    'phone' => $seller->contact_number ?? 'Not provided',
                    'address' => $seller->street_address ?? 'Not provided',
                    'city' => $seller->municipality_city ?? 'Not provided',
                    'province' => $seller->province ?? 'Not provided',
                ];
            }
        }

        // Transform history
        $history = $assignment->history->map(function ($entry) {
            return [
                'action' => $entry->action,
                'performed_by' => $entry->performer->name ?? 'System',
                'notes' => $entry->notes,
                'created_at' => $entry->created_at->format('M d, Y H:i A'),
            ];
        });

        return response()->json([
            'pickup' => [
                'id' => $assignment->id,
                'waybill_number' => $order->waybill_number,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'pickup_status' => $assignment->pickup_status,
                'weight' => $assignment->weight ?? 'Not provided',
                'dimensions' => $assignment->dimensions ?? 'Not provided',
                'pickup_instructions' => $assignment->pickup_instructions ?? 'No special instructions',
                'scheduled_date' => $assignment->scheduled_date?->format('M d, Y'),
                'scheduled_time_window' => $assignment->scheduled_time_window,
                'assigned_personnel' => $assignment->personnel ? [
                    'id' => $assignment->personnel->id,
                    'name' => $assignment->personnel->name,
                    'role' => $assignment->personnel->role,
                    'contact' => $assignment->personnel->contact_number,
                ] : null,
                'picked_up_at' => $assignment->picked_up_at?->format('M d, Y H:i A'),
                'picked_up_by_name' => $assignment->pickedUpBy?->name,
                'attempt_count' => $assignment->attempt_count,
                'last_attempt_at' => $assignment->last_attempt_at?->format('M d, Y H:i A'),
                'cancellation_reason' => $assignment->cancellation_reason,
                'failure_reason' => $assignment->failure_reason,
                'seller' => $sellerDetails,
                'items_count' => $order->items->count(),
            ],
            'history' => $history,
        ]);
    }

    /**
     * Schedule pickup.
     */
    public function schedule(Request $request, $id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $request->validate([
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time_window' => 'required|string|max:50',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $user->id)
            ->where('assignment_status', 'accepted')
            ->findOrFail($id);

        if (!$assignment->canTransitionTo('scheduled')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot schedule pickup in current status.',
            ], 400);
        }

        $assignment->update([
            'pickup_status' => 'scheduled',
            'scheduled_date' => $request->scheduled_date,
            'scheduled_time_window' => $request->scheduled_time_window,
        ]);

        $assignment->addHistory('re-assigned', $actor->id, "Pickup scheduled for {$request->scheduled_date} {$request->scheduled_time_window}");

        return response()->json([
            'success' => true,
            'message' => 'Pickup scheduled successfully!',
        ]);
    }

    /**
     * Assign personnel.
     */
    public function assignPersonnel(Request $request, $id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $request->validate([
            'personnel_id' => 'required|exists:courier_personnel,id',
        ]);

        // Shared rules (same as the courier app): rider personnel of this courier
        // with an active rider-app account; pickup not yet picked up / cancelled.
        // The assignment row is locked so a rider scan cannot race the reassign.
        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user, $actor, $id) {
            $assignment = ShipmentAssignment::where('courier_id', $user->id)
                ->where('assignment_status', 'accepted')
                ->lockForUpdate()
                ->findOrFail($id);

            $check = \App\Services\PickupAssignmentRules::check($user->id, (int) $request->personnel_id, $assignment);
            if (! $check['ok']) {
                return response()->json(['success' => false, 'message' => $check['message']], $check['status']);
            }
            $personnel = $check['personnel'];

            $assignment->update([
                'assigned_personnel_id' => $personnel->id,
            ]);

            // 're-assigned' (same as the courier app): 'personnel_assigned' is not in the
            // shipment_assignment_history.action enum and made this request fail.
            $assignment->addHistory('re-assigned', $actor->id, "Assigned to {$personnel->name}");

            return response()->json([
                'success' => true,
                'message' => 'Personnel assigned successfully!',
            ]);
        });
    }

    /**
     * Reschedule pickup.
     */
    public function reschedule(Request $request, $id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $request->validate([
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time_window' => 'required|string|max:50',
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'Please provide a reason for rescheduling.',
            'reason.min' => 'Reason must be at least 10 characters.',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $user->id)
            ->where('assignment_status', 'accepted')
            ->findOrFail($id);

        if (!in_array($assignment->pickup_status, ['scheduled', 'failed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Can only reschedule from scheduled or failed status.',
            ], 400);
        }

        $assignment->update([
            'pickup_status' => 'scheduled',
            'scheduled_date' => $request->scheduled_date,
            'scheduled_time_window' => $request->scheduled_time_window,
        ]);

        $assignment->addHistory(
            're-assigned', // schema-safe enum value (assigned|accepted|rejected|re-assigned); wording kept in notes
            $actor->id,
            "Rescheduled to {$request->scheduled_date} {$request->scheduled_time_window}. Reason: {$request->reason}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Pickup rescheduled successfully!',
        ]);
    }

    /**
     * Cancel pickup.
     */
    public function cancel(Request $request, $id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'Please provide a reason for cancellation.',
            'reason.min' => 'Reason must be at least 10 characters.',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $user->id)
            ->where('assignment_status', 'accepted')
            ->findOrFail($id);

        if (!$assignment->canTransitionTo('cancelled')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel pickup in current status.',
            ], 400);
        }

        $reason = trim($request->reason);
        if (empty($reason)) {
            return response()->json([
                'success' => false,
                'message' => 'Cancellation reason cannot be empty or whitespace only.',
            ], 400);
        }

        $assignment->update([
            'pickup_status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        $assignment->addHistory('rejected', $actor->id, "Pickup cancelled: {$reason}");

        return response()->json([
            'success' => true,
            'message' => 'Pickup cancelled.',
        ]);
    }

    /**
     * Record failed pickup attempt.
     */
    public function recordFailed(Request $request, $id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'Please provide a reason for the failed attempt.',
            'reason.min' => 'Reason must be at least 10 characters.',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $user->id)
            ->where('assignment_status', 'accepted')
            ->findOrFail($id);

        if (!$assignment->canTransitionTo('failed')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot record failed attempt in current status.',
            ], 400);
        }

        $reason = trim($request->reason);
        if (empty($reason)) {
            return response()->json([
                'success' => false,
                'message' => 'Failure reason cannot be empty or whitespace only.',
            ], 400);
        }

        $attemptCount = $assignment->attempt_count + 1;

        $assignment->update([
            'pickup_status' => 'failed',
            'failure_reason' => $reason,
            'attempt_count' => $attemptCount,
            'last_attempt_at' => now(),
        ]);

        $assignment->addHistory('rejected', $actor->id, "Attempt #{$attemptCount} failed. Reason: {$reason}");

        $warning = $attemptCount >= 3 
            ? "This is attempt #{$attemptCount}. Consider cancelling if pickup cannot be completed." 
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Failed pickup attempt recorded.',
            'attempt_count' => $attemptCount,
            'warning' => $warning,
        ]);
    }

    /**
     * Confirm pickup / scan waybill.
     */
    public function confirmPickup(Request $request, $id)
    {
        $actor = auth()->user();
        $user = \App\Support\CourierCompanyResolver::scope($actor);

        $request->validate([
            'scanned_waybill' => 'required|string',
        ], [
            'scanned_waybill.required' => 'Please enter or scan the waybill number.',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $user->id)
            ->where('assignment_status', 'accepted')
            ->with('order')
            ->findOrFail($id);

        // Already picked up (e.g. the rider scanned a moment ago): nothing to do, nothing doubled.
        if ($assignment->pickup_status === 'picked_up') {
            return response()->json(['success' => true, 'message' => 'Pickup was already confirmed.', 'idempotent' => true]);
        }

        if (!$assignment->canTransitionTo('picked_up')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot confirm pickup in current status. Must be scheduled first.',
            ], 400);
        }

        // Verify waybill matches
        $scannedWaybill = trim($request->scanned_waybill);
        $actualWaybill = $assignment->order->waybill_number;

        if ($scannedWaybill !== $actualWaybill) {
            return response()->json([
                'success' => false,
                'message' => "Waybill mismatch! Expected: {$actualWaybill}",
            ], 400);
        }

        $claimed = DB::transaction(function () use ($assignment, $actor) {
            // Row lock + re-check: a rider scan and this confirm can never both write.
            $locked = ShipmentAssignment::whereKey($assignment->id)->lockForUpdate()->first();
            if (! $locked || $locked->pickup_status === 'picked_up' || ! $locked->canTransitionTo('picked_up')) {
                return false;
            }
            $locked->update([
                'pickup_status' => 'picked_up',
                'picked_up_at' => now(),
                'picked_up_by' => $actor->id,
            ]);
            $locked->addHistory('accepted', $actor->id, 'Parcel picked up and scanned');

            return true;
        });
        if (! $claimed) {
            return response()->json(['success' => true, 'message' => 'Pickup was already confirmed.', 'idempotent' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pickup confirmed! Parcel is now ready for sorting.',
        ]);
    }
}
