<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add role column after account_type
            $table->string('role')->nullable()->after('account_type');
        });

        // Backfill existing users with appropriate roles
        // Buyers → buyer
        DB::table('users')
            ->where('account_type', 'buyer')
            ->update(['role' => 'buyer']);

        // Sellers → seller
        DB::table('users')
            ->where('account_type', 'seller')
            ->update(['role' => 'seller']);

        // Admin → admin
        DB::table('users')
            ->where('account_type', 'admin')
            ->update(['role' => 'admin']);

        // Logistics accounts need manual review
        // Default logistics accounts WITHOUT company registration details → logistics_staff
        // Logistics accounts WITH company_name or courier registration → courier
        
        // Set all logistics to logistics_staff by default (safer)
        DB::table('users')
            ->where('account_type', 'logistics')
            ->update(['role' => 'logistics_staff']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
