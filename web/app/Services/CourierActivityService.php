<?php

namespace App\Services;

use App\Models\DeliveryJob;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use App\Models\ShipmentScan;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Courier company "Recent Activity" (courier app dashboard), newest first.
 * Built from rows that already carry their own timestamp — no new table:
 *
 *   shipment_assignment_history  offered / accepted / scheduled / rider assigned / picked up / rejected
 *   shipment_scans               received at hub, rider drop-off, return received
 *   delivery_jobs                rider assigned, out for delivery, failed attempt, delivered, returned
 *
 * type: shipment | pickup | hub | delivery  (used by the app's filter chips)
 */
class CourierActivityService
{
    public const TYPES = ['shipment', 'pickup', 'hub', 'delivery'];

    public static function recent(int $courierId, int $limit = 15, ?string $type = null): array
    {
        $limit = max(1, min($limit, 100));
        $want = fn (string $t) => $type === null || $type === $t;
        $events = [];
        $add = function (string $t, ?CarbonInterface $at, string $title, ?string $detail, ?string $waybill, ?int $orderId) use (&$events, $want) {
            if ($at && $want($t)) {
                $events[] = ['type' => $t, 'title' => $title, 'detail' => $detail, 'waybill_number' => $waybill, 'order_id' => $orderId, 'at' => $at];
            }
        };

        // ── Assignment history (offers, acceptance, scheduling, pickups) ─────
        if ($want('shipment') || $want('pickup')) {
            $rows = ShipmentAssignmentHistory::whereIn('assignment_id', ShipmentAssignment::where('courier_id', $courierId)->select('id'))
                ->with('assignment.order:id,waybill_number')
                ->latest('created_at')->limit($limit)->get();
            foreach ($rows as $h) {
                $notes = (string) $h->notes;
                [$t, $title] = match (true) {
                    $h->action === 'assigned'                       => ['shipment', 'New shipment offered'],
                    $h->action === 'rejected'                       => ['shipment', 'Shipment rejected'],
                    str_starts_with($notes, 'Parcel picked up')     => ['pickup', 'Parcel picked up'],
                    str_starts_with($notes, 'Pickup scheduled')     => ['pickup', 'Pickup scheduled'],
                    str_starts_with(strtolower($notes), 'failed')   => ['pickup', 'Pickup attempt failed'],
                    $h->action === 're-assigned'                    => ['pickup', 'Pickup rider assigned'],
                    $h->action === 'accepted'                       => ['shipment', 'Shipment accepted'],
                    default                                         => ['shipment', ucfirst(str_replace(['-', '_'], ' ', (string) $h->action))],
                };
                $order = $h->assignment?->order;
                $add($t, $h->created_at, $title, $notes !== '' ? $notes : null, $order?->waybill_number, $order?->id);
            }
        }

        // ── Hub scans ────────────────────────────────────────────────────────
        if ($want('hub')) {
            $scans = ShipmentScan::where('courier_id', $courierId)->with('facility:id,facility_name')
                ->latest('created_at')->limit($limit)->get();
            foreach ($scans as $s) {
                $title = match ($s->scan_type) {
                    'received'        => 'Received at hub',
                    'rider_drop_off'  => 'Rider dropped parcel at hub',
                    'return_received' => 'Returned parcel received',
                    default           => 'Parcel scanned',
                };
                $add('hub', $s->created_at, $title, $s->facility?->facility_name, $s->waybill_number, $s->order_id);
            }
        }

        // ── Delivery jobs ────────────────────────────────────────────────────
        if ($want('delivery')) {
            $jobs = DeliveryJob::where('courier_id', $courierId)->with(['personnel:id,name', 'order:id,waybill_number'])
                ->latest('updated_at')->limit($limit)->get();
            foreach ($jobs as $j) {
                $rider = $j->personnel?->name;
                $wb = $j->order?->waybill_number;
                $add('delivery', $j->assigned_at, 'Delivery rider assigned', $rider, $wb, $j->order_id);
                $add('delivery', $j->out_for_delivery_at, 'Out for delivery', $rider, $wb, $j->order_id);
                foreach ((array) $j->failure_reasons as $f) {
                    $add('delivery', ! empty($f['at']) ? Carbon::parse($f['at']) : null,
                        'Delivery attempt failed', trim(($f['label'] ?? '') . ($rider ? " · {$rider}" : '')), $wb, $j->order_id);
                }
                $add('delivery', $j->delivered_at, 'Delivered', $rider, $wb, $j->order_id);
                $add('delivery', $j->returned_at, 'Returned to sender', $rider, $wb, $j->order_id);
            }
        }

        usort($events, fn ($a, $b) => $b['at']->getTimestamp() <=> $a['at']->getTimestamp());

        return array_map(fn ($e) => ['at' => $e['at']->toIso8601String()] + $e, array_slice($events, 0, $limit));
    }
}
