<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Admin\AdminAccountController;
use App\Models\AdminNotification;
use App\Models\AdminSetting;
use App\Models\User;
use App\Services\AdminNotificationService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

/**
 * Rollback-only: admin notifications (sync idempotent, read/unread, read-all)
 * and admin settings (profile, access-code change replaces the .env code).
 * Uses real routes; the admin session flag is set on the request session.
 *
 *   php artisan admin:test-account
 */
class AdminTestAccount extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'admin:test-account';

    protected $description = 'Rollback-only: admin notifications feed/read/read-all, settings profile and access-code change, guest redirect';

    public function handle(): int
    {
        if ((string) config('app.admin_master_code') === '') {
            $this->error('ADMIN_MASTER_CODE is not configured.');
            return self::FAILURE;
        }

        return $this->runRolledBack(fn () => $this->runTests(), ['admin_notifications', 'admin_settings', 'users']);
    }

    /** Real request through routes + middleware with the admin session flag. */
    private function admin(string $method, string $uri, array $data = [], bool $verified = true): array
    {
        $req = Request::create($uri, $method, $data, [], [], ['HTTP_ACCEPT' => 'application/json', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest']);
        $session = app('session')->driver();
        $session->start();
        $session->put('admin_verified', $verified);
        $req->setLaravelSession($session);
        $res = app()->handle($req);
        $session->forget('admin_verified');

        return ['status' => $res->getStatusCode(), 'body' => json_decode((string) $res->getContent(), true) ?? []];
    }

    private function runTests(): void
    {
        // Guest (no admin session) is turned away.
        $r = $this->admin('GET', '/admin/notifications/feed', [], false);
        $this->check('guest -> not 200', $r['status'] !== 200 ? 'blocked' : 'OPEN', 'blocked', "status {$r['status']}");

        // A pending seller application produces exactly one notification.
        $seller = $this->makeUser('admin-notif-seller', [
            'account_type' => 'seller', 'status' => 'pending', 'verification_status' => 'verified', 'business_name' => 'Notif Test Shop',
        ]);
        $first  = AdminNotificationService::sync();
        $second = AdminNotificationService::sync();
        $row = AdminNotification::where('source_key', "seller_application:{$seller->id}")->first();
        $this->check('sync creates the seller notification', $row ? 'yes' : 'no', 'yes', "created {$first}");
        $this->check('sync is idempotent', $second, 0);

        $r = $this->admin('GET', '/admin/notifications/feed?filter=unread');
        $ids = collect($r['body']['data'] ?? [])->pluck('id');
        $this->check('feed (unread) lists it', $r['status'] . '/' . ($ids->contains($row->id) ? 'yes' : 'no'), '200/yes');
        $before = (int) ($r['body']['meta']['unread'] ?? -1);

        $r = $this->admin('POST', "/admin/notifications/{$row->id}/read");
        $this->check('mark one read', $r['status'] . '/' . ($row->fresh()->read_at ? 'read' : 'unread'), '200/read');
        $r = $this->admin('GET', '/admin/notifications/unread-count');
        $this->check('unread count drops by 1', (int) ($r['body']['data']['unread'] ?? -1), $before - 1);
        $this->check('re-sync keeps it read', (AdminNotificationService::sync() >= 0 && $row->fresh()->read_at) ? 'read' : 'unread', 'read');

        $r = $this->admin('POST', '/admin/notifications/read-all');
        $this->check('read-all -> 0 unread', $r['status'] . '/' . AdminNotification::whereNull('read_at')->count(), '200/0');
        $this->check('missing id -> 404', $this->admin('POST', '/admin/notifications/99999999/read')['status'], 404);

        // Settings: profile
        $r = $this->admin('POST', '/admin/settings/profile', ['display_name' => 'Ops Team', 'email' => 'ops@example.com']);
        $this->check('profile saved', $r['status'] . '/' . AdminSetting::get('display_name'), '200/Ops Team');
        $this->check('profile validation', $this->admin('POST', '/admin/settings/profile', ['display_name' => '', 'email' => 'nope'])['status'], 422);

        // Settings: access code ("change password")
        $master = (string) config('app.admin_master_code');
        $r = $this->admin('POST', '/admin/settings/password', ['current_code' => 'wrong-code-x', 'new_code' => 'NewCode-12345', 'new_code_confirmation' => 'NewCode-12345']);
        $this->check('wrong current code -> 422', $r['status'], 422);
        $r = $this->admin('POST', '/admin/settings/password', ['current_code' => $master, 'new_code' => 'short', 'new_code_confirmation' => 'short']);
        $this->check('too short -> 422', $r['status'], 422);
        $r = $this->admin('POST', '/admin/settings/password', ['current_code' => $master, 'new_code' => 'NewCode-12345', 'new_code_confirmation' => 'Mismatch-12345']);
        $this->check('mismatch -> 422', $r['status'], 422);
        $r = $this->admin('POST', '/admin/settings/password', ['current_code' => $master, 'new_code' => 'NewCode-12345', 'new_code_confirmation' => 'NewCode-12345']);
        $this->check('code changed', $r['status'], 200);
        $this->check('stored hashed (not plain)', AdminSetting::get(AdminAccountController::CODE_KEY) !== 'NewCode-12345' ? 'hashed' : 'PLAIN', 'hashed');
        $this->check('new code accepted', AdminAccountController::codeMatches('NewCode-12345') ? 'yes' : 'no', 'yes');
        $this->check('old .env code rejected', AdminAccountController::codeMatches($master) ? 'yes' : 'no', 'no');

        // Pages render
        $this->check('settings page', $this->admin('GET', '/admin/settings')['status'], 200);
        $this->check('notifications page', $this->admin('GET', '/admin/notifications')['status'], 200);
    }
}
