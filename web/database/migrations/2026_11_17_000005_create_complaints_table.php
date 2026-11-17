<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Buyer complaints / disputes about an order, reviewed by the admin. */
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('seller_id')->nullable()->index();
            $table->unsignedBigInteger('courier_id')->nullable()->index();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('type', 40);
            $table->text('description');
            $table->json('evidence')->nullable();           // private-disk paths
            $table->string('status', 20)->default('open');  // open | in_review | resolved | rejected
            $table->text('admin_notes')->nullable();        // internal, never shown to the parties
            $table->text('resolution')->nullable();         // shown to the parties
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
