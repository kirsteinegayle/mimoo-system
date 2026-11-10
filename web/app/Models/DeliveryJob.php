<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Rider app: last-mile delivery job for one order.
 *
 * Buyer / seller / address / COD are READ through $job->order. This model
 * never writes to orders (status and payment_status stay untouched).
 */
class DeliveryJob extends Model
{
    public const STATUS_ASSIGNED         = 'assigned';
    public const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    public const STATUS_DELIVERED        = 'delivered';
    public const STATUS_FAILED           = 'failed';
    public const STATUS_RETURN_TO_SENDER = 'return_to_sender';

    /** Statuses that still need rider action. */
    public const ACTIVE_STATUSES = [
        self::STATUS_ASSIGNED,
        self::STATUS_OUT_FOR_DELIVERY,
        self::STATUS_FAILED,
    ];

    /** Allowed failed-attempt reasons (match the rider app). */
    public const FAIL_REASONS = [
        'buyer_not_around' => 'Buyer not around',
        'wrong_address'    => 'Wrong address',
        'refused'          => 'Refused',
        'other'            => 'Other',
    ];

    protected $fillable = [
        'order_id', 'rider_user_id', 'personnel_id', 'courier_id', 'facility_id',
        'assigned_by', 'status', 'attempt_count', 'max_attempts', 'failure_reasons',
        'last_attempt_at', 'cod_amount', 'cod_collected', 'cod_collected_at',
        'cod_remittance_id', 'pod_photo_path', 'pod_uploaded_at', 'otp_verified_at',
        'assigned_at', 'out_for_delivery_at', 'delivered_at', 'returned_at',
    ];

    protected $casts = [
        'failure_reasons'     => 'array',
        'attempt_count'       => 'integer',
        'max_attempts'        => 'integer',
        'cod_amount'          => 'decimal:2',
        'cod_collected'       => 'decimal:2',
        'last_attempt_at'     => 'datetime',
        'cod_collected_at'    => 'datetime',
        'pod_uploaded_at'     => 'datetime',
        'otp_verified_at'     => 'datetime',
        'assigned_at'         => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at'        => 'datetime',
        'returned_at'         => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_user_id');
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(CourierPersonnel::class, 'personnel_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(CourierFacility::class, 'facility_id');
    }

    public function remittance(): BelongsTo
    {
        return $this->belongsTo(CodRemittance::class, 'cod_remittance_id');
    }

    public function otps(): HasMany
    {
        return $this->hasMany(DeliveryOtp::class);
    }

    public function earning(): HasOne
    {
        return $this->hasOne(RiderEarning::class);
    }

    public function hasCod(): bool
    {
        return (float) $this->cod_amount > 0;
    }

    public function isFinalAttemptUsed(): bool
    {
        return $this->attempt_count >= $this->max_attempts;
    }

    /** Can the rider (re)start a delivery run for this job? */
    public function canGoOutForDelivery(): bool
    {
        return $this->status === self::STATUS_ASSIGNED
            || ($this->status === self::STATUS_FAILED && ! $this->isFinalAttemptUsed());
    }

    public function canReturnToSender(): bool
    {
        return $this->status === self::STATUS_FAILED && $this->isFinalAttemptUsed();
    }
}
