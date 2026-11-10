<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stage 1 — Rider backend (Phase A).
 *
 * users.role is a VARCHAR(255) NOT an enum (see add_role_to_users_table.php).
 * No schema change is needed — 'rider' is already a valid string value.
 *
 * This migration is intentionally a no-op and serves only as a marker so
 * that the migration history shows this decision was reviewed.
 */
return new class extends Migration
{
    public function up(): void
    {
        // users.role is VARCHAR(nullable) — any string value is already allowed.
        // 'rider' can be inserted without altering the column.
        // No DDL needed.
    }

    public function down(): void
    {
        // Nothing to reverse.
    }
};
