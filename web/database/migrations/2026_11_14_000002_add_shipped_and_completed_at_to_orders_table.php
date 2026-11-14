<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Additive only: orders.shipped_at / completed_at (nullable), stamped by
 * Order::booted() the first time the status becomes shipped / completed.
 *
 * No backfill: there is no order status history table, and orders.updated_at
 * and tracking_updated_at move for other reasons, so no existing row has an
 * exact source. Old orders stay NULL and the 7/30-day windows fall back to
 * updated_at (ReturnReviewRules).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipped_at', 'completed_at']);
        });
    }
};
