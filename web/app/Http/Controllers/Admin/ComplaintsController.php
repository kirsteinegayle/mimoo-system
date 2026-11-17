<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\User;
use App\Services\BuyerNotificationService;
use App\Services\UserNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/** ERP Admin: Manage Complaints and Disputes. */
class ComplaintsController extends Controller
{
    private const PER_PAGE = 15;

    public function index(Request $request): Response
    {
        $f = $request->validate([
            'status' => ['nullable', 'in:' . implode(',', Complaint::STATUSES)],
            'type' => ['nullable', 'in:' . implode(',', array_keys(Complaint::TYPES))],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $q = Complaint::query()->with(['buyer:id,name', 'seller:id,name,business_name', 'courier:id,name,company_name']);
        if (! empty($f['status'])) {
            $q->where('status', $f['status']);
        }
        if (! empty($f['type'])) {
            $q->where('type', $f['type']);
        }
        if (! empty($f['q'])) {
            $term = trim($f['q']);
            $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $term) . '%';
            $orderId = (int) preg_replace('/\D/', '', $term);
            $q->where(fn ($w) => $w->where('description', 'like', $like)
                ->orWhereHas('buyer', fn ($b) => $b->where('name', 'like', $like))
                ->orWhereHas('seller', fn ($s) => $s->where('name', 'like', $like)->orWhere('business_name', 'like', $like))
                ->when($orderId > 0, fn ($o) => $o->orWhere('order_id', $orderId)));
        }

        $page = $q->orderByDesc('id')->paginate(self::PER_PAGE)->withQueryString();
        $counts = Complaint::selectRaw('status, COUNT(*) c')->groupBy('status')->pluck('c', 'status');

        return Inertia::render('admin/Complaints', [
            'complaints' => $page->getCollection()->map(fn (Complaint $c) => $this->row($c))->values(),
            'filters' => ['status' => $f['status'] ?? '', 'type' => $f['type'] ?? '', 'q' => $f['q'] ?? ''],
            'counts' => collect(Complaint::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($counts[$s] ?? 0)]),
            'types' => collect(Complaint::TYPES)->map(fn ($label, $key) => ['value' => $key, 'label' => $label])->values(),
            'pagination' => [
                'current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'total' => $page->total(), 'from' => $page->firstItem(), 'to' => $page->lastItem(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $c = Complaint::with(['buyer', 'seller', 'courier', 'order'])->findOrFail($id);

        $party = fn (?User $u) => $u ? [
            'id' => $u->id,
            'name' => $u->business_name ?: ($u->company_name ?: $u->name),
            'email' => $u->email,
            'phone' => $u->contact_number,
        ] : null;

        // array_merge (not +): the detail's buyer/seller/courier objects must replace the list row's name strings.
        return response()->json(array_merge($this->row($c), [
            'description' => $c->description,
            'admin_notes' => $c->admin_notes,
            'resolution' => $c->resolution,
            'resolved_at' => $c->resolved_at?->format('M d, Y g:i A'),
            'order_status' => $c->order?->status,
            'waybill' => $c->order?->waybill_number,
            'buyer' => $party($c->buyer),
            'seller' => $party($c->seller),
            'courier' => $party($c->courier),
            'evidence' => collect($c->evidence ?? [])->map(fn ($e, $i) => [
                'name' => $e['name'] ?? ('file-' . ($i + 1)),
                'is_image' => str_starts_with((string) ($e['mime'] ?? ''), 'image/'),
                'url' => "/admin/complaints/{$c->id}/evidence/{$i}",
            ])->values(),
        ]));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $c = Complaint::findOrFail($id);

        $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', Complaint::STATUSES)],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
            'resolution' => ['nullable', 'string', 'max:2000', 'required_if:status,resolved', 'required_if:status,rejected'],
            'message' => ['nullable', 'string', 'max:500'],
            'notify' => ['nullable', 'array'],
            'notify.*' => ['in:buyer,seller,courier'],
        ], [
            'resolution.required_if' => 'Write the resolution (what was decided) before closing the complaint.',
        ]);

        $changed = $c->status !== $data['status'];
        $c->fill([
            'status' => $data['status'],
            'admin_notes' => $data['admin_notes'] ?? $c->admin_notes,
            'resolution' => $data['resolution'] ?? $c->resolution,
            'resolved_at' => in_array($data['status'], ['resolved', 'rejected'], true) ? ($c->resolved_at ?? now()) : null,
        ])->save();

        // Tell the involved parties. Internal admin notes are never included.
        $roles = $data['notify'] ?? ['buyer', 'seller', 'courier'];
        $num = BuyerNotificationService::orderNumber($c->order_id);
        $label = ['open' => 'reopened', 'in_review' => 'now under review', 'resolved' => 'resolved', 'rejected' => 'closed (no action)'][$c->status];
        $body = "The complaint on order {$num} is {$label}."
            . (in_array($c->status, ['resolved', 'rejected'], true) && $c->resolution ? ' Decision: ' . Str::limit($c->resolution, 220) : '')
            . (! empty($data['message']) ? ' Message from mimoo: ' . trim($data['message']) : '');
        $key = 'complaint:' . $c->id . ':' . $c->status . ':' . md5($body);

        if ($changed || ! empty($data['message'])) {
            foreach (['buyer' => $c->buyer_id, 'seller' => $c->seller_id, 'courier' => $c->courier_id] as $role => $uid) {
                if ($uid && in_array($role, $roles, true) && ($user = User::find($uid))) {
                    UserNotifier::send($user, 'complaint_update', 'Complaint update', $body, $key . ':' . $role, ['complaint_id' => $c->id],
                        $role === 'buyer' ? '/complaints' : ($role === 'seller' ? '/seller/dashboard' : '/courier/dashboard'));
                }
            }
        }

        return back()->with('success', 'Complaint #' . $c->id . ' updated.');
    }

    /** Streams one evidence file from the private disk (admin session only). */
    public function evidence(int $id, int $index): HttpResponse
    {
        $c = Complaint::findOrFail($id);
        $file = ($c->evidence ?? [])[$index] ?? null;
        $path = $file['path'] ?? null;

        // Only paths this complaint owns; never trust the stored value blindly.
        abort_unless($path && str_starts_with($path, "complaints/{$c->id}/") && ! str_contains($path, '..') && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path, $file['name'] ?? basename($path), ['X-Content-Type-Options' => 'nosniff']);
    }

    private function row(Complaint $c): array
    {
        return [
            'id' => $c->id,
            'order_id' => $c->order_id,
            'order_number' => BuyerNotificationService::orderNumber($c->order_id),
            'type' => $c->type,
            'type_label' => Complaint::TYPES[$c->type] ?? $c->type,
            'status' => $c->status,
            'buyer' => $c->buyer?->name,
            'seller' => $c->seller ? ($c->seller->business_name ?: $c->seller->name) : null,
            'courier' => $c->courier ? ($c->courier->company_name ?: $c->courier->name) : null,
            'created_at' => $c->created_at?->format('M d, Y'),
            'evidence_count' => count($c->evidence ?? []),
        ];
    }
}
