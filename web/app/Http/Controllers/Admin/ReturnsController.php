<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Services\BuyerNotificationService;
use App\Services\RefundService;
use App\Services\ReturnDecisionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin review of ESCALATED returns. Behind the `admin.verified` session
 * middleware (master-code login), like /admin/reports.
 *
 * GET  /admin/returns                        Inertia page
 * GET  /admin/returns/feed?status=&search=   JSON list (default: escalated)
 * POST /admin/returns/{id}/decision          { action: approve|reject, note }
 * GET  /admin/returns/{id}/photo/{filename}  evidence photo
 */
class ReturnsController extends Controller
{
    public const PER_PAGE = 10;

    public function page(): Response
    {
        return Inertia::render('admin/Returns');
    }

    public function feed(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'escalated');
        $search = trim((string) $request->query('search', ''));

        // Decisions: requests that were escalated at some point. "refund": every approved / refunded
        // request (the seller may have approved it without escalation), where the admin records the refund.
        $query = ReturnRequest::with(['order:id,total,shipping_name,status,payment_method', 'refund'])
            ->when($status === 'refund', fn ($q) => $q->whereIn('status', ['approved', 'refunded']),
                fn ($q) => $q->whereNotNull('escalated_at'))
            ->when(in_array($status, ['escalated', 'approved', 'rejected'], true), fn ($q) => $q->where('status', $status))
            ->when($search !== '', function ($q) use ($search) {
                $digits = ltrim(preg_replace('/\D/', '', $search) ?? '', '0');
                $q->where(function ($w) use ($search, $digits) {
                    $w->where('reason', 'like', "%{$search}%");
                    if ($digits !== '') {
                        $w->orWhere('order_id', (int) $digits);
                    }
                });
            })
            ->orderByDesc('id');

        $page = $query->paginate(self::PER_PAGE, ['*'], 'page', max(1, (int) $request->query('page', 1)));

        $orderIds = collect($page->items())->pluck('order_id');
        $items    = OrderItem::whereIn('order_id', $orderIds)->get(['order_id', 'seller_id', 'product_name', 'quantity', 'unit_price'])->groupBy('order_id');
        $sellers  = \App\Models\User::whereIn('id', $items->flatten(1)->pluck('seller_id')->filter()->unique())
            ->get(['id', 'name', 'business_name'])->keyBy('id');

        $counts = ReturnRequest::whereNotNull('escalated_at')->selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status');

        return response()->json([
            'data'   => collect($page->items())->map(fn (ReturnRequest $r) => $this->format($r, $items->get($r->order_id, collect()), $sellers))->values(),
            'counts' => $counts,
            'meta'   => [
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'per_page'     => $page->perPage(),
                'total'        => $page->total(),
            ],
        ]);
    }

    public function decision(Request $request, int $id): JsonResponse
    {
        $res = ReturnDecisionService::admin($id, (string) $request->input('action'), $request->input('note'), $request->user()?->id);
        if (! $res['ok']) {
            return response()->json([
                'message' => $res['message'],
                'error'   => $res['message'],
                'errors'  => isset($res['field']) ? [$res['field'] => [$res['message']]] : (object) [],
            ], $res['status']);
        }

        return response()->json([
            'message' => $res['return']->status === 'approved' ? 'Return request approved.' : 'Return request rejected.',
            'status'  => $res['return']->status,
        ]);
    }

    /** POST /admin/returns/{id}/refund {amount, reference, method?, idempotency_key?}: "Mark refund processed" (manual driver by default). */
    public function refund(Request $request, int $id): JsonResponse
    {
        $res = RefundService::process($id, $request->only(['amount', 'reference', 'method', 'idempotency_key']), $request->user()?->id);
        if (! $res['ok']) {
            return response()->json([
                'message' => $res['message'],
                'error'   => $res['message'],
                'errors'  => isset($res['field']) ? [$res['field'] => [$res['message']]] : (object) [],
                'data'    => isset($res['refund']) ? $res['refund']->toPayload() : null,
            ], $res['status']);
        }

        return response()->json([
            'message'    => $res['idempotent'] ? 'Refund already recorded.' : 'Refund marked as processed.',
            'idempotent' => $res['idempotent'],
            'data'       => $res['refund']->toPayload(),
        ]);
    }

    public function photo(int $id, string $filename)
    {
        return ReturnDecisionService::photo(ReturnRequest::findOrFail($id), $filename);
    }

    private function format(ReturnRequest $r, $items, $sellers): array
    {
        $names = collect($items)->pluck('seller_id')->filter()->unique()
            ->map(fn ($sid) => $sellers->get($sid)?->business_name ?? $sellers->get($sid)?->name)->filter()->values();

        return [
            'id'              => $r->id,
            'order_id'        => $r->order_id,
            'order_number'    => BuyerNotificationService::orderNumber((int) $r->order_id),
            'buyer_name'      => $r->order?->shipping_name,
            'seller_names'    => $names,
            'reason'          => $r->reason,
            'description'     => $r->description,
            'images'          => collect($r->images ?? [])->map(fn ($p) => url("/admin/returns/{$r->id}/photo/" . basename((string) $p)))->values(),
            'items'           => collect($items)->map(fn ($i) => [
                'name'       => $i->product_name,
                'quantity'   => (int) $i->quantity,
                'unit_price' => (float) $i->unit_price,
            ])->values(),
            'order_total'     => $r->order ? (float) $r->order->total : null,
            'status'          => $r->status,
            'seller_response' => $r->seller_response,
            'admin_response'  => $r->admin_response,
            'responded_at'    => $r->responded_at?->toISOString(),
            'escalated_at'    => $r->escalated_at?->toISOString(),
            'can_decide'      => $r->status === 'escalated',
            'payment_method'  => $r->order?->payment_method,
            'refund'          => $r->refund?->toPayload(),
            'can_refund'      => $r->status === 'approved' || ($r->refund && $r->refund->status === 'failed'),
            'created_at'      => $r->created_at?->toISOString(),
        ];
    }
}
