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
        Schema::create('shipment_assignment_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('shipment_assignments')->onDelete('cascade');
            $table->enum('action', ['assigned', 'accepted', 'rejected', 're-assigned']);
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamp('created_at');
            
            // Indexes
            $table->index('assignment_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_assignment_history');
    }
};
