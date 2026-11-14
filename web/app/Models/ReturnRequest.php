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
        'seller_id',
        'decided_by',
        'seller_response',
        'admin_response',
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
        // Owner = the single seller of the order. Several sellers (or an item without
        // a seller) => NULL on purpose; ownership then falls back to the order items.
        static::creating(function (ReturnRequest $rr) {
            if ($rr->seller_id === null && $rr->order_id) {
                $rr->seller_id = self::singleSellerOf((int) $rr->order_id);
            }
        });

        // In-app notification for the buyer whenever the request status changes.
        // The service never throws, so this can never break a web request.
        static::created(function (ReturnRequest $rr) {
            BuyerNotificationService::returnStatusChanged($rr);
            \App\Services\SellerNotificationService::returnRequested($rr);
        });

        static::updated(function (ReturnRequest $rr) {
            if ($rr->wasChanged('status')) {
                BuyerNotificationService::returnStatusChanged($rr);
                if ($rr->status === 'escalated') {
                    \App\Services\SellerNotificationService::returnEscalated($rr);
                }
            }
        });
    }

    /** Seller id when every item of the order has the same seller, else null (never guesses). */
    public static function singleSellerOf(int $orderId): ?int
    {
        $items = \App\Models\OrderItem::where('order_id', $orderId)->pluck('seller_id');
        if ($items->isEmpty() || $items->contains(null)) {
            return null;
        }
        $unique = $items->unique();

        return $unique->count() === 1 ? (int) $unique->first() : null;
    }

    /** Returns the seller may handle: seller_id when set, else (NULL) the old order_items rule. */
    public function scopeForSeller($query, int $sellerId)
    {
        return $query->where(function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId)
                ->orWhere(fn ($n) => $n->whereNull('seller_id')
                    ->whereIn('order_id', \App\Models\OrderItem::where('seller_id', $sellerId)->select('order_id')));
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

    public function refund(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Refund::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
