<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use App\Models\CodRemittance;
use App\Models\DeliveryJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Logistics COD & Remittance (role logistics_staff).
 *
 * Money trail: rider collects -> rider remits to the courier company (CodRemittance, confirmed by the courier)
 * -> courier company remits to logistics (this controller: "received") -> logistics settles the seller ("settled").
 *
 * Rows are created from delivered COD jobs of orders routed to this logistics (orders.logistics_id), so the page
 * is always in step with real deliveries. Amounts: payout = items total - platform commission; the shipping fee stays with logistics.
 *
 *   GET  /logistics/cod-data?status=
 *   POST /logistics/cod/{id}/received     courier remitted the cash to logistics
 *   POST /logistics/cod/{id}/settled      logistics paid the seller
 */
class CodSettlementController extends Controller
{
    private const NEXT = ['collected' => 'remitted_to_logistics', 'remitted_to_logistics' => 'settled_to_seller'];

    /** Create settlement rows for delivered COD parcels that do not have one yet. */
    private function sync(int $me): void
    {
        $rate = (float) config('platform.commission_rate', 0);
        $jobs = DeliveryJob::where('status', DeliveryJob::STATUS_DELIVERED)->where('cod_collected', '>', 0)
            ->whereIn('order_id', DB::table('orders')->where('logistics_id', $me)->select('id'))
            ->whereNotIn('order_id', DB::table('cod_settlements')->select('order_id'))
            ->with('order.items')->get();

        foreach ($jobs as $job) {
            $order = $job->order;
            if (! $order) {
                continue;
            }
            $items = (float) $order->items->sum(fn ($i) => $i->quantity * $i->unit_price);
            $commission = round($items * $rate, 2);
            DB::table('cod_settlements')->insertOrIgnore([
                'order_id' => $order->id, 'logistics_id' => $me, 'courier_id' => $job->courier_id,
                'amount' => $job->cod_collected, 'shipping_fee' => (float) $order->shipping_fee,
                'commission' => $commission, 'seller_payout' => max(0, round($items - $commission, 2)),
                'status' => 'collected', 'collected_at' => $job->delivered_at ?? now(),
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    public function data(Request $request): JsonResponse
    {
        $me = (int) $request->user()->id;
        $this->sync($me);
        $status = (string) $request->query('status', '');

        $rows = DB::table('cod_settlements as s')
            ->join('orders as o', 'o.id', '=', 's.order_id')
            ->leftJoin('users as c', 'c.id', '=', 's.courier_id')
            ->where('s.logistics_id', $me)
            ->when(in_array($status, ['collected', 'remitted_to_logistics', 'settled_to_seller'], true), fn ($q) => $q->where('s.status', $status))
            ->orderByDesc('s.id')->limit(200)
            ->get(['s.*', 'o.waybill_number', 'c.company_name as courier_name', 'c.name as courier_user']);

        $sum = fn (string $st) => (float) DB::table('cod_settlements')->where('logistics_id', $me)->where('status', $st)->sum('amount');
        $riderPending = (float) CodRemittance::whereIn('courier_id', DB::table('cod_settlements')->where('logistics_id', $me)->select('courier_id'))->where('status', 'submitted')->sum('amount');

        return response()->json([
            'data' => $rows->map(fn ($r) => [
                'id' => $r->id, 'waybill' => $r->waybill_number, 'order_number' => 'MIM-' . str_pad((string) $r->order_id, 8, '0', STR_PAD_LEFT),
                'courier' => $r->courier_name ?: $r->courier_user, 'amount' => (float) $r->amount, 'shipping_fee' => (float) $r->shipping_fee,
                'commission' => (float) $r->commission, 'seller_payout' => (float) $r->seller_payout, 'status' => $r->status,
                'collected_at' => $r->collected_at, 'remitted_at' => $r->remitted_at, 'settled_at' => $r->settled_at,
            ])->values(),
            'summary' => [
                'with_courier' => $sum('collected'), 'with_logistics' => $sum('remitted_to_logistics'), 'settled' => $sum('settled_to_seller'),
                'riders_awaiting_courier_confirmation' => $riderPending,
            ],
        ]);
    }

    private function advance(Request $request, int $id, string $from, string $to, string $stamp): JsonResponse
    {
        $me = (int) $request->user()->id;

        return DB::transaction(function () use ($me, $id, $from, $to, $stamp) {
            $r = DB::table('cod_settlements')->where('id', $id)->where('logistics_id', $me)->lockForUpdate()->first();
            if (! $r) {
                return response()->json(['message' => 'Record not found.'], 404);
            }
            if ($r->status === $to) {
                return response()->json(['message' => 'Already recorded.', 'idempotent' => true]);
            }
            if ($r->status !== $from) {
                return response()->json(['message' => 'This step is not available for the current status.'], 422);
            }
            DB::table('cod_settlements')->where('id', $id)->update(['status' => $to, $stamp => now(), 'updated_at' => now()]);

            return response()->json(['message' => 'Updated.']);
        });
    }

    public function received(Request $request, int $id): JsonResponse
    {
        return $this->advance($request, $id, 'collected', 'remitted_to_logistics', 'remitted_at');
    }

    public function settled(Request $request, int $id): JsonResponse
    {
        return $this->advance($request, $id, 'remitted_to_logistics', 'settled_to_seller', 'settled_at');
    }
}
