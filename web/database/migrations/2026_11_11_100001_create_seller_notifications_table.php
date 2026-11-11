<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * In-app seller notifications (same shape as buyer_notifications, plus url
 * and a per-seller dedupe_key so each step notifies exactly once).
 * Additive: new table only.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');
            $table->json('data')->nullable();
            $table->string('url', 255)->nullable();
            $table->string('dedupe_key', 150)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['seller_id', 'read_at']);
            $table->unique(['seller_id', 'dedupe_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_notifications');
    }
};
