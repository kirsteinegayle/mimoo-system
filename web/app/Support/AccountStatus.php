<?php

namespace App\Support;

use App\Models\AdminSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Admin account control: activate / suspend / deactivate with an audit log,
 * and the login-block message used by every login path (web + APIs).
 *
 * Statuses: approved (= active), suspended, deactivated. Pending / disapproved
 * belong to the application review pages and are not touched here.
 */
class AccountStatus
{
    public const BLOCKED = ['suspended', 'deactivated'];

    /** Clear message for a suspended / deactivated user, or null when the account may sign in. */
    public static function blockReason(?User $user): ?string
    {
        if (! $user || ! in_array($user->status, self::BLOCKED, true)) {
            return null;
        }

        $why = trim((string) $user->status_reason);

        return $user->status === 'suspended'
            ? 'Your account has been suspended' . ($why !== '' ? ": {$why}" : '.') . ' Please contact mimoo support' . PlatformSettings::supportSuffix() . ' if you think this is a mistake.'
            : 'Your account has been deactivated' . ($why !== '' ? ": {$why}" : '.') . ' Please contact mimoo support' . PlatformSettings::supportSuffix() . ' to reactivate it.';
    }

    public static function adminLabel(): string
    {
        return (string) AdminSetting::get('display_name', 'mimoo Admin');
    }

    /**
     * Change a user's status, write the audit row, and end their sessions / API tokens
     * when the account is being blocked. Returns an error message, or null on success.
     */
    public static function change(User $user, string $action, ?string $reason, ?string $ip = null): ?string
    {
        if (($user->role ?? $user->account_type) === 'admin' || $user->account_type === 'admin') {
            return 'Admin accounts cannot be changed here.';
        }

        $from = (string) $user->status;
        $to = match ($action) {
            'activate' => 'approved',
            'suspend' => 'suspended',
            'deactivate' => 'deactivated',
            default => null,
        };
        if ($to === null) {
            return 'Unknown action.';
        }
        if ($action === 'activate' && ! in_array($from, self::BLOCKED, true)) {
            return 'Only suspended or deactivated accounts can be activated. Applications are reviewed in the approval pages.';
        }
        if ($action !== 'activate' && ! in_array($from, ['approved', 'suspended', 'deactivated'], true)) {
            return 'This account is not active yet, so it cannot be suspended or deactivated.';
        }
        if ($from === $to) {
            return 'The account is already ' . ($to === 'approved' ? 'active' : $to) . '.';
        }

        DB::transaction(function () use ($user, $action, $from, $to, $reason, $ip) {
            $user->forceFill([
                'status' => $to,
                'status_reason' => $action === 'activate' ? null : $reason,
                'status_changed_at' => now(),
                'approved_at' => $action === 'activate' ? ($user->approved_at ?? now()) : $user->approved_at,
            ])->save();

            DB::table('user_status_logs')->insert([
                'user_id' => $user->id, 'action' => $action, 'from_status' => $from, 'to_status' => $to,
                'reason' => $reason, 'acted_by' => self::adminLabel(), 'ip_address' => $ip,
                'created_at' => now(), 'updated_at' => now(),
            ]);

            if ($action !== 'activate') {
                // Kick the user out everywhere: API tokens and web sessions.
                $user->tokens()->delete();
                if (Schema::hasTable('sessions')) {
                    DB::table('sessions')->where('user_id', $user->id)->delete();
                }
            }
        });

        return null;
    }
}
