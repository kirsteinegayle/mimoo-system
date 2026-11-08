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
            // Step 1 missing fields
            $table->string('trade_name')->nullable()->after('company_name');
            $table->string('company_website')->nullable()->after('trade_name');
            $table->string('company_logo')->nullable()->after('company_website');
            
            // Step 3 missing field
            $table->string('proof_of_address')->nullable()->after('valid_id');
            
            // Step 4 missing fields
            $table->text('delivery_services')->nullable()->after('service_areas');
            $table->string('pickup_available')->nullable()->after('delivery_services');
            $table->string('estimated_delivery_time')->nullable()->after('pickup_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'trade_name',
                'company_website',
                'company_logo',
                'proof_of_address',
                'delivery_services',
                'pickup_available',
                'estimated_delivery_time',
            ]);
        });
    }
};
