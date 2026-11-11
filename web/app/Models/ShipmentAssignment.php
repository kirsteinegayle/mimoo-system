<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShipmentAssignment extends Model
{
    use HasFactory;

    /** Seller "Parcel picked up" notification when pickup_status becomes picked_up (never throws). */
    protected static function booted(): void
    {
        static::updated(fn (ShipmentAssignment $sa) => \App\Services\SellerNotificationService::shipmentUpdated($sa));
    }

    protected $fillable = [
        'order_id',
        'courier_id',
        'assigned_by',
        'assigned_at',
        'assignment_status',
        'accepted_at',
        'rejected_at',
        'rejection_reason',
        'acceptance_deadline',
        'weight',
        'dimensions',
        'pickup_instructions',
        'suggested_reason',
        'match_score',
        // Pickup management fields
        'pickup_status',
        'scheduled_date',
        'scheduled_time_window',
        'assigned_personnel_id',
        'picked_up_at',
        'picked_up_by',
        'attempt_count',
        'last_attempt_at',
        'cancellation_reason',
        'failure_reason',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'acceptance_deadline' => 'datetime',
        'weight' => 'decimal:2',
        'scheduled_date' => 'date',
        'picked_up_at' => 'datetime',
        'last_attempt_at' => 'datetime',
    ];

    /**
     * Scope to only active assignments (pending or accepted, and not pickup-cancelled).
     */
    public function scopeActive($query)
    {
        return $query->whereIn('assignment_status', ['pending', 'accepted'])
                     ->where('pickup_status', '<>', 'cancelled');
    }

    /**
     * Check if assignment is pending.
     */
    public function isPending(): bool
    {
        return $this->assignment_status === 'pending';
    }

    /**
     * Check if assignment is accepted.
     */
    public function isAccepted(): bool
    {
        return $this->assignment_status === 'accepted';
    }

    /**
     * Check if assignment is rejected.
     */
    public function isRejected(): bool
    {
        return $this->assignment_status === 'rejected';
    }

    /**
     * Check if assignment is overdue (deadline passed and still pending).
     */
    public function isOverdue(): bool
    {
        return $this->isPending() && $this->acceptance_deadline->isPast();
    }

    /**
     * Check if assignment is expiring soon (within 2 hours).
     */
    public function isExpiringSoon(): bool
    {
        return $this->isPending() && 
               $this->acceptance_deadline->isFuture() && 
               $this->acceptance_deadline->diffInHours(now()) <= 2;
    }

    /**
     * Accept the assignment.
     */
    public function accept(int $userId): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'assignment_status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $this->addHistory('accepted', $userId);

        return true;
    }

    /**
     * Reject the assignment.
     */
    public function reject(int $userId, string $reason): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'assignment_status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $this->addHistory('rejected', $userId, $reason);

        return true;
    }

    /**
     * Add history entry.
     */
    public function addHistory(string $action, int $userId, ?string $notes = null): void
    {
        $this->history()->create([
            'action' => $action,
            'performed_by' => $userId,
            'notes' => $notes,
            'created_at' => now(),
        ]);
    }

    /**
     * Get the order.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the courier.
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    /**
     * Get the assigner.
     */
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the history entries.
     */
    public function history(): HasMany
    {
        return $this->hasMany(ShipmentAssignmentHistory::class, 'assignment_id');
    }

    /**
     * Get the assigned personnel.
     */
    public function personnel()
    {
        return $this->belongsTo(CourierPersonnel::class, 'assigned_personnel_id');
    }

    /**
     * Get the user who picked up the shipment.
     */
    public function pickedUpBy()
    {
        return $this->belongsTo(User::class, 'picked_up_by');
    }

    /**
     * Check if pickup is pending.
     */
    public function isPickupPending(): bool
    {
        return $this->pickup_status === 'pending_pickup';
    }

    /**
     * Check if pickup is scheduled.
     */
    public function isPickupScheduled(): bool
    {
        return $this->pickup_status === 'scheduled';
    }

    /**
     * Check if pickup is completed.
     */
    public function isPickedUp(): bool
    {
        return $this->pickup_status === 'picked_up';
    }

    /**
     * Check if pickup failed.
     */
    public function isPickupFailed(): bool
    {
        return $this->pickup_status === 'failed';
    }

    /**
     * Check if pickup is cancelled.
     */
    public function isPickupCancelled(): bool
    {
        return $this->pickup_status === 'cancelled';
    }

    /**
     * Check if status transition is allowed.
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $allowed = [
            'pending_pickup' => ['scheduled', 'cancelled'],
            'scheduled' => ['scheduled', 'picked_up', 'failed', 'cancelled'], // scheduled->scheduled is reschedule
            'failed' => ['scheduled', 'cancelled'],
            'picked_up' => [], // Final state
            'cancelled' => [], // Final state
        ];

        return in_array($newStatus, $allowed[$this->pickup_status] ?? []);
    }
}

