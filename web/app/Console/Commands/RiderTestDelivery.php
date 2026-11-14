<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderDeliveryController as RDC;
use App\Models\BuyerNotification;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request as IlluminateRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * artisan rider:test-delivery
 *
 * Full integration test for /api/rider-app/deliveries/*.
 * Both Scenario A and B delivery jobs are pre-created under the SAME rider
 * before the first kernel call, so a single login token works for the entire
 * test run without any mid-run Artisan reset.
 *
 * HOW TO RUN:
 *   php artisan rider:demo-clean
 *   php artisan rider:demo-seed
 *   php artisan rider:demo-delivery
 *   php artisan rider:test-delivery
 *
 * To re-run: repeat the same four commands.
 *
 * T-* steps check the buyer-facing tracking written by each rider event
 * (orders.tracking_status / tracking_message). SAFETY-* steps check that
 * orders.status, orders.payment_status, shipment_scans and
 * shipment_assignments are unchanged. N-* steps check buyer_notifications:
 * each rider event adds exactly one row for the order's buyer with the right
 * text, blocked / repeated calls add none, and no other buyer gets a row.
 */
class RiderTestDelivery extends Command
{
    protected $signature   = 'rider:test-delivery';
    protected $description = 'Integration test for rider delivery endpoints (DEMO data only, no DB wipe).';

    private const RIDER_EMAIL = 'demo.rider@mimoo-demo.test';
    private const RIDER_PASS  = 'Demo@1234!';
    private const BASE        = '/api/rider-app';

    private array  $results   = [];
    private int    $passed    = 0;
    private int    $failed    = 0;
    private int    $skipped   = 0;

    private string $token     = '';
    private int    $jobId     = 0;
    private int    $jobIdB    = 0;
    private float  $codAmount = 0.0;
    private string $riderFirst = '';

    // ── Entry point ───────────────────────────────────────────────────────────

