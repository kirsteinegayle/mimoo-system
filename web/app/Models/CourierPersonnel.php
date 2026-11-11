<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourierPersonnel extends Model
{
    use HasFactory;

    protected $table = 'courier_personnel';

    protected $fillable = [
        'courier_id',
        'user_id',
        'name',
        'contact_number',
        'role',
        'status',
        'is_online',
        'last_checked_in_at',
    ];

    protected $casts = [
        'is_online'          => 'boolean',
        'last_checked_in_at' => 'datetime',
    ];

    /**
     * Get the users account linked to this personnel (riders only).
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Get the courier company.
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }
}
