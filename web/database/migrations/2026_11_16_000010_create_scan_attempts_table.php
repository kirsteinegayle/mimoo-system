<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Audit log of parcel scans that were REFUSED (wrong facility/route, etc.). Accepted scans live in shipment_scans. */
    public function up(): void
    {
        Schema::create('scan_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('waybill_number')->nullable()->index();
            $table->unsignedBigInteger('courier_id')->nullable()->index();
            $table->unsignedBigInteger('facility_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('scan_type', 40);
            $table->string('result', 20)->default('rejected');
            $table->string('reason');
            $table->string('expected_location')->nullable();
            $table->string('facility_location')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scan_attempts');
    }
};
