<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rider extends Model
{
    use HasFactory;

    protected $fillable = [
        // Personal Information
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birthdate',
        'gender',
        'contact_number',
        'email',
        'profile_picture',
        
        // Account Information
        'rider_id',
        'username',
        'password',
        
        // Branch Assignment
        'courier_company_id',
        'assigned_branch_id',
        'employment_status',
        
        // Delivery Information
        'service_areas',
        'vehicle_type',
        'plate_number',
        'drivers_license_number',
        
        // Address Information
        'region',
        'province',
        'city_municipality',
        'barangay',
        'street_address',
        
        // Supporting Documents
        'government_id',
        'drivers_license',
        'vehicle_or_cr',
        
        // Status & Verification
        'verification_status',
        'verified_at',
        'verified_by',
        'rejection_reason',
        
        // Delivery Availability
        'is_available_for_delivery',
        'last_active_at',
        
        // Privacy & Terms
        'privacy_policy_accepted',
        'privacy_accepted_at',
    ];

    protected $casts = [
        'service_areas' => 'array',
        'birthdate' => 'date',
        'verified_at' => 'datetime',
        'last_active_at' => 'datetime',
        'privacy_accepted_at' => 'datetime',
        'privacy_policy_accepted' => 'boolean',
        'is_available_for_delivery' => 'boolean',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Get the courier company that the rider belongs to
     */
    public function courierCompany(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_company_id');
    }

    /**
     * Get the assigned branch/facility
     */
    public function assignedBranch(): BelongsTo
    {
        return $this->belongsTo(CourierFacility::class, 'assigned_branch_id');
    }

    /**
     * Get the admin who verified this rider
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope to get only verified riders
     */
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'approved');
    }

    /**
     * Scope to get only active riders
     */
    public function scopeActive($query)
    {
        return $query->where('employment_status', 'active');
    }

    /**
     * Scope to get riders available for delivery
     */
    public function scopeAvailableForDelivery($query)
    {
        return $query->where('is_available_for_delivery', true)
                     ->where('employment_status', 'active')
                     ->where('verification_status', 'approved');
    }

    /**
     * Check if rider needs license and OR/CR based on vehicle type
     */
    public function requiresLicense(): bool
    {
        return in_array($this->vehicle_type, ['motorcycle', 'car', 'tricycle']);
    }

    /**
     * Generate unique rider ID
     */
    public static function generateRiderId(): string
    {
        do {
            // Format: RDR-YYYYMMDD-XXXX
            $riderId = 'RDR-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('rider_id', $riderId)->exists());

        return $riderId;
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute(): string
    {
        $name = $this->first_name;
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        $name .= ' ' . $this->last_name;
        if ($this->suffix) {
            $name .= ' ' . $this->suffix;
        }
        return $name;
    }
}
