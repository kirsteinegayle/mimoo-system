<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentAssignmentHistory extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Only created_at, no updated_at

    protected $table = 'shipment_assignment_history';

    protected $fillable = [
        'assignment_id',
        'action',
        'performed_by',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the assignment.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ShipmentAssignment::class, 'assignment_id');
    }

    /**
     * Get the user who performed the action.
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
