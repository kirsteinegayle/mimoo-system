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
        Schema::create('riders', function (Blueprint $table) {
            $table->id();
            
            // Personal Information
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('suffix', 20)->nullable();
            $table->date('birthdate');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('contact_number', 20);
            $table->string('email', 255)->unique();
            $table->string('profile_picture')->nullable();
            
            // Account Information
            $table->string('rider_id', 50)->unique(); // Auto-generated after approval
            $table->string('username', 100)->unique();
            $table->string('password');
            
            // Branch Assignment (assigned by courier during approval)
            $table->foreignId('courier_company_id')->nullable()->constrained('users')->onDelete('cascade'); // Set by system when rider selects courier or assigned during approval
            $table->foreignId('assigned_branch_id')->nullable()->constrained('courier_facilities')->onDelete('cascade'); // Assigned by courier during approval
            $table->enum('employment_status', ['active', 'inactive', 'suspended'])->default('inactive');
            
            // Delivery Information
            $table->json('service_areas'); // Array of municipalities
            $table->enum('vehicle_type', ['motorcycle', 'bicycle', 'car', 'tricycle']);
            $table->string('plate_number', 50)->nullable();
            $table->string('drivers_license_number', 50)->nullable();
            
            // Address Information
            $table->string('region');
            $table->string('province')->nullable();
            $table->string('city_municipality');
            $table->string('barangay');
            $table->string('street_address')->nullable();
            
            // Supporting Documents
            $table->string('government_id'); // File path
            $table->string('drivers_license')->nullable(); // File path
            $table->string('vehicle_or_cr')->nullable(); // File path (OR/CR)
            
            // Status & Verification
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete(); // Admin who verified
            $table->text('rejection_reason')->nullable();
            
            // Delivery Availability (separate from employment status)
            $table->boolean('is_available_for_delivery')->default(false);
            $table->timestamp('last_active_at')->nullable();
            
            // Privacy & Terms
            $table->boolean('privacy_policy_accepted')->default(false);
            $table->timestamp('privacy_accepted_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('courier_company_id');
            $table->index('assigned_branch_id');
            $table->index('employment_status');
            $table->index('verification_status');
            $table->index('is_available_for_delivery');
            $table->index('email');
            $table->index('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riders');
    }
};
