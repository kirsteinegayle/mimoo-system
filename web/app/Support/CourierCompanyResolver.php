<?php

namespace App\Support;

use App\Models\CourierPersonnel;
use App\Models\User;

/**
 * Resolves the courier company (the users row with role = courier) that a
 * logistics user belongs to. Read-only helper: no role checks, routes or hub
 * pages use it yet.
 *
 *   courier          → the user itself
 *   logistics_staff  → users.courier_company_id, else their courier_personnel.courier_id
 *   rider            → courier_personnel.courier_id (active row)
 *   anyone else      → null
 *
 * Always returns null unless the target is an existing role = courier user.
 */
class CourierCompanyResolver
{
    public static function resolve(?User $user): ?User
    {
        if (! $user) {
            return null;
        }

        $role = $user->role ?? $user->account_type;

        $courierId = match ($role) {
            'courier'         => (int) $user->id,
            'logistics_staff' => (int) ($user->courier_company_id ?: self::personnelCourierId($user)),
            'rider'           => self::personnelCourierId($user),
            default           => 0,
        };

        if ($courierId <= 0) {
            return null;
        }
        if ($courierId === (int) $user->id) {
            return $role === 'courier' ? $user : null;
        }

        return User::whereKey($courierId)->where('role', 'courier')->first();
    }

    /**
     * The user whose id owns courier_id-scoped rows for this actor: the courier
     * company when one resolves (courier -> itself, logistics_staff / rider ->
     * their company), otherwise the actor itself (which then matches nothing,
     * same as before). Use for READ/WRITE scoping; keep the actor for audit ids.
     */
    public static function scope(User $actor): User
    {
        return self::resolve($actor) ?? $actor;
    }

    public static function resolveId(?User $user): ?int
    {
        return self::resolve($user)?->id;
    }

    private static function personnelCourierId(User $user): int
    {
        return (int) CourierPersonnel::where('user_id', $user->id)
            ->where('status', 'active')
            ->value('courier_id');
    }
}
