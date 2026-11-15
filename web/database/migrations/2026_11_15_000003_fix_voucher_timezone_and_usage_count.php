<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Data fix for vouchers (no schema change).
 *
 * 1. Dates: Admin > Vouchers saved the typed local time (Asia/Manila) as if it
 *    were UTC, so every voucher started and ended 8 hours late and stayed
 *    hidden from buyers after creation. From now on the controller converts on
 *    save; this converts the rows already saved.
 * 2. usage_count: claiming used to increment it, so claims counted as uses
 *    (a limit-1 voucher was "used up" by the first claim and then rejected at
 *    checkout). It now means orders that used the voucher: recount it from
 *    voucher_usages.used_at.
 */
return new class extends Migration
{
    private const LOCAL_TZ = 'Asia/Manila';

    public function up(): void
    {
        DB::table('vouchers')->orderBy('id')->each(function ($v) {
            $toUtc = fn ($d) => $d ? Carbon::parse($d, self::LOCAL_TZ)->utc()->format('Y-m-d H:i:s') : $d;
            $uses  = DB::table('voucher_usages')->where('voucher_id', $v->id)->whereNotNull('used_at')->count();

            DB::table('vouchers')->where('id', $v->id)->update([
                'valid_from'  => $toUtc($v->valid_from),
                'valid_until' => $toUtc($v->valid_until),
                'usage_count' => $uses,
            ]);
        });
    }

    public function down(): void
    {
        DB::table('vouchers')->orderBy('id')->each(function ($v) {
            $toLocal = fn ($d) => $d ? Carbon::parse($d, 'UTC')->setTimezone(self::LOCAL_TZ)->format('Y-m-d H:i:s') : $d;

            DB::table('vouchers')->where('id', $v->id)->update([
                'valid_from'  => $toLocal($v->valid_from),
                'valid_until' => $toLocal($v->valid_until),
            ]);
        });
    }
};
