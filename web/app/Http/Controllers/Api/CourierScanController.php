<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierFacility;
use App\Models\Order;
use App\Models\ShipmentScan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourierScanController extends CourierBaseController
{
    /**
     * GET /api/courier-app/facilities
     * Active facilities belonging to the authenticated courier.
     */
    public function facilities(Request $request): JsonResponse
    {
        $query = CourierFacility::with('parentFacility')
            ->where('courier_id', $request->user()->id);

        // Default (backward compatible): only Active facilities, as used by
        // the scanning dropdown. Facilities management can pass status=all.
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        } elseif (! $request->filled('status') && ! $request->boolean('include_inactive')) {
            $query->where('status', 'Active');
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('facility_type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('facility_name', 'like', "%{$search}%")
                  ->orWhere('facility_code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $facilities = $query->orderBy('facility_type')
            ->orderBy('facility_name')
            ->get()
            ->map(fn ($facility) => [
                'id'              => $facility->id,
                'facility_name'   => $facility->facility_name,
                'facility_code'   => $facility->facility_code,
                'facility_type'   => $facility->facility_type,
                'parent_facility' => $facility->parentFacility?->facility_name,
                'parent_facility_id' => $facility->parent_facility_id,
                'status'          => $facility->status,
                'region'          => $facility->region,
                'province'        => $facility->province,
                'city'            => $facility->city,
                'address'         => $facility->address,
                'manager'         => $facility->manager_name,
                'contact'         => $facility->contact_number,
                'coverage'        => $facility->coverage_cities,
            ]);

        return response()->json(['data' => $facilities]);
    }

    /**
     * GET /api/courier-app/parcel/{waybill}
     * Look up a parcel by waybill number.
     */
    public function show(Request $request, string $waybill): JsonResponse
    {
        $order = Order::where('waybill_number', $waybill)
            ->with(['items.product'])
            ->first();

        if (! $order) {
            return response()->json(['message' => "No parcel found with waybill: {$waybill}"], 404);
        }

        $totalWeight = $order->items->sum(fn ($i) => ($i->product->weight ?? 0) * $i->quantity);

        $destination = trim(implode(', ', array_filter([
            $order->shipping_municipality_city ?? null,
            $order->shipping_province ?? null,
        ])));

        if ($destination === '') {
            $parts = array_map('trim', explode(',', (string) $order->shipping_address));
            if (count($parts) >= 2) {
                $destination = implode(', ', array_slice($parts, -2));
            } elseif (count($parts) === 1) {
                $destination = $parts[0];
            }
        }

        $scans = ShipmentScan::with('facility')
            ->where('order_id', $order->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($scan) => [
                'scan_type'    => $scan->scan_type,
                'facility'     => $scan->facility->facility_name ?? 'Unknown facility',
                'facility_code'=> $scan->facility->facility_code ?? null,
                'scanned_by'   => $scan->scanned_by,
                'notes'        => $scan->notes,
                'scanned_at'   => $scan->created_at->format('M d, Y H:i A'),
            ]);

        return response()->json([
            'data' => [
                'waybill_number'    => $order->waybill_number,
                'order_number'      => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'buyer_name'        => $order->shipping_name,
                'buyer_address'     => $order->shipping_address,
                'buyer_phone'       => $order->shipping_phone,
                'destination'       => $destination !== '' ? $destination : 'Not provided',
                'weight'            => round((float) $totalWeight, 2),
                'payment_method'    => strtoupper($order->payment_method ?? ''),
                'total_amount'      => $order->total,
                'status'            => $order->status,
                'tracking_status'   => $order->tracking_status,
                'tracking_message'  => $order->tracking_message,
                'current_facility'  => $order->current_facility_id
                    ? CourierFacility::find($order->current_facility_id)?->facility_name
                    : null,
                'history'           => $scans,
            ],
        ]);
    }

    /**
     * POST /api/courier-app/scan-parcel
     * Record a scan at a facility; mirrors the web scan-parcel logic exactly.
     */
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'waybill_number' => ['required', 'string'],
            'facility_id'    => ['required', 'integer', 'exists:courier_facilities,id'],
        ]);

        $courier  = $request->user();
        $facility = CourierFacility::findOrFail($request->facility_id);

        if ($facility->courier_id !== $courier->id) {
            return response()->json(['message' => 'This facility does not belong to your company.'], 403);
        }

        $order = Order::where('waybill_number', $request->waybill_number)->first();

        if (! $order) {
            return response()->json(['message' => "No parcel found with waybill: {$request->waybill_number}"], 404);
        }

        if ($order->assigned_courier_id && $order->assigned_courier_id !== $courier->id) {
            return response()->json(['message' => 'This parcel is assigned to a different courier company.'], 403);
        }

        ShipmentScan::create([
            'order_id'       => $order->id,
            'waybill_number' => $request->waybill_number,
            'courier_id'     => $courier->id,
            'facility_id'    => $facility->id,
            'scan_type'      => 'received',
            'scanned_by'     => trim(($courier->contact_first_name ?? $courier->first_name ?? '')
                                . ' ' . ($courier->contact_last_name ?? $courier->last_name ?? '')),
        ]);

        $typeLabel = match ($facility->facility_type) {
            'main_hub'     => 'Main Hub',
            'sorting_hub'  => 'Sorting Hub',
            'branch'       => 'Branch',
            default        => ucfirst(str_replace('_', ' ', $facility->facility_type)),
        };

        $trackingMsg = "Parcel scanned at {$facility->facility_name} ({$typeLabel})"
            . ($facility->city ? " in {$facility->city}" : '');

        $order->update(['current_facility_id' => $facility->id]);
        $order->updateTracking('scanned_at_facility', $trackingMsg);

        return response()->json([
            'message'        => "Parcel received at {$facility->facility_name}.",
            'waybill_number' => $order->waybill_number,
        ]);
    }
}
