<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyerNotification extends Model
{
    protected $fillable = ['buyer_id', 'type', 'title', 'body', 'data', 'read_at'];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
