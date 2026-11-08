<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
    ];

    /**
     * Get the buyer that owns the wishlist.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the items in the wishlist.
     */
    public function items(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Get or create wishlist for a buyer.
     */
    public static function getOrCreateForBuyer(int $buyerId): self
    {
        return self::firstOrCreate(['buyer_id' => $buyerId]);
    }

    /**
     * Get total item count in wishlist.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Check if a product is in the wishlist.
     */
    public function hasProduct(int $productId, ?string $variantId = null): bool
    {
        return $this->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->exists();
    }
}
