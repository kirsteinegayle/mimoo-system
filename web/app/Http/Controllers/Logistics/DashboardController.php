<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Logistics hub dashboard (logistics_staff). Read-only, real data:
 *   pendingSort     orders confirmed at the hub (status shipped) with no active courier assignment
 *   parcelsToday    parcels dispatched to a courier company today (shipment_assignments.assigned_at)
 *   outForDelivery  delivery jobs currently out for delivery (+ distinct riders on the road)
 *   delivered       delivery jobs delivered today (+ all time)
 */
class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $pendingSort = Order::where('status', 'shipped')
            ->whereDoesntHave('shipmentAssignments', fn ($q) => $q->active())
            ->count();

        $outJobs = DeliveryJob::where('status', DeliveryJob::STATUS_OUT_FOR_DELIVERY);

        $stats = [
            'parcelsToday'   => ShipmentAssignment::whereDate('assigned_at', today())->count(),
            'pendingSort'    => $pendingSort,
            'outForDelivery' => (clone $outJobs)->count(),
            'ridersActive'   => (clone $outJobs)->distinct()->count('rider_user_id'),
            'delivered'      => DeliveryJob::where('status', DeliveryJob::STATUS_DELIVERED)->whereDate('delivered_at', today())->count(),
            'deliveredTotal' => DeliveryJob::where('status', DeliveryJob::STATUS_DELIVERED)->count(),
        ];

        $recent = ShipmentAssignment::with(['order:id,waybill_number,shipping_address,status,tracking_status,tracking_updated_at', 'personnel:id,name'])
            ->latest('id')->limit(8)->get();
        $jobs = DeliveryJob::with('personnel:id,name')
            ->whereIn('order_id', $recent->pluck('order_id'))->orderBy('id')->get()->keyBy('order_id');

        $recentShipments = $recent->map(function (ShipmentAssignment $a) use ($jobs) {
            $order = $a->order;
            $job   = $jobs->get($a->order_id);
            $parts = array_values(array_filter(array_map('trim', explode(',', (string) $order?->shipping_address))));
            $city  = count($parts) >= 2 ? $parts[count($parts) - 2] : ($parts[0] ?? '—');
            $when  = $order?->tracking_updated_at ?? $a->updated_at;

            return [
                'id'          => $order?->waybill_number ?? ('#' . $a->order_id),
                'destination' => $city,
                'address'     => $order?->shipping_address ?? '—',
                'rider'       => $job?->personnel?->name ?? $a->personnel?->name ?? 'Not assigned',
                'lastScan'    => $when?->format('h:i A') ?? '—',
                'date'        => $when?->format('M d') ?? '',
                'status'      => $job?->status ?? ($a->assignment_status === 'pending' ? 'awaiting courier' : $a->pickup_status),
            ];
        })->values();

        $activity = ShipmentAssignmentHistory::with('assignment.order:id,waybill_number')
            ->latest('id')->limit(6)->get()
            ->map(fn (ShipmentAssignmentHistory $h) => [
                'type'    => in_array($h->action, ['rejected', 'cancelled', 'failed_attempt'], true) ? 'info' : 'success',
                'message' => ($h->assignment?->order?->waybill_number ?? '#' . $h->assignment_id) . ' — ' . str_replace(['_', '-'], ' ', $h->action)
                    . ($h->notes ? ': ' . $h->notes : ''),
                'time'    => $h->created_at?->diffForHumans() ?? '',
            ])->values();

        return Inertia::render('logistics/LogisticsDashboard', [
            'auth' => ['user' => [
                'id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type,
            ]],
            'company' => [
                'name'           => $user->company_name ?? $user->business_name,
                'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? '')),
            ],
            'stats'           => $stats,
            'recentShipments' => $recentShipments,
            'activityTimeline' => $activity,
            'now'             => now()->format('l, M d, Y • h:i A'),
        ]);
    }
}
