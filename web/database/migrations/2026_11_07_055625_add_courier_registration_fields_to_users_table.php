<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // New courier-specific contact numbers (keep existing contact_number for system use)
            $table->string('company_contact_number')->nullable()->after('company_logo');
            $table->string('rep_contact_number')->nullable()->after('company_contact_number');
            
            // Business email (separate from login email)
            $table->string('business_email')->nullable()->after('email');
            
            // Username (optional, for display; login still uses email)
            $table->string('username')->nullable()->unique()->after('email');
            
            // Business address (separate from representative's personal address)
            $table->text('business_address')->nullable()->after('company_logo');
            
            // Representative full name (as typed, not split)
            $table->string('rep_full_name')->nullable()->after('rep_contact_number');
            
            // Service coverage split into three separate JSON arrays
            $table->json('regions_served')->nullable()->after('service_areas');
            $table->json('provinces_served')->nullable()->after('regions_served');
            $table->json('cities_served')->nullable()->after('provinces_served');
            
            // Operating permits (separate from seller's bir_2303)
            $table->string('operating_permits')->nullable()->after('proof_of_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'company_contact_number',
                'rep_contact_number',
                'business_email',
                'username',
                'business_address',
                'rep_full_name',
                'regions_served',
                'provinces_served',
                'cities_served',
                'operating_permits',
            ]);
        });
    }
};
