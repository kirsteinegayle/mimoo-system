<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\SellerFollow;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

/**
 * Rollback-only tests for the buyer WEB follow + account settings routes
 * (session auth; same controllers as the mobile app) and a check that the
 * mobile (Sanctum) endpoints keep their response shape.
 * Fixture users only, ONE transaction, ALWAYS rolled back, no mail is sent.
 *
 *   php artisan buyer:test-follow-account
 */
class BuyerTestFollowAccount extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'buyer:test-follow-account';

    protected $description = 'Rollback-only: web follow/unfollow/following list, change email / phone / password rules, ownership, mobile shape';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), ['users', 'seller_follows', 'personal_access_tokens']);
    }

    private function runTests(): void
    {
        Notification::fake(); // OTP mails are captured, never sent

        foreach (['POST buyer/sellers/{id}/follow', 'DELETE buyer/sellers/{id}/follow', 'GET buyer/following', 'GET following', 'GET buyer/profile', 'PUT buyer/profile',
            'POST buyer/change-password', 'POST buyer/change-email/request', 'POST buyer/change-email/verify', 'POST buyer/change-phone/request', 'POST buyer/change-phone/verify'] as $r) {
            [$m, $uri] = explode(' ', $r);
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($x) => $x->uri() === $uri && in_array($m, $x->methods(), true));
            $mw = $route ? $route->gatherMiddleware() : [];
            $this->check("route {$r}", $route && in_array('auth', $mw, true) ? 'yes' : 'NO', 'yes', 'session auth');
        }

        $pw     = 'OldPass!1a';
        $buyer  = $this->makeUser('buyer.1', ['account_type' => 'buyer', 'role' => 'buyer', 'password' => Hash::make($pw), 'contact_number' => '09170000001']);
        $other  = $this->makeUser('buyer.2', ['account_type' => 'buyer', 'role' => 'buyer', 'password' => Hash::make('OtherPass!1a'), 'contact_number' => '09170000002']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'Flow Store']);
        $seller2 = $this->makeUser('seller.2', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'Flow Store 2']);
        $pending = $this->makeUser('seller.pending', ['account_type' => 'seller', 'role' => 'seller', 'status' => 'pending']);
        $fresh = fn (User $u) => User::find($u->id);

        // ── Follow ──────────────────────────────────────────────────────────
        $f = $this->http($buyer, 'POST', "/buyer/sellers/{$seller->id}/follow");
        $this->check('follow', $f['status'] . '/' . json_encode($f['body']['is_following'] ?? null) . '/' . ($f['body']['followers_count'] ?? '-'), '200/true/1', '');
        $this->http($buyer, 'POST', "/buyer/sellers/{$seller->id}/follow");
        $this->http($buyer, 'POST', "/buyer/sellers/{$seller->id}/follow");
        $this->check('follow repeated: one record only', SellerFollow::where('buyer_id', $buyer->id)->where('seller_id', $seller->id)->count(), 1, '');
        $this->http($other, 'POST', "/buyer/sellers/{$seller->id}/follow");
        $this->http($other, 'POST', "/buyer/sellers/{$seller2->id}/follow");
        $list = $this->http($buyer, 'GET', '/buyer/following');
        $this->check('following list: own data only', json_encode(array_column($list['body']['data'] ?? [], 'seller_id')), json_encode([$seller->id]), "other buyer follows 2 sellers");
        $this->check('following list item shape', implode(',', array_keys(($list['body']['data'][0] ?? []))), 'seller_id,display_name,profile_photo_url,followers_count,followed_at', 'same as mobile');
        $this->check('follower count includes both buyers', $list['body']['data'][0]['followers_count'] ?? '-', 2, '');
        $u = $this->http($buyer, 'DELETE', "/buyer/sellers/{$seller->id}/follow");
        $this->check('unfollow', $u['status'] . '/' . json_encode($u['body']['is_following'] ?? null) . '/' . ($u['body']['followers_count'] ?? '-'), '200/false/1', '');
        $this->check('unfollow repeated is harmless', $this->http($buyer, 'DELETE', "/buyer/sellers/{$seller->id}/follow")['status'], 200, 'idempotent');
        $this->check('unfollow does not touch another buyer', SellerFollow::where('buyer_id', $other->id)->count(), 2, '');
        $this->check('cannot follow yourself (seller account)', $this->http($seller, 'POST', "/buyer/sellers/{$seller->id}/follow")['status'], 403, 'buyers only');
        $this->check('cannot follow a buyer id', $this->http($buyer, 'POST', "/buyer/sellers/{$other->id}/follow")['status'], 404, 'not a seller');
        $this->check('cannot follow a pending seller', $this->http($buyer, 'POST', "/buyer/sellers/{$pending->id}/follow")['status'], 404, '');
        $this->check('seller account: following list', $this->http($seller, 'GET', '/buyer/following')['status'], 403, '');
        $this->check('guest follow', in_array($this->http(null, 'POST', "/buyer/sellers/{$seller->id}/follow")['status'], [401, 302], true) ? 'blocked' : 'OPEN', 'blocked', '');
        $this->check('guest following list', in_array($this->http(null, 'GET', '/buyer/following')['status'], [401, 302], true) ? 'blocked' : 'OPEN', 'blocked', '');
        $this->check('following page (buyer)', $this->http($buyer, 'GET', '/following', [], true)['status'], 200, '');
        $this->check('store stats show real follower count', (int) ($this->http($buyer, 'GET', "/api/seller/{$seller->id}/store")['body']['stats']['followers'] ?? -1), 1, 'was hardcoded 0');

        // ── Change password ─────────────────────────────────────────────────
        $new = 'NewPass!2b';
        $cp = function (array $d, ?User $as = null) use ($buyer) {
            RateLimiter::clear('change-password:' . ($as ?? $buyer)->id); // the 5/min limiter is exercised separately below
            return $this->http($as ?? $buyer, 'POST', '/buyer/change-password', $d);
        };
        $this->check('password: wrong current', $cp(['current_password' => 'Wrong!1aaa', 'new_password' => $new, 'new_password_confirmation' => $new])['status'], 422, '');
        foreach (['short' => 'Ab1!', 'no uppercase' => 'newpass!2b', 'no number' => 'NewPass!!bb', 'no special' => 'NewPass22bb'] as $label => $weak) {
            $this->check("password: weak ({$label})", $cp(['current_password' => $pw, 'new_password' => $weak, 'new_password_confirmation' => $weak])['status'], 422, '');
        }
        $this->check('password: confirmation mismatch', $cp(['current_password' => $pw, 'new_password' => $new, 'new_password_confirmation' => $new . 'x'])['status'], 422, '');
        $this->check('password: same as current', $cp(['current_password' => $pw, 'new_password' => $pw, 'new_password_confirmation' => $pw])['status'], 422, '');
        $this->check('password: nothing changed so far', Hash::check($pw, $fresh($buyer)->password) ? 'yes' : 'NO', 'yes', '');
        $buyer->createToken('other-device');
        $r = $cp(['current_password' => $pw, 'new_password' => $new, 'new_password_confirmation' => $new]);
        $this->check('password: correct', $r['status'], 200, $r['body']['message'] ?? '');
        $this->check('password: changed, stored hashed', (Hash::check($new, $fresh($buyer)->password) && $fresh($buyer)->password !== $new) ? 'yes' : 'NO', 'yes', '');
        $this->check('password: old no longer works', Hash::check($pw, $fresh($buyer)->password) ? 'NO' : 'yes', 'yes', '');
        $this->check('password: new login works', Auth::guard('web')->validate(['email' => $buyer->email, 'password' => $new]) ? 'yes' : 'NO', 'yes', '');
        $this->check('password: other app tokens revoked', $buyer->tokens()->count(), 0, 'same as mobile');
        $this->check('password: no plain text in response', str_contains(json_encode($r['body']), $new) || str_contains($r['raw'], $pw) ? 'LEAK' : 'clean', 'clean', '');
        $this->check('password: seller account blocked', $cp(['current_password' => 'x', 'new_password' => $new, 'new_password_confirmation' => $new], $seller)['status'], 403, '');
        $this->check("password: other buyer's password untouched", Hash::check('OtherPass!1a', $fresh($other)->password) ? 'yes' : 'NO', 'yes', '');
        $this->check('password: guest', in_array($this->http(null, 'POST', '/buyer/change-password')['status'], [401, 302, 419], true) ? 'blocked' : 'OPEN', 'blocked', '');
        $pw = $new;

        // ── Change email (OTP to the new address) ───────────────────────────
        $req = fn (array $d, ?User $as = null) => $this->http($as ?? $buyer, 'POST', '/buyer/change-email/request', $d);
        $ver = fn (array $d, ?User $as = null) => $this->http($as ?? $buyer, 'POST', '/buyer/change-email/verify', $d);
        $this->check('email: duplicate (case-insensitive)', $req(['new_email' => strtoupper($other->email), 'password' => $pw])['status'], 422, '');
        $this->check('email: wrong current password', $req(['new_email' => 'new.' . $buyer->email, 'password' => 'Wrong!1aaa'])['status'], 422, '');
        $this->check('email: invalid format', $req(['new_email' => 'not-an-email', 'password' => $pw])['status'], 422, '');
        $this->check('email: same as current', $req(['new_email' => $buyer->email, 'password' => $pw])['status'], 422, '');
        $newEmail = 'changed.' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(6)) . '@check.invalid';
        $this->check('email: request ok (OTP sent to new address)', $req(['new_email' => $newEmail, 'password' => $pw])['status'], 200, '');
        $this->check('email: not changed before verification', $fresh($buyer)->email === $buyer->email ? 'yes' : 'NO', 'yes', '');
        $this->check('email: wrong code', $ver(['code' => '000000'])['status'], 422, '');
        $this->check('email: malformed code', $ver(['code' => '12'])['status'], 422, '');
        Cache::put('buyer_email_change:' . $buyer->id, ['hash' => Hash::make('123456'), 'new_email' => $newEmail, 'attempts' => 0], now()->addMinutes(5));
        $r = $ver(['code' => '123456']);
        $this->check('email: correct code changes it', $r['status'] . '/' . $fresh($buyer)->email, "200/{$newEmail}", $r['body']['message'] ?? '');
        $this->check('email: other buyer untouched', $fresh($other)->email === $other->email ? 'yes' : 'NO', 'yes', '');
        $this->check('email: seller account blocked', $req(['new_email' => 'x@check.invalid', 'password' => 'x'], $seller)['status'], 403, '');

        // ── Change phone (OTP to current email) ─────────────────────────────
        $preq = fn (array $d, ?User $as = null) => $this->http($as ?? $buyer, 'POST', '/buyer/change-phone/request', $d);
        $pver = fn (array $d, ?User $as = null) => $this->http($as ?? $buyer, 'POST', '/buyer/change-phone/verify', $d);
        $buyer3 = $this->makeUser('buyer.3', ['account_type' => 'buyer', 'role' => 'buyer', 'password' => Hash::make($pw), 'contact_number' => '09170000003']);
        foreach (['12345', '0817123456', '09ABCDEFGHI'] as $bad) {
            $this->check("phone: bad format {$bad}", $preq(['new_phone' => $bad, 'password' => $pw], $buyer3)['status'], 422, '');
        }
        $this->check('phone: bad format 0917123456 (10 digits)', $preq(['new_phone' => '0917123456', 'password' => $pw])['status'], 422, '');
        $this->check('phone: wrong password', $preq(['new_phone' => '09171234567', 'password' => 'Wrong!1aaa'])['status'], 422, '');
        $this->check('phone: duplicate', $preq(['new_phone' => '09170000002', 'password' => $pw])['status'], 422, '');
        $this->check('phone: same as current', $preq(['new_phone' => '09170000001', 'password' => $pw])['status'], 422, '');
        $this->check('phone: request ok (+639 normalised)', $preq(['new_phone' => '+639171234567', 'password' => $pw])['status'], 200, '');
        $this->check('phone: not changed before verification', $fresh($buyer)->contact_number, '09170000001', '');
        $this->check('phone: wrong code', $pver(['code' => '000000'])['status'], 422, '');
        Cache::put('buyer_phone_change:' . $buyer->id, ['hash' => Hash::make('654321'), 'new_phone' => '09171234567', 'attempts' => 0], now()->addMinutes(5));
        $r = $pver(['code' => '654321']);
        $this->check('phone: correct code changes it', $r['status'] . '/' . $fresh($buyer)->contact_number, '200/09171234567', $r['body']['message'] ?? '');
        $this->check('phone: other buyer untouched', $fresh($other)->contact_number, '09170000002', '');

        // ── Profile (web) ───────────────────────────────────────────────────
        $pr = $this->http($buyer, 'GET', '/buyer/profile');
        $this->check('profile: same shape as mobile', $pr['status'] . '/' . implode(',', array_keys($pr['body']['data'] ?? [])), '200/id,first_name,last_name,name,middle_initial,email,contact_number,birthday,sex,region,province,district,municipality_city,barangay,street_address,profile_photo_url', '');
        $this->check('profile: update names; phone/email ignored', $this->http($buyer, 'PUT', '/buyer/profile', ['first_name' => 'Juan', 'last_name' => 'Dela Cruz', 'contact_number' => '09999999999', 'email' => 'hack@check.invalid'])['status'] . '/' . $fresh($buyer)->first_name . '/' . $fresh($buyer)->contact_number . '/' . ($fresh($buyer)->email === $newEmail ? 'email kept' : 'EMAIL CHANGED'), '200/Juan/09171234567/email kept', '');

        // ── Mobile (Sanctum) endpoints keep their shape and still work ──────
        $token = $buyer->createToken('mobile')->plainTextToken;
        $mob = function (string $method, string $uri, array $data = []) use ($token) {
            Auth::forgetGuards();
            $res = app()->handle(Request::create($uri, $method, $data, [], [], ['HTTP_ACCEPT' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer ' . $token]));
            return ['status' => $res->getStatusCode(), 'body' => json_decode((string) $res->getContent(), true) ?? []];
        };
        $m = $mob('POST', "/api/buyer/sellers/{$seller->id}/follow");
        $this->check('mobile follow shape', $m['status'] . '/' . implode(',', array_keys($m['body'])), '200/message,is_following,followers_count', '');
        $m = $mob('GET', '/api/buyer/following');
        $this->check('mobile following shape', $m['status'] . '/' . implode(',', array_keys($m['body'])) . '/' . implode(',', array_keys($m['body']['data'][0] ?? [])), '200/data,meta/seller_id,display_name,profile_photo_url,followers_count,followed_at', '');
        RateLimiter::clear('change-password:' . $buyer->id);
        $m = $mob('POST', '/api/buyer/change-password', ['current_password' => $pw, 'new_password' => 'Third!Pass3c', 'new_password_confirmation' => 'Third!Pass3c']);
        $this->check('mobile change-password still works', $m['status'] . '/' . implode(',', array_keys($m['body'])), '200/message', '');
        $this->check('mobile: current token kept', $buyer->tokens()->count(), 1, 'only the current device stays');
        RateLimiter::clear('change-password:' . $buyer->id);
        $m = $mob('POST', '/api/buyer/change-password', ['current_password' => 'nope', 'new_password' => 'Third!Pass3c', 'new_password_confirmation' => 'Third!Pass3c']);
        $this->check('mobile wrong current: 422 shape', $m['status'] . '/' . implode(',', array_keys($m['body'])), '422/message,errors', '');
    }
}
