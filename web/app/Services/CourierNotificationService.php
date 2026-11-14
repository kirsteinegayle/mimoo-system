<?php

namespace App\Services;

use App\Models\DeliveryJob;
use App\Models\ShipmentAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * In-app notifications for a courier company (same pattern as
 * SellerNotificationService): called from model events, never throws, inserts
 * after the surrounding transaction commits, and every row has a dedupe_key
 * with UNIQUE (courier_id, dedupe_key) + insertOrIgnore, so a repeated request
 * or two concurrent calls can never add a duplicate.
 *
 * courier_id is the courier COMPANY user; logistics_staff linked to that
 * company (CourierCompanyResolver) read the same rows.
 *
 *   new pickup assignment   pickup_assigned:{assignment}
 *   pickup rider assigned   rider_assigned:{assignment}:{personnel}
 *   delivery rider assigned delivery_rider_assigned:{job}
 *   delivered               delivered:{job}
 *   delivery failed         delivery_failed:{job}:{attempt}
 *   new message             message:{conversation}:{first unread message}  (messaging)
 */
class CourierNotificationService
{
    public static function assignmentCreated(ShipmentAssignment $sa): void
    {
        self::safely(function () use ($sa) {
            $num = BuyerNotificationService::orderNumber((int) $sa->order_id);
            self::create((int) $sa->courier_id, 'pickup_assigned', 'New pickup assignment',
                "Order {$num} was assigned to your company.", 'pickup_assigned:' . $sa->id,
                ['order_id' => $sa->order_id, 'assignment_id' => $sa->id], '/courier/incoming-shipments');
        });
    }

    public static function assignmentUpdated(ShipmentAssignment $sa): void
    {
        self::safely(function () use ($sa) {
            if (! $sa->wasChanged('assigned_personnel_id') || ! $sa->assigned_personnel_id) {
                return;
            }
            $num = BuyerNotificationService::orderNumber((int) $sa->order_id);
            self::create((int) $sa->courier_id, 'rider_assigned', 'Rider assigned to pickup',
                "A rider was assigned to pick up order {$num}.", "rider_assigned:{$sa->id}:{$sa->assigned_personnel_id}",
                ['order_id' => $sa->order_id, 'assignment_id' => $sa->id], '/courier/pickup-management');
        });
    }

    public static function deliveryJobCreated(DeliveryJob $job): void
    {
        self::safely(function () use ($job) {
            $num = BuyerNotificationService::orderNumber((int) $job->order_id);
            self::create((int) $job->courier_id, 'delivery_rider_assigned', 'Delivery rider assigned',
                "A rider was assigned to deliver order {$num}.", 'delivery_rider_assigned:' . $job->id,
                ['order_id' => $job->order_id, 'delivery_job_id' => $job->id], '/courier/delivery-management');
        });
    }

    public static function deliveryJobUpdated(DeliveryJob $job): void
    {
        self::safely(function () use ($job) {
            if (! $job->wasChanged('status')) {
                return;
            }
            $num     = BuyerNotificationService::orderNumber((int) $job->order_id);
            $attempt = (int) $job->attempt_count;
            [$type, $title, $message, $key] = match ($job->status) {
                DeliveryJob::STATUS_DELIVERED => ['delivered', 'Order delivered', "Order {$num} was delivered.", 'delivered:' . $job->id],
                DeliveryJob::STATUS_FAILED    => ['delivery_failed', 'Delivery attempt failed',
                    "Delivery attempt {$attempt} for order {$num} failed.", 'delivery_failed:' . $job->id . ':' . $attempt],
                default => [null, null, null, null],
            };
            if ($type === null) {
                return;
            }
            self::create((int) $job->courier_id, $type, $title, $message, $key,
                ['order_id' => $job->order_id, 'delivery_job_id' => $job->id], '/courier/delivery-management');
        });
    }

    /** Public so other services (messaging) reuse the same dedupe + after-commit insert. */
    public static function create(int $courierId, string $type, string $title, string $message, string $key,
        array $data = [], string $url = '/courier/dashboard'): void
    {
        if ($courierId <= 0) {
            return;
        }
        DB::afterCommit(function () use ($courierId, $type, $title, $message, $key, $data, $url) {
            try {
                $now = now();
                DB::table('courier_notifications')->insertOrIgnore([
                    'courier_id' => $courierId, 'type' => $type, 'title' => $title, 'message' => $message,
                    'data' => json_encode($data), 'url' => $url, 'dedupe_key' => $key,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Courier notification insert failed: ' . $e->getMessage(), ['key' => $key]);
            }
        });
    }

    private static function safely(callable $fn): void
    {
        try {
            $fn();
        } catch (\Throwable $e) {
            Log::warning('Courier notification failed: ' . $e->getMessage());
        }
    }
}
