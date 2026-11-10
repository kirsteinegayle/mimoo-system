<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider app: one payout line per completed job (pickup or delivery).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rider_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rider_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('delivery_job_id')->nullable()->unique()->constrained('delivery_jobs')->cascadeOnDelete();
            $table->foreignId('shipment_assignment_id')->nullable()->unique()->constrained('shipment_assignments')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('type', 20); // pickup | delivery
            $table->decimal('amount', 10, 2);
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->index(['rider_user_id', 'earned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rider_earnings');
    }
};
