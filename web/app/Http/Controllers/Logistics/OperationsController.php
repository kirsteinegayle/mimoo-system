<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\CourierFacility;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\ParcelReport;
use App\Models\Refund;
use App\Models\ShipmentScan;
use App\Models\User;
use App\Support\CourierCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

/**
 * Real data for the logistics web pages (role logistics_staff):
 *   GET  /logistics/monitoring-data      Delivery Monitoring: live parcel status, courier, rider, timeline
 *   GET  /logistics/riders-data          Riders: the company's riders + workload
 *   POST /logistics/riders               add a rider record (optionally linked to an approved rider account by email)
 *   PUT  /logistics/riders/{id}          edit name / contact / status
 *   GET  /logistics/reports-data         Reports: parcels, refunds, rider/delivery incidents, rejected scans, COD
 *
 * "Handled by this logistics" = orders.logistics_id is this account, or no logistics was recorded yet
 * (orders placed before shipping routing existed stay visible to everyone, as before).
 */
class OperationsController extends Controller
{
    private function mine(Request $request)
    {
        $me = (int) $request->user()->id;
        $courier = (int) \App\Support\CourierCompanyResolver::resolveId($request->user());

        // Orders routed to this logistics. A legacy order with no logistics recorded is only shown when its courier
        // company is this account's own (so finished legacy orders are no longer visible to unrelated logistics).
        return Order::where(fn ($q) => $q->where('logistics_id', $me)
            ->orWhere(fn ($legacy) => $legacy->whereNull('logistics_id')->when($courier, fn ($l) => $l->where('assigned_courier_id', $courier), fn ($l) => $l->whereRaw('1 = 0'))));
    }

    private function companyId(Request $request): int
    {
        return (int) CourierCompanyResolver::scope($request->user())->id;
    }

    // ── D1: Delivery monitoring ──────────────────────────────────────────────

    public function monitoring(Request $request): JsonResponse
    {
        $orders = $this->mine($request)->whereNotNull('waybill_number')
            ->whereNotIn('status', ['pending', 'cancelled', 'paid'])
            ->with(['items:id,order_id,quantity'])
            ->orderByDesc('updated_at')->limit(200)->get();

        $ids = $orders->pluck('id');
        $jobs = DeliveryJob::whereIn('order_id', $ids)->with(['personnel:id,name', 'courier:id,company_name,name'])->orderBy('id')->get()->groupBy('order_id');
        $scans = ShipmentScan::whereIn('order_id', $ids)->with('facility:id,facility_name,facility_type')->orderBy('id')->get()->groupBy('order_id');
        $courierNames = User::whereIn('id', $orders->pluck('assigned_courier_id')->filter()->unique())->get(['id', 'company_name', 'name'])
            ->mapWithKeys(fn ($u) => [$u->id => $u->company_name ?: $u->name]);

        $rows = $orders->map(function (Order $o) use ($jobs, $scans, $courierNames) {
            $job = ($jobs[$o->id] ?? collect())->last();
            $timeline = collect();
            $timeline->push(['at' => $o->created_at, 'label' => 'Order placed']);
            foreach ($scans[$o->id] ?? [] as $s) {
                $timeline->push(['at' => $s->created_at, 'label' => ucfirst(str_replace('_', ' ', $s->scan_type)) . ' at ' . ($s->facility?->facility_name ?? 'facility')]);
            }
            foreach (($jobs[$o->id] ?? collect()) as $j) {
                foreach ([['assigned_at', 'Assigned to rider'], ['out_for_delivery_at', 'Out for delivery'], ['delivered_at', 'Delivered'], ['returned_at', 'Returned to sender']] as [$col, $label]) {
                    if ($j->$col) {
                        $timeline->push(['at' => $j->$col, 'label' => $label . ($col === 'assigned_at' && $j->personnel ? ': ' . $j->personnel->name : '')]);
                    }
                }
            }
            $timeline = $timeline->sortBy('at')->values()->map(fn ($t) => ['at' => Carbon::parse($t['at'])->toISOString(), 'label' => $t['label']]);

            return [
                'id' => $o->id, 'order_number' => 'MIM-' . str_pad((string) $o->id, 8, '0', STR_PAD_LEFT), 'waybill' => $o->waybill_number,
                'buyer_city' => $o->recipient()['city'] ?? null, 'status' => $o->status,
                'tracking_status' => $o->tracking_status, 'tracking_message' => $o->tracking_message,
                'courier' => $o->assigned_courier_id ? ($courierNames[$o->assigned_courier_id] ?? null) : null,
                'rider' => $job?->personnel?->name, 'job_status' => $job?->status,
                'payment_method' => strtoupper((string) $o->payment_method), 'items' => (int) $o->items->sum('quantity'),
                'updated_at' => $o->updated_at?->toISOString(), 'timeline' => $timeline,
            ];
        });

        $count = fn (array $st) => $rows->whereIn('job_status', $st)->count();

        return response()->json([
            'data' => $rows->values(),
            'summary' => [
                'total' => $rows->count(),
                'awaiting_rider' => $rows->whereNull('job_status')->whereIn('status', ['shipped', 'in_transit'])->count(),
                'out_for_delivery' => $count([DeliveryJob::STATUS_OUT_FOR_DELIVERY]),
                'delivered' => $count([DeliveryJob::STATUS_DELIVERED]),
                'problem' => $count([DeliveryJob::STATUS_FAILED, DeliveryJob::STATUS_RETURN_TO_SENDER]),
            ],
            'generated_at' => now()->toISOString(),
        ]);
    }

