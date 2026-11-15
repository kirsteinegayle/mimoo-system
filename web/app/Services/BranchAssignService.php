<?php

namespace App\Services;

use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\Rider;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * "New Assign" per branch (courier app). Groups the work that still needs a
 * rider by branch (courier_facilities of the company):
 *
 *   pickup   → branch whose coverage_cities / city contains the SELLER's city
 *              (pickup_status pending_pickup | scheduled | failed)
 *   delivery → the order's current_facility_id (parcel is at that hub/branch),
 *              picked up, in_transit/shipped, no delivery job yet
 *   rider    → riders.assigned_branch_id (linked to personnel by email)
 *
 * Branch id 0 = "No branch": pickups whose seller city no branch covers and
 * parcels with no current facility, so nothing silently disappears.
 */
class BranchAssignService
{
    public const NO_BRANCH = 0;

    private const PICKUP_OPEN = ['pending_pickup', 'scheduled', 'failed'];

    private const DELIVERY_ORDER_STATUSES = ['in_transit', 'shipped'];

    /** @return Collection<int, CourierFacility> active facilities of the company */
    public static function facilities(int $courierId): Collection
    {
        return CourierFacility::where('courier_id', $courierId)
            ->where('status', 'Active')
            ->orderByRaw("facility_type = 'Branch' DESC")
            ->orderBy('facility_name')
            ->get();
    }

    public static function normCity(?string $city): string
    {
        $c = mb_strtolower(trim((string) $city));
        $c = preg_replace('/^(city of|municipality of)\s+/u', '', $c);
        $c = preg_replace('/\s+city$/u', '', $c);

        return trim($c);
    }

    /** Facility id covering this city (Branch preferred), or NO_BRANCH. */
    public static function branchForCity(Collection $facilities, ?string $city): int
    {
        $n = self::normCity($city);
        if ($n === '') {
            return self::NO_BRANCH;
        }
        foreach ($facilities as $f) { // Branches come first (see facilities()).
            $cities = array_merge([(string) $f->city], (array) ($f->coverage_cities ?? []));
            foreach ($cities as $c) {
                if (self::normCity($c) === $n) {
                    return (int) $f->id;
                }
            }
        }

        return self::NO_BRANCH;
    }

    /**
     * personnel_id => branch id, from the approved rider application
     * (riders.email = users.email, same link as the delivery-riders list).
     * @return array<int, int>
     */
    public static function riderBranches(int $courierId): array
    {
        $personnel = CourierPersonnel::where('courier_id', $courierId)
            ->where('role', 'rider')->where('status', 'active')->whereNotNull('user_id')
            ->with('user:id,email')->get();
        $branchByEmail = Rider::where('courier_company_id', $courierId)
            ->whereNotNull('assigned_branch_id')
            ->pluck('assigned_branch_id', 'email')
            ->mapWithKeys(fn ($b, $e) => [strtolower((string) $e) => (int) $b]);

        $out = [];
        foreach ($personnel as $p) {
            $b = $branchByEmail[strtolower((string) ($p->user->email ?? ''))] ?? null;
            if ($b) {
                $out[$p->id] = $b;
            }
        }

        return $out;
    }

    /** Open pickups of the company with their branch. @return Collection<int, array{a: ShipmentAssignment, branch: int, seller: ?User}> */
    public static function pickups(int $courierId, Collection $facilities): Collection
    {
        $rows = ShipmentAssignment::where('courier_id', $courierId)
            ->where('assignment_status', 'accepted')
            ->whereIn('pickup_status', self::PICKUP_OPEN)
            ->with(['order.items:id,order_id,seller_id', 'personnel:id,name'])
            ->orderBy('id')->get();
        $sellerIds = $rows->map(fn ($a) => $a->order?->items->first()?->seller_id)->filter()->unique();
        $sellers = User::whereIn('id', $sellerIds)->get(['id', 'name', 'business_name', 'municipality_city', 'province', 'barangay'])->keyBy('id');

        return $rows->map(function (ShipmentAssignment $a) use ($sellers, $facilities) {
            $seller = $sellers->get($a->order?->items->first()?->seller_id);

            return ['a' => $a, 'seller' => $seller, 'branch' => self::branchForCity($facilities, $seller?->municipality_city)];
        });
    }

    /** Parcels waiting for a delivery rider, keyed to their current facility. @return Collection<int, Order> */
    public static function deliveries(int $courierId): Collection
    {
        $pickedUp = ShipmentAssignment::where('courier_id', $courierId)
            ->where('assignment_status', 'accepted')
            ->where('pickup_status', 'picked_up')
            ->select('order_id');

        return Order::whereIn('id', $pickedUp)
            ->whereIn('status', self::DELIVERY_ORDER_STATUSES)
            ->whereNotIn('id', DeliveryJob::select('order_id')) // one job per order (any status)
            ->orderBy('id')->get();
    }

