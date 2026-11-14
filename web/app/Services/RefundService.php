<?php

namespace App\Services;

use App\Models\Refund;
use App\Models\ReturnRequest;
use App\Services\Refund\RefundDriver;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Refund records and status flow for APPROVED return requests.
 *
 *   return approved --process()--> refund pending --driver--> refunded | processing | failed
 *   refunded  -> return_requests.status = refunded (buyer gets "Refund completed" from that change)
 *   failed    -> can be retried (same row, active_return_id was NULL, so the unique "one active refund
 *                per return" rule is free again)
 *
 * Idempotent: the same idempotency_key returns the stored refund and never calls the driver again;
 * a different key on a return that already has an active refund is refused. The default driver is
 * "manual" (config refunds.driver): no gateway is ever called. orders.payment_status becomes "refunded" in the
 * same transaction as the refund (once); stock is not touched (see config/refunds.php).
 */
class RefundService
{
    public static function driver(?string $name = null): RefundDriver
    {
        $name  = $name ?: (string) config('refunds.driver', 'manual');
        $class = config("refunds.drivers.{$name}");
        if (! $class) {
            throw new \InvalidArgumentException("Unknown refund driver '{$name}'.");
        }

        return app($class);
    }

    /** Only returns a status that already exists as a known value; otherwise null (= do not touch). */
    public static function paymentStatusAfterRefund(): ?string
    {
        $want = (string) config('refunds.payment_status_on_refund');

        return in_array($want, (array) config('refunds.known_payment_statuses', []), true) ? $want : null;
    }

    /**
     * @param array{amount?: mixed, reference?: ?string, method?: ?string, idempotency_key?: ?string} $input
     * @return array{ok:true,refund:Refund,idempotent:bool}|array{ok:false,status:int,message:string,field?:string,refund?:Refund}
     */
    public static function process(int $returnId, array $input, ?int $adminId, ?string $driverName = null): array
    {
        $driver = self::driver($driverName);

        try {
            return DB::transaction(function () use ($returnId, $input, $adminId, $driver) {
                $rr = ReturnRequest::with('order')->whereKey($returnId)->lockForUpdate()->first();
                if (! $rr || ! $rr->order) {
                    return self::fail(404, 'Return request not found.');
                }

                $key = trim((string) ($input['idempotency_key'] ?? '')) ?: "return-{$rr->id}";
                if (mb_strlen($key) > 100) {
                    return self::fail(422, 'The idempotency key is too long.', 'idempotency_key');
                }
                $existing = Refund::where('return_request_id', $rr->id)->lockForUpdate()->first();

                // Replay of the same request: return what is stored, call nothing.
                if ($existing && $existing->idempotency_key === $key && $existing->status !== 'failed') {
                    return ['ok' => true, 'refund' => $existing, 'idempotent' => true];
                }
                if ($existing && in_array($existing->status, Refund::ACTIVE, true)) {
                    return self::fail(422, 'This return already has an active refund (' . $existing->status . ').', null, $existing);
                }
                if ($rr->status !== 'approved') {
                    return self::fail(422, $rr->status === 'refunded'
                        ? 'This return was already refunded.'
                        : 'Only an approved return request can be refunded.');
                }

                $amount = $input['amount'] ?? null;
                if (! is_numeric($amount) || (float) $amount <= 0) {
                    return self::fail(422, 'Enter a refund amount greater than zero.', 'amount');
                }
                $amount = round((float) $amount, 2);
                if ($amount > (float) $rr->order->total + 0.001) {
                    return self::fail(422, 'The refund cannot be more than the order total (₱' . number_format((float) $rr->order->total, 2) . ').', 'amount');
                }
                $method = strtolower(trim((string) ($input['method'] ?? '')) ?: (string) ($rr->order->payment_method ?: 'cod'));
                if (! preg_match('/^[a-z0-9_\-]{2,30}$/', $method)) {
                    return self::fail(422, 'Invalid payment method.', 'method');
                }

                $fields = [
                    'order_id' => $rr->order_id, 'amount' => $amount, 'method' => $method, 'gateway' => $driver->name(),
                    'status' => 'pending', 'failure_reason' => null, 'processed_by' => $adminId,
                    'active_return_id' => $rr->id, 'reference' => null, 'refunded_at' => null,
                ];
                if ($existing) { // retry of a failed refund: same row
                    $refund = $existing;
                    $refund->update($fields);
                } else {
                    $refund = Refund::create($fields + ['return_request_id' => $rr->id, 'idempotency_key' => $key]);
                }

                $result = $driver->refund($refund, ['reference' => $input['reference'] ?? null]);

                if ($result->status === 'refunded') {
                    $refund->update(['status' => 'refunded', 'reference' => $result->reference, 'refunded_at' => now()]);
                    $rr->update(['status' => 'refunded']);
                    if (config('refunds.return_stock')) {
                        Log::warning('refunds.return_stock is ON but restocking is not implemented; stock was not changed.', ['return_id' => $rr->id]);
                    }
                    // Same transaction as the refund. Plain query: orders.updated_at (auto-complete / windows)
                    // does not move, and a repeat can never write twice (the replay returns earlier anyway).
                    if ($status = self::paymentStatusAfterRefund()) {
                        DB::table('orders')->where('id', $rr->order_id)->where('payment_status', '<>', $status)->update(['payment_status' => $status]);
                    }
                } elseif ($result->status === 'processing') {
                    $refund->update(['status' => 'processing', 'reference' => $result->reference]);
                } else {
                    $refund->update(['status' => 'failed', 'failure_reason' => mb_substr((string) $result->failureReason, 0, 255), 'active_return_id' => null]);

                    return self::fail(422, (string) $result->failureReason, 'reference', $refund->fresh());
                }

                return ['ok' => true, 'refund' => $refund->fresh(), 'idempotent' => false];
            });
        } catch (QueryException $e) {
            // e.g. the same idempotency_key used for another return
            Log::warning('Refund insert failed: ' . $e->getMessage());

            return self::fail(422, 'This refund request conflicts with an existing refund. Use a different idempotency key.', 'idempotency_key');
        }
    }

    private static function fail(int $status, string $message, ?string $field = null, ?Refund $refund = null): array
    {
        return ['ok' => false, 'status' => $status, 'message' => $message]
            + ($field ? ['field' => $field] : []) + ($refund ? ['refund' => $refund] : []);
    }
}
