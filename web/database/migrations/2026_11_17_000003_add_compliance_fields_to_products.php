<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Set when the admin hides a product for a compliance violation (seller cannot re-activate it). */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('compliance_hidden_at')->nullable();
            $table->string('compliance_note', 500)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['compliance_hidden_at', 'compliance_note']);
        });
    }
};
