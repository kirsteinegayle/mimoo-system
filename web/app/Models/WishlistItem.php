<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'wishlist_id',
        'product_id',
        'variant_id',
        'variant_snapshot',
        'notes',
    ];

    protected $casts = [
        'variant_snapshot' => 'array',
    ];

    /**
     * Get the wishlist that owns the item.
     */
    public function wishlist(): BelongsTo
    {
        return $this->belongsTo(Wishlist::class);
    }

    /**
     * Get the product for the wishlist item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if this wishlist item is valid (product still available).
     */
    public function isValid(): bool
    {
        if (!$this->product || $this->product->trashed()) {
            return false;
        }

        if ($this->product->status !== 'active') {
            return false;
        }

        return true;
    }

    /**
     * Get validation issue for this wishlist item.
     */
    public function getValidationIssue(): ?string
    {
        if (!$this->product || $this->product->trashed()) {
            return 'Product no longer available';
        }

        if ($this->product->status !== 'active') {
            return 'Product is no longer available';
        }

        if ($this->product->stock == 0) {
            return 'Out of stock';
        }

        return null;
    }
}
