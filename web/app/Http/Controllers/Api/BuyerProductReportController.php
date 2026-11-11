<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Buyer mobile: report a product (auth:sanctum, buyer accounts only).
 * Same rules as the web endpoint via ProductReportService.
 *
 * POST /api/buyer/products/{id}/report  { reason, description }
 *   201  { message, data: { id, product_id, reason, status } }
 *   401  guest (auth:sanctum)   403  not a buyer / own product
 *   404  product not found      409  already reported (pending)
 *   422  validation             429  rate limited (route throttle)
 *
 * Errors always carry `message` (the mobile client shows it as-is).
 */
class BuyerProductReportController extends Controller
{
    use BuyerApiHelpers;

    public function store(Request $request, int $id): JsonResponse
    {
        if (! $request->user()) {
            return response()->json(['message' => 'Please log in to report a product.'], 401);
        }
        if ($err = $this->buyerGuard($request)) return $err;

        $product = Product::find($id);
        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $v = Validator::make($request->all(), ProductReportService::rules(), ProductReportService::messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()->toArray()], 422);
        }

        $result = ProductReportService::submit($request->user(), $product, $v->validated());

        if ($result['error'] === ProductReportService::ERR_DUPLICATE) {
            return response()->json([
                'message' => 'You already reported this product. Our team is still reviewing it.',
                'reason'  => 'already_reported',
            ], 409);
        }
        if ($result['error'] === ProductReportService::ERR_OWN) {
            return response()->json(['message' => 'You cannot report your own product.', 'reason' => 'own_product'], 403);
        }

        $report = $result['report'];

        return response()->json([
            'message' => 'Thanks for your report. Our team will review it shortly.',
            'data'    => [
                'id'         => $report->id,
                'product_id' => $report->product_id,
                'reason'     => $report->reason,
                'status'     => $report->status,
            ],
        ], 201);
    }
}
