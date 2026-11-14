<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Services\BuyerNotificationService;
use App\Services\ReturnDecisionService;
use App\Support\PortalRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Seller returns (session auth, seller accounts only; a seller only ever sees
 * returns of orders that contain one of THEIR items, 404 otherwise).
 *
 * GET  /seller/returns                          Inertia page
 * GET  /seller/returns/feed?status=&search=     JSON list (paginated)
 * POST /seller/returns/{id}/decision            { action: approve|reject, note }
 * GET  /seller/returns/{id}/photo/{filename}    buyer's evidence photo
 *
 * Rules live in ReturnDecisionService (pending only, reject needs a note).
 */
class ReturnsController extends Controller
{
    public const PER_PAGE = 10;

    private function sellerId(Request $request): int
    {
        $user = $request->user();
        abort_unless($user && PortalRole::roleOf($user) === 'seller', 403, 'Only seller accounts can access returns.');

        return (int) $user->id;
    }

    public function page(Request $request): Response
    {
        $this->sellerId($request);

        return Inertia::render('seller/SellerReturns');
    }

    public function feed(Request $request): JsonResponse
    {
        $sellerId = $this->sellerId($request);
        $status   = (string) $request->query('status', 'all');
        $search   = trim((string) $request->query('search', ''));

        $query = ReturnRequest::with('order:id,total,shipping_name,status')
            ->forSeller($sellerId)
            ->when(in_array($status, ['pending', 'approved', 'rejected', 'escalated', 'refunded', 'closed'], true),
                fn ($q) => $q->where('status', $status))
            ->when($search !== '', function ($q) use ($search) {
                $digits = ltrim(preg_replace('/\D/', '', $search) ?? '', '0');
                $q->where(function ($w) use ($search, $digits) {
                    $w->where('reason', 'like', "%{$search}%");
                    if ($digits !== '') {
                        $w->orWhere('order_id', (int) $digits);
                    }
                });
            })
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('id');

        $page = $query->paginate(self::PER_PAGE, ['*'], 'page', max(1, (int) $request->query('page', 1)));

        $items = OrderItem::where('seller_id', $sellerId)
            ->whereIn('order_id', collect($page->items())->pluck('order_id'))
            ->get(['order_id', 'product_name', 'quantity', 'unit_price'])
            ->groupBy('order_id');

        $counts = ReturnRequest::forSeller($sellerId)
            ->selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status');

        return response()->json([
            'data'   => collect($page->items())->map(fn (ReturnRequest $r) => $this->format($r, $items->get($r->order_id, collect())))->values(),
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
        $sellerId = $this->sellerId($request);

        $res = ReturnDecisionService::seller($id, $sellerId, (string) $request->input('action'), $request->input('note'));
        if (! $res['ok']) {
            return response()->json([
                'message' => $res['message'],
                'errors'  => isset($res['field']) ? [$res['field'] => [$res['message']]] : (object) [],
            ], $res['status']);
        }

        $rr = $res['return']->load('order:id,total,shipping_name,status');

        return response()->json([
            'message' => $rr->status === 'approved' ? 'Return request approved.' : 'Return request rejected.',
            'data'    => $this->format($rr, OrderItem::where('seller_id', $sellerId)->where('order_id', $rr->order_id)
                ->get(['order_id', 'product_name', 'quantity', 'unit_price'])),
        ]);
    }

    public function photo(Request $request, int $id, string $filename)
    {
        $sellerId = $this->sellerId($request);
        abort_unless(ReturnDecisionService::sellerOwns($id, $sellerId), 404);

        return ReturnDecisionService::photo(ReturnRequest::findOrFail($id), $filename);
    }

    private function format(ReturnRequest $r, $items): array
    {
        return [
            'id'              => $r->id,
            'order_id'        => $r->order_id,
            'order_number'    => BuyerNotificationService::orderNumber((int) $r->order_id),
            'order_status'    => $r->order?->status,
            'buyer_name'      => $r->order?->shipping_name,
            'reason'          => $r->reason,
            'description'     => $r->description,
            'images'          => collect($r->images ?? [])->map(fn ($p) => url("/seller/returns/{$r->id}/photo/" . basename((string) $p)))->values(),
            'items'           => collect($items)->map(fn ($i) => [
                'name'       => $i->product_name,
                'quantity'   => (int) $i->quantity,
                'unit_price' => (float) $i->unit_price,
            ])->values(),
            'items_total'     => round((float) collect($items)->sum(fn ($i) => $i->quantity * $i->unit_price), 2),
            'status'          => $r->status,
            'seller_response' => $r->seller_response,
            'responded_at'    => $r->responded_at?->toISOString(),
            'escalated_at'    => $r->escalated_at?->toISOString(),
            'can_decide'      => $r->status === 'pending',
            'created_at'      => $r->created_at?->toISOString(),
        ];
    }
}
