<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider <-> buyer text chat for one delivery job (polling, no websocket).
 * Body length (max 500) is validated in DeliveryChatController.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_job_id')->constrained('delivery_jobs')->cascadeOnDelete();
            $table->enum('sender_role', ['rider', 'buyer']);
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['delivery_job_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_messages');
    }
};
