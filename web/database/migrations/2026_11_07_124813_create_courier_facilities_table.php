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
        Schema::create('courier_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_id')->constrained('users')->onDelete('cascade');
            $table->string('facility_name');
            $table->string('facility_code')->unique();
            $table->enum('facility_type', ['Main Hub', 'Sorting Hub', 'Branch']);
            $table->foreignId('parent_facility_id')->nullable()->constrained('courier_facilities')->onDelete('set null');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            
            // Location
            $table->string('region');
            $table->string('province')->nullable();
            $table->string('city');
            $table->text('address');
            
            // Contact Information
            $table->string('manager_name');
            $table->string('contact_number');
            
            // Service Coverage (JSON array of cities)
            $table->json('coverage_cities');
            
            $table->timestamps();
            
            // Indexes
            $table->index('courier_id');
            $table->index('facility_type');
            $table->index('status');
            $table->index('facility_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_facilities');
    }
};
