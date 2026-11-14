<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\CourierNotification;
use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Rollback-only test of the endpoints the rider and courier MOBILE apps call
 * (real routes + middleware, Sanctum Bearer tokens):
 *   /api/rider-app/messaging/*   /api/courier-app/messaging/*   /api/courier-app/notifications*
 * Fixture users only, ONE transaction, ALWAYS rolled back.
 *
 *   php artisan mobile:test-messaging-api
 */
class MobileTestMessagingApi extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'mobile:test-messaging-api';

    protected $description = 'Rollback-only: rider / courier app messaging + courier notifications API (contacts, send, read, unread, 403, participants only)';

    /** @var array<int,string> user id => plain token */
    private array $tokens = [];

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'courier_personnel', 'courier_notifications',
            'conversations', 'conversation_participants', 'conversation_messages', 'personal_access_tokens',
        ]);
    }

    private function api(User $u, string $method, string $uri, array $data = []): array
    {
        $this->tokens[$u->id] ??= $u->createToken('mobile-test')->plainTextToken;
        Auth::forgetGuards();
        $res = app()->handle(Request::create($uri, $method, $data, [], [], [
            'HTTP_ACCEPT' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer ' . $this->tokens[$u->id],
        ]));

        return ['status' => $res->getStatusCode(), 'body' => json_decode((string) $res->getContent(), true) ?? []];
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified'];
        $rd = ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified'];
        $buyer   = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller  = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);
        $c1      = $this->makeUser('courier.1', $co);
        $c2      = $this->makeUser('courier.2', $co);
        $rider   = $this->makeUser('rider', $rd);
        $rider2  = $this->makeUser('rider.2', $rd);
        $riderB  = $this->makeUser('rider.other', $rd);
        foreach ([[$c1, $rider], [$c1, $rider2], [$c2, $riderB]] as [$c, $r]) {
            CourierPersonnel::create(['courier_id' => $c->id, 'user_id' => $r->id, 'name' => 'Mobile ' . $r->id, 'role' => 'rider', 'status' => 'active']);
        }
        [$order] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id, 'assigned_at' => now(),
            'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted', 'pickup_status' => 'scheduled']);

        // ── access: right role only ─────────────────────────────────────────
        $this->check('rider route: seller token refused', $this->api($seller, 'GET', '/api/rider-app/messaging/threads')['status'], 403, 'rider.role');
        $this->check('rider route: courier token refused', $this->api($c1, 'GET', '/api/rider-app/messaging/threads')['status'], 403, '');
        $this->check('courier route: rider token refused', $this->api($rider, 'GET', '/api/courier-app/messaging/threads')['status'], 403, 'courier.role');
        $this->check('courier route: seller token refused', $this->api($seller, 'GET', '/api/courier-app/notifications')['status'], 403, '');
        Auth::forgetGuards();
        $guest = app()->handle(Request::create('/api/rider-app/messaging/threads', 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']));
        $this->check('no token: 401', $guest->getStatusCode(), 401, '');

        // ── rider app ───────────────────────────────────────────────────────
        $rc = $this->api($rider, 'GET', '/api/rider-app/messaging/contacts');
        $this->check('rider contacts: own company only', json_encode(collect($rc['body']['data'] ?? [])->map(fn ($c) => $c['role'] . ':' . $c['id'])->all()), json_encode(["courier:{$c1->id}"]), '');
        $this->check('rider -> other company courier refused', $this->api($rider, 'POST', '/api/rider-app/messaging/start', ['role' => 'courier', 'id' => $c2->id])['status'], 403, '');
        $this->check('rider -> admin refused', $this->api($rider, 'POST', '/api/rider-app/messaging/start', ['role' => 'admin', 'id' => 0])['status'], 403, '');
        $this->check('rider -> seller refused', $this->api($rider, 'POST', '/api/rider-app/messaging/start', ['role' => 'seller', 'id' => $seller->id])['status'], 403, '');
        $this->check('rider -> rider refused', $this->api($rider, 'POST', '/api/rider-app/messaging/start', ['role' => 'rider', 'id' => $rider2->id])['status'], 403, '');
        $s = $this->api($rider, 'POST', '/api/rider-app/messaging/start', ['role' => 'courier', 'id' => $c1->id]);
        $tid = $s['body']['data']['id'] ?? 0;
        $this->check('rider starts a thread with the own company', $s['status'] . '/' . implode(',', array_keys($s['body']['data'] ?? [])), '201/id,counterpart_name,counterpart_role,last_message,last_message_at,unread_count', 'shape the app reads');
        $send = fn (User $u, string $base, string $text) => $this->api($u, 'POST', "{$base}/messaging/threads/{$tid}/messages", ['body' => $text]);
        $r = $send($rider, '/api/rider-app', 'Rider here, parcel is ready');
        $this->check('rider sends', $r['status'] . '/' . implode(',', array_keys($r['body']['data'] ?? [])), '201/id,thread_id,is_mine,body,image_url,read_at,created_at', '');
        $this->check('rider message is mine', json_encode($r['body']['data']['is_mine'] ?? null), 'true', '');

        // ── courier app (same thread) ───────────────────────────────────────
        $cl = $this->api($c1, 'GET', '/api/courier-app/messaging/threads');
        $this->check('courier thread list: unread 1, counterpart = the rider', ($cl['body']['data'][0]['unread_count'] ?? '-') . '/' . (($cl['body']['data'][0]['counterpart_role'] ?? '-')), '1/rider', '');
        $this->check('courier unread_total meta', $cl['body']['meta']['unread_total'] ?? '-', 1, '');
        $cc = $this->api($c1, 'GET', '/api/courier-app/messaging/contacts');
        $roles = collect($cc['body']['data'] ?? [])->map(fn ($c) => $c['role'])->unique()->sort()->values()->all();
        $this->check('courier contacts: admin, seller (shipment), riders of the company', json_encode($roles), json_encode(['admin', 'rider', 'seller']), '');
        $ids = collect($cc['body']['data'] ?? [])->where('role', 'rider')->pluck('id')->sort()->values()->all();
        $this->check("courier sees only its own riders", json_encode($ids), json_encode(collect([$rider->id, $rider2->id])->sort()->values()->all()), 'other company rider hidden');
        $m = $this->api($c1, 'GET', "/api/courier-app/messaging/threads/{$tid}/messages");
        $this->check('courier opens the thread: message + name, marks read', ($m['body']['data'][0]['body'] ?? '-') . '/' . ($m['body']['thread']['name'] ?? '-') . '/' . ($m['body']['meta']['unread_total'] ?? '-'), 'Rider here, parcel is ready/Flow Test rider/0', '');
        $this->check('rider sees "read" on its message', json_encode($this->api($rider, 'GET', "/api/rider-app/messaging/threads/{$tid}/messages")['body']['data'][0]['read_at'] !== null), 'true', '');
        $this->check('courier replies', $send($c1, '/api/courier-app', 'Thanks, on the way')['status'], 201, '');
        $this->check('rider unread = 1 then 0 after opening', $this->api($rider, 'GET', '/api/rider-app/messaging/threads')['body']['data'][0]['unread_count'] . '/' . $this->api($rider, 'GET', "/api/rider-app/messaging/threads/{$tid}/messages")['body']['meta']['unread_total'], '1/0', '');
        $first = $this->api($rider, 'GET', "/api/rider-app/messaging/threads/{$tid}/messages")['body']['data'][0]['id'];
        $this->check('polling after_id returns only newer', count($this->api($rider, 'GET', "/api/rider-app/messaging/threads/{$tid}/messages?after_id={$first}")['body']['data']), 1, '');
        $this->check('read endpoint', $this->api($c1, 'POST', "/api/courier-app/messaging/threads/{$tid}/read")['status'], 200, '');

        // ── participants only ───────────────────────────────────────────────
        $this->check('other rider of the same company cannot read the thread', $this->api($rider2, 'GET', "/api/rider-app/messaging/threads/{$tid}/messages")['status'], 404, '');
        $this->check('other rider cannot send', $send($rider2, '/api/rider-app', 'hi')['status'], 404, '');
        $this->check('other rider cannot mark read', $this->api($rider2, 'POST', "/api/rider-app/messaging/threads/{$tid}/read")['status'], 404, '');
        $this->check("other company's courier cannot read", $this->api($c2, 'GET', "/api/courier-app/messaging/threads/{$tid}/messages")['status'], 404, '');
        $this->check('other rider thread list is empty', json_encode($this->api($rider2, 'GET', '/api/rider-app/messaging/threads')['body']['data']), '[]', '');
        $this->check('empty body', $send($rider, '/api/rider-app', '  ')['status'], 422, '');
        $this->check('body 501 chars', $send($rider, '/api/rider-app', str_repeat('a', 501))['status'], 422, '');
        $this->check('body 500 chars', $send($rider, '/api/rider-app', str_repeat('a', 500))['status'], 201, '');

        // ── courier app: allowed / refused pairs ────────────────────────────
        $st = fn (User $u, string $role, int $id) => $this->api($u, 'POST', '/api/courier-app/messaging/start', ['role' => $role, 'id' => $id])['status'];
        $this->check('courier -> admin', $st($c1, 'admin', 0), 201, '');
        $this->check('courier -> seller with a shipment', $st($c1, 'seller', $seller->id), 201, '');
        $this->check('courier -> own rider', $st($c1, 'rider', $rider2->id), 201, '');
        $this->check("courier -> another company's rider", $st($c1, 'rider', $riderB->id), 403, '');
        $this->check('courier -> other courier', $st($c1, 'courier', $c2->id), 403, '');
        $this->check('courier -> buyer', $st($c1, 'buyer', $buyer->id), 403, '');
        $this->check('courier without a shipment -> seller', $st($c2, 'seller', $seller->id), 403, '');

        // ── courier notifications API ───────────────────────────────────────
        $count = fn (User $u) => $this->api($u, 'GET', '/api/courier-app/notifications/unread-count');
        $all = $this->api($c1, 'GET', '/api/courier-app/notifications');
        $types = collect($all['body']['data'] ?? [])->pluck('type')->sort()->values()->all();
        $this->check('notifications list: pickup assignment + message', json_encode(array_values(array_unique($types))), json_encode(['conversation_message', 'pickup_assigned']), 'types ' . implode(',', $types));
        $row = collect($all['body']['data'] ?? [])->firstWhere('type', 'pickup_assigned') ?? [];
        $this->check('notification item shape (what the app reads)', implode(',', array_keys($row)), 'id,category,type,title,body,is_read,created_at,time_ago,related_type,related_id', '');
        $this->check('meta paging', implode(',', array_keys($all['body']['meta'] ?? [])), 'current_page,last_page,total', '');
        $this->check('category: pickups', json_encode(collect($this->api($c1, 'GET', '/api/courier-app/notifications?category=pickups')['body']['data'])->pluck('category')->unique()->values()->all()), json_encode(['pickups']), '');
        $this->check('category: messages', json_encode(collect($this->api($c1, 'GET', '/api/courier-app/notifications?category=messages')['body']['data'])->pluck('category')->unique()->values()->all()), json_encode(['messages']), '');
        $unread = $count($c1)['body']['data']['unread'] ?? -1;
        $this->check('unread-count = unread rows', $unread, CourierNotification::where('courier_id', $c1->id)->whereNull('read_at')->count(), '');
        $this->check('other company sees none', $count($c2)['body']['data']['unread'] ?? -1, 0, '');
        $id = $row['id'];
        $this->check("other courier cannot read someone else's notification", $this->api($c2, 'POST', "/api/courier-app/notifications/{$id}/read")['status'], 404, '');
        $this->check('mark one read', $this->api($c1, 'POST', "/api/courier-app/notifications/{$id}/read")['status'] . '/' . $count($c1)['body']['data']['unread'], '200/' . ($unread - 1), '');
        $this->check('filter=unread hides it', json_encode(collect($this->api($c1, 'GET', '/api/courier-app/notifications?filter=unread')['body']['data'])->contains('id', $id)), 'false', '');
        $this->check('read-all', $this->api($c1, 'POST', '/api/courier-app/notifications/read-all')['status'] . '/' . $count($c1)['body']['data']['unread'], '200/0', '');
    }
}
