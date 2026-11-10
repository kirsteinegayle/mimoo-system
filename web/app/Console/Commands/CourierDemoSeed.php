<?php

namespace App\Console\Commands;

use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\Order;
use App\Models\ShipmentAssignment;
use App\Models\ShipmentAssignmentHistory;
use App\Models\ShipmentScan;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * courier:demo-seed
 *
 * Creates a clearly-marked demo courier account plus facilities, personnel,
 * shipment assignments, pickup states and facility scans. Existing orders are
 * reused (never modified) and only orders without an active assignment are
 * picked. Everything created here can be removed with courier:demo-clean.
 *
 * The password is supplied by the operator and is never printed.
 */
class CourierDemoSeed extends Command
{
    protected $signature = 'courier:demo-seed
        {--email=courier.demo@mimoo.test : Demo courier login email}
        {--password= : Demo courier password (min 8 chars). Required when creating a new account.}
        {--count=12 : Maximum number of orders to assign}
        {--force : Run without confirmation}';

    protected $description = 'Seed a demo courier account, facilities, personnel, assignments and scans (safe, reversible)';

    private const DEMO_TAG = '[DEMO]';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm('Create demo courier data? Existing orders are only read.')) {
            return self::SUCCESS;
        }

        $email = strtolower(trim((string) $this->option('email')));
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('A valid --email is required.');
            return self::FAILURE;
        }

        $password = (string) $this->option('password');
        $existing = User::where('email', $email)->first();

        if (! $existing && strlen($password) < 8) {
            $this->error('Creating a new demo account requires --password with at least 8 characters (it will not be shown).');
            return self::FAILURE;
        }

        $created = [
            'account'     => 0,
            'facilities'  => 0,
            'personnel'   => 0,
            'assignments' => 0,
            'history'     => 0,
            'scans'       => 0,
        ];

        DB::beginTransaction();

        try {
            $courier = $this->seedAccount($email, $password, $created);
            $facilities = $this->seedFacilities($courier, $created);
            $personnel = $this->seedPersonnel($courier, $created);

            $this->seedAssignments($courier, $facilities, $personnel, $created);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Demo seed failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Demo courier data ready.');
        $this->line("Courier email: {$email}");
        $this->line('Courier ID: ' . $courier->id);
        $this->line("Accounts created: {$created['account']}");
        $this->line("Facilities created: {$created['facilities']}");
        $this->line("Personnel created: {$created['personnel']}");
        $this->line("Assignments created: {$created['assignments']}");
        $this->line("History entries created: {$created['history']}");
        $this->line("Scans created: {$created['scans']}");
        $this->newLine();
        $this->line('Remove with: php artisan courier:demo-clean --email=' . $email);

        return self::SUCCESS;
    }

    private function seedAccount(string $email, string $password, array &$created): User
    {
        $courier = User::where('email', $email)->first();

        $attributes = [
            'name'             => 'DEMO Courier Co.',
            'first_name'       => 'Demo',
            'last_name'        => 'Courier',
            'contact_first_name' => 'Demo',
            'contact_last_name'  => 'Courier',
            'account_type'     => 'logistics',
            'role'             => 'courier',
            'status'           => 'approved',
            'verification_status' => 'verified',
            'approved_at'      => now(),
            'company_name'     => 'DEMO Courier Co.',
            'business_name'    => 'DEMO Courier Co.',
            'contact_number'   => '09170000000',
            'company_contact_number' => '09170000000',
            'business_email'   => $email,
            'region'           => 'NCR',
            'province'         => 'Metro Manila',
            'municipality_city'=> 'Quezon City',
            'barangay'         => 'Barangay Demo',
            'street_address'   => '123 Demo Street',
            'cities_served'    => ['Quezon City', 'Makati', 'Pasig'],
            'service_areas'    => ['Quezon City', 'Makati', 'Pasig'],
            'pickup_available' => true,
        ];

        if (! $courier) {
            $attributes['email']    = $email;
            $attributes['password'] = $password;
            $courier = User::create($attributes);
            $created['account']++;
        } else {
            if ($password !== '') {
                $attributes['password'] = $password;
            }
            $courier->update($attributes);
        }

        $courier->forceFill(['email_verified_at' => now()])->save();

        return $courier;
    }

    private function seedFacilities(User $courier, array &$created): array
    {
        $definitions = [
            ['Main Hub', 'Demo Main Hub', 'Quezon City', 'NCR', 'Metro Manila'],
            ['Sorting Hub', 'Demo Sorting Hub', 'Quezon City', 'NCR', 'Metro Manila'],
            ['Branch', 'Demo Makati Branch', 'Makati', 'NCR', 'Metro Manila'],
            ['Branch', 'Demo Pasig Branch', 'Pasig', 'NCR', 'Metro Manila'],
        ];

        $facilities = [];
        $parentId = null;

        foreach ($definitions as $index => [$type, $name, $city, $region, $province]) {
            $fullName = self::DEMO_TAG . ' ' . $name;

            $facility = CourierFacility::where('courier_id', $courier->id)
                ->where('facility_name', $fullName)
                ->first();

            if (! $facility) {
                $prefix = match ($type) {
                    'Main Hub'    => 'HUB',
                    'Sorting Hub' => 'SRT',
                    default       => 'BRN',
                };

                $facility = CourierFacility::create([
                    'courier_id'         => $courier->id,
                    'facility_name'      => $fullName,
                    'facility_code'      => 'DMO-' . $courier->id . '-' . $prefix . '-' . ($index + 1),
                    'facility_type'      => $type,
                    'parent_facility_id' => $type === 'Main Hub' ? null : $parentId,
                    'status'             => 'Active',
                    'region'             => $region,
                    'province'           => $province,
                    'city'               => $city,
                    'address'            => "{$index} Demo Facility Road, {$city}",
                    'manager_name'       => 'Demo Manager ' . ($index + 1),
                    'contact_number'     => '0917123456' . $index,
                    'coverage_cities'    => [$city, 'Quezon City'],
                ]);

                $created['facilities']++;
            }

            if ($type === 'Main Hub') {
                $parentId = $facility->id;
            }

            $facilities[$type] = $facility;
        }

        return $facilities;
    }

    private function seedPersonnel(User $courier, array &$created): array
    {
        $definitions = [
            ['Demo Rider One', 'rider', '09171111111'],
            ['Demo Rider Two', 'rider', '09172222222'],
            ['Demo Driver One', 'driver', '09173333333'],
        ];

        $personnel = [];

        foreach ($definitions as [$name, $role, $contact]) {
            $person = CourierPersonnel::where('courier_id', $courier->id)
                ->where('name', self::DEMO_TAG . ' ' . $name)
                ->first();

            if (! $person) {
                $person = CourierPersonnel::create([
                    'courier_id'     => $courier->id,
                    'name'           => self::DEMO_TAG . ' ' . $name,
                    'contact_number' => $contact,
                    'role'           => $role,
                    'status'         => 'active',
                ]);

                $created['personnel']++;
            }

            $personnel[] = $person;
        }

        return $personnel;
    }

    private function seedAssignments(User $courier, array $facilities, array $personnel, array &$created): void
    {
        $limit = max(1, (int) $this->option('count'));

        $orders = Order::whereNotNull('waybill_number')
            ->whereDoesntHave('shipmentAssignments')
            ->orderBy('id')
            ->limit($limit)
            ->get();

        if ($orders->isEmpty()) {
            $this->warn('No orders with waybills and no active assignment were found; only account/facilities/personnel were seeded.');
            return;
        }

        $windows = ['8AM-10AM', '10AM-12PM', '12PM-2PM', '2PM-4PM', '4PM-6PM'];
        $hub = $facilities['Main Hub'] ?? reset($facilities);

        foreach ($orders as $i => $order) {
            $scenario = $i % 7;

            $assignmentStatus = match ($scenario) {
                6       => 'rejected',
                default => $scenario === 0 ? 'pending' : 'accepted',
            };

            $pickupStatus = match ($scenario) {
                1       => 'pending_pickup',
                2       => 'scheduled',
                3       => 'picked_up',
                4       => 'failed',
                5       => 'cancelled',
                default => 'pending_pickup',
            };

            $assignedAt = now()->subDays($i % 5)->subHours(($i * 3) % 12);

            $assignment = ShipmentAssignment::create([
                'order_id'              => $order->id,
                'courier_id'            => $courier->id,
                'assigned_by'           => $courier->id,
                'assigned_at'           => $assignedAt,
                'assignment_status'     => $assignmentStatus,
                'accepted_at'           => $assignmentStatus === 'accepted' ? $assignedAt->copy()->addHour() : null,
                'rejected_at'           => $assignmentStatus === 'rejected' ? $assignedAt->copy()->addHours(2) : null,
                'rejection_reason'      => $assignmentStatus === 'rejected' ? 'Out of service area (DEMO DATA)' : null,
                'acceptance_deadline'   => $scenario === 0
                    ? now()->addMinutes(30 + ($i * 5))
                    : $assignedAt->copy()->addHours(24),
                'weight'                => [0.5, 1.0, 2.5, 5.0][$i % 4],
                'dimensions'            => ['30x20x10 cm', '40x30x15 cm', '50x40x30 cm'][$i % 3],
                'pickup_instructions'   => $i % 2 === 0
                    ? 'Call seller before pickup. Office hours: 9AM-5PM. (DEMO DATA)'
                    : 'No special instructions (DEMO DATA)',
                'pickup_status'         => $pickupStatus,
                'scheduled_date'        => in_array($pickupStatus, ['scheduled'], true)
                    ? today()->addDay()
                    : ($pickupStatus === 'picked_up' ? today()->subDay() : null),
                'scheduled_time_window' => in_array($pickupStatus, ['scheduled', 'picked_up'], true)
                    ? $windows[$i % count($windows)]
                    : null,
                'assigned_personnel_id' => in_array($pickupStatus, ['scheduled', 'picked_up', 'failed'], true)
                    ? $personnel[$i % count($personnel)]->id
                    : null,
                'picked_up_at'          => $pickupStatus === 'picked_up' ? now()->subDay() : null,
                'picked_up_by'          => $pickupStatus === 'picked_up' ? $courier->id : null,
                'attempt_count'         => $pickupStatus === 'failed' ? 1 : 0,
                'last_attempt_at'       => $pickupStatus === 'failed' ? now()->subHours(3) : null,
                'cancellation_reason'   => $pickupStatus === 'cancelled'
                    ? 'Seller unavailable (DEMO DATA)'
                    : null,
                'failure_reason'        => $pickupStatus === 'failed'
                    ? 'Seller not ready (DEMO DATA)'
                    : null,
            ]);

            $created['assignments']++;

            $historyRows = [['assigned', $courier->id, 'DEMO assignment']];

            if ($assignmentStatus === 'accepted') {
                $historyRows[] = ['accepted', $courier->id, null];
            } elseif ($assignmentStatus === 'rejected') {
                $historyRows[] = ['rejected', $courier->id, 'Out of service area (DEMO DATA)'];
            }

            if ($pickupStatus === 'scheduled') {
                $historyRows[] = ['re-assigned', $courier->id, 'Scheduled for ' . $windows[$i % count($windows)] . ' (DEMO DATA)'];
            } elseif ($pickupStatus === 'picked_up') {
                $historyRows[] = ['accepted', $courier->id, 'Pickup confirmed (DEMO DATA)'];
            } elseif ($pickupStatus === 'failed') {
                $historyRows[] = ['rejected', $courier->id, 'Pickup failed: Seller not ready (DEMO DATA)'];
            } elseif ($pickupStatus === 'cancelled') {
                $historyRows[] = ['rejected', $courier->id, 'Pickup cancelled: Seller unavailable (DEMO DATA)'];
            }

            foreach ($historyRows as [$action, $userId, $notes]) {
                ShipmentAssignmentHistory::create([
                    'assignment_id' => $assignment->id,
                    'action'        => $action,
                    'performed_by'  => $userId,
                    'notes'         => $notes,
                    'created_at'    => $assignedAt,
                ]);
                $created['history']++;
            }

            if ($pickupStatus === 'picked_up' && $hub) {
                $alreadyScanned = ShipmentScan::where('order_id', $order->id)
                    ->where('courier_id', $courier->id)
                    ->exists();

                if (! $alreadyScanned) {
                    ShipmentScan::create([
                        'order_id'       => $order->id,
                        'waybill_number' => $order->waybill_number,
                        'courier_id'     => $courier->id,
                        'facility_id'    => $hub->id,
                        'scan_type'      => 'received',
                        'scanned_by'     => 'DEMO Rider One',
                        'notes'          => 'DEMO DATA',
                    ]);
                    $created['scans']++;
                }
            }
        }
    }
}
