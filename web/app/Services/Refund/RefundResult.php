<?php

namespace App\Services\Refund;

final class RefundResult
{
    private function __construct(
        public readonly string $status,          // refunded | processing | failed
        public readonly ?string $reference = null,
        public readonly ?string $failureReason = null,
    ) {
    }

    public static function refunded(?string $reference): self
    {
        return new self('refunded', $reference);
    }

    /** Async gateways: accepted, final answer comes later. */
    public static function processing(?string $reference): self
    {
        return new self('processing', $reference);
    }

    public static function failed(string $reason): self
    {
        return new self('failed', null, $reason);
    }
}
