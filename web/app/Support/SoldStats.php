<?php

namespace App\Support;

use App\Models\OrderItem;
use Illuminate\Support\Collection;

/**
 * "Total sold" = units on DELIVERED order items (see Order::scopeDelivered), never
 * pending / in-transit / cancelled ones. Single source for the seller dashboard,
 * the seller products page and the dashboard stream.
 */
class SoldStats
{
    /** Units sold per product id for one seller (only products with at least one delivered unit). */
    public static function byProduct(int $sellerId): Collection
    {
        return OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', fn ($q) => $q->delivered())
            ->selectRaw('product_id, SUM(quantity) as units')
            ->groupBy('product_id')
            ->pluck('units', 'product_id')
            ->map(fn ($u) => (int) $u);
    }

    /** Units sold overall for one seller. */
    public static function total(int $sellerId): int
    {
        return (int) OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', fn ($q) => $q->delivered())
            ->sum('quantity');
    }
}
