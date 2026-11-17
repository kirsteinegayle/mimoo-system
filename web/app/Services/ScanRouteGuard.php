<?php

namespace App\Services;

use App\Models\CourierFacility;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Validation for every parcel scan (web + courier app, all scan types).
 *
 * The scanning facility does NOT have to be the parcel's final destination. A scan is accepted
 * when ALL of these hold; otherwise it is refused, nothing is written to shipment_scans / orders
 * and the attempt is recorded in scan_attempts (parcel, facility, scanner, type, result, reason):
 *
 *   1. the facility is Active and belongs to the logistics company that handles the parcel;
 *   2. the parcel status allows scanning (not delivered / cancelled / failed / completed);
 *   3. the scan sequence is sane (not scanned again at the facility it is already at);
 *   4. the facility is an authorised checkpoint on the parcel's route:
 *        - first scan of the parcel: any active facility of the company (first intake);
 *        - afterwards: a hub / sorting hub (valid intermediate), a facility linked to the current
 *          one in the network (parent, child, sibling, ancestor, descendant), or a facility that
 *          serves the pickup city or the buyer's city (final-mile branch).
 *      Any other facility is an unexpected one and is refused.
 */
class ScanRouteGuard
{
    public const MESSAGE = 'Parcel is not expected at this facility.';

    /** Returns null when the scan is allowed, otherwise the error message to show. */
    public static function check(Order $order, CourierFacility $facility, string $scanType): ?string
    {
        [$reason, $expected] = self::evaluate($order, $facility, $scanType);
        if ($reason === null) {
            return null;
        }

        self::log($order, $facility, $scanType, $reason, $expected, implode(', ', self::facilityCities($facility)));

        return $reason;
    }

    /** @return array{0: ?string, 1: ?string} [error, expected-location text] */
    private static function evaluate(Order $order, CourierFacility $facility, string $scanType): array
    {
        $returning = $scanType === 'return_received';

        // 1. facility + company
        if (strtolower((string) $facility->status) !== 'active') {
            return [$facility->facility_name . ' is inactive, so it cannot scan parcels.', null];
        }
        if ($order->assigned_courier_id && (int) $order->assigned_courier_id !== (int) $facility->courier_id) {
            return ['This parcel is handled by a different logistics company; ' . $facility->facility_name . ' is not an authorized checkpoint for it.', null];
        }

        // 2. parcel status
        if (! $returning) {
            $status = strtolower((string) $order->status);
            $tracking = strtolower((string) $order->tracking_status);
            if (in_array($status, ['cancelled', 'failed', 'completed', 'delivered'], true) || in_array($tracking, ['delivered', 'cancelled', 'failed'], true)) {
                return ['This parcel is already ' . ($status === 'cancelled' || $tracking === 'cancelled' ? 'cancelled' : 'delivered/closed') . ' and can no longer be scanned.', null];
            }
        }

        // 3. sequence: no repeat scan at the facility the parcel is already at
        if ($order->current_facility_id && (int) $order->current_facility_id === (int) $facility->id
            && DB::table('shipment_scans')->where('order_id', $order->id)->where('facility_id', $facility->id)->where('scan_type', $scanType)->exists()) {
            return ['Parcel was already scanned at ' . $facility->facility_name . '. Scan it at the next facility on its route.', null];
        }

        // 4. route
        $current = $order->current_facility_id ? CourierFacility::find($order->current_facility_id) : null;
        if (! $current) {
            return [null, null]; // first intake: any active facility of the company
        }
        if (self::isHub($facility) || self::linked($current, $facility)) {
            return [null, null];
        }

        $dest = self::norm((string) $order->shipping_municipality_city);
        $origins = array_map([self::class, 'norm'], self::originCities($order));
        $served = array_map([self::class, 'norm'], self::facilityCities($facility));
        if (($dest !== '' && in_array($dest, $served, true)) || array_intersect($origins, $served)) {
            return [null, null];
        }

        return [
            self::MESSAGE . ' It is at ' . $current->facility_name . '; ' . $facility->facility_name
            . ' is not a hub, not linked to that facility and does not serve the pickup or delivery area.',
            'next after ' . $current->facility_name,
        ];
    }

