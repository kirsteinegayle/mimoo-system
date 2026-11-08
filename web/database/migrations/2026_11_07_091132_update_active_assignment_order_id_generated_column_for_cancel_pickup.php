<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // Drop the unique index
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->dropUnique('idx_active_assignment_per_order');
            });

            // Drop the generated column
            DB::statement('ALTER TABLE shipment_assignments DROP COLUMN active_order_id');

            // Re-add the generated column with updated expression
            DB::statement("
                ALTER TABLE shipment_assignments 
                ADD COLUMN active_order_id INT UNSIGNED AS (
                    CASE 
                        WHEN assignment_status IN ('pending', 'accepted') 
                             AND pickup_status <> 'cancelled' 
                        THEN order_id 
                        ELSE NULL 
                    END
                ) VIRTUAL COMMENT 'Generated column for DB-level guard: only one active assignment per order'
            ");

            // Re-add the unique index
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->unique('active_order_id', 'idx_active_assignment_per_order');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // Drop the unique index
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->dropUnique('idx_active_assignment_per_order');
            });

            // Drop the generated column
            DB::statement('ALTER TABLE shipment_assignments DROP COLUMN active_order_id');

            // Re-add the old generated column expression
            DB::statement("
                ALTER TABLE shipment_assignments 
                ADD COLUMN active_order_id INT UNSIGNED AS (
                    CASE 
                        WHEN assignment_status IN ('pending', 'accepted') 
                        THEN order_id 
                        ELSE NULL 
                    END
                ) VIRTUAL COMMENT 'Generated column for DB-level guard: only one active assignment per order'
            ");

            // Re-add the unique index
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->unique('active_order_id', 'idx_active_assignment_per_order');
            });
        }
    }
};
