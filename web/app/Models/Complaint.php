<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Complaint extends Model
{
    protected $guarded = [];

    public const STATUSES = ['open', 'in_review', 'resolved', 'rejected'];

    public const TYPES = [
        'product_issue'   => 'Product issue (wrong, damaged, not as described)',
        'delivery_issue'  => 'Delivery issue (late, lost, rider conduct)',
        'seller_conduct'  => 'Seller conduct',
        'courier_conduct' => 'Courier conduct',
        'payment'         => 'Payment / refund dispute',
        'other'           => 'Other',
    ];

    protected $casts = ['evidence' => 'array', 'resolved_at' => 'datetime'];

    public function buyer(): BelongsTo { return $this->belongsTo(User::class, 'buyer_id'); }
    public function seller(): BelongsTo { return $this->belongsTo(User::class, 'seller_id'); }
    public function courier(): BelongsTo { return $this->belongsTo(User::class, 'courier_id'); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}
