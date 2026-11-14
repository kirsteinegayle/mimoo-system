<?php

namespace App\Services\Refund;

use App\Models\Refund;

/**
 * The admin sends the money outside the system (COD cash, bank / e-wallet
 * transfer, ...) and records it here. Nothing is called; a reference typed by
 * the admin (receipt / transfer number) is required.
 */
class ManualRefundDriver implements RefundDriver
{
    public function name(): string
    {
        return 'manual';
    }

    public function refund(Refund $refund, array $input): RefundResult
    {
        $reference = trim((string) ($input['reference'] ?? ''));
        if ($reference === '') {
            return RefundResult::failed('A reference (receipt or transfer number) is required to mark a refund as processed.');
        }

        return RefundResult::refunded(mb_substr($reference, 0, 100));
    }
}
