<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class PlatformPolicy extends Model
{
    protected $guarded = [];

    public const TYPES = [
        'terms' => 'Terms & Conditions',
        'privacy' => 'Privacy Policy',
        'commission' => 'Commission Policy',
        'prohibited_items' => 'Prohibited Items',
    ];

    /** Latest saved version of a policy, or null when none was written yet. */
    public static function current(string $type): ?self
    {
        if (! Schema::hasTable('platform_policies')) {
            return null;
        }

        return static::where('type', $type)->orderByDesc('version')->first();
    }
}
