<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierShipmentController extends CourierBaseController
{
    /**
     * GET /api/courier-app/shipments
     * List assignments scoped to the authenticated courier.
     */
    public function index(Request $request): JsonResponse
    {
        $courier = $request->user();

        $query = ShipmentAssignment::with([
            'order.items.product',
            'order.buyer',
        ])->where('courier_id', $courier->id);

        // Same filters as the web IncomingShipmentsController.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('waybill_number', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('assignment_status', $request->status);
        }

        if ($request->filled('seller')) {
            $query->whereHas('order.items', function ($q) use ($request) {
                $q->where('seller_id', $request->seller);
            });
        }

        if ($request->filled('destination')) {
            $destination = $request->destination;
            $query->whereHas('order', function ($q) use ($destination) {
                $q->where('shipping_address', 'like', "%{$destination}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('assigned_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('assigned_at', '<=', $request->date_to);
        }

        $perPage   = min((int) ($request->per_page ?? 20), 50);
        $paginated = $query->orderBy('assigned_at', 'desc')->paginate($perPage);

        $items = $paginated->map(fn ($a) => $this->summarise($a));

        // Summary stats — identical counters to the web page.
        $base = fn () => ShipmentAssignment::where('courier_id', $courier->id);
        $stats = [
            'total'    => $base()->count(),
            'pending'  => $base()->where('assignment_status', 'pending')->count(),
            'accepted' => $base()->where('assignment_status', 'accepted')->count(),
            'rejected' => $base()->where('assignment_status', 'rejected')->count(),
            'expiring' => $base()->where('assignment_status', 'pending')
                ->where('acceptance_deadline', '>', now())
                ->where('acceptance_deadline', '<=', now()->addHours(2))
                ->count()
                + $base()->where('assignment_status', 'pending')
                ->where('acceptance_deadline', '<', now())
                ->count(),
        ];

        // Unique sellers — same list used by the web filter dropdown.
        $sellers = ShipmentAssignment::where('courier_id', $courier->id)
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
            ->filter()
            ->values();

        return response()->json([
            'data'    => $items,
            'stats'   => $stats,
            'sellers' => $sellers,
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * GET /api/courier-app/shipments/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $assignment = ShipmentAssignment::with([
            'order.items.product',
            'order.buyer',
            'history',
            'assigner',
        ])
        ->where('courier_id', $request->user()->id)
        ->find($id);

        if (! $assignment) {
            return response()->json(['message' => 'Shipment not found.'], 404);
        }

        $order  = $assignment->order;
        $seller = $this->sellerFromOrder($order);
        $buyerDestination = $this->buyerDestinationFromAddress($order->shipping_address);

        $history = $assignment->history->map(fn ($h) => [
            'action'       => $h->action,
            'performed_by' => $h->performer->name ?? 'System',
            'notes'        => $h->notes,
            'created_at'   => $h->created_at->format('M d, Y H:i A'),
        ]);

        return response()->json([
            'data' => [
                'id'                  => $assignment->id,
                'waybill_number'      => $order->waybill_number,
                'order_number'        => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'assignment_status'   => $assignment->assignment_status,
                'pickup_status'       => $assignment->pickup_status,
                'assigned_at'         => $assignment->assigned_at->format('M d, Y H:i A'),
                'acceptance_deadline' => $assignment->acceptance_deadline->format('M d, Y H:i A'),
                'accepted_at'         => $assignment->accepted_at?->format('M d, Y H:i A'),
                'rejected_at'         => $assignment->rejected_at?->format('M d, Y H:i A'),
                'rejection_reason'    => $assignment->rejection_reason,
                'weight'              => $assignment->weight ?? 'Not provided',
                'dimensions'          => $assignment->dimensions ?? 'Not provided',
                'pickup_instructions' => $assignment->pickup_instructions ?? 'No special instructions',
                'total_amount'        => $order->total,
                'payment_method'      => $order->payment_method,
                'items_count'         => $order->items->count(),
                'seller'              => $seller,
                'shipping_address'    => $order->shipping_address,
                'buyer_destination'   => $buyerDestination,
                'assigned_by'         => $assignment->assigner->name ?? 'System',
                'is_overdue'          => $assignment->isOverdue(),
                'is_expiring_soon'    => $assignment->isExpiringSoon(),
                'history'             => $history,
            ],
        ]);
    }

    /**
     * POST /api/courier-app/shipments/{id}/accept
     */
    public function accept(Request $request, int $id): JsonResponse
    {
        $assignment = ShipmentAssignment::where('courier_id', $request->user()->id)->find($id);

        if (! $assignment) {
            return response()->json(['message' => 'Shipment not found.'], 404);
        }

        if (! $assignment->isPending()) {
            return response()->json([
                'message' => 'This assignment has already been processed.',
            ], 422);
        }

        $assignment->accept($request->user()->id);

        // Mirror the web controller's tracking update.
        $order = $assignment->order;
        $order->update(['courier_accepted_at' => now()]);
        $order->updateTracking('accepted_courier', 'Accepted by courier, in transit to nearest sorting hub');

        return response()->json([
            'message' => 'Assignment accepted successfully.',
            'data'    => [
                'id'               => $assignment->id,
                'assignment_status'=> $assignment->fresh()->assignment_status,
                'accepted_at'      => $assignment->accepted_at->format('M d, Y H:i A'),
            ],
        ]);
    }

    /**
     * POST /api/courier-app/shipments/{id}/reject
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'reason.required' => 'Please provide a reason for rejection.',
            'reason.min'      => 'Reason must be at least 10 characters.',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $request->user()->id)->find($id);

        if (! $assignment) {
            return response()->json(['message' => 'Shipment not found.'], 404);
        }

        if (! $assignment->isPending()) {
            return response()->json([
                'message' => 'This assignment has already been processed.',
            ], 422);
        }

        $assignment->reject($request->user()->id, trim($request->reason));

        return response()->json([
            'message' => 'Assignment rejected.',
            'data'    => [
                'id'               => $assignment->id,
                'assignment_status'=> $assignment->fresh()->assignment_status,
                'rejected_at'      => $assignment->rejected_at->format('M d, Y H:i A'),
                'rejection_reason' => $assignment->rejection_reason,
            ],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function summarise(ShipmentAssignment $a): array
    {
        $order  = $a->order;
        $seller = $this->sellerFromOrder($order);

        return [
            'id'                  => $a->id,
            'waybill_number'      => $order->waybill_number,
            'order_number'        => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            'seller_name'         => $seller['name'] ?? 'N/A',
            'seller_id'           => $seller['id'] ?? null,
            'pickup_address'      => $seller['address'] ?? 'Not provided',
            'destination'         => $this->destinationSummary($order->shipping_address),
            'weight'              => $a->weight ?? 'Not provided',
            'dimensions'          => $a->dimensions ?? 'Not provided',
            'assignment_status'   => $a->assignment_status,
            'pickup_status'       => $a->pickup_status,
            'assigned_at'         => $a->assigned_at->format('M d, Y H:i'),
            'assigned_date'       => $a->assigned_at->format('M d, Y H:i'),
            'is_overdue'          => $a->isOverdue(),
            'is_expiring_soon'    => $a->isExpiringSoon(),
        ];
    }

    private function sellerFromOrder($order): ?array
    {
        if ($order->items->isEmpty()) {
            return null;
        }
        $firstItem = $order->items->first();
        $seller    = User::find($firstItem->seller_id);
        if (! $seller) {
            return null;
        }

        $address = trim(implode(', ', array_filter([
            $seller->street_address,
            $seller->municipality_city,
            $seller->province,
        ])));

        return [
            'id'      => $seller->id,
            'name'    => $seller->business_name ?? $seller->name,
            'email'   => $seller->email,
            'phone'   => $seller->contact_number ?? 'Not provided',
            'address' => $address !== '' ? $address : 'Not provided',
            'city'    => $seller->municipality_city ?? 'Not provided',
            'province'=> $seller->province ?? 'Not provided',
        ];
    }

    /**
     * Destination label shown on the web list/card: "City, Barangay".
     */
    private function destinationSummary(?string $address): string
    {
        $parts = $this->addressParts($address);

        if (count($parts) >= 3) {
            $barangay = preg_replace('/^(Brgy\.?|Barangay)\s+/i', '', $parts[1] ?? '');
            $city     = preg_replace('/^(City of|Municipality of)\s+/i', '', $parts[count($parts) - 2] ?? '');

            if ($city && $barangay) {
                return "{$city}, {$barangay}";
            }
            if ($city) {
                return $city;
            }
        }

        if (count($parts) >= 2) {
            return $parts[count($parts) - 2];
        }

        return $parts[0] ?? 'Not provided';
    }

    /**
     * Limited buyer destination shown on the web detail modal.
     */
    private function buyerDestinationFromAddress(?string $address): array
    {
        $parts = $this->addressParts($address);
        $out = [
            'city'     => 'Not provided',
            'barangay' => 'Not provided',
            'province' => 'Not provided',
            'region'   => 'Not provided',
        ];

        if (count($parts) >= 4) {
            $out['barangay'] = preg_replace('/^(Brgy\.?|Barangay)\s+/i', '', $parts[1] ?? 'Not provided');
            $out['city']     = preg_replace('/^(City of|Municipality of)\s+/i', '', $parts[count($parts) - 2] ?? 'Not provided');

            $provinceOrRegion = $parts[count($parts) - 1] ?? '';
            if (preg_match('/(Region|NCR|CALABARZON|Metro Manila)/i', $provinceOrRegion)) {
                $out['region'] = $provinceOrRegion;
            } else {
                $out['province'] = $provinceOrRegion;
            }
        } elseif (count($parts) >= 2) {
            $out['city']     = $parts[count($parts) - 1];
            $out['barangay'] = $parts[count($parts) - 2];
        }

        return $out;
    }

    private function addressParts(?string $address): array
    {
        if (! $address) {
            return [];
        }

        return array_map('trim', explode(',', $address));
    }
}
