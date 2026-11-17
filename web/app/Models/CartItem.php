<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'variant_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'variant_snapshot' => 'array',
    ];

    /**
     * Get the cart that owns the item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product for the cart item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the line total for this cart item.
     */
    public function getLineTotalAttribute(): float
    {
        if (!$this->product || $this->product->trashed()) {
            return 0;
        }

        $price = $this->product->sale_price ?? $this->product->price;
        return $price * $this->quantity;
    }

    /**
     * Check if this cart item is valid (product available, stock sufficient).
     */
    public function isValid(): bool
    {
        if (!$this->product || $this->product->trashed()) {
            return false;
        }

        if ($this->product->status !== 'active' || $this->product->sellerIsBlocked()) {
            return false;
        }

        if ($this->quantity > $this->product->stock) {
            return false;
        }

        return true;
    }

    /**
     * Get validation issue for this cart item.
     */
    public function getValidationIssue(): ?string
    {
        if (!$this->product || $this->product->trashed()) {
            return 'Product no longer available';
        }

        if ($this->product->status !== 'active' || $this->product->sellerIsBlocked()) {
            return 'Product is no longer available';
        }

        if ($this->product->stock == 0) {
            return 'Out of stock';
        }

        if ($this->quantity > $this->product->stock) {
            return "Only {$this->product->stock} left in stock";
        }

        return null;
    }
}
