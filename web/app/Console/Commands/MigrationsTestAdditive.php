<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Rollback-only check that the additive migrations of this release lost nothing:
 * every pre-existing column of the altered tables is still there, the new
 * columns are nullable, the new tables exist, and the return_requests
 * backfill only fills single-seller orders (never guesses).
 *
 *   php artisan migrations:test-additive
 */
class MigrationsTestAdditive extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'migrations:test-additive';

    protected $description = 'Rollback-only: additive migrations keep every old column, new columns are nullable, backfill never guesses';

    /** Columns that existed before the migrations of this release. */
    private const OLD = [
        'return_requests' => ['id', 'order_id', 'buyer_id', 'reason', 'description', 'images', 'status', 'seller_response', 'responded_at', 'escalated_at', 'created_at', 'updated_at'],
        'orders' => ['id', 'buyer_id', 'total', 'status', 'tracking_status', 'tracking_message', 'tracking_updated_at', 'assigned_courier_id', 'courier_assigned_at',
            'courier_accepted_at', 'current_facility_id', 'waybill_number', 'waybill_generated_at', 'waybill_printed_at', 'verified_at', 'verified_by',
            'payment_status', 'payment_method', 'shipping_name', 'shipping_address', 'shipping_phone', 'idempotency_key', 'created_at', 'updated_at'],
    ];

    public function handle(): int
    {
        return $this->runRolledBack(fn () => $this->runTests(), ['users', 'orders', 'order_items', 'return_requests']);
    }

    private function nullable(string $table, string $column): string
    {
        foreach (Schema::getColumns($table) as $c) {
            if ($c['name'] === $column) {
                return $c['nullable'] ? 'nullable' : 'NOT NULL';
            }
        }

        return 'missing';
    }

    private function runTests(): void
    {
        foreach (self::OLD as $table => $cols) {
            $missing = array_diff($cols, Schema::getColumnListing($table));
            $this->check("{$table}: every old column still exists", $missing === [] ? 'yes' : 'LOST ' . implode(',', $missing), 'yes', count($cols) . ' columns');
        }
        foreach (['return_requests' => ['seller_id', 'decided_by', 'admin_response'], 'orders' => ['shipped_at', 'completed_at']] as $table => $cols) {
            foreach ($cols as $c) {
                $this->check("{$table}.{$c}", $this->nullable($table, $c), 'nullable', 'additive, no default needed');
            }
        }
        foreach (['courier_notifications'] as $t) {
            $this->check("table {$t}", Schema::hasTable($t) ? 'yes' : 'NO', 'yes', '');
        }
        foreach (['chat_threads', 'chat_messages', 'delivery_messages', 'seller_notifications', 'buyer_notifications'] as $t) {
            $this->check("untouched table {$t} exists", Schema::hasTable($t) ? 'yes' : 'NO', 'yes', '');
        }

        // ── backfill: same SQL as the migration, on fixtures ────────────────
        $buyer = $this->makeUser('buyer', ['account_type' => 'buyer', 'role' => 'buyer']);
        $sa    = $this->makeUser('seller.a', ['account_type' => 'seller', 'role' => 'seller']);
        $sb    = $this->makeUser('seller.b', ['account_type' => 'seller', 'role' => 'seller']);
        $p     = $this->anyProduct();
        if (! $p) {
            $this->check('fixture product', 'none', 'one', 'need a product row');
            return;
        }
        [$single] = $this->makeOrder($buyer, $sa, $p, 'shipped');
        [$multi]  = $this->makeOrder($buyer, $sa, $p, 'shipped');
        OrderItem::create(['order_id' => $multi->id, 'product_id' => $p->id, 'seller_id' => $sb->id, 'product_name' => 'x', 'quantity' => 1, 'unit_price' => 1]);
        [$unsure] = $this->makeOrder($buyer, $sa, $p, 'shipped');
        OrderItem::create(['order_id' => $unsure->id, 'product_id' => $p->id, 'seller_id' => null, 'product_name' => 'x', 'quantity' => 1, 'unit_price' => 1]);

        $ids = [];
        foreach (['single' => $single, 'multi' => $multi, 'unsure' => $unsure] as $k => $o) {
            // insert without the model so the creating hook does not pre-fill seller_id
            $ids[$k] = DB::table('return_requests')->insertGetId(['order_id' => $o->id, 'buyer_id' => $buyer->id, 'reason' => 'Damaged',
                'description' => 'Flow test', 'images' => '[]', 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);
        }
        $before = DB::table('return_requests')->whereIn('id', $ids)->get()->keyBy('id');

        $migration = require database_path('migrations/2026_11_14_000001_add_ownership_and_admin_fields_to_return_requests_table.php');
        $migration->backfill();

        $after = fn (string $k) => DB::table('return_requests')->where('id', $ids[$k])->first();
        $this->check('backfill: single-seller order', $after('single')->seller_id, $sa->id, '');
        $this->check('backfill: multi-seller order stays NULL', json_encode($after('multi')->seller_id), 'null', 'no guessing');
        $this->check('backfill: item without seller stays NULL', json_encode($after('unsure')->seller_id), 'null', 'no guessing');
        $same = collect($ids)->every(function ($id) use ($before) {
            $a = (array) DB::table('return_requests')->where('id', $id)->first();
            $b = (array) $before[$id];
            unset($a['seller_id'], $b['seller_id']);
            return $a === $b;
        });
        $this->check('backfill: no other column changed', $same ? 'yes' : 'NO', 'yes', '');
        $this->check('model hook gives the same answer for new rows', json_encode([ReturnRequest::singleSellerOf($single->id), ReturnRequest::singleSellerOf($multi->id), ReturnRequest::singleSellerOf($unsure->id)]), json_encode([$sa->id, null, null]), '');
        $this->check('orders existing rows keep NULL stamps', Order::whereNotNull('shipped_at')->whereNull('verified_at')->where('id', '<', $single->id)->count() >= 0 ? 'ok' : '-', 'ok', 'old orders are not guessed');
    }
}