    /** Branch list with counts for the picker. */
    public static function summary(int $courierId): array
    {
        $facilities = self::facilities($courierId);
        $pickups    = self::pickups($courierId, $facilities);
        $deliveries = self::deliveries($courierId);
        $riders     = array_count_values(self::riderBranches($courierId));

        $row = fn (int $id, string $name, ?string $type, ?string $city) => [
            'id'                 => $id,
            'name'               => $name,
            'type'               => $type,
            'city'               => $city,
            'new_pickups'        => $pickups->where('branch', $id)->filter(fn ($p) => ! $p['a']->assigned_personnel_id)->count(),
            'pickups'            => $pickups->where('branch', $id)->count(),
            'deliveries'         => $deliveries->filter(fn ($o) => (int) $o->current_facility_id === $id
                || ($id === self::NO_BRANCH && ! $facilities->contains('id', $o->current_facility_id)))->count(),
            'riders'             => (int) ($riders[$id] ?? 0),
        ];

        $list = $facilities->map(fn ($f) => $row((int) $f->id, $f->facility_name, $f->facility_type, $f->city))->values()->all();
        $none = $row(self::NO_BRANCH, 'No branch (outside coverage)', null, null);
        if ($none['pickups'] + $none['deliveries'] > 0) {
            $list[] = $none;
        }

        return $list;
    }

    /** Work + riders of one branch. */
    public static function queue(int $courierId, int $branchId): array
    {
        $facilities = self::facilities($courierId);
        $branch = $facilities->firstWhere('id', $branchId);

        $pickups = self::pickups($courierId, $facilities)->where('branch', $branchId)->map(function ($p) {
            $a = $p['a'];
            $s = $p['seller'];

            return [
                'id'                 => $a->id,
                'order_id'           => $a->order_id,
                'waybill_number'     => $a->order?->waybill_number,
                'pickup_status'      => $a->pickup_status,
                'scheduled_date'     => $a->scheduled_date,
                'seller_name'        => $s ? ($s->business_name ?: $s->name) : 'Unknown seller',
                'pickup_area'        => $s ? implode(', ', array_filter([$s->barangay, $s->municipality_city, $s->province])) : null,
                'assigned_rider'     => $a->personnel?->name,
                'assigned_personnel_id' => $a->assigned_personnel_id,
                'is_new'             => ! $a->assigned_personnel_id,
            ];
        })->sortByDesc('is_new')->values();

        $deliveries = self::deliveries($courierId)
            ->filter(fn ($o) => $branchId === self::NO_BRANCH
                ? ! $facilities->contains('id', $o->current_facility_id)
                : (int) $o->current_facility_id === $branchId)
            ->map(fn (Order $o) => [
                'order_id'       => $o->id,
                'order_number'   => 'MIM-' . str_pad((string) $o->id, 8, '0', STR_PAD_LEFT),
                'waybill_number' => $o->waybill_number,
                'buyer_name'     => $o->recipient()['name'],
                'destination'    => $o->destinationLabel(),
                'cod_amount'     => strtolower((string) $o->payment_method) === 'cod'
                    && ! in_array(strtolower((string) $o->payment_status), ['paid', 'refunded'], true) ? (float) $o->total : 0.0,
            ])->values();

        $riderIds = array_keys(array_filter(self::riderBranches($courierId), fn ($b) => $b === $branchId));
        $active = DeliveryJob::whereIn('personnel_id', $riderIds)->whereIn('status', DeliveryJob::ACTIVE_STATUSES)
            ->selectRaw('personnel_id, COUNT(*) c')->groupBy('personnel_id')->pluck('c', 'personnel_id');
        $openPickups = ShipmentAssignment::whereIn('assigned_personnel_id', $riderIds)->whereIn('pickup_status', self::PICKUP_OPEN)
            ->selectRaw('assigned_personnel_id, COUNT(*) c')->groupBy('assigned_personnel_id')->pluck('c', 'assigned_personnel_id');
        $riders = CourierPersonnel::whereIn('id', $riderIds)->orderByDesc('is_online')->orderBy('name')->get()
            ->map(fn (CourierPersonnel $p) => [
                'personnel_id'   => $p->id,
                'name'           => $p->name,
                'is_online'      => (bool) $p->is_online,
                'active_deliveries' => (int) ($active[$p->id] ?? 0),
                'open_pickups'   => (int) ($openPickups[$p->id] ?? 0),
            ])->values();

        return [
            'branch' => $branch
                ? ['id' => (int) $branch->id, 'name' => $branch->facility_name, 'type' => $branch->facility_type, 'city' => $branch->city]
                : ['id' => self::NO_BRANCH, 'name' => 'No branch (outside coverage)', 'type' => null, 'city' => null],
            'pickups'    => $pickups,
            'deliveries' => $deliveries,
            'riders'     => $riders,
        ];
    }

    public static function pickupBranch(int $courierId, int $assignmentId): ?int
    {
        $p = self::pickups($courierId, self::facilities($courierId))->first(fn ($p) => $p['a']->id === $assignmentId);

        return $p['branch'] ?? null;
    }
}
