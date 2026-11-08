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
        Schema::create('shipment_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('courier_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('assigned_at');
            $table->enum('assignment_status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('acceptance_deadline');
            $table->decimal('weight', 8, 2)->nullable()->comment('Weight in kg');
            $table->string('dimensions')->nullable()->comment('Format: LxWxH cm');
            $table->text('pickup_instructions')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->unique('order_id'); // One order can only have one active assignment
            $table->index('courier_id');
            $table->index('assignment_status');
            $table->index('acceptance_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_assignments');
    }
};
