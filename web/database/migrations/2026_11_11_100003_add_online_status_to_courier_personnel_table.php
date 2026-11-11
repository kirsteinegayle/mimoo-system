<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider shift status (rider app check-in / check-out). Stored on
 * courier_personnel because every rider-app account has exactly one row
 * there (riders = applications; demo / seeded riders have none) and
 * CourierDeliveryController::readyRiders() already queries it.
 * Additive: default false, existing riders start offline.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_personnel', function (Blueprint $table) {
            $table->boolean('is_online')->default(false);
            $table->timestamp('last_checked_in_at')->nullable();
            $table->index(['courier_id', 'is_online']);
        });
    }

    public function down(): void
    {
        Schema::table('courier_personnel', function (Blueprint $table) {
            $table->dropIndex(['courier_id', 'is_online']);
            $table->dropColumn(['is_online', 'last_checked_in_at']);
        });
    }
};
