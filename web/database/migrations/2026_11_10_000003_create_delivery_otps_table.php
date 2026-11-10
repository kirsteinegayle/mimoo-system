<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider app: buyer OTP for a delivery. Only a hash of the code is stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_job_id')->constrained('delivery_jobs')->cascadeOnDelete();
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['delivery_job_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_otps');
    }
};
