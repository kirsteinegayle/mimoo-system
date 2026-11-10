<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider app: last-mile delivery job (hub -> buyer) for one order.
 *
 * NEW table only. Buyer, seller, address and COD are always READ through the
 * order (orders / order_items / users). This table stores only the rider-side
 * delivery state. orders.status and orders.payment_status are never touched.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_jobs', function (Blueprint $table) {
            $table->id();
            // One delivery job per order.
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->foreignId('rider_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('personnel_id')->constrained('courier_personnel')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('facility_id')->nullable()->constrained('courier_facilities')->nullOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();

            // assigned | out_for_delivery | delivered | failed | return_to_sender
            $table->string('status', 30)->default('assigned');
            $table->unsignedTinyInteger('attempt_count')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(3);
            $table->json('failure_reasons')->nullable();
            $table->timestamp('last_attempt_at')->nullable();

            // COD snapshot taken from the order when the job is created.
            $table->decimal('cod_amount', 10, 2)->default(0);
            $table->decimal('cod_collected', 10, 2)->nullable();
            $table->timestamp('cod_collected_at')->nullable();
            $table->foreignId('cod_remittance_id')->nullable()->constrained('cod_remittances')->nullOnDelete();

            // Proof of delivery (file path only).
            $table->string('pod_photo_path')->nullable();
            $table->timestamp('pod_uploaded_at')->nullable();
            $table->timestamp('otp_verified_at')->nullable();

            $table->timestamp('assigned_at');
            $table->timestamp('out_for_delivery_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();

            $table->index(['rider_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_jobs');
    }
};
