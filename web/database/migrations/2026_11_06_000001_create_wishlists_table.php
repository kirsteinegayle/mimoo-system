<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->timestamps();

            // A buyer can only wishlist a product once.
            $table->unique(['buyer_id', 'product_id']);

            // Speed up "list all wishlist items for this buyer" queries.
            $table->index('buyer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
