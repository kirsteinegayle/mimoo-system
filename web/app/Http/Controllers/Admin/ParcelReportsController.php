<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParcelReport;
use App\Services\BuyerNotificationService;
use App\Services\ParcelReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: parcel reports queue (admin.verified session).
 *   GET  /admin/parcel-reports                 page
 *   GET  /admin/parcel-reports/feed?status=    list (open | reviewed | resolved | all)
 *   POST /admin/parcel-reports/{id}/status     {status: reviewed|resolved, note?}  note is internal
 */
class ParcelReportsController extends Controller
{
    public function page(): Response
    {
        return Inertia::render('admin/ParcelReports');
    }

    public function feed(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'open');
        $q = ParcelReport::with(['reporter:id,name,first_name,last_name,business_name,company_name,email', 'order:id,status,buyer_id,total,waybill_number'])
            ->latest('id');
        if (in_array($status, ParcelReportService::STATUSES, true)) {
            $q->where('status', $status);
        }
        $reports = $q->limit(200)->get();
        $proofs = \App\Support\DeliveryProof::forOrders($reports->pluck('order_id'));
        $rows = $reports->map(fn (ParcelReport $r) => [
            'id'            => $r->id,
            'pod'           => $proofs[$r->order_id] ?? null,
            'order_id'      => $r->order_id,
            'order_number'  => BuyerNotificationService::orderNumber((int) $r->order_id),
            'order_status'  => $r->order?->status,
            'waybill'       => $r->order?->waybill_number,
            'reporter_role' => $r->reporter_role,
            'reporter_name' => $r->reporter ? (trim(($r->reporter->business_name ?: $r->reporter->company_name ?: '') ?: trim($r->reporter->first_name . ' ' . $r->reporter->last_name)) ?: $r->reporter->name) : 'Deleted user',
            'reporter_email' => $r->reporter?->email,
            'reason'        => $r->reason,
            'reason_label'  => ParcelReportService::REASONS[$r->reason] ?? $r->reason,
            'description'   => $r->description,
            'status'        => $r->status,
            'admin_note'    => $r->admin_note,
            'created_at'    => $r->created_at?->toISOString(),
            'reviewed_at'   => $r->reviewed_at?->toISOString(),
            'resolved_at'   => $r->resolved_at?->toISOString(),
        ]);

        $counts = ParcelReport::select('status', DB::raw('COUNT(*) c'))->groupBy('status')->pluck('c', 'status');

        return response()->json(['data' => $rows, 'counts' => [
            'open' => (int) ($counts['open'] ?? 0), 'reviewed' => (int) ($counts['reviewed'] ?? 0), 'resolved' => (int) ($counts['resolved'] ?? 0),
        ]]);
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'status' => 'required|in:reviewed,resolved',
            'note'   => 'nullable|string|max:1000',
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }

        return DB::transaction(function () use ($id, $v) {
            $report = ParcelReport::lockForUpdate()->find($id);
            if (! $report) {
                return response()->json(['message' => 'Report not found.'], 404);
            }
            $res = ParcelReportService::decide($report, $v->validated()['status'], trim((string) ($v->validated()['note'] ?? '')) ?: null);
            if ($res['error']) {
                return response()->json(['message' => 'A resolved report cannot be changed.'], 409);
            }

            return response()->json(['message' => $res['changed'] ? 'Report updated.' : 'No change.', 'status' => $report->status]);
        });
    }
}
