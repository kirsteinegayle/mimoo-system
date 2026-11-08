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
        Schema::table('orders', function (Blueprint $table) {
            // Add detailed tracking status for buyer visibility
            $table->string('tracking_status')->nullable()->after('status');
            $table->text('tracking_message')->nullable()->after('tracking_status');
            $table->timestamp('tracking_updated_at')->nullable()->after('tracking_message');
            
            // Track which courier is handling this order
            $table->foreignId('assigned_courier_id')->nullable()->after('tracking_updated_at')->constrained('users')->onDelete('set null');
            $table->timestamp('courier_assigned_at')->nullable()->after('assigned_courier_id');
            $table->timestamp('courier_accepted_at')->nullable()->after('courier_assigned_at');
            
            // Track current facility location
            $table->foreignId('current_facility_id')->nullable()->after('courier_accepted_at')->constrained('courier_facilities')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['assigned_courier_id']);
            $table->dropForeign(['current_facility_id']);
            $table->dropColumn([
                'tracking_status',
                'tracking_message',
                'tracking_updated_at',
                'assigned_courier_id',
                'courier_assigned_at',
                'courier_accepted_at',
                'current_facility_id',
            ]);
        });
    }
};
