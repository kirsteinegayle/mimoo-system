<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_facilities', function (Blueprint $table) {
            $table->dropUnique('courier_facilities_facility_code_unique');
            $table->unique(['courier_id', 'facility_code'], 'courier_facilities_courier_id_facility_code_unique');
        });
    }

    public function down(): void
    {
        Schema::table('courier_facilities', function (Blueprint $table) {
            $table->dropUnique('courier_facilities_courier_id_facility_code_unique');
            $table->unique('facility_code', 'courier_facilities_facility_code_unique');
        });
    }
};
