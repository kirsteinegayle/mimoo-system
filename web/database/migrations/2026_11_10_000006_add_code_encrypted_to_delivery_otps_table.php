<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rider app: encrypted copy of the buyer delivery code (Crypt::encryptString),
 * so the owning buyer can read it while it is active. Verification still uses
 * code_hash. Cleared (null) when the code is used, expired or replaced.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_otps', function (Blueprint $table) {
            $table->text('code_encrypted')->nullable()->after('code_hash');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_otps', function (Blueprint $table) {
            $table->dropColumn('code_encrypted');
        });
    }
};
