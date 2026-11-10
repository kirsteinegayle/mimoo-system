<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class RestoreCourierSeeder extends Seeder
{
    public function run(): void
    {
        // Restore Courier Account
        User::create([
            'name' => 'Kimmi Courier Services Inc.',
            'email' => 'kiro2292222@gmail.com',
            'password' => Hash::make('Password123!'), // Change this to your actual password
            'email_verified_at' => now(),
            'account_type' => 'logistics', // Use 'logistics' as the account type
            'role' => 'courier', // Role is 'courier'
            'status' => 'approved',
            
            // Courier company details
            'company_name' => 'Kimmi Courier Services Inc.',
            'business_name' => 'Kimmi Courier',
            'contact_first_name' => 'Kimmi',
            'contact_last_name' => 'Admin',
            'contact_number' => '09123456789',
            
            // Add other fields as needed
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $this->command->info('✅ Courier account restored: kiro2292222@gmail.com');
        $this->command->info('📧 Email: kiro2292222@gmail.com');
        $this->command->info('🔑 Password: Password123! (CHANGE THIS IF DIFFERENT)');
    }
}
