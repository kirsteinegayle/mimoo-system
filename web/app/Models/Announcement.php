<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Announcement extends Model
{
    protected $guarded = [];

    protected $casts = ['published_at' => 'datetime'];

    public const AUDIENCES = ['all', 'buyers', 'sellers', 'couriers', 'riders'];

    /** Audience a user belongs to (matches UserNotifier::roleOf). */
    public static function audienceOf(User $u): ?string
    {
        return match (\App\Services\UserNotifier::roleOf($u)) {
            'buyer' => 'buyers',
            'seller' => 'sellers',
            'courier' => 'couriers',
            'rider' => 'riders',
            default => null,
        };
    }

    /** Users an announcement is addressed to (active accounts only). */
    public function recipients(): Builder
    {
        $q = User::query()->where('status', 'approved')->where('account_type', '<>', 'admin');

        return match ($this->audience) {
            'buyers' => $q->where('account_type', 'buyer'),
            'sellers' => $q->where('account_type', 'seller'),
            'couriers' => $q->where('account_type', 'logistics')->whereIn('role', ['courier', 'logistics_staff']),
            'riders' => $q->where('account_type', 'logistics')->where('role', 'rider'),
            default => $q->where(fn ($w) => $w->whereIn('account_type', ['buyer', 'seller'])
                ->orWhere(fn ($l) => $l->where('account_type', 'logistics')->whereIn('role', ['courier', 'logistics_staff', 'rider']))),
        };
    }

    /** Published announcements this user should see on their dashboard. */
    public static function forUser(?User $u, int $limit = 3): array
    {
        if (! $u || ! Schema::hasTable('announcements') || ! ($aud = self::audienceOf($u))) {
            return [];
        }

        return static::where('status', 'published')->whereIn('audience', ['all', $aud])
            ->orderByDesc('published_at')->limit($limit)->get(['id', 'title', 'body', 'published_at'])
            ->map(fn ($a) => ['id' => $a->id, 'title' => $a->title, 'body' => $a->body, 'published_at' => $a->published_at?->format('M d, Y')])
            ->all();
    }
}
