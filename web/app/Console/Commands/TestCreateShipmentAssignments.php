<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestCreateShipmentAssignments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:create-shipment-assignments {courier_id?} {--count=5}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'TEST ONLY: Create sample shipment assignments for a courier account';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->warn('⚠️  TEST COMMAND - FOR DEVELOPMENT ONLY');
        $this->warn('This will create fake shipment assignments.');
        
        if (!$this->confirm('Continue?')) {
            return 0;
        }

        // Get courier ID
        $courierId = $this->argument('courier_id');
        
        if (!$courierId) {
            // Show available couriers
            $couriers = User::where('account_type', 'logistics')
                ->where('status', 'approved')
                ->get(['id', 'company_name', 'email']);
            
            if ($couriers->isEmpty()) {
                $this->error('No approved courier accounts found!');
                return 1;
            }

            $this->info('Available courier accounts:');
            foreach ($couriers as $courier) {
                $this->line("  ID: {$courier->id} - {$courier->company_name} ({$courier->email})");
            }
            
            $courierId = $this->ask('Enter courier ID');
        }

        $courier = User::where('id', $courierId)
            ->where('account_type', 'logistics')
            ->where('status', 'approved')
            ->first();

        if (!$courier) {
            $this->error("Courier ID {$courierId} not found or not approved!");
            return 1;
        }

        $this->info("Creating shipment assignments for: {$courier->company_name}");

        // Get a logistics admin to assign from (or use first user)
        $admin = User::where('account_type', 'logistics')->first() ?? User::first();

        // Get or create orders with waybills
        $orders = Order::whereNotNull('waybill_number')
            ->whereDoesntHave('activeAssignment')
            ->limit($this->option('count'))
            ->get();

        if ($orders->isEmpty()) {
            $this->error('No orders with waybills available! Generate waybills first.');
            return 1;
        }

        $count = 0;
        $statusOptions = ['pending', 'accepted', 'rejected'];
        $weights = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0];
        $dimensions = ['30x20x10 cm', '40x30x15 cm', '25x25x20 cm', '50x40x30 cm'];

        foreach ($orders as $order) {
            $status = $statusOptions[array_rand($statusOptions)];
            $assignedAt = now()->subDays(rand(0, 7))->subHours(rand(0, 23));
            $deadline = $assignedAt->copy()->addHours(24);

            $assignment = ShipmentAssignment::create([
                'order_id' => $order->id,
                'courier_id' => $courier->id,
                'assigned_by' => $admin->id,
                'assigned_at' => $assignedAt,
                'assignment_status' => $status,
                'accepted_at' => $status === 'accepted' ? $assignedAt->copy()->addHours(rand(1, 12)) : null,
                'rejected_at' => $status === 'rejected' ? $assignedAt->copy()->addHours(rand(1, 12)) : null,
                'rejection_reason' => $status === 'rejected' ? 'Out of service area (TEST DATA)' : null,
                'acceptance_deadline' => $deadline,
                'weight' => $weights[array_rand($weights)],
                'dimensions' => $dimensions[array_rand($dimensions)],
                'pickup_instructions' => rand(0, 1) ? 'Please call seller before pickup. Office hours: 9AM-5PM.' : null,
            ]);

            // Create history
            $assignment->addHistory('assigned', $admin->id);

            if ($status === 'accepted') {
                $assignment->addHistory('accepted', $courier->id);
            } elseif ($status === 'rejected') {
                $assignment->addHistory('rejected', $courier->id, 'Out of service area (TEST DATA)');
            }

            $count++;
            $this->line("  ✓ Created assignment for Order #{$order->id} (Waybill: {$order->waybill_number}) - Status: {$status}");
        }

        $this->newLine();
        $this->info("✅ Created {$count} test shipment assignments!");
        $this->info("Courier: {$courier->company_name} (ID: {$courier->id})");
        $this->newLine();
        $this->warn('To remove test data, run: php artisan test:remove-shipment-assignments ' . $courier->id);

        return 0;
    }
}
