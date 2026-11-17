<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Additive: image / PDF attachments on support tickets and their replies (private disk, served by an authorised route). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            $table->unsignedBigInteger('reply_id')->nullable()->index(); // null = attached to the ticket itself
            $table->unsignedBigInteger('user_id')->nullable();           // uploader (null = admin team)
            $table->string('path');
            $table->string('original_name', 120);
            $table->string('mime', 60);
            $table->unsignedInteger('size');
            $table->timestamps();
            $table->index(['ticket_id', 'reply_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_ticket_attachments');
    }
};
