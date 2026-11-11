<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\DeliveryChatController;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\DeliveryMessage;
use App\Models\Order;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rollback-only tests for the rider <-> buyer delivery chat.
 *
 * Everything (fixture riders/buyer/job, messages, notifications) runs inside
 * ONE transaction that is ALWAYS rolled back. orders.* is never written.
 *
 *   php artisan rider:test-chat
 */
class RiderTestChat extends Command
{
    protected $signature = 'rider:test-chat';

    protected $description = 'Rollback-only tests: delivery chat access, closed chat, validation, notifications, read';

    private array $rows = [];

    private int $failed = 0;

    public function handle(): int
    {
        $order = Order::whereNotNull('buyer_id')
            ->whereHas('buyer', fn ($q) => $q->where('account_type', 'buyer'))
            ->orderBy('id')->first();
        $courier = User::where('role', 'courier')->orderBy('id')->first()
            ?? User::where('account_type', 'logistics')->orderBy('id')->first();
        if (! $order || ! $courier) {
            $this->error('Need an order with a buyer and a courier account.');
            return self::FAILURE;
        }

        $counts      = $this->counts();
        $orderBefore = Order::whereKey($order->id)->first(['status', 'payment_status', 'updated_at'])->toArray();

        DB::beginTransaction();
        try {
            $this->runTests($order, $courier);
        } catch (\Throwable $e) {
            $this->failed++;
            $this->rows[] = ['EXCEPTION', get_class($e), '-', Str::limit($e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine(), 70)];
        } finally {
            DB::rollBack();
        }

        $after = $this->counts();
        $this->check('rollback: counts unchanged', json_encode($after) === json_encode($counts) ? 'yes' : 'NO', 'yes', json_encode($after));
        $orderAfter = Order::whereKey($order->id)->first(['status', 'payment_status', 'updated_at'])->toArray();
        $this->check('orders row unchanged', $orderAfter === $orderBefore ? 'yes' : 'NO', 'yes', "order #{$order->id}");

        $this->table(['Check', 'Got', 'Expected', 'Note'], $this->rows);
        if ($this->failed > 0) {
            $this->error("{$this->failed} check(s) failed. Database rolled back.");
            return self::FAILURE;
        }
        $this->info('All checks passed. Database unchanged (rolled back).');
        return self::SUCCESS;
    }

