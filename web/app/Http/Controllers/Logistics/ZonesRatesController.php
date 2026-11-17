<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use App\Models\LogisticsRate;
use App\Models\LogisticsZone;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Zones and weight-bracket rates of the logistics company (web session, role logistics_staff).
 * The checkout reads these through ShippingService: buyer city/province -> zone, parcel weight -> rate.
 *
 *   GET    /logistics/zones-data
 *   POST   /logistics/zones                 {name, cities[], provinces[], is_default, status}
 *   PUT    /logistics/zones/{id}
 *   DELETE /logistics/zones/{id}
 *   POST   /logistics/zones/{id}/rates      {min_weight, max_weight|null, fee}
 *   PUT    /logistics/rates/{id}
 *   DELETE /logistics/rates/{id}
 */
class ZonesRatesController extends Controller
{
    private function companyId(Request $request): int
    {
        return (int) $request->user()->id; // zones belong to the logistics account itself (orders.logistics_id)
    }

    private function zone(Request $request, int $id): ?LogisticsZone
    {
        return LogisticsZone::where('id', $id)->where('logistics_id', $this->companyId($request))->first();
    }

    public function data(Request $request): JsonResponse
    {
        $zones = LogisticsZone::with('rates')->where('logistics_id', $this->companyId($request))->orderBy('name')->get();

        return response()->json([
            'zones' => $zones->map(fn (LogisticsZone $z) => [
                'id' => $z->id, 'name' => $z->name, 'cities' => $z->cities ?? [], 'provinces' => $z->provinces ?? [],
                'is_default' => $z->is_default, 'status' => $z->status,
                'rates' => $z->rates->map(fn ($r) => ['id' => $r->id, 'min_weight' => $r->min_weight, 'max_weight' => $r->max_weight, 'fee' => $r->fee])->values(),
            ])->values(),
            'fallback_fee' => ShippingService::fallbackFee(),
        ]);
    }

    private function zoneRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'cities' => ['nullable', 'array'],
            'cities.*' => ['string', 'max:100'],
            'provinces' => ['nullable', 'array'],
            'provinces.*' => ['string', 'max:100'],
            'is_default' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }

    public function storeZone(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), $this->zoneRules());
        $v->after(function ($v) use ($request) {
            if (! count($request->input('cities', [])) && ! count($request->input('provinces', []))) {
                $v->errors()->add('cities', 'Add at least one city or province to this zone.');
            }
        });
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $zone = LogisticsZone::create($v->validated() + ['logistics_id' => $this->companyId($request)]);

        return response()->json(['message' => 'Zone created.', 'id' => $zone->id], 201);
    }

    public function updateZone(Request $request, int $id): JsonResponse
    {
        $zone = $this->zone($request, $id);
        if (! $zone) {
            return response()->json(['message' => 'Zone not found.'], 404);
        }
        $v = Validator::make($request->all(), $this->zoneRules());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $zone->update($v->validated());

        return response()->json(['message' => 'Zone updated.']);
    }

    public function destroyZone(Request $request, int $id): JsonResponse
    {
        $zone = $this->zone($request, $id);
        if (! $zone) {
            return response()->json(['message' => 'Zone not found.'], 404);
        }
        $zone->delete(); // rates cascade

        return response()->json(['message' => 'Zone deleted.']);
    }

    private function rateRules(): array
    {
        return [
            'min_weight' => ['required', 'numeric', 'min:0', 'max:1000'],
            'max_weight' => ['nullable', 'numeric', 'gt:min_weight', 'max:1000'],
            'fee' => ['required', 'numeric', 'min:0', 'max:100000'],
        ];
    }

    /** Brackets of one zone must not overlap (a weight must map to exactly one fee). */
    private function overlaps(LogisticsZone $zone, float $min, ?float $max, ?int $ignoreId): bool
    {
        foreach ($zone->rates()->get() as $r) {
            if ($ignoreId && $r->id === $ignoreId) {
                continue;
            }
            $rMax = $r->max_weight ?? INF;
            $nMax = $max ?? INF;
            if ($min <= $rMax && $r->min_weight <= $nMax) {
                return true;
            }
        }

        return false;
    }

    public function storeRate(Request $request, int $zoneId): JsonResponse
    {
        $zone = $this->zone($request, $zoneId);
        if (! $zone) {
            return response()->json(['message' => 'Zone not found.'], 404);
        }
        $v = Validator::make($request->all(), $this->rateRules());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        if ($this->overlaps($zone, (float) $d['min_weight'], isset($d['max_weight']) ? (float) $d['max_weight'] : null, null)) {
            return response()->json(['message' => 'This weight bracket overlaps an existing one in the zone.'], 422);
        }
        LogisticsRate::create($d + ['zone_id' => $zone->id]);

        return response()->json(['message' => 'Rate added.'], 201);
    }

    public function updateRate(Request $request, int $id): JsonResponse
    {
        $rate = LogisticsRate::find($id);
        $zone = $rate ? $this->zone($request, $rate->zone_id) : null;
        if (! $rate || ! $zone) {
            return response()->json(['message' => 'Rate not found.'], 404);
        }
        $v = Validator::make($request->all(), $this->rateRules());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        if ($this->overlaps($zone, (float) $d['min_weight'], isset($d['max_weight']) ? (float) $d['max_weight'] : null, $rate->id)) {
            return response()->json(['message' => 'This weight bracket overlaps an existing one in the zone.'], 422);
        }
        $rate->update($d);

        return response()->json(['message' => 'Rate updated.']);
    }

    public function destroyRate(Request $request, int $id): JsonResponse
    {
        $rate = LogisticsRate::find($id);
        if (! $rate || ! $this->zone($request, $rate->zone_id)) {
            return response()->json(['message' => 'Rate not found.'], 404);
        }
        $rate->delete();

        return response()->json(['message' => 'Rate deleted.']);
    }
}
