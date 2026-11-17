<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Additive: parcel problem reports (damaged / lost / wrong item / not received)
 * tied to an order, filed by the buyer, the delivery rider or the courier company.
 * admin_note is INTERNAL (never sent to the reporter).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('parcel_reports')) {
            return;
        }
        Schema::create('parcel_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reporter_role', 20); // buyer | rider | courier
            $table->string('reason', 30);        // damaged | lost | wrong_item | not_received | other
            $table->text('description');
            $table->string('status', 20)->default('open'); // open | reviewed | resolved
            $table->text('admin_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'reporter_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parcel_reports');
    }
};
