<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\CodRemittance;
use App\Models\DeliveryJob;
use App\Models\RiderNotification;
use App\Support\CourierCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Courier side of COD: the rider hands the cash in (rider app: status submitted);
 * the courier company (or its logistics_staff) CONFIRMS that the cash arrived.
 *
 *   GET  /courier/cod-remittances              this company's remittances (?status=submitted|confirmed)
 *   POST /courier/cod-remittances/{id}/confirm submitted -> confirmed, exactly once
 *
 * Confirming is idempotent (a second call changes nothing and notifies nobody), the row is locked,
 * only the company that owns the remittance can confirm (404 otherwise), and the confirmed amount
 * must equal the cash collected on the remitted jobs. The actor (courier or staff user) is written in
 * the remittance notes because cod_remittances has no confirmed_by column (listed as a migration).
 */
class CodRemittanceController extends Controller
{
    private function companyId(Request $request): ?int
    {
        return CourierCompanyResolver::resolveId($request->user());
    }

    private function format(CodRemittance $r): array
    {
        return [
            'id'            => $r->id,
            'reference'     => $r->reference,
            'rider_name'    => $r->rider?->name,
            'amount'        => (float) $r->amount,
            'parcels_count' => (int) $r->parcels_count,
            'status'        => $r->status,
            'remitted_at'   => $r->remitted_at?->toISOString(),
            'confirmed_at'  => $r->confirmed_at?->toISOString(),
            'notes'         => $r->notes,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $cid = $this->companyId($request);
        if (! $cid) {
            return response()->json(['message' => 'No courier company is linked to this account.'], 403);
        }
        $status = (string) $request->query('status', '');
        $rows = CodRemittance::with('rider:id,name')->where('courier_id', $cid)
            ->when(in_array($status, ['submitted', 'confirmed'], true), fn ($q) => $q->where('status', $status))
            ->orderByRaw("CASE WHEN status = 'submitted' THEN 0 ELSE 1 END")->orderByDesc('id')->limit(100)->get();

        return response()->json([
            'data' => $rows->map(fn ($r) => $this->format($r))->values(),
            'meta' => [
                'awaiting_amount' => (float) CodRemittance::where('courier_id', $cid)->where('status', 'submitted')->sum('amount'),
                'awaiting_count'  => CodRemittance::where('courier_id', $cid)->where('status', 'submitted')->count(),
            ],
        ]);
    }

    public function confirm(Request $request, int $id): JsonResponse
    {
        $cid = $this->companyId($request);
        if (! $cid) {
            return response()->json(['message' => 'No courier company is linked to this account.'], 403);
        }
        $actor = $request->user();

        return DB::transaction(function () use ($cid, $id, $actor) {
            $r = CodRemittance::where('courier_id', $cid)->whereKey($id)->lockForUpdate()->first();
            if (! $r) {
                return response()->json(['message' => 'Remittance not found.'], 404);
            }
            if ($r->status === 'confirmed') {
                return response()->json(['message' => 'Already confirmed.', 'idempotent' => true, 'data' => $this->format($r->load('rider:id,name'))]);
            }
            if ($r->status !== 'submitted') {
                return response()->json(['message' => 'Only a submitted remittance can be confirmed.'], 422);
            }

            $collected = round((float) DeliveryJob::where('cod_remittance_id', $r->id)->sum('cod_collected'), 2);
            if (abs($collected - (float) $r->amount) > 0.001) {
                return response()->json(['message' => 'The remitted amount does not match the cash collected on its parcels. Do not confirm; contact the rider.'], 422);
            }

            $who = trim(($actor->name ?: $actor->email) . " (user #{$actor->id}, " . ($actor->role ?? $actor->account_type) . ')');
            $r->update([
                'status'       => 'confirmed',
                'confirmed_at' => now(),
                'notes'        => trim(($r->notes ? $r->notes . ' | ' : '') . 'Confirmed by ' . $who),
            ]);
            RiderNotification::notify((int) $r->rider_user_id, 'cod_confirmed', 'COD confirmed',
                '₱' . number_format((float) $r->amount, 2) . " was received (ref {$r->reference}).");

            return response()->json(['message' => 'Remittance confirmed.', 'idempotent' => false, 'data' => $this->format($r->fresh('rider:id,name'))]);
        });
    }
}
