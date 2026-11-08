<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add verification columns to orders table (if not exists)
        if (!Schema::hasColumn('orders', 'verified_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->timestamp('verified_at')->nullable()->after('waybill_printed_at')
                    ->comment('When logistics staff verified the waybill');
                $table->unsignedBigInteger('verified_by')->nullable()->after('verified_at')
                    ->comment('Logistics staff who verified');
                
                $table->index('verified_by', 'idx_orders_verified_by');
                $table->foreign('verified_by', 'fk_orders_verified_by')
                      ->references('id')->on('users')->onDelete('set null');
            });
        }

        // 2. Add assignment metadata to shipment_assignments (if not exists)
        if (!Schema::hasColumn('shipment_assignments', 'suggested_reason')) {
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->text('suggested_reason')->nullable()->after('pickup_instructions')
                    ->comment('Why this courier was suggested (match reason, score)');
                $table->integer('match_score')->nullable()->after('suggested_reason')
                    ->comment('Courier matching score for sorting');
            });
        }

        // 3. Fix unique constraint on order_id (if not already done)
        $indexes = collect(DB::select('SHOW INDEX FROM shipment_assignments'))
            ->pluck('Key_name')
            ->toArray();
        
        // Step 3a: Add non-unique index if not exists
        if (!in_array('shipment_assignments_order_id_index', $indexes)) {
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->index('order_id', 'shipment_assignments_order_id_index');
            });
        }

        // Step 3b: Drop the old unique constraint if it still exists
        if (in_array('shipment_assignments_order_id_unique', $indexes)) {
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->dropUnique('shipment_assignments_order_id_unique');
            });
        }

        // 4. Add DB-level guard (MySQL/MariaDB only)
        $driver = DB::connection()->getDriverName();
        
        if (in_array($driver, ['mysql', 'mariadb'])) {
            $columns = collect(DB::select('DESCRIBE shipment_assignments'))
                ->pluck('Field')
                ->toArray();
            
            if (!in_array('active_order_id', $columns)) {
                // Add generated column for active assignments (VIRTUAL, not STORED, to avoid FK constraint error)
                DB::statement("
                    ALTER TABLE `shipment_assignments` 
                    ADD COLUMN `active_order_id` BIGINT UNSIGNED 
                    AS (CASE WHEN `assignment_status` IN ('pending', 'accepted') THEN `order_id` ELSE NULL END) VIRTUAL
                    COMMENT 'Generated column for DB-level guard: only one active assignment per order'
                ");

                // Add unique index on generated column (NULLs excluded automatically)
                DB::statement("
                    ALTER TABLE `shipment_assignments` 
                    ADD UNIQUE INDEX `idx_active_assignment_per_order` (`active_order_id`)
                ");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        
        // 1. Drop DB-level guard (MySQL/MariaDB only)
        if (in_array($driver, ['mysql', 'mariadb'])) {
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->dropIndex('idx_active_assignment_per_order');
            });
            
            DB::statement("
                ALTER TABLE `shipment_assignments` 
                DROP COLUMN `active_order_id`
            ");
        }

        // 2. Drop non-unique index
        Schema::table('shipment_assignments', function (Blueprint $table) {
            $table->dropIndex('shipment_assignments_order_id_index');
        });

        // 3. Check for duplicates before restoring unique constraint
        $duplicates = DB::table('shipment_assignments')
            ->select('order_id')
            ->groupBy('order_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        if ($duplicates > 0) {
            // Do NOT restore unique constraint if duplicates exist
            echo "\n";
            echo "⚠️  WARNING: Cannot restore unique constraint on shipment_assignments.order_id\n";
            echo "    {$duplicates} orders have multiple assignments (this is expected after rejection flow)\n";
            echo "    The unique constraint was NOT restored.\n";
            echo "    If you need to fully rollback, manually clean up duplicate assignments first.\n";
            echo "\n";
        } else {
            // Safe to restore unique constraint
            Schema::table('shipment_assignments', function (Blueprint $table) {
                $table->unique('order_id', 'shipment_assignments_order_id_unique');
            });
        }

        // 4. Remove assignment metadata
        Schema::table('shipment_assignments', function (Blueprint $table) {
            $table->dropColumn(['suggested_reason', 'match_score']);
        });

        // 5. Remove verification columns
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign('fk_orders_verified_by');
            $table->dropIndex('idx_orders_verified_by');
            $table->dropColumn(['verified_at', 'verified_by']);
        });
    }
};
