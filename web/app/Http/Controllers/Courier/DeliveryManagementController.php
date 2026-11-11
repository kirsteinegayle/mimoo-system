<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Api\CourierDeliveryController;
use App\Http\Controllers\Controller;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Web (Inertia) page for assigning delivery riders.
 *
 * Reuses Api\CourierDeliveryController for the rider list and the assign
 * rules (accepted assignment, order status, one job per order, ready rider),
 * so the web page and the courier app behave the same. Read-only on orders.
 */
class DeliveryManagementController extends Controller
{
    /** Same as CourierDeliveryController::ASSIGNABLE_ORDER_STATUSES (private there). */
    private const ASSIGNABLE_ORDER_STATUSES = ['in_transit', 'shipped'];

    public function index(Request $request)
    {
        $courier = $request->user();

        $pickupStatus = ShipmentAssignment::where('courier_id', $courier->id)
            ->where('assignment_status', 'accepted')
            ->orderBy('id')
            ->pluck('pickup_status', 'order_id'); // latest assignment per order wins
        $acceptedOrderIds = $pickupStatus->keys();

        // Orders ready for a rider, plus orders this courier already gave a delivery job.
        $orders = Order::whereIn('id', $acceptedOrderIds)
            ->where(fn ($q) => $q
                ->whereIn('status', self::ASSIGNABLE_ORDER_STATUSES)
                ->orWhereExists(fn ($s) => $s->select(DB::raw(1))->from('delivery_jobs')
                    ->whereColumn('delivery_jobs.order_id', 'orders.id')
                    ->where('delivery_jobs.courier_id', $courier->id)))
            ->orderByDesc('id')
            ->limit(200)
            ->get(['id', 'status', 'waybill_number', 'shipping_name', 'shipping_address', 'payment_method', 'payment_status', 'total', 'updated_at']);

        $jobs = DeliveryJob::whereIn('order_id', $orders->pluck('id'))
            ->with('personnel:id,name')
            ->orderBy('id')
            ->get()
            ->keyBy('order_id'); // latest job per order wins

        $riders = app(CourierDeliveryController::class)->riders($request)->getData(true)['data'] ?? [];

        return Inertia::render('courier/DeliveryManagement', [
            'auth' => ['user' => ['id' => $courier->id, 'name' => $courier->name, 'email' => $courier->email, 'account_type' => $courier->account_type]],
            'company' => ['name' => $courier->company_name ?? $courier->business_name ?? 'Courier Company', 'contact_person' => trim(($courier->contact_first_name ?? '') . ' ' . ($courier->contact_last_name ?? ''))],
            'orders' => $orders->map(function (Order $o) use ($jobs, $pickupStatus) {
                $job = $jobs->get($o->id);
                $pickedUp = ($pickupStatus[$o->id] ?? null) === 'picked_up';

                return [
                    'id' => $o->id,
                    'order_number' => 'MIM-' . str_pad((string) $o->id, 8, '0', STR_PAD_LEFT),
                    'waybill_number' => $o->waybill_number,
                    'status' => $o->status,
                    'shipping_name' => $o->shipping_name,
                    'shipping_address' => $o->shipping_address,
                    'payment_method' => $o->payment_method,
                    'cod_amount' => strtolower((string) $o->payment_method) === 'cod' && strtolower((string) $o->payment_status) !== 'paid'
                        ? (float) $o->total : 0.0,
                    'picked_up' => $pickedUp,
                    'assignable' => ! $job && $pickedUp && in_array($o->status, self::ASSIGNABLE_ORDER_STATUSES, true),
                    'job' => $job ? [
                        'id' => $job->id,
                        'status' => $job->status,
                        'rider_name' => $job->personnel?->name,
                        'assigned_at' => $job->assigned_at?->toIso8601String(),
                    ] : null,
                ];
            })->values(),
            'riders' => $riders,
        ]);
    }

    /** POST /courier/delivery-management/assign { order_id, personnel_id } */
    public function assign(Request $request)
    {
        /** @var JsonResponse $response */
        $response = app(CourierDeliveryController::class)->assign($request);
        $data = $response->getData(true);

        if ($response->getStatusCode() < 400) {
            $rider = $data['data']['rider_name'] ?? 'the rider';
            $order = $data['data']['order_number'] ?? 'the order';
            Inertia::flash('success', "Rider {$rider} assigned to {$order}.");
        } else {
            Inertia::flash('error', $data['message'] ?? 'Could not assign the rider. Please try again.');
        }

        return back(303);
    }
}
