<?php

namespace App\Console\Commands;

use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use App\Models\User;
use Illuminate\Console\Command;

class TestRemoveShipmentAssignments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:remove-shipment-assignments {courier_id?} {--all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'TEST ONLY: Remove test shipment assignments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->warn('⚠️  TEST COMMAND - FOR DEVELOPMENT ONLY');
        
        if ($this->option('all')) {
            $this->warn('This will remove ALL shipment assignments!');
            
            if (!$this->confirm('Are you absolutely sure?')) {
                return 0;
            }

            $count = ShipmentAssignment::count();
            ShipmentAssignmentHistory::truncate();
            ShipmentAssignment::truncate();
            
            $this->info("✅ Removed {$count} shipment assignments!");
            return 0;
        }

        // Get courier ID
        $courierId = $this->argument('courier_id');
        
        if (!$courierId) {
            // Show available couriers
            $couriers = User::where('account_type', 'logistics')
                ->whereHas('shipmentAssignments')
                ->withCount('shipmentAssignments')
                ->get(['id', 'company_name', 'email']);
            
            if ($couriers->isEmpty()) {
                $this->error('No couriers with assignments found!');
                return 1;
            }

            $this->info('Couriers with assignments:');
            foreach ($couriers as $courier) {
                $this->line("  ID: {$courier->id} - {$courier->company_name} ({$courier->shipment_assignments_count} assignments)");
            }
            
            $courierId = $this->ask('Enter courier ID');
        }

        $courier = User::find($courierId);

        if (!$courier) {
            $this->error("Courier ID {$courierId} not found!");
            return 1;
        }

        $assignments = ShipmentAssignment::where('courier_id', $courier->id)->get();
        
        if ($assignments->isEmpty()) {
            $this->warn("No assignments found for {$courier->company_name}");
            return 0;
        }

        $this->warn("This will remove {$assignments->count()} assignments for: {$courier->company_name}");
        
        if (!$this->confirm('Continue?')) {
            return 0;
        }

        $count = 0;
        foreach ($assignments as $assignment) {
            $assignment->history()->delete();
            $assignment->delete();
            $count++;
        }

        $this->info("✅ Removed {$count} shipment assignments!");

        return 0;
    }
}
