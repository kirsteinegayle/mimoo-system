<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Show the master code entry form.
     *
     * Redirects directly to the dashboard if the session is already verified.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        if ($request->session()->get('admin_verified', false)) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('admin/login');
    }

    /**
     * Verify the submitted master code against the value stored in .env.
     *
     * Uses a constant-time comparison to prevent timing attacks.
     * Returns a generic error message regardless of which part of the code was wrong.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        // ADMIN_MASTER_CODE, or the code set in Admin > Settings (stored hashed).
        if (! AdminAccountController::codeMatches((string) $request->input('code'))) {
            return back()->withErrors(['code' => 'Invalid code.']);
        }

        $request->session()->put('admin_verified', true);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    /**
     * Show the admin dashboard.
     */
    public function dashboard(): Response
    {
        // Get stats
        // Buyers don't require approval, so count all buyers
        $totalBuyers = \App\Models\User::where('account_type', 'buyer')->count();
        // Sellers and couriers require approval
        $totalSellers = \App\Models\User::where('account_type', 'seller')->where('status', 'approved')->count();
        $totalCouriers = \App\Models\User::where('account_type', 'logistics')->where('status', 'approved')->count();
        $totalOrders = \App\Models\Order::count();
        
        // Revenue this month (sum of all completed orders this month)
        $revenueMTD = \App\Models\Order::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');
        
        // Pending registrations (sellers and logistics only, buyers auto-approved)
        $pendingRegistrations = $this->sellerQueue()->where('status', 'pending')->count()
            + $this->logisticsQueue()->where('status', 'pending')->count();
        $pendingToday = $this->sellerQueue()->where('status', 'pending')->whereDate('created_at', today())->count()
            + $this->logisticsQueue()->where('status', 'pending')->whereDate('created_at', today())->count();
        
        // Orders by status
        $ordersInProgress = \App\Models\Order::whereIn('status', ['pending', 'paid', 'packed', 'shipped'])->count();
        $activeDeliveries = \App\Models\Order::where('status', 'shipped')->count();
        
        // Products pending approval
        $productsPending = \App\Models\Product::submitted()->where('approval_status', 'pending')->count();
        
        // Commission this month: same service as Manage Commission / Generate Reports (delivered or completed orders only).
        $commissionThisMonth = (float) \App\Services\SalesReport::build([
            'from' => now()->startOfMonth()->toDateString(), 'to' => now()->toDateString(),
            'seller_id' => null, 'status' => 'completed', 'type' => 'commission',
        ])['summary']['commission'];
        
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalBuyers' => $totalBuyers,
                'totalSellers' => $totalSellers,
                'totalCouriers' => $totalCouriers,
                'totalOrders' => $totalOrders,
                'revenueMTD' => (float) $revenueMTD,
            ],
            'attention' => [
                'pendingRegistrations' => $pendingRegistrations,
                'pendingToday' => $pendingToday,
                'complianceFlags' => \App\Http\Controllers\Admin\SellerComplianceController::flaggedCount(),
                'openDisputes' => \Illuminate\Support\Facades\Schema::hasTable('complaints') ? \App\Models\Complaint::whereIn('status', ['open', 'in_review'])->count() : 0,
                'commissionThisMonth' => (float) $commissionThisMonth,
                'commissionRate' => (float) config('platform.commission_rate'),
            ],
            'operations' => [
                'activeDeliveries' => $activeDeliveries,
                'ordersInProgress' => $ordersInProgress,
                'supportTickets' => 0, // Placeholder
            ],
            'products' => [
                'pendingApproval' => $productsPending,
            ],
            'salesTrend'     => \App\Services\AdminDashboardStats::salesTrend(),
            'ordersByStatus' => \App\Services\AdminDashboardStats::ordersByStatus(),
            'topSellers'     => \App\Services\AdminDashboardStats::topSellers(),
        ]);
    }

    /** Rows per page for the admin approval lists. */
    private const LIST_PER_PAGE = 10;

    /**
     * Apply the status filter, search and newest/oldest sort from the query
     * string, server side. Default: newest first.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string[]  $searchColumns
     * @return array{status: string, sort: string, q: string}
     */
    private function applyListFilters($query, Request $request, array $searchColumns): array
    {
        $status = strtolower((string) $request->query('status', 'all'));
        if (! in_array($status, ['pending', 'approved', 'disapproved'], true)) {
            $status = 'all';
        }
        $sort = $request->query('sort') === 'oldest' ? 'oldest' : 'newest';
        $q = trim((string) $request->query('q', ''));

        if ($status !== 'all') {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', ['pending', 'approved', 'disapproved']);
        }

        if ($q !== '') {
            $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q) . '%';
            $query->where(function ($w) use ($searchColumns, $like) {
                foreach ($searchColumns as $col) {
                    $w->orWhere($col, 'like', $like);
                }
            });
        }

        $query->orderBy('created_at', $sort === 'oldest' ? 'asc' : 'desc')
            ->orderBy('id', $sort === 'oldest' ? 'asc' : 'desc');

        return ['status' => $status, 'sort' => $sort, 'q' => $q];
    }

    /** @return array<string, int> */
    private function approvalStats(\Illuminate\Database\Eloquent\Builder $base): array
    {
        return [
            'total' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'approved' => (clone $base)->where('status', 'approved')->count(),
            'disapproved' => (clone $base)->where('status', 'disapproved')->count(),
        ];
    }

    /** Seller applications that appear in the admin queue. */
    private function sellerQueue(): \Illuminate\Database\Eloquent\Builder
    {
        return \App\Models\User::query()
            ->where('account_type', 'seller')
            ->where('verification_status', 'verified');
    }

    /**
     * Logistics companies (hub) only. Courier-hub applications are reviewed by the
     * logistics company, and rider applications by the courier - never by admin.
     */
    private function logisticsQueue(): \Illuminate\Database\Eloquent\Builder
    {
        return \App\Models\User::query()
            ->where('account_type', 'logistics')
            ->where('role', 'logistics_staff')
            ->where('verification_status', 'verified');
    }

    private function pagination(\Illuminate\Pagination\LengthAwarePaginator $p): array
    {
        return [
            'current_page' => $p->currentPage(),
            'last_page' => $p->lastPage(),
            'per_page' => $p->perPage(),
            'total' => $p->total(),
            'from' => $p->firstItem(),
            'to' => $p->lastItem(),
        ];
    }

    /**
     * Pending Approval hub: pending logistics + seller applicants in one place.
     * Uses the same queues as the dedicated approval pages so counts always match.
     */
    public function pendingApproval(): Response
    {
        $map = fn ($u, $name) => [
            'id' => $u->id,
            'name' => $name,
            'contact' => $u->name,
            'email' => $u->email,
            'created_at' => $u->created_at->format('M d, Y'),
        ];

        $sellers = $this->sellerQueue()->where('status', 'pending')->latest()->get()
            ->map(fn ($u) => $map($u, $u->business_name ?: $u->name))->values();

        $logistics = $this->logisticsQueue()->where('status', 'pending')->latest()->get()
            ->map(fn ($u) => $map($u, $u->company_name ?? $u->business_name ?? $u->name))->values();

        return Inertia::render('admin/PendingApproval', [
            'sellers' => $sellers,
            'logistics' => $logistics,
        ]);
    }

    /**
     * Accounts Approval: one page for every role that needs admin approval (sellers, logistics).
     * Filter buttons pick the role; status / search / sort / pagination run on the server.
     */
    public function accountsApproval(Request $request): Response
    {
        $type = $request->query('type') === 'logistics' ? 'logistics' : 'seller';
        $query = $type === 'logistics' ? $this->logisticsQueue() : $this->sellerQueue();
        $filters = $this->applyListFilters($query, $request, ['name', 'first_name', 'last_name', 'email', 'business_name', 'company_name', 'trade_name']);
        $page = $query->paginate(self::LIST_PER_PAGE)->withQueryString();

        $rows = $page->getCollection()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $type === 'logistics' ? ($u->company_name ?? $u->business_name ?? $u->name) : ($u->business_name ?: $u->name),
            'contact' => $u->name,
            'email' => $u->email,
            'status' => $u->status,
            'status_reason' => $u->status_reason,
            'created_at' => $u->created_at->format('M d, Y'),
            'approved_at' => $u->approved_at?->format('M d, Y'),
        ])->values();

        return Inertia::render('admin/AccountsApproval', [
            'type' => $type,
            'rows' => $rows,
            'filters' => $filters,
            'pagination' => $this->pagination($page),
            'counts' => [
                'seller' => $this->approvalStats($this->sellerQueue()),
                'logistics' => $this->approvalStats($this->logisticsQueue()),
            ],
        ]);
    }

    /**
     * Show the seller approval page.
     */
    public function sellerApproval(Request $request): Response
    {
        $query = $this->sellerQueue();
        $filters = $this->applyListFilters($query, $request, ['name', 'first_name', 'last_name', 'email', 'business_name']);

        $page = $query->paginate(self::LIST_PER_PAGE)->withQueryString();

        $registrations = $page->getCollection()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'account_type' => $user->account_type,
            'business_name' => $user->business_name,
            'status' => $user->status,
            'created_at' => $user->created_at->format('M d, Y'),
            'approved_at' => $user->approved_at?->format('M d, Y'),
        ])->values();

        return Inertia::render('admin/seller-approval', [
            'registrations' => $registrations,
            'stats' => $this->approvalStats($this->sellerQueue()),
            'filters' => $filters,
            'pagination' => $this->pagination($page),
        ]);
    }

    /**
     * Show the logistics approval page.
     */
    public function logisticsApproval(Request $request): Response
    {
        $query = $this->logisticsQueue();
        $filters = $this->applyListFilters($query, $request, ['name', 'business_name', 'company_name', 'trade_name', 'email']);

        $page = $query->paginate(self::LIST_PER_PAGE)->withQueryString();

        $registrations = $page->getCollection()->map(fn ($user) => [
            'id' => $user->id,
            'company_name' => $user->company_name ?? $user->business_name ?? $user->name,
            'email' => $user->email,
            'account_type' => $user->account_type,
            'status' => $user->status,
            'created_at' => $user->created_at->format('M d, Y'),
            'approved_at' => $user->approved_at?->format('M d, Y'),
        ])->values();

        return Inertia::render('admin/LogisticsApproval', [
            'registrations' => $registrations,
            'stats' => $this->approvalStats($this->logisticsQueue()),
            'filters' => $filters,
            'pagination' => $this->pagination($page),
        ]);
    }
    /**
     * Show the product approval page.
     */
    public function productApproval(): Response
    {
        return Inertia::render('admin/ProductApproval');
    }

    /**
     * Show the product reports page.
     */
    public function productReports(): Response
    {
        return Inertia::render('admin/ProductReports');
    }

    /**
     * Approve a seller registration.
     */
    public function approveSellerRegistration(Request $request, int $userId): RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        if ($user->account_type !== 'seller') {
            return back()->withErrors(['error' => 'This account is not a seller.']);
        }
        
        $user->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return back()->with('success', "Seller account for {$user->name} has been approved.");
    }

    /**
     * Disapprove a seller registration.
     */
    public function disapproveSellerRegistration(Request $request, int $userId): RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        if ($user->account_type !== 'seller') {
            return back()->withErrors(['error' => 'This account is not a seller.']);
        }
        
        $reason = $request->validate(['reason' => ['nullable', 'string', 'max:500']])['reason'] ?? null;

        $user->forceFill([
            'status' => 'disapproved',
            'approved_at' => null,
            'status_reason' => $reason ? trim($reason) : null,
            'status_changed_at' => now(),
        ])->save();

        return back()->with('success', "Seller account for {$user->name} has been disapproved.");
    }

    /**
     * Approve a logistics registration.
     */
    public function approveLogisticsRegistration(Request $request, int $userId): RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        if ($user->account_type !== 'logistics' || $user->role !== 'logistics_staff') {
            return back()->withErrors(['error' => 'This account is not a logistics company application.']);
        }
        
        $user->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return back()->with('success', "Logistics partner {$user->business_name} has been approved.");
    }

    /**
     * Disapprove a logistics registration.
     */
    public function disapproveLogisticsRegistration(Request $request, int $userId): RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        if ($user->account_type !== 'logistics' || $user->role !== 'logistics_staff') {
            return back()->withErrors(['error' => 'This account is not a logistics company application.']);
        }
        
        $reason = $request->validate(['reason' => ['nullable', 'string', 'max:500']])['reason'] ?? null;

        $user->forceFill([
            'status' => 'disapproved',
            'approved_at' => null,
            'status_reason' => $reason ? trim($reason) : null,
            'status_changed_at' => now(),
        ])->save();

        return back()->with('success', "Logistics partner {$user->business_name} has been disapproved.");
    }

    /**
     * Get detailed information about a seller for review.
     */
    public function getSellerDetails(int $userId): \Illuminate\Http\JsonResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        if ($user->account_type !== 'seller' && $user->account_type !== 'logistics') {
            return response()->json(['error' => 'User is not a seller or logistics provider.'], 400);
        }
        
        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'middle_initial' => $user->middle_initial,
            'name' => $user->name,
            'sex' => $user->sex,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'birthday' => $user->birthday,
            'tin' => $user->tin,
            'account_type' => $user->account_type,
            'region' => $user->region,
            'province' => $user->province,
            'district' => $user->district,
            'municipality_city' => $user->municipality_city,
            'barangay' => $user->barangay,
            'postal_code' => $user->postal_code,
            'street_address' => $user->street_address,
            'business_name' => $user->business_name,
            'business_type' => $user->business_type,
            'line_of_business' => $user->line_of_business,
            'status' => $user->status,
            'verification_status' => $user->verification_status,
            'created_at' => $user->created_at->format('M d, Y g:i A'),
            'approved_at' => $user->approved_at?->format('M d, Y g:i A'),
            // Document URLs
            'id_document_url' => $user->id_document ? route('admin.download-document', ['userId' => $user->id, 'type' => 'id_document']) : null,
            'business_permit_url' => $user->business_permit ? route('admin.download-document', ['userId' => $user->id, 'type' => 'business_permit']) : null,
            'dti_registration_url' => $user->dti_registration ? route('admin.download-document', ['userId' => $user->id, 'type' => 'dti_registration']) : null,
            'bir_2303_url' => $user->bir_2303 ? route('admin.download-document', ['userId' => $user->id, 'type' => 'bir_2303']) : null,
            'sec_certificate_url' => $user->sec_certificate ? route('admin.download-document', ['userId' => $user->id, 'type' => 'sec_certificate']) : null,
        ]);
    }

    /**
     * Get detailed information about a logistics provider for review.
     */
    public function getLogisticsDetails(int $userId): \Illuminate\Http\JsonResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        if ($user->account_type !== 'logistics' || $user->role !== 'logistics_staff') {
            return response()->json(['error' => 'User is not a logistics company application.'], 400);
        }
        
        // Decode service_areas if it's stored as JSON
        $serviceAreas = $user->service_areas;
        if (is_string($serviceAreas)) {
            $serviceAreas = json_decode($serviceAreas, true) ?? [];
        }
        
        return response()->json([
            'id' => $user->id,
            'company_name' => $user->business_name ?? $user->name,
            'sec_registration_no' => $user->sec_registration_no,
            'tin' => $user->tin,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'contact_first_name' => $user->first_name,
            'contact_last_name' => $user->last_name,
            'contact_position' => $user->contact_position,
            'account_type' => $user->account_type,
            'region' => $user->region,
            'province' => $user->province,
            'district' => $user->district,
            'municipality_city' => $user->municipality_city,
            'barangay' => $user->barangay,
            'postal_code' => $user->postal_code,
            'street_address' => $user->street_address,
            'service_areas' => $serviceAreas,
            'status' => $user->status,
            'verification_status' => $user->verification_status,
            'created_at' => $user->created_at->format('M d, Y g:i A'),
            'approved_at' => $user->approved_at?->format('M d, Y g:i A'),
            // Document URLs
            'sec_certificate_url' => $user->sec_certificate ? route('admin.download-document', ['userId' => $user->id, 'type' => 'sec_certificate']) : null,
            'bir_form_2303_url' => $user->bir_2303 ? route('admin.download-document', ['userId' => $user->id, 'type' => 'bir_2303']) : null,
            'business_permit_url' => $user->business_permit ? route('admin.download-document', ['userId' => $user->id, 'type' => 'business_permit']) : null,
            'valid_id_url' => $user->valid_id ? route('admin.download-document', ['userId' => $user->id, 'type' => 'valid_id']) : null,
            'proof_of_address_url' => $user->proof_of_address ? route('admin.download-document', ['userId' => $user->id, 'type' => 'proof_of_address']) : null,
            'operating_permits_url' => $user->operating_permits ? route('admin.download-document', ['userId' => $user->id, 'type' => 'operating_permits']) : null,
        ]);
    }

    /**
     * Download a user's document (admin only).
     */
    public function downloadDocument(int $userId, string $type): \Symfony\Component\HttpFoundation\Response
    {
        $user = \App\Models\User::findOrFail($userId);

        // Inline by default so the preview iframe / new tab can render it; ?download=1 forces a download.
        return \App\Support\PrivateDocument::stream($user, $type, request()->boolean('download'));
    }

    /**
     * Clear the admin session flag and redirect to the landing page.
     */
    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('admin_verified');

        return redirect()->route('home');
    }
}