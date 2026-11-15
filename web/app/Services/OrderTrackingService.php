<?php

namespace App\Services;

use App\Models\CourierFacility;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentScan;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Buyer-facing transit log of ONE order, oldest first. Shared by the buyer app
 * (GET /api/buyer/orders/{id}/tracking) and the buyer website
 * (GET /orders/{id}/tracking + /api/orders/{id}/tracking).
 *
 * orders.tracking_status only keeps the LATEST status, so the log is rebuilt
 * from rows that already carry their own timestamp:
 *   orders            created_at, verified_at, waybill_generated_at, completed_at
 *   shipment_assignments (accepted only)  assigned_at, accepted_at, picked_up_at
 *   shipment_scans    every hub scan (facility = location)
 *   delivery_jobs     assigned_at, out_for_delivery_at, failure_reasons[].at, delivered_at, returned_at
 *
 * Privacy: staff names are never exposed — handler is the courier company name,
 * or the rider's first name for the rider steps.
 */
class OrderTrackingService
{
    /** Same labels as the buyer app's Order.trackingLabel. */
    public const STATUS_LABELS = [
        'received_logistics'  => 'Received by logistics',
        'assigned_courier'    => 'Assigned to courier',
        'accepted_courier'    => 'Accepted by courier',
        'scanned_at_facility' => 'At sorting facility',
        'returned_to_hub'     => 'Returned to hub',
        'out_for_delivery'    => 'Out for delivery',
        'delivered'           => 'Delivered',
        'delivery_failed'     => 'Delivery attempt failed',
        'returning_to_sender' => 'Returning to sender',
    ];

    public static function forOrder(Order $order): array
    {
        $events = [];
        $add = function (string $key, ?CarbonInterface $at, string $title, ?string $description = null, ?string $location = null, ?string $handler = null) use (&$events) {
            if ($at) {
                $events[] = compact('key', 'title', 'description', 'location', 'handler') + ['at' => $at];
            }
        };

        // ── Order milestones ────────────────────────────────────────────────
        $add('placed', $order->created_at, 'Order placed', 'Your order has been placed.');
        $add('verified', $order->verified_at, 'Order verified', 'Your order was checked and is being prepared.');
        $add('waybill', $order->waybill_generated_at, 'Waybill generated', 'The seller is preparing your parcel for pickup.');

        // ── Courier pickup (accepted assignment only; rejected offers are internal) ─
        $assignment = ShipmentAssignment::where('order_id', $order->id)
            ->where('assignment_status', 'accepted')
            ->with('courier:id,name,company_name,business_name')
            ->latest('id')->first();
        $courierName = $assignment?->courier
            ? ($assignment->courier->company_name ?: $assignment->courier->business_name ?: $assignment->courier->name)
            : null;
        if ($assignment) {
            $add('courier_assigned', $assignment->assigned_at, 'Assigned to courier', "{$courierName} will pick up your parcel.", null, $courierName);
            $add('courier_accepted', $assignment->accepted_at, 'Courier accepted', 'The courier accepted the pickup.', null, $courierName);
            $add('picked_up', $assignment->picked_up_at, 'Picked up from seller', 'Your parcel has been picked up.', null, $courierName);
        }

        // ── Hub scans ────────────────────────────────────────────────────────
        $scans = ShipmentScan::where('order_id', $order->id)
            ->with('facility:id,facility_name,city,province')
            ->orderBy('created_at')->get();
        foreach ($scans as $scan) {
            $place = self::facilityLabel($scan->facility);
            [$title, $desc] = match ($scan->scan_type) {
                'received'        => ['Arrived at hub', "Your parcel arrived at {$place}."],
                'rider_drop_off'  => ['Arrived at hub', "Your parcel was dropped off at {$place}."],
                'return_received' => ['Returned to hub', "Your returned parcel was received at {$place}."],
                default           => ['Scanned at hub', "Your parcel was scanned at {$place}."],
            };
            $add('scan_' . $scan->scan_type, $scan->created_at, $title, $desc, $place, $courierName);
        }

        // ── Last-mile delivery (every job, so re-deliveries show up) ────────
        $jobs = DeliveryJob::where('order_id', $order->id)->with('personnel:id,name')->orderBy('id')->get();
        foreach ($jobs as $job) {
            $rider = self::firstName($job->personnel?->name);
            $riderLabel = $rider ? "Rider {$rider}" : 'Rider';
            $add('rider_assigned', $job->assigned_at, 'Rider assigned', "{$riderLabel} will deliver your parcel.", null, $riderLabel);
            $add('out_for_delivery', $job->out_for_delivery_at, 'Out for delivery', "{$riderLabel} is on the way.", null, $riderLabel);
            foreach ((array) $job->failure_reasons as $f) {
                $at = ! empty($f['at']) ? Carbon::parse($f['at']) : null;
                $n  = $f['attempt'] ?? null;
                $add('delivery_failed', $at, 'Delivery attempt' . ($n ? " #{$n}" : '') . ' failed', $f['label'] ?? 'The rider could not deliver your parcel.', null, $riderLabel);
            }
            $add('delivered', $job->delivered_at, 'Delivered', 'Your parcel was delivered.', null, $riderLabel);
            $add('returned', $job->returned_at, 'Returned to sender', 'Your parcel is being returned to the seller.', null, $riderLabel);
        }

        $add('completed', $order->completed_at, 'Order completed', 'You confirmed you received the order.');
        if ($order->status === 'cancelled') {
            $add('cancelled', $order->updated_at, 'Order cancelled', 'This order was cancelled.');
        }

        // Oldest first; stable for equal timestamps (insertion order = logical order).
        $i = 0;
        $events = array_map(fn ($e) => $e + ['_i' => $i++], $events);
        usort($events, fn ($a, $b) => [$a['at']->getTimestamp(), $a['_i']] <=> [$b['at']->getTimestamp(), $b['_i']]);

        $facility = $order->current_facility_id ? CourierFacility::find($order->current_facility_id) : null;

        return [
            'order_id'       => $order->id,
            'order_number'   => 'MIM-' . str_pad((string) $order->id, 8, '0', STR_PAD_LEFT),
            'waybill_number' => $order->waybill_number,
            'status'         => $order->status,
            'tracking'       => [
                'status'     => $order->tracking_status,
                'label'      => self::STATUS_LABELS[$order->tracking_status] ?? null,
                'message'    => $order->tracking_message,
                'updated_at' => $order->tracking_updated_at?->toIso8601String(),
            ],
            'courier_name'     => $courierName,
            'current_location' => $facility ? self::facilityLabel($facility) : null,
            'destination'      => $order->destinationLabel(),
            'events'           => array_map(fn ($e) => [
                'key'         => $e['key'],
                'title'       => $e['title'],
                'description' => $e['description'],
                'location'    => $e['location'],
                'handler'     => $e['handler'],
                'at'          => $e['at']->toIso8601String(),
            ], $events),
        ];
    }

    private static function facilityLabel(?CourierFacility $f): string
    {
        if (! $f) {
            return 'a sorting hub';
        }
        $where = implode(', ', array_filter([$f->city, $f->province]));

        return $f->facility_name . ($where !== '' ? " ({$where})" : '');
    }

    private static function firstName(?string $name): ?string
    {
        $name = trim((string) $name);

        return $name === '' ? null : explode(' ', $name)[0];
    }
}
