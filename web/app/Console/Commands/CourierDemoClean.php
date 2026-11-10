<?php

namespace App\Console\Commands;

use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use App\Models\ShipmentScan;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * courier:demo-clean
 *
 * Removes only the data created by courier:demo-seed for the given demo email:
 * scans, assignment history, assignments, personnel, facilities and the demo
 * account. Real orders and real accounts are never touched.
 */
class CourierDemoClean extends Command
{
    protected $signature = 'courier:demo-clean
        {--email=courier.demo@mimoo.test : Demo courier email used when seeding}
        {--keep-account : Keep the demo user account, remove only its demo data}
        {--force : Run without confirmation}';

    protected $description = 'Remove demo courier data created by courier:demo-seed (safe, scoped to the demo email)';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->option('email')));

        $courier = User::where('email', $email)->first();

        if (! $courier) {
            $this->info("No demo courier found for {$email}. Nothing to clean.");
            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm("Remove demo data for {$email}?")) {
            return self::SUCCESS;
        }

        $counts = [
            'scans'       => 0,
            'history'     => 0,
            'assignments' => 0,
            'personnel'   => 0,
            'facilities'  => 0,
            'account'     => 0,
        ];

        DB::beginTransaction();

        try {
            $counts['scans'] = ShipmentScan::where('courier_id', $courier->id)->delete();

            $assignmentIds = ShipmentAssignment::where('courier_id', $courier->id)->pluck('id');

            if ($assignmentIds->isNotEmpty()) {
                $counts['history'] = ShipmentAssignmentHistory::whereIn('assignment_id', $assignmentIds)->delete();
            }

            $counts['assignments'] = ShipmentAssignment::where('courier_id', $courier->id)->delete();

            $counts['personnel'] = CourierPersonnel::where('courier_id', $courier->id)->delete();

            // Remove children before parents to satisfy the self-referencing FK.
            CourierFacility::where('courier_id', $courier->id)
                ->whereNotNull('parent_facility_id')
                ->delete();

            $counts['facilities'] = CourierFacility::where('courier_id', $courier->id)->delete();

            if (! $this->option('keep-account')) {
                $counts['account'] = User::where('id', $courier->id)->delete();
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Demo clean failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->info('Demo courier data removed.');
        $this->line("Scans removed: {$counts['scans']}");
        $this->line("History entries removed: {$counts['history']}");
        $this->line("Assignments removed: {$counts['assignments']}");
        $this->line("Personnel removed: {$counts['personnel']}");
        $this->line("Facilities removed: {$counts['facilities']}");
        $this->line("Account removed: {$counts['account']}");

        return self::SUCCESS;
    }
}
