<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Validation\Validator;
use Inertia\Inertia;

/**
 * Admin > Vouchers (create / edit / enable-disable / delete) and the buyer web
 * endpoints /api/vouchers/{available,claim,validate}. Buyer rules live in
 * App\Services\VoucherService (same as /buyer/vouchers* and the mobile API).
 *
 * Dates: the form sends local time (Asia/Manila, "YYYY-MM-DDTHH:mm"); they are
 * stored in UTC like every other timestamp in the app.
 */
class VoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::withCount('usages')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($voucher) {
                $from  = VoucherService::local($voucher->valid_from);
                $until = VoucherService::local($voucher->valid_until);

                return [
                    'id' => $voucher->id,
                    'code' => $voucher->code,
                    'name' => $voucher->name,
                    'description' => $voucher->description,
                    'type' => $voucher->type,
                    'value' => $voucher->value,
                    'min_purchase' => $voucher->min_purchase,
                    'max_discount' => $voucher->max_discount,
                    'usage_limit' => $voucher->usage_limit,
                    'usage_per_user' => $voucher->usage_per_user,
                    'usage_count' => $voucher->usage_count,
                    'usages_count' => $voucher->usages_count,
                    // Display (local time) + values for the datetime-local inputs.
                    'valid_from' => $from?->format('M d, Y g:i A'),
                    'valid_until' => $until?->format('M d, Y g:i A'),
                    'valid_from_input' => $from?->format('Y-m-d\TH:i'),
                    'valid_until_input' => $until?->format('Y-m-d\TH:i'),
                    'status' => $voucher->status,
                    'terms_conditions' => $voucher->terms_conditions,
                    'implemented_by' => $voucher->implemented_by,
                    'created_at' => $voucher->created_at->format('M d, Y'),
                    'is_valid' => $voucher->isValid(),
                ];
            });

        return Inertia::render('admin/Vouchers', [
            'vouchers' => $vouchers,
        ]);
    }

    private function rules(?Voucher $voucher = null): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9_-]+$/', 'unique:vouchers,code' . ($voucher ? ',' . $voucher->id : '')],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|gt:0',
            'min_purchase' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|gt:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_per_user' => 'required|integer|min:1|max:100',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'terms_conditions' => 'nullable|array',
            'terms_conditions.*' => 'nullable|string|max:500',
            'implemented_by' => 'nullable|string|max:255',
        ] + ($voucher ? ['status' => 'required|in:active,inactive,expired'] : []);
    }

    private function messages(): array
    {
        return [
            'code.regex' => 'Use letters, numbers, dashes or underscores only (no spaces).',
            'value.gt' => 'The discount must be greater than zero.',
            'max_discount.gt' => 'The max discount must be greater than zero (or leave it empty).',
            'valid_until.after' => 'The end date must be after the start date.',
        ];
    }

    /** Type-specific checks: % between 1 and 100; end date in the future. */
    private function extraChecks(Validator $v, Request $request): void
    {
        $v->after(function (Validator $v) use ($request) {
            if ($request->input('type') === 'percentage' && (float) $request->input('value') > 100) {
                $v->errors()->add('value', 'A percentage discount cannot be more than 100%.');
            }
            if ($request->filled('valid_until')) {
                try {
                    if (VoucherService::toUtc((string) $request->input('valid_until'))->isPast()) {
                        $v->errors()->add('valid_until', 'The end date is already in the past.');
                    }
                } catch (\Throwable) {
                    // the 'date' rule reports the format error
                }
            }
        });
    }

    private function normalize(array $data): array
    {
        $data['code'] = strtoupper(trim($data['code']));
        $data['valid_from'] = VoucherService::toUtc((string) $data['valid_from']);
        $data['valid_until'] = VoucherService::toUtc((string) $data['valid_until']);
        if (($data['type'] ?? null) === 'fixed') {
            $data['max_discount'] = null; // only meaningful for percentages
        }
        if (isset($data['terms_conditions'])) {
            $data['terms_conditions'] = array_values(array_filter(array_map('trim', $data['terms_conditions']), fn ($t) => $t !== ''));
        }

        return $data;
    }

    public function store(Request $request)
    {
        $request->merge(['code' => strtoupper(trim((string) $request->input('code')))]);
        $v = validator($request->all(), $this->rules(), $this->messages());
        $this->extraChecks($v, $request);
        $validated = $v->validate();

        Voucher::create($this->normalize($validated) + ['status' => 'active']);

        return redirect()->back()->with('success', 'Voucher created successfully!');
    }

    public function update(Request $request, Voucher $voucher)
    {
        $request->merge(['code' => strtoupper(trim((string) $request->input('code')))]);
        $v = validator($request->all(), $this->rules($voucher), $this->messages());
        $v->after(function (Validator $v) use ($request, $voucher) {
            if ($request->filled('usage_limit') && (int) $request->input('usage_limit') < (int) $voucher->usage_count) {
                $v->errors()->add('usage_limit', "This voucher was already used {$voucher->usage_count} time(s); the limit cannot be lower.");
            }
        });
        // Only require a future end date when the voucher should be live.
        if ($request->input('status') === 'active') {
            $this->extraChecks($v, $request);
        }
        $validated = $v->validate();

        $voucher->update($this->normalize($validated));

        return redirect()->back()->with('success', 'Voucher updated successfully!');
    }

    public function destroy(Voucher $voucher)
    {
        // Used in an order: keep it for the order history (disable it instead).
        if ($voucher->usage_count > 0 || $voucher->usages()->whereNotNull('used_at')->exists()) {
            // As a validation error so the admin page's onError shows it.
            return redirect()->back()->withErrors(['voucher' => 'This voucher was used in orders, so it cannot be deleted. Disable it instead.']);
        }

        $voucher->delete(); // unused wallet claims are removed with it (FK cascade)

        return redirect()->back()->with('success', 'Voucher deleted successfully!');
    }

    public function toggleStatus(Voucher $voucher)
    {
        $newStatus = $voucher->status === 'active' ? 'inactive' : 'active';
        $voucher->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Voucher status updated!');
    }

    // POST /api/vouchers/validate (web checkout "Apply")
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:0',
        ]);

        $check = VoucherService::prepareUse($request->user(), (string) $request->code, (float) $request->order_total, false);
        if (! $check['ok']) {
            return response()->json(['valid' => false, 'message' => $check['message']], 400);
        }

        $voucher = $check['voucher'];

        return response()->json([
            'valid' => true,
            'voucher' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'name' => $voucher->name,
                'type' => $voucher->type,
                'value' => $voucher->value,
                'discount_amount' => $check['discount'],
            ],
            'message' => 'Voucher applied successfully!',
        ]);
    }

    // GET /api/vouchers/available (web homepage refresh + checkout picker)
    public function available(Request $request)
    {
        return response()->json([
            'vouchers' => VoucherService::available($request->user()),
        ])->header('Cache-Control', 'no-store, private');
    }

    // POST /api/vouchers/claim { voucher_id } (web homepage "Claim")
    public function claim(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|integer',
        ]);

        $result = VoucherService::claim($request->user(), Voucher::find((int) $request->voucher_id));

        return response()->json([
            'success' => $result['ok'],
            'message' => $result['message'],
        ], $result['ok'] ? 200 : $result['status']);
    }
}
