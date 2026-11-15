<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Buyer "Track Order": the parcel's transit log (OrderTrackingService).
 *   GET /api/buyer/orders/{id}/tracking  buyer app (Sanctum)
 *   GET /api/orders/{id}/tracking        website (session) — same JSON
 *   GET /orders/{id}/tracking            website page (Inertia TrackOrder)
 * Own orders only; anyone else gets 404 (no existence leak).
 */
class OrderTrackingController extends Controller
{
    private function ownOrder(Request $request, int $id): ?Order
    {
        $user = $request->user();

        return $user ? Order::where('buyer_id', $user->id)->find($id) : null;
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if (! $order = $this->ownOrder($request, $id)) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => OrderTrackingService::forOrder($order)]);
    }

    public function page(Request $request, int $id): Response
    {
        $order = $this->ownOrder($request, $id) ?? abort(404);

        return Inertia::render('TrackOrder', [
            'tracking' => OrderTrackingService::forOrder($order),
        ]);
    }
}
