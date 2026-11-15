<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Mobile buyer voucher endpoints (Sanctum Bearer auth).
 *
 * GET  /api/buyer/vouchers          — browseable (claimable) vouchers + claimed status
 * POST /api/buyer/vouchers/claim    — claim by id or code
 * GET  /api/buyer/vouchers/mine     — wallet: claimed, not yet used
 */
class BuyerVoucherController extends Controller
{
    // ── Buyer guard ───────────────────────────────────────────────────────────

    private function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can access vouchers.'], 403);
        }
        return null;
    }

    // ── Shared row builder ────────────────────────────────────────────────────

    private function voucherRow(Voucher $v, ?VoucherUsage $claim): array
    {
        return [
            'id'            => $v->id,
            'code'          => $v->code,
            'name'          => $v->name,
            'description'   => $v->description,
            'type'          => $v->type,          // percentage | fixed
            'value'         => (float) $v->value,
            'min_purchase'  => (float) $v->min_purchase,
            'max_discount'  => $v->max_discount !== null ? (float) $v->max_discount : null,
            'usage_limit'   => $v->usage_limit,
            'usage_per_user'=> $v->usage_per_user,
            'usage_count'   => $v->usage_count,
            'valid_from'    => $v->valid_from->toISOString(),
            'valid_until'   => $v->valid_until->toISOString(),
            'is_claimed'    => $claim !== null,
            'is_used'       => $claim !== null && $claim->used_at !== null,
            'claimed_at'    => $claim?->claimed_at
                ? \Carbon\Carbon::parse($claim->claimed_at)->toISOString()
                : null,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/vouchers
    // Shows all currently active, in-date, non-exhausted vouchers.
    // Does NOT show vouchers with status = 'inactive'.
    // Returns is_claimed per buyer so the UI can show Claim vs Claimed state.
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        // Same list and rules as the web homepage (App\Services\VoucherService).
        return response()->json([
            'data' => \App\Services\VoucherService::available($request->user()),
        ])->header('Cache-Control', 'no-store, private');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/vouchers/claim
    // Accept { id: int } or { code: string }. Idempotent while an unused claim exists.
    // Claiming never counts as a use (usage_count is incremented at checkout).
    // ─────────────────────────────────────────────────────────────────────────
    public function claim(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $request->validate([
            'id'   => ['nullable', 'integer'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        if (empty($request->input('id')) && empty($request->input('code'))) {
            return response()->json([
                'message' => 'Please provide a voucher id or code.',
                'errors'  => ['code' => ['Please provide a voucher id or code.']],
            ], 422);
        }

        $voucher = $request->filled('id')
            ? Voucher::find((int) $request->input('id'))
            : Voucher::where('code', strtoupper(trim((string) $request->input('code'))))->first();

        $result = \App\Services\VoucherService::claim($request->user(), $voucher);
        if (! $result['ok']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json([
            'message' => $result['message'],
            'data'    => \App\Services\VoucherService::row($result['voucher']->fresh(), $request->user()),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/buyer/vouchers/mine
    // Wallet: claimed vouchers, including already-used ones.
    // ─────────────────────────────────────────────────────────────────────────
    public function mine(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $user = $request->user();

        $claims = VoucherUsage::with('voucher')
            ->where('user_id', $user->id)
            ->whereNotNull('claimed_at')
            ->orderByDesc('claimed_at')
            ->get();

        return response()->json([
            'data' => $claims
                ->filter(fn ($c) => $c->voucher !== null)
                ->map(fn ($c) => $this->voucherRow($c->voucher, $c))
                ->values(),
        ]);
    }
}
