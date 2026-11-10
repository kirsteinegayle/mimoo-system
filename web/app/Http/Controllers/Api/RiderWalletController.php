<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CodRemittance;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\RiderEarning;
use App\Models\RiderNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Rider wallet endpoints: COD held / remit, earnings, notifications.
 * Writes only to the NEW rider tables (cod_remittances, delivery_jobs,
 * rider_notifications). Route middleware: ['auth:sanctum', 'rider.role']
 */
class RiderWalletController extends Controller
{
    /** GET /cod — COD held (collected, not yet remitted) + recent remittances. */
    public function cod(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $held   = $this->heldQuery($userId);

        return response()->json([
            'data' => [
                'held_amount'  => (float) (clone $held)->sum('cod_collected'),
                'held_parcels' => (clone $held)->count(),
                'remittances'  => CodRemittance::where('rider_user_id', $userId)
                    ->latest('remitted_at')->limit(20)->get()
                    ->map(fn (CodRemittance $r) => [
                        'reference'     => $r->reference,
                        'amount'        => (float) $r->amount,
                        'parcels_count' => $r->parcels_count,
                        'status'        => $r->status,
                        'remitted_at'   => $r->remitted_at->toIso8601String(),
                    ]),
            ],
        ]);
    }

    /** POST /cod/remit — remits ALL held COD in one record. Safe to retry. */
    public function remit(Request $request): JsonResponse
    {
        $request->validate(['notes' => ['nullable', 'string', 'max:255']]);

        $personnel = CourierPersonnel::where('user_id', $request->user()->id)
            ->where('status', 'active')->first();
        if (! $personnel) {
            return response()->json(['message' => 'Rider profile not found.'], 404);
        }

        return DB::transaction(function () use ($request, $personnel) {
            $userId = $request->user()->id;
            $jobs   = $this->heldQuery($userId)->lockForUpdate()->get();

            if ($jobs->isEmpty()) {
                return response()->json(['message' => 'No COD to remit.'], 422);
            }

            $amount = round((float) $jobs->sum('cod_collected'), 2);
            $remit  = CodRemittance::create([
                'reference'     => 'RMT-' . now()->format('ymd') . '-' . strtoupper(Str::random(6)),
                'rider_user_id' => $userId,
                'personnel_id'  => $personnel->id,
                'courier_id'    => $personnel->courier_id,
                'facility_id'   => $jobs->first()->facility_id,
                'amount'        => $amount,
                'parcels_count' => $jobs->count(),
                'status'        => 'submitted',
                'remitted_at'   => now(),
                'notes'         => $request->input('notes'),
            ]);

            DeliveryJob::whereIn('id', $jobs->pluck('id'))->update(['cod_remittance_id' => $remit->id]);

            RiderNotification::notify($userId, 'cod_remitted', 'COD remitted',
                '₱' . number_format($amount, 2) . " for {$jobs->count()} parcel(s). Ref {$remit->reference}.");

            return response()->json([
                'message' => 'COD remitted.',
                'data'    => [
                    'reference'     => $remit->reference,
                    'amount'        => $amount,
                    'parcels_count' => $remit->parcels_count,
                    'status'        => $remit->status,
                ],
            ], 201);
        });
    }

    /** GET /earnings — today and this week (Mon-Sun). */
    public function earnings(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $sum = fn ($from) => RiderEarning::where('rider_user_id', $userId)
            ->where('earned_at', '>=', $from);

        return response()->json([
            'data' => [
                'today'       => (float) $sum(now()->startOfDay())->sum('amount'),
                'today_count' => $sum(now()->startOfDay())->count(),
                'week'        => (float) $sum(now()->startOfWeek())->sum('amount'),
                'week_count'  => $sum(now()->startOfWeek())->count(),
            ],
        ]);
    }

    /** GET /notifications */
    public function notifications(Request $request): JsonResponse
    {
        $items = RiderNotification::where('rider_user_id', $request->user()->id)
            ->latest('id')->limit(50)->get();

        return response()->json([
            'data' => $items->map(fn (RiderNotification $n) => [
                'id'              => $n->id,
                'type'            => $n->type,
                'title'           => $n->title,
                'body'            => $n->body,
                'delivery_job_id' => $n->delivery_job_id,
                'unread'          => $n->read_at === null,
                'created_at'      => $n->created_at?->toIso8601String(),
            ]),
            'unread_count' => $items->whereNull('read_at')->count(),
        ]);
    }

    /** POST /notifications/{id}/read  (id = "all" marks everything read) */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $query = RiderNotification::where('rider_user_id', $request->user()->id)->whereNull('read_at');
        if ($id !== 'all') {
            $query->where('id', (int) $id);
        }
        $query->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read.']);
    }

    /** Delivered COD jobs of this rider not yet attached to a remittance. */
    private function heldQuery(int $userId)
    {
        return DeliveryJob::where('rider_user_id', $userId)
            ->where('status', DeliveryJob::STATUS_DELIVERED)
            ->whereNull('cod_remittance_id')
            ->where('cod_collected', '>', 0);
    }
}
