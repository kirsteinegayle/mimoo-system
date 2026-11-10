<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /api/delivery-jobs/{id}/pod-photo  (Sanctum Bearer)
 *
 * Streams a rider's proof-of-delivery photo from the PRIVATE "local" disk
 * (written by RiderDeliveryController::uploadPod). Never returns a path or a
 * public link. Read-only: nothing is written.
 *
 * Who may view (role = $user->role ?? $user->account_type, same as the
 * existing EnsureRiderRole / EnsureCourierRole / EnsureRole middleware):
 *   - buyer            : account_type buyer AND owns the job's order (orders.buyer_id)
 *   - rider            : role rider AND delivery_jobs.rider_user_id = user id
 *   - courier          : role courier AND delivery_jobs.courier_id = user id
 *   - seller           : role seller AND has an item in the job's order
 *                        (order_items.seller_id, same as SellerOrderController)
 *   - logistics_staff  : any job (hub accounts already see all parcels on web)
 *
 * 404 = job not found, or no photo / file missing. 403 = not allowed.
 * The 403 check runs before the photo check so others learn nothing about it.
 *
 * Also: GET /api/buyer/orders/{id}/pod-photo (buyerOrderPhoto) — same file
 * rules, looked up by the buyer's own order (like /orders/{id}/delivery-code).
 */
class DeliveryPodPhotoController extends Controller
{
    // Reused only for buyerGuard() (403 for non-buyer accounts).
    use BuyerApiHelpers;

    /** Same disk and folder as RiderDeliveryController::POD_DISK / POD_FOLDER. */
    private const POD_DISK   = 'local';
    private const POD_FOLDER = 'rider-pod';

    public function show(Request $request, int $id): Response
    {
        $job = DeliveryJob::with('order:id,buyer_id')->find($id);
        if (! $job) {
            return response()->json(['message' => 'Delivery job not found.'], 404);
        }

        if (! $this->canView($request->user(), $job)) {
            return response()->json(['message' => 'You are not allowed to view this photo.'], 403);
        }

        return $this->photoResponse($job);
    }

    /**
     * GET /api/buyer/orders/{id}/pod-photo (Sanctum, buyer only)
     *
     * Latest delivery job of the buyer's own order that has a POD photo.
     * 404 (same as /orders/{id}) when the order is not theirs, has no job,
     * or has no photo.
     */
    public function buyerOrderPhoto(Request $request, int $id): Response
    {
        if ($err = $this->buyerGuard($request)) {
            return $err;
        }

        $order = Order::where('buyer_id', $request->user()->id)->find($id, ['id', 'buyer_id']);
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $job = DeliveryJob::where('order_id', $order->id)
            ->whereNotNull('pod_photo_path')
            ->latest('id')
            ->first();
        if (! $job) {
            return response()->json(['message' => 'No proof of delivery photo.'], 404);
        }

        return $this->photoResponse($job);
    }

    /** Validates the stored path and streams the file. Shared by both routes. */
    private function photoResponse(DeliveryJob $job): Response
    {
        $path = (string) $job->pod_photo_path;

        // Only accept the exact shape uploadPod() writes:
        //   rider-pod/{job id}/pod_<32 alnum>.(jpg|png)
        // Anything else (traversal, other folders, other jobs) is treated as missing.
        $pattern = '#^' . self::POD_FOLDER . '/' . $job->id . '/pod_[A-Za-z0-9]{32}\.(jpg|png)$#';
        if ($path === '' || ! preg_match($pattern, $path, $m)) {
            return response()->json(['message' => 'No proof of delivery photo.'], 404);
        }

        $disk = Storage::disk(self::POD_DISK);
        if (! $disk->exists($path)) {
            return response()->json(['message' => 'No proof of delivery photo.'], 404);
        }

        return response()->file($disk->path($path), [
            'Content-Type'           => $m[1] === 'png' ? 'image/png' : 'image/jpeg',
            'Content-Disposition'    => 'inline; filename="proof-of-delivery-' . $job->id . '.' . $m[1] . '"',
            'Cache-Control'          => 'private, max-age=300',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function canView(?User $user, DeliveryJob $job): bool
    {
        if (! $user) {
            return false;
        }

        $role = $user->role ?? $user->account_type;

        if ($user->account_type === 'buyer') {
            return $job->order !== null && (int) $job->order->buyer_id === (int) $user->id;
        }

        return match ($role) {
            'rider'           => (int) $job->rider_user_id === (int) $user->id,
            'courier'         => $job->courier_id !== null && (int) $job->courier_id === (int) $user->id,
            'seller'          => $job->order !== null
                && $job->order->items()->where('seller_id', $user->id)->exists(),
            'logistics_staff' => true,
            default           => false,
        };
    }
}
