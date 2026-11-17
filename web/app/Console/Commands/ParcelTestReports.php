<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\AdminNotification;
use App\Models\BuyerNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\ParcelReport;
use App\Models\RiderNotification;
use App\Models\User;
use App\Services\AdminNotificationService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * Rollback-only tests for parcel reports: buyer web + app, rider app, courier app,
 * validation, ownership, one active report per order per reporter, admin review /
 * resolve, reporter notifications (no internal note, no other identity, no doubles),
 * admin notification entry, throttling on every submit route.
 *
 *   php artisan parcel:test-reports
 */
class ParcelTestReports extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'parcel:test-reports';

    protected $description = 'Rollback-only: parcel reports (buyer/rider/courier), rules, admin decisions, notifications';

    private array $tokens = [];

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), [
            'parcel_reports', 'orders', 'order_items', 'users', 'delivery_jobs', 'courier_personnel',
            'buyer_notifications', 'rider_notifications', 'courier_notifications', 'admin_notifications', 'personal_access_tokens',
        ]);
    }

    private function api(User $u, string $method, string $uri, array $data = []): array
    {
        $this->tokens[$u->id] ??= $u->createToken('parcel-test')->plainTextToken;
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
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one');
            return;
        }
        $v       = ['email_verified_at' => now(), 'verification_status' => 'verified'];
        $buyer   = $this->makeUser('pr-buyer', ['account_type' => 'buyer', 'role' => 'buyer'] + $v);
        $other   = $this->makeUser('pr-other', ['account_type' => 'buyer', 'role' => 'buyer'] + $v);
        $seller  = $this->makeUser('pr-seller', ['account_type' => 'seller', 'role' => 'seller', 'business_name' => 'PR Test Shop'] + $v);
        $courier = $this->makeUser('pr-courier', ['account_type' => 'logistics', 'role' => 'courier', 'company_name' => 'PR Test Courier'] + $v);
        $c2      = $this->makeUser('pr-courier2', ['account_type' => 'logistics', 'role' => 'courier'] + $v);
        $rider   = $this->makeUser('pr-rider', ['account_type' => 'logistics', 'role' => 'rider'] + $v);
        $rider2  = $this->makeUser('pr-rider2', ['account_type' => 'logistics', 'role' => 'rider'] + $v);

        [$shipped]   = $this->makeOrder($buyer, $seller, $p, 'shipped');
        [$completed] = $this->makeOrder($buyer, $seller, $p, 'completed');
        [$pending]   = $this->makeOrder($buyer, $seller, $p, 'pending');
        $shipped->forceFill(['assigned_courier_id' => $courier->id])->saveQuietly();

        $pers = new CourierPersonnel();
        $pers->forceFill(['courier_id' => $courier->id, 'user_id' => $rider->id, 'name' => 'PR Rider', 'role' => 'rider', 'status' => 'active'])->save();
        $job = new DeliveryJob();
        $job->forceFill(['order_id' => $shipped->id, 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $courier->id,
            'status' => 'assigned', 'assigned_at' => now()])->saveQuietly();

        $ok = ['reason' => 'damaged', 'description' => 'The box arrived crushed and wet.'];

        // ── Buyer web (session) ───────────────────────────────────────────
        $r = $this->http($buyer, 'GET', "/buyer/orders/{$shipped->id}/parcel-report");
        $this->check('web GET: no report yet, can_report', $r['status'] . '/' . (array_key_exists('data', $r['body']) ? json_encode($r['body']['data']) : 'missing') . '/' . json_encode($r['body']['meta']['can_report'] ?? null), '200/null/true');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", ['reason' => 'broken', 'description' => 'x']);
        $this->check('validation: bad reason / short text', $r['status'] . '/' . implode(',', array_keys($r['body']['errors'] ?? [])), '422/reason,description');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", ['reason' => 'lost', 'description' => str_repeat('a', 1001)]);
        $this->check('validation: description over 1000', $r['status'], 422);
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$pending->id}/parcel-report", $ok);
        $this->check('not shipped yet -> 422', $r['status'], 422, $r['body']['message'] ?? '');
        $r = $this->http($other, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", $ok);
        $this->check("other buyer's order -> 404", $r['status'], 404);
        $r = $this->http($seller, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", $ok);
        $this->check('seller on buyer route -> 403', $r['status'], 403);
        $r = $this->http(null, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", $ok);
        $this->check('guest -> 401', $r['status'], 401);

        $r = $this->http($buyer, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", $ok);
        $rep = ParcelReport::find($r['body']['data']['id'] ?? 0);
        $this->check('buyer web submit -> 201', $r['status'] . '/' . ($rep?->status ?? '-') . '/' . ($rep?->reporter_role ?? '-'), '201/open/buyer');
        $this->check('response has no admin_note key', array_key_exists('admin_note', $r['body']['data'] ?? []) ? 'leak' : 'none', 'none');
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", ['reason' => 'lost', 'description' => 'Still not here at all.']);
        $this->check('second active report same order -> 409', $r['status'], 409);
        $r = $this->http($buyer, 'GET', "/buyer/orders/{$shipped->id}/parcel-report");
        $this->check('web GET shows open report, cannot report again', ($r['body']['data']['status'] ?? '-') . '/' . json_encode($r['body']['meta']['can_report'] ?? null), 'open/false');

        // ── Buyer app (Sanctum) ───────────────────────────────────────────
        $r = $this->api($buyer, 'POST', "/api/buyer/orders/{$completed->id}/parcel-report", ['reason' => 'wrong_item', 'description' => 'Got a blue one, ordered red.']);
        $this->check('buyer app submit (other order) -> 201', $r['status'], 201);
        $r = $this->api($buyer, 'POST', "/api/buyer/orders/{$completed->id}/parcel-report", ['reason' => 'damaged', 'description' => 'Another one for the same order.']);
        $this->check('buyer app duplicate -> 409', $r['status'], 409);

        // ── Rider app ─────────────────────────────────────────────────────
        $r = $this->api($rider, 'POST', "/api/rider-app/jobs/{$job->id}/parcel-report", ['reason' => 'damaged', 'description' => 'Parcel torn when picked up at hub.']);
        $riderRep = ParcelReport::find($r['body']['data']['id'] ?? 0);
        $this->check('rider submit for own job -> 201', $r['status'] . '/' . ($riderRep?->reporter_role ?? '-'), '201/rider');
        $r = $this->api($rider2, 'POST', "/api/rider-app/jobs/{$job->id}/parcel-report", $ok);
        $this->check("rider on someone else's job -> 404", $r['status'], 404);
        $r = $this->api($buyer, 'POST', "/api/rider-app/jobs/{$job->id}/parcel-report", $ok);
        $this->check('buyer token on rider route -> 403', $r['status'], 403);

        // ── Courier app ───────────────────────────────────────────────────
        $r = $this->api($courier, 'POST', "/api/courier-app/orders/{$shipped->id}/parcel-report", ['reason' => 'lost', 'description' => 'Missing at the sorting hub.']);
        $courierRep = ParcelReport::find($r['body']['data']['id'] ?? 0);
        $this->check('courier submit for assigned order -> 201', $r['status'] . '/' . ($courierRep?->reporter_role ?? '-'), '201/courier');
        $r = $this->api($c2, 'POST', "/api/courier-app/orders/{$shipped->id}/parcel-report", $ok);
        $this->check('other courier -> 404', $r['status'], 404);
        $this->check('one report per reporter (3 on one order)', ParcelReport::where('order_id', $shipped->id)->count(), 3);

        // ── Admin queue + decisions ───────────────────────────────────────
        $r = $this->admin('GET', '/admin/parcel-reports/feed?status=open');
        $this->check('admin feed lists the reports', collect($r['body']['data'] ?? [])->whereIn('id', [$rep?->id, $riderRep?->id, $courierRep?->id])->count(), 3);
        $r = app()->handle(Request::create('/admin/parcel-reports/feed', 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']));
        $this->check('admin feed without admin session -> blocked', $r->getStatusCode() >= 300 ? 'blocked' : 'OPEN', 'blocked', (string) $r->getStatusCode());
        $synced = AdminNotificationService::sync();
        $this->check('admin notification entry (parcel_report)', AdminNotification::where('source_key', "parcel_report:{$rep?->id}")->value('type') ?? '-', 'parcel_report', "sync created {$synced}");

        $secret = 'INTERNAL-NOTE-' . Str::random(6);
        $r = $this->admin('POST', "/admin/parcel-reports/{$rep?->id}/status", ['status' => 'bogus']);
        $this->check('admin: invalid status -> 422', $r['status'], 422);
        $r = $this->admin('POST', "/admin/parcel-reports/{$rep?->id}/status", ['status' => 'reviewed', 'note' => $secret]);
        $this->check('admin: mark reviewed', $r['status'] . '/' . $rep?->fresh()->status, '200/reviewed');
        $r = $this->admin('POST', "/admin/parcel-reports/{$rep?->id}/status", ['status' => 'reviewed']);
        $this->check('admin: reviewed again = no change', $r['body']['message'] ?? '-', 'No change.');
        $r = $this->admin('POST', "/admin/parcel-reports/{$rep?->id}/status", ['status' => 'resolved']);
        $this->check('admin: mark resolved (note kept)', $r['status'] . '/' . $rep?->fresh()->status . '/' . ($rep?->fresh()->admin_note === $secret ? 'kept' : 'lost'), '200/resolved/kept');
        $r = $this->admin('POST', "/admin/parcel-reports/{$rep?->id}/status", ['status' => 'reviewed']);
        $this->check('admin: resolved is final -> 409', $r['status'], 409);
        $this->admin('POST', "/admin/parcel-reports/{$riderRep?->id}/status", ['status' => 'resolved']);
        $this->admin('POST', "/admin/parcel-reports/{$courierRep?->id}/status", ['status' => 'reviewed']);

        // ── Reporter notifications ────────────────────────────────────────
        $bn = BuyerNotification::where('buyer_id', $buyer->id)->where('type', 'parcel_report')->get();
        $this->check('buyer notified: reviewed + resolved (no doubles)', $bn->pluck('data.status')->sort()->values()->implode(','), 'resolved,reviewed');
        $all = $bn->map(fn ($n) => $n->title . ' ' . $n->body . ' ' . json_encode($n->data))->implode(' ');
        $this->check('buyer text has no internal note', str_contains($all, $secret) ? 'LEAK' : 'clean', 'clean');
        $this->check('buyer text has no rider/courier identity', (str_contains($all, 'PR Test Courier') || str_contains($all, 'PR Rider')) ? 'LEAK' : 'clean', 'clean');
        $this->check('rider notified (resolved)', RiderNotification::where('rider_user_id', $rider->id)->where('type', 'parcel_report')->count(), 1);
        $cn = \App\Models\CourierNotification::where('courier_id', $courier->id)->where('type', 'parcel_report')->get();
        $this->check('courier notified (reviewed)', $cn->count() . '/' . ($cn->first()?->data['status'] ?? '-'), '1/reviewed');
        $this->check('courier text has no buyer identity', str_contains($cn->implode('message', ' '), $buyer->name) ? 'LEAK' : 'clean', 'clean');

        // After resolve, the buyer may report again on that order.
        $r = $this->http($buyer, 'POST', "/buyer/orders/{$shipped->id}/parcel-report", ['reason' => 'not_received', 'description' => 'Second problem after resolution.']);
        $this->check('new report allowed after resolved', $r['status'], 201);

        // ── Throttling on every submit route ──────────────────────────────
        $throttled = collect([
            ['POST', 'buyer/orders/{id}/parcel-report'], ['POST', 'api/buyer/orders/{id}/parcel-report'],
            ['POST', 'api/rider-app/jobs/{id}/parcel-report'], ['POST', 'api/courier-app/orders/{id}/parcel-report'],
        ])->every(function ($x) {
            $route = collect(Route::getRoutes()->getRoutes())->first(fn ($r) => $r->uri() === $x[1] && in_array($x[0], $r->methods(), true));
            return $route && collect($route->gatherMiddleware())->contains(fn ($m) => is_string($m) && str_starts_with($m, 'throttle:10,1'));
        });
        $this->check('submit routes throttled (10/min)', $throttled ? 'yes' : 'no', 'yes');
    }
}
