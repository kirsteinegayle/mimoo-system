<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider app: one row per COD hand-over (rider -> courier company / hub).
 * NEW table only. Existing users / courier_personnel / courier_facilities are
 * referenced by foreign key only; those tables are not changed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cod_remittances', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('rider_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('personnel_id')->nullable()->constrained('courier_personnel')->nullOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('facility_id')->nullable()->constrained('courier_facilities')->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->unsignedInteger('parcels_count')->default(0);
            // submitted = rider handed it over; confirmed = hub confirmed (future).
            $table->string('status', 20)->default('submitted');
            $table->timestamp('remitted_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['rider_user_id', 'remitted_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cod_remittances');
    }
};
