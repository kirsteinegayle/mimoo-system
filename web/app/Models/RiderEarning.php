<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Rider app: payout line per completed job. */
class RiderEarning extends Model
{
    /** MOCK rates (same values as the rider app mock). Replace with real rates. */
    public const PICKUP_RATE   = 30.00;
    public const DELIVERY_RATE = 50.00;

    protected $fillable = [
        'rider_user_id', 'delivery_job_id', 'shipment_assignment_id', 'order_id',
        'type', 'amount', 'earned_at',
    ];

    protected $casts = [
        'amount'    => 'decimal:2',
        'earned_at' => 'datetime',
    ];

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_user_id');
    }

    public function deliveryJob(): BelongsTo
    {
        return $this->belongsTo(DeliveryJob::class);
    }
}
