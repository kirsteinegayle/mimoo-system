<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stage 1 — Rider backend (Phase A).
 *
 * Adds a nullable unique user_id FK to courier_personnel so that a rider
 * who has a users account can be linked to their personnel record.
 *
 * Additive only — no existing column is touched.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_personnel', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->unique()          // one-to-one: one users row → one personnel row
                ->after('id')
                ->constrained('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('courier_personnel', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
