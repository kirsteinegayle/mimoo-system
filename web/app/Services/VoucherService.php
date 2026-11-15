<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * One set of voucher rules for the buyer homepage, the voucher wallet (web +
 * mobile), checkout (web + mobile) and order cancellation.
 *
 * Time: the app runs in UTC. The admin types dates in the shop's local time
 * (config('app.display_timezone'), default Asia/Manila); they are converted to
 * UTC when saved (toUtc) and shown back in local time (local).
 *
 * Counting: vouchers.usage_count = number of ORDERS that used the voucher.
 * Claiming only adds a wallet row (voucher_usages with used_at = null) and
 * never counts as a use. usage_limit caps total uses; usage_per_user caps
 * uses per buyer (a buyer can re-claim after using it while under that cap).
 */
class VoucherService
{
    public static function tz(): string
    {
        return (string) config('app.display_timezone', 'Asia/Manila');
    }

    /** Admin form value ("2026-11-15T21:25", local time) -> UTC Carbon. */
    public static function toUtc(string $local): CarbonInterface
    {
        return Carbon::parse($local, self::tz())->utc();
    }

    /** UTC Carbon -> local time Carbon (for display / form prefill). */
    public static function local(?CarbonInterface $utc): ?CarbonInterface
    {
        return $utc?->copy()->setTimezone(self::tz());
    }

    /** Status active, started, not ended, uses left. */
    public static function isLive(Voucher $v): bool
    {
        $now = now();

        return $v->status === 'active'
            && $v->valid_from !== null && $v->valid_until !== null
            && $now->greaterThanOrEqualTo($v->valid_from)
            && $now->lessThanOrEqualTo($v->valid_until)
            && ($v->usage_limit === null || (int) $v->usage_count < (int) $v->usage_limit);
    }

