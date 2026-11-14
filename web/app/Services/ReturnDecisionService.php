<?php

namespace App\Services;

use App\Models\ReturnRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Seller / admin decisions on a buyer return request. Shared by
 * Seller\ReturnsController and Admin\ReturnsController so both enforce the
 * same rules.
 *
 *   seller : only a PENDING request that contains one of the seller's items.
 *   admin  : only an ESCALATED request.
 *   reject : a note is required (max 500). approve: note optional.
 *   Anything already resolved (approved / rejected / refunded / closed), or
 *   repeating an action, is refused with 422 and writes nothing.
 *
 * "Refund" is a STATUS only (approved). No payment gateway call, and
 * orders.payment_status / stock are never touched here.
 *
 * Writes seller_response (seller) or admin_response (admin), decided_by, responded_at and status in ONE update inside a row
 * lock; the ReturnRequest model event then creates exactly one buyer
 * notification (after commit), because status changes exactly once.
 */
class ReturnDecisionService
{
    public const NOTE_MAX = 500;

    /** @return array{ok:true,return:ReturnRequest}|array{ok:false,status:int,message:string,field?:string} */
    public static function seller(int $returnId, int $sellerId, string $action, ?string $note): array
    {
        if (! self::sellerOwns($returnId, $sellerId)) {
            return self::fail(404, 'Return request not found.');
        }

        return self::decide($returnId, 'pending', $action, $note, false, $sellerId, 'This request was already handled and can no longer be changed.');
    }

    /** @return array{ok:true,return:ReturnRequest}|array{ok:false,status:int,message:string,field?:string} */
    public static function admin(int $returnId, string $action, ?string $note, ?int $adminId = null): array
    {
        return self::decide($returnId, 'escalated', $action, $note, true, $adminId, 'Only escalated requests can be decided, and each only once.');
    }

    public static function sellerOwns(int $returnId, int $sellerId): bool
    {
        // seller_id decides when set; NULL rows (multi-seller / old data) use the order items.
        return ReturnRequest::whereKey($returnId)->forSeller($sellerId)->exists();
    }

    /** Streams a stored return photo, only if the file belongs to that request. */
    public static function photo(ReturnRequest $rr, string $filename)
    {
        $path = collect($rr->images ?? [])->first(fn ($p) => basename((string) $p) === $filename);
        if (! $path || ! preg_match('/^return_[A-Za-z0-9]{32}\.(jpg|png)$/', $filename)
            || ! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return response(Storage::disk('public')->get($path), 200, [
            'Content-Type'           => str_ends_with($filename, '.png') ? 'image/png' : 'image/jpeg',
            'Cache-Control'          => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private static function decide(int $returnId, string $requiredStatus, string $action, ?string $note, bool $admin, ?int $actorId, string $resolvedMsg): array
    {
        if (! in_array($action, ['approve', 'reject'], true)) {
            return self::fail(422, 'Action must be approve or reject.', 'action');
        }
        $note = trim((string) $note);
        if ($action === 'reject' && $note === '') {
            return self::fail(422, 'A note is required when rejecting a return request.', 'note');
        }
        if (mb_strlen($note) > self::NOTE_MAX) {
            return self::fail(422, 'The note must not exceed ' . self::NOTE_MAX . ' characters.', 'note');
        }

        return DB::transaction(function () use ($returnId, $requiredStatus, $action, $note, $admin, $actorId, $resolvedMsg) {
            $rr = ReturnRequest::whereKey($returnId)->lockForUpdate()->first();
            if (! $rr) {
                return self::fail(404, 'Return request not found.');
            }
            if ($rr->status !== $requiredStatus) {
                return self::fail(422, $resolvedMsg);
            }

            $fields = [
                'status'       => $action === 'approve' ? 'approved' : 'rejected',
                'responded_at' => now(),
                'decided_by'   => $actorId,
            ];
            if ($admin) {
                // The seller's own note stays untouched; the admin note has its own column.
                $fields['admin_response'] = $note !== '' ? $note : ($action === 'approve' ? 'Approved.' : 'Rejected.');
            } else {
                $fields['seller_response'] = $note !== '' ? $note : null;
            }

            $rr->update($fields);

            return ['ok' => true, 'return' => $rr];
        });
    }

    private static function fail(int $status, string $message, ?string $field = null): array
    {
        return ['ok' => false, 'status' => $status, 'message' => $message] + ($field ? ['field' => $field] : []);
    }
}
