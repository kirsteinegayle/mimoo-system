<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\RiderDeliveryController;
use App\Models\DeliveryJob;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * php artisan status-sync:check
 *
 * Rollback-only check of the P3 rider -> orders.status sync and the
 * updated_at-preserving Order::updateTracking().
 *
 * Runs the REAL RiderDeliveryController::writeTracking() (lock order, sync
 * status, write tracking) for every rider event against one existing order
 * that is put into each case (in_transit, shipped, completed, cancelled,
 * in_transit + open return) INSIDE one transaction that is ALWAYS rolled back.
 * Before each event, status / updated_at are reset with a raw query, with
 * updated_at set 3 days back so any bump is visible.
 *
 * Net effect: no data change, no files created.
 */
class StatusSyncCheck extends Command
{
    protected $signature   = 'status-sync:check {--order= : orders.id to use as the fixture (default: first order)}';
    protected $description = 'Rollback-only check: rider events -> orders.status sync, payment_status and updated_at';

    private int $passed = 0;
    private int $failed = 0;
    private array $rows = [];

    public function handle(): int
    {
        $order = $this->option('order')
            ? Order::find((int) $this->option('order'))
            : Order::orderBy('id')->first();
        if (! $order) {
            $this->error('No order found.');
            return self::FAILURE;
        }
        $this->info("Fixture order #{$order->id} (real status {$order->status}, payment_status {$order->payment_status}) - all changes rolled back.");

        $original = DB::table('orders')->where('id', $order->id)->first();

        $events = [
            RiderDeliveryController::TRACK_OUT_FOR_DELIVERY,
            RiderDeliveryController::TRACK_DELIVERED,
            RiderDeliveryController::TRACK_FAILED,
            RiderDeliveryController::TRACK_RETURNING,
        ];
        // case label => [status, open return?]
        $cases = [
            'in_transit'              => ['in_transit', false],
            'shipped'                 => ['shipped', false],
            'completed'               => ['completed', false],
            'cancelled'               => ['cancelled', false],
            'in_transit + open return' => ['in_transit', true],
        ];

        $ctrl  = app(RiderDeliveryController::class);
        $write = new \ReflectionMethod($ctrl, 'writeTracking');
        $write->setAccessible(true);

        DB::beginTransaction();
        try {
            foreach ($cases as $label => [$status, $openReturn]) {
                DB::table('return_requests')->where('order_id', $order->id)->delete();
                if ($openReturn) {
                    DB::table('return_requests')->insert([
                        'order_id'    => $order->id,
                        'buyer_id'    => $order->buyer_id,
                        'reason'      => 'Other',
                        'description' => 'status-sync:check fixture',
                        'images'      => '[]',
                        'status'      => 'pending',
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]);
                }

                foreach ($events as $event) {
                    $base = now()->subDays(3)->startOfSecond();
                    DB::table('orders')->where('id', $order->id)->update([
                        'status'          => $status,
                        'updated_at'      => $base,
                        'tracking_status' => null,
                    ]);
                    $before = DB::table('orders')->where('id', $order->id)->first();

                    $job = (new DeliveryJob())->forceFill(['id' => 0, 'order_id' => $order->id]);
                    $write->invoke($ctrl, $job, $event, 'status-sync:check');

                    $after = DB::table('orders')->where('id', $order->id)->first();

                    $expectShip = $event === RiderDeliveryController::TRACK_OUT_FOR_DELIVERY
                        && $status === 'in_transit' && ! $openReturn;
                    $expStatus  = $expectShip ? 'shipped' : $status;

                    $okStatus   = $after->status === $expStatus;
                    $okPay      = $after->payment_status === $before->payment_status;
                    $bumped     = (string) $after->updated_at !== (string) $before->updated_at;
                    $okUpdated  = $expectShip ? $bumped : ! $bumped;
                    $okTracking = $after->tracking_status === $event;

                    $this->row($label, $event,
                        "{$before->status} -> {$after->status} (exp {$expStatus})",
                        $before->payment_status === $after->payment_status ? "{$after->payment_status} (same)" : "{$before->payment_status} -> {$after->payment_status}",
                        $bumped ? 'changed' : 'same',
                        $okStatus && $okPay && $okUpdated && $okTracking);
                }
            }

            // Other callers' pattern: update(other column) then updateTracking().
            $base = now()->subDays(3)->startOfSecond();
            DB::table('orders')->where('id', $order->id)->update(['status' => 'in_transit', 'updated_at' => $base]);
            $o = Order::find($order->id);
            $o->update(['courier_accepted_at' => now()]);
            $o->updateTracking('accepted_courier', 'status-sync:check');
            $after = DB::table('orders')->where('id', $order->id)->first();
            $this->row('caller pattern', 'update()+updateTracking', "{$after->status}", $after->payment_status,
                (string) $after->updated_at !== (string) $base ? 'changed' : 'same',
                (string) $after->updated_at !== (string) $base && $after->tracking_status === 'accepted_courier');

            // Dirty status left by a caller: normal save still bumps updated_at.
            DB::table('orders')->where('id', $order->id)->update(['status' => 'in_transit', 'updated_at' => $base]);
            $o = Order::find($order->id);
            $o->status = 'shipped';
            $o->updateTracking('received_logistics', 'status-sync:check');
            $after = DB::table('orders')->where('id', $order->id)->first();
            $this->row('dirty status', 'updateTracking', "in_transit -> {$after->status}", $after->payment_status,
                (string) $after->updated_at !== (string) $base ? 'changed' : 'same',
                $after->status === 'shipped' && (string) $after->updated_at !== (string) $base);
        } finally {
            DB::rollBack();
        }

        $restored = DB::table('orders')->where('id', $order->id)->first();
        $same     = json_encode($restored) === json_encode($original);
        $this->row('rollback', '-', $restored->status, $restored->payment_status,
            (string) $restored->updated_at === (string) $original->updated_at ? 'same' : 'changed', $same);

        $this->table(['Case', 'Event', 'orders.status', 'payment_status', 'updated_at', 'Result'], $this->rows);
        $this->line("Passed {$this->passed}, failed {$this->failed}. Rolled back; no files created.");

        return $this->failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function row(string $case, string $event, string $status, string $pay, string $updated, bool $ok): void
    {
        $ok ? $this->passed++ : $this->failed++;
        $this->rows[] = [$case, $event, $status, $pay, $updated, $ok ? 'PASS' : 'FAIL'];
    }
}
