<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BuyerChatController;
use App\Http\Controllers\Api\SellerChatController;
use App\Models\BuyerNotification;
use App\Models\ChatMessage;
use App\Models\SellerNotification;
use App\Models\User;
use App\Services\ChatNotificationService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\DatabaseTransactionsManager as TestTransactionsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Rollback-only end-to-end tests for buyer <-> seller chat
 * (chat_threads / chat_messages, mobile + web buyer, seller web).
 *
 * ONE wrapper transaction, ALWAYS rolled back. The Laravel testing
 * transaction manager is swapped in (same as seller:test-notifications) so
 * DB::afterCommit() notification inserts run when the inner work commits.
 *
 *   php artisan chat:test-buyer-seller
 */
class ChatTestBuyerSeller extends Command
{
    protected $signature = 'chat:test-buyer-seller';

    protected $description = 'Rollback-only tests: buyer<->seller chat both ways, access, unread/read, notifications (no doubles), validation, mobile shape';

    private const THREAD_KEYS  = ['id', 'seller_id', 'seller_name', 'seller_photo_url', 'product', 'last_message', 'last_message_at', 'unread_count'];
    private const MESSAGE_KEYS = ['id', 'thread_id', 'is_mine', 'body', 'image_url', 'read_at', 'created_at'];

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $counts = $this->counts();

        $conn     = DB::connection();
        $original = app('db.transactions');
        $manager  = new TestTransactionsManager([$conn->getName()]);
        $conn->setTransactionManager($manager);
        app()->instance('db.transactions', $manager);

