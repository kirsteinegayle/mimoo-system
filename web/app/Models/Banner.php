<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Banner extends Model
{
    public const POSITIONS = ['hero', 'secondary', 'sidebar'];

    protected $fillable = ['title', 'image', 'link_url', 'position', 'status', 'sort_order', 'starts_at', 'ends_at'];

    protected $casts = ['starts_at' => 'datetime', 'ends_at' => 'datetime'];

    /** Shown to buyers now: active and inside its schedule window. */
    public function scopeLive(Builder $q): Builder
    {
        return $q->where('status', 'active')
            ->where(fn ($w) => $w->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($w) => $w->whereNull('ends_at')->orWhere('ends_at', '>=', now()));
    }

    /** Live banners grouped by slot, ordered; used by the buyer web homepage and GET /api/banners (mobile). */
    public static function liveByPosition(): array
    {
        $out = ['hero' => [], 'secondary' => [], 'sidebar' => []];
        if (! Schema::hasTable('banners')) {
            return $out;
        }
        foreach (static::live()->orderBy('position')->orderBy('sort_order')->orderBy('id')->get() as $b) {
            $out[$b->position][] = ['id' => $b->id, 'title' => $b->title, 'image' => $b->image, 'link_url' => $b->link_url];
        }

        return $out;
    }

    /** Admin shape. */
    public function present(): array
    {
        return [
            'id' => $this->id, 'title' => $this->title, 'image' => $this->image, 'link_url' => $this->link_url,
            'position' => $this->position, 'status' => $this->status, 'order' => $this->sort_order,
            'starts_at' => $this->starts_at?->format('Y-m-d\TH:i'), 'ends_at' => $this->ends_at?->format('Y-m-d\TH:i'),
            'live' => $this->status === 'active' && (! $this->starts_at || $this->starts_at->isPast()) && (! $this->ends_at || $this->ends_at->isFuture()),
            'created_at' => $this->created_at?->format('M d, Y'),
        ];
    }
}
