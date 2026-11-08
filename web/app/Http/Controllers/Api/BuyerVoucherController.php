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

        $user = $request->user();

        $vouchers = Voucher::where('status', 'active')
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now())
            ->where(function ($q) {
                // usage_limit null = unlimited; otherwise must have remaining uses
                $q->whereNull('usage_limit')
                  ->orWhereRaw('usage_count < usage_limit');
            })
            ->orderBy('valid_until') // soonest expiry first
            ->get();

        // Fetch all claim rows for this user in one query (no N+1)
        $voucherIds = $vouchers->pluck('id');
        $claims = VoucherUsage::where('user_id', $user->id)
            ->whereIn('voucher_id', $voucherIds)
            ->get()
            ->keyBy('voucher_id');

        return response()->json([
            'data' => $vouchers->map(fn ($v) => $this->voucherRow($v, $claims->get($v->id)))->values(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/buyer/vouchers/claim
    // Accept { id: int } or { code: string }. Idempotent.
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

        $user = $request->user();

        // Look up by id or code (case-insensitive, trimmed)
        $query = Voucher::query();
        if ($request->filled('id')) {
            $query->where('id', (int) $request->input('id'));
        } else {
            $query->where('code', strtoupper(trim($request->input('code'))));
        }
        $voucher = $query->first();

        // Voucher not found
        if (! $voucher) {
            return response()->json(['message' => 'Voucher not found.'], 404);
        }

        // Not active (inactive or expired status)
        if ($voucher->status !== 'active') {
            $msg = $voucher->status === 'expired'
                ? 'This voucher has expired.'
                : 'This voucher is no longer active.';
            return response()->json(['message' => $msg], 422);
        }

        // Not yet started
        if (now()->lt($voucher->valid_from)) {
            return response()->json([
                'message' => 'This voucher is not yet available. It starts on ' . $voucher->valid_from->format('M d, Y') . '.',
            ], 422);
        }

        // Expired
        if (now()->gt($voucher->valid_until)) {
            return response()->json(['message' => 'This voucher has expired.'], 422);
        }

        // Global usage limit exceeded
        if ($voucher->usage_limit !== null && $voucher->usage_count >= $voucher->usage_limit) {
            return response()->json(['message' => 'This voucher has been fully claimed.'], 422);
        }

        // Idempotent: already claimed
        $existing = VoucherUsage::where('voucher_id', $voucher->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already claimed this voucher.',
                'data'    => $this->voucherRow($voucher, $existing),
            ]);
        }

        // Create claim record
        // NOTE: VoucherUsage::$fillable is missing claimed_at (bug in web model).
        // Use DB::table or updateOrCreate with unguarded to avoid mass-assignment issues.
        $claim = new VoucherUsage();
        $claim->voucher_id  = $voucher->id;
        $claim->user_id     = $user->id;
        $claim->claimed_at  = now();
        // order_id, discount_amount, used_at remain null until checkout
        $claim->save();

        // Increment usage_count
        $voucher->increment('usage_count');

        return response()->json([
            'message' => 'Voucher claimed successfully!',
            'data'    => $this->voucherRow($voucher->fresh(), $claim),
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
