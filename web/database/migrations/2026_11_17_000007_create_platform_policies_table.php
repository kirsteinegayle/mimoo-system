<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** One row per saved version; the highest version of a type is the current policy. */
    public function up(): void
    {
        Schema::create('platform_policies', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30);                      // terms | privacy | commission | prohibited_items
            $table->unsignedInteger('version');
            $table->longText('content');
            $table->string('updated_by', 120);
            $table->timestamps();
            $table->unique(['type', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_policies');
    }
};
