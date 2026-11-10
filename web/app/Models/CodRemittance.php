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

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_user_id');
    }

    public function deliveryJobs(): HasMany
    {
        return $this->hasMany(DeliveryJob::class, 'cod_remittance_id');
    }
}
