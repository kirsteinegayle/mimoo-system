<?php

namespace App\Models;

use App\Services\BuyerNotificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnRequest extends Model
{
    public const REASONS = ['Damaged', 'Wrong item', 'Not as described', 'Missing item', 'Other'];

    /** Statuses that count as an "open" request (blocks a second request and auto-completion). */
    public const OPEN_STATUSES = ['pending', 'approved', 'escalated'];

    /** Days after the order's updated_at during which a return can be requested. */
    public const REQUEST_WINDOW_DAYS = 7;

    /** Days after a rejection during which the buyer can escalate (once). */
    public const ESCALATE_WINDOW_DAYS = 3;

    protected $fillable = [
        'order_id',
        'buyer_id',
        'reason',
        'description',
        'images',
        'status',
        'seller_response',
        'responded_at',
        'escalated_at',
    ];

    protected $casts = [
        'images'       => 'array',
        'responded_at' => 'datetime',
        'escalated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // In-app notification for the buyer whenever the request status changes.
        // The service never throws, so this can never break a web request.
        static::created(function (ReturnRequest $rr) {
            BuyerNotificationService::returnStatusChanged($rr);
        });

        static::updated(function (ReturnRequest $rr) {
            if ($rr->wasChanged('status')) {
                BuyerNotificationService::returnStatusChanged($rr);
            }
        });
    }

    public function isOpen(): bool
    {
        return in_array($this->status, self::OPEN_STATUSES, true);
    }

    public function canEscalate(): bool
    {
        $since = $this->responded_at ?? $this->updated_at;

        return $this->status === 'rejected'
            && $this->escalated_at === null
            && $since !== null
            && $since->copy()->addDays(self::ESCALATE_WINDOW_DAYS)->isFuture();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