    public function handle(): int
    {
        if (! Schema::hasTable('delivery_jobs')) {
            $this->error('Table delivery_jobs not found. Run the rider migrations first.');
            return self::FAILURE;
        }

        $rider = User::where('email', self::RIDER_EMAIL)->first();
        if (! $rider) {
            $this->error('Demo rider not found. Run: php artisan rider:demo-seed');
            return self::FAILURE;
        }

        // Pre-create Scenario B job directly in the DB (before any kernel call).
        $this->jobIdB = $this->preseedScenarioBJob($rider);
        if ($this->jobIdB === 0) {
            $this->error('Could not pre-seed Scenario B job. Run rider:demo-delivery first.');
            return self::FAILURE;
        }
        $this->line("Pre-seeded Scenario B job id={$this->jobIdB}");

        $first = trim((string) ($rider->first_name ?? ''));
        if ($first === '') {
            $first = trim((string) strtok(trim((string) $rider->name), ' '));
        }
        $this->riderFirst = $first !== '' ? $first : 'your rider';

        $beforeSnap = $this->safetySnapshot();

        $this->line('');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->info('  Mimoo Rider – Delivery API Integration Test');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->line('');

        // Single login — token is reused for all kernel calls.
        $loginRes = $this->apiCall('POST', '/login', [
            'email'    => self::RIDER_EMAIL,
            'password' => self::RIDER_PASS,
        ], auth: false);

        if ($loginRes->getStatusCode() !== 200) {
            $this->error('Login failed: ' . $loginRes->getContent());
            return self::FAILURE;
        }
        $this->token = $loginRes->getData(true)['data']['token'] ?? '';
        $this->line('✓ Logged in as ' . self::RIDER_EMAIL);

        $this->line('');
        $this->line('── SCENARIO A: Happy Path ──────────────────────────────────');
        $this->runScenarioA();

        $this->line('');
        $this->line('── SCENARIO B: Failure / Retry Path ────────────────────────');
        $this->runScenarioB();

        $this->line('');
        $this->line('── Safety Check: protected columns ─────────────────────────');
        $this->runSafetyCheck($beforeSnap);

        $this->printResults();

        Artisan::call('rider:demo-clean');
        $this->line('');
        $this->line('Demo data cleaned up.');

        return $this->failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Clone the Scenario A order/job so both live under the same rider.
     * Done entirely via Eloquent — no kernel calls.
     */
    private function preseedScenarioBJob(User $rider): int
    {
        $personnel = \App\Models\CourierPersonnel::where('user_id', $rider->id)
            ->where('status', 'active')->first();
        if (! $personnel) {
            return 0;
        }

        $existingJob = DeliveryJob::where('rider_user_id', $rider->id)
            ->orderBy('id')->first();
        if (! $existingJob) {
            return 0;
        }

        $src = Order::find($existingJob->order_id);
        if (! $src) {
            return 0;
        }

        $cloned = Order::create([
            'buyer_id'             => $src->buyer_id,
            'status'               => 'in_transit',
            'total'                => $src->total,
            'payment_method'       => $src->payment_method,
            'shipping_name'        => $src->shipping_name,
            'shipping_address'     => $src->shipping_address,
            'shipping_phone'       => $src->shipping_phone,
            'waybill_number'       => 'MIMWB-DEMO-B-' . strtoupper(substr(md5(uniqid()), 0, 6)),
            'waybill_generated_at' => now(),
            'assigned_courier_id'  => $src->assigned_courier_id,
        ]);

        $cod = strtolower((string) $cloned->payment_method) === 'cod'
            ? (float) $cloned->total : 0.0;

        $job = DeliveryJob::create([
            'order_id'      => $cloned->id,
            'rider_user_id' => $rider->id,
            'personnel_id'  => $personnel->id,
            'courier_id'    => $personnel->courier_id,
            'facility_id'   => null,
            'assigned_by'   => $personnel->courier_id,
            'status'        => DeliveryJob::STATUS_ASSIGNED,
            'cod_amount'    => $cod,
            'assigned_at'   => now(),
        ]);

        return $job->id;
    }

    // ── Scenario A: happy path ────────────────────────────────────────────────

    private function runScenarioA(): void
    {
        // A1: delivery list includes at least one job
        $r    = $this->apiCall('GET', '/deliveries');
        $jobs = $r->getData(true)['data'] ?? [];
        if ($r->getStatusCode() === 200 && count($jobs) >= 1) {
            // Pick the first assigned job for Scenario A
            foreach ($jobs as $j) {
                if ($j['status'] === DeliveryJob::STATUS_ASSIGNED) {
                    $this->jobId    = $j['id'];
                    $this->codAmount = (float) ($j['cod_amount'] ?? 0);
                    break;
                }
            }
            if ($this->jobId === 0) {
                $this->jobId     = $jobs[0]['id'];
                $this->codAmount = (float) ($jobs[0]['cod_amount'] ?? 0);
            }
            $this->recordPass('A1', "Delivery list → 200, job_id={$this->jobId}, COD=₱" . number_format($this->codAmount, 2));
        } else {
            $this->recordFail('A1', 'Delivery list empty or non-200.');
            return;
        }

        if ($this->codAmount <= 0) {
            $this->recordFail('A1b', 'COD amount is 0');
        } else {
            $this->recordPass('A1b', 'COD amount > 0 ✓');
        }

        // A2: mark out for delivery
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/out-for-delivery");
        if ($r->getStatusCode() === 200) {
            $this->recordPass('A2', 'Mark out for delivery → 200');
            $this->assertTracking('T-A2', $this->jobId, RDC::TRACK_OUT_FOR_DELIVERY,
                "Your parcel is out for delivery with {$this->riderFirst}.");
            $this->assertBuyerNotified('N-A2', $this->jobId, $n,
                'Out for delivery', "Your parcel is out for delivery with {$this->riderFirst}.");

            // A2-repeat: second out-for-delivery -> idempotent, no new notification
            $n = $this->notifMark();
            $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/out-for-delivery");
            if ($r->getStatusCode() === 200 && ($r->getData(true)['idempotent'] ?? false)) {
                $this->recordPass('A2-repeat', 'Repeat out-for-delivery → 200 idempotent ✓');
            } else {
                $this->recordFail('A2-repeat', "Expected 200+idempotent, got {$r->getStatusCode()}: " . $this->msg($r));
            }
            $this->assertNoNewNotif('N-A2-repeat', $n);
        } else {
            $this->recordFail('A2', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
            return;
        }

        // A3: an old app still asks for a code: 200, nothing is issued (the delivery code was removed)
        $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/otp");
        if ($r->getStatusCode() === 200 && ! isset($r->getData(true)['debug_otp'])) {
            $this->recordPass('A3', 'Old code request → 200, no code issued');
        } else {
            $this->recordFail('A3', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }

        // A5: deliver WITHOUT the POD photo -> 422 with a clear message
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/deliver", ['cod_collected' => $this->codAmount]);
        if ($r->getStatusCode() === 422 && str_contains($this->msg($r), 'Proof of delivery is required')) {
            $this->recordPass('A5', 'No POD → 422 with a clear message ✓');
        } else {
            $this->recordFail('A5', "Expected 422 (POD required), got {$r->getStatusCode()}: " . $this->msg($r));
        }
        $this->assertNoNewNotif('N-A5', $n);

        // A4: upload POD photo
        $upload = UploadedFile::fake()->createWithContent('pod.png', $this->tinyPng());
        $r      = $this->callMultipart("/deliveries/{$this->jobId}/pod", $upload);
        if ($r->getStatusCode() === 200) {
            $this->recordPass('A4', 'POD photo upload → 200');
        } else {
            $this->recordFail('A4', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }

        // A5b: POD + wrong COD -> 422
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/deliver", ['cod_collected' => round($this->codAmount + 1, 2)]);
        if ($r->getStatusCode() === 422) {
            $this->recordPass('A5b', 'POD + wrong COD → 422 ✓');
        } else {
            $this->recordFail('A5b', "Expected 422, got {$r->getStatusCode()}: " . $this->msg($r));
        }
        $this->assertNoNewNotif('N-A5b', $n);

        // A6: POD + correct COD (a stray otp field from an old app is ignored)
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/deliver", ['otp' => '000000', 'cod_collected' => $this->codAmount]);
        $delivered = false;
        if ($r->getStatusCode() === 200 && ($r->getData(true)['data']['status'] ?? '') === DeliveryJob::STATUS_DELIVERED) {
            $delivered = true;
            $this->recordPass('A6', 'Deliver → 200, status=delivered ✓');
            $this->assertTracking('T-A6', $this->jobId, RDC::TRACK_DELIVERED, 'Parcel delivered.');
            $this->assertBuyerNotified('N-A6', $this->jobId, $n, 'Parcel delivered', 'Your parcel was delivered.');
        } else {
            $this->recordFail('A6', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }

        // A6-repeat: second deliver -> idempotent, no new notification
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$this->jobId}/deliver", ['cod_collected' => $this->codAmount]);
        if ($r->getStatusCode() === 200 && ($r->getData(true)['idempotent'] ?? false)) {
            $this->recordPass('A6-repeat', 'Repeat deliver → 200 idempotent ✓');
        } else {
            $this->recordFail('A6-repeat', "Expected 200+idempotent, got {$r->getStatusCode()}: " . $this->msg($r));
        }
        $this->assertNoNewNotif('N-A6-repeat', $n);

        // A7: COD summary
        $r    = $this->apiCall('GET', '/cod');
        $held = (float) ($r->getData(true)['data']['held_amount'] ?? -1);
        if ($r->getStatusCode() === 200) {
            if ($delivered && $held === $this->codAmount) {
                $this->recordPass('A7', "COD held=₱" . number_format($held, 2) . ' ✓');
            } elseif (! $delivered) {
                $this->recordSkip('A7', 'Skipped: delivery not completed');
            } else {
                $this->recordFail('A7', "Held=₱{$held}, expected=₱{$this->codAmount}");
            }
        } else {
            $this->recordFail('A7', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }

        // A8: remit COD
        if ($delivered) {
            $r = $this->apiCall('POST', '/cod/remit');
            if ($r->getStatusCode() === 201) {
                $this->recordPass('A8', 'Remit COD → 201, ref=' . ($r->getData(true)['data']['reference'] ?? '?'));
            } else {
                $this->recordFail('A8', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
            }
        } else {
            $this->recordSkip('A8', 'Skipped: delivery not completed');
        }

        // A9: earnings + notifications
        $r = $this->apiCall('GET', '/earnings');
        if ($r->getStatusCode() === 200) {
            $today = (float) ($r->getData(true)['data']['today'] ?? 0);
            if ($delivered && $today >= 50) {
                $this->recordPass('A9a', "Earnings today=₱{$today} ≥ ₱50 ✓");
            } elseif (! $delivered) {
                $this->recordSkip('A9a', 'Skipped: delivery not completed');
            } else {
                $this->recordFail('A9a', "Earnings=₱{$today}, expected ≥ ₱50");
            }
        } else {
            $this->recordFail('A9a', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }

        $r = $this->apiCall('GET', '/notifications');
        if ($r->getStatusCode() === 200) {
            $this->recordPass('A9b', 'Notifications → 200, unread=' . ($r->getData(true)['unread_count'] ?? 0));
        } else {
            $this->recordFail('A9b', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }
    }

    // ── Scenario B: failure path ──────────────────────────────────────────────

    private function runScenarioB(): void
    {
        $id = $this->jobIdB;

        // B4-pre: return to sender on fresh job → blocked
        $t = $this->trackingOf($id);
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$id}/return");
        $this->assertTrackingUnchanged('T-B4-pre', $id, $t);
        $this->assertNoNewNotif('N-B4-pre', $n);
        if ($r->getStatusCode() === 422) {
            $this->recordPass('B4-pre', 'Return-to-sender on fresh job → 422 ✓');
        } else {
            $this->recordFail('B4-pre', "Expected 422, got {$r->getStatusCode()}: " . $this->msg($r));
        }

        // B1: three failed attempts
        for ($i = 1; $i <= 3; $i++) {
            $n = $this->notifMark();
            $r = $this->apiCall('POST', "/deliveries/{$id}/out-for-delivery");
            if ($r->getStatusCode() !== 200 && ! ($r->getData(true)['idempotent'] ?? false)) {
                $this->recordFail("B1-{$i}-start", "out-for-delivery → {$r->getStatusCode()}: " . $this->msg($r));
                continue;
            }
            $max = (int) (DeliveryJob::find($id)?->max_attempts ?? 3);
            $this->assertTracking("T-B1-{$i}-start", $id, RDC::TRACK_OUT_FOR_DELIVERY,
                "Your parcel is out for delivery with {$this->riderFirst}."
                . ($i > 1 ? " Delivery attempt {$i} of {$max}." : ''));
            $this->assertBuyerNotified("N-B1-{$i}-start", $id, $n,
                'Out for delivery', "Your parcel is out for delivery with {$this->riderFirst}.");
            $n = $this->notifMark();
            $r = $this->apiCall('POST', "/deliveries/{$id}/fail", ['reason' => 'buyer_not_around']);
            if ($r->getStatusCode() === 200) {
                $cr = $r->getData(true)['can_retry'] ?? '?';
                $mr = $r->getData(true)['must_return_to_sender'] ?? '?';
                $this->recordPass("B1-{$i}", "Fail #{$i} → 200, can_retry={$cr}, must_return={$mr} ✓");
                $this->assertTracking("T-B1-{$i}", $id, RDC::TRACK_FAILED, "Delivery attempt {$i} of {$max} failed.");
                $this->assertBuyerNotified("N-B1-{$i}", $id, $n,
                    'Delivery attempt failed', "Delivery attempt {$i} of {$max} failed.");
            } else {
                $this->recordFail("B1-{$i}", "HTTP {$r->getStatusCode()}: " . $this->msg($r));
            }
        }

        // B2: 4th out-for-delivery → blocked
        $t = $this->trackingOf($id);
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$id}/out-for-delivery");
        $this->assertTrackingUnchanged('T-B2', $id, $t);
        $this->assertNoNewNotif('N-B2', $n);
        if ($r->getStatusCode() === 422) {
            $this->recordPass('B2', '4th attempt blocked → 422 ✓');
        } else {
            $this->recordFail('B2', "Expected 422, got {$r->getStatusCode()}: " . $this->msg($r));
        }

        // B3: return to sender after 3 failures → success
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$id}/return");
        if ($r->getStatusCode() === 200 && ($r->getData(true)['data']['status'] ?? '') === DeliveryJob::STATUS_RETURN_TO_SENDER) {
            $this->recordPass('B3', 'Return to sender after 3 fails → 200, status=return_to_sender ✓');
            $this->assertTracking('T-B3', $id, RDC::TRACK_RETURNING, 'Parcel is being returned to the sender.');
            $this->assertBuyerNotified('N-B3', $id, $n,
                'Returning to sender', 'Your parcel is being returned to the sender.');
        } else {
            $this->recordFail('B3', "HTTP {$r->getStatusCode()}: " . $this->msg($r));
        }

        // B3b: second return → idempotent
        $t = $this->trackingOf($id);
        $n = $this->notifMark();
        $r = $this->apiCall('POST', "/deliveries/{$id}/return");
        $this->assertTrackingUnchanged('T-B3b', $id, $t);
        $this->assertNoNewNotif('N-B3b', $n);
        if ($r->getStatusCode() === 200 && ($r->getData(true)['idempotent'] ?? false)) {
            $this->recordPass('B3b', 'Second return → 200 idempotent ✓');
        } else {
            $this->recordFail('B3b', "Expected 200+idempotent, got {$r->getStatusCode()}: " . $this->msg($r));
        }
    }

    // ── Tracking assertions ───────────────────────────────────────────────────

    /** [tracking_status, tracking_message] of the job's order, read fresh. */
    private function trackingOf(int $jobId): array
    {
        $order = Order::find(DeliveryJob::find($jobId)?->order_id);
        return [$order?->tracking_status, $order?->tracking_message];
    }

    private function assertTracking(string $step, int $jobId, string $status, string $message): void
    {
        $order = Order::find(DeliveryJob::find($jobId)?->order_id);
        if (! $order) {
            $this->recordFail($step, "Order for job {$jobId} not found");
            return;
        }
        if ($order->tracking_status !== $status || $order->tracking_message !== $message) {
            $this->recordFail($step, "Expected '{$status}' / '{$message}', got '{$order->tracking_status}' / '{$order->tracking_message}'");
            return;
        }
        // No buyer phone / address in buyer-facing text.
        foreach (['shipping_phone', 'shipping_address'] as $pii) {
            $v = trim((string) $order->$pii);
            if ($v !== '' && str_contains($order->tracking_message, $v)) {
                $this->recordFail($step, "tracking_message contains {$pii}");
                return;
            }
        }
        $this->recordPass($step, "tracking={$status}, \"{$message}\" ✓");
    }

    private function assertTrackingUnchanged(string $step, int $jobId, array $before): void
    {
        $after = $this->trackingOf($jobId);
        if ($after === $before) {
            $this->recordPass($step, 'tracking unchanged on blocked/idempotent call ✓');
        } else {
            $this->recordFail($step, "tracking changed '{$before[0]}' → '{$after[0]}'");
        }
    }

    // ── Buyer notification assertions ─────────────────────────────────────────

    /** Highest buyer_notifications id right now (rows above it are "new"). */
    private function notifMark(): int
    {
        return Schema::hasTable('buyer_notifications') ? (int) BuyerNotification::max('id') : 0;
    }

    /** Exactly one new row for the order's buyer, right text, none for anyone else. */
    private function assertBuyerNotified(string $step, int $jobId, int $mark, string $title, string $body): void
    {
        $order = Order::find(DeliveryJob::find($jobId)?->order_id);
        if (! $order) {
            $this->recordFail($step, "Order for job {$jobId} not found");
            return;
        }
        $mine   = BuyerNotification::where('id', '>', $mark)->where('buyer_id', $order->buyer_id)->get();
        $others = BuyerNotification::where('id', '>', $mark)->where('buyer_id', '!=', $order->buyer_id)->count();

        if ($mine->count() !== 1) {
            $this->recordFail($step, "Expected 1 new buyer notification, got {$mine->count()}");
            return;
        }
        $row = $mine->first();
        if ($row->title !== $title || $row->body !== $body || (int) ($row->data['order_id'] ?? 0) !== (int) $order->id) {
            $this->recordFail($step, "Got '{$row->title}' / '{$row->body}' / order_id=" . ($row->data['order_id'] ?? 'null'));
            return;
        }
        foreach (['shipping_phone', 'shipping_address'] as $pii) {
            $v = trim((string) $order->$pii);
            if ($v !== '' && (str_contains($row->body, $v) || str_contains($row->title, $v))) {
                $this->recordFail($step, "notification contains {$pii}");
                return;
            }
        }
        if ($others !== 0) {
            $this->recordFail($step, "{$others} notification(s) created for another buyer");
            return;
        }
        $this->recordPass($step, "1 buyer notification \"{$body}\", other buyers 0 ✓");
    }

    private function assertNoNewNotif(string $step, int $mark): void
    {
        $new = BuyerNotification::where('id', '>', $mark)->count();
        if ($new === 0) {
            $this->recordPass($step, 'no buyer notification on blocked/repeated call ✓');
        } else {
            $this->recordFail($step, "{$new} buyer notification(s) created on blocked/repeated call");
        }
    }

    // ── Safety check ──────────────────────────────────────────────────────────

    /** Fingerprint of a whole table (row count + md5 of all rows). Demo-size tables only. */
    private function tableFingerprint(string $table): ?string
    {
        if (! Schema::hasTable($table)) {
            return null;
        }
        $rows = DB::table($table)->orderBy('id')->get();
        return $rows->count() . ':' . md5($rows->toJson());
    }

    private function safetySnapshot(): array
    {
        if (! Schema::hasTable('orders')) {
            return [];
        }
        $ids = User::whereIn('email', [
            'demo.buyer.rider@mimoo-demo.test',
            'demo.courier@mimoo-demo.test',
        ])->pluck('id')->toArray();

        $orders = Order::where(fn ($q) => $q->whereIn('buyer_id', $ids)->orWhereIn('assigned_courier_id', $ids))
            ->get(['id', 'status', 'payment_status'])
            ->keyBy('id')
            ->map(fn ($o) => ['status' => $o->status, 'payment_status' => $o->payment_status])
            ->toArray();

        return [
            'orders'               => $orders,
            'shipment_scans'       => $this->tableFingerprint('shipment_scans'),
            'shipment_assignments' => $this->tableFingerprint('shipment_assignments'),
        ];
    }

    private function runSafetyCheck(array $before): void
    {
        if (empty($before) || empty($before['orders'])) {
            $this->recordSkip('SAFETY', 'No snapshot (no demo orders found).');
            return;
        }

        // shipment_scans / shipment_assignments: byte-for-byte unchanged.
        foreach (['shipment_scans' => 'SAFETY-scans', 'shipment_assignments' => 'SAFETY-assignments'] as $table => $step) {
            $now = $this->tableFingerprint($table);
            if ($before[$table] === null && $now === null) {
                $this->recordSkip($step, "{$table} table not present");
            } elseif ($now === $before[$table]) {
                $this->recordPass($step, "{$table} unchanged ({$now}) ✓");
            } else {
                $this->recordFail($step, "{$table} changed {$before[$table]} → {$now}");
            }
        }

        // orders.status / payment_status: unchanged. (tracking_* is now expected to change.)
        $after   = Order::whereIn('id', array_keys($before['orders']))
            ->get(['id', 'status', 'payment_status'])
            ->keyBy('id');
        $allGood = true;

        foreach ($before['orders'] as $id => $snap) {
            $a = $after->get($id);
            if (! $a) {
                continue;
            }
            foreach (['status', 'payment_status'] as $col) {
                if (($a->$col ?? null) !== ($snap[$col] ?? null)) {
                    $this->recordFail("SAFETY-{$id}-{$col}", "orders.{$col} changed '{$snap[$col]}' → '{$a->$col}'");
                    $allGood = false;
                }
            }
        }

        if ($allGood) {
            $this->recordPass('SAFETY-orders', 'orders.status/payment_status unchanged on ' . count($before['orders']) . ' demo orders ✓');
        }
    }

    // ── Kernel helpers ────────────────────────────────────────────────────────

    private function apiCall(string $method, string $path, array $body = [], bool $auth = true): \Symfony\Component\HttpFoundation\Response
    {
        $url     = self::BASE . $path;
        $headers = ['Accept' => 'application/json'];
        if ($auth && $this->token) {
            $headers['Authorization'] = 'Bearer ' . $this->token;
        }

        $server  = array_merge(['HTTP_ACCEPT' => 'application/json'], $this->toServer($headers));
        $content = ($method === 'POST' && ! empty($body)) ? json_encode($body) : null;

        $req = IlluminateRequest::create($url, strtoupper($method), $body, [], [], $server, $content);
        if ($content) {
            $req->headers->set('Content-Type', 'application/json');
        }

        /** @var HttpKernel $kernel */
        $kernel   = app(HttpKernel::class);
        $response = $kernel->handle($req);
        $kernel->terminate($req, $response);

        return $response;
    }

    private function callMultipart(string $path, UploadedFile $file): \Symfony\Component\HttpFoundation\Response
    {
        $server = array_merge(
            ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'multipart/form-data'],
            $this->toServer(['Authorization' => 'Bearer ' . $this->token])
        );
        $req = IlluminateRequest::create(self::BASE . $path, 'POST', [], [], ['photo' => $file], $server);

        /** @var HttpKernel $kernel */
        $kernel   = app(HttpKernel::class);
        $response = $kernel->handle($req);
        $kernel->terminate($req, $response);

        return $response;
    }

    private function toServer(array $headers): array
    {
        $s = [];
        foreach ($headers as $k => $v) {
            $s['HTTP_' . strtoupper(str_replace('-', '_', $k))] = $v;
        }
        return $s;
    }

    private function msg(\Symfony\Component\HttpFoundation\Response $r): string
    {
        $b = json_decode($r->getContent(), true);
        return $b['message'] ?? substr($r->getContent(), 0, 100);
    }

    // ── Result helpers ────────────────────────────────────────────────────────

    private function recordPass(string $step, string $note): void
    {
        $this->results[] = [$step, 'PASS', $note];
        $this->passed++;
        $this->line("  ✅ {$step}: {$note}");
    }

    private function recordFail(string $step, string $note): void
    {
        $this->results[] = [$step, 'FAIL', $note];
        $this->failed++;
        $this->line("  ❌ {$step}: {$note}");
    }

    private function recordSkip(string $step, string $note): void
    {
        $this->results[] = [$step, 'SKIP', $note];
        $this->skipped++;
        $this->line("  ⏭  {$step}: {$note}");
    }

    private function printResults(): void
    {
        $this->line('');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->info('  Results');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->table(['Step', 'Result', 'Note'], array_map(fn ($r) => $r, $this->results));
        $this->line('');
        $total = $this->passed + $this->failed + $this->skipped;
        $this->line("  Total: {$total}  ✅ Passed: {$this->passed}  ❌ Failed: {$this->failed}  ⏭  Skipped: {$this->skipped}");
        if ($this->failed > 0) {
            $this->error('  OVERALL: FAIL');
        } else {
            $this->info('  OVERALL: PASS');
        }
        $this->line('');
    }

    // ── 1×1 transparent PNG ───────────────────────────────────────────────────

    private function tinyPng(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
}
