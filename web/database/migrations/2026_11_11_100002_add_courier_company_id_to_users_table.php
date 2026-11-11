<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links a logistics_staff (hub) user to its courier company (users.id of the
 * role=courier account). Nullable, additive; read only through
 * App\Support\CourierCompanyResolver. Existing rows stay NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('courier_company_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['courier_company_id']);
            $table->dropColumn('courier_company_id');
        });
    }
};
