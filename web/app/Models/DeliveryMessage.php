<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Rider <-> buyer chat message for one delivery job. */
class DeliveryMessage extends Model
{
    public const ROLE_RIDER = 'rider';
    public const ROLE_BUYER = 'buyer';

    public const MAX_LENGTH = 500;

    protected $fillable = ['delivery_job_id', 'sender_role', 'sender_id', 'body', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];

    public function job(): BelongsTo
    {
        return $this->belongsTo(DeliveryJob::class, 'delivery_job_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
