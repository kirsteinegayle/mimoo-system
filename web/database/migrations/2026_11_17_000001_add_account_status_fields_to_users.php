<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Admin account control: reason shown to the user, when it changed, and the seller warning counter. */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('status_reason')->nullable()->after('status');
            $table->timestamp('status_changed_at')->nullable()->after('status_reason');
            $table->unsignedInteger('warning_count')->default(0)->after('status_changed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status_reason', 'status_changed_at', 'warning_count']);
        });
    }
};
