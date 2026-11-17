<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\CourierFacility;
use App\Models\Order;
use App\Models\ShipmentScan;
use App\Services\ScanRouteGuard;
use App\Support\CourierCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Sorting & Transfers (courier company, web). Real data from the facility scans:
 *   GET  /courier/transfers-data?facility_id=   parcels currently at a facility + recent transfers + the company's facilities
 *   POST /courier/transfers                     {waybill_number, to_facility_id}: move a parcel to the next facility
 *
 * A transfer is a scan of type "transferred" at the destination facility, validated by ScanRouteGuard like every other
 * scan (active facility, parcel status, sequence, authorised checkpoint on the route). Rejected transfers change nothing
 * and are written to scan_attempts.
 */
class TransferController extends Controller
{
    private function company(Request $request): int
    {
        return (int) CourierCompanyResolver::scope($request->user())->id;
    }

    public function data(Request $request): JsonResponse
    {
        $cid = $this->company($request);
        $facilities = CourierFacility::where('courier_id', $cid)->orderBy('facility_name')->get(['id', 'facility_name', 'facility_type', 'status', 'city']);
        $facilityId = (int) $request->query('facility_id', 0);

        $parcels = Order::where('assigned_courier_id', $cid)->whereNotNull('current_facility_id')
            ->whereNotIn('status', ['cancelled', 'failed', 'completed', 'delivered'])
            ->when($facilityId, fn ($q) => $q->where('current_facility_id', $facilityId))
            ->orderByDesc('tracking_updated_at')->limit(200)->get()
            ->map(fn (Order $o) => [
                'order_id' => $o->id, 'waybill' => $o->waybill_number, 'facility_id' => $o->current_facility_id,
                'destination' => $o->recipient()['city'] ?? null, 'status' => $o->tracking_message ?: $o->status,
                'since' => $o->tracking_updated_at?->toISOString(),
            ]);

        $recent = ShipmentScan::where('courier_id', $cid)->where('scan_type', 'transferred')->with('facility:id,facility_name')->latest('id')->limit(25)->get()
            ->map(fn ($s) => ['waybill' => $s->waybill_number, 'to' => $s->facility?->facility_name, 'by' => $s->scanned_by, 'notes' => $s->notes, 'at' => $s->created_at?->toISOString()]);

        return response()->json(['facilities' => $facilities, 'parcels' => $parcels, 'recent' => $recent]);
    }

    public function transfer(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['waybill_number' => ['required', 'string'], 'to_facility_id' => ['required', 'integer', 'exists:courier_facilities,id']]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first()], 422);
        }
        $cid = $this->company($request);
        $actor = $request->user();
        $to = CourierFacility::findOrFail($v->validated()['to_facility_id']);
        if ((int) $to->courier_id !== $cid) {
            return response()->json(['message' => 'That facility does not belong to your company.'], 403);
        }

        $order = Order::where('waybill_number', $v->validated()['waybill_number'])->first();
        if (! $order) {
            ScanRouteGuard::logRejected(null, $v->validated()['waybill_number'], $to, 'transferred', 'Waybill not found', $cid);

            return response()->json(['message' => 'No parcel found with that waybill number.'], 404);
        }
        if ((int) $order->assigned_courier_id !== $cid) {
            ScanRouteGuard::logRejected($order, null, $to, 'transferred', 'Parcel not assigned to this company', $cid);

            return response()->json(['message' => 'This parcel is not assigned to your company.'], 403);
        }
        if (! $order->current_facility_id) {
            ScanRouteGuard::logRejected($order, null, $to, 'transferred', 'Parcel has not been received at a facility yet', $cid);

            return response()->json(['message' => 'This parcel has not been received at any facility yet. Scan it in first.'], 422);
        }
        if ((int) $order->current_facility_id === (int) $to->id) {
            ScanRouteGuard::logRejected($order, null, $to, 'transferred', 'Transfer to the facility the parcel is already at', $cid);

            return response()->json(['message' => 'The parcel is already at ' . $to->facility_name . '.'], 422);
        }
        if ($error = ScanRouteGuard::check($order, $to, 'transferred')) {
            return response()->json(['message' => $error], 422);
        }

        $from = CourierFacility::find($order->current_facility_id);
        DB::transaction(function () use ($order, $to, $from, $cid, $actor) {
            ShipmentScan::create([
                'order_id' => $order->id, 'waybill_number' => $order->waybill_number, 'courier_id' => $cid, 'facility_id' => $to->id,
                'scan_type' => 'transferred', 'scanned_by' => trim(($actor->first_name ?? '') . ' ' . ($actor->last_name ?? '')) ?: $actor->name,
                'notes' => 'Transferred from ' . ($from?->facility_name ?? 'previous facility'),
            ]);
            $order->update(['current_facility_id' => $to->id]);
            $order->updateTracking('scanned_at_facility', 'Transferred from ' . ($from?->facility_name ?? 'previous facility') . " to {$to->facility_name}");
        });

        return response()->json(['message' => "Parcel transferred to {$to->facility_name}."]);
    }
}
