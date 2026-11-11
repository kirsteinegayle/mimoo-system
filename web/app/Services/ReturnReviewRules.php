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
 *   return : order shipped|completed, order.updated_at + 7 days in the future,
 *            and no open request (pending/approved/escalated) on the order
 *   review : order completed, order.updated_at + 30 days in the future,
 *            and the item has no review yet (one review per order item)
 */
class ReturnReviewRules
{
    public static function returnWindowOpen(Order $order): bool
    {
        return in_array($order->status, ['shipped', 'completed'], true)
            && $order->updated_at !== null
            && $order->updated_at->copy()->addDays(ReturnRequest::REQUEST_WINDOW_DAYS)->isFuture();
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
        return $order->status === 'completed'
            && $order->updated_at !== null
            && $order->updated_at->copy()->addDays(Review::REVIEW_WINDOW_DAYS)->isFuture();
    }
}
