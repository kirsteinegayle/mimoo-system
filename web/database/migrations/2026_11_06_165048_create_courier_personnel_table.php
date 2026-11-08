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
        Schema::create('courier_personnel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 100);
            $table->string('contact_number', 20)->nullable();
            $table->enum('role', ['rider', 'driver', 'staff'])->default('rider');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            // Indexes
            $table->index('courier_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_personnel');
    }
};
