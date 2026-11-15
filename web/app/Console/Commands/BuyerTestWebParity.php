<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Http\Controllers\Api\DeliveryChatController;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Review;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Rollback-only tests for the 2026-11-15 additions:
 *  - /orders/data no longer swallowed by /orders/{id}
 *  - web buyer <-> rider chat (session routes) + rider sees/replies, inbox list, unread
 *  - order page rider prop (null until assigned), Track Order rider prop
 *  - order received + address book + voucher wallet (web) + reviews/mine + refunds (app)
 *  - seller Customers page (real rows) + review feed summary, courier dashboard recent list
 *
 *   php artisan buyer:test-web-parity
 */
class BuyerTestWebParity extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'buyer:test-web-parity';

    protected $description = 'Rollback-only: web rider chat, inbox, order received, addresses, vouchers, reviews/mine, refunds, seller customers/feedback, courier dashboard';

    public function handle(): int
    {
        $courier = User::where('role', 'courier')->orderBy('id')->first();
        if (! $courier || ! $this->anyProduct()) {
            $this->error('Need a courier account and at least one product.');
            return self::FAILURE;
        }

        return $this->runRolledBack(fn () => $this->runTests($courier), [
            'orders', 'order_items', 'delivery_jobs', 'delivery_messages', 'buyer_addresses', 'reviews', 'buyer_notifications', 'rider_notifications',
        ]);
    }

    private function runTests(User $courier): void
    {
        $verified = ['email_verified_at' => now(), 'status' => 'approved'];
        $buyer  = $this->makeUser('buyer', ['account_type' => 'buyer'] + $verified);
        $other  = $this->makeUser('other', ['account_type' => 'buyer'] + $verified);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'business_name' => 'Parity Test Shop'] + $verified);
        $p      = $this->anyProduct();
        // The fixture product must belong to the fixture seller (review purchase rule).
        // Rolled back with everything else.
        $p->forceFill(['seller_id' => $seller->id])->saveQuietly();

        // 1. /orders/data (was TypeError show('data'))
        $r = $this->http($buyer, 'GET', '/orders/data');
        $this->check('/orders/data', $r['status'] . '/' . (isset($r['body']['orders']) ? 'orders' : '-'), '200/orders');

        // 2. Order page: no rider yet
        [$order] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        $r = $this->http($buyer, 'GET', "/orders/{$order->id}", [], true);
        $props = $r['body']['props']['order'] ?? [];
        $this->check('order page: rider null before assignment', $r['status'] . '/' . (array_key_exists('rider', $props) ? json_encode($props['rider']) : 'missing'), '200/null');
        $this->check('order page: can_receive (shipped)', json_encode($props['can_receive'] ?? null), 'true');

        $r = $this->http($buyer, 'GET', "/buyer/orders/{$order->id}/rider-chat");
        $this->check('rider chat before assignment', $r['status'] . '/' . ($r['body']['reason'] ?? ''), '404/no_delivery');

        // 3. Assign a rider (fixture job)
        $rider = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified'] + $verified);
        $personnel = CourierPersonnel::create(['courier_id' => $courier->id, 'user_id' => $rider->id, 'name' => 'Parity Rider', 'role' => 'rider', 'status' => 'active']);
        $job = DeliveryJob::create([
            'order_id' => $order->id, 'rider_user_id' => $rider->id, 'personnel_id' => $personnel->id, 'courier_id' => $courier->id,
            'assigned_by' => $courier->id, 'status' => DeliveryJob::STATUS_ASSIGNED, 'cod_amount' => 0, 'assigned_at' => now(),
        ]);

        $r = $this->http($buyer, 'GET', "/orders/{$order->id}", [], true);
        $rp = $r['body']['props']['order']['rider'] ?? null;
        $this->check('order page: rider after assignment', ($rp['name'] ?? '-') . '/' . json_encode($rp['can_chat'] ?? null), 'Flow/true');
        $r = $this->http($buyer, 'GET', "/orders/{$order->id}/tracking", [], true);
        $this->check('track page: rider prop', $r['body']['props']['rider']['name'] ?? '-', 'Flow');

        // 4. Web chat both ways
        $r = $this->http($buyer, 'GET', "/buyer/orders/{$order->id}/rider-chat");
        $this->check('buyer GET chat (empty, can_send)', $r['status'] . '/' . count($r['body']['data'] ?? []) . '/' . json_encode($r['body']['meta']['can_send'] ?? null), '200/0/true');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$order->id}/rider-chat", ['body' => 'Please leave it at the gate']);
        $this->check('buyer POST chat', $r['status'] . '/' . json_encode($r['body']['data']['mine'] ?? null), '201/true');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$order->id}/rider-chat", ['body' => '   ']);
        $this->check('buyer POST blank -> 422', $r['status'], 422);
        $r = $this->http($other, 'GET', "/buyer/orders/{$order->id}/rider-chat");
        $this->check('other buyer -> 403', $r['status'], 403);
        $r = $this->http($seller, 'GET', '/buyer/rider-chats');
        $this->check('seller on buyer rider-chats -> 403', $r['status'], 403);

        $chat = app(DeliveryChatController::class);
        $seen = $this->hit(fn () => $chat->riderIndex($this->req($rider, [], 'GET'), $job->id));
        $this->check('rider sees buyer message', $seen['status'] . '/' . ($seen['body']['data'][0]['body'] ?? '-'), '200/Please leave it at the gate');
        $reply = $this->hit(fn () => $chat->riderSend($this->req($rider, ['body' => 'Noted, on my way']), $job->id));
        $this->check('rider replies', $reply['status'], 201);

        $r = $this->http($buyer, 'GET', '/buyer/rider-chats');
        $row = collect($r['body']['data'] ?? [])->firstWhere('order_id', $order->id);
        $this->check('inbox: thread listed, unread 1', $r['status'] . '/' . ($row['unread_count'] ?? '-') . '/' . ($row['last_message'] ?? '-'), '200/1/Noted, on my way');
        $this->http($buyer, 'POST', "/buyer/orders/{$order->id}/rider-chat/read");
        $r = $this->http($buyer, 'GET', '/buyer/rider-chats');
        $row = collect($r['body']['data'] ?? [])->firstWhere('order_id', $order->id);
        $this->check('inbox: unread 0 after read', $row['unread_count'] ?? '-', 0);
        $this->check('messages saved', DB::table('delivery_messages')->where('delivery_job_id', $job->id)->count(), 2);

        // 5. Order received (shipped -> completed); pending order refused
        $r = $this->http($buyer, 'POST', "/api/orders/{$order->id}/receive");
        $this->check('order received', $r['status'] . '/' . $order->fresh()->status, '200/completed');
        [$pending] = $this->makeOrder($buyer, $seller, $p, 'pending');
        $r = $this->http($buyer, 'POST', "/api/orders/{$pending->id}/receive");
        $this->check('receive pending -> 422', $r['status'], 422);
        $r = $this->http($other, 'POST', "/api/orders/{$order->id}/receive");
        $this->check('receive other buyer -> 404', $r['status'], 404);

        // 6. Address book (web)
        $r = $this->http($buyer, 'GET', '/addresses', [], true);
        $this->check('/addresses page', $r['status'] . '/' . ($r['body']['component'] ?? '-'), '200/BuyerAddresses');
        $r = $this->http($buyer, 'POST', '/buyer/addresses', [
            'label' => 'Home', 'recipient_name' => 'Parity Buyer', 'phone' => '09171234567', 'region' => 'Region IV-A (CALABARZON)',
            'province' => 'Laguna', 'municipality_city' => 'Santa Cruz', 'barangay' => 'Poblacion I', 'street_address' => '1 Test St',
        ]);
        $this->check('address create', $r['status'], 201);
        $r = $this->http($buyer, 'GET', '/buyer/addresses');
        $list = $r['body']['data'] ?? [];
        $this->check('address list: 1 default', count($list) . '/' . json_encode($list[0]['is_default'] ?? null), '1/true');
        $r = $this->http($buyer, 'POST', '/buyer/addresses', ['label' => 'Home']);
        $this->check('address validation -> 422', $r['status'], 422);

        // 7. Voucher wallet (web)
        $r = $this->http($buyer, 'GET', '/vouchers', [], true);
        $this->check('/vouchers page', $r['status'] . '/' . ($r['body']['component'] ?? '-'), '200/BuyerVouchers');
        $this->check('/buyer/vouchers', $this->http($buyer, 'GET', '/buyer/vouchers')['status'], 200);
        $this->check('/buyer/vouchers/mine', $this->http($buyer, 'GET', '/buyer/vouchers/mine')['status'], 200);
        $r = $this->http($buyer, 'POST', '/buyer/vouchers/claim', ['code' => 'NO-SUCH-CODE-XYZ']);
        $this->check('claim unknown code -> 404', $r['status'], 404);

        // 8. Review purchase rule (backend, shared by web + app routes)
        $item = $order->items()->first();
        [$notDone, $notDoneItem] = $this->makeOrder($buyer, $seller, $p, 'shipped');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$notDone->id}/items/{$notDoneItem->id}/review", ['rating' => 5]);
        $this->check('review: shipped (not delivered) order -> 422', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->http($other, 'POST', "/buyer/orders/{$order->id}/items/{$item->id}/review", ['rating' => 5]);
        $this->check("review: someone else's order -> 404", $r['status'], 404, $r['body']['message'] ?? '');
        $otherSeller = $this->makeUser('seller2', ['account_type' => 'seller'] + $verified);
        [$wrongOrder, $wrongItem] = $this->makeOrder($buyer, $otherSeller, $p, 'completed');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$wrongOrder->id}/items/{$wrongItem->id}/review", ['rating' => 5]);
        $this->check('review: product not sold by that seller -> 422', $r['status'], 422, $r['body']['message'] ?? '');
        $flags = $this->http($buyer, 'GET', "/orders/{$wrongOrder->id}", [], true)['body']['props']['order']['items'][0] ?? [];
        $this->check('web flag: can_review false for that item', json_encode($flags['can_review'] ?? null), 'false');
        $app = $this->hit(fn () => app(\App\Http\Controllers\Api\BuyerOrderController::class)->show($this->req($buyer, [], 'GET'), $wrongOrder->id));
        $this->check('app flag: can_review false for that item', json_encode($app['body']['data']['items'][0]['can_review'] ?? null), 'false');
        $r = $this->http($buyer, 'GET', "/orders/{$notDone->id}/tracking", [], true);
        $this->check('track page: no review entry before delivery', (array_key_exists('review', $r['body']['props'] ?? []) ? json_encode($r['body']['props']['review']) : 'missing'), 'null');
        $r = $this->http($buyer, 'GET', "/orders/{$order->id}/tracking", [], true);
        $this->check('track page: Write a Review on delivered order', json_encode($r['body']['props']['review']['can_write'] ?? null), 'true');

        // 9. Review on the completed item -> my reviews (web + app shape), seller feedback
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$order->id}/items/{$item->id}/review", ['rating' => 4, 'comment' => 'Fast delivery']);
        $this->check('review create', $r['status'], 201);
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$order->id}/items/{$item->id}/review", ['rating' => 5]);
        $this->check('second review same item -> 422', $r['status'], 422);
        $mine = $this->hit(fn () => app(\App\Http\Controllers\Buyer\MyReviewsController::class)->mine($this->req($buyer, [], 'GET')));
        $this->check('reviews/mine (app)', $mine['status'] . '/' . count($mine['body']['data'] ?? []) . '/' . ($mine['body']['data'][0]['rating'] ?? '-'), '200/1/4');

        $r = $this->http($seller, 'GET', '/seller/reviews/feed?filter=all');
        $this->check('seller feed: review + summary', $r['status'] . '/' . ($r['body']['meta']['total'] ?? '-') . '/' . ($r['body']['summary']['rating_avg'] ?? '-') . '/' . ($r['body']['summary']['unreplied'] ?? '-'), '200/1/4/1');
        $r = $this->http($seller, 'GET', '/seller/customers?tab=feedback', [], true);
        $cust = collect($r['body']['props']['customers'] ?? [])->firstWhere('id', $buyer->id);
        $this->check('seller customers: buyer listed', $r['status'] . '/' . ($cust ? $cust['orders'] : '-') . '/' . ($r['body']['props']['initialTab'] ?? '-'), '200/3/feedback'); // completed + pending + shipped (cancelled excluded)

        // 9. Refunds (app route uses the same controller) + product page rating
        $ref = $this->hit(fn () => app(\App\Http\Controllers\Buyer\RefundStatusController::class)->index($this->req($buyer, [], 'GET')));
        $this->check('refunds (buyer)', $ref['status'], 200);
        $r = $this->http($buyer, 'GET', "/product/{$p->id}", [], true);
        $this->check('product page: seller_rating prop', $r['status'] . '/' . (isset($r['body']['props']['product']['seller_rating']) ? 'yes' : 'no'), '200/yes');

        // 10. Courier dashboard: recent deliveries
        $r = $this->http($courier, 'GET', '/courier/dashboard', [], true);
        $recent = collect($r['body']['props']['recent'] ?? []);
        $this->check('courier dashboard: recent includes job', $r['status'] . '/' . ($recent->firstWhere('id', $job->id) ? 'yes' : 'no'), '200/yes');

        // 11. Messages pages per role render
        $this->check('buyer /messages?tab=riders', $this->http($buyer, 'GET', "/messages?tab=riders&order={$order->id}", [], true)['body']['props']['initialTab'] ?? '-', 'riders');
        $this->check('seller /seller/messages', $this->http($seller, 'GET', '/seller/messages', [], true)['status'], 200);
        $this->check('courier /courier/messages', $this->http($courier, 'GET', '/courier/messages', [], true)['status'], 200);

        $this->check('review rows for item', Review::where('order_item_id', $item->id)->count(), 1);
    }
}
