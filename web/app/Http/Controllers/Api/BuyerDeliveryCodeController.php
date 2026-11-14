<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryJob;
use App\Models\DeliveryOtp;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

/**
 * GET /api/buyer/orders/{id}/delivery-code  (Sanctum Bearer, buyer only)
 *
 * Never creates, refreshes, logs or caches a code. The only write: an
 * expired / exhausted code's encrypted copy is cleared (set null).
 *
 * Returns { code, expires_at, rider_first_name } only when:
 *   - the order belongs to the logged-in buyer (else the same 404 as /orders/{id}),
 *   - its delivery job is out_for_delivery,
 *   - an active (unused, unexpired, attempts left) code exists.
 * Otherwise returns code = null with a short `reason`.
 *
 * The code comes from delivery_otps.code_encrypted (Crypt), written by
 * RiderDeliveryController::requestOtp. Codes issued before that column
 * existed have no copy and return reason "code_not_viewable".
 */
class BuyerDeliveryCodeController extends Controller
{
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if ($user->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyers can access orders.'], 403);
        }

        $order = Order::where('buyer_id', $user->id)->find($id, ['id', 'buyer_id']);
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // The delivery code was removed (proof-of-delivery photo only). Same answer shape as before,
        // so old buyer apps and the web page simply hide the code card.
        return $this->none('not_required', 'No delivery code is needed. Your rider takes a photo as proof of delivery.');

        $job = DeliveryJob::where('order_id', $order->id)->latest('id')->first();
        if (! $job) {
            return $this->none('no_delivery', 'No rider is assigned yet.');
        }
        if ($job->status !== DeliveryJob::STATUS_OUT_FOR_DELIVERY) {
            return $this->none('not_out_for_delivery', 'Your parcel is not out for delivery.');
        }

        $otp = $job->otps()->whereNull('verified_at')->latest('id')->first();
        if (! $otp || ! $otp->isUsable()) {
            if ($otp && $otp->getAttribute('code_encrypted') !== null) {
                $otp->forceFill(['code_encrypted' => null])->save(); // expired / exhausted
            }
            return $this->none('no_active_code', 'Your rider has not requested a code yet.');
        }

        $code = $this->readableCode($otp);
        if ($code === null) {
            return $this->none('code_not_viewable', 'Your rider has a code ready. It cannot be shown here yet.');
        }

        return $this->noStore([
            'data' => [
                'code'             => $code,
                'expires_at'       => $otp->expires_at->toIso8601String(),
                'rider_first_name' => $this->riderFirstName($job),
                'reason'           => null,
            ],
        ]);
    }

    /** Decrypted code, ONLY while the code is active. Never logged or cached. */
    private function readableCode(DeliveryOtp $otp): ?string
    {
        $enc = $otp->getAttribute('code_encrypted');
        if (! $otp->isUsable() || ! is_string($enc) || $enc === '') {
            return null;
        }
        try {
            $code = Crypt::decryptString($enc);
        } catch (\Throwable) {
            return null; // e.g. APP_KEY rotated
        }
        return preg_match('/^\d{' . DeliveryOtp::LENGTH . '}$/', $code) ? $code : null;
    }

    private function riderFirstName(DeliveryJob $job): string
    {
        $rider = $job->rider()->first(['id', 'first_name', 'name']);
        $first = trim((string) ($rider->first_name ?? ''));
        if ($first === '') {
            $first = trim((string) strtok(trim((string) ($rider->name ?? '')), ' '));
        }
        return $first !== '' ? $first : 'your rider';
    }

    private function none(string $reason, string $message): JsonResponse
    {
        return $this->noStore([
            'data' => [
                'code'             => null,
                'expires_at'       => null,
                'rider_first_name' => null,
                'reason'           => $reason,
                'message'          => $message,
            ],
        ]);
    }

    private function noStore(array $body): JsonResponse
    {
        return response()->json($body)->header('Cache-Control', 'no-store, private');
    }
}
