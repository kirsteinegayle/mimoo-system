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
        Schema::table('shipment_assignments', function (Blueprint $table) {
            // Pickup status - default 'pending_pickup' for ALL rows including pending/rejected
            // Queries MUST filter by assignment_status='accepted' to show only accepted shipments
            $table->enum('pickup_status', ['pending_pickup', 'scheduled', 'picked_up', 'failed', 'cancelled'])
                ->default('pending_pickup')
                ->after('assignment_status');
            
            // Schedule information
            $table->date('scheduled_date')->nullable()->after('pickup_status');
            $table->string('scheduled_time_window', 50)->nullable()->after('scheduled_date');
            
            // Personnel assignment
            $table->foreignId('assigned_personnel_id')
                ->nullable()
                ->after('scheduled_time_window')
                ->constrained('courier_personnel')
                ->onDelete('set null');
            
            // Pickup completion
            $table->timestamp('picked_up_at')->nullable()->after('assigned_personnel_id');
            $table->foreignId('picked_up_by')
                ->nullable()
                ->after('picked_up_at')
                ->constrained('users')
                ->onDelete('set null');
            
            // Attempt tracking
            $table->integer('attempt_count')->default(0)->after('picked_up_by');
            $table->timestamp('last_attempt_at')->nullable()->after('attempt_count');
            
            // Reasons
            $table->text('cancellation_reason')->nullable()->after('last_attempt_at');
            $table->text('failure_reason')->nullable()->after('cancellation_reason');
            
            // Indexes for performance
            $table->index('pickup_status');
            $table->index('scheduled_date');
            $table->index(['courier_id', 'assignment_status', 'pickup_status'], 'idx_courier_pickup_queries');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipment_assignments', function (Blueprint $table) {
            $table->dropIndex('idx_courier_pickup_queries');
            $table->dropIndex(['pickup_status']);
            $table->dropIndex(['scheduled_date']);
            
            $table->dropForeign(['picked_up_by']);
            $table->dropForeign(['assigned_personnel_id']);
            
            $table->dropColumn([
                'pickup_status',
                'scheduled_date',
                'scheduled_time_window',
                'assigned_personnel_id',
                'picked_up_at',
                'picked_up_by',
                'attempt_count',
                'last_attempt_at',
                'cancellation_reason',
                'failure_reason',
            ]);
        });
    }
};
