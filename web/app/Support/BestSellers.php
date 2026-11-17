<?php

namespace App\Support;

use App\Models\OrderItem;
use App\Models\Product;

/**
 * Top products by units sold on DELIVERED orders (Order::scopeDelivered), only
 * products that are still on sale (active + approved, not deleted).
 */
class BestSellers
{
    /** @return list<array{id:int,name:string,category:?string,price:float,sale_price:?float,image:?string,sold:int}> */
    public static function top(int $limit = 3): array
    {
        $sold = OrderItem::whereHas('order', fn ($q) => $q->delivered())
            ->whereHas('product', fn ($q) => $q->where('status', 'active')->where('approval_status', 'approved'))
            ->selectRaw('product_id, SUM(quantity) as units')
            ->groupBy('product_id')
            ->orderByDesc('units')
            ->limit($limit)
            ->pluck('units', 'product_id');

        if ($sold->isEmpty()) {
            return [];
        }

        $products = Product::whereIn('id', $sold->keys())->get()->keyBy('id');

        return $sold->map(function ($units, $id) use ($products) {
            $p = $products[$id] ?? null;
            if (! $p) {
                return null;
            }

            return [
                'id' => (int) $p->id,
                'name' => $p->name,
                'category' => $p->category,
                'price' => (float) $p->price,
                'sale_price' => $p->sale_price ? (float) $p->sale_price : null,
                'image' => $p->main_image,
                'sold' => (int) $units,
            ];
        })->filter()->values()->all();
    }
}
