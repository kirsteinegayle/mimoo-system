<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->text('body');
            $table->string('audience', 20)->default('all');   // all | buyers | sellers | couriers | riders
            $table->string('status', 20)->default('draft');   // draft | published | unpublished
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'audience']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