        $conn->beginTransaction();
        try {
            $this->runTests();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            $conn->rollBack();
            $conn->setTransactionManager($original);
            app()->instance('db.transactions', $original);
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($after));

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(): void
    {
        $buyerCtl  = app(BuyerChatController::class);
        $sellerCtl = app(SellerChatController::class);

        // 0. Routes: mobile (sanctum), buyer web + seller web (session) — all behind auth.
        $routes = [
            ['POST', 'api/buyer/chat/start', 'auth:sanctum', BuyerChatController::class . '@start'],
            ['GET', 'api/buyer/chat', 'auth:sanctum', BuyerChatController::class . '@index'],
            ['GET', 'api/buyer/chat/{id}/messages', 'auth:sanctum', BuyerChatController::class . '@messages'],
            ['POST', 'api/buyer/chat/{id}/messages', 'auth:sanctum', BuyerChatController::class . '@send'],
            ['POST', 'buyer/chat/start', 'auth', BuyerChatController::class . '@start'],
            ['GET', 'buyer/chat/threads', 'auth', BuyerChatController::class . '@index'],
            ['GET', 'buyer/chat/{id}/messages', 'auth', BuyerChatController::class . '@messages'],
            ['POST', 'buyer/chat/{id}/messages', 'auth', BuyerChatController::class . '@send'],
            ['GET', 'seller/chat/threads', 'auth', SellerChatController::class . '@index'],
            ['GET', 'seller/chat/{id}/messages', 'auth', SellerChatController::class . '@messages'],
            ['POST', 'seller/chat/{id}/messages', 'auth', SellerChatController::class . '@send'],
            ['POST', 'seller/chat/{id}/read', 'auth', SellerChatController::class . '@markRead'],
        ];
        foreach ($routes as [$m, $uri, $mw, $action]) {
            $r  = $this->route($m, $uri);
            $ok = $r && in_array($mw, $r->gatherMiddleware(), true) && $r->getActionName() === $action;
            $this->check("route {$m} {$uri}", $ok ? 'yes' : 'NO', 'yes', $r ? implode(',', $r->gatherMiddleware()) : 'missing');
        }

        // Fixtures (rolled back)
        $sellerA = $this->makeUser('seller.a', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'Chat Test Store A']);
        $sellerB = $this->makeUser('seller.b', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'Chat Test Store B']);
        $buyerA  = $this->makeUser('buyer.a', ['account_type' => 'buyer', 'role' => 'buyer']);
        $buyerB  = $this->makeUser('buyer.b', ['account_type' => 'buyer', 'role' => 'buyer']);

        // 1. Buyer starts a thread (mobile endpoint) — same shape as before.
        $r = $this->hit(fn () => $buyerCtl->start($this->req($buyerA, 'POST', ['seller_id' => $sellerA->id])));
        $tid = (int) ($r['body']['data']['id'] ?? 0);
        $this->check('buyer start: status', $r['status'], 200, "thread #{$tid}");
        $this->check('buyer start: mobile thread keys', $this->keys($r['body']['data'] ?? []), $this->keys(array_flip(self::THREAD_KEYS)), '');
        $r2 = $this->hit(fn () => $buyerCtl->start($this->req($buyerA, 'POST', ['seller_id' => $sellerA->id])));
        $this->check('buyer start again: same thread', $r2['body']['data']['id'] ?? '-', $tid, '');

        // 2. Buyer sends → seller sees it.
        $r = $this->hit(fn () => $buyerCtl->send($this->req($buyerA, 'POST', ['body' => '  Hello seller  ']), $tid));
        $m1 = $r['body']['data'] ?? [];
        $this->check('buyer send: status', $r['status'], 201, '');
        $this->check('buyer send: mobile message keys', $this->keys($m1), $this->keys(array_flip(self::MESSAGE_KEYS)), '');
        $this->check('buyer send: trimmed / is_mine', ($m1['body'] ?? '-') . '/' . json_encode($m1['is_mine'] ?? null), 'Hello seller/true', '');

        $r = $this->hit(fn () => $sellerCtl->index($this->req($sellerA, 'GET')));
        $row = collect($r['body']['data'] ?? [])->firstWhere('id', $tid) ?? [];
        $this->check('seller A inbox: has thread', $row ? 'yes' : 'NO', 'yes', '');
        $this->check('seller A inbox: buyer / last / unread', ($row['buyer_name'] ?? '-') . '|' . ($row['last_message']['body'] ?? '-') . '|' . ($row['unread_count'] ?? '-'),
            'Chat Test buyer.a|Hello seller|1', '');
        $this->check('seller A inbox: unread_total', $r['body']['meta']['unread_total'] ?? '-', 1, '');
        $this->check('seller A inbox: last is_mine false', json_encode($row['last_message']['is_mine'] ?? null), 'false', '');

        // 3. Seller notification: one per unread batch.
        $this->check('seller notif after msg 1', $this->sellerNotifs($sellerA), 1, '');
        $n = SellerNotification::where('seller_id', $sellerA->id)->where('type', 'chat_message')->first();
        $this->check('seller notif url / key', ($n->url ?? '-') . '|' . ($n->dedupe_key ?? '-'), "/seller/messages?thread={$tid}|chat:{$tid}:{$m1['id']}", $n->title ?? '');
        $this->hit(fn () => $buyerCtl->send($this->req($buyerA, 'POST', ['body' => 'Are you there?']), $tid));
        $this->check('seller notif after msg 2 (unread batch)', $this->sellerNotifs($sellerA), 1, 'no double');
        ChatNotificationService::messageSent(\App\Models\ChatThread::find($tid), ChatMessage::where('thread_id', $tid)->latest('id')->first());
        $this->check('seller notif: replayed event', $this->sellerNotifs($sellerA), 1, 'insertOrIgnore');

        // 4. Access: other seller / other buyer / wrong account type.
        $r = $this->hit(fn () => $sellerCtl->index($this->req($sellerB, 'GET')));
        $this->check('seller B inbox: no thread', collect($r['body']['data'] ?? [])->contains('id', $tid) ? 'LEAK' : 'none', 'none', '');
        $this->check('seller B: messages', $this->hit(fn () => $sellerCtl->messages($this->req($sellerB, 'GET'), $tid))['status'], 404, '');
        $this->check('seller B: send', $this->hit(fn () => $sellerCtl->send($this->req($sellerB, 'POST', ['body' => 'x']), $tid))['status'], 404, '');
        $this->check('seller B: read', $this->hit(fn () => $sellerCtl->markRead($this->req($sellerB, 'POST'), $tid))['status'], 404, '');
        $this->check('buyer B: messages', $this->hit(fn () => $buyerCtl->messages($this->req($buyerB, 'GET'), $tid))['status'], 404, '');
        $this->check('buyer B: send', $this->hit(fn () => $buyerCtl->send($this->req($buyerB, 'POST', ['body' => 'x']), $tid))['status'], 404, '');
        $r = $this->hit(fn () => $buyerCtl->index($this->req($buyerB, 'GET')));
        $this->check('buyer B: list has no thread', collect($r['body']['data'] ?? [])->contains('id', $tid) ? 'LEAK' : 'none', 'none', '');
        $this->check('buyer on seller endpoint', $this->hit(fn () => $sellerCtl->index($this->req($buyerA, 'GET')))['status'], 403, '');
        $this->check('buyer on seller send', $this->hit(fn () => $sellerCtl->send($this->req($buyerA, 'POST', ['body' => 'x']), $tid))['status'], 403, '');
        $this->check('seller on buyer endpoint', $this->hit(fn () => $buyerCtl->messages($this->req($sellerA, 'GET'), $tid))['status'], 403, '');
        $this->check('no stray messages', ChatMessage::where('thread_id', $tid)->count(), 2, '');

        // 5. Seller opens the thread → buyer messages read, seller notif read.
        $r = $this->hit(fn () => $sellerCtl->messages($this->req($sellerA, 'GET'), $tid));
        $this->check('seller open: status / count', $r['status'] . '/' . count($r['body']['data'] ?? []), '200/2', '');
        $this->check('seller open: thread buyer_name', $r['body']['thread']['buyer_name'] ?? '-', 'Chat Test buyer.a', '');
        $this->check('seller open: unread_total 0', $r['body']['meta']['unread_total'] ?? '-', 0, '');
        $this->check('buyer msgs read_at set', ChatMessage::where('thread_id', $tid)->where('sender_id', $buyerA->id)->whereNull('read_at')->count(), 0, '');
        $this->check('seller chat notif marked read', SellerNotification::where('seller_id', $sellerA->id)->where('type', 'chat_message')->whereNull('read_at')->count(), 0, '');

        // 6. Seller replies → buyer sees it (mobile endpoint), one buyer notification.
        $r = $this->hit(fn () => $sellerCtl->send($this->req($sellerA, 'POST', ['body' => 'Hi! How can I help?']), $tid));
        $s1 = $r['body']['data'] ?? [];
        $this->check('seller reply: status / is_mine', $r['status'] . '/' . json_encode($s1['is_mine'] ?? null), '201/true', '');
        $this->check('buyer notif after reply 1', $this->buyerNotifs($buyerA), 1, '');
        $bn = BuyerNotification::where('buyer_id', $buyerA->id)->where('type', 'chat_message')->first();
        $this->check('buyer notif data', ($bn->data['thread_id'] ?? '-') . '|' . ($bn->data['url'] ?? '-'), "{$tid}|/messages?thread={$tid}", $bn->title ?? '');
        $this->hit(fn () => $sellerCtl->send($this->req($sellerA, 'POST', ['body' => 'We have stock.']), $tid));
        $this->check('buyer notif after reply 2 (unread batch)', $this->buyerNotifs($buyerA), 1, 'no double');

        $r = $this->hit(fn () => $buyerCtl->index($this->req($buyerA, 'GET')));
        $row = collect($r['body']['data'] ?? [])->firstWhere('id', $tid) ?? [];
        $this->check('buyer list: unread / total', ($row['unread_count'] ?? '-') . '/' . ($r['body']['meta']['unread_total'] ?? '-'), '2/2', '');
        $this->check('buyer list: mobile thread keys', $this->keys($row), $this->keys(array_flip(self::THREAD_KEYS)), '');
        $this->check('buyer list: seller name', $row['seller_name'] ?? '-', 'Chat Test Store A', '');

        $r = $this->hit(fn () => $buyerCtl->messages($this->req($buyerA, 'GET', ['after_id' => $m1['id']]), $tid));
        $data = $r['body']['data'] ?? [];
        $this->check('buyer poll after_id: new msgs', count($data), 3, 'msg 2 + 2 replies');
        $this->check('buyer poll: reply is_mine false', json_encode(collect($data)->firstWhere('id', $s1['id'])['is_mine'] ?? null), 'false', '');
        $this->check('buyer poll: mobile message keys', $this->keys($data[0] ?? []), $this->keys(array_flip(self::MESSAGE_KEYS)), '');
        $this->check('buyer poll: thread keys', $this->keys($r['body']['thread'] ?? []), $this->keys(array_flip(['id', 'seller_id', 'seller_name', 'product'])), '');
        $this->check('seller msgs read by buyer', ChatMessage::where('thread_id', $tid)->where('sender_id', $sellerA->id)->whereNull('read_at')->count(), 0, '');
        $this->check('buyer chat notif marked read', BuyerNotification::where('buyer_id', $buyerA->id)->where('type', 'chat_message')->whereNull('read_at')->count(), 0, '');
        $last = ChatMessage::where('thread_id', $tid)->max('id');
        $r = $this->hit(fn () => $buyerCtl->messages($this->req($buyerA, 'GET', ['after_id' => $last]), $tid));
        $this->check('buyer poll at newest: empty', count($r['body']['data'] ?? []), 0, '');

        // 7. New batches after reading → exactly one new notification each.
        $this->hit(fn () => $sellerCtl->send($this->req($sellerA, 'POST', ['body' => 'Anything else?']), $tid));
        $this->check('buyer notif: new batch', $this->buyerNotifs($buyerA), 2, '');
        $this->hit(fn () => $buyerCtl->send($this->req($buyerA, 'POST', ['body' => 'Thanks!']), $tid));
        $this->check('seller notif: new batch', $this->sellerNotifs($sellerA), 2, '');
        $this->check('seller notif keys unique', SellerNotification::where('seller_id', $sellerA->id)->select('dedupe_key')->groupBy('dedupe_key')->havingRaw('COUNT(*) > 1')->count(), 0, '');

        // 8. Explicit mark read (seller).
        $r = $this->hit(fn () => $sellerCtl->markRead($this->req($sellerA, 'POST'), $tid));
        $this->check('seller markRead: marked / total', ($r['body']['data']['marked'] ?? '-') . '/' . ($r['body']['meta']['unread_total'] ?? '-'), '1/0', '');
        $r = $this->hit(fn () => $sellerCtl->markRead($this->req($sellerA, 'POST'), $tid));
        $this->check('seller markRead again (idempotent)', ($r['body']['data']['marked'] ?? '-'), 0, '');

        // 9. Validation (blank, too long) on both sides — nothing stored.
        $before = ChatMessage::where('thread_id', $tid)->count();
        $long   = str_repeat('a', SellerChatController::MAX_LENGTH + 1);
        foreach ([
            'seller blank'    => fn () => $sellerCtl->send($this->req($sellerA, 'POST', ['body' => '   ']), $tid),
            'seller too long' => fn () => $sellerCtl->send($this->req($sellerA, 'POST', ['body' => $long]), $tid),
            'buyer blank'     => fn () => $buyerCtl->send($this->req($buyerA, 'POST', ['body' => '']), $tid),
            'buyer too long'  => fn () => $buyerCtl->send($this->req($buyerA, 'POST', ['body' => $long]), $tid),
        ] as $label => $fn) {
            $this->check("validation: {$label}", $this->hit($fn)['status'], 422, '');
        }
        $this->check('validation: nothing stored', ChatMessage::where('thread_id', $tid)->count(), $before, '');
        $r = $this->hit(fn () => $sellerCtl->send($this->req($sellerA, 'POST', ['body' => str_repeat('b', SellerChatController::MAX_LENGTH)]), $tid));
        $this->check('validation: exactly max OK', $r['status'], 201, '');

        // 10. Other users got nothing.
        $this->check('seller B: no notifications', SellerNotification::where('seller_id', $sellerB->id)->count(), 0, '');
        $this->check('buyer B: no notifications', BuyerNotification::where('buyer_id', $buyerB->id)->count(), 0, '');

        // 11. Pages: /messages (buyer) and seller redirect.
        $page = $this->route('GET', 'messages');
        $closure = $page?->getAction('uses');
        $pg = $this->inertia(fn () => $closure($this->req($buyerA, 'GET', ['thread' => (string) $tid])));
        $this->check('page /messages (buyer)', ($pg['status'] ?? '?') . '/' . ($pg['component'] ?? '-') . '/' . ($pg['props']['initialThreadId'] ?? '-'), "200/BuyerMessages/{$tid}", '');
        $res = $closure($this->req($sellerA, 'GET'));
        $this->check('page /messages (seller) redirect', $res instanceof RedirectResponse ? parse_url($res->getTargetUrl(), PHP_URL_PATH) : get_class($res), '/seller/messages', '');

        // 12b. "Chat with seller" (/messages?seller_id=X): page props + web start
        //      route repeated → exactly ONE thread per buyer+seller.
        $pg = $this->inertia(fn () => $closure($this->req($buyerB, 'GET', ['seller_id' => (string) $sellerB->id])));
        $this->check('page ?seller_id → startSellerId', ($pg['props']['startSellerId'] ?? '-') . '/' . json_encode($pg['props']['startProductId'] ?? null), "{$sellerB->id}/null", '');
        $pg = $this->inertia(fn () => $closure($this->req($buyerB, 'GET', ['seller_id' => 'abc'])));
        $this->check('page ?seller_id=abc ignored', array_key_exists('startSellerId', $pg['props'] ?? []) ? json_encode($pg['props']['startSellerId']) : 'missing', 'null', '');
        $ids = [];
        for ($i = 0; $i < 3; $i++) {
            $ids[] = $this->hit(fn () => $buyerCtl->start($this->req($buyerB, 'POST', ['seller_id' => $sellerB->id])))['body']['data']['id'] ?? 0;
        }
        $this->check('start x3: same thread id', count(array_unique($ids)), 1, implode(',', $ids));
        $this->check('start x3: one thread in DB', \App\Models\ChatThread::where('buyer_id', $buyerB->id)->where('seller_id', $sellerB->id)->count(), 1, '');
        $this->check('start other seller: not found', $this->hit(fn () => $buyerCtl->start($this->req($buyerB, 'POST', ['seller_id' => $buyerA->id])))['status'], 404, 'buyer id as seller');

        // product_id: own product attaches; another seller's product → 422 (page then retries without it)
        $prod = \App\Models\Product::whereHas('seller', fn ($q) => $q->where('account_type', 'seller')->where('status', 'approved'))
            ->orderBy('id')->first();
        if ($prod) {
            $r = $this->hit(fn () => $buyerCtl->start($this->req($buyerB, 'POST', ['seller_id' => $sellerB->id, 'product_id' => $prod->id])));
            $this->check('start with other seller product', $r['status'], 422, "product #{$prod->id}");
            $prodSeller = User::find($prod->seller_id);
            $r = $this->hit(fn () => $buyerCtl->start($this->req($buyerB, 'POST', ['seller_id' => $prodSeller->id, 'product_id' => $prod->id])));
            $this->check('start with own product: card', ($r['status'] ?? '-') . '/' . ($r['body']['data']['product']['id'] ?? '-'), "200/{$prod->id}", '');
            $r = $this->hit(fn () => $buyerCtl->start($this->req($buyerB, 'POST', ['seller_id' => $prodSeller->id])));
            $this->check('start same seller again: same thread', \App\Models\ChatThread::where('buyer_id', $buyerB->id)->where('seller_id', $prodSeller->id)->count(), 1, '');

            // 12c. Order pages expose seller_id / sellers (additive) for the button.
            $order = \App\Models\Order::create(['buyer_id' => $buyerB->id, 'status' => 'pending', 'total' => 100, 'payment_method' => 'cod',
                'shipping_name' => 'Chat Test', 'shipping_address' => 'Test St', 'shipping_phone' => '09000000000']);
            \App\Models\OrderItem::create(['order_id' => $order->id, 'product_id' => $prod->id, 'seller_id' => $prodSeller->id,
                'product_name' => 'Chat Test Item', 'quantity' => 1, 'unit_price' => 100]);
            \Illuminate\Support\Facades\Auth::setUser($buyerB);
            $oc = app(\App\Http\Controllers\OrderController::class);
            $od = $this->inertia(fn () => $oc->show($order->id));
            $o  = $od['props']['order'] ?? [];
            $this->check('OrderDetail: sellers / item seller_id', ($o['sellers'][0]['id'] ?? '-') . '/' . ($o['items'][0]['seller_id'] ?? '-'), "{$prodSeller->id}/{$prodSeller->id}", $o['sellers'][0]['name'] ?? '');
            $this->check('OrderDetail: old fields kept', isset($o['items'][0]['product_id'], $o['items'][0]['subtotal'], $o['can_cancel']) ? 'yes' : 'NO', 'yes', '');
            $mp = $this->inertia(fn () => $oc->index());
            $row = collect($mp['props']['orders'] ?? [])->firstWhere('id', $order->id) ?? [];
            $this->check('MyPurchases: sellers / item seller_id', ($row['sellers'][0]['id'] ?? '-') . '/' . ($row['items'][0]['seller_id'] ?? '-'), "{$prodSeller->id}/{$prodSeller->id}", '');
            $this->check('MyPurchases: old seller_name kept', array_key_exists('seller_name', $row['items'][0] ?? []) ? 'yes' : 'NO', 'yes', '');
        } else {
            $this->check('product fixture', 'missing', 'present', 'need at least 1 product with a seller');
        }

        // 12. Chat image serving rejects traversal / bad names.
        foreach (['../.env', 'chat_x.jpg', 'chat_' . str_repeat('a', 32) . '.gif'] as $bad) {
            try {
                $buyerCtl->serveImage($bad);
                $status = 200;
            } catch (HttpException $e) {
                $status = $e->getStatusCode();
            }
            $this->check("chat-image rejects {$bad}", $status, 404, '');
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function route(string $method, string $uri)
    {
        return collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === $uri && in_array($method, $r->methods(), true));
    }

    private function sellerNotifs(User $s): int
    {
        return SellerNotification::where('seller_id', $s->id)->where('type', 'chat_message')->count();
    }

    private function buyerNotifs(User $b): int
    {
        return BuyerNotification::where('buyer_id', $b->id)->where('type', 'chat_message')->count();
    }

    private function keys(array $a): string
    {
        $k = array_keys($a);
        sort($k);
        return implode(',', $k);
    }

    private function inertia(\Closure $fn): array
    {
        try {
            $res = $fn();
            $req = Request::create('/messages', 'GET');
            $req->headers->set('X-Inertia', 'true');
            $http = $res->toResponse($req);
            $page = json_decode($http->getContent(), true) ?? [];
            return ['status' => $http->getStatusCode(), 'component' => $page['component'] ?? null, 'props' => $page['props'] ?? []];
        } catch (HttpException $e) {
            return ['status' => $e->getStatusCode(), 'component' => null, 'props' => []];
        }
    }

    private function hit(\Closure $fn): array
    {
        /** @var JsonResponse $res */
        $res = $fn();
        return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
    }

    private function req(User $user, string $method, array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function makeUser(string $tag, array $attrs): User
    {
        $user = new User();
        $user->forceFill(array_merge([
            'name'       => "Chat Test {$tag}",
            'first_name' => 'Chat',
            'last_name'  => "Test {$tag}",
            'email'      => "chat-test.{$tag}." . Str::lower(Str::random(6)) . '@check.invalid',
            'password'   => Str::random(32),
            'status'     => 'approved',
        ], $attrs))->save();
        return $user;
    }

    private function counts(): array
    {
        return [
            'chat_threads'         => DB::table('chat_threads')->count(),
            'chat_messages'        => DB::table('chat_messages')->count(),
            'seller_notifications' => DB::table('seller_notifications')->count(),
            'buyer_notifications'  => DB::table('buyer_notifications')->count(),
            'users'                => DB::table('users')->count(),
            'orders'               => DB::table('orders')->count(),
            'order_items'          => DB::table('order_items')->count(),
        ];
    }

    private function check(string $label, $got, $expected, string $note): void
    {
        $ok = (string) $got === (string) $expected;
        if (! $ok) {
            $this->failed++;
        }
        $this->rows[] = [$label, $got . ($ok ? '' : '  ✗'), $expected, Str::limit($note, 70)];
    }
}
