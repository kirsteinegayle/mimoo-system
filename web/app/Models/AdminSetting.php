<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

/** Key/value settings for the admin panel (display name, email, access-code hash). */
class AdminSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public static function get(string $key, ?string $default = null): ?string
    {
        // Safe before the migration has run (e.g. a fresh deploy): fall back.
        if (! Schema::hasTable('admin_settings')) {
            return $default;
        }

        return static::query()->whereKey($key)->value('value') ?? $default;
    }

    public static function put(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
