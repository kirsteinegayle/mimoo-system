<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Rider shift status (rider app online / offline switch).
 *
 * POST /api/rider-app/check-in   → courier_personnel.is_online = true,  last_checked_in_at = now
 * POST /api/rider-app/check-out  → courier_personnel.is_online = false (last_checked_in_at kept)
 *
 * Only the caller's own active personnel row is touched (route middleware:
 * auth:sanctum + rider.role). Idempotent: repeating a call changes nothing
 * and returns 200 with "idempotent": true.
 *
 * The approved application's riders.is_available_for_delivery /
 * last_active_at (shown on Courier Rider Management) are mirrored when such a
 * row exists (riders.email = users.email, same courier company).
 * CourierDeliveryController::readyRiders() lists only online riders.
 */
class RiderShiftController extends Controller
{
    public function checkIn(Request $request): JsonResponse
    {
        return $this->set($request, true);
    }

    public function checkOut(Request $request): JsonResponse
    {
        return $this->set($request, false);
    }

    private function set(Request $request, bool $online): JsonResponse
    {
        $user = $request->user();

        return DB::transaction(function () use ($user, $online) {
            $personnel = CourierPersonnel::where('user_id', $user->id)
                ->where('status', 'active')
                ->lockForUpdate()
                ->first();
            if (! $personnel) {
                return response()->json(['message' => 'Rider profile not found.'], 404);
            }

            $idempotent = (bool) $personnel->is_online === $online;
            if (! $idempotent) {
                $personnel->update($online
                    ? ['is_online' => true, 'last_checked_in_at' => now()]
                    : ['is_online' => false]);

                $email = strtolower(trim((string) $user->email));
                if ($email !== '') {
                    Rider::whereRaw('LOWER(email) = ?', [$email])
                        ->where('verification_status', 'approved')
                        ->where('courier_company_id', $personnel->courier_id)
                        ->update(['is_available_for_delivery' => $online, 'last_active_at' => now()]);
                }
            }

            return response()->json([
                'message'    => $idempotent
                    ? ($online ? 'Already online.' : 'Already offline.')
                    : ($online ? 'You are online.' : 'You are offline.'),
                'idempotent' => $idempotent,
                'data'       => [
                    'is_online'          => (bool) $personnel->is_online,
                    'last_checked_in_at' => $personnel->last_checked_in_at?->toIso8601String(),
                ],
            ]);
        });
    }
}
