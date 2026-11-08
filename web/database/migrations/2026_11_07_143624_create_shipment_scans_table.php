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
        Schema::create('shipment_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('waybill_number');
            $table->foreignId('courier_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('facility_id')->constrained('courier_facilities')->onDelete('cascade');
            $table->string('scan_type')->default('received'); // received, transferred, dispatched
            $table->string('scanned_by')->nullable(); // Personnel name who scanned
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('waybill_number');
            $table->index('order_id');
            $table->index('facility_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_scans');
    }
};
