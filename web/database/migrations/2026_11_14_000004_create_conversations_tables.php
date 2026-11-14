<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Generic role-to-role messaging (admin, seller, courier, logistics, rider).
 * Separate from chat_threads/chat_messages (buyer <-> seller) and
 * delivery_messages (rider <-> buyer), which are NOT touched. Additive: new tables only.
 *
 *   conversations              pair_key is UNIQUE ("admin:0|seller:5", sorted) so a pair has one thread
 *   conversation_participants  one row per side: role + user_id (admin team = role admin, user_id 0);
 *                              last_read_message_id drives unread counts
 *   conversation_messages      body max 500 (enforced in code), optional image
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40);
            $table->string('pair_key', 120)->unique();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->string('role', 20);
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('last_read_message_id')->nullable();
            $table->timestamps();

            $table->unique(['conversation_id', 'role', 'user_id']);
            $table->index(['role', 'user_id']);
        });

        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->string('sender_role', 20);
            $table->unsignedBigInteger('sender_user_id');
            $table->string('body', 500)->nullable();
            $table->string('image_path', 255)->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};
