<?php

namespace App\Services;

use App\Models\DeliveryJob;
use App\Models\OrderItem;
use App\Models\ShipmentAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * In-app seller notifications (no push), same pattern as
 * BuyerNotificationService: called from model events, never throws, and
 * inserts after the surrounding transaction commits (rolled-back work never
 * notifies).
 *
 * One notification per seller per step: every row has a dedupe_key and
 * (seller_id, dedupe_key) is UNIQUE, inserted with insertOrIgnore, so a
 * repeated request, a second order item of the same seller, or two
 * concurrent calls can never add a duplicate.
 *
 *   new order         order_placed:{order_id}           (OrderItem created)
 *   picked up         picked_up:{order_id}              (ShipmentAssignment pickup_status -> picked_up)
 *   out for delivery  out_for_delivery:{job}:{attempt}  (DeliveryJob status)
 *   delivered         delivered:{job}
 *   delivery failed   delivery_failed:{job}:{attempt}
 */
class SellerNotificationService
{
    public const URL = '/seller/orders';

    public static function orderItemCreated(OrderItem $item): void
    {
        self::safely(function () use ($item) {
            if (! $item->seller_id || ! $item->order_id) {
                return;
            }
            $num = BuyerNotificationService::orderNumber((int) $item->order_id);
            self::createFor([(int) $item->seller_id], (int) $item->order_id, 'order_placed', 'New order',
                "You have a new order {$num}.", "order_placed:{$item->order_id}");
        });
    }

    public static function shipmentUpdated(ShipmentAssignment $sa): void
    {
        self::safely(function () use ($sa) {
            if (! $sa->wasChanged('pickup_status') || $sa->pickup_status !== 'picked_up' || ! $sa->order_id) {
                return;
            }
            $num = BuyerNotificationService::orderNumber((int) $sa->order_id);
            self::createFor(self::sellersOf((int) $sa->order_id), (int) $sa->order_id, 'picked_up', 'Parcel picked up',
                "The courier picked up order {$num}.", "picked_up:{$sa->order_id}");
        });
    }

    public static function deliveryJobUpdated(DeliveryJob $job): void
    {
        self::safely(function () use ($job) {
            if (! $job->wasChanged('status') || ! $job->order_id) {
                return;
            }
            $orderId = (int) $job->order_id;
            $num     = BuyerNotificationService::orderNumber($orderId);
            $attempt = (int) $job->attempt_count;

            [$type, $title, $message, $key] = match ($job->status) {
                DeliveryJob::STATUS_OUT_FOR_DELIVERY => ['out_for_delivery', 'Out for delivery',
                    "Order {$num} is out for delivery.", 'out_for_delivery:' . $job->id . ':' . ($attempt + 1)],
                DeliveryJob::STATUS_DELIVERED => ['delivered', 'Order delivered',
                    "Order {$num} was delivered to the buyer.", 'delivered:' . $job->id],
                DeliveryJob::STATUS_FAILED => ['delivery_failed', 'Delivery attempt failed',
                    "Delivery attempt {$attempt} for order {$num} failed.", 'delivery_failed:' . $job->id . ':' . $attempt],
                default => [null, null, null, null],
            };
            if ($type === null) {
                return;
            }
            self::createFor(self::sellersOf($orderId), $orderId, $type, $title, $message, $key,
                ['delivery_job_id' => $job->id]);
        });
    }

    // ── Internals ────────────────────────────────────────────────────────────

    /** @return int[] distinct seller ids of the order's items */
    public static function sellersOf(int $orderId): array
    {
        return OrderItem::where('order_id', $orderId)->whereNotNull('seller_id')
            ->distinct()->pluck('seller_id')->map(fn ($id) => (int) $id)->all();
    }

    private static function createFor(array $sellerIds, int $orderId, string $type, string $title,
        string $message, string $key, array $extra = []): void
    {
        if ($sellerIds === []) {
            return;
        }

        DB::afterCommit(function () use ($sellerIds, $orderId, $type, $title, $message, $key, $extra) {
            try {
                $now  = now();
                $data = json_encode(['order_id' => $orderId] + $extra);
                DB::table('seller_notifications')->insertOrIgnore(array_map(fn ($sid) => [
                    'seller_id'  => $sid,
                    'type'       => $type,
                    'title'      => $title,
                    'message'    => $message,
                    'data'       => $data,
                    'url'        => self::URL,
                    'dedupe_key' => $key,
                    'created_at' => $now,
                    'updated_at' => $now,
                ], array_values(array_unique($sellerIds))));
            } catch (\Throwable $e) {
                Log::warning('Seller notification insert failed: ' . $e->getMessage(), ['key' => $key]);
            }
        });
    }

    private static function safely(callable $fn): void
    {
        try {
            $fn();
        } catch (\Throwable $e) {
            Log::warning('Seller notification failed: ' . $e->getMessage());
        }
    }
}
