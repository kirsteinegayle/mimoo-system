<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\BuyerNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\RiderEarning;
use App\Models\RiderNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Rider delivery endpoints (/api/rider-app/deliveries/*).
 *
 * A rider sees ONLY delivery_jobs where rider_user_id = their user id AND the
 * linked courier_personnel row is theirs and active.
 *
 * Buyer, seller, address and COD are always READ through the order. Nothing
 * here writes to order_items, shipment_assignments or shipment_scans, and
 * orders.payment_status is never changed.
 *
 * Order writes: buyer-facing tracking (orders.tracking_status /
 * tracking_message / tracking_updated_at) through Order::updateTracking()
 * (does not move orders.updated_at), plus the P3 status sync
 * (out_for_delivery: in_transit -> shipped, see syncOrderStatus()), both
 * with the order row locked inside the same transaction as the delivery_jobs
 * change. A failure is logged and never blocks the rider action.
 *
 * Route middleware: ['auth:sanctum', 'rider.role']
 */
class RiderDeliveryController extends Controller
{
    // Reused only for imageError() (JPG/PNG by content, max 5 MB).
    use BuyerApiHelpers;

    /** Private disk: POD photos show a buyer's door, so they are not public. */
    private const POD_DISK   = 'local';
    private const POD_FOLDER = 'rider-pod';

    /**
     * Buyer-facing orders.tracking_status values written by the rider flow.
     * Same lower_snake_case style as the existing writers (received_logistics,
     * assigned_courier, accepted_courier, scanned_at_facility).
     */
    public const TRACK_OUT_FOR_DELIVERY = 'out_for_delivery';
    public const TRACK_DELIVERED        = 'delivered';
    public const TRACK_FAILED           = 'delivery_failed';
    public const TRACK_RETURNING        = 'returning_to_sender';

    /** GET /deliveries?status=active|done|<status> */
    public function index(Request $request): JsonResponse
    {
        $personnel = $this->myPersonnel($request);
        if (! $personnel) {
            return response()->json(['message' => 'Rider profile not found.'], 404);
        }

        $query = $this->mine($request, $personnel)->with('order.items', 'order.buyer');

        $status = $request->query('status', 'active');
        if ($status === 'active') {
            $query->whereIn('status', DeliveryJob::ACTIVE_STATUSES);
        } elseif ($status === 'done') {
            $query->whereNotIn('status', DeliveryJob::ACTIVE_STATUSES);
        } elseif ($status !== 'all') {
            $query->where('status', $status);
        }

        $perPage   = min(max((int) $request->query('per_page', 20), 1), 50);
        $paginated = $query
            ->orderByRaw("FIELD(status, 'out_for_delivery', 'failed', 'assigned') DESC")
            ->orderBy('assigned_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginated->getCollection()->map(fn (DeliveryJob $j) => $this->summary($j)),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /** GET /deliveries/{id} */
    public function show(Request $request, int $id): JsonResponse
    {
        $job = $this->findMine($request, $id);
        if (! $job) {
            return response()->json(['message' => 'Delivery not found.'], 404);
        }

        return response()->json(['data' => $this->detail($job)]);
    }

    /** POST /deliveries/{id}/out-for-delivery — assigned (or failed < 3) -> out_for_delivery */
    public function outForDelivery(Request $request, int $id): JsonResponse
    {
        return $this->locked($request, $id, function (DeliveryJob $job) use ($request) {
            if ($job->status === DeliveryJob::STATUS_OUT_FOR_DELIVERY) {
                return response()->json(['message' => 'Already out for delivery.', 'idempotent' => true, 'data' => $this->detail($job)]);
            }
            if (! $job->canGoOutForDelivery()) {
                return response()->json(['message' => $job->canReturnToSender()
                    ? 'All delivery attempts are used. Return the parcel to the sender.'
                    : 'This delivery cannot be started from its current status.'], 422);
            }

            $job->update([
                'status'              => DeliveryJob::STATUS_OUT_FOR_DELIVERY,
                'out_for_delivery_at' => now(),
                // New attempt: proof from a previous attempt does not carry over.
                'pod_photo_path'      => null,
                'pod_uploaded_at'     => null,
                'otp_verified_at'     => null,
            ]);
            $job->otps()->whereNull('verified_at')->delete();

            $attempt = $job->attempt_count + 1;
            $this->writeTracking($job, self::TRACK_OUT_FOR_DELIVERY,
                'Your parcel is out for delivery with ' . $this->riderFirstName($request) . '.'
                . ($attempt > 1 ? " Delivery attempt {$attempt} of {$job->max_attempts}." : ''));
            $this->notifyBuyer($job, self::TRACK_OUT_FOR_DELIVERY, 'Out for delivery',
                'Your parcel is out for delivery with ' . $this->riderFirstName($request) . '.');

            return response()->json([
                'message' => 'Out for delivery. Attempt ' . ($job->attempt_count + 1) . '/' . $job->max_attempts . '.',
                'data'    => $this->detail($job->fresh()),
            ]);
        });
    }

    /**
     * POST /deliveries/{id}/otp: kept ONLY so an old app build does not get a 404.
     * The delivery code was removed: proof of delivery (photo) is what confirms a delivery now.
     * Nothing is issued or stored, and no code is returned.
     */
    public function requestOtp(Request $request, int $id): JsonResponse
    {
        return $this->locked($request, $id, function (DeliveryJob $job) {
            if ($job->status !== DeliveryJob::STATUS_OUT_FOR_DELIVERY) {
                return response()->json(['message' => 'Start the delivery first.'], 422);
            }

            return response()->json([
                'message'    => 'No delivery code is needed any more. Take the proof-of-delivery photo to finish.',
                'expires_in' => 0,
            ]);
        });
    }

    /** POST /deliveries/{id}/pod (multipart: photo) — stores the file, saves the path only. */
    public function uploadPod(Request $request, int $id): JsonResponse
    {
        $file = $request->file('photo');
        if ($error = $this->imageError($file)) {
            return $this->validationError('photo', $error);
        }

        return $this->locked($request, $id, function (DeliveryJob $job) use ($file) {
            if ($job->status !== DeliveryJob::STATUS_OUT_FOR_DELIVERY) {
                return response()->json(['message' => 'Proof of delivery can only be added while out for delivery.'], 422);
            }

            $ext      = $file->getMimeType() === 'image/png' ? 'png' : 'jpg';
            $folder   = self::POD_FOLDER . '/' . $job->id;
            $filename = 'pod_' . Str::random(32) . '.' . $ext;
            $path     = Storage::disk(self::POD_DISK)->putFileAs($folder, $file, $filename);
            if (! $path) {
                return response()->json(['message' => 'Could not save the photo. Please try again.'], 500);
            }

            $old = $job->pod_photo_path;
            $job->update(['pod_photo_path' => $path, 'pod_uploaded_at' => now()]);
            if ($old && $old !== $path) {
                Storage::disk(self::POD_DISK)->delete($old);
            }

            return response()->json(['message' => 'Proof of delivery saved.', 'data' => $this->detail($job->fresh())]);
        });
    }

    /**
     * POST /deliveries/{id}/deliver { cod_collected? }
     * Requires: out_for_delivery + POD photo + exact COD amount. An `otp` field sent by an old
     * app build is ignored (it is neither required nor checked).
     */
    public function deliver(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'cod_collected' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
        ]);

        return $this->locked($request, $id, function (DeliveryJob $job) use ($data, $request) {
            if ($job->status === DeliveryJob::STATUS_DELIVERED) {
                return response()->json(['message' => 'Already delivered.', 'idempotent' => true, 'data' => $this->detail($job)]);
            }
            if ($job->status !== DeliveryJob::STATUS_OUT_FOR_DELIVERY) {
                return response()->json(['message' => 'Start the delivery first.'], 422);
            }
            if (! $job->pod_photo_path) {
                return $this->validationError('photo', 'Proof of delivery is required. Take the delivery photo before marking this parcel as delivered.');
            }

            // COD must match the snapshot exactly.
            if ($job->hasCod()) {
                $collected = isset($data['cod_collected']) ? round((float) $data['cod_collected'], 2) : null;
                if ($collected === null || abs($collected - (float) $job->cod_amount) > 0.001) {
                    return $this->validationError('cod_collected',
                        'Collect exactly ₱' . number_format((float) $job->cod_amount, 2) . ' before completing.');
                }
            }

            $now = now();
            $job->update([
                'status'           => DeliveryJob::STATUS_DELIVERED,
                'attempt_count'    => $job->attempt_count + 1,
                'last_attempt_at'  => $now,
                'otp_verified_at'  => $now, // column kept: it is the "proof accepted" time, so old payloads keep otp_verified = true
                'cod_collected'    => $job->hasCod() ? $job->cod_amount : 0,
                'cod_collected_at' => $job->hasCod() ? $now : null,
                'delivered_at'     => $now,
            ]);

            $this->writeTracking($job, self::TRACK_DELIVERED, 'Parcel delivered.');
            $this->notifyBuyer($job, self::TRACK_DELIVERED, 'Parcel delivered', 'Your parcel was delivered.');

            RiderEarning::firstOrCreate(
                ['delivery_job_id' => $job->id],
                [
                    'rider_user_id' => $request->user()->id,
                    'order_id'      => $job->order_id,
                    'type'          => 'delivery',
                    'amount'        => RiderEarning::DELIVERY_RATE,
                    'earned_at'     => $now,
                ]
            );

            return response()->json([
                'message' => 'Delivered.',
                'earned'  => RiderEarning::DELIVERY_RATE,
                'data'    => $this->detail($job->fresh()),
            ]);
        });
    }

    /** POST /deliveries/{id}/fail { reason, note? } — max 3 attempts. */
    public function fail(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'in:' . implode(',', array_keys(DeliveryJob::FAIL_REASONS))],
            'note'   => ['nullable', 'string', 'max:255', 'required_if:reason,other'],
        ]);

        return $this->locked($request, $id, function (DeliveryJob $job) use ($data) {
            if ($job->status !== DeliveryJob::STATUS_OUT_FOR_DELIVERY) {
                return response()->json(['message' => 'Only a delivery in progress can be marked failed.'], 422);
            }

            $attempt  = $job->attempt_count + 1;
            $reasons  = $job->failure_reasons ?? [];
            $reasons[] = [
                'attempt' => $attempt,
                'reason'  => $data['reason'],
                'label'   => DeliveryJob::FAIL_REASONS[$data['reason']],
                'note'    => $data['note'] ?? null,
                'at'      => now()->toIso8601String(),
            ];

            $job->update([
                'status'          => DeliveryJob::STATUS_FAILED,
                'attempt_count'   => $attempt,
                'failure_reasons' => $reasons,
                'last_attempt_at' => now(),
                'pod_photo_path'  => null,
                'pod_uploaded_at' => null,
                'otp_verified_at' => null,
            ]);
            $job->otps()->whereNull('verified_at')->delete();

            $final = $attempt >= $job->max_attempts;

            $this->writeTracking($job, self::TRACK_FAILED,
                "Delivery attempt {$attempt} of {$job->max_attempts} failed.");
            $this->notifyBuyer($job, self::TRACK_FAILED, 'Delivery attempt failed',
                "Delivery attempt {$attempt} of {$job->max_attempts} failed.");

            return response()->json([
                'message' => $final
                    ? 'Final attempt failed. Return the parcel to the sender.'
                    : "Attempt {$attempt}/{$job->max_attempts} recorded.",
                'can_retry'             => ! $final,
                'must_return_to_sender' => $final,
                'data'                  => $this->detail($job->fresh()),
            ]);
        });
    }

    /** POST /deliveries/{id}/return — only after the final failed attempt. */
    public function returnToSender(Request $request, int $id): JsonResponse
    {
        return $this->locked($request, $id, function (DeliveryJob $job) use ($request) {
            if ($job->status === DeliveryJob::STATUS_RETURN_TO_SENDER) {
                return response()->json(['message' => 'Already marked return to sender.', 'idempotent' => true, 'data' => $this->detail($job)]);
            }
            if (! $job->canReturnToSender()) {
                return response()->json(['message' => 'Return to sender is allowed only after the final failed attempt.'], 422);
            }

            $job->update(['status' => DeliveryJob::STATUS_RETURN_TO_SENDER, 'returned_at' => now()]);

            $this->writeTracking($job, self::TRACK_RETURNING, 'Parcel is being returned to the sender.');
            $this->notifyBuyer($job, self::TRACK_RETURNING, 'Returning to sender',
                'Your parcel is being returned to the sender.');

            RiderNotification::notify(
                $request->user()->id,
                'return_to_sender',
                'Return to sender',
                ($job->order?->waybill_number ?? 'Parcel') . ' will be returned to the sender.',
                $job->id,
                $job->order_id
            );

            return response()->json(['message' => 'Marked return to sender. Hand the parcel back at the hub.', 'data' => $this->detail($job->fresh())]);
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Runs $fn inside a transaction with the rider's job row locked. */
    private function locked(Request $request, int $id, \Closure $fn): JsonResponse
    {
        $personnel = $this->myPersonnel($request);
        if (! $personnel) {
            return response()->json(['message' => 'Rider profile not found.'], 404);
        }

        return DB::transaction(function () use ($request, $personnel, $id, $fn) {
            $job = $this->mine($request, $personnel)->where('id', $id)->lockForUpdate()->first();
            if (! $job) {
                return response()->json(['message' => 'Delivery not found.'], 404);
            }
            return $fn($job);
        });
    }

    /**
     * Writes buyer-facing tracking for the job's order via Order::updateTracking().
     *
     * Runs as a nested transaction (savepoint) inside locked(), so it commits or
     * rolls back together with the delivery_jobs change. If the tracking write
     * itself fails, only the savepoint is rolled back, the error is logged, and
     * the rider action still succeeds. The order row is locked (lockForUpdate),
     * then syncOrderStatus() runs, then tracking_* is written without moving
     * orders.updated_at.
     */
    private function writeTracking(DeliveryJob $job, string $status, string $message): void
    {
        try {
            DB::transaction(function () use ($job, $status, $message) {
                $order = Order::whereKey($job->order_id)->lockForUpdate()->first();
                if (! $order) {
                    throw new \RuntimeException('Order not found for delivery job.');
                }
                self::syncOrderStatus($order, $status);
                $order->updateTracking($status, $message);
            });
        } catch (\Throwable $e) {
            Log::warning('Rider tracking update failed', [
                'delivery_job_id' => $job->id,
                'order_id'        => $job->order_id,
                'tracking_status' => $status,
                'error'           => $e->getMessage(),
            ]);
        }
    }

    /**
     * P3 status sync: maps a rider event onto orders.status (order row is
     * already locked by writeTracking, same transaction as the rider action).
     *
     *   out_for_delivery     in_transit -> shipped (any other status: no change)
     *   delivered            no change (buyer still confirms "Received")
     *   delivery_failed      no change
     *   returning_to_sender  no change
     *
     * Never touches completed / cancelled orders or orders with an open return
     * request, never moves status backwards, never writes payment_status.
     * The status change goes through Eloquent, so updated_at and model events
     * behave as for any status change, EXCEPT the generic "Order shipped"
     * buyer notification: the rider's own "Out for delivery" notification
     * (notifyBuyer) covers this step, so the buyer gets exactly one.
     */
    public static function syncOrderStatus(Order $order, string $trackingStatus): void
    {
        if ($trackingStatus !== self::TRACK_OUT_FOR_DELIVERY) {
            return;
        }
        if (in_array($order->status, ['completed', 'cancelled'], true) || $order->hasOpenReturn()) {
            return;
        }
        if ($order->status === 'in_transit') {
            \App\Services\BuyerNotificationService::withoutOrderStatusNotification(
                fn () => $order->update(['status' => 'shipped'])
            );
        }
    }

    /**
     * In-app buyer notification for a rider event (same table, fields and
     * 'order_status' type as BuyerNotificationService, so the buyer app and
     * web bell show it with no app change). data.status stays orders.status;
     * the rider event is in data.tracking_status.
     *
     * Called only after a successful state change, so blocked / idempotent
     * calls create nothing. Inserted after the surrounding transaction commits
     * (same as the service). Any failure is logged and never breaks the rider
     * action. Text never contains buyer phone or address.
     */
    private function notifyBuyer(DeliveryJob $job, string $trackingStatus, string $title, string $body): void
    {
        try {
            $order = Order::find($job->order_id);
            if (! $order || ! $order->buyer_id) {
                return;
            }
            $buyerId = (int) $order->buyer_id;
            $data    = [
                'order_id'        => $order->id,
                'status'          => $order->status,
                'tracking_status' => $trackingStatus,
                'delivery_job_id' => $job->id,
            ];

            DB::afterCommit(function () use ($buyerId, $title, $body, $data) {
                try {
                    BuyerNotification::create([
                        'buyer_id' => $buyerId,
                        'type'     => 'order_status',
                        'title'    => $title,
                        'body'     => $body,
                        'data'     => $data,
                    ]);
                } catch (\Throwable $e) {
                    Log::warning('Rider buyer-notification insert failed: ' . $e->getMessage(), $data);
                }
            });
        } catch (\Throwable $e) {
            Log::warning('Rider buyer-notification failed', [
                'delivery_job_id' => $job->id,
                'order_id'        => $job->order_id,
                'tracking_status' => $trackingStatus,
                'error'           => $e->getMessage(),
            ]);
        }
    }

    /** Rider first name only (never phone or surname) for buyer-facing messages. */
    private function riderFirstName(Request $request): string
    {
        $user  = $request->user();
        $first = trim((string) ($user->first_name ?? ''));
        if ($first === '') {
            $first = trim((string) strtok(trim((string) ($user->name ?? '')), ' '));
        }
        return $first !== '' ? $first : 'your rider';
    }

    private function mine(Request $request, CourierPersonnel $personnel)
    {
        return DeliveryJob::query()
            ->where('rider_user_id', $request->user()->id)
            ->where('personnel_id', $personnel->id);
    }

    private function findMine(Request $request, int $id): ?DeliveryJob
    {
        $personnel = $this->myPersonnel($request);
        if (! $personnel) {
            return null;
        }
        return $this->mine($request, $personnel)
            ->with('order.items', 'order.buyer', 'facility')
            ->where('id', $id)
            ->first();
    }

    /** Same lookup as RiderPickupController. */
    private function myPersonnel(Request $request): ?CourierPersonnel
    {
        return CourierPersonnel::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();
    }

    private function summary(DeliveryJob $job): array
    {
        $order = $job->order;

        return [
            'id'             => $job->id,
            'order_id'       => $job->order_id,
            'order_number'   => $order ? 'MIM-' . str_pad((string) $order->id, 8, '0', STR_PAD_LEFT) : null,
            'waybill_number' => $order?->waybill_number,
            'status'         => $job->status,
            'attempt'        => $this->attemptLabel($job),
            'buyer_name'     => $order?->shipping_name ?? $order?->buyer?->name,
            'address'        => $order?->shipping_address,
            'cod_amount'     => (float) $job->cod_amount,
            'assigned_at'    => $job->assigned_at?->toIso8601String(),
        ];
    }

    private function detail(DeliveryJob $job): array
    {
        $job->loadMissing('order.items', 'order.buyer', 'facility');
        $order = $job->order;

        return $this->summary($job) + [
            'buyer' => $order ? [
                'name'    => $order->shipping_name ?? $order->buyer?->name,
                'phone'   => $order->shipping_phone ?? $order->buyer?->contact_number,
                'address' => $order->shipping_address,
            ] : null,
            'seller'          => $order ? $this->sellerFromOrder($order) : null,
            'hub'             => $job->facility ? [
                'id'   => $job->facility->id,
                'name' => $job->facility->facility_name,
                'city' => $job->facility->city,
            ] : null,
            'payment_method'  => $order?->payment_method,
            'order_total'     => $order ? (float) $order->total : null,
            'items'           => $order ? $order->items->map(fn ($i) => [
                'name'     => $i->product_name,
                'quantity' => (int) $i->quantity,
            ])->values() : [],
            'attempt_count'   => $job->attempt_count,
            'max_attempts'    => $job->max_attempts,
            'failure_reasons' => $job->failure_reasons ?? [],
            'pod_uploaded'    => (bool) $job->pod_photo_path,
            'otp_verified'    => (bool) $job->otp_verified_at,
            'cod_collected'   => $job->cod_collected !== null ? (float) $job->cod_collected : null,
            'can_start'       => $job->canGoOutForDelivery(),
            'can_return'      => $job->canReturnToSender(),
            'out_for_delivery_at' => $job->out_for_delivery_at?->toIso8601String(),
            'delivered_at'    => $job->delivered_at?->toIso8601String(),
            'returned_at'     => $job->returned_at?->toIso8601String(),
        ];
    }

    private function attemptLabel(DeliveryJob $job): string
    {
        $n = $job->status === DeliveryJob::STATUS_OUT_FOR_DELIVERY || $job->status === DeliveryJob::STATUS_ASSIGNED
            ? $job->attempt_count + 1
            : max(1, $job->attempt_count);
        return min($n, $job->max_attempts) . '/' . $job->max_attempts;
    }

    /** Seller is read through order_items.seller_id -> users (same as RiderPickupController). */
    private function sellerFromOrder(Order $order): ?array
    {
        $sellerId = $order->items->first()?->seller_id;
        $seller   = $sellerId ? User::find($sellerId) : null;
        if (! $seller) {
            return null;
        }

        return [
            'name'    => $seller->business_name ?? $seller->name,
            'phone'   => $seller->contact_number,
            'address' => trim(implode(', ', array_filter([
                $seller->street_address,
                $seller->barangay,
                $seller->municipality_city,
                $seller->province,
            ]))),
        ];
    }
}
