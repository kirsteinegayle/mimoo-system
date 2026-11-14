<?php

namespace App\Models;

use App\Services\BuyerNotificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    public const ACTIVE = ['pending', 'processing', 'refunded'];

    protected $fillable = [
        'return_request_id', 'order_id', 'amount', 'method', 'gateway', 'reference', 'idempotency_key',
        'status', 'failure_reason', 'processed_by', 'active_return_id', 'refunded_at',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'refunded_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // One buyer notification per refund status change (processing / failed here;
        // "refunded" is announced by the ReturnRequest status change to refunded).
        static::updated(function (Refund $refund) {
            if ($refund->wasChanged('status')) {
                BuyerNotificationService::refundStatusChanged($refund);
            }
        });
    }

    public function returnRequest(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** Buyer / admin facing shape (never includes anything card related; there is nothing to include). */
    public function toPayload(): array
    {
        return [
            'id'             => $this->id,
            'return_id'      => $this->return_request_id,
            'amount'         => (float) $this->amount,
            'method'         => $this->method,
            'status'         => $this->status,
            'reference'      => $this->reference,
            'failure_reason' => $this->failure_reason,
            'refunded_at'    => $this->refunded_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
