<?php

namespace App\Services;

use App\Models\AdminSetting;
use App\Models\LogisticsZone;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

/**
 * Shipping fee + logistics selection (checkout) and courier eligibility (Sort & Assign).
 *
 * FEE   zone (buyer city / province) + parcel weight bracket -> fee. When nothing matches the
 *       platform fallback applies (admin setting `default_shipping_fee`, default 80), never 0.
 *
 * LOGISTICS (which logistics account gets a parcel) - rule implemented:
 *   1. only approved logistics (role logistics_staff) whose coverage includes the buyer's city:
 *      an active zone listing the city or its province, else the company's registered coverage
 *      (cities_served / provinces_served);
 *   2. among those, the LOWEST fee for the parcel's weight bracket wins;
 *   3. ties: the company marked default (admin setting `default_logistics_id`) or a zone flagged
 *      is_default, then the oldest account (lowest id).
 *   None covers the area -> the default / oldest approved logistics with the fallback fee.
 *
 * COURIER ELIGIBILITY (Sort & Assign) - only the best tier is returned: a courier serving the
 * buyer's barangay beats one serving the city, which beats one serving only the province.
 */
class ShippingService
{
    public const FALLBACK_FEE = 80.0;

    public const FALLBACK_WEIGHT_PER_ITEM = 0.3;

    public static function fallbackFee(): float
    {
        return max(0.0, (float) AdminSetting::get('default_shipping_fee', (string) self::FALLBACK_FEE));
    }

    /** Parcel weight in kg from lines [weight, quantity]: 0.3 kg per item when the product has no weight. */
    public static function weightOf(iterable $lines): float
    {
        $w = 0.0;
        foreach ($lines as $l) {
            $unit = (float) ($l['weight'] ?? 0);
            $w += ($unit > 0 ? $unit : self::FALLBACK_WEIGHT_PER_ITEM) * (int) ($l['quantity'] ?? 1);
        }

        return round(max($w, 0.1), 2);
    }

    /** @return array{fee: float, zone: ?string, logistics_id: ?int, logistics_name: ?string, reason: string, fallback: bool, weight: float} */
    public static function quote(?string $city, ?string $province, float $weight): array
    {
        $city = trim((string) $city);
        $province = trim((string) $province);
        $best = null;

        foreach (self::logisticsCompanies() as $co) {
            $cover = self::coverage($co, $city, $province);
            if (! $cover) {
                continue;
            }
            $cand = [
                'co' => $co, 'zone' => $cover['zone'], 'fee' => $cover['zone'] ? self::rateFor($cover['zone'], $weight) : null,
                'is_default' => (int) AdminSetting::get('default_logistics_id', '0') === (int) $co->id || (bool) $cover['zone']?->is_default,
            ];
            if (! $best || self::better($cand, $best)) {
                $best = $cand;
            }
        }

        if (! $best) {
            $co = self::defaultCompany();

            return [
                'fee' => self::fallbackFee(), 'zone' => null, 'logistics_id' => $co?->id,
                'logistics_name' => $co ? self::label($co) : null, 'fallback' => true, 'weight' => $weight,
                'reason' => 'No logistics zone covers ' . ($city ?: 'this address') . '; default logistics and the standard rate were used',
            ];
        }

        $co = $best['co'];
        $fallback = $best['fee'] === null;

        return [
            'fee' => round($fallback ? self::fallbackFee() : $best['fee'], 2),
            'zone' => $best['zone']?->name,
            'logistics_id' => (int) $co->id,
            'logistics_name' => self::label($co),
            'fallback' => $fallback,
            'weight' => $weight,
            'reason' => 'Covers ' . ($city ?: $province) . ($best['zone'] ? " ({$best['zone']->name} zone)" : ' (registered coverage)')
                . ($fallback ? ", no rate for {$weight} kg so the standard rate applies" : ", lowest rate for {$weight} kg"),
        ];
    }

