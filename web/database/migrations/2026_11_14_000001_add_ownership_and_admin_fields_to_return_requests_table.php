<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Additive only. return_requests gets:
 *   seller_id       nullable, indexed. Backfilled ONLY when every item of the order
 *                   belongs to one single seller (no guessing: multi-seller or items
 *                   without a seller stay NULL and keep the old order_items rule).
 *   decided_by      nullable, users.id of whoever made the final decision.
 *   admin_response  nullable text, the admin note (old rows keep their text in seller_response).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('return_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('seller_id')->nullable()->after('buyer_id')->index();
            $table->unsignedBigInteger('decided_by')->nullable()->after('responded_at');
            $table->text('admin_response')->nullable()->after('seller_response');
        });

        $this->backfill();
    }

    /** Single-seller orders only. NULL items.seller_id or 2+ sellers => leave NULL. Public so a test can run it. */
    public function backfill(): void
    {
        DB::statement(<<<'SQL'
            UPDATE return_requests rr
            JOIN (
                SELECT order_id, MIN(seller_id) AS seller_id
                FROM order_items
                GROUP BY order_id
                HAVING COUNT(*) = COUNT(seller_id) AND COUNT(DISTINCT seller_id) = 1
            ) oi ON oi.order_id = rr.order_id
            SET rr.seller_id = oi.seller_id
            WHERE rr.seller_id IS NULL
        SQL);
    }

    public function down(): void
    {
        Schema::table('return_requests', function (Blueprint $table) {
            $table->dropIndex(['seller_id']);
            $table->dropColumn(['seller_id', 'decided_by', 'admin_response']);
        });
    }
};
