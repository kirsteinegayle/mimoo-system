<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buyer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->string('label', 50);
            $table->string('recipient_name', 255);
            $table->string('phone', 20);
            $table->string('region', 100);
            $table->string('province', 100)->nullable();
            $table->string('district', 255)->nullable();
            $table->string('municipality_city', 100);
            $table->string('barangay', 100);
            $table->string('street_address', 255);
            $table->string('postal_code', 10)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['buyer_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buyer_addresses');
    }
};
