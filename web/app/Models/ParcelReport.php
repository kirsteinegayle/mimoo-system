<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParcelReport extends Model
{
    protected $fillable = [
        'order_id', 'reporter_id', 'reporter_role', 'reason', 'description',
        'status', 'admin_note', 'reviewed_at', 'resolved_at',
    ];

    /** admin_note is internal: never serialised to reporters. */
    protected $hidden = ['admin_note'];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
