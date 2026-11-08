<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 50);
            $table->text('description');
            $table->json('images');
            $table->string('status', 30)->default('pending');
            $table->text('seller_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index('buyer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_requests');
    }
};
