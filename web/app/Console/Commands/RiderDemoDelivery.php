<?php

namespace App\Console\Commands;

use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\RiderNotification;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * artisan rider:demo-delivery [--order=ID]
 *
 * DEMO ONLY. Creates an "assigned" delivery_jobs row for the demo rider
 * (demo.rider@mimoo-demo.test) from an EXISTING in_transit DEMO order.
 *
 * Read-only on orders: buyer/address/COD are read from the order; the order
 * row itself (status, payment_status, ...) is not changed. Writes only to the
 * new delivery_jobs and rider_notifications tables.
 *
 * Idempotent: an order that already has a delivery job is skipped.
 * Run rider:demo-seed first. rider:demo-clean removes these rows (FK cascade).
 */
class RiderDemoDelivery extends Command
{
    protected $signature   = 'rider:demo-delivery {--order= : Use this in_transit demo order id}';
    protected $description = 'DEMO: assign an in_transit demo order to the demo rider as a delivery job.';

    private const RIDER_EMAIL = 'demo.rider@mimoo-demo.test';
    private const DEMO_EMAILS = [
        'demo.buyer.rider@mimoo-demo.test',
        'demo.courier@mimoo-demo.test',
    ];

    public function handle(): int
    {
        if (! Schema::hasTable('delivery_jobs')) {
            $this->error('Table delivery_jobs does not exist. Run the rider migrations first.');
            return self::FAILURE;
        }

        $rider = User::where('email', self::RIDER_EMAIL)->first();
        if (! $rider) {
            $this->error('Demo rider not found. Run: php artisan rider:demo-seed');
            return self::FAILURE;
        }

        $personnel = CourierPersonnel::where('user_id', $rider->id)->where('status', 'active')->first();
        if (! $personnel) {
            $this->error('Demo rider has no active courier_personnel row. Run rider:demo-clean then rider:demo-seed.');
            return self::FAILURE;
        }

        // Only DEMO orders (demo buyer or demo courier), status in_transit, no job yet.
        $demoUserIds = User::whereIn('email', self::DEMO_EMAILS)->pluck('id');
        $query = Order::where('status', 'in_transit')
            ->where(fn ($q) => $q->whereIn('buyer_id', $demoUserIds)
                ->orWhereIn('assigned_courier_id', $demoUserIds))
            ->whereNotExists(fn ($q) => $q->select(DB::raw(1))
                ->from('delivery_jobs')
                ->whereColumn('delivery_jobs.order_id', 'orders.id'));

        if ($this->option('order')) {
            $query->where('id', (int) $this->option('order'));
        }

        $order = $query->orderBy('id')->first();
        if (! $order) {
            $this->warn('No in_transit DEMO order without a delivery job was found.');
            $this->line('  Tip: rider:demo-seed creates one (status in_transit).');
            return self::SUCCESS;
        }

        $codAmount = strtolower((string) $order->payment_method) === 'cod' ? (float) $order->total : 0.0;

        $job = DB::transaction(function () use ($order, $rider, $personnel, $codAmount) {
            $job = DeliveryJob::create([
                'order_id'      => $order->id,
                'rider_user_id' => $rider->id,
                'personnel_id'  => $personnel->id,
                'courier_id'    => $order->assigned_courier_id ?? $personnel->courier_id,
                'facility_id'   => $order->current_facility_id,
                'assigned_by'   => $personnel->courier_id,
                'status'        => DeliveryJob::STATUS_ASSIGNED,
                'cod_amount'    => $codAmount,
                'assigned_at'   => now(),
            ]);

            RiderNotification::notify(
                $rider->id,
                'delivery_assigned',
                'New delivery assigned',
                ($order->waybill_number ?? 'Order #' . $order->id) . ' · ' . ($order->shipping_address ?? ''),
                $job->id,
                $order->id
            );

            return $job;
        });

        $this->info('✅ Demo delivery job created.');
        $this->line("   job id={$job->id}  order id={$order->id}  waybill={$order->waybill_number}");
        $this->line('   COD: ₱' . number_format($codAmount, 2) . "  rider: {$rider->email}");

        return self::SUCCESS;
    }
}
