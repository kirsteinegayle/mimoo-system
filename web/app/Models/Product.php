<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'name',
        'description',
        'category',
        'price',
        'sale_price',
        'stock',
        'low_stock_threshold',
        'sku',
        'status',
        'approval_status',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'images',
        'main_image_index',
        'weight',
        'brand',
        'has_variants',
        'variant_options',
        'variants',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'low_stock_threshold' => 'integer',
        'main_image_index' => 'integer',
        'weight' => 'decimal:2',
        'images' => 'array',
        'has_variants' => 'boolean',
        'variant_options' => 'array',
        'variants' => 'array',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the seller that owns the product.
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the admin who approved the product.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the stock logs for the product.
     */
    public function stockLogs(): HasMany
    {
        return $this->hasMany(StockLog::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get buyer reviews for this product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get total units sold.
     */
    public function getTotalSoldAttribute(): int
    {
        return $this->orderItems()->sum('quantity');
    }

    /**
     * Get the main product image URL.
     */
    public function getMainImageAttribute(): ?string
    {
        if (empty($this->images)) {
            return null;
        }

        $index = $this->main_image_index ?? 0;
        return $this->images[$index] ?? $this->images[0] ?? null;
    }

    /**
     * Check if product is in stock.
     */
    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    /**
     * Check if product is low stock (based on threshold).
     */
    public function isLowStock(): bool
    {
        $threshold = $this->low_stock_threshold ?? 5;
        return $this->stock > 0 && $this->stock <= $threshold;
    }

    /**
     * Get stock status text for display.
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->stock <= 0) {
            return 'Out of stock';
        }

        if ($this->stock <= 10) {
            return "Only {$this->stock} left";
        }

        return 'In stock';
    }

    /**
     * Get the effective price (sale price if available, otherwise regular price).
     */
    public function getEffectivePriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Check if product is on sale.
     */
    public function isOnSale(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->price;
    }
}
