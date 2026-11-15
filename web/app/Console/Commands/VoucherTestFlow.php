<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Services\VoucherService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Rollback-only end-to-end voucher test through the real routes:
 *   admin creates a voucher (local Philippine time) -> stored in UTC ->
 *   buyer homepage + mobile list show it -> claim (no use counted) ->
 *   My Vouchers -> checkout applies it (discount, usage_count +1) ->
 *   limit / reuse / expiry / disable / delete rules -> cancel gives it back.
 *
 *   php artisan voucher:test-flow
 */
class VoucherTestFlow extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'voucher:test-flow';

    protected $description = 'Rollback-only: admin voucher -> homepage/mobile -> claim -> wallet -> checkout -> limits -> cancel';

    public function handle(): int
    {
        $p = Product::where('status', 'active')->where('stock', '>=', 20)
            ->where(fn ($q) => $q->whereNull('has_variants')->orWhere('has_variants', false))
            ->orderBy('id')->first();
        if (! $p) {
            $this->error('Need an active product without variants and with stock >= 20.');
            return self::FAILURE;
        }

        return $this->runRolledBack(fn () => $this->runTests($p), ['vouchers', 'voucher_usages', 'orders', 'order_items', 'carts', 'cart_items']);
    }

    /** Admin request with the admin session flag (same as admin:test-account). */
    private function admin(string $method, string $uri, array $data = []): array
    {
        $req = Request::create($uri, $method, $data, [], [], ['HTTP_ACCEPT' => 'application/json', 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest', 'HTTP_X_INERTIA' => 'true']);
        $session = app('session')->driver();
        $session->start();
        $session->put('admin_verified', true);
        $req->setLaravelSession($session);
        $res = app()->handle($req);
        $errors = $session->get('errors');
        $session->forget(['admin_verified', 'errors']);

        if (is_object($errors) && method_exists($errors, 'getBag')) {
            $errors = $errors->getBag('default')->toArray();
        }

        return ['status' => $res->getStatusCode(), 'errors' => is_array($errors) ? $errors : []];
    }

    private function local(string $modify): string
    {
        return now(VoucherService::tz())->modify($modify)->format('Y-m-d\TH:i');
    }

    private function buyPayload(array $extra = []): array
    {
        return [
            'payment_method' => 'cod', 'shipping_name' => 'Voucher Tester',
            'shipping_address' => 'Purok 1, Brgy. Test, Santa Cruz, Laguna', 'shipping_phone' => '09171234567',
            'idempotency_key' => Str::random(20),
        ] + $extra;
    }

    private function runTests(Product $p): void
    {
        $verified = ['email_verified_at' => now(), 'status' => 'approved', 'account_type' => 'buyer'];
        $buyer = $this->makeUser('vbuyer', $verified);
        $other = $this->makeUser('vother', $verified);
        $code  = 'TEST' . strtoupper(Str::random(6));

        // 1. Admin creates a voucher that started 5 minutes ago (Philippine time), lowercase code.
        $r = $this->admin('POST', '/admin/vouchers', [
            'code' => strtolower($code), 'name' => 'Flow Test 10% Off', 'type' => 'percentage', 'value' => 10,
            'min_purchase' => 100, 'max_discount' => 50, 'usage_limit' => 2, 'usage_per_user' => 1,
            'valid_from' => $this->local('-5 minutes'), 'valid_until' => $this->local('+1 day'),
        ]);
        $v = Voucher::where('code', $code)->first();
        $this->check('admin create (code upper-cased)', ($r['status'] < 400 && $v) ? 'ok' : 'FAIL', 'ok', json_encode($r['errors']));
        if (! $v) {
            return;
        }
        $this->check('stored in UTC (local -8h)', $v->valid_from->diffInMinutes(now(), false) >= 4 && $v->valid_from->diffInMinutes(now(), false) <= 6 ? 'yes' : 'no', 'yes', (string) $v->valid_from);

        // 2. Admin form validation
        // Returns the error bag when the voucher was NOT created (else ['CREATED' => true]).
        $bad = function (array $over) {
            $data = array_merge([
                'code' => 'BAD' . strtoupper(Str::random(5)), 'name' => 'Bad', 'type' => 'percentage', 'value' => 10, 'min_purchase' => 0,
                'usage_per_user' => 1, 'valid_from' => $this->local('-1 hour'), 'valid_until' => $this->local('+1 day'),
            ], $over);
            $before = Voucher::count();
            $r = $this->admin('POST', '/admin/vouchers', $data);
            return Voucher::count() > $before ? ['CREATED' => true] : ($r['errors'] + ['_rejected' => true]);
        };
        $this->check('validation: % over 100', isset($bad(['value' => 150])['_rejected']) ? 'rejected' : 'ACCEPTED', 'rejected');
        $this->check('validation: end before start', isset($bad(['valid_until' => $this->local('-2 hours')])['_rejected']) ? 'rejected' : 'ACCEPTED', 'rejected');
        $this->check('validation: zero discount', isset($bad(['type' => 'fixed', 'value' => 0])['_rejected']) ? 'rejected' : 'ACCEPTED', 'rejected');
        $this->check('validation: duplicate code', isset($bad(['code' => strtolower($code)])['_rejected']) ? 'rejected' : 'ACCEPTED', 'rejected');

        // 3. Buyer sees it: homepage props (web) and /buyer/vouchers (same as mobile)
        $home = $this->http($buyer, 'GET', '/homepage', [], true);
        $row = collect($home['body']['props']['vouchers'] ?? [])->firstWhere('code', $code);
        $this->check('homepage shows the voucher', $row ? 'yes' : 'no', 'yes');
        $this->check('homepage card fields', $row ? "{$row['type']}/{$row['value']}/{$row['min_purchase']}/" . (empty($row['valid_until_formatted']) ? '-' : 'date') . '/' . json_encode($row['is_claimed']) : '-', 'percentage/10/100/date/false');
        $mob = $this->hit(fn () => app(\App\Http\Controllers\Api\BuyerVoucherController::class)->index($this->req($buyer, [], 'GET')));
        $this->check('mobile list shows it', collect($mob['body']['data'] ?? [])->contains('code', $code) ? 'yes' : 'no', 'yes');

        // 4. Claim (web homepage endpoint) -> no use counted, Claimed, in wallet
        $r = $this->http($buyer, 'POST', '/api/vouchers/claim', ['voucher_id' => $v->id]);
        $this->check('claim (web)', $r['status'] . '/' . json_encode($r['body']['success'] ?? null), '200/true');
        $this->check('claim does not count as a use', (int) $v->fresh()->usage_count, 0);
        $r = $this->http($buyer, 'POST', '/api/vouchers/claim', ['voucher_id' => $v->id]);
        $this->check('claim again is idempotent', $r['status'] . '/' . VoucherUsage::where('voucher_id', $v->id)->where('user_id', $buyer->id)->count(), '200/1');
        $row = collect($this->http($buyer, 'GET', '/api/vouchers/available')['body']['vouchers'] ?? [])->firstWhere('code', $code);
        $this->check('shows Claimed', json_encode($row['is_claimed'] ?? null), 'true');
        $mine = $this->http($buyer, 'GET', '/buyer/vouchers/mine');
        $this->check('in My Vouchers', collect($mine['body']['data'] ?? [])->contains('code', $code) ? 'yes' : 'no', 'yes');

        // 5. Checkout: validate (Apply) then place the order with the code
        $price = (float) ($p->sale_price ?: $p->price);
        $qty = (int) max(1, ceil(150 / max($price, 1)));
        $this->http($buyer, 'POST', '/api/cart/items', ['product_id' => $p->id, 'quantity' => $qty]);
        $subtotal = round($price * $qty, 2);
        $expected = min(round($subtotal * 0.10, 2), 50.0);
        $r = $this->http($buyer, 'POST', '/api/vouchers/validate', ['code' => strtolower($code), 'order_total' => $subtotal]);
        $this->check('apply at checkout', $r['status'] . '/' . ($r['body']['voucher']['discount_amount'] ?? '-'), '200/' . $expected);
        $r = $this->http($other, 'POST', '/api/vouchers/validate', ['code' => $code, 'order_total' => $subtotal]);
        $this->check('apply without claiming -> refused', $r['status'], 400, $r['body']['message'] ?? '');
        $r = $this->http($buyer, 'POST', '/api/vouchers/validate', ['code' => $code, 'order_total' => 50]);
        $this->check('below min spend -> refused', $r['status'], 400, $r['body']['message'] ?? '');

        $r = $this->http($buyer, 'POST', '/api/orders', $this->buyPayload(['voucher_code' => $code]));
        $order = Order::find($r['body']['order_id'] ?? $r['body']['order']['id'] ?? 0);
        $this->check('order placed with voucher', ($r['status'] < 300 && $order) ? 'yes' : 'NO', 'yes', Str::limit($r['raw'], 120));
        if ($order) {
            $this->check('order total discounted', number_format((float) $order->total, 2, '.', ''), number_format($subtotal - $expected, 2, '.', ''));
        }
        $this->check('usage_count = 1 after order', (int) $v->fresh()->usage_count, 1);
        $this->check('claim marked used', VoucherUsage::where('voucher_id', $v->id)->where('user_id', $buyer->id)->whereNotNull('used_at')->count(), 1);

        // 6. No reuse (per user 1): claim again and apply are refused
        $r = $this->http($buyer, 'POST', '/api/vouchers/claim', ['voucher_id' => $v->id]);
        $this->check('re-claim after use -> refused', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->http($buyer, 'POST', '/api/vouchers/validate', ['code' => $code, 'order_total' => $subtotal]);
        $this->check('re-apply after use -> refused', $r['status'], 400, $r['body']['message'] ?? '');

        // 7. Global limit (2): other buyer claims + uses -> limit reached -> hidden, claims refused
        $third = $this->makeUser('vthird', $verified);
        $this->http($third, 'POST', '/api/vouchers/claim', ['voucher_id' => $v->id]); // claimed before the last use
        $this->http($other, 'POST', '/api/vouchers/claim', ['voucher_id' => $v->id]);
        $this->http($other, 'POST', '/api/cart/items', ['product_id' => $p->id, 'quantity' => $qty]);
        $r = $this->http($other, 'POST', '/api/orders', $this->buyPayload(['voucher_code' => $code]));
        $this->check('second buyer uses it', $r['status'] < 300 ? 'yes' : 'NO', 'yes', Str::limit($r['raw'], 100));
        $this->check('usage_count = 2 (limit reached)', (int) $v->fresh()->usage_count, 2);
        $this->http($third, 'POST', '/api/cart/items', ['product_id' => $p->id, 'quantity' => $qty]);
        $r = $this->http($third, 'POST', '/api/orders', $this->buyPayload(['voucher_code' => $code]));
        $this->check('third buyer (claimed earlier) -> refused at checkout', $r['status'], 400, $r['body']['error'] ?? '');
        $this->check('hidden from homepage once used up', VoucherService::available($third)->contains('code', $code) ? 'shown' : 'hidden', 'hidden');

        // 8. Cancel gives the use back
        if ($order) {
            $r = $this->http($buyer, 'POST', "/api/orders/{$order->id}/cancel");
            $this->check('cancel order', $r['status'] < 300 ? 'ok' : 'FAIL', 'ok', Str::limit($r['raw'], 100));
            $this->check('usage_count back to 1', (int) $v->fresh()->usage_count, 1);
            $this->check('voucher back in wallet (unused)', VoucherUsage::where('voucher_id', $v->id)->where('user_id', $buyer->id)->whereNull('used_at')->count(), 1);
        }

        // 9. Admin disable / expiry / delete reflect immediately
        $this->admin('PATCH', "/admin/vouchers/{$v->id}/toggle");
        $this->check('disabled -> hidden', VoucherService::available($buyer)->contains('code', $code) ? 'shown' : 'hidden', 'hidden');
        $r = $this->http($buyer, 'POST', '/api/vouchers/validate', ['code' => $code, 'order_total' => $subtotal]);
        $this->check('disabled -> cannot apply', $r['status'], 400);
        $this->admin('PATCH', "/admin/vouchers/{$v->id}/toggle");
        $v->forceFill(['valid_until' => now()->subMinute()])->save();
        $this->check('expired -> hidden', VoucherService::available($buyer)->contains('code', $code) ? 'shown' : 'hidden', 'hidden');
        $r = $this->http($buyer, 'POST', '/api/vouchers/claim', ['voucher_id' => $v->id]);
        $this->check('expired -> claim refused', $r['status'], 422);
        $r = $this->admin('DELETE', "/admin/vouchers/{$v->id}");
        $this->check('delete used voucher -> blocked', Voucher::find($v->id) ? 'blocked' : 'DELETED', 'blocked', json_encode($r['errors']));

        // 10. Admin edit form gets datetime-local values
        $r = $this->http(null, 'GET', '/__noop__'); // reset guards
        $idx = app(\App\Http\Controllers\Admin\VoucherController::class)->index()->toResponse(Request::create('/admin/vouchers', 'GET', [], [], [], ['HTTP_X_INERTIA' => 'true']));
        $props = json_decode((string) $idx->getContent(), true)['props']['vouchers'] ?? [];
        $vr = collect($props)->firstWhere('code', $code);
        $this->check('edit prefill is datetime-local', preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', (string) ($vr['valid_from_input'] ?? '')) ? 'yes' : 'no', 'yes', (string) ($vr['valid_from_input'] ?? ''));
    }
}