    public static function liveQuery()
    {
        return Voucher::query()
            ->where('status', 'active')
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now())
            ->where(fn ($q) => $q->whereNull('usage_limit')->orWhereColumn('usage_count', '<', 'usage_limit'));
    }

    /** The buyer's current wallet row for a voucher: an unused claim, else the latest used one. */
    public static function walletRow(int $userId, int $voucherId): ?VoucherUsage
    {
        $rows = VoucherUsage::where('user_id', $userId)->where('voucher_id', $voucherId)->orderByDesc('id')->get();

        return $rows->firstWhere('used_at', null) ?? $rows->first();
    }

    public static function usesBy(int $userId, int $voucherId): int
    {
        return VoucherUsage::where('user_id', $userId)->where('voucher_id', $voucherId)->whereNotNull('used_at')->count();
    }

    /**
     * Shared card row for homepage / wallet / checkout lists.
     * is_claimed: has an unused claim; is_used: used up for this buyer.
     */
    public static function row(Voucher $v, ?User $user): array
    {
        $open = null;
        $usedUp = false;
        $last = null;
        if ($user) {
            $rows = VoucherUsage::where('user_id', $user->id)->where('voucher_id', $v->id)->orderByDesc('id')->get();
            $open = $rows->firstWhere('used_at', null);
            $last = $open ?? $rows->first();
            $usedUp = ! $open && $rows->whereNotNull('used_at')->count() >= max(1, (int) $v->usage_per_user);
        }
        $until = self::local($v->valid_until);

        return [
            'id'                    => $v->id,
            'code'                  => $v->code,
            'name'                  => $v->name,
            'description'           => $v->description,
            'type'                  => $v->type,
            'value'                 => (float) $v->value,
            'min_purchase'          => (float) $v->min_purchase,
            'max_discount'          => $v->max_discount !== null ? (float) $v->max_discount : null,
            'usage_limit'           => $v->usage_limit,
            'usage_per_user'        => $v->usage_per_user,
            'usage_count'           => (int) $v->usage_count,
            'valid_from'            => $v->valid_from?->toISOString(),
            'valid_until'           => $v->valid_until?->toISOString(),
            'valid_until_formatted' => $until?->format('M d, Y g:i A'),
            'is_claimed'            => $open !== null || $usedUp,
            'is_used'               => $usedUp,
            'claimed_at'            => $last?->claimed_at ? Carbon::parse($last->claimed_at)->toISOString() : null,
            'used_at'               => $last?->used_at?->toISOString(),
        ];
    }

    /** Live vouchers for the homepage / wallet "Available" list. */
    public static function available(?User $user, ?int $limit = null): Collection
    {
        return self::liveQuery()
            ->orderBy('valid_until')
            ->when($limit, fn ($q) => $q->limit($limit))
            ->get()
            ->map(fn (Voucher $v) => self::row($v, $user))
            ->values();
    }

    /**
     * Add a voucher to the buyer's wallet. Idempotent while an unused claim exists.
     *
     * @return array{ok: bool, status: int, message: string, voucher?: Voucher, usage?: VoucherUsage}
     */
    public static function claim(User $user, ?Voucher $v): array
    {
        if (! $v) {
            return ['ok' => false, 'status' => 404, 'message' => 'Voucher not found.'];
        }
        if ($v->status !== 'active') {
            return ['ok' => false, 'status' => 422, 'message' => $v->status === 'expired' ? 'This voucher has expired.' : 'This voucher is no longer active.'];
        }
        if (now()->lt($v->valid_from)) {
            return ['ok' => false, 'status' => 422, 'message' => 'This voucher is not available yet. It starts on ' . self::local($v->valid_from)->format('M d, Y g:i A') . '.'];
        }
        if (now()->gt($v->valid_until)) {
            return ['ok' => false, 'status' => 422, 'message' => 'This voucher has expired.'];
        }
        if ($v->usage_limit !== null && (int) $v->usage_count >= (int) $v->usage_limit) {
            return ['ok' => false, 'status' => 422, 'message' => 'This voucher has been fully used.'];
        }

        $open = VoucherUsage::where('user_id', $user->id)->where('voucher_id', $v->id)->whereNull('used_at')->first();
        if ($open) {
            return ['ok' => true, 'status' => 200, 'message' => 'You have already claimed this voucher.', 'voucher' => $v, 'usage' => $open];
        }
        if (self::usesBy($user->id, $v->id) >= max(1, (int) $v->usage_per_user)) {
            return ['ok' => false, 'status' => 422, 'message' => 'You have already used this voucher the maximum number of times.'];
        }

        $usage = new VoucherUsage();
        $usage->forceFill(['voucher_id' => $v->id, 'user_id' => $user->id, 'claimed_at' => now()])->save();

        return ['ok' => true, 'status' => 201, 'message' => 'Voucher claimed! Find it in My Vouchers and apply it at checkout.', 'voucher' => $v, 'usage' => $usage];
    }

    /**
     * Checkout check (call inside the order transaction). Locks the voucher row
     * so two orders cannot both take the last use.
     *
     * @return array{ok: bool, message?: string, voucher?: Voucher, usage?: VoucherUsage, discount?: float}
     */
    public static function prepareUse(User $user, string $code, float $total, bool $lock = true): array
    {
        $q = Voucher::where('code', strtoupper(trim($code)));
        $v = $lock ? $q->lockForUpdate()->first() : $q->first();

        if (! $v) {
            return ['ok' => false, 'message' => 'Invalid voucher code.'];
        }
        if (! self::isLive($v)) {
            return ['ok' => false, 'message' => 'This voucher has expired or is no longer available.'];
        }
        $usage = VoucherUsage::where('user_id', $user->id)->where('voucher_id', $v->id)->whereNull('used_at')->orderBy('id')->first();
        if (! $usage) {
            return ['ok' => false, 'message' => self::usesBy($user->id, $v->id) > 0
                ? 'You have already used this voucher.'
                : 'Claim this voucher first, then apply it at checkout.'];
        }
        if ($total < (float) $v->min_purchase) {
            return ['ok' => false, 'message' => 'Minimum spend of ₱' . number_format((float) $v->min_purchase, 2) . ' required for this voucher.'];
        }

        return ['ok' => true, 'voucher' => $v, 'usage' => $usage, 'discount' => (float) $v->calculateDiscount($total)];
    }

    /** After the order row exists: mark the claim used and count one use. */
    public static function markUsed(Voucher $v, VoucherUsage $usage, Order $order, float $discount): void
    {
        $usage->forceFill(['order_id' => $order->id, 'discount_amount' => $discount, 'used_at' => now()])->save();
        $v->increment('usage_count');
    }

    /** Order cancelled: give the voucher back (claim again unused) and un-count the use. */
    public static function release(Order $order): void
    {
        $usage = VoucherUsage::where('order_id', $order->id)->first();
        if (! $usage) {
            return;
        }
        $v = Voucher::find($usage->voucher_id);
        $usage->forceFill(['order_id' => null, 'discount_amount' => null, 'used_at' => null])->save();
        if ($v && (int) $v->usage_count > 0) {
            $v->decrement('usage_count');
        }
    }
}
