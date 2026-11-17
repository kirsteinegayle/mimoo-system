<?php

namespace App\Support;

use App\Models\DeliveryJob;
use Illuminate\Support\Facades\DB;

/**
 * Proof of delivery (POD) as shown to seller, courier and admin.
 * One entry per order: the latest DELIVERED delivery job with its photo,
 * recipient, COD collected and delivery time. The photo itself is streamed by
 * DeliveryPodPhotoController::showWeb (private disk, access checked there).
 */
class DeliveryProof
{
    /**
     * @param  iterable<int>  $orderIds
     * @return array<int, array{job_id:int, delivered_at:?string, photo_url:?string, recipient:?string, cod_collected:?float, rider:?string}>
     */
    public static function forOrders(iterable $orderIds): array
    {
        $ids = collect($orderIds)->filter()->unique()->values();
        if ($ids->isEmpty()) {
            return [];
        }

        $jobs = DeliveryJob::with(['personnel:id,name', 'order:id,shipping_name'])
            ->whereIn('order_id', $ids)
            ->where('status', DeliveryJob::STATUS_DELIVERED)
            ->orderBy('id')
            ->get()
            ->keyBy('order_id'); // later (higher id) job wins

        return $jobs->map(fn (DeliveryJob $j) => [
            'job_id'        => $j->id,
            'delivered_at'  => $j->delivered_at?->format('M d, Y h:i A'),
            'photo_url'     => $j->pod_photo_path ? '/pod/' . $j->id . '/photo' : null,
            // Recipient entered by the rider; falls back to the order's recipient name.
            'recipient'     => $j->pod_recipient_name ?: $j->order?->shipping_name,
            'cod_collected' => $j->cod_collected !== null && (float) $j->cod_collected > 0 ? (float) $j->cod_collected : null,
            'rider'         => $j->personnel?->name,
        ])->all();
    }

    public static function forOrder(int $orderId): ?array
    {
        return self::forOrders([$orderId])[$orderId] ?? null;
    }
}
