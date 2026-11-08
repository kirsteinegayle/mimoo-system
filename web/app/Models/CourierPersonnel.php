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
        'name',
        'contact_number',
        'role',
        'status',
    ];

    /**
     * Get the courier company.
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }
}