    private static function isHub(CourierFacility $f): bool
    {
        return str_contains(strtolower((string) $f->facility_type), 'hub');
    }

    /** Parent, child, sibling, ancestor or descendant in the facility tree. */
    private static function linked(CourierFacility $a, CourierFacility $b): bool
    {
        $ancestors = function (CourierFacility $f): array {
            $ids = [];
            for ($i = 0; $f && $f->parent_facility_id && $i < 6; $i++) {
                $ids[] = (int) $f->parent_facility_id;
                $f = CourierFacility::find($f->parent_facility_id);
            }

            return $ids;
        };
        $aa = $ancestors($a);
        $bb = $ancestors($b);

        return in_array((int) $b->id, $aa, true) || in_array((int) $a->id, $bb, true) || (bool) array_intersect($aa, $bb);
    }

    /** Record a refused scan for reasons other than the route (e.g. unknown waybill). */
    public static function logRejected(?Order $order, ?string $waybill, ?CourierFacility $facility, string $scanType, string $reason, ?int $courierId = null, ?int $userId = null): void
    {
        self::log($order, $facility, $scanType, $reason, null, null, $waybill, $courierId, $userId);
    }

    private static function log(?Order $order, ?CourierFacility $facility, string $scanType, string $reason,
        ?string $expected, ?string $facilityLocation, ?string $waybill = null, ?int $courierId = null, ?int $userId = null): void
    {
        Log::warning('Parcel scan rejected', [
            'order_id' => $order?->id, 'waybill' => $waybill ?? $order?->waybill_number, 'facility_id' => $facility?->id,
            'scan_type' => $scanType, 'reason' => $reason, 'expected' => $expected, 'facility_serves' => $facilityLocation,
        ]);

        try {
            if (Schema::hasTable('scan_attempts')) {
                DB::table('scan_attempts')->insert([
                    'order_id' => $order?->id,
                    'waybill_number' => $waybill ?? $order?->waybill_number,
                    'courier_id' => $courierId ?? $facility?->courier_id,
                    'facility_id' => $facility?->id,
                    'user_id' => $userId ?? auth()->id(),
                    'scan_type' => $scanType,
                    'result' => 'rejected',
                    'reason' => $reason,
                    'expected_location' => $expected,
                    'facility_location' => $facilityLocation,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Could not write scan_attempts row: ' . $e->getMessage());
        }
    }

    /** @return list<string> */
    private static function facilityCities(CourierFacility $f): array
    {
        $cov = $f->coverage_cities;
        if (is_string($cov)) {
            $cov = json_decode($cov, true) ?: [];
        }

        return array_values(array_unique(array_filter(array_map('strval', array_merge([(string) $f->city], (array) $cov)), fn ($c) => trim($c) !== '')));
    }

    /** @return list<string> seller cities of the order (multi-seller orders: any seller counts). */
    private static function originCities(Order $order): array
    {
        $sellerIds = DB::table('order_items')->where('order_id', $order->id)->pluck('seller_id')->filter()->unique();

        return DB::table('users')->whereIn('id', $sellerIds)->pluck('municipality_city')->filter()->map('strval')->values()->all();
    }

    public static function norm(string $s): string
    {
        $s = trim($s);
        // Repair double-encoded UTF-8 (e.g. "BiÃ±an" -> "Biñan"), then lower-case and strip accents.
        if (str_contains($s, 'Ã')) {
            $fixed = mb_convert_encoding($s, 'ISO-8859-1', 'UTF-8');
            if (mb_check_encoding($fixed, 'UTF-8')) {
                $s = $fixed;
            }
        }
        $s = mb_strtolower($s);
        $s = strtr($s, ['ñ' => 'n', 'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u']);
        $s = preg_replace('/^(city of|municipality of)\s+/', '', $s);
        $s = preg_replace('/\s+(city|municipality)$/', '', $s);
        $s = preg_replace('/[^a-z0-9]+/', ' ', $s);

        return trim((string) $s);
    }
}