    /**
     * Couriers eligible for an order: ONLY the best matching tier.
     *
     * @return Collection<int, array{user: User, tier: string, score: int}>
     */
    public static function eligibleCouriers(Order $order): Collection
    {
        $r = $order->recipient();
        $n = fn ($v) => ScanRouteGuard::norm((string) $v);
        $barangay = $n($r['barangay'] ?? '');
        $city = $n($r['city'] ?? '');
        $province = $n($r['province'] ?? '');

        $scored = User::where('account_type', 'logistics')->where('role', 'courier')->where('status', 'approved')->get()
            ->map(function (User $c) use ($n, $barangay, $city, $province) {
                $areas = array_map($n, array_merge((array) $c->service_areas, (array) $c->cities_served, [(string) $c->municipality_city]));
                $provinces = array_map($n, array_merge((array) $c->provinces_served, [(string) $c->province]));
                $tier = match (true) {
                    $barangay !== '' && in_array($barangay, $areas, true) => ['barangay', 3],
                    $city !== '' && in_array($city, $areas, true) => ['city', 2],
                    $province !== '' && in_array($province, $provinces, true) => ['province', 1],
                    default => null,
                };

                return $tier ? ['user' => $c, 'tier' => $tier[0], 'score' => $tier[1]] : null;
            })->filter();

        $top = $scored->max('score');

        return $scored->where('score', $top)->values();
    }

    // ── internals ───────────────────────────────────────────────────────────

    private static function better(array $a, array $b): bool
    {
        $fa = $a['fee'] ?? INF; // a company without a matching rate ranks after one with a rate
        $fb = $b['fee'] ?? INF;
        if ($fa !== $fb) {
            return $fa < $fb;
        }
        if ($a['is_default'] !== $b['is_default']) {
            return $a['is_default'];
        }

        return $a['co']->id < $b['co']->id;
    }

    /** @return Collection<int, User> */
    private static function logisticsCompanies(): Collection
    {
        return User::where('account_type', 'logistics')->where('role', 'logistics_staff')->where('status', 'approved')->orderBy('id')->get();
    }

    private static function defaultCompany(): ?User
    {
        $id = (int) AdminSetting::get('default_logistics_id', '0');

        return ($id ? User::where('id', $id)->where('status', 'approved')->first() : null) ?? self::logisticsCompanies()->first();
    }

    private static function label(User $u): string
    {
        return (string) ($u->company_name ?: $u->business_name ?: $u->name);
    }

    /** @return ?array{zone: ?LogisticsZone, by: string} */
    private static function coverage(User $co, string $city, string $province): ?array
    {
        $n = fn ($v) => ScanRouteGuard::norm((string) $v);
        $c = $n($city);
        $p = $n($province);

        if (Schema::hasTable('logistics_zones')) {
            $zones = LogisticsZone::with('rates')->where('logistics_id', $co->id)->where('status', 'active')->get();
            foreach ($zones as $z) { // an exact city match beats a province match
                if ($c !== '' && in_array($c, array_map($n, (array) $z->cities), true)) {
                    return ['zone' => $z, 'by' => 'city'];
                }
            }
            foreach ($zones as $z) {
                if ($p !== '' && in_array($p, array_map($n, (array) $z->provinces), true)) {
                    return ['zone' => $z, 'by' => 'province'];
                }
            }
        }

        // Coverage declared at registration, used when no zone is configured
        if (($c !== '' && in_array($c, array_map($n, (array) $co->cities_served), true))
            || ($p !== '' && in_array($p, array_map($n, (array) $co->provinces_served), true))) {
            return ['zone' => null, 'by' => 'registered'];
        }

        return null;
    }

    private static function rateFor(LogisticsZone $zone, float $weight): ?float
    {
        foreach ($zone->rates as $r) {
            if ($weight >= $r->min_weight && ($r->max_weight === null || $weight <= $r->max_weight)) {
                return (float) $r->fee;
            }
        }

        return null;
    }
}
