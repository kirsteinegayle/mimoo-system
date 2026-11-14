<?php

namespace App\Services\Refund;

use App\Models\Refund;

/** Test driver: no network, no money. Fails while $failNext is set (tests flip it). */
class FakeRefundDriver implements RefundDriver
{
    public static ?string $failNext = null;

    /** @var int number of times refund() ran (tests assert it, e.g. idempotent replays must not call again) */
    public static int $calls = 0;

    public function name(): string
    {
        return 'fake';
    }

    public function refund(Refund $refund, array $input): RefundResult
    {
        self::$calls++;
        if (self::$failNext !== null) {
            $reason = self::$failNext;
            self::$failNext = null;

            return RefundResult::failed($reason);
        }

        return RefundResult::refunded('FAKE-' . $refund->id . '-' . self::$calls);
    }
}
