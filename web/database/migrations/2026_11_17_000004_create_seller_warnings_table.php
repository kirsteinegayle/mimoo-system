<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_warnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('reason', 500);
            $table->string('issued_by', 120);
            $table->timestamps();
            $table->index(['seller_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_warnings');
    }
};