    // ── D2: Riders ───────────────────────────────────────────────────────────

    public function riders(Request $request): JsonResponse
    {
        $cid = $this->companyId($request);
        $people = CourierPersonnel::where('courier_id', $cid)->where('role', 'rider')->with('user:id,email,status,verification_status')->orderBy('name')->get();
        $active = DeliveryJob::whereIn('personnel_id', $people->pluck('id'))->whereIn('status', DeliveryJob::ACTIVE_STATUSES)
            ->selectRaw('personnel_id, COUNT(*) c')->groupBy('personnel_id')->pluck('c', 'personnel_id');
        $done = DeliveryJob::whereIn('personnel_id', $people->pluck('id'))->where('status', DeliveryJob::STATUS_DELIVERED)
            ->selectRaw('personnel_id, COUNT(*) c')->groupBy('personnel_id')->pluck('c', 'personnel_id');

        return response()->json(['data' => $people->map(fn (CourierPersonnel $p) => [
            'id' => $p->id, 'name' => $p->name, 'contact_number' => $p->contact_number, 'status' => $p->status, 'online' => (bool) $p->is_online,
            'email' => $p->user?->email, 'account_ready' => (bool) ($p->user && $p->user->status === 'approved' && $p->user->verification_status === 'verified'),
            'active_jobs' => (int) ($active[$p->id] ?? 0), 'delivered' => (int) ($done[$p->id] ?? 0),
            'last_seen' => $p->last_checked_in_at?->toISOString(),
        ])->values()]);
    }

    public function storeRider(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'email' => ['nullable', 'email'],
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        $user = null;
        if (! empty($d['email'])) {
            $user = User::where('email', $d['email'])->where(fn ($q) => $q->where('role', 'rider')->orWhere('account_type', 'rider'))->first();
            if (! $user) {
                return response()->json(['message' => 'No rider app account uses that email. Leave it blank to add the rider without an account.'], 422);
            }
            if (CourierPersonnel::where('user_id', $user->id)->exists()) {
                return response()->json(['message' => 'That rider account is already on a company roster.'], 422);
            }
        }
        $p = CourierPersonnel::create([
            'courier_id' => $this->companyId($request), 'user_id' => $user?->id, 'name' => $d['name'],
            'contact_number' => $d['contact_number'], 'role' => 'rider', 'status' => 'active',
        ]);

        return response()->json(['message' => 'Rider added.', 'id' => $p->id], 201);
    }

