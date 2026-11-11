<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerNotification extends Model
{
    protected $fillable = ['seller_id', 'type', 'title', 'message', 'data', 'url', 'dedupe_key', 'read_at'];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
