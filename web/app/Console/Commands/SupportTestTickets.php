<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\AdminNotification;
use App\Models\BuyerNotification;
use App\Models\CourierNotification;
use App\Models\RiderNotification;
use App\Models\SellerNotification;
use App\Models\SupportTicket;
use App\Models\User;
use App\Services\AdminNotificationService;
use App\Services\SupportTicketService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/**
 * Rollback-only tests for support tickets: buyer + seller web, rider + courier
 * apps, validation, ownership, duplicates / open-ticket limit, replies, admin
 * list / filter / thread / reply / status, submitter notifications per role,
 * admin notification entries, throttling.
 *
 *   php artisan support:test-tickets
 */
class SupportTestTickets extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'support:test-tickets';

    protected $description = 'Rollback-only: support tickets (web + apps), rules, admin replies/status, notifications';

    private array $tokens = [];

    public function handle(): int
    {
        // The rule checks below send more than 5 creates per minute: switch the
        // rate limiter off for this run (its presence on each route is checked at the end).
        app()->bind(\Illuminate\Routing\Middleware\ThrottleRequests::class, fn () => new class {
            public function handle($request, \Closure $next, ...$args)
            {
                return $next($request);
            }
        });

        return $this->runRolledBack(fn () => $this->runTests(), [
            'support_tickets', 'support_ticket_replies', 'users', 'buyer_notifications', 'seller_notifications',
            'rider_notifications', 'courier_notifications', 'admin_notifications', 'personal_access_tokens',
        ]);
    }

    private function api(User $u, string $method, string $uri, array $data = []): array
    {
        $this->tokens[$u->id] ??= $u->createToken('support-test')->plainTextToken;
        Auth::forgetGuards();
        $res = app()->handle(Request::create($uri, $method, $data, [], [], [
            'HTTP_ACCEPT' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer ' . $this->tokens[$u->id],
        ]));

        return ['status' => $res->getStatusCode(), 'body' => json_decode((string) $res->getContent(), true) ?? []];
    }

    private function admin(string $method, string $uri, array $data = []): array
    {
        Auth::forgetGuards();
        $req = Request::create($uri, $method, $data, [], [], ['HTTP_ACCEPT' => 'application/json', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest']);
        $session = app('session')->driver();
        $session->start();
        $session->put('admin_verified', true);
        $req->setLaravelSession($session);
        $res = app()->handle($req);
        $session->forget('admin_verified');

        return ['status' => $res->getStatusCode(), 'body' => json_decode((string) $res->getContent(), true) ?? []];
    }

    private function runTests(): void
    {
        $v       = ['email_verified_at' => now(), 'verification_status' => 'verified', 'status' => 'approved'];
        $buyer   = $this->makeUser('st-buyer', ['account_type' => 'buyer', 'role' => 'buyer'] + $v);
        $buyer2  = $this->makeUser('st-buyer2', ['account_type' => 'buyer', 'role' => 'buyer'] + $v);
        $seller  = $this->makeUser('st-seller', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'ST Shop'] + $v);
        $rider   = $this->makeUser('st-rider', ['account_type' => 'logistics', 'role' => 'rider'] + $v);
        $courier = $this->makeUser('st-courier', ['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'ST Courier'] + $v);

        $ok = ['category' => 'order', 'subject' => 'Where is my parcel?', 'message' => 'My order has not moved for three days.'];

        // ── Pages ─────────────────────────────────────────────────────────
        $r = $this->http($buyer, 'GET', '/support', [], true);
        $this->check('buyer page /support', $r['status'] . '/' . ($r['body']['component'] ?? '-'), '200/BuyerSupport');
        $r = $this->http($seller, 'GET', '/seller/support', [], true);
        $this->check('seller page /seller/support', $r['status'] . '/' . ($r['body']['component'] ?? '-'), '200/seller/SellerSupport');
        $r = $this->http($seller, 'GET', '/support', [], true);
        $this->check('seller on buyer page -> redirected', $r['status'], 302);

        // ── Validation ────────────────────────────────────────────────────
        $r = $this->http($buyer, 'POST', '/support/tickets', ['category' => 'nope', 'subject' => 'x', 'message' => 'short']);
        $this->check('validation: category / subject / message', $r['status'] . '/' . implode(',', array_keys($r['body']['errors'] ?? [])), '422/category,subject,message');
        $r = $this->http($buyer, 'POST', '/support/tickets', ['category' => 'other', 'subject' => str_repeat('s', 121), 'message' => str_repeat('m', 2001)]);
        $this->check('validation: max lengths', $r['status'] . '/' . implode(',', array_keys($r['body']['errors'] ?? [])), '422/subject,message');
        $r = $this->http(null, 'POST', '/support/tickets', $ok);
        $this->check('guest -> 401', $r['status'], 401);

        // ── Submit (web + apps) ───────────────────────────────────────────
        $r = $this->http($buyer, 'POST', '/support/tickets', $ok);
        $bt = SupportTicket::find($r['body']['data']['id'] ?? 0);
        $this->check('buyer web submit', $r['status'] . '/' . ($bt?->status ?? '-') . '/' . ($bt?->user_role ?? '-'), '201/open/buyer');
        $r = $this->http($buyer, 'POST', '/support/tickets', ['subject' => '  where is MY parcel?  '] + $ok);
        $this->check('duplicate subject while open -> 409', $r['status'], 409);
        $r = $this->http($seller, 'POST', '/support/tickets', ['category' => 'payment', 'subject' => 'Payout question', 'message' => 'When do COD payouts arrive?']);
        $st = SupportTicket::find($r['body']['data']['id'] ?? 0);
        $this->check('seller web submit', $r['status'] . '/' . ($st?->user_role ?? '-'), '201/seller');
        $r = $this->api($rider, 'POST', '/api/rider-app/support/tickets', ['category' => 'technical', 'subject' => 'App crashes', 'message' => 'The app closes when I scan.']);
        $rt = SupportTicket::find($r['body']['data']['id'] ?? 0);
        $this->check('rider app submit', $r['status'] . '/' . ($rt?->user_role ?? '-'), '201/rider');
        $r = $this->api($courier, 'POST', '/api/courier-app/support/tickets', ['category' => 'account', 'subject' => 'Add a branch', 'message' => 'How do I add a new branch?']);
        $ct = SupportTicket::find($r['body']['data']['id'] ?? 0);
        $this->check('courier app submit', $r['status'] . '/' . ($ct?->user_role ?? '-'), '201/courier');
        $r = $this->api($buyer, 'GET', '/api/buyer/support/tickets');
        $this->check('buyer app list = own tickets', collect($r['body']['data'] ?? [])->pluck('id')->all() === [$bt?->id] ? 'own only' : json_encode(collect($r['body']['data'] ?? [])->pluck('id')), 'own only');

        // Open-ticket limit (5 unresolved).
        for ($i = 2; $i <= SupportTicketService::MAX_ACTIVE; $i++) {
            $this->http($buyer, 'POST', '/support/tickets', ['subject' => "Question number {$i}"] + $ok);
        }
        $r = $this->http($buyer, 'POST', '/support/tickets', ['subject' => 'One too many'] + $ok);
        $this->check('6th unresolved ticket -> 429 (open-ticket limit)', $r['status'] . '/' . (str_contains($r['body']['message'] ?? '', 'too many open tickets') ? 'limit' : 'other'), '429/limit', $r['body']['message'] ?? ''); 

        // ── Ownership + replies ───────────────────────────────────────────
        $r = $this->http($buyer2, 'GET', "/support/tickets/{$bt?->id}");
        $this->check("other user's ticket -> 404", $r['status'], 404);
        $r = $this->http($buyer2, 'POST', "/support/tickets/{$bt?->id}/replies", ['body' => 'hijack']);
        $this->check("reply on other user's ticket -> 404", $r['status'], 404);
        $r = $this->http($buyer, 'POST', "/support/tickets/{$bt?->id}/replies", ['body' => '']);
        $this->check('empty reply -> 422', $r['status'], 422);
        $r = $this->http($buyer, 'POST', "/support/tickets/{$bt?->id}/replies", ['body' => 'Order is MIM-00000001.']);
        $this->check('own reply -> 201', $r['status'] . '/' . count($r['body']['data']['replies'] ?? []), '201/1');

        // ── Admin ─────────────────────────────────────────────────────────
        $r = app()->handle(Request::create('/admin/support/feed', 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']));
        $this->check('admin feed without admin session -> blocked', $r->getStatusCode() >= 300 ? 'blocked' : 'OPEN', 'blocked', (string) $r->getStatusCode());
        $r = $this->admin('GET', '/admin/support/feed?status=open');
        $ids = collect($r['body']['data'] ?? [])->pluck('id');
        $this->check('admin feed (open) has all 4 roles', collect([$bt?->id, $st?->id, $rt?->id, $ct?->id])->every(fn ($id) => $ids->contains($id)) ? 'yes' : 'no', 'yes');
        $r = $this->admin('GET', "/admin/support/{$bt?->id}");
        $this->check('admin thread view', $r['status'] . '/' . count($r['body']['data']['replies'] ?? []) . '/' . ($r['body']['data']['user_role'] ?? '-'), '200/1/buyer');

        $r = $this->admin('POST', "/admin/support/{$bt?->id}/reply", ['body' => 'We are checking with the courier.']);
        $this->check('admin reply -> in_progress', $r['status'] . '/' . $bt?->fresh()->status, '201/in_progress');
        $r = $this->admin('GET', '/admin/support/feed?status=in_progress');
        $this->check('filter in_progress', collect($r['body']['data'] ?? [])->pluck('id')->contains($bt?->id) ? 'listed' : 'missing', 'listed');
        $r = $this->admin('POST', "/admin/support/{$bt?->id}/status", ['status' => 'closed']);
        $this->check('admin invalid status -> 422', $r['status'], 422);
        $r = $this->admin('POST', "/admin/support/{$bt?->id}/status", ['status' => 'resolved']);
        $this->check('admin resolve', $r['status'] . '/' . $bt?->fresh()->status, '200/resolved');
        $r = $this->admin('POST', "/admin/support/{$bt?->id}/status", ['status' => 'resolved']);
        $this->check('same status again = no change', $r['body']['message'] ?? '-', 'No change.');
        $r = $this->http($buyer, 'POST', "/support/tickets/{$bt?->id}/replies", ['body' => 'one more thing']);
        $this->check('reply on resolved ticket -> 409', $r['status'], 409);
        $r = $this->http($buyer, 'POST', '/support/tickets', $ok);
        $this->check('same subject allowed after resolved', $r['status'], 201, $r['body']['message'] ?? '');

        $this->admin('POST', "/admin/support/{$st?->id}/reply", ['body' => 'Payouts go out every Friday.']);
        $this->admin('POST', "/admin/support/{$rt?->id}/status", ['status' => 'in_progress']);
        $this->admin('POST', "/admin/support/{$ct?->id}/reply", ['body' => 'Go to Branches > Add.']);

        // ── Submitter notifications (own table per role) ──────────────────
        $bn = BuyerNotification::where('buyer_id', $buyer->id)->where('type', 'support_ticket')->get();
        $this->check('buyer notified: reply + resolved', $bn->count(), 2);
        $this->check('buyer notification links to the ticket', (string) ($bn->first()?->data['url'] ?? '-'), '/support?ticket=' . $bt?->id);
        $this->check('seller notified (reply)', SellerNotification::where('seller_id', $seller->id)->where('type', 'support_ticket')->count(), 1);
        $this->check('rider notified (status)', RiderNotification::where('rider_user_id', $rider->id)->where('type', 'support_ticket')->count(), 1);
        $this->check('courier notified (reply)', CourierNotification::where('courier_id', $courier->id)->where('type', 'support_ticket')->count(), 1);
        $this->check('other buyer not notified', BuyerNotification::where('buyer_id', $buyer2->id)->where('type', 'support_ticket')->count(), 0);

        // ── Admin notification entries ────────────────────────────────────
        AdminNotificationService::sync();
        $this->check('admin notification: new ticket', AdminNotification::where('source_key', "support_ticket:{$st?->id}")->value('type') ?? '-', 'support_ticket');
        $this->check('admin notification: resolved ticket skipped', AdminNotification::where('source_key', "support_ticket:{$bt?->id}")->exists() ? 'listed' : 'skipped', 'skipped');

        // ── Throttling ────────────────────────────────────────────────────
        $throttled = collect(['support/tickets', 'api/buyer/support/tickets', 'api/rider-app/support/tickets', 'api/courier-app/support/tickets'])
            ->every(function ($uri) {
                $route = collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === $uri && in_array('POST', $r->methods(), true));
                return $route && collect($route->gatherMiddleware())->contains(fn ($m) => is_string($m) && str_starts_with($m, 'throttle:5,1'));
            });
        $this->check('create routes throttled (5/min)', $throttled ? 'yes' : 'no', 'yes');
    }
}
