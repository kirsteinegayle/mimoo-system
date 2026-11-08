<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ReturnRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Return / refund requests (auth:sanctum, buyer only).
 *
 * POST /api/buyer/orders/{id}/return       (multipart: reason, description, images[])
 * GET  /api/buyer/returns
 * GET  /api/buyer/returns/{id}
 * POST /api/buyer/returns/{id}/escalate
 * GET  /api/buyer/return-photo/{filename}  (image serving)
 *
 * Window: order status shipped|completed AND order.updated_at + 7 days in the
 * future (no shipped_at/completed_at columns exist, so updated_at is used).
 * One open request (pending/approved/escalated) per order.
 * Escalate: only when rejected, once, within 3 days of responded_at
 * (falls back to updated_at if responded_at is null).
 */
class BuyerReturnController extends Controller
{
    use BuyerApiHelpers;

    private const FOLDER = 'return_photos';
    private const PREFIX = 'return';

    private function format(ReturnRequest $r): array
    {
        $order = $r->order;
        return [
            'id'              => $r->id,
            'order_id'        => $r->order_id,
            'order_number'    => 'MIM-' . str_pad($r->order_id, 8, '0', STR_PAD_LEFT),
            'order_status'    => $order?->status,
            'order_total'     => $order ? (float) $order->total : null,
            'reason'          => $r->reason,
            'description'     => $r->description,
            'images'          => collect($r->images ?? [])->map(fn ($p) => $this->imageUrlFor($p, 'return-photo'))->values(),
            'status'          => $r->status,
            'seller_response' => $r->seller_response,
            'responded_at'    => $r->responded_at?->toISOString(),
            'escalated_at'    => $r->escalated_at?->toISOString(),
            'can_escalate'    => $r->canEscalate(),
            'created_at'      => $r->created_at?->toISOString(),
            'updated_at'      => $r->updated_at?->toISOString(),
        ];
    }

    // POST /api/buyer/orders/{id}/return
    public function store(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $user = $request->user();

        $order = Order::where('buyer_id', $user->id)->find($id);
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (! in_array($order->status, ['shipped', 'completed'], true)) {
            return $this->validationError('order', 'Returns can only be requested for shipped or completed orders.');
        }
        if ($order->updated_at->copy()->addDays(ReturnRequest::REQUEST_WINDOW_DAYS)->isPast()) {
            return $this->validationError('order', 'The 7-day return period for this order has ended.');
        }

        $request->validate([
            'reason'      => ['required', 'string', Rule::in(ReturnRequest::REASONS)],
            'description' => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'reason.required'      => 'Please select a reason.',
            'reason.in'            => 'Please select a valid reason.',
            'description.required' => 'Please describe the problem.',
            'description.min'      => 'Description must be at least 10 characters.',
            'description.max'      => 'Description must not exceed 500 characters.',
        ]);

        $files = $request->file('images', []);
        if (! is_array($files)) {
            $files = [$files];
        }
        if (count($files) < 1) {
            return $this->validationError('images', 'Please add at least 1 photo.');
        }
        if (count($files) > 5) {
            return $this->validationError('images', 'You can upload up to 5 photos only.');
        }
        foreach ($files as $f) {
            if ($msg = $this->imageError($f)) {
                return $this->validationError('images', $msg);
            }
        }

        $paths = array_map(fn ($f) => $this->storeImage($f, self::FOLDER, self::PREFIX), $files);

        $rr = DB::transaction(function () use ($order, $user, $request, $paths) {
            // Lock the order row so two concurrent requests can't both pass the "one open" check.
            Order::whereKey($order->id)->lockForUpdate()->first();

            $open = ReturnRequest::where('order_id', $order->id)
                ->whereIn('status', ReturnRequest::OPEN_STATUSES)
                ->exists();
            if ($open) {
                return null;
            }

            return ReturnRequest::create([
                'order_id'    => $order->id,
                'buyer_id'    => $user->id,
                'reason'      => $request->input('reason'),
                'description' => trim($request->input('description')),
                'images'      => $paths,
                'status'      => 'pending',
            ]);
        });

        if (! $rr) {
            foreach ($paths as $p) Storage::disk('public')->delete($p);
            return $this->validationError('order', 'This order already has an open return request.');
        }

        return response()->json([
            'message' => 'Return request submitted.',
            'data'    => $this->format($rr->load('order')),
        ], 201);
    }

    // GET /api/buyer/returns
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $list = ReturnRequest::with('order')
            ->where('buyer_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $list->map(fn ($r) => $this->format($r))->values()]);
    }

    // GET /api/buyer/returns/{id}
    public function show(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $rr = ReturnRequest::with('order')->where('buyer_id', $request->user()->id)->find($id);
        if (! $rr) {
            return response()->json(['message' => 'Return request not found.'], 404);
        }

        return response()->json(['data' => $this->format($rr)]);
    }

    // POST /api/buyer/returns/{id}/escalate
    public function escalate(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $rr = ReturnRequest::with('order')->where('buyer_id', $request->user()->id)->find($id);
        if (! $rr) {
            return response()->json(['message' => 'Return request not found.'], 404);
        }

        if ($rr->escalated_at !== null) {
            return $this->validationError('return', 'This request has already been escalated.');
        }
        if ($rr->status !== 'rejected') {
            return $this->validationError('return', 'Only rejected requests can be escalated.');
        }
        if (! $rr->canEscalate()) {
            return $this->validationError('return', 'The 3-day escalation period has ended.');
        }

        $rr->update(['status' => 'escalated', 'escalated_at' => now()]);

        return response()->json([
            'message' => 'Your request was escalated for review.',
            'data'    => $this->format($rr->fresh()->load('order')),
        ]);
    }

    // GET /api/buyer/return-photo/{filename}
    public function servePhoto(string $filename): Response
    {
        return $this->serveStoredImage(self::FOLDER, self::PREFIX, $filename);
    }
}
