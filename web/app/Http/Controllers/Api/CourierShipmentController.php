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

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('assignment_status', $request->status);
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
                'weight'              => $assignment->weight,
                'dimensions'          => $assignment->dimensions,
                'pickup_instructions' => $assignment->pickup_instructions,
                'total_amount'        => $order->total,
                'payment_method'      => $order->payment_method,
                'items_count'         => $order->items->count(),
                'seller'              => $seller,
                'shipping_address'    => $order->shipping_address,
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
            'destination'         => $order->shipping_municipality_city
                                        ?? $this->cityFromAddress($order->shipping_address),
            'assignment_status'   => $a->assignment_status,
            'pickup_status'       => $a->pickup_status,
            'assigned_at'         => $a->assigned_at->format('M d, Y H:i'),
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

        return [
            'id'      => $seller->id,
            'name'    => $seller->business_name ?? $seller->name,
            'email'   => $seller->email,
            'phone'   => $seller->contact_number ?? 'Not provided',
            'address' => trim(implode(', ', array_filter([
                $seller->street_address,
                $seller->municipality_city,
                $seller->province,
            ]))),
        ];
    }

    private function cityFromAddress(?string $address): string
    {
        if (! $address) {
            return 'Not provided';
        }
        $parts = array_map('trim', explode(',', $address));
        return count($parts) >= 2 ? $parts[count($parts) - 2] : ($parts[0] ?? 'Not provided');
    }
}
