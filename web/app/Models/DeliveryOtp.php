<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Rider app: buyer OTP for a delivery. Only the hash is stored. */
class DeliveryOtp extends Model
{
    public const LENGTH       = 6;
    public const TTL_MINUTES  = 15;
    public const MAX_ATTEMPTS = 5;

    protected $fillable = ['delivery_job_id', 'code_hash', 'attempts', 'expires_at', 'verified_at'];

    protected $hidden = ['code_hash'];

    protected $casts = [
        'attempts'    => 'integer',
        'expires_at'  => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function deliveryJob(): BelongsTo
    {
        return $this->belongsTo(DeliveryJob::class);
    }

    public function isUsable(): bool
    {
        return $this->verified_at === null
            && $this->expires_at->isFuture()
            && $this->attempts < self::MAX_ATTEMPTS;
    }
}
