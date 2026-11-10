<?php

namespace App\Console\Commands;

use App\Models\CourierPersonnel;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * artisan rider:demo-clean
 *
 * Removes ONLY the rows created by rider:demo-seed.
 * Identified by email domain "@mimoo-demo.test".
 * Shows counts before and after.
 */
class RiderDemoClean extends Command
{
    protected $signature   = 'rider:demo-clean';
    protected $description = 'Remove DEMO data created by rider:demo-seed.';

    public function handle(): int
    {
        $demoEmails = [
            'demo.rider@mimoo-demo.test',
            'demo.buyer.rider@mimoo-demo.test',
            'demo.courier@mimoo-demo.test',
        ];

        $demoUserIds = User::whereIn('email', $demoEmails)->pluck('id')->toArray();

        if (empty($demoUserIds)) {
            $this->info('No demo rider data found. Nothing to clean.');
            return 0;
        }

        DB::transaction(function () use ($demoUserIds, $demoEmails) {
            // 1. Shipment assignment history (FK cascade should handle it, but be explicit)
            $assignmentIds = ShipmentAssignment::whereIn('courier_id', $demoUserIds)->pluck('id');
            if ($assignmentIds->isNotEmpty()) {
                DB::table('shipment_assignment_history')
                    ->whereIn('assignment_id', $assignmentIds)
                    ->delete();
                $aCount = ShipmentAssignment::whereIn('courier_id', $demoUserIds)->delete();
                $this->line("  Deleted {$aCount} shipment assignment(s).");
            }

            // 2. Orders
            $orderCount = Order::whereIn('buyer_id', $demoUserIds)
                ->orWhereIn('assigned_courier_id', $demoUserIds)
                ->delete();
            $this->line("  Deleted {$orderCount} order(s).");

            // 3. Personnel (FK user_id set null on users delete, but delete explicitly)
            $pCount = CourierPersonnel::whereIn('courier_id', $demoUserIds)
                ->orWhereIn('user_id', $demoUserIds)
                ->delete();
            $this->line("  Deleted {$pCount} personnel row(s).");

            // 4. Sanctum tokens
            DB::table('personal_access_tokens')
                ->whereIn('tokenable_id', $demoUserIds)
                ->delete();

            // 5. Users
            $uCount = User::whereIn('email', $demoEmails)->delete();
            $this->line("  Deleted {$uCount} user(s).");
        });

        $this->info('✅ Rider demo data cleaned.');
        return 0;
    }
}
