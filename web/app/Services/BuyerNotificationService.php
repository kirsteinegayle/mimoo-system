<?php

namespace App\Services;

use App\Models\BuyerNotification;
use App\Models\Order;
use App\Models\ReturnRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * In-app buyer notifications (no push / Firebase).
 *
 * Called from model events (Order, ReturnRequest). EVERY public method is
 * wrapped in try/catch and never throws, so a notification failure can never
 * break the website or the mobile API. Writes are deferred until the
 * surrounding DB transaction commits (or run immediately when there is none),
 * so rolled-back orders never produce a notification.
 */
class BuyerNotificationService
{
    /** Order statuses that produce a buyer notification. */
    private const NOTIFY_STATUSES = [
        'packed'    => ['Order packed',    'Your order %s has been packed by the seller.'],
        'shipped'   => ['Order shipped',   'Your order %s is on its way.'],
        'completed' => ['Order completed', 'Your order %s has been completed. Rate your items!'],
        'cancelled' => ['Order cancelled', 'Your order %s has been cancelled.'],
    ];

    private const RETURN_STATUSES = [
        'pending'   => ['Return request submitted', 'Your return request for order %s was submitted.'],
        'approved'  => ['Return request approved',  'The seller approved your return request for order %s.'],
        'rejected'  => ['Return request rejected',  'The seller rejected your return request for order %s.'],
        'escalated' => ['Return request escalated', 'Your return request for order %s was escalated for review.'],
        'refunded'  => ['Refund completed',         'Your refund for order %s has been completed.'],
        'closed'    => ['Return request closed',    'Your return request for order %s was closed.'],
    ];

    /** >0 while inside withoutOrderStatusNotification(). */
    private static int $suppressStatus = 0;

    /**
     * Runs $fn without the generic order-status notification. Used when the
     * caller sends its own, more specific notification for the same step
     * (rider "Out for delivery" instead of "Order shipped"). Only
     * orderStatusChanged() is skipped; the status change itself, model events
     * and every other notification run normally.
     */
    public static function withoutOrderStatusNotification(callable $fn): mixed
    {
        self::$suppressStatus++;
        try {
            return $fn();
        } finally {
            self::$suppressStatus--;
        }
    }

    public static function orderNumber(int $orderId): string
    {
        return 'MIM-' . str_pad((string) $orderId, 8, '0', STR_PAD_LEFT);
    }

    public static function orderPlaced(Order $order): void
    {
        self::safely(function () use ($order) {
            $num = self::orderNumber($order->id);
            self::create(
                $order->buyer_id,
                'order_placed',
                'Order placed',
                "Your order {$num} was placed successfully.",
                ['order_id' => $order->id, 'status' => $order->status]
            );
        });
    }

    public static function orderStatusChanged(Order $order): void
    {
        if (self::$suppressStatus > 0) {
            return;
        }
        self::safely(function () use ($order) {
            $status = $order->status;
            if (! isset(self::NOTIFY_STATUSES[$status])) {
                return;
            }
            [$title, $tpl] = self::NOTIFY_STATUSES[$status];
            self::create(
                $order->buyer_id,
                'order_status',
                $title,
                sprintf($tpl, self::orderNumber($order->id)),
                ['order_id' => $order->id, 'status' => $status]
            );
        });
    }

    public static function returnStatusChanged(ReturnRequest $rr): void
    {
        self::safely(function () use ($rr) {
            $status = $rr->status;
            [$title, $tpl] = self::RETURN_STATUSES[$status]
                ?? ['Return request updated', 'Your return request for order %s was updated.'];
            self::create(
                $rr->buyer_id,
                'return_status',
                $title,
                sprintf($tpl, self::orderNumber($rr->order_id)),
                ['order_id' => $rr->order_id, 'return_id' => $rr->id, 'status' => $status]
            );
        });
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private static function create(?int $buyerId, string $type, string $title, string $body, array $data): void
    {
        if (! $buyerId) {
            return;
        }

        DB::afterCommit(function () use ($buyerId, $type, $title, $body, $data) {
            try {
                BuyerNotification::create([
                    'buyer_id' => $buyerId,
                    'type'     => $type,
                    'title'    => $title,
                    'body'     => $body,
                    'data'     => $data,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Buyer notification insert failed: ' . $e->getMessage());
            }
        });
    }

    private static function safely(callable $fn): void
    {
        try {
            $fn();
        } catch (\Throwable $e) {
            Log::warning('Buyer notification failed: ' . $e->getMessage());
        }
    }
}
