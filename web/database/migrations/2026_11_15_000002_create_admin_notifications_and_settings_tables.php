<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin panel support tables (additive only).
 *
 * admin_notifications: in-app notifications for the shared admin team (the
 *   master-code admin has no users row). `source_key` makes generation
 *   idempotent: one row per event, e.g. "seller_application:42".
 *
 * admin_settings: small key/value store for the admin panel. Used for the
 *   admin display name/email and an optional hashed access code that replaces
 *   ADMIN_MASTER_CODE once set from Admin > Settings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50);
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('link')->nullable();
            $table->string('source_key', 120)->unique();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['read_at', 'created_at']);
        });

        Schema::create('admin_settings', function (Blueprint $table) {
            $table->string('key', 100)->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_settings');
        Schema::dropIfExists('admin_notifications');
    }
};
