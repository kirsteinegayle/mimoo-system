<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider app: in-app notifications for riders (new job assigned, COD remitted...).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rider_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rider_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('title');
            $table->text('body')->nullable();
            $table->foreignId('delivery_job_id')->nullable()->constrained('delivery_jobs')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['rider_user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rider_notifications');
    }
};
