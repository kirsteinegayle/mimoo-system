<?php

namespace App\Console\Commands;

use App\Models\CourierPersonnel;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * artisan rider:demo-seed
 *
 * Creates DEMO data for Stage 1 rider backend testing:
 *   - 1 courier company user (reuses existing demo courier if present)
 *   - 1 rider user (role=rider) linked to a courier_personnel row
 *   - 1 accepted shipment assignment assigned to that personnel
 *
 * All rows are tagged with a demo marker (name prefix "DEMO-" or email
 * "demo.rider@mimoo-demo.test") so rider:demo-clean can delete them precisely.
 *
 * Idempotent: skips if already seeded.
 */
class RiderDemoSeed extends Command
{
    protected $signature   = 'rider:demo-seed';
    protected $description = 'Seed DEMO data for the rider-app Stage 1 smoke test (idempotent).';

    public function handle(): int
    {
        // ── Already done? ─────────────────────────────────────────────────────
        if ($existing = User::where('email', 'demo.rider@mimoo-demo.test')->first()) {
            // Only refresh shift status so the courier can assign deliveries
            // (readyRiders() lists checked-in riders only). Nothing else changes.
            $n = CourierPersonnel::where('user_id', $existing->id)->where('status', 'active')
                ->update(['is_online' => true, 'last_checked_in_at' => now()]);
            $this->info('Rider demo data already seeded. Demo rider set online' . ($n ? '.' : ' (no active personnel row).'));
            return 0;
        }

        DB::transaction(function () {
            // ── 1. Courier company ─────────────────────────────────────────────
            $courier = User::where('email', 'demo.courier@mimoo-demo.test')->first();
            if (! $courier) {
                $courier = User::create([
                    'name'                 => 'DEMO-CourierCo',
                    'first_name'           => 'DEMO',
                    'last_name'            => 'CourierCo',
                    'email'                => 'demo.courier@mimoo-demo.test',
                    'password'             => Hash::make('Demo@1234!'),
                    'account_type'         => 'logistics',
                    'role'                 => 'courier',
                    'status'               => 'approved',
                    'verification_status'  => 'verified',
                    'company_name'         => 'DEMO Courier Company',
                ]);
                $this->line("  Created courier company: {$courier->email} (id={$courier->id})");
            } else {
                $this->line("  Reusing existing courier: {$courier->email} (id={$courier->id})");
            }

            // ── 2. Rider user ──────────────────────────────────────────────────
            $riderUser = User::create([
                'name'                => 'DEMO-Rider',
                'first_name'          => 'DEMO',
                'last_name'           => 'Rider',
                'email'               => 'demo.rider@mimoo-demo.test',
                'password'            => Hash::make('Demo@1234!'),
                'account_type'        => 'logistics',
                'role'                => 'rider',
                'status'              => 'approved',
                'verification_status' => 'verified',
            ]);
            $this->line("  Created rider user: {$riderUser->email} (id={$riderUser->id})");

            // ── 3. Personnel record ────────────────────────────────────────────
            $personnel = CourierPersonnel::create([
                'courier_id'     => $courier->id,
                'user_id'        => $riderUser->id,
                'name'           => 'DEMO-Rider Pedro',
                'contact_number' => '09001234567',
                'role'           => 'rider',
                'status'         => 'active',
                // Online so the demo courier sees this rider in delivery-riders.
                'is_online'          => true,
                'last_checked_in_at' => now(),
            ]);
            $this->line("  Created personnel: id={$personnel->id} (online)");

            // ── 4. Buyer + order (minimal) ────────────────────────────────────
            $buyer = User::where('email', 'demo.buyer.rider@mimoo-demo.test')->first();
            if (! $buyer) {
                $buyer = User::create([
                    'name'                => 'DEMO-BuyerForRider',
                    'first_name'          => 'DEMO',
                    'last_name'           => 'BuyerForRider',
                    'email'               => 'demo.buyer.rider@mimoo-demo.test',
                    'password'            => Hash::make('Demo@1234!'),
                    'account_type'        => 'buyer',
                    'role'                => 'buyer',
                    'status'              => 'approved',
                    'verification_status' => 'verified',
                    'municipality_city'   => 'Santa Cruz',
                ]);
            }

            $order = Order::create([
                'buyer_id'        => $buyer->id,
                // in_transit so rider:demo-delivery can turn it into a delivery job.
                'status'          => 'in_transit',
                'total'           => 500.00,
                'payment_method'  => 'cod',
                'shipping_name'   => 'DEMO Buyer',
                'shipping_address'=> '123 Demo St, Santa Cruz, Laguna',
                'shipping_phone'  => '09001234567',
                'waybill_number'  => 'MIMWB-DEMO-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                'waybill_generated_at' => now(),
                'assigned_courier_id'  => $courier->id,
            ]);
            $this->line("  Created demo order: id={$order->id}  waybill={$order->waybill_number}");

            // ── 5. Shipment assignment (accepted + scheduled + assigned to rider) ──
            $assignment = ShipmentAssignment::create([
                'order_id'               => $order->id,
                'courier_id'             => $courier->id,
                'assigned_by'            => $courier->id,
                'assigned_at'            => now()->subHours(2),
                'acceptance_deadline'    => now()->addHours(22),
                'assignment_status'      => 'accepted',
                'accepted_at'            => now()->subHour(),
                'pickup_status'          => 'scheduled',
                'scheduled_date'         => now()->addDay()->toDateString(),
                'scheduled_time_window'  => '9am-12pm',
                'assigned_personnel_id'  => $personnel->id,
                'weight'                 => 1.5,
                'pickup_instructions'    => 'DEMO: Ring the bell.',
            ]);
            $this->line("  Created assignment: id={$assignment->id}  pickup_status=scheduled");
        });

        $this->info('✅ Rider demo data seeded.');
        $this->line('   Login: demo.rider@mimoo-demo.test / Demo@1234!');
        $this->line('   Next: php artisan rider:demo-delivery  (creates a delivery job from the in_transit demo order)');
        $this->line('   Run rider:demo-clean to remove all DEMO rows.');

        return 0;
    }
}
