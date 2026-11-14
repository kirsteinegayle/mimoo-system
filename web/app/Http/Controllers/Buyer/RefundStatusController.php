<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\ReturnRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /buyer/refunds (session, buyer accounts only): refund status of MY return
 * requests, keyed by return id. Web only, so the shared /buyer/returns JSON that
 * the mobile app also uses keeps its exact shape. Never exposes the internal
 * failure reason or the processing admin.
 */
class RefundStatusController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can access this endpoint.'], 403);
        }

        $refunds = Refund::whereIn('return_request_id', ReturnRequest::where('buyer_id', $user->id)->select('id'))->get();

        return response()->json(['data' => $refunds->mapWithKeys(fn (Refund $r) => [$r->return_request_id => [
            'status'      => $r->status,
            'amount'      => (float) $r->amount,
            'method'      => $r->method,
            'reference'   => $r->status === 'refunded' ? $r->reference : null,
            'refunded_at' => $r->refunded_at?->toISOString(),
        ]])->all()]);
    }
}
