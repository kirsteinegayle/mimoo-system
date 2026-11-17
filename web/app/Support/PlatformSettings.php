<?php

namespace App\Support;

use App\Models\AdminSetting;
use App\Models\User;

/**
 * Platform-wide settings edited under Admin > Settings. Every key here is READ by real behaviour:
 *
 *   platform_name          app name (config app.name: shared Inertia `name`, emails)
 *   support_email          appended to "contact support" messages when an account is suspended / deactivated
 *   commission_percent     platform commission (config platform.commission_rate: reports, dashboard, COD settlement)
 *   default_shipping_fee   fee used when no logistics zone / weight bracket matches (ShippingService)
 *   default_logistics_id   logistics preferred when rates tie / used when none covers the address (ShippingService)
 *   cod_enabled            Cash on Delivery offered at checkout (web + app); orders using it are refused when off
 *   maintenance_mode       buyers / sellers / logistics see a maintenance message; admin stays available
 *   maintenance_message    the text shown during maintenance
 */
class PlatformSettings
{
    public static function current(): array
    {
        return [
            'platform_name' => (string) AdminSetting::get('platform_name', (string) config('app.name')),
            'support_email' => (string) AdminSetting::get('support_email', ''),
            'commission_percent' => (float) AdminSetting::get('commission_percent', (string) round(((float) config('platform.commission_rate')) * 100, 2)),
            'default_shipping_fee' => (float) AdminSetting::get('default_shipping_fee', '80'),
            'default_logistics_id' => (int) AdminSetting::get('default_logistics_id', '0') ?: null,
            'cod_enabled' => AdminSetting::get('cod_enabled', '1') === '1',
            'maintenance_mode' => AdminSetting::get('maintenance_mode', '0') === '1',
            'maintenance_message' => (string) AdminSetting::get('maintenance_message', 'We are doing some maintenance and will be back shortly.'),
        ];
    }

    public static function rules(): array
    {
        return [
            'platform_name' => ['required', 'string', 'min:2', 'max:40'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'commission_percent' => ['required', 'numeric', 'min:0', 'max:50'],
            'default_shipping_fee' => ['required', 'numeric', 'min:0', 'max:5000'],
            'default_logistics_id' => ['nullable', 'integer', 'exists:users,id'],
            'cod_enabled' => ['required', 'boolean'],
            'maintenance_mode' => ['required', 'boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:200'],
        ];
    }

    /** @param array<string, mixed> $v validated by rules() */
    public static function save(array $v): ?string
    {
        if (! empty($v['default_logistics_id'])
            && ! User::where('id', $v['default_logistics_id'])->where('account_type', 'logistics')->where('role', 'logistics_staff')->where('status', 'approved')->exists()) {
            return 'The default logistics must be an approved logistics account.';
        }
        foreach ($v as $key => $value) {
            AdminSetting::put($key, is_bool($value) ? ($value ? '1' : '0') : (string) ($value ?? ''));
        }

        return null;
    }

    /** Apply the DB-backed values to config so every existing config() reader follows them. Safe before migrations. */
    public static function applyRuntime(): void
    {
        try {
            if (! \Illuminate\Support\Facades\Schema::hasTable('admin_settings')) {
                return;
            }
            $name = AdminSetting::get('platform_name');
            if ($name) {
                config(['app.name' => $name]);
            }
            $pct = AdminSetting::get('commission_percent');
            if ($pct !== null && $pct !== '') {
                config(['platform.commission_rate' => max(0.0, (float) $pct) / 100]);
            }
        } catch (\Throwable) {
            // never break a request over a settings read
        }
    }

    public static function codEnabled(): bool
    {
        return AdminSetting::get('cod_enabled', '1') === '1';
    }

    public static function supportSuffix(): string
    {
        $email = trim((string) AdminSetting::get('support_email', ''));

        return $email !== '' ? " ({$email})" : '';
    }
}
