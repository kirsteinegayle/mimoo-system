<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourierFacility extends Model
{
    use HasFactory;

    protected $fillable = [
        'courier_id',
        'facility_name',
        'facility_code',
        'facility_type',
        'parent_facility_id',
        'status',
        'region',
        'province',
        'city',
        'address',
        'manager_name',
        'contact_number',
        'coverage_cities',
    ];

    protected $casts = [
        'coverage_cities' => 'array',
    ];

    /**
     * Get the courier company that owns the facility
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    /**
     * Get the parent facility
     */
    public function parentFacility(): BelongsTo
    {
        return $this->belongsTo(CourierFacility::class, 'parent_facility_id');
    }

    /**
     * Get child facilities
     */
    public function childFacilities(): HasMany
    {
        return $this->hasMany(CourierFacility::class, 'parent_facility_id');
    }

    /**
     * Scope to get only active facilities
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope to get facilities by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('facility_type', $type);
    }

    /**
     * Check if facility can accept new assignments
     */
    public function canAcceptAssignments(): bool
    {
        return $this->status === 'Active';
    }
}
