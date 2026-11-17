<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AccountStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** ERP Admin: Manage User Accounts (view profiles; activate, suspend, deactivate with audit log). */
class UserAccountsController extends Controller
{
    private const PER_PAGE = 15;

    private const ROLE_SQL = "COALESCE(NULLIF(users.role, ''), users.account_type)";

    public const ROLES = ['buyer', 'seller', 'courier', 'logistics_staff', 'rider'];

    public function index(Request $request): Response
    {
        $f = $request->validate([
            'role' => ['nullable', 'in:' . implode(',', self::ROLES)],
            'status' => ['nullable', 'in:active,suspended,deactivated,pending,disapproved'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $in = implode(',', array_fill(0, count(self::ROLES), '?'));
        $base = User::query()->where('users.account_type', '<>', 'admin')->whereRaw(self::ROLE_SQL . " IN ($in)", self::ROLES);

        $query = clone $base;
        if (! empty($f['role'])) {
            $query->whereRaw(self::ROLE_SQL . ' = ?', [$f['role']]);
        }
        if (! empty($f['status'])) {
            $query->where('users.status', $f['status'] === 'active' ? 'approved' : $f['status']);
        }
        if (! empty($f['q'])) {
            $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], trim($f['q'])) . '%';
            $query->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('email', 'like', $like)
                ->orWhere('business_name', 'like', $like)->orWhere('company_name', 'like', $like)
                ->orWhere('contact_number', 'like', $like));
        }

        $page = $query->orderByDesc('users.id')->paginate(self::PER_PAGE)->withQueryString();

        $rows = $page->getCollection()->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $this->displayName($u),
            'email' => $u->email,
            'role' => $this->roleOf($u),
            'status' => $u->status === 'approved' ? 'active' : (string) $u->status,
            'status_reason' => $u->status_reason,
            'warning_count' => (int) $u->warning_count,
            'created_at' => $u->created_at?->format('M d, Y'),
        ])->values();

        $counts = (clone $base)->selectRaw('users.status as st, COUNT(*) c')->groupBy('users.status')->pluck('c', 'st');

        return Inertia::render('admin/UserAccounts', [
            'users' => $rows,
            'filters' => ['role' => $f['role'] ?? '', 'status' => $f['status'] ?? '', 'q' => $f['q'] ?? ''],
            'counts' => [
                'total' => (int) $counts->sum(),
                'active' => (int) ($counts['approved'] ?? 0),
                'suspended' => (int) ($counts['suspended'] ?? 0),
                'deactivated' => (int) ($counts['deactivated'] ?? 0),
            ],
            'pagination' => [
                'current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'total' => $page->total(), 'from' => $page->firstItem(), 'to' => $page->lastItem(),
            ],
        ]);
    }

    /** Profile for the modal. */
    public function show(int $id): JsonResponse
    {
        $u = $this->findManaged($id);

        $role = $this->roleOf($u);
        $stats = match ($role) {
            'buyer' => ['Orders placed' => DB::table('orders')->where('buyer_id', $u->id)->count()],
            'seller' => [
                'Products' => DB::table('products')->where('seller_id', $u->id)->whereNull('deleted_at')->count(),
                'Items sold' => (int) DB::table('order_items')->where('seller_id', $u->id)->sum('quantity'),
                'Warnings' => (int) $u->warning_count,
            ],
            default => [],
        };

        $address = collect([$u->street_address, $u->barangay, $u->municipality_city, $u->province, $u->region])->filter()->implode(', ');

        return response()->json([
            'id' => $u->id,
            'name' => $this->displayName($u),
            'email' => $u->email,
            'contact_number' => $u->contact_number,
            'role' => $role,
            'status' => $u->status === 'approved' ? 'active' : (string) $u->status,
            'status_reason' => $u->status_reason,
            'status_changed_at' => $u->status_changed_at?->format('M d, Y g:i A'),
            'business_name' => $u->business_name ?: $u->company_name,
            'registered_category' => $u->line_of_business,
            'address' => $address ?: null,
            'verification' => $u->verification_status,
            'joined' => $u->created_at?->format('M d, Y'),
            'stats' => $stats,
            'logs' => DB::table('user_status_logs')->where('user_id', $u->id)->orderByDesc('id')->limit(10)->get()
                ->map(fn ($l) => [
                    'action' => $l->action, 'from' => $l->from_status, 'to' => $l->to_status,
                    'reason' => $l->reason, 'by' => $l->acted_by,
                    'at' => \Illuminate\Support\Carbon::parse($l->created_at)->format('M d, Y g:i A'),
                ])->values(),
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $u = $this->findManaged($id);

        $data = $request->validate([
            'action' => ['required', 'in:activate,suspend,deactivate'],
            'reason' => ['nullable', 'string', 'max:500', 'required_if:action,suspend', 'required_if:action,deactivate'],
        ], [
            'reason.required_if' => 'Please give a reason. The user will see it when they try to sign in.',
        ]);

        $error = AccountStatus::change($u, $data['action'], isset($data['reason']) ? trim($data['reason']) : null, $request->ip());
        if ($error) {
            return back()->withErrors(['action' => $error]);
        }

        $word = ['activate' => 'activated', 'suspend' => 'suspended', 'deactivate' => 'deactivated'][$data['action']];

        return back()->with('success', $this->displayName($u) . " was {$word}.");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function findManaged(int $id): User
    {
        $u = User::findOrFail($id);
        abort_if($u->account_type === 'admin' || ! in_array($this->roleOf($u), self::ROLES, true), 404);

        return $u;
    }

    private function roleOf(User $u): string
    {
        return (string) ($u->role ?: $u->account_type);
    }

    private function displayName(User $u): string
    {
        return (string) ($u->business_name ?: $u->company_name ?: $u->name);
    }
}
