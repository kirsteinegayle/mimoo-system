<?php

namespace App\Support;

use App\Models\User;

/**
 * Single source of truth for web role -> home redirect and
 * login-portal -> allowed role matrix.
 *
 * Existing users.role values (string column, no enum):
 *   buyer, seller, admin, logistics_staff (hub/company), courier (branch), rider.
 */
class PortalRole
{
    /** login portal => roles allowed to sign in through it. */
    public const PORTALS = [
        'buyer'     => ['buyer'],
        'seller'    => ['seller'],
        'logistics' => ['logistics_staff'],
        'courier'   => ['courier'],
        'rider'     => [], // riders sign in through the mobile app only
    ];

    public const PORTAL_LABELS = [
        'buyer'     => 'Buyer',
        'seller'    => 'Seller',
        'logistics' => 'Logistics',
        'courier'   => 'Courier',
        'rider'     => 'Rider',
    ];

    public static function roleOf(User $user): string
    {
        return (string) ($user->role ?: $user->account_type);
    }

    /** Where each role lands after login. */
    public static function homeFor(User $user): string
    {
        return match (self::roleOf($user)) {
            'seller'          => '/seller/dashboard',
            'courier'         => '/courier/dashboard',
            'logistics_staff' => '/logistics/dashboard',
            'admin'           => '/admin',
            default           => '/homepage', // buyer and anything else
        };
    }

    /**
     * Returns null when the user may use the portal, otherwise a clear message.
     * A null/unknown portal means "no gate" (API clients, tests, legacy forms).
     */
    public static function denyReason(?string $portal, User $user): ?string
    {
        if ($portal === null || $portal === '' || ! isset(self::PORTALS[$portal])) {
            return null;
        }

        if ($portal === 'rider') {
            return 'Rider accounts sign in through the mimoo Rider mobile app, not the web.';
        }

        $role = self::roleOf($user);
        if (in_array($role, self::PORTALS[$portal], true)) {
            return null;
        }

        $mine = match ($role) {
            'buyer'           => 'a Buyer',
            'seller'          => 'a Seller',
            'logistics_staff' => 'a Logistics',
            'courier'         => 'a Courier',
            'rider'           => 'a Rider',
            default           => 'another',
        };

        return 'This is the ' . self::PORTAL_LABELS[$portal] . ' login, but this account is ' . $mine
            . ' account. Please use the correct login page for your account type.';
    }
}
