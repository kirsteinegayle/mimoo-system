<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** users.status was ENUM('pending','approved','disapproved'): add the admin account-control states. */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY status ENUM('pending','approved','disapproved','suspended','deactivated') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Anyone suspended/deactivated goes back to 'approved' so the narrower enum accepts every row.
        DB::statement("UPDATE users SET status = 'approved' WHERE status IN ('suspended','deactivated')");
        DB::statement("ALTER TABLE users MODIFY status ENUM('pending','approved','disapproved') NOT NULL DEFAULT 'pending'");
    }
};
