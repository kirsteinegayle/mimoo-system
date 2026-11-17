<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Shipping fee for one weight bracket (kg, inclusive) of a zone. max_weight null = no upper limit. */
class LogisticsRate extends Model
{
    protected $fillable = ['zone_id', 'min_weight', 'max_weight', 'fee'];

    protected $casts = ['min_weight' => 'float', 'max_weight' => 'float', 'fee' => 'float'];
}
