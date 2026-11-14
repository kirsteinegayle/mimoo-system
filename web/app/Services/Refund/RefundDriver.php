<?php

namespace App\Services\Refund;

use App\Models\Refund;

/**
 * A way of actually returning the money. Drivers must NOT throw for business
 * failures: return RefundResult::failed(). Only a driver for a real gateway
 * may call the network, and none exists yet.
 */
interface RefundDriver
{
    public function name(): string;

    /** @param array{reference?: ?string} $input */
    public function refund(Refund $refund, array $input): RefundResult;
}
