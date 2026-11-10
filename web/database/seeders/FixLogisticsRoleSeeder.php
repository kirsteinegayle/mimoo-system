<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class FixLogisticsRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Update logistics company users to have 'logistics_staff' role instead of 'courier'
        User::where('account_type', 'logistics')
            ->where('role', 'courier')
            ->update(['role' => 'logistics_staff']);
        
        $this->command->info('✓ Updated logistics company users to have logistics_staff role');
    }
}
