<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Name of the person who received the parcel (entered by the rider with the POD photo). */
    public function up(): void
    {
        Schema::table('delivery_jobs', function (Blueprint $table) {
            $table->string('pod_recipient_name', 120)->nullable()->after('pod_uploaded_at');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_jobs', function (Blueprint $table) {
            $table->dropColumn('pod_recipient_name');
        });
    }
};
