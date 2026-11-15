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
        'shipping_barangay',
        'shipping_municipality_city',
        'shipping_province',
        'shipping_region',
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
        'shipped_at' => 'datetime',
        'completed_at' => 'datetime',
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
                $order->stampStatusTimestamp();
            }
        });
    }

    /**
     * Stamps orders.shipped_at / completed_at the FIRST time the status becomes
     * shipped / completed (every code path goes through the model event, so no
     * status logic is touched). Written with a plain query so updated_at (which
     * the old windows and auto-complete use) does not move.
     */
    public function stampStatusTimestamp(): void
    {
        $column = match ($this->status) {
            'shipped'   => 'shipped_at',
            'completed' => 'completed_at',
            default     => null,
        };
        if ($column === null || $this->getAttribute($column) !== null) {
            return;
        }
        try {
            $now = now();
            \Illuminate\Support\Facades\DB::table($this->getTable())
                ->where('id', $this->getKey())->whereNull($column)->update([$column => $now]);
            $this->setAttribute($column, $now);
            $this->syncOriginalAttribute($column);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Order status timestamp failed: ' . $e->getMessage());
        }
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

    // ── Recipient: the ONE source of truth for "buyer info" ──────────────────
    // Seller, Courier, Logistics and Rider screens must all use these instead
    // of reading shipping_* / buyer->name by hand.
    //
    // Rule: the order's shipping snapshot (who receives the parcel) wins; the
    // buyer account is only a fallback for legacy orders with missing fields.

    // Load full order rows (no column-restricted selects): recipient() reads
    // shipping_* and the structured shipping_barangay/_municipality_city/
    // _province/_region columns, which may not exist before the migration runs.

    /**
     * @return array{name: ?string, phone: ?string, address: ?string,
     *               barangay: ?string, city: ?string, province: ?string, region: ?string}
     */
    public function recipient(): array
    {
        $blank  = fn ($v) => $v === null || trim((string) $v) === '';
        // Only touch the buyer account (extra query) when the snapshot is missing data.
        $needsAccount = $blank($this->shipping_name) || $blank($this->shipping_phone);
        $buyer  = ($needsAccount && $this->buyer_id) ? $this->buyer : null;
        $parsed = self::parseAddress($this->shipping_address);

        $accountName = $buyer
            ? ($buyer->name ?: trim(($buyer->first_name ?? '') . ' ' . ($buyer->last_name ?? '')))
            : null;

        $pick = fn (...$vals) => collect($vals)->first(fn ($v) => ! $blank($v));

        return [
            'name'     => $pick($this->shipping_name, $accountName),
            'phone'    => $pick($this->shipping_phone, $buyer?->contact_number),
            'address'  => $pick($this->shipping_address),
            'barangay' => $pick($this->shipping_barangay, $parsed['barangay']),
            'city'     => $pick($this->shipping_municipality_city, $parsed['city']),
            'province' => $pick($this->shipping_province, $parsed['province']),
            'region'   => $pick($this->shipping_region, $parsed['region']),
        ];
    }

    /**
     * Flat buyer_* keys used by the courier/logistics pages and apps.
     * Missing values come back as 'N/A' (never null) so UIs can't crash.
     */
    public function buyerFields(): array
    {
        $r = $this->recipient();

        return [
            'buyer_name'     => $r['name'] ?? 'N/A',
            'buyer_phone'    => $r['phone'] ?? 'N/A',
            'buyer_address'  => $r['address'] ?? 'N/A',
            'buyer_barangay' => $r['barangay'] ?? 'N/A',
            'buyer_city'     => $r['city'] ?? 'N/A',
            'buyer_province' => $r['province'] ?? 'N/A',
            'buyer_region'   => $r['region'] ?? 'N/A',
        ];
    }

    /** "City, Barangay"-style short destination for lists. */
    public function destinationLabel(): string
    {
        $r = $this->recipient();
        $label = implode(', ', array_filter([$r['city'], $r['province']]));

        return $label !== '' ? $label : 'Not provided';
    }

    /**
     * Best-effort split of a free-text address for legacy orders. Expects the
     * BuyerAddress::fullAddress() order: street, barangay, city, [district],
     * province, [region], [postal].
     *
     * @return array{barangay: ?string, city: ?string, province: ?string, region: ?string}
     */
    public static function parseAddress(?string $address): array
    {
        $out = ['barangay' => null, 'city' => null, 'province' => null, 'region' => null];
        $parts = array_values(array_filter(array_map('trim', explode(',', (string) $address)), fn ($p) => $p !== ''));

        // Drop trailing postal code, then a trailing region token.
        if ($parts && preg_match('/^\d{4}$/', end($parts))) {
            array_pop($parts);
        }
        if ($parts && preg_match('/\b(Region|NCR|National Capital|CALABARZON|MIMAROPA|BARMM|CAR|Cordillera|Metro Manila)\b/i', end($parts))) {
            $out['region'] = array_pop($parts);
        }

        $n = count($parts);
        if ($n >= 4) {
            $out['barangay'] = $parts[1];
            $out['city']     = $parts[2];
            $out['province'] = $parts[$n - 1];
        } elseif ($n === 3) {
            $out['barangay'] = $parts[1];
            $out['city']     = $parts[2];
        } elseif ($n === 2) {
            $out['city'] = $parts[1];
        }

        if ($out['barangay']) {
            $out['barangay'] = preg_replace('/^(Brgy\.?|Barangay)\s+/i', '', $out['barangay']);
        }
        if ($out['city']) {
            $out['city'] = preg_replace('/^(City of|Municipality of)\s+/i', '', $out['city']);
        }

        return $out;
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
        $this->fill([
            'tracking_status' => $status,
            'tracking_message' => $message,
            'tracking_updated_at' => now(),
        ]);

        // A tracking-only write must NOT move orders.updated_at: the 7-day
        // auto-complete / return windows and the review window count from it.
        // If the caller left other attributes dirty (e.g. status), save normally
        // so that real change still bumps updated_at. Model events still fire.
        $trackingOnly = array_diff(
            array_keys($this->getDirty()),
            ['tracking_status', 'tracking_message', 'tracking_updated_at']
        ) === [];

        if (! $trackingOnly) {
            $this->save();
            return;
        }

        $timestamps = $this->timestamps;
        $this->timestamps = false;
        try {
            $this->save();
        } finally {
            $this->timestamps = $timestamps;
        }
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