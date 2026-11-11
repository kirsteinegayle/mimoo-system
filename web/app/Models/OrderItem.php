<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /** Seller "New order" notification (one per seller per order; never throws). */
    protected static function booted(): void
    {
        static::created(fn (OrderItem $item) => \App\Services\SellerNotificationService::orderItemCreated($item));
    }

    protected $fillable = [
        'order_id',
        'product_id',
        'seller_id',
        'product_name',
        'variant_id',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'variant_snapshot' => 'array',
    ];

    /**
     * Get the seller that owns the order item.
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the order that owns the item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for the order item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the subtotal for this order item.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }
}
