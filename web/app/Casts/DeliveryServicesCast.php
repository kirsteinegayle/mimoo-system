<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class DeliveryServicesCast implements CastsAttributes
{
    /**
     * Cast the given value (from DB to PHP).
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?array
    {
        if ($value === null) {
            return null;
        }

        // Try to decode as JSON (new format)
        $decoded = json_decode($value, true);
        
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            // Valid JSON array
            return $decoded;
        }

        // Fall back to old comma-separated format
        return array_filter(array_map('trim', explode(',', $value)));
    }

    /**
     * Prepare the given value for storage (from PHP to DB).
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        // Always store as JSON array
        if (is_array($value)) {
            return json_encode(array_values($value));
        }

        // If it's a string, treat it as comma-separated and convert to array
        if (is_string($value)) {
            $array = array_filter(array_map('trim', explode(',', $value)));
            return json_encode(array_values($array));
        }

        return null;
    }
}
