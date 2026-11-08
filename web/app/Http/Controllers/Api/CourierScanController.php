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
        $facilities = CourierFacility::where('courier_id', $request->user()->id)
            ->where('status', 'Active')
            ->orderBy('facility_type')
            ->orderBy('facility_name')
            ->get(['id', 'facility_name', 'facility_code', 'facility_type', 'city', 'region']);

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

        return response()->json([
            'data' => [
                'waybill_number' => $order->waybill_number,
                'order_number'   => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'buyer_name'     => $order->shipping_name,
                'buyer_address'  => $order->shipping_address,
                'buyer_phone'    => $order->shipping_phone,
                'destination'    => trim(implode(', ', array_filter([
                    $order->shipping_municipality_city,
                    $order->shipping_province,
                ]))),
                'weight'          => round($totalWeight, 2),
                'payment_method'  => strtoupper($order->payment_method ?? ''),
                'total_amount'    => $order->total,
                'status'          => $order->status,
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
