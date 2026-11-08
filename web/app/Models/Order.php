<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'shipping_name',
        'shipping_address',
        'shipping_phone',
        'idempotency_key',
        'waybill_number',
        'waybill_generated_at',
        'waybill_printed_at',
        'verified_at',
        'verified_by',
        'tracking_status',
        'tracking_message',
        'tracking_updated_at',
        'assigned_courier_id',
        'courier_assigned_at',
        'courier_accepted_at',
        'current_facility_id',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'waybill_generated_at' => 'datetime',
        'waybill_printed_at' => 'datetime',
        'verified_at' => 'datetime',
        'tracking_updated_at' => 'datetime',
        'courier_assigned_at' => 'datetime',
        'courier_accepted_at' => 'datetime',
    ];

    /**
     * Small hook for in-app buyer notifications (order placed + status changes),
     * including status changes made by sellers on the website. The service
     * catches every exception, so this can never break a web request.
     */
    protected static function booted(): void
    {
        static::created(function (Order $order) {
            \App\Services\BuyerNotificationService::orderPlaced($order);
        });

        static::updated(function (Order $order) {
            if ($order->wasChanged('status')) {
                \App\Services\BuyerNotificationService::orderStatusChanged($order);
            }
        });
    }

    /**
     * True when the order has a return request that is still open
     * (pending / approved / escalated). Such orders must NOT be auto-completed
     * or marked received.
     */
    public function hasOpenReturn(): bool
    {
        return $this->returnRequests()
            ->whereIn('status', \App\Models\ReturnRequest::OPEN_STATUSES)
            ->exists();
    }

    /**
     * Scope: exclude orders with an open return request. Use this in any
     * auto-complete job: Order::where('status','shipped')->withoutOpenReturn()
     */
    public function scopeWithoutOpenReturn($query)
    {
        return $query->whereDoesntHave('returnRequests', function ($q) {
            $q->whereIn('status', \App\Models\ReturnRequest::OPEN_STATUSES);
        });
    }

    public function returnRequests(): HasMany
    {
        return $this->hasMany(\App\Models\ReturnRequest::class);
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        // Can only cancel if pending or paid (not packed, shipped, or completed)
        return in_array($this->status, ['pending', 'paid']);
    }

    /**
     * Check if order is valid (not cancelled or failed).
     */
    public function isValid(): bool
    {
        return !in_array($this->status, ['cancelled', 'failed']);
    }

    /**
     * Get the buyer that owns the order.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the shipment assignment for this order.
     * NOTE: Use activeAssignment() instead for the current active assignment.
     * This returns the most recent active assignment, or null if none exists.
     */
    public function shipmentAssignment()
    {
        return $this->hasOne(ShipmentAssignment::class)
            ->active()
            ->latest('id');
    }

    /**
     * Get the active shipment assignment for this order.
     * Returns only pending or accepted assignments that are not pickup-cancelled.
     */
    public function activeAssignment()
    {
        return $this->hasOne(ShipmentAssignment::class)
            ->active()
            ->latest('id');
    }

    /**
     * Get all shipment assignments for this order (including rejected).
     */
    public function shipmentAssignments()
    {
        return $this->hasMany(ShipmentAssignment::class);
    }

    /**
     * Get the logistics staff who verified this order.
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the assigned courier for this order.
     */
    public function assignedCourier()
    {
        return $this->belongsTo(User::class, 'assigned_courier_id');
    }

    /**
     * Get the current facility where this order is located.
     */
    public function currentFacility()
    {
        return $this->belongsTo(CourierFacility::class, 'current_facility_id');
    }

    /**
     * Update tracking status for buyer visibility.
     */
    public function updateTracking(string $status, string $message): void
    {
        $this->update([
            'tracking_status' => $status,
            'tracking_message' => $message,
            'tracking_updated_at' => now(),
        ]);
    }

    /**
     * Generate unique waybill number for this order.
     */
    public function generateWaybillNumber(): string
    {
        if ($this->waybill_number) {
            return $this->waybill_number;
        }

        // Format: MIMWB-YYYYMMDD-ORDERID-RANDOM
        // Example: MIMWB-20261103-00000123-A4F2
        $date = now()->format('Ymd');
        $orderId = str_pad($this->id, 8, '0', STR_PAD_LEFT);
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));

        $waybillNumber = "MIMWB-{$date}-{$orderId}-{$random}";

        $this->update([
            'waybill_number' => $waybillNumber,
            'waybill_generated_at' => now(),
        ]);

        return $waybillNumber;
    }

    /**
     * Mark waybill as printed.
     */
    public function markWaybillPrinted(): void
    {
        if (!$this->waybill_printed_at) {
            $this->update(['waybill_printed_at' => now()]);
        }
    }

    /**
     * Check if order has waybill.
     */
    public function hasWaybill(): bool
    {
        return !is_null($this->waybill_number);
    }
}