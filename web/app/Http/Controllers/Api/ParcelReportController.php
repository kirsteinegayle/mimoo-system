<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryJob;
use App\Models\ParcelReport;
use App\Services\ParcelReportService;
use App\Services\UserNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Parcel problem reports (rules in ParcelReportService).
 *
 *   Buyer  web (session) + app (Sanctum):
 *     GET  /buyer/orders/{id}/parcel-report        latest own report for the order (or null)
 *     POST /buyer/orders/{id}/parcel-report        {reason, description}
 *   Rider app:   POST /api/rider-app/jobs/{id}/parcel-report      (delivery job id)
 *   Courier app: POST /api/courier-app/orders/{id}/parcel-report
 *
 * 404 when the order is not the caller's; 409 when an active report exists;
 * 422 on validation / order not shipped yet.
 */
class ParcelReportController extends Controller
{
    public function buyerShow(Request $request, int $id): JsonResponse
    {
        if (UserNotifier::roleOf($request->user()) !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can report parcels here.'], 403);
        }
        $order = ParcelReportService::orderFor($request->user(), 'buyer', $id);
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }
        $latest = ParcelReport::where('order_id', $order->id)->where('reporter_id', $request->user()->id)->latest('id')->first();

        return response()->json([
            'data' => ParcelReportService::present($latest),
            'meta' => [
                'can_report' => in_array($order->status, ParcelReportService::BUYER_STATUSES, true)
                    && (! $latest || ! in_array($latest->status, ParcelReportService::ACTIVE, true)),
                'reasons'    => ParcelReportService::REASONS,
            ],
        ]);
    }

    public function buyerStore(Request $request, int $id): JsonResponse
    {
        if (UserNotifier::roleOf($request->user()) !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can report parcels here.'], 403);
        }

        return $this->store($request, 'buyer', $id);
    }

    public function riderStore(Request $request, int $id): JsonResponse
    {
        $job = DeliveryJob::where('id', $id)->where('rider_user_id', $request->user()->id)->first(['id', 'order_id']);
        if (! $job) {
            return response()->json(['message' => 'Delivery job not found.'], 404);
        }

        return $this->store($request, 'rider', (int) $job->order_id);
    }

    public function courierStore(Request $request, int $id): JsonResponse
    {
        return $this->store($request, 'courier', $id);
    }

    private function store(Request $request, string $role, int $orderId): JsonResponse
    {
        $v = Validator::make($request->all(), ParcelReportService::rules(), ParcelReportService::messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $user  = $request->user();
        $order = ParcelReportService::orderFor($user, $role, $orderId);
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $result = DB::transaction(fn () => ParcelReportService::submit($user, $role, $order, $v->validated()));

        return match ($result['error']) {
            ParcelReportService::ERR_DUPLICATE => response()->json(['message' => 'You already have an open report for this order. We will update you when it is reviewed.'], 409),
            ParcelReportService::ERR_NOT_YET   => response()->json(['message' => 'You can report a parcel problem once the order has shipped.'], 422),
            default                            => response()->json(['message' => 'Report sent. Our team will review it.', 'data' => ParcelReportService::present($result['report'])], 201),
        };
    }
}
