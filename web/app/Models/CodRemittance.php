<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Rider app: one COD hand-over from a rider to the courier company / hub. */
class CodRemittance extends Model
{
    protected $fillable = [
        'reference', 'rider_user_id', 'personnel_id', 'courier_id', 'facility_id',
        'amount', 'parcels_count', 'status', 'remitted_at', 'confirmed_at', 'notes',
    ];

    protected $casts = [
        'amount'        => 'decimal:2',
        'parcels_count' => 'integer',
        'remitted_at'   => 'datetime',
        'confirmed_at'  => 'datetime',
    ];

    protected static function booted(): void
    {
        // The courier company (and its staff) must know cash is waiting to be confirmed. One per remittance.
        static::created(function (CodRemittance $r) {
            \App\Services\CourierNotificationService::create((int) $r->courier_id, 'cod_remitted', 'COD remitted',
                '₱' . number_format((float) $r->amount, 2) . " from a rider is waiting for your confirmation (ref {$r->reference}).",
                'cod_remitted:' . $r->id, ['remittance_id' => $r->id], '/courier/cod-remittance');
        });
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_user_id');
    }

    public function deliveryJobs(): HasMany
    {
        return $this->hasMany(DeliveryJob::class, 'cod_remittance_id');
    }
}
