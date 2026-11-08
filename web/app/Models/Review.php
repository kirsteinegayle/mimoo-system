<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    /** Days after order completion during which a review can be written. */
    public const REVIEW_WINDOW_DAYS = 30;

    /** Days after the review was created during which it can be edited (once). */
    public const EDIT_WINDOW_DAYS = 30;

    protected $fillable = [
        'order_item_id',
        'product_id',
        'buyer_id',
        'rating',
        'comment',
        'images',
        'edited_at',
        'seller_reply',
    ];

    protected $casts = [
        'rating'    => 'integer',
        'images'    => 'array',
        'edited_at' => 'datetime',
    ];

    public function canBeEdited(): bool
    {
        return $this->edited_at === null
            && $this->created_at !== null
            && $this->created_at->copy()->addDays(self::EDIT_WINDOW_DAYS)->isFuture();
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
