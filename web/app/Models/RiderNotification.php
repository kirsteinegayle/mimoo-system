<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Rider app: in-app notification for a rider. */
class RiderNotification extends Model
{
    protected $fillable = [
        'rider_user_id', 'type', 'title', 'body', 'delivery_job_id', 'order_id', 'read_at',
    ];

    protected $casts = ['read_at' => 'datetime'];

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_user_id');
    }

    /** Never throws: a failed notification must not break a rider action. */
    public static function notify(int $riderUserId, string $type, string $title, ?string $body = null, ?int $jobId = null, ?int $orderId = null): void
    {
        try {
            static::create([
                'rider_user_id'   => $riderUserId,
                'type'            => $type,
                'title'           => $title,
                'body'            => $body,
                'delivery_job_id' => $jobId,
                'order_id'        => $orderId,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
