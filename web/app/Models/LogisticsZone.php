<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A delivery zone of one logistics company: the cities / provinces it covers and its weight-bracket rates. */
class LogisticsZone extends Model
{
    protected $fillable = ['logistics_id', 'name', 'cities', 'provinces', 'is_default', 'status'];

    protected $casts = ['cities' => 'array', 'provinces' => 'array', 'is_default' => 'boolean'];

    public function logistics(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logistics_id');
    }

    public function rates(): HasMany
    {
        return $this->hasMany(LogisticsRate::class, 'zone_id')->orderBy('min_weight');
    }
}
