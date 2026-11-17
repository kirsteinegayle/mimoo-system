<?php

namespace App\Services;

use App\Models\BuyerNotification;
use App\Models\RiderNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * One in-app notification to ONE user, routed to that user's own table:
 *   buyer   -> buyer_notifications   (dedupe: data.dedupe_key)
 *   seller  -> seller_notifications  (UNIQUE seller_id + dedupe_key)
 *   courier -> courier_notifications (UNIQUE courier_id + dedupe_key)
 *   rider   -> rider_notifications   (no key column: same type + body in the last 10 min = duplicate)
 * Inserted after the surrounding transaction commits; never throws.
 * Callers must not put admin-internal notes or other users' identity in the text.
 */
class UserNotifier
{
    public static function roleOf(User $u): ?string
    {
        if ($u->account_type === 'buyer') {
            return 'buyer';
        }
        if ($u->account_type === 'seller') {
            return 'seller';
        }
        if ($u->account_type === 'logistics' && $u->role === 'rider') {
            return 'rider';
        }
        if ($u->account_type === 'logistics' && in_array($u->role, ['courier', 'logistics_staff'], true)) {
            return 'courier';
        }

        return null;
    }

    public static function send(User $user, string $type, string $title, string $body, string $dedupeKey, array $data = [], string $url = '', ?int $orderId = null): void
    {
        try {
            $role = self::roleOf($user);
            $uid  = (int) $user->id;

            match ($role) {
                'seller'  => SellerNotificationService::custom($uid, $type, $title, $body, $dedupeKey, $data, $url ?: '/seller/dashboard'),
                'courier' => CourierNotificationService::create($uid, $type, $title, $body, $dedupeKey, $data, $url ?: '/courier/dashboard'),
                'buyer'   => DB::afterCommit(function () use ($uid, $type, $title, $body, $dedupeKey, $data, $url) {
                    try {
                        if (BuyerNotification::where('buyer_id', $uid)->where('type', $type)->where('data->dedupe_key', $dedupeKey)->exists()) {
                            return;
                        }
                        BuyerNotification::create([
                            'buyer_id' => $uid, 'type' => $type, 'title' => $title, 'body' => $body,
                            'data'     => $data + ['dedupe_key' => $dedupeKey, 'url' => $url ?: '/buyer/notifications'],
                        ]);
                    } catch (\Throwable $e) {
                        Log::warning('Buyer notification failed: ' . $e->getMessage());
                    }
                }),
                'rider'   => DB::afterCommit(function () use ($uid, $type, $title, $body, $orderId) {
                    try {
                        $dupe = RiderNotification::where('rider_user_id', $uid)->where('type', $type)->where('body', $body)
                            ->where('created_at', '>=', now()->subMinutes(10))->exists();
                        if (! $dupe) {
                            RiderNotification::create(['rider_user_id' => $uid, 'type' => $type, 'title' => $title, 'body' => $body, 'order_id' => $orderId]);
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Rider notification failed: ' . $e->getMessage());
                    }
                }),
                default   => null,
            };
        } catch (\Throwable $e) {
            Log::warning('User notification failed: ' . $e->getMessage());
        }
    }
}
