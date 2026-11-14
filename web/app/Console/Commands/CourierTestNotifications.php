<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\CourierNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\ShipmentAssignment;
use App\Services\CourierNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Rollback-only: courier company notifications (one per event, dedupe_key,
 * after-commit only), company-scoped bell feed, read / read-all, access.
 *
 *   php artisan courier:test-notifications
 */
class CourierTestNotifications extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'courier:test-notifications';

    protected $description = 'Rollback-only: courier notifications per event, dedupe, after-commit, scoped feed';

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), [
            'users', 'orders', 'order_items', 'shipment_assignments', 'delivery_jobs', 'courier_personnel', 'courier_notifications',
        ]);
    }

    private function runTests(): void
    {
        $p = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        $co = ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified'];
        $buyer  = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $seller = $this->makeUser('seller', ['account_type' => 'seller', 'role' => 'seller']);
        $c1     = $this->makeUser('courier.1', $co);
        $c2     = $this->makeUser('courier.2', $co);
        $hub1   = $this->makeUser('hub.1', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'courier_company_id' => $c1->id]);
        $hub2   = $this->makeUser('hub.2', ['account_type' => 'logistics', 'role' => 'logistics_staff', 'courier_company_id' => $c2->id]);
        $rider  = $this->makeUser('rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
        $pers   = CourierPersonnel::create(['courier_id' => $c1->id, 'user_id' => $rider->id, 'name' => 'Flow Rider', 'role' => 'rider', 'status' => 'active']);
        [$order] = $this->makeOrder($buyer, $seller, $p, 'shipped');

        $n = fn (User|\App\Models\User $c, ?string $type = null) => CourierNotification::where('courier_id', $c->id)->when($type, fn ($q) => $q->where('type', $type))->count();

        // after-commit: rolled-back work never notifies
        DB::beginTransaction();
        ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id, 'assigned_at' => now(),
            'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'pending', 'pickup_status' => 'pending_pickup']);
        DB::rollBack();
        $this->check('rolled-back assignment: no notification', $n($c1), 0, 'after-commit');

        $sa = ShipmentAssignment::create(['order_id' => $order->id, 'courier_id' => $c1->id, 'assigned_by' => $c1->id, 'assigned_at' => now(),
            'acceptance_deadline' => now()->addDay(), 'assignment_status' => 'pending', 'pickup_status' => 'pending_pickup']);
        $this->check('new pickup assignment: 1 notification', $n($c1, 'pickup_assigned'), 1, '');
        $this->check('other company: none', $n($c2), 0, '');
        CourierNotificationService::assignmentCreated($sa);
        CourierNotificationService::assignmentCreated($sa);
        $this->check('replayed event: still 1 (dedupe_key)', $n($c1, 'pickup_assigned'), 1, '');

        $sa->update(['assignment_status' => 'accepted']);
        $this->check('accept: no notification', $n($c1), 1, '');
        $sa->update(['assigned_personnel_id' => $pers->id]);
        $sa->update(['pickup_status' => 'scheduled']);
        $sa->update(['assigned_personnel_id' => $pers->id]);
        $this->check('rider assigned to pickup: 1 (no repeat)', $n($c1, 'rider_assigned'), 1, '');

        $job = DeliveryJob::create(['order_id' => $order->id, 'rider_user_id' => $rider->id, 'personnel_id' => $pers->id, 'courier_id' => $c1->id,
            'assigned_by' => $c1->id, 'status' => DeliveryJob::STATUS_ASSIGNED, 'cod_amount' => 0, 'assigned_at' => now()]);
        $this->check('delivery rider assigned: 1', $n($c1, 'delivery_rider_assigned'), 1, '');
        $job->update(['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY, 'out_for_delivery_at' => now()]);
        $this->check('out for delivery: no courier notification', $n($c1), 3, 'only the 3 events above');
        $job->update(['status' => DeliveryJob::STATUS_FAILED, 'attempt_count' => 1]);
        $job->update(['attempt_count' => 1]);
        $this->check('failed delivery: 1', $n($c1, 'delivery_failed'), 1, '');
        $job->update(['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY]);
        $job->update(['status' => DeliveryJob::STATUS_FAILED, 'attempt_count' => 2]);
        $this->check('second failed attempt: separate notification', $n($c1, 'delivery_failed'), 2, 'key includes the attempt');
        $job->update(['status' => DeliveryJob::STATUS_OUT_FOR_DELIVERY]);
        $job->update(['status' => DeliveryJob::STATUS_DELIVERED, 'delivered_at' => now(), 'attempt_count' => 3]);
        $job->update(['delivered_at' => now()->addMinute()]);
        $this->check('delivered: 1', $n($c1, 'delivered'), 1, '');
        $this->check('company 2 still has none', $n($c2), 0, '');

        // ── feed / read / access (real routes) ──────────────────────────────
        $ids = fn ($u) => collect($this->http($u, 'GET', '/courier/notifications/feed')['body']['data'] ?? [])->pluck('id')->sort()->values()->all();
        $mine = CourierNotification::where('courier_id', $c1->id)->pluck('id')->sort()->values()->all();
        $this->check('courier feed: own company rows', json_encode($ids($c1)), json_encode($mine), '');
        $this->check('logistics_staff of the company: same rows', json_encode($ids($hub1)), json_encode($mine), 'via company resolver');
        $this->check('logistics_staff of another company: none', json_encode($ids($hub2)), '[]', '');
        $this->check('unread count', $this->http($c1, 'GET', '/courier/notifications/feed')['body']['meta']['unread_count'] ?? '-', count($mine), '');
        $this->check('seller blocked', $this->http($seller, 'GET', '/courier/notifications/feed')['status'], 403, '');
        $this->check('rider blocked', $this->http($rider, 'GET', '/courier/notifications/feed')['status'], 403, '');
        $this->check('page opens for courier', $this->http($c1, 'GET', '/courier/notifications', [], true)['status'], 200, '');
        $this->check("other company cannot read someone else's row", $this->http($hub2, 'POST', "/courier/notifications/{$mine[0]}/read")['status'], 404, '');
        $r = $this->http($hub1, 'POST', "/courier/notifications/{$mine[0]}/read");
        $this->check('staff marks one read', $r['status'] . '/' . ($r['body']['unread_count'] ?? '-'), '200/' . (count($mine) - 1), '');
        $r = $this->http($c1, 'POST', '/courier/notifications/read-all');
        $this->check('read-all', $r['status'] . '/' . CourierNotification::where('courier_id', $c1->id)->whereNull('read_at')->count(), '200/0', '');
    }
}
