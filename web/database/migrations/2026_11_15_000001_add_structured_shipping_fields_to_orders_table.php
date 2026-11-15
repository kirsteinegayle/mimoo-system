<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Structured recipient address on the order snapshot, so Courier / Logistics /
 * Rider stop guessing city/barangay by splitting shipping_address on commas.
 * (Several controllers already read shipping_municipality_city etc. — those
 * columns simply never existed, so they always came back null.)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_barangay')->nullable()->after('shipping_phone');
            $table->string('shipping_municipality_city')->nullable()->after('shipping_barangay');
            $table->string('shipping_province')->nullable()->after('shipping_municipality_city');
            $table->string('shipping_region')->nullable()->after('shipping_province');
        });

        // Backfill: if the order's address text equals one of the buyer's saved
        // addresses, copy its structured parts. Anything else keeps null and
        // Order::recipient() falls back to parsing the text.
        $addresses = DB::table('buyer_addresses')->get()->groupBy('buyer_id');
        DB::table('orders')
            ->whereNotNull('shipping_address')
            ->orderBy('id')
            ->select('id', 'buyer_id', 'shipping_address')
            ->chunkById(500, function ($orders) use ($addresses) {
                foreach ($orders as $o) {
                    foreach ($addresses->get($o->buyer_id, collect()) as $a) {
                        $full = implode(', ', array_filter([
                            $a->street_address, $a->barangay, $a->municipality_city,
                            $a->district, $a->province, $a->region, $a->postal_code,
                        ], fn ($p) => $p !== null && trim((string) $p) !== ''));

                        if (mb_substr($full, 0, 500) === $o->shipping_address) {
                            DB::table('orders')->where('id', $o->id)->update([
                                'shipping_barangay'          => $a->barangay,
                                'shipping_municipality_city' => $a->municipality_city,
                                'shipping_province'          => $a->province,
                                'shipping_region'            => $a->region,
                            ]);
                            break;
                        }
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_barangay',
                'shipping_municipality_city',
                'shipping_province',
                'shipping_region',
            ]);
        });
    }
};
