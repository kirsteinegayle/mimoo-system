<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyerAddress extends Model
{
    public const MAX_PER_BUYER = 10;

    protected $fillable = [
        'buyer_id',
        'label',
        'recipient_name',
        'phone',
        'region',
        'province',
        'district',
        'municipality_city',
        'barangay',
        'street_address',
        'postal_code',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /** One-line address used as the order's shipping_address snapshot. */
    public function fullAddress(): string
    {
        $parts = array_filter([
            $this->street_address,
            $this->barangay,
            $this->municipality_city,
            $this->district,
            $this->province,
            $this->region,
            $this->postal_code,
        ], fn ($p) => $p !== null && trim((string) $p) !== '');

        return implode(', ', $parts);
    }
}
