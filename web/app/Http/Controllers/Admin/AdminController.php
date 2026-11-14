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

        $masterCode = config('app.admin_master_code');
        $inputCode = $request->input('code');

        if (! hash_equals((string) $masterCode, (string) $inputCode)) {
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
        $adminQueue = fn () => \App\Models\User::where(function ($q) {
            $q->where('account_type', 'seller')
                ->orWhere(fn ($l) => $l->where('account_type', 'logistics')->where('role', 'logistics_staff'));
        });
        $pendingRegistrations = $adminQueue()->where('status', 'pending')->count();
        $pendingToday = $adminQueue()->where('status', 'pending')->whereDate('created_at', today())->count();
        
        // Orders by status
        $ordersInProgress = \App\Models\Order::whereIn('status', ['pending', 'paid', 'packed', 'shipped'])->count();
        $activeDeliveries = \App\Models\Order::where('status', 'shipped')->count();
        
        // Products pending approval
        $productsPending = \App\Models\Product::where('approval_status', 'pending')->count();
        
        // Commission this month (assume 5% commission rate)
        $commissionRate = 0.05;
        $commissionThisMonth = $revenueMTD * $commissionRate;
        
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
                'complianceFlags' => 0, // Placeholder
                'openDisputes' => 0, // Placeholder
                'commissionThisMonth' => (float) $commissionThisMonth,
            ],
            'operations' => [
                'activeDeliveries' => $activeDeliveries,
                'ordersInProgress' => $ordersInProgress,
                'supportTickets' => 0, // Placeholder
            ],
            'products' => [
                'pendingApproval' => $productsPending,
            ],
        ]);
    }

    /**
     * Show the manage registrations page.
     */
    public function manageRegistrations(): Response
    {
        $registrations = \App\Models\User::query()
            ->where(fn ($q) => $q->whereNull('role')->orWhereNotIn('role', ['courier', 'rider']))
            ->whereIn('status', ['pending', 'approved', 'disapproved'])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'disapproved')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'account_type' => $user->account_type,
                'business_name' => $user->business_name,
                'status' => $user->status,
                'created_at' => $user->created_at->format('M d, Y'),
                'approved_at' => $user->approved_at?->format('M d, Y'),
            ]);

        $stats = [
            'total' => \App\Models\User::count(),
            'pending' => \App\Models\User::where('status', 'pending')->count(),
            'approved' => \App\Models\User::where('status', 'approved')->count(),
            'disapproved' => \App\Models\User::where('status', 'disapproved')->count(),
        ];

        return Inertia::render('admin/manage-registrations', [
            'registrations' => $registrations,
            'stats' => $stats,
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
     * Approve a user registration.
     */
    public function approveRegistration(Request $request, int $userId): RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        $user->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return back()->with('success', "Account for {$user->name} has been approved.");
    }

    /**
     * Disapprove a user registration.
     */
    public function disapproveRegistration(Request $request, int $userId): RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        $user->update([
            'status' => 'disapproved',
            'approved_at' => null,
        ]);

        return back()->with('success', "Account for {$user->name} has been disapproved.");
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
        
        $user->update([
            'status' => 'disapproved',
            'approved_at' => null,
        ]);

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
        
        $user->update([
            'status' => 'disapproved',
            'approved_at' => null,
        ]);

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
            'valid_id_url' => $user->id_document ? route('admin.download-document', ['userId' => $user->id, 'type' => 'id_document']) : null,
        ]);
    }

    /**
     * Download a user's document (admin only).
     */
    public function downloadDocument(int $userId, string $type): \Symfony\Component\HttpFoundation\BinaryFileResponse|RedirectResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        $allowedTypes = ['id_document', 'business_permit', 'dti_registration', 'bir_2303', 'sec_certificate'];
        
        if (!in_array($type, $allowedTypes)) {
            return back()->withErrors(['error' => 'Invalid document type.']);
        }
        
        $filePath = $user->{$type};
        
        if (!$filePath || !\Storage::disk('local')->exists($filePath)) {
            return back()->withErrors(['error' => 'Document not found.']);
        }
        
        return response()->download(storage_path('app/' . $filePath));
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