    public function updateRider(Request $request, int $id): JsonResponse
    {
        $p = CourierPersonnel::where('id', $id)->where('courier_id', $this->companyId($request))->where('role', 'rider')->first();
        if (! $p) {
            return response()->json(['message' => 'Rider not found.'], 404);
        }
        $v = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_number' => ['sometimes', 'required', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        if (($d['status'] ?? null) === 'inactive'
            && DeliveryJob::where('personnel_id', $p->id)->whereIn('status', DeliveryJob::ACTIVE_STATUSES)->exists()) {
            return response()->json(['message' => 'This rider still has active deliveries. Reassign them before deactivating.'], 422);
        }
        $p->update($d);

        return response()->json(['message' => 'Rider updated.']);
    }

    // ── D6: Reports ──────────────────────────────────────────────────────────

    public function reports(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->query('from', now()->subDays(30)->toDateString()))->startOfDay();
        $to = Carbon::parse($request->query('to', now()->toDateString()))->endOfDay();
        $orderIds = $this->mine($request)->whereBetween('created_at', [$from, $to])->pluck('id');
        $order = fn ($id) => 'MIM-' . str_pad((string) $id, 8, '0', STR_PAD_LEFT);

        $refunds = Refund::whereIn('order_id', $orderIds)->orderByDesc('id')->limit(200)->get();
        $complaints = Complaint::whereIn('order_id', $orderIds)->whereIn('type', ['delivery_issue', 'courier_conduct'])->with('buyer:id,name')->orderByDesc('id')->limit(200)->get();
        $parcelReports = ParcelReport::whereIn('order_id', $orderIds)->orderByDesc('id')->limit(200)->get();
        $scans = Schema::hasTable('scan_attempts')
            ? DB::table('scan_attempts')->whereBetween('created_at', [$from, $to])->where(fn ($q) => $q->whereIn('order_id', $orderIds)->orWhereNull('order_id'))->orderByDesc('id')->limit(200)->get() : collect();
        $jobs = DeliveryJob::whereIn('order_id', $orderIds)->get();

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'summary' => [
                'parcels' => $orderIds->count(),
                'delivered' => $jobs->where('status', DeliveryJob::STATUS_DELIVERED)->count(),
                'failed_or_returned' => $jobs->whereIn('status', [DeliveryJob::STATUS_FAILED, DeliveryJob::STATUS_RETURN_TO_SENDER])->count(),
                'refunds' => $refunds->count(),
                'refunded_amount' => round((float) $refunds->where('status', 'refunded')->sum('amount'), 2),
                'incidents' => $complaints->count() + $parcelReports->count(),
                'rejected_scans' => $scans->count(),
                'cod_collected' => round((float) $jobs->sum('cod_collected'), 2),
            ],
            'refunds' => $refunds->map(fn ($r) => ['order' => $order($r->order_id), 'amount' => (float) $r->amount, 'method' => $r->method, 'status' => $r->status, 'at' => $r->created_at?->toISOString()])->values(),
            'incidents' => $complaints->map(fn ($c) => [
                'source' => 'Buyer complaint (app)', 'order' => $order($c->order_id), 'type' => Complaint::TYPES[$c->type] ?? $c->type,
                'detail' => \Illuminate\Support\Str::limit($c->description, 200), 'by' => $c->buyer?->name, 'status' => $c->status, 'at' => $c->created_at?->toISOString(),
            ])->concat($parcelReports->map(fn ($p) => [
                'source' => 'Parcel report (' . $p->reporter_role . ')', 'order' => $order($p->order_id), 'type' => $p->reason,
                'detail' => \Illuminate\Support\Str::limit($p->description, 200), 'by' => null, 'status' => $p->status, 'at' => $p->created_at?->toISOString(),
            ]))->sortByDesc('at')->values(),
            'rejected_scans' => $scans->map(fn ($s) => ['waybill' => $s->waybill_number, 'scan_type' => $s->scan_type, 'reason' => $s->reason, 'at' => $s->created_at])->values(),
            'facilities' => CourierFacility::where('courier_id', $this->companyId($request))->count(),
        ]);
    }
}
