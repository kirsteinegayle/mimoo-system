<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * In-app courier-company notifications (same shape as seller_notifications:
 * per-courier dedupe_key so each event notifies exactly once). Additive: new table only.
 * courier_id = the courier company user (users.role = courier).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');
            $table->json('data')->nullable();
            $table->string('url', 255)->nullable();
            $table->string('dedupe_key', 150)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['courier_id', 'read_at']);
            $table->unique(['courier_id', 'dedupe_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_notifications');
    }
};
