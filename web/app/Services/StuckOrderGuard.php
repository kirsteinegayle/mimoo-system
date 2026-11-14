<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ShipmentAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * An order is "in_transit" only while a courier company holds it. If the
 * assignment is rejected / cancelled (or an old row was left behind) and there
 * is no delivery job, nobody can move it any more: it never shows in Sort &
 * Assign (status shipped only) and has no rider. This puts it back to
 * "shipped" (hub-confirmed, waiting to be assigned) so logistics can assign it again.
 *
 * Never touches an order that still has an active assignment (pending /
 * accepted, not cancelled) or any delivery job, and never moves completed /
 * cancelled orders. The buyer is not notified again ("Order shipped" was already sent).
 */
class StuckOrderGuard
{
    /** in_transit, no active assignment, no delivery job. */
    public static function isOrphan(Order $order): bool
    {
        return $order->status === 'in_transit'
            && ! ShipmentAssignment::where('order_id', $order->id)->active()->exists()
            && ! DB::table('delivery_jobs')->where('order_id', $order->id)->exists();
    }

    /** SQL form of isOrphan() for lists. */
    public static function orphanScope($query)
    {
        return $query->where('status', 'in_transit')
            ->whereNotExists(fn ($s) => $s->select(DB::raw(1))->from('delivery_jobs')->whereColumn('delivery_jobs.order_id', 'orders.id'))
            ->whereDoesntHave('shipmentAssignments', fn ($q) => $q->active());
    }

    /** @return bool true when the order was put back to shipped */
    public static function reopen(int $orderId): bool
    {
        try {
            return DB::transaction(function () use ($orderId) {
                $order = Order::whereKey($orderId)->lockForUpdate()->first();
                if (! $order || ! self::isOrphan($order)) {
                    return false;
                }
                BuyerNotificationService::withoutOrderStatusNotification(fn () => $order->update(['status' => 'shipped']));
                $order->updateTracking('received_logistics', 'Parcel is waiting to be assigned to a courier again.');

                return true;
            });
        } catch (\Throwable $e) {
            Log::warning('Stuck order guard failed: ' . $e->getMessage(), ['order_id' => $orderId]);

            return false;
        }
    }
}
