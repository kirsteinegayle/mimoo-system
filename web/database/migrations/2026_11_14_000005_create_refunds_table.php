<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Refund records for approved return requests. Additive: new table only.
 * No card number / CVV / PIN is ever stored (only an optional gateway reference).
 *
 * One ACTIVE refund per return is enforced by the database: active_return_id
 * holds the return id while the refund is pending / processing / refunded and
 * is NULL when it failed (UNIQUE allows many NULLs), so a failed refund can be
 * retried and nothing can be refunded twice.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_request_id')->constrained('return_requests')->cascadeOnDelete();
            $table->unsignedBigInteger('order_id')->index();
            $table->decimal('amount', 10, 2);
            $table->string('method', 30);                       // cod, gcash, card, ...
            $table->string('gateway', 30)->default('manual');   // driver that handled it
            $table->string('reference', 100)->nullable();
            $table->string('idempotency_key', 100)->unique();
            $table->string('status', 20)->default('pending');   // pending, processing, refunded, failed
            $table->string('failure_reason', 255)->nullable();
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->unsignedBigInteger('active_return_id')->nullable()->unique();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index(['return_request_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
