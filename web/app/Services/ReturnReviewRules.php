<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\Review;

/**
 * Eligibility flags for returns and reviews, shared by the buyer mobile API
 * (BuyerOrderController) and the buyer web pages (OrderController), so both
 * show the same buttons. The write endpoints (BuyerReturnController::store,
 * BuyerReviewController::store) enforce the same rules and are themselves
 * shared by mobile (Sanctum) and web (session routes).
 *
 *   return : order shipped|completed, shipped_at/completed_at (else updated_at) + 7 days in the future,
 *            and no open request (pending/approved/escalated) on the order
 *   review : order completed, completed_at (else updated_at) + 30 days in the future,
 *            and the item has no review yet (one review per order item)
 */
class ReturnReviewRules
{
    /** Return window starts when the order shipped (or completed); updated_at only when the stamp is NULL (old orders). */
    public static function returnBase(Order $order): ?\Carbon\CarbonInterface
    {
        $stamp = $order->status === 'completed' ? $order->completed_at : $order->shipped_at;

        return $stamp ?? $order->updated_at;
    }

    /** Review window starts at completion; updated_at only when completed_at is NULL (old orders). */
    public static function reviewBase(Order $order): ?\Carbon\CarbonInterface
    {
        return $order->completed_at ?? $order->updated_at;
    }

    public static function returnWindowOpen(Order $order): bool
    {
        $base = self::returnBase($order);

        return in_array($order->status, ['shipped', 'completed'], true)
            && $base !== null
            && $base->copy()->addDays(ReturnRequest::REQUEST_WINDOW_DAYS)->isFuture();
    }

    public static function latestReturn(Order $order): ?ReturnRequest
    {
        return ReturnRequest::where('order_id', $order->id)->latest('id')->first();
    }

    public static function canReturn(Order $order, ?ReturnRequest $latest): bool
    {
        return self::returnWindowOpen($order) && ! ($latest && $latest->isOpen());
    }

    public static function reviewWindowOpen(Order $order): bool
    {
        $base = self::reviewBase($order);

        return $order->status === 'completed'
            && $base !== null
            && $base->copy()->addDays(Review::REVIEW_WINDOW_DAYS)->isFuture();
    }
}
