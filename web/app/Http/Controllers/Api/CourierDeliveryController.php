<?php

namespace App\Http\Controllers\Api;

use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\Rider;
use App\Models\RiderNotification;
use App\Models\ShipmentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Courier assigns the last-mile DELIVERY rider (/api/courier-app/*).
 *
 *   GET  /delivery-riders  → riders of the logged-in courier that can take jobs
 *   POST /delivery-jobs    → creates one delivery_jobs row for an order
 *
 * Route middleware: ['auth:sanctum', 'courier.role'] (same group as pickups).
 *
 * A "ready" rider uses the same rules as RiderAuthController::login:
 *   users.role = rider, users.status = approved,
 *   users.verification_status = verified,
 *   courier_personnel.status = active with a user_id,
 *   courier_personnel.courier_id = this courier.
 *
 * The delivery_jobs row uses the same fields/status as rider:demo-delivery.
 * Never writes orders.status / orders.payment_status / tracking.
 */
class CourierDeliveryController extends CourierBaseController
{
    /** Order statuses a delivery rider can be assigned to. */
    private const ASSIGNABLE_ORDER_STATUSES = ['in_transit', 'shipped'];

    /** GET /api/courier-app/delivery-riders */
    public function riders(Request $request): JsonResponse
    {
        $courier = \App\Support\CourierCompanyResolver::scope($request->user());

        $personnel = $this->readyRiders($courier->id)
            ->with('user:id,first_name,last_name,name,email')
            ->orderBy('name')
            ->get();

        // Vehicle comes from the approved rider application (link: riders.email = users.email).
        $vehicles = Rider::whereIn('email', $personnel->pluck('user.email')->filter()->map(fn ($e) => strtolower($e))->all())
            ->where('verification_status', 'approved')
            ->where('courier_company_id', $courier->id)
            ->pluck('vehicle_type', 'email')
            ->mapWithKeys(fn ($v, $e) => [strtolower($e) => $v]);

        $activeCounts = DeliveryJob::whereIn('personnel_id', $personnel->pluck('id'))
            ->whereIn('status', DeliveryJob::ACTIVE_STATUSES)
            ->selectRaw('personnel_id, COUNT(*) AS c')
            ->groupBy('personnel_id')
            ->pluck('c', 'personnel_id');

        return response()->json([
            'data' => $personnel->map(fn (CourierPersonnel $p) => [
                'personnel_id'       => $p->id,
                'user_id'            => $p->user_id,
                'name'               => $p->name ?: trim(($p->user->first_name ?? '') . ' ' . ($p->user->last_name ?? '')),
                'vehicle_type'       => $vehicles[strtolower((string) ($p->user->email ?? ''))] ?? null,
                'active_delivery_jobs' => (int) ($activeCounts[$p->id] ?? 0),
            ])->values(),
            // Additive: only checked-in riders are listed.
            'meta' => [
                'online_only' => true,
                'message'     => $personnel->isEmpty() ? 'No riders are online right now.' : null,
            ],
        ]);
    }

    /**
     * GET /api/courier-app/delivery-orders
     *
     * Orders for the Delivery Management screen of the courier app. Same
     * query and row shape as the web page (Courier\DeliveryManagementController
     * ::index): orders with an accepted assignment of THIS courier that are
     * in_transit / shipped, plus orders this courier already gave a job.
     * "assignable" = picked up from the seller, no job yet, assignable status.
     * Read-only.
     */
    public function orders(Request $request): JsonResponse
    {
        $courier = \App\Support\CourierCompanyResolver::scope($request->user());

        $pickupStatus = ShipmentAssignment::where('courier_id', $courier->id)
            ->where('assignment_status', 'accepted')
            ->orderBy('id')
            ->pluck('pickup_status', 'order_id'); // latest assignment per order wins

        $orders = Order::whereIn('id', $pickupStatus->keys())
            ->where(fn ($q) => $q
                ->whereIn('status', self::ASSIGNABLE_ORDER_STATUSES)
                ->orWhereExists(fn ($s) => $s->select(DB::raw(1))->from('delivery_jobs')
                    ->whereColumn('delivery_jobs.order_id', 'orders.id')
                    ->where('delivery_jobs.courier_id', $courier->id)))
            ->orderByDesc('id')
            ->limit(200)
            ->get(['id', 'status', 'waybill_number', 'shipping_name', 'shipping_address', 'payment_method', 'payment_status', 'total']);

        $jobs = DeliveryJob::whereIn('order_id', $orders->pluck('id'))
            ->with('personnel:id,name')
            ->orderBy('id')
            ->get()
            ->keyBy('order_id'); // latest job per order wins

        $rows = $orders->map(function (Order $o) use ($jobs, $pickupStatus) {
            $job      = $jobs->get($o->id);
            $pickedUp = ($pickupStatus[$o->id] ?? null) === 'picked_up';

            return [
                'id'               => $o->id,
                'order_number'     => 'MIM-' . str_pad((string) $o->id, 8, '0', STR_PAD_LEFT),
                'waybill_number'   => $o->waybill_number,
                'status'           => $o->status,
                'shipping_name'    => $o->shipping_name,
                'shipping_address' => $o->shipping_address,
                'payment_method'   => $o->payment_method,
                'cod_amount'       => strtolower((string) $o->payment_method) === 'cod' && ! in_array(strtolower((string) $o->payment_status), ['paid', 'refunded'], true)
                    ? (float) $o->total : 0.0,
                'pickup_status'    => $pickupStatus[$o->id] ?? null,
                'picked_up'        => $pickedUp,
                'assignable'       => ! $job && $pickedUp && in_array($o->status, self::ASSIGNABLE_ORDER_STATUSES, true),
                'job'              => $job ? [
                    'id'          => $job->id,
                    'status'      => $job->status,
                    'rider_name'  => $job->personnel?->name,
                    'assigned_at' => $job->assigned_at?->toIso8601String(),
                ] : null,
            ];
        })->values();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'assignable' => $rows->where('assignable', true)->count(),
                'awaiting_pickup' => $rows->where('picked_up', false)->whereNull('job')->count(),
                'with_rider' => $rows->whereNotNull('job')->count(),
            ],
        ]);
    }

    /** POST /api/courier-app/delivery-jobs { order_id, personnel_id } */
    public function assign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id'     => ['required', 'integer'],
            'personnel_id' => ['required', 'integer'],
        ]);

        $courier = \App\Support\CourierCompanyResolver::scope($request->user());

        $actorId = (int) $request->user()->id;

        return DB::transaction(function () use ($data, $courier, $actorId) {
            $order = Order::whereKey($data['order_id'])->lockForUpdate()->first();
            if (! $order) {
                return response()->json(['message' => 'Order not found.'], 404);
            }

            // (a) Accepted shipment assignment for THIS courier.
            $accepted = ShipmentAssignment::where('order_id', $order->id)
                ->where('courier_id', $courier->id)
                ->where('assignment_status', 'accepted')
                ->latest('id')
                ->first();
            if (! $accepted) {
                return response()->json(['message' => 'This order is not assigned to your courier company.'], 403);
            }

            // (a2) The parcel must already be picked up from the seller.
            if ($accepted->pickup_status !== 'picked_up') {
                return response()->json(['message' => 'Parcel must be picked up before assigning a rider.'], 422);
            }

            // (b) Order status.
            if (! in_array($order->status, self::ASSIGNABLE_ORDER_STATUSES, true)) {
                return response()->json([
                    'message' => "A delivery rider can only be assigned to orders that are in transit or shipped (this order is {$order->status}).",
                ], 422);
            }

            // (c) One job per order: block an active job, and also a finished
            // one (delivered / returned) since orders.status is not changed by
            // the rider flow and would otherwise allow a second delivery.
            $existing = DeliveryJob::where('order_id', $order->id)->latest('id')->first();
            if ($existing) {
                $msg = in_array($existing->status, DeliveryJob::ACTIVE_STATUSES, true)
                    ? 'This order already has an active delivery job.'
                    : "This order already has a delivery job ({$existing->status}).";
                return response()->json(['message' => $msg, 'delivery_job_id' => $existing->id], 422);
            }

            // (d) Rider: same courier first (404), then readiness (422).
            $personnel = CourierPersonnel::whereKey($data['personnel_id'])
                ->where('courier_id', $courier->id)
                ->first();
            if (! $personnel) {
                return response()->json(['message' => 'Rider not found in your courier company.'], 404);
            }
            if (! $this->readyRiders($courier->id)->whereKey($personnel->id)->exists()) {
                return response()->json([
                    'message' => 'This rider cannot take deliveries. The rider must be active, approved and verified with a linked rider account, and online in the rider app.',
                ], 422);
            }

            $isCodUnpaid = strtolower((string) $order->payment_method) === 'cod'
                && ! in_array(strtolower((string) $order->payment_status), ['paid', 'refunded'], true);

            $job = DeliveryJob::create([
                'order_id'      => $order->id,
                'rider_user_id' => $personnel->user_id,
                'personnel_id'  => $personnel->id,
                'courier_id'    => $courier->id,
                'facility_id'   => $order->current_facility_id, // may be null
                'assigned_by'   => $actorId,
                'status'        => DeliveryJob::STATUS_ASSIGNED,
                'cod_amount'    => $isCodUnpaid ? (float) $order->total : 0.0,
                'assigned_at'   => now(),
            ]);

            RiderNotification::notify(
                $personnel->user_id,
                'delivery_assigned',
                'New delivery assigned',
                ($order->waybill_number ?? 'Order #' . $order->id) . ' · ' . ($order->shipping_address ?? ''),
                $job->id,
                $order->id
            );

            return response()->json([
                'message' => 'Delivery rider assigned.',
                'data'    => [
                    'delivery_job_id' => $job->id,
                    'order_id'        => $order->id,
                    'order_number'    => 'MIM-' . str_pad((string) $order->id, 8, '0', STR_PAD_LEFT),
                    'waybill_number'  => $order->waybill_number,
                    'personnel_id'    => $personnel->id,
                    'rider_user_id'   => $personnel->user_id,
                    'rider_name'      => $personnel->name,
                    'status'          => $job->status,
                    'cod_amount'      => (float) $job->cod_amount,
                    'facility_id'     => $job->facility_id,
                    'assigned_at'     => $job->assigned_at?->toIso8601String(),
                ],
            ], 201);
        });
    }

    /**
     * Active personnel of this courier whose linked user is a ready rider
     * AND who is checked in (online) in the rider app. No online rider →
     * empty list.
     */
    private function readyRiders(int $courierId)
    {
        return CourierPersonnel::where('courier_id', $courierId)
            ->where('status', 'active')
            ->where('is_online', true)
            ->whereNotNull('user_id')
            ->whereHas('user', fn ($q) => $q
                ->where(fn ($r) => $r->where('role', 'rider')
                    ->orWhere(fn ($x) => $x->whereNull('role')->where('account_type', 'rider')))
                ->where('status', 'approved')
                ->where('verification_status', 'verified'));
    }
}
