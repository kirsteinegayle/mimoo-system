<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\MessagingController;
use App\Models\ConversationMessage;
use App\Models\CourierNotification;
use App\Models\CourierPersonnel;
use App\Models\SellerNotification;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/**
 * Rollback-only test of role messaging: every allowed pair works, every other
 * pair is 403, participants only, unread / mark read, body limit, image,
 * one notification per unread batch (after commit, dedupe).
 *
 *   php artisan messaging:test-matrix
 */
class MessagingTestMatrix extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'messaging:test-matrix';

    protected $description = 'Rollback-only: messaging pair matrix, participants only, unread, mark read, notifications';

    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    private array $files = [];

    public function handle(): int
    {
        $code = $this->runRolledBack(fn () => $this->runTests(), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'courier_personnel',
            'conversations', 'conversation_participants', 'conversation_messages', 'seller_notifications', 'courier_notifications',
        ]);
        foreach ($this->files as $f) {
            Storage::disk('public')->delete($f);
        }

        return $code;
    }

    /** Controller call for the admin identity (path decides, the admin.verified middleware is checked separately). */
    private function admin(string $method, string $path, array $data = [], ?UploadedFile $file = null): array
    {
        return $this->hit(function () use ($method, $path, $data, $file) {
            $r = Request::create($path, $method, $data, [], $file ? ['image' => $file] : [], ['HTTP_ACCEPT' => 'application/json']);
            app()->instance('request', $r);
            $c = app(MessagingController::class);
            $parts = explode('/', trim($path, '/')); // admin/messaging/...
            $id = isset($parts[3]) && ctype_digit($parts[3]) ? (int) $parts[3] : (ctype_digit($parts[4] ?? '') ? (int) $parts[4] : 0);
            return match (true) {
                str_ends_with($path, '/contacts') => $c->contacts($r),
                str_ends_with($path, '/threads') => $c->threads($r),
                str_ends_with($path, '/start') => $c->start($r),
                str_ends_with($path, '/read') => $c->read($r, $id),
                $method === 'POST' => $c->send($r, $id),
                default => $c->messages($r, $id),
            };
        });
    }

    private function runTests(): void
    {
        foreach (['admin/messaging/threads', 'messaging/threads', 'api/rider-app/messaging/threads', 'api/courier-app/messaging/threads'] as $uri) {
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($x) => $x->uri() === $uri);
            $mw = $route ? $route->gatherMiddleware() : [];
            $need = str_starts_with($uri, 'admin') ? 'admin.verified' : (str_starts_with($uri, 'api/rider') ? 'rider.role' : (str_starts_with($uri, 'api/courier') ? 'courier.role' : 'auth'));
            $this->check("route {$uri}", in_array($need, $mw, true) ? 'guarded' : 'OPEN', 'guarded', "needs {$need}");
        }
        $this->check('admin inbox without admin session', $this->http(null, 'GET', '/admin/messaging/threads')['status'], 403, '');
        $this->check('guest on web inbox', in_array($this->http(null, 'GET', '/messaging/threads')['status'], [401, 302], true) ? 'blocked' : 'OPEN', 'blocked', '');

        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified'];
        $buyer   = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller  = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);
        $seller2 = $this->makeUser('seller.2', ['account_type' => 'seller', 'role' => 'seller']);
        $c1      = $this->makeUser('courier.1', $co);
        $c2      = $this->makeUser('courier.2', $co);
        $hub     = $this->makeUser('hub', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'verification_status' => 'verified', 'courier_company_id' => $c1->id]);
        $rider   = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
        CourierPersonnel::create(['courier_id' => $c1->id, 'user_id' => $rider->id, 'name' => 'Flow Rider', 'role' => 'rider', 'status' => 'active']);
        [$order] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id, 'assigned_at' => now(),
            'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'accepted', 'pickup_status' => 'scheduled']);

        $start = fn (?User $u, string $role, int $id) => $u
            ? $this->http($u, 'POST', '/messaging/start', ['role' => $role, 'id' => $id])['status']
            : $this->admin('POST', '/admin/messaging/start', ['role' => $role, 'id' => $id])['status'];

        // ── allowed pairs ───────────────────────────────────────────────────
        $allowed = [
            'admin -> seller'   => [null, 'seller', $seller->id],
            'admin -> buyer'    => [null, 'buyer', $buyer->id],
            'admin -> courier'  => [null, 'courier', $c1->id],
            'admin -> logistics' => [null, 'logistics', $hub->id],
            'seller -> admin'   => [$seller, 'admin', 0],
            'seller -> courier (shipment of their order)' => [$seller, 'courier', $c1->id],
            'courier -> seller (shipment of their order)' => [$c1, 'seller', $seller->id],
            'courier -> admin'  => [$c1, 'admin', 0],
            'courier -> rider (own company)' => [$c1, 'rider', $rider->id],
            'rider -> courier (own company)' => [$rider, 'courier', $c1->id],
            'logistics -> admin' => [$hub, 'admin', 0],
            'buyer -> admin'    => [$buyer, 'admin', 0],
        ];
        foreach ($allowed as $label => [$u, $role, $id]) {
            $this->check("allowed: {$label}", $start($u, $role, $id), 201, '');
        }

        // ── refused pairs ───────────────────────────────────────────────────
        $denied = [
            'seller -> seller'        => [$seller, 'seller', $seller2->id],
            'seller -> itself'        => [$seller, 'seller', $seller->id],
            'seller -> courier (no shared order)' => [$seller2, 'courier', $c1->id],
            'seller -> other courier' => [$seller, 'courier', $c2->id],
            'seller -> logistics'     => [$seller, 'logistics', $hub->id],
            'seller -> rider'         => [$seller, 'rider', $rider->id],
            'seller -> buyer'         => [$seller, 'buyer', $buyer->id],
            'courier -> courier'      => [$c1, 'courier', $c2->id],
            'courier -> logistics'    => [$c1, 'logistics', $hub->id],
            'courier -> seller (no shared order)' => [$c2, 'seller', $seller->id],
            'courier -> rider of another company' => [$c2, 'rider', $rider->id],
            'rider -> admin'          => [$rider, 'admin', 0],
            'rider -> seller'         => [$rider, 'seller', $seller->id],
            'rider -> other company courier' => [$rider, 'courier', $c2->id],
            'rider -> logistics'      => [$rider, 'logistics', $hub->id],
            'logistics -> seller'     => [$hub, 'seller', $seller->id],
            'logistics -> courier'    => [$hub, 'courier', $c1->id],
            'buyer -> courier'        => [$buyer, 'courier', $c1->id],
            'buyer -> seller (existing buyer chat)' => [$buyer, 'seller', $seller->id],
            'admin -> rider'          => [null, 'rider', $rider->id],
            'admin -> unknown seller id' => [null, 'seller', 99999999],
        ];
        foreach ($denied as $label => [$u, $role, $id]) {
            $this->check("refused: {$label}", $start($u, $role, $id), 403, '');
        }
        $this->check('start: invalid role value', $this->http($seller, 'POST', '/messaging/start', ['role' => 'hacker', 'id' => 1])['status'], 422, '');
        $this->check('contacts (seller): admin + related courier only', json_encode(collect($this->http($seller, 'GET', '/messaging/contacts')['body']['data'])->map(fn ($c) => $c['role'] . ':' . $c['id'])->all()), json_encode(['admin:0', "courier:{$c1->id}"]), '');
        $this->check('contacts (rider): own company only', json_encode(collect($this->http($rider, 'GET', '/messaging/contacts')['body']['data'])->map(fn ($c) => $c['role'] . ':' . $c['id'])->all()), json_encode(["courier:{$c1->id}"]), '');
        $this->check('one thread per pair (start twice)', $this->http($seller, 'POST', '/messaging/start', ['role' => 'courier', 'id' => $c1->id])['body']['data']['id'] === $this->http($c1, 'POST', '/messaging/start', ['role' => 'seller', 'id' => $seller->id])['body']['data']['id'] ? 'same' : 'DIFFERENT', 'same', '');

        // ── seller <-> courier conversation ─────────────────────────────────
        $tid = $this->http($seller, 'POST', '/messaging/start', ['role' => 'courier', 'id' => $c1->id])['body']['data']['id'];
        $sellerNotif = fn () => SellerNotification::where('seller_id', $seller->id)->where('type', 'conversation_message')->count();
        $courierNotif = fn () => CourierNotification::where('courier_id', $c1->id)->where('type', 'conversation_message')->count();
        $send = fn (User $u, string $body) => $this->http($u, 'POST', "/messaging/threads/{$tid}/messages", ['body' => $body]);

        foreach (['hello 1', 'hello 2', 'hello 3'] as $b) {
            $this->check("courier sends '{$b}'", $send($c1, $b)['status'], 201, '');
        }
        $this->check('seller: 3 unread, ONE notification', $this->http($seller, 'GET', '/messaging/threads')['body']['data'][0]['unread_count'] . '/' . $sellerNotif(), '3/1', 'one per unread batch');
        $this->check('thread unread_total meta', $this->http($seller, 'GET', '/messaging/threads')['body']['meta']['unread_total'], 3, '');
        $this->check('courier has no unread of own messages', $this->http($c1, 'GET', '/messaging/threads')['body']['data'][0]['unread_count'], 0, '');
        $this->check('third user cannot read the thread', $this->http($seller2, 'GET', "/messaging/threads/{$tid}/messages")['status'], 404, 'participants only');
        $this->check('third user cannot send', $this->http($seller2, 'POST', "/messaging/threads/{$tid}/messages", ['body' => 'x'])['status'], 404, '');
        $this->check('other company courier cannot read', $this->http($c2, 'GET', "/messaging/threads/{$tid}/messages")['status'], 404, '');
        $this->check('third user cannot mark read', $this->http($seller2, 'POST', "/messaging/threads/{$tid}/read")['status'], 404, '');
        $this->check('unread unchanged after outsiders', $this->http($seller, 'GET', '/messaging/threads')['body']['data'][0]['unread_count'], 3, '');

        $msgs = $this->http($seller, 'GET', "/messaging/threads/{$tid}/messages");
        $this->check('seller opens thread: 3 messages, none mine', $msgs['status'] . '/' . count($msgs['body']['data']) . '/' . json_encode(collect($msgs['body']['data'])->contains('is_mine', true)), '200/3/false', '');
        $this->check('opening marks read', $this->http($seller, 'GET', '/messaging/threads')['body']['data'][0]['unread_count'], 0, '');
        $this->check('seller notification marked read', SellerNotification::where('seller_id', $seller->id)->where('type', 'conversation_message')->whereNull('read_at')->count(), 0, '');
        $after = $msgs['body']['data'][1]['id'];
        $this->check('polling ?after_id returns only newer', count($this->http($seller, 'GET', "/messaging/threads/{$tid}/messages?after_id={$after}")['body']['data']), 1, '');
        $this->check('courier sees its messages as read after seller opened them', json_encode($this->http($c1, 'GET', "/messaging/threads/{$tid}/messages")['body']['data'][0]['read_at'] !== null), 'true', '');

        $send($c1, 'hello 4');
        $this->check('after reading, next message notifies again (2nd batch)', $sellerNotif(), 2, '');
        $send($c1, 'hello 5');
        $this->check('still unread: no extra notification', $sellerNotif(), 2, '');
        $this->check('seller replies -> courier notified once', $send($seller, 'reply')['status'] . '/' . $courierNotif(), '201/1', '');
        $this->check('seller reply cleared their unread', $this->http($seller, 'GET', '/messaging/threads')['body']['data'][0]['unread_count'], 0, '');
        $this->check('mark read endpoint', $this->http($c1, 'POST', "/messaging/threads/{$tid}/read")['body']['data']['marked'] ?? '-', 1, '');
        $this->check('logistics staff linked to the company is NOT the courier identity', $this->http($hub, 'GET', "/messaging/threads/{$tid}/messages")['status'], 404, '');

        // notification dedupe key is unique per recipient
        $dupe = DB::table('seller_notifications')->where('seller_id', $seller->id)->where('type', 'conversation_message')->first();
        $ins = DB::table('seller_notifications')->insertOrIgnore(['seller_id' => $seller->id, 'type' => 'x', 'title' => 'x', 'message' => 'x', 'dedupe_key' => $dupe->dedupe_key, 'created_at' => now(), 'updated_at' => now()]);
        $this->check('dedupe_key unique per recipient', $ins, 0, $dupe->dedupe_key);

        // after-commit: rolled back send leaves no notification
        $before = $sellerNotif();
        DB::beginTransaction();
        $this->http($c1, 'POST', "/messaging/threads/{$tid}/messages", ['body' => 'will be rolled back']);
        DB::rollBack();
        $this->check('rolled-back message: no new notification', $sellerNotif() . '/' . ConversationMessage::where('body', 'will be rolled back')->count(), "{$before}/0", 'after-commit');

        // ── body limit + image ──────────────────────────────────────────────
        $this->check('empty body', $send($c1, '   ')['status'], 422, '');
        $this->check('body 501 chars', $send($c1, str_repeat('a', 501))['status'], 422, '');
        $this->check('body 500 chars', $send($c1, str_repeat('a', 500))['status'], 201, '');
        $f = tempnam(sys_get_temp_dir(), 'msg');
        file_put_contents($f, base64_decode(self::PNG));
        $r = $this->hit(function () use ($c1, $tid, $f) {
            $req = Request::create("/messaging/threads/{$tid}/messages", 'POST', [], [], ['image' => new UploadedFile($f, 'p.png', 'image/png', null, true)], ['HTTP_ACCEPT' => 'application/json']);
            app()->instance('request', $req);
            $req->setUserResolver(fn () => $c1);
            return app(MessagingController::class)->send($req, $tid);
        });
        $imgRow = ConversationMessage::where('conversation_id', $tid)->whereNotNull('image_path')->first();
        if ($imgRow) {
            $this->files[] = $imgRow->image_path;
        }
        @unlink($f);
        $this->check('image message', $r['status'] . '/' . ($r['body']['data']['image_url'] ? 'url' : '-'), '201/url', '');
        $this->check('image served to a participant', $imgRow ? $this->http($seller, 'GET', "/messaging/messages/{$imgRow->id}/image")['status'] : 'no row', 200, '');
        $this->check('image hidden from others', $imgRow ? $this->http($seller2, 'GET', "/messaging/messages/{$imgRow->id}/image")['status'] : 'no row', 404, '');

        // ── admin <-> seller + rider app route ──────────────────────────────
        $aid = $this->admin('POST', '/admin/messaging/start', ['role' => 'seller', 'id' => $seller->id])['body']['data']['id'];
        $beforeAdmin = $sellerNotif();
        $r = $this->admin('POST', "/admin/messaging/threads/{$aid}/messages", ['body' => 'Hello from admin']);
        $this->check('admin sends to seller', $r['status'] . '/' . $sellerNotif(), '201/' . ($beforeAdmin + 1), 'seller notified once');
        $this->check('admin thread list', count($this->admin('GET', '/admin/messaging/threads')['body']['data']), 1, 'only the admin team threads');
        $this->check('seller sees the admin thread, name mimoo Admin', collect($this->http($seller, 'GET', '/messaging/threads')['body']['data'])->firstWhere('id', $aid)['counterpart_name'] ?? '-', 'mimoo Admin', '');
        $this->check('seller of another account cannot open the admin thread', $this->http($seller2, 'GET', "/messaging/threads/{$aid}/messages")['status'], 404, '');

        $rid = $this->http($c1, 'POST', '/messaging/start', ['role' => 'rider', 'id' => $rider->id])['body']['data']['id'];
        $this->check('courier -> rider message', $this->http($c1, 'POST', "/messaging/threads/{$rid}/messages", ['body' => 'Pick up order'])['status'], 201, '');
        $this->check('rider reads it (rider app route uses the same controller)', $this->http($rider, 'GET', "/messaging/threads/{$rid}/messages")['body']['data'][0]['body'] ?? '-', 'Pick up order', '');
        // a rider removed from the company can no longer send
        CourierPersonnel::where('user_id', $rider->id)->update(['status' => 'inactive']);
        $this->check('deactivated rider can no longer send', $this->http($rider, 'POST', "/messaging/threads/{$rid}/messages", ['body' => 'hi'])['status'], 403, 'pair rules re-checked on send');
    }
}
