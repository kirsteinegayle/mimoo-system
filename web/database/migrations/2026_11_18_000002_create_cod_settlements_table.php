<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * COD money trail after delivery. One row per COD order:
 *   collected              rider collected the cash (delivery_jobs.cod_collected)
 *   remitted_to_logistics  the courier company handed the cash to the logistics account
 *   settled_to_seller      logistics paid the seller their share
 * (rider -> courier company is tracked by cod_remittances.)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cod_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('logistics_id')->index();
            $table->unsignedBigInteger('courier_id')->nullable()->index();
            $table->decimal('amount', 10, 2);            // cash collected from the buyer
            $table->decimal('shipping_fee', 10, 2)->default(0); // kept by logistics
            $table->decimal('commission', 10, 2)->default(0);   // platform commission on the items
            $table->decimal('seller_payout', 10, 2)->default(0);
            $table->string('status', 24)->default('collected');
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('remitted_at')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->string('notes', 255)->nullable();
            $table->timestamps();
            $table->index(['logistics_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cod_settlements');
    }
};