    private function runTests(Order $order, User $courier): void
    {
        $chat  = app(DeliveryChatController::class);
        $buyer = User::find($order->buyer_id);

        // Fixtures (rolled back).
        [$rider, $personnel] = $this->makeRider($courier, 'a');
        [$otherRider]        = $this->makeRider($courier, 'b');
        $otherBuyer = $this->makeUser('buyer.other', ['account_type' => 'buyer', 'role' => null]);

        $job = DeliveryJob::create([
            'order_id'      => $order->id,
            'rider_user_id' => $rider->id,
            'personnel_id'  => $personnel->id,
            'courier_id'    => $courier->id,
            'assigned_by'   => $courier->id,
            'status'        => DeliveryJob::STATUS_ASSIGNED,
            'cod_amount'    => 0,
            'assigned_at'   => now(),
        ]);
        $this->check('fixture: job, 2 riders, other buyer', 'ok', 'ok', "job #{$job->id}, order #{$order->id}, buyer #{$buyer->id}");

        // 1. Empty chat, both sides
        $r = $this->hit(fn () => $chat->riderIndex($this->req($rider, 'GET'), $job->id));
        $this->check('rider GET (empty)', $r['status'] . '/' . count($r['body']['data'] ?? []), '200/0', 'can_send=' . json_encode($r['body']['meta']['can_send'] ?? null));
        $r = $this->hit(fn () => $chat->buyerIndex($this->req($buyer, 'GET'), $order->id));
        $this->check('buyer GET (empty)', $r['status'] . '/' . count($r['body']['data'] ?? []), '200/0', 'job #' . ($r['body']['meta']['delivery_job_id'] ?? '?'));

        // 2. Validation
        foreach ([
            'missing body' => [],
            'blank body'   => ['body' => '    '],
            '501 chars'    => ['body' => str_repeat('a', 501)],
        ] as $label => $data) {
            $r = $this->hit(fn () => $chat->riderSend($this->req($rider, 'POST', $data), $job->id));
            $this->check("rider POST {$label}", $r['status'], 422, $r['body']['message'] ?? '');
            $r = $this->hit(fn () => $chat->buyerSend($this->req($buyer, 'POST', $data), $order->id));
            $this->check("buyer POST {$label}", $r['status'], 422, $r['body']['message'] ?? '');
        }
        $r = $this->hit(fn () => $chat->riderSend($this->req($rider, 'POST', ['body' => str_repeat('b', 500)]), $job->id));
        $this->check('rider POST 500 chars (limit)', $r['status'], 201, '');
        DeliveryMessage::whereKey($r['body']['data']['id'] ?? 0)->delete();

        // 3. Rider sends -> buyer notification
        $buyerNotes = $this->buyerNotes($buyer->id);
        $r = $this->hit(fn () => $chat->riderSend($this->req($rider, 'POST', ['body' => '  On my way po.  ']), $job->id));
        $m1 = $r['body']['data']['id'] ?? 0;
        $this->check('rider POST message', $r['status'], 201, json_encode(['body' => $r['body']['data']['body'] ?? null, 'mine' => $r['body']['data']['mine'] ?? null]));
        $row = DeliveryMessage::find($m1);
        $this->check('saved: sender_role/sender_id', ($row?->sender_role ?? '-') . '/' . ($row?->sender_id ?? '-'), "rider/{$rider->id}", 'body trimmed: ' . json_encode($row?->body));
        $this->check('buyer notification created', $this->buyerNotes($buyer->id) - $buyerNotes, 1, 'type delivery_chat');
        $note = DB::table('buyer_notifications')->where('buyer_id', $buyer->id)->where('type', 'delivery_chat')->latest('id')->first();
        $this->check('buyer notification data', json_decode($note->data ?? '{}', true)['delivery_job_id'] ?? null, $job->id, $note->title ?? '');

        // 4. Buyer reads it
        $r = $this->hit(fn () => $chat->buyerIndex($this->req($buyer, 'GET'), $order->id));
        $first = $r['body']['data'][0] ?? [];
        $this->check('buyer GET sees rider message', ($r['status'] ?? 0) . '/' . count($r['body']['data'] ?? []) . '/' . json_encode($first['mine'] ?? null), '200/1/false', $first['body'] ?? '');
        $r = $this->hit(fn () => $chat->buyerIndex($this->req($buyer, 'GET', ['after_id' => $m1]), $order->id));
        $this->check('buyer GET ?after_id=last (nothing new)', count($r['body']['data'] ?? []), 0, '');

        // 5. Buyer replies -> rider notification
        $riderNotes = DB::table('rider_notifications')->where('rider_user_id', $rider->id)->where('type', 'delivery_chat')->count();
        $r = $this->hit(fn () => $chat->buyerSend($this->req($buyer, 'POST', ['body' => 'Thank you! I am home.']), $order->id));
        $m2 = $r['body']['data']['id'] ?? 0;
        $this->check('buyer POST message', $r['status'], 201, $r['body']['data']['body'] ?? '');
        $this->check('rider notification created', DB::table('rider_notifications')->where('rider_user_id', $rider->id)->where('type', 'delivery_chat')->count() - $riderNotes, 1, 'delivery_job_id ' . DB::table('rider_notifications')->where('rider_user_id', $rider->id)->latest('id')->value('delivery_job_id'));
        $r = $this->hit(fn () => $chat->riderIndex($this->req($rider, 'GET', ['after_id' => $m1]), $job->id));
        $this->check('rider GET ?after_id=m1 (1 new)', count($r['body']['data'] ?? []) . '/' . ($r['body']['data'][0]['id'] ?? '-'), "1/{$m2}", '');

        // 6. Read receipts (only the other side's messages)
        $r = $this->hit(fn () => $chat->buyerRead($this->req($buyer, 'POST'), $order->id));
        $this->check('buyer read: marked', $r['body']['data']['marked'] ?? null, 1, '');
        $this->check('rider msg read / buyer msg unread', json_encode([DeliveryMessage::find($m1)->read_at !== null, DeliveryMessage::find($m2)->read_at !== null]), '[true,false]', '');
        $r = $this->hit(fn () => $chat->riderRead($this->req($rider, 'POST'), $job->id));
        $this->check('rider read: marked', $r['body']['data']['marked'] ?? null, 1, '');
        $r = $this->hit(fn () => $chat->riderRead($this->req($rider, 'POST'), $job->id));
        $this->check('rider read again: marked', $r['body']['data']['marked'] ?? null, 0, 'idempotent');

        // 7. Access
        foreach ([
            'other rider GET'          => fn () => $chat->riderIndex($this->req($otherRider, 'GET'), $job->id),
            'other rider POST'         => fn () => $chat->riderSend($this->req($otherRider, 'POST', ['body' => 'x']), $job->id),
            'other rider read'         => fn () => $chat->riderRead($this->req($otherRider, 'POST'), $job->id),
            'other buyer GET'          => fn () => $chat->buyerIndex($this->req($otherBuyer, 'GET'), $order->id),
            'other buyer POST'         => fn () => $chat->buyerSend($this->req($otherBuyer, 'POST', ['body' => 'x']), $order->id),
            'other buyer read'         => fn () => $chat->buyerRead($this->req($otherBuyer, 'POST'), $order->id),
            'rider on buyer endpoint'  => fn () => $chat->buyerIndex($this->req($rider, 'GET'), $order->id),
            'buyer on rider endpoint'  => fn () => $chat->riderIndex($this->req($buyer, 'GET'), $job->id),
        ] as $label => $fn) {
            $r = $this->hit($fn);
            $this->check($label, $r['status'], 403, $r['body']['message'] ?? '');
        }
        $missing = (int) DeliveryJob::max('id') + 1000;
        $r = $this->hit(fn () => $chat->riderIndex($this->req($rider, 'GET'), $missing));
        $this->check('rider GET unknown job', $r['status'], 404, $r['body']['message'] ?? '');
        $r = $this->hit(fn () => $chat->buyerIndex($this->req($buyer, 'GET'), (int) Order::max('id') + 1000));
        $this->check('buyer GET unknown order', $r['status'], 404, $r['body']['message'] ?? '');
        $personnel->update(['status' => 'inactive']);
        $r = $this->hit(fn () => $chat->riderIndex($this->req($rider, 'GET'), $job->id));
        $this->check('rider with inactive personnel', $r['status'], 403, $r['body']['message'] ?? '');
        $personnel->update(['status' => 'active']);

        // 8. Open / closed by job status
        $job->update(['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY]);
        $r = $this->hit(fn () => $chat->riderSend($this->req($rider, 'POST', ['body' => 'Arrived at the gate.']), $job->id));
        $this->check('out_for_delivery: rider POST', $r['status'], 201, '');

        foreach ([DeliveryJob::STATUS_DELIVERED, DeliveryJob::STATUS_FAILED, DeliveryJob::STATUS_RETURN_TO_SENDER] as $closed) {
            $job->update(['status' => $closed]);
            $before = DeliveryMessage::where('delivery_job_id', $job->id)->count();
            $r = $this->hit(fn () => $chat->riderSend($this->req($rider, 'POST', ['body' => 'late']), $job->id));
            $b = $this->hit(fn () => $chat->buyerSend($this->req($buyer, 'POST', ['body' => 'late']), $order->id));
            $this->check("{$closed}: rider/buyer POST", "{$r['status']}/{$b['status']}", '422/422', $r['body']['message'] ?? '');
            $g = $this->hit(fn () => $chat->buyerIndex($this->req($buyer, 'GET'), $order->id));
            $this->check("{$closed}: GET read-only", $g['status'] . '/' . json_encode($g['body']['meta']['can_send'] ?? null) . '/' . count($g['body']['data'] ?? []),
                "200/false/{$before}", 'no new message saved: ' . (DeliveryMessage::where('delivery_job_id', $job->id)->count() === $before ? 'yes' : 'NO'));
        }
    }

    private function makeRider(User $courier, string $tag): array
    {
        $user = $this->makeUser("rider.{$tag}", [
            'account_type' => 'logistics', 'role' => 'rider',
            'status' => 'approved', 'verification_status' => 'verified',
        ]);
        $personnel = CourierPersonnel::create([
            'courier_id' => $courier->id, 'user_id' => $user->id,
            'name' => "Chat Test Rider {$tag}", 'role' => 'rider', 'status' => 'active',
        ]);
        return [$user, $personnel];
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
        ], $attrs))->save();
        return $user;
    }

    /** Runs a controller call; ValidationException becomes a 422 row. */
    private function hit(\Closure $fn): array
    {
        try {
            /** @var JsonResponse $res */
            $res = $fn();
            return ['status' => $res->getStatusCode(), 'body' => $res->getData(true)];
        } catch (ValidationException $e) {
            return ['status' => 422, 'body' => ['message' => $e->getMessage(), 'errors' => $e->errors()]];
        }
    }

    private function req(User $user, string $method, array $data = []): Request
    {
        $r = Request::create('/check', $method, $data);
        $r->setUserResolver(fn () => $user);
        return $r;
    }

    private function buyerNotes(int $buyerId): int
    {
        return DB::table('buyer_notifications')->where('buyer_id', $buyerId)->where('type', 'delivery_chat')->count();
    }

    private function counts(): array
    {
        return [
            'delivery_messages'   => DB::table('delivery_messages')->count(),
            'delivery_jobs'       => DB::table('delivery_jobs')->count(),
            'buyer_notifications' => DB::table('buyer_notifications')->count(),
            'rider_notifications' => DB::table('rider_notifications')->count(),
            'users'               => DB::table('users')->count(),
            'courier_personnel'   => DB::table('courier_personnel')->count(),
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
