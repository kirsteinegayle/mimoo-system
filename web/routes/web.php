<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing', ['bestSellers' => \App\Support\BestSellers::top(3), 'banners' => \App\Models\Banner::liveByPosition()]);
})->name('home');

// Proof-of-delivery photo for web users (seller / courier company / admin session); access is checked in the controller.
Route::get('/pod/{id}/photo', [\App\Http\Controllers\Api\DeliveryPodPhotoController::class, 'showWeb'])
    ->middleware('throttle:120,1,web-pod-view')->whereNumber('id')->name('pod.photo');

Route::get('/policies/{type}', [\App\Http\Controllers\PolicyController::class, 'show'])->name('policies.show');

Route::get('/seller', function () {
    return Inertia::render('seller/SellerLanding');
})->name('seller.landing');

// TEST ROUTE - NO AUTH REQUIRED (REMOVE LATER!)
Route::get('/test-seller-dashboard', function () {
    abort_unless(config('app.debug'), 404); // dev-only test page, never in production
    return Inertia::render('seller/SellerDashboard');
});

Route::get('/logistics', function () {
    return Inertia::render('logistics/LogisticsLanding');
})->name('logistics.landing');

Route::middleware(['auth', 'verified', 'approved'])->group(function () {
    // Generic dashboard - redirect based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        return match ($user->role ?? $user->account_type) {
            'seller' => redirect()->route('seller.dashboard'),
            'logistics_staff' => redirect()->route('logistics.dashboard'),
            'courier' => redirect()->route('courier.dashboard'),
            'admin' => redirect()->route('admin.dashboard'),
            'buyer' => redirect('/homepage'),
            default => redirect('/homepage'),
        };
    })->name('dashboard');
    
    // Debug route - check your account type
    Route::get('/debug/me', function () {
        $user = auth()->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'account_type' => $user->account_type,
            'status' => $user->status,
        ]);
    });
    
    // Buyer Settings/Account Page
    Route::get('/settings', function () {
        return Inertia::render('BuyerAccountSettings');
    });
    
    // Seller Dashboard - for approved sellers only
    Route::get('/seller/dashboard', [\App\Http\Controllers\SellerDashboardController::class, 'index'])->name('seller.dashboard');
    
    // Logistics Dashboard - for approved logistics users only (real stats)
    Route::get('/logistics/dashboard', [\App\Http\Controllers\Logistics\DashboardController::class, 'index'])->name('logistics.dashboard')->middleware('role:logistics_staff');
    
    // Courier Dashboard - for approved courier companies ONLY
    Route::get('/courier/dashboard', function () {
        $user = auth()->user();
        
        // Real numbers for this courier company (also for its logistics_staff).
        $cid = \App\Support\CourierCompanyResolver::resolveId($user) ?? 0;
        $held = fn () => \App\Models\ShipmentAssignment::where('courier_id', $cid);
        $jobs = fn () => \App\Models\DeliveryJob::where('courier_id', $cid);
        $stats = [
            'incoming_shipments' => $held()->where('assignment_status', 'pending')->count(),
            'pending_pickups' => $held()->where('assignment_status', 'accepted')->whereIn('pickup_status', ['pending_pickup', 'scheduled'])->count(),
            'in_transit' => $jobs()->whereIn('status', ['assigned', 'out_for_delivery'])->count(),
            'deliveries_today' => $jobs()->where('status', 'delivered')->whereDate('delivered_at', today())->count(),
            'exceptions' => $held()->where('assignment_status', 'accepted')->where('pickup_status', 'failed')->count()
                + $jobs()->whereIn('status', ['failed', 'return_to_sender'])->count(),
        ];

        // Latest delivery jobs for the "Recent deliveries" list.
        $recentJobs = $jobs()->with(['order:id,waybill_number,shipping_name', 'rider:id,name,first_name'])
            ->latest('updated_at')
            ->limit(8)
            ->get();
        $recent = $recentJobs->map(fn ($j) => [
            'id'           => $j->id,
            'order_id'     => $j->order_id,
            'order_number' => 'MIM-' . str_pad((string) $j->order_id, 8, '0', STR_PAD_LEFT),
            'waybill'      => $j->order?->waybill_number,
            'recipient'    => $j->order?->shipping_name,
            'rider'        => trim((string) ($j->rider?->first_name ?: $j->rider?->name)) ?: null,
            'status'       => $j->status,
            'updated_at'   => $j->updated_at?->toISOString(),
        ])->values();

        return Inertia::render('courier/CourierDashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name ?? 'Courier Company',
                'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? '')),
            ],
            'stats' => $stats,
            'recent' => $recent,
        ]);
    })->name('courier.dashboard')->middleware('role:courier,logistics_staff');
    
    // Courier - Incoming Shipments (with full functionality)
    Route::get('/courier/incoming-shipments', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'index'])->name('courier.incoming-shipments')->middleware('role:courier,logistics_staff');
    Route::get('/api/courier/shipments/{id}', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'show'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/shipments/{id}/accept', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'accept'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/shipments/{id}/reject', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'reject'])->middleware('role:courier,logistics_staff');
    
    // Pickup Management (web page + /api/courier/pickups/*) was removed. Pickups
    // are managed through the courier-app API (Api\CourierPickupController).
    // Old bookmarks / notification links land on Incoming Shipments instead of a 404.
    Route::redirect('/courier/pickup-management', '/courier/incoming-shipments');

    // Courier company notifications (bell + page); courier and linked logistics_staff.
    Route::get('/courier/notifications', [\App\Http\Controllers\Courier\NotificationController::class, 'page'])->name('courier.notifications')->middleware('role:courier,logistics_staff');
    Route::get('/courier/notifications/feed', [\App\Http\Controllers\Courier\NotificationController::class, 'feed'])->middleware('role:courier,logistics_staff');
    Route::post('/courier/notifications/read-all', [\App\Http\Controllers\Courier\NotificationController::class, 'markAllRead'])->middleware(['role:courier,logistics_staff', 'throttle:30,1,courier-notification-markallread']);
    Route::post('/courier/notifications/{id}/read', [\App\Http\Controllers\Courier\NotificationController::class, 'markRead'])->middleware(['role:courier,logistics_staff', 'throttle:60,1,courier-notification-markread'])->whereNumber('id');

    // Courier - Parcel Scanning
    Route::get('/courier/parcel-scanning', function () {
        $user = auth()->user();
        return Inertia::render('courier/ParcelScanning', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.parcel-scanning')->middleware('role:courier,logistics_staff');
    
    // Sorting & Transfers + Company Settings data (courier company and its staff)
    Route::middleware('role:courier,logistics_staff')->group(function () {
        Route::get('/courier/transfers-data', [\App\Http\Controllers\Courier\TransferController::class, 'data'])->middleware('throttle:120,1,courier-transfers');
        Route::post('/courier/transfers', [\App\Http\Controllers\Courier\TransferController::class, 'transfer'])->middleware('throttle:60,1,courier-transfer-write');
        Route::get('/courier/company-settings', [\App\Http\Controllers\Courier\CompanySettingsController::class, 'show']);
        Route::post('/courier/company-settings', [\App\Http\Controllers\Courier\CompanySettingsController::class, 'update'])->middleware('throttle:20,1,courier-company-settings');
    });

    // Courier - Sorting & Transfers
    Route::get('/courier/sorting-transfers', function () {
        $user = auth()->user();
        return Inertia::render('courier/SortingTransfers', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.sorting-transfers')->middleware('role:courier,logistics_staff');
    
    // Courier - Branch & Facility
    Route::get('/courier/branch-facility', [\App\Http\Controllers\Courier\FacilityController::class, 'index'])->name('courier.branch-facility')->middleware('role:courier,logistics_staff');
    Route::post('/courier/branch-facility', [\App\Http\Controllers\Courier\FacilityController::class, 'store'])->name('courier.facility.store')->middleware('role:courier,logistics_staff');
    Route::post('/courier/branch-facility/generate', [\App\Http\Controllers\Courier\FacilityController::class, 'generateFromServiceAreas'])->name('courier.facility.generate')->middleware('role:courier,logistics_staff');
    Route::put('/courier/branch-facility/{facility}', [\App\Http\Controllers\Courier\FacilityController::class, 'update'])->name('courier.facility.update')->middleware('role:courier,logistics_staff');
    Route::delete('/courier/branch-facility/{facility}', [\App\Http\Controllers\Courier\FacilityController::class, 'destroy'])->name('courier.facility.destroy')->middleware('role:courier,logistics_staff');
    
    // Courier - Parcel Scanning
    Route::get('/courier/parcel-scanning', function () {
        $courier = \App\Support\CourierCompanyResolver::scope(auth()->user()); // company, also for its logistics_staff
        
        $facilities = \App\Models\CourierFacility::where('courier_id', $courier->id)
            ->where('status', 'Active')
            ->orderBy('facility_type', 'asc')
            ->orderBy('facility_name', 'asc')
            ->get()
            ->map(function ($facility) {
                return [
                    'id' => $facility->id,
                    'facility_name' => $facility->facility_name,
                    'facility_code' => $facility->facility_code,
                    'facility_type' => $facility->facility_type,
                    'city' => $facility->city,
                    'region' => $facility->region,
                ];
            });
        
        return inertia('courier/ParcelScanning', [
            'auth' => [
                'user' => [
                    'id' => $courier->id,
                    'name' => $courier->first_name . ' ' . $courier->last_name,
                    'email' => $courier->email,
                    'account_type' => $courier->account_type,
                ],
            ],
            'company' => [
                'name' => $courier->company_name ?? $courier->business_name ?? 'Courier Company',
                'contact_person' => $courier->first_name . ' ' . $courier->last_name,
            ],
            'facilities' => $facilities,
        ]);
    })->name('courier.parcel-scanning')->middleware('role:courier,logistics_staff');
    
    // API: Get parcel details by waybill number (for courier scanner)
    Route::get('/api/courier/parcel/{waybillNumber}', function ($waybillNumber) {
        \Log::info('Courier scanning waybill: ' . $waybillNumber);
        
        // Find order by waybill number
        $order = \App\Models\Order::where('waybill_number', $waybillNumber)
            ->with(['buyer', 'items.product'])
            ->first();
        
        // Only a parcel that belongs to this company (accepted assignment, or one being returned to the
        // sender by its rider) is shown: buyer name, phone and address are not for other companies.
        $companyId = \App\Support\CourierCompanyResolver::resolveId(auth()->user());
        $mine = $companyId && ($order && (
            \App\Models\ShipmentAssignment::where('order_id', $order->id)->where('courier_id', $companyId)->where('assignment_status', 'accepted')->where('pickup_status', '<>', 'cancelled')->exists()
            || \App\Models\DeliveryJob::where('order_id', $order->id)->where('courier_id', $companyId)->where('status', \App\Models\DeliveryJob::STATUS_RETURN_TO_SENDER)->exists()));
        if ($order && ! $mine) {
            $order = null; // same answer as "not found"
        }

        if (!$order) {
            return response()->json([
                'error' => 'Parcel not found',
                'message' => 'No parcel found with waybill number: ' . $waybillNumber
            ], 404);
        }
        
        // Calculate total weight from order items
        $totalWeight = $order->items->sum(function ($item) {
            return ($item->product->weight ?? 0) * $item->quantity;
        });
        
        return response()->json([
            'waybill_number' => $order->waybill_number,
            'order_number' => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            ...$order->buyerFields(), // buyer_name/phone/address/city/barangay/...
            'seller_name' => $order->items->first()->product->seller->business_name ?? $order->items->first()->product->seller->name ?? 'Unknown Seller',
            'weight' => round($totalWeight, 2),
            'payment_method' => strtoupper($order->payment_method),
            'total_amount' => $order->total,
            'destination' => $order->destinationLabel(),
            'status' => $order->status,
        ]);
    })->middleware('role:courier,logistics_staff');
    
    // API: Scan and receive parcel at facility
    Route::post('/api/courier/scan-parcel', function (Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'waybill_number' => 'required|string',
            'facility_id' => 'required|exists:courier_facilities,id',
        ]);
        
        $actor = auth()->user();
        $courier = \App\Support\CourierCompanyResolver::scope($actor); // company (courier or its logistics_staff)
        $facility = \App\Models\CourierFacility::findOrFail($validated['facility_id']);
        
        // Verify facility belongs to this courier
        if ((int) $facility->courier_id !== (int) $courier->id) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'This facility does not belong to your company.'
            ], 403);
        }
        
        // Find order by waybill
        $order = \App\Models\Order::where('waybill_number', $validated['waybill_number'])->first();
        
        if (!$order) {
            \App\Services\ScanRouteGuard::logRejected(null, $validated['waybill_number'], $facility, 'received', 'Waybill not found', (int) $courier->id);
            \Log::warning('Parcel scan failed - waybill not found', [
                'waybill_number' => $validated['waybill_number'],
                'courier_id' => $courier->id,
                'facility_id' => $validated['facility_id'],
            ]);
            
            return response()->json([
                'error' => 'Parcel not found',
                'message' => 'No parcel found with waybill number: ' . $validated['waybill_number'] . '. Please verify the waybill number and try again.'
            ], 404);
        }
        
        // Verify order is assigned to this courier
        if ($order->assigned_courier_id && (int) $order->assigned_courier_id !== (int) $courier->id) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'This parcel is assigned to a different courier company.'
            ], 403);
        }
        
        // The parcel must really be this company's: an accepted assignment (picked up or waiting for pickup),
        // or a delivery job of the company that is being returned to the sender. Unassigned parcels are refused.
        $returning = \App\Models\DeliveryJob::where('order_id', $order->id)->where('courier_id', $courier->id)
            ->where('status', \App\Models\DeliveryJob::STATUS_RETURN_TO_SENDER)->exists();
        $assigned = \App\Models\ShipmentAssignment::where('order_id', $order->id)->where('courier_id', $courier->id)
            ->where('assignment_status', 'accepted')->where('pickup_status', '<>', 'cancelled')->exists();
        if (! $assigned && ! $returning) {
            return response()->json([
                'error' => 'Not assigned',
                'message' => 'This parcel is not assigned to your company (or the assignment was not accepted yet), so it cannot be scanned in.'
            ], 422);
        }
        $scanType = $returning ? 'return_received' : 'received';
        if ($returning && \App\Models\ShipmentScan::where('order_id', $order->id)->where('scan_type', 'return_received')->exists()) {
            return response()->json([
                'error' => 'Already received',
                'message' => 'This returned parcel was already received at a hub.'
            ], 422);
        }

        // Route check: the parcel must belong to this facility (e.g. a Lumban parcel cannot be scanned in at Calamba).
        if ($routeError = \App\Services\ScanRouteGuard::check($order, $facility, $scanType)) {
            return response()->json([
                'error' => 'Wrong facility',
                'message' => $routeError,
            ], 422);
        }

        // Create scan record
        \App\Models\ShipmentScan::create([
            'order_id' => $order->id,
            'waybill_number' => $validated['waybill_number'],
            'courier_id' => $courier->id,
            'facility_id' => $validated['facility_id'],
            'scan_type' => $scanType,
            'scanned_by' => trim(($actor->first_name ?? '') . ' ' . ($actor->last_name ?? '')) ?: $actor->name,
            'notes' => $returning ? 'Returned parcel (return to sender) received at the hub.' : null,
        ]);
        
        // Update order tracking status and current location
        $facilityType = $facility->facility_type;
        $facilityTypeLabel = match($facilityType) {
            'main_hub' => 'Main Hub',
            'sorting_hub' => 'Sorting Hub',
            'branch' => 'Branch',
            default => ucfirst(str_replace('_', ' ', $facilityType)),
        };
        
        $trackingMessage = "Parcel scanned at {$facility->facility_name} ({$facilityTypeLabel})";
        if ($facility->municipality_city) {
            $trackingMessage .= " in {$facility->municipality_city}";
        }
        
        $order->update([
            'current_facility_id' => $validated['facility_id'],
        ]);
        
        $order->updateTracking($returning ? 'returned_to_hub' : 'scanned_at_facility', $returning ? "Returned parcel received at {$facility->facility_name}" : $trackingMessage);
        
        return response()->json([
            'success' => true,
            'message' => 'Parcel received successfully at ' . $facility->facility_name,
            'order_id' => $order->id,
            'waybill_number' => $order->waybill_number,
        ]);
    })->middleware('role:courier,logistics_staff');
    
    // API: Get received parcels for a facility
    Route::get('/api/courier/facility/{facilityId}/received-parcels', function ($facilityId) {
        $courier = \App\Support\CourierCompanyResolver::scope(auth()->user()); // company, also for its logistics_staff
        $facility = \App\Models\CourierFacility::findOrFail($facilityId);
        
        // Verify facility belongs to this courier
        if ($facility->courier_id !== $courier->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Get latest scan per waybill at this facility
        $receivedScans = \App\Models\ShipmentScan::where('facility_id', $facilityId)
            ->where('scan_type', 'received')
            ->with(['order.buyer', 'order.items.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('waybill_number')
            ->map(function ($scans) {
                $latestScan = $scans->first();
                
                // Check if parcel was scanned at another facility after this one
                $laterScan = \App\Models\ShipmentScan::where('waybill_number', $latestScan->waybill_number)
                    ->where('facility_id', '!=', $latestScan->facility_id)
                    ->where('created_at', '>', $latestScan->created_at)
                    ->exists();
                
                if ($laterScan) {
                    return null; // Parcel moved to another facility (archived)
                }
                
                $order = $latestScan->order;
                if (! $order && $latestScan->waybill_number) {
                    $order = \App\Models\Order::where('waybill_number', $latestScan->waybill_number)->first();
                }
                if (! $order) {
                    return null;
                }

                $totalWeight = $order->items ? $order->items->sum(function ($item) {
                    return ($item->product->weight ?? 0) * $item->quantity;
                }) : 0;

                $activeJob = \App\Models\DeliveryJob::where('order_id', $order->id)
                    ->whereIn('status', \App\Models\DeliveryJob::ACTIVE_STATUSES)
                    ->with('personnel')
                    ->latest('id')
                    ->first();
                
                return [
                    'id' => $latestScan->id,
                    'scan_id' => $latestScan->id,
                    'order_id' => $order->id,
                    'waybill_number' => $latestScan->waybill_number,
                    'order_number' => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    ...$order->buyerFields(),
                    'destination' => $order->destinationLabel(),
                    'weight' => round($totalWeight, 2),
                    'payment_method' => strtoupper($order->payment_method ?? 'COD'),
                    'total_amount' => $order->total,
                    'status' => $order->status,
                    'has_active_job' => (bool) $activeJob,
                    'assigned_rider_name' => $activeJob?->personnel?->name,
                    'delivery_job_status' => $activeJob?->status,
                    'received_at' => $latestScan->created_at->format('M d, Y h:i A'),
                    'scanned_by' => $latestScan->scanned_by,
                ];
            })
            ->filter() // Remove nulls (archived parcels)
            ->values();
        
        return response()->json($receivedScans);
    })->middleware('role:courier,logistics_staff');
    
    // API: Get archived parcels for a facility
    Route::get('/api/courier/facility/{facilityId}/archived-parcels', function ($facilityId) {
        $courier = \App\Support\CourierCompanyResolver::scope(auth()->user()); // company, also for its logistics_staff
        $facility = \App\Models\CourierFacility::findOrFail($facilityId);
        
        // Verify facility belongs to this courier
        if ($facility->courier_id !== $courier->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Get parcels that were received at this facility but later scanned elsewhere
        $archivedScans = \App\Models\ShipmentScan::where('facility_id', $facilityId)
            ->where('scan_type', 'received')
            ->with(['order.buyer', 'order.items.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('waybill_number')
            ->map(function ($scans) use ($facilityId) {
                $facilityReceiveScan = $scans->first();
                
                // Find scan at another facility after this one
                $transferScan = \App\Models\ShipmentScan::where('waybill_number', $facilityReceiveScan->waybill_number)
                    ->where('facility_id', '!=', $facilityId)
                    ->where('created_at', '>', $facilityReceiveScan->created_at)
                    ->with('facility')
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if (!$transferScan) {
                    return null; // Still at this facility (not archived)
                }
                
                $order = $facilityReceiveScan->order;
                if (! $order && $facilityReceiveScan->waybill_number) {
                    $order = \App\Models\Order::where('waybill_number', $facilityReceiveScan->waybill_number)->first();
                }
                if (! $order) {
                    return null;
                }

                $totalWeight = $order->items ? $order->items->sum(function ($item) {
                    return ($item->product->weight ?? 0) * $item->quantity;
                }) : 0;
                
                return [
                    'id' => $facilityReceiveScan->id,
                    'scan_id' => $facilityReceiveScan->id,
                    'order_id' => $order->id,
                    'waybill_number' => $facilityReceiveScan->waybill_number,
                    'order_number' => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    ...$order->buyerFields(),
                    'destination' => $order->destinationLabel(),
                    'weight' => round($totalWeight, 2),
                    'status' => $order->status,
                    'received_at' => $facilityReceiveScan->created_at->format('M d, Y h:i A'),
                    'transferred_to' => $transferScan->facility->facility_name,
                    'transferred_at' => $transferScan->created_at->format('M d, Y h:i A'),
                ];
            })
            ->filter() // Remove nulls (still at facility)
            ->values();
        
        return response()->json($archivedScans);
    })->middleware('role:courier,logistics_staff');

    // API: Get available riders for a facility (for the "Assign Rider" modal)
    Route::get('/api/courier/facility/{facilityId}/available-riders', function ($facilityId) {
        $courier  = \App\Support\CourierCompanyResolver::scope(auth()->user());
        $facility = \App\Models\CourierFacility::findOrFail($facilityId);
        if ($facility->courier_id !== $courier->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Online riders of this courier (is_online = true, active, with a linked user account).
        $personnel = \App\Models\CourierPersonnel::where('courier_id', $courier->id)
            ->where('status', 'active')
            ->where('is_online', true)
            ->whereNotNull('user_id')
            ->whereHas('user', fn ($q) => $q
                ->where(fn ($r) => $r->where('role', 'rider')
                    ->orWhere(fn ($x) => $x->whereNull('role')->where('account_type', 'rider')))
                ->where('status', 'approved')
                ->where('verification_status', 'verified'))
            ->orderBy('name')
            ->get(['id', 'name', 'contact_number', 'is_online']);

        // Active delivery jobs per personnel
        $activeCounts = \App\Models\DeliveryJob::whereIn('personnel_id', $personnel->pluck('id'))
            ->whereIn('status', \App\Models\DeliveryJob::ACTIVE_STATUSES)
            ->selectRaw('personnel_id, COUNT(*) as c')
            ->groupBy('personnel_id')
            ->pluck('c', 'personnel_id');

        return response()->json($personnel->map(fn ($p) => [
            'personnel_id'       => $p->id,
            'name'               => $p->name,
            'contact_number'     => $p->contact_number,
            'active_jobs'        => (int) ($activeCounts[$p->id] ?? 0),
        ])->values());
    })->middleware('role:courier,logistics_staff');

    // API: Assign rider to a parcel AT the facility (parcel is physically here, skip pickup_status guard)
    Route::post('/api/courier/facility/{facilityId}/assign-rider', function (Illuminate\Http\Request $request, $facilityId) {
        // Resolve order_id: accept order ID directly, or shipment scan ID, or lookup by waybill
        $rawOrderId = $request->input('order_id');
        if ($rawOrderId && ! \App\Models\Order::where('id', $rawOrderId)->exists()) {
            $scan = \App\Models\ShipmentScan::find($rawOrderId);
            if ($scan && $scan->order_id) {
                $request->merge(['order_id' => $scan->order_id]);
            } elseif ($scan && $scan->waybill_number) {
                $orderIdFromWaybill = \App\Models\Order::where('waybill_number', $scan->waybill_number)->value('id');
                if ($orderIdFromWaybill) {
                    $request->merge(['order_id' => $orderIdFromWaybill]);
                }
            }
        }

        $validated = $request->validate([
            'order_id'     => 'required|integer|exists:orders,id',
            'personnel_id' => 'required|integer|exists:courier_personnel,id',
        ]);

        $courier  = \App\Support\CourierCompanyResolver::scope(auth()->user());
        $facility = \App\Models\CourierFacility::findOrFail($facilityId);
        if ($facility->courier_id !== $courier->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $courier, $facility) {
            $order = \App\Models\Order::whereKey($validated['order_id'])->lockForUpdate()->first();

            // Order must belong to this courier and be in a deliverable status.
            if (! in_array($order->status, ['in_transit', 'shipped'], true)) {
                return response()->json([
                    'error' => "Order is {$order->status}. Only in_transit or shipped orders can be assigned.",
                ], 422);
            }

            // Parcel must have been scanned at THIS facility.
            $scanned = \App\Models\ShipmentScan::where(function ($q) use ($order) {
                    $q->where('order_id', $order->id)
                      ->orWhere('waybill_number', $order->waybill_number);
                })
                ->where('facility_id', $facility->id)
                ->exists();
            if (! $scanned) {
                return response()->json([
                    'error' => 'This parcel has not been scanned at this facility.',
                ], 422);
            }

            // Block if already has an active delivery job.
            $existing = \App\Models\DeliveryJob::where('order_id', $order->id)->latest('id')->first();
            if ($existing && in_array($existing->status, \App\Models\DeliveryJob::ACTIVE_STATUSES, true)) {
                return response()->json([
                    'error'          => 'This order already has an active delivery job.',
                    'delivery_job_id'=> $existing->id,
                ], 422);
            }

            // Rider must belong to this courier and be online.
            $personnel = \App\Models\CourierPersonnel::where('id', $validated['personnel_id'])
                ->where('courier_id', $courier->id)
                ->where('status', 'active')
                ->where('is_online', true)
                ->whereNotNull('user_id')
                ->first();
            if (! $personnel) {
                return response()->json([
                    'error' => 'Rider not found or not online. The rider must be active and checked in.',
                ], 422);
            }

            $isCod = strtolower((string) $order->payment_method) === 'cod'
                && ! in_array(strtolower((string) $order->payment_status), ['paid', 'refunded'], true);

            $job = \App\Models\DeliveryJob::create([
                'order_id'      => $order->id,
                'rider_user_id' => $personnel->user_id,
                'personnel_id'  => $personnel->id,
                'courier_id'    => $courier->id,
                'facility_id'   => $facility->id,
                'assigned_by'   => auth()->id(),
                'status'        => \App\Models\DeliveryJob::STATUS_ASSIGNED,
                'cod_amount'    => $isCod ? (float) $order->total : 0.0,
                'assigned_at'   => now(),
            ]);

            // Update buyer tracking
            $order->updateTracking('assigned_courier', "Parcel out for delivery: Assigned to delivery rider {$personnel->name}");

            // Notify the rider
            \App\Models\RiderNotification::notify(
                $personnel->user_id,
                'delivery_assigned',
                'New delivery assigned',
                ($order->waybill_number ?? 'Order #' . $order->id) . ' · ' . ($order->shipping_address ?? ''),
                $job->id,
                $order->id
            );

            return response()->json([
                'message'         => "Rider {$personnel->name} assigned to order {$order->waybill_number}.",
                'delivery_job_id' => $job->id,
                'rider_name'      => $personnel->name,
            ], 201);
        });
    })->middleware(['role:courier,logistics_staff', 'throttle:30,1']);

    // Courier - Rider Management
    Route::get('/courier/rider-management', [\App\Http\Controllers\Courier\RiderManagementController::class, 'index'])->name('courier.rider-management')->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/riders/{id}/approve', [\App\Http\Controllers\Courier\RiderManagementController::class, 'approve'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/riders/{id}/reject', [\App\Http\Controllers\Courier\RiderManagementController::class, 'reject'])->middleware('role:courier,logistics_staff');
    
    // Courier - Delivery Management
    Route::get('/courier/delivery-management', [\App\Http\Controllers\Courier\DeliveryManagementController::class, 'index'])->name('courier.delivery-management')->middleware('role:courier,logistics_staff');
    Route::post('/courier/delivery-management/assign', [\App\Http\Controllers\Courier\DeliveryManagementController::class, 'assign'])->name('courier.delivery-management.assign')->middleware(['role:courier,logistics_staff', 'throttle:30,1']);
    
    // Courier - COD & Remittance
    Route::get('/courier/cod-remittance', function () {
        $user = auth()->user();
        return Inertia::render('courier/CODRemittance', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.cod-remittance')->middleware('role:courier,logistics_staff');
    
    // Courier COD: confirm the cash riders handed in (once; company-scoped).
    Route::get('/courier/cod-remittances', [\App\Http\Controllers\Courier\CodRemittanceController::class, 'index'])->middleware('role:courier,logistics_staff');
    Route::post('/courier/cod-remittances/{id}/confirm', [\App\Http\Controllers\Courier\CodRemittanceController::class, 'confirm'])->middleware(['role:courier,logistics_staff', 'throttle:30,1,courier-cod-confirm'])->whereNumber('id');

    // Courier - Reports
    Route::get('/courier/reports', function () {
        $user = auth()->user();
        return Inertia::render('courier/Reports', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.reports')->middleware('role:courier,logistics_staff');
    
    // Courier - Support
    Route::get('/courier/support', function () {
        $user = auth()->user();
        return Inertia::render('courier/Support', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.support')->middleware('role:courier,logistics_staff');
    
    // Courier - Messages
    Route::get('/courier/messages', function () {
        $user = auth()->user();
        return Inertia::render('courier/Messages', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.messages')->middleware('role:courier,logistics_staff');
    
    // Courier - Company Settings
    Route::get('/courier/settings', function () {
        $user = auth()->user();
        return Inertia::render('courier/CompanySettings', [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type]],
            'company' => ['name' => $user->company_name ?? $user->business_name ?? 'Courier Company', 'contact_person' => trim(($user->contact_first_name ?? '') . ' ' . ($user->contact_last_name ?? ''))],
        ]);
    })->name('courier.settings')->middleware('role:courier,logistics_staff');
    
    // Logistics Incoming Parcels
    Route::get('/logistics/incoming-parcels', function () {
        $user = auth()->user();
        
        // Fetch orders with status "shipped" (scanned QR + confirmed, awaiting pickup from logistics)
        $incomingOrders = \App\Models\Order::where('status', 'shipped')
            ->with(['items.product'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($order) {
                
                // Get seller info from first item's product
                $sellerName = 'N/A';
                if ($order->items->isNotEmpty()) {
                    $product = $order->items->first()->product;
                    if ($product && $product->seller_id) {
                        $seller = \App\Models\User::find($product->seller_id);
                        $sellerName = $seller ? ($seller->business_name ?? $seller->name) : 'N/A';
                    }
                }
                
                // Normalize payment method (database stores "cod", "gcash", etc. in lowercase)
                $paymentMethod = strtolower($order->payment_method ?? 'cod');
                $paymentMethodDisplay = match($paymentMethod) {
                    'cod' => 'Cash on Delivery',
                    'gcash' => 'GCash',
                    'paymaya' => 'PayMaya',
                    'card' => 'Credit/Debit Card',
                    default => 'Cash on Delivery',
                };
                
                // Compute estimated weight (0.3kg per item if no weight in database)
                $estimatedWeight = $order->items->sum(function ($item) {
                    return $item->quantity * 0.3; // Assume 0.3kg per item
                });
                
                return [
                    'id' => $order->id,
                    'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'waybill_number' => $order->waybill_number,
                    ...$order->buyerFields(),
                    'seller_name' => $sellerName,
                    'total_amount' => $order->total ?? 0,
                    'payment_method' => $paymentMethodDisplay,
                    'items_count' => $order->items->count(),
                    'weight' => round($estimatedWeight, 1),
                    'shipped_at' => $order->updated_at->format('M d, Y H:i'),
                    'status' => 'shipped',
                    // Delivery tracking (display only)
                    'tracking_status' => $order->tracking_status,
                    'tracking_message' => $order->tracking_message,
                    'tracking_updated_at' => $order->tracking_updated_at?->format('M d, Y h:i A'),
                ];
            });
        
        return Inertia::render('logistics/IncomingParcels', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
            'incomingParcels' => $incomingOrders,
        ]);
    })->name('logistics.incoming-parcels');
    
    // API: Get parcel details by waybill number (for scanner)
    Route::get('/api/logistics/parcel/{waybillNumber}', function ($waybillNumber) {
        // Debug: Log the scanned waybill number
        \Log::info('Scanned waybill number: ' . $waybillNumber);
        
        $order = \App\Models\Order::where('waybill_number', $waybillNumber)
            ->with(['items.product']) // Just load product, we'll get seller manually
            ->first();
        
        // Debug: Log all waybill numbers in database
        $allWaybills = \App\Models\Order::whereNotNull('waybill_number')
            ->pluck('waybill_number', 'id');
        \Log::info('All waybill numbers in DB:', $allWaybills->toArray());
        
        if (!$order) {
            return response()->json([
                'error' => 'Parcel not found',
                'scanned' => $waybillNumber,
                'available_waybills' => $allWaybills->values(),
            ], 404);
        }
        
        
        // Get seller info from first item's product
        $sellerName = 'N/A';
        if ($order->items->isNotEmpty()) {
            $product = $order->items->first()->product;
            if ($product && $product->seller_id) {
                $seller = \App\Models\User::find($product->seller_id);
                $sellerName = $seller ? ($seller->business_name ?? $seller->name) : 'N/A';
            }
        }
        
        // Normalize payment method (database stores "cod", "gcash", etc. in lowercase)
        $paymentMethod = strtolower($order->payment_method ?? 'cod');
        $paymentMethodDisplay = match($paymentMethod) {
            'cod' => 'Cash on Delivery',
            'gcash' => 'GCash',
            'paymaya' => 'PayMaya',
            'card' => 'Credit/Debit Card',
            default => 'Cash on Delivery',
        };
        
        // Compute estimated weight (0.3kg per item)
        $estimatedWeight = $order->items->sum(function ($item) {
            return $item->quantity * 0.3;
        });
        
        return response()->json([
            'parcel' => [
                'id' => $order->id,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'waybill_number' => $order->waybill_number,
                ...$order->buyerFields(),
                'seller_name' => $sellerName,
                'total_amount' => $order->total,
                'payment_method' => $paymentMethodDisplay,
                'items_count' => $order->items->count(),
                'weight' => round($estimatedWeight, 1),
                'shipped_at' => $order->updated_at->toISOString(),
                'status' => $order->status,
                // Delivery tracking (display only)
                'tracking_status' => $order->tracking_status,
                'tracking_message' => $order->tracking_message,
                'tracking_updated_at' => $order->tracking_updated_at?->format('M d, Y h:i A'),
            ],
        ]);
    });
    
    // DEBUG ROUTE: Check waybill numbers in database
    Route::get('/api/debug/waybills', function () {
        // Lists every waybill: dev only, and only logistics staff.
        abort_unless(config('app.debug') && \App\Support\PortalRole::roleOf(auth()->user()) === 'logistics_staff', 404);
        $orders = \App\Models\Order::whereNotNull('waybill_number')
            ->select('id', 'waybill_number', 'status', 'waybill_generated_at', 'waybill_printed_at')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'waybill_number' => $order->waybill_number,
                    'status' => $order->status,
                    'waybill_generated_at' => $order->waybill_generated_at,
                    'waybill_printed_at' => $order->waybill_printed_at,
                ];
            });
        
        return response()->json([
            'count' => $orders->count(),
            'orders' => $orders,
        ]);
    });
    
    // API: Confirm parcel received at logistics hub (packed → shipped)
    Route::post('/api/logistics/parcel/{id}/confirm', function ($id) {
        $order = \App\Models\Order::findOrFail($id);
        
        // Validate that order is in packed status (ready for pickup)
        if ($order->status !== 'packed') {
            return response()->json([
                'error' => 'Order is not ready for pickup',
                'current_status' => $order->status,
            ], 400);
        }
        
        // Update order status to shipped (in transit to buyer)
        $order->update(['status' => 'shipped']);
        
        // Update tracking status for buyer visibility
        $order->updateTracking('received_logistics', 'Parcel received by logistics');
        
        \Log::info('Parcel confirmed received at logistics hub', [
            'order_id' => $order->id,
            'waybill_number' => $order->waybill_number,
            'confirmed_by' => auth()->id(),
            'confirmed_at' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Parcel confirmed! Now in transit.',
            'order' => [
                'id' => $order->id,
                'waybill_number' => $order->waybill_number,
                'status' => $order->status,
            ],
        ]);
    });
    
    // API: Report problem with parcel
    Route::post('/api/logistics/parcel/{id}/report', function (Illuminate\Http\Request $request, $id) {
        $order = \App\Models\Order::findOrFail($id);
        
        $reason = $request->input('reason', '');
        
        if (empty($reason)) {
            return response()->json([
                'error' => 'Problem reason is required',
            ], 400);
        }
        
        // Log the problem
        \Log::warning('Parcel problem reported', [
            'order_id' => $order->id,
            'waybill_number' => $order->waybill_number,
            'status' => $order->status,
            'reason' => $reason,
            'reported_by' => auth()->id(),
            'reported_at' => now(),
        ]);
        
        // TODO: In future, you might want to:
        // 1. Store problem reports in a separate table
        // 2. Send notification to seller
        // 3. Update order status to 'on_hold' or similar
        // 4. Create a ticket in support system
        
        return response()->json([
            'success' => true,
            'message' => 'Problem reported. Seller will be notified.',
            'order' => [
                'id' => $order->id,
                'waybill_number' => $order->waybill_number,
                'status' => $order->status,
            ],
        ]);
    });
    
    // Logistics Courier Applications
    Route::get('/logistics/courier-applications', function () {
        $user = auth()->user();
        
        // Fetch courier applications only (not logistics staff)
        $applications = \App\Models\User::where('account_type', 'logistics')
            ->where('role', 'courier')
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($courier) {
                // Build full name (prefer rep_full_name, fall back to split)
                $fullName = $courier->rep_full_name 
                    ?? trim(($courier->first_name ?? '') . ' ' . ($courier->last_name ?? '')) 
                    ?: $courier->name 
                    ?: 'Not provided';
                
                // Get company name with fallbacks
                $companyName = $courier->company_name 
                    ?? $courier->trade_name 
                    ?? $courier->business_name 
                    ?? $fullName;
                
                return [
                    'id' => $courier->id,
                    'company_name' => $companyName,
                    'trade_name' => $courier->trade_name ?? $courier->company_name ?? 'Not provided',
                    'business_email' => $courier->business_email ?? $courier->email,
                    'rep_full_name' => $fullName,
                    'rep_position' => $courier->contact_position ?? 'Not provided',
                    'status' => $courier->status,
                    'submitted_at' => $courier->created_at->format('M d, Y'),
                ];
            });
        
        return Inertia::render('logistics/CourierApplications', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'applications' => $applications,
        ]);
    })->name('logistics.courier-applications');
    
    // View single courier application details
    // Stream a courier applicant's uploaded document (private disk) to logistics staff.
    Route::get('/logistics/courier-applications/{id}/document/{type}', function ($id, $type) {
        $courier = \App\Models\User::where('account_type', 'logistics')
            ->where('role', 'courier')
            ->where('id', $id)
            ->firstOrFail();

        return \App\Support\PrivateDocument::stream($courier, $type, request()->boolean('download'));
    })->whereNumber('id')->name('logistics.courier-applications.document')->middleware('role:logistics_staff');

    Route::get('/logistics/courier-applications/{id}', function ($id) {
        $user = auth()->user();
        
        $courier = \App\Models\User::where('account_type', 'logistics')
            ->where('role', 'courier')
            ->where('id', $id)
            ->firstOrFail();
        
        // Helper to parse legacy service_areas if new fields are empty
        $serviceAreas = $courier->service_areas ?? [];
        $regionsServed = $courier->regions_served;
        $provincesServed = $courier->provinces_served;
        $citiesServed = $courier->cities_served;
        
        // If new fields are empty but legacy service_areas exists, parse it
        if (empty($regionsServed) && empty($provincesServed) && empty($citiesServed) && !empty($serviceAreas)) {
            $regionsServed = \App\Helpers\ServiceAreaParser::extractRegions($serviceAreas);
            $provincesServed = \App\Helpers\ServiceAreaParser::extractProvinces($serviceAreas);
            $citiesServed = \App\Helpers\ServiceAreaParser::extractCities($serviceAreas);
        }
        
        // NEW fields have priority, fall back to old for backward compat
        $application = [
            // Basic info
            'id' => $courier->id,
            'status' => $courier->status ?? 'pending',
            'submitted_at' => $courier->created_at->format('F d, Y g:i A'),
            'updated_at' => $courier->updated_at->format('F d, Y g:i A'),
            'approved_at' => $courier->approved_at ? $courier->approved_at->format('F d, Y g:i A') : null,
            
            // Step 1: Company Information
            'company_name' => $courier->company_name ?? 'Not provided',
            'trade_name' => $courier->trade_name ?? 'Not provided',
            'business_registration_number' => $courier->sec_registration_no ?? 'Not provided',
            'business_address' => $courier->business_address ?? $courier->street_address ?? 'Not provided',
            'business_email' => $courier->business_email ?? 'Not provided',
            'company_contact_number' => $courier->company_contact_number ?? 'Not provided',
            'rep_contact_number' => $courier->rep_contact_number ?? 'Not provided',
            'company_website' => $courier->company_website ?? 'Not provided',
            'company_logo' => $courier->company_logo,
            
            // Step 2: Authorized Representative
            'rep_full_name' => $courier->rep_full_name ?? trim(($courier->first_name ?? '') . ' ' . ($courier->last_name ?? '')) ?: 'Not provided',
            'rep_first_name' => $courier->contact_first_name ?? $courier->first_name ?? 'Not provided',
            'rep_last_name' => $courier->contact_last_name ?? $courier->last_name ?? 'Not provided',
            'rep_position' => $courier->contact_position ?? 'Not provided',
            'rep_email' => $courier->email,
            'rep_contact_number' => $courier->rep_contact_number ?? $courier->contact_number ?? 'Not provided',
            'rep_sex' => $courier->sex ?? 'Not specified',
            'rep_birthday' => $courier->birthday ?? 'Not provided',
            'username' => $courier->username ?? 'Not provided',
            
            // Step 3: Business Documents
            'dti_sec_certificate' => $courier->sec_certificate,
            'mayors_permit' => $courier->business_permit,
            'operating_permits' => $courier->operating_permits,
            'rep_valid_id' => $courier->valid_id,
            'proof_of_address' => $courier->proof_of_address,
            
            // Step 4: Service Coverage - Handle both new and legacy formats
            'regions_served' => $regionsServed ?? [],
            'provinces_served' => $provincesServed ?? [],
            'cities_served' => $citiesServed ?? [],
            'delivery_services' => $courier->delivery_services ?? [], // Cast handles old comma strings
            'pickup_available' => $courier->pickup_available ?? 'Not specified',
            'estimated_delivery_time' => $courier->estimated_delivery_time ?? 'Not specified',
            
            // Legacy service_areas (for old records)
            'service_areas_legacy' => $courier->service_areas ?? [],
            
            // Other
            'region' => $courier->region ?? 'Not provided',
            'province' => $courier->province ?? null,
            'municipality_city' => $courier->municipality_city ?? 'Not provided',
            'barangay' => $courier->barangay ?? 'Not provided',
            'postal_code' => $courier->postal_code ?? null,
            'privacy_policy_accepted' => $courier->privacy_policy_accepted ?? false,
            'verification_status' => $courier->verification_status ?? 'unverified',
        ];
        
        return Inertia::render('logistics/CourierApplicationDetail', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'application' => $application,
        ]);
    })->name('logistics.courier-application-detail');
    
    // API: Approve courier application
    Route::post('/api/logistics/courier-applications/{id}/approve', function ($id) {
        $courier = \App\Models\User::findOrFail($id);
        
        // Validate that this is a logistics account
        if ($courier->account_type !== 'logistics' || $courier->role !== 'courier') {
            return response()->json([
                'error' => 'This account is not a courier/logistics account',
            ], 400);
        }
        
        // Validate that it's pending
        if ($courier->status !== 'pending') {
            return response()->json([
                'error' => 'Application is not pending',
                'current_status' => $courier->status,
            ], 400);
        }
        
        // Approve the courier
        $courier->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
        
        \Log::info('Courier application approved', [
            'courier_id' => $courier->id,
            'company_name' => $courier->business_name ?? $courier->name,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);
        
        // TODO: Send email notification to courier about approval
        
        return response()->json([
            'success' => true,
            'message' => 'Courier application approved successfully',
            'courier' => [
                'id' => $courier->id,
                'status' => $courier->status,
                'approved_at' => $courier->approved_at,
            ],
        ]);
    });
    
    // API: Reject courier application
    Route::post('/api/logistics/courier-applications/{id}/reject', function (Illuminate\Http\Request $request, $id) {
        $courier = \App\Models\User::findOrFail($id);
        
        // Validate that this is a logistics account
        if ($courier->account_type !== 'logistics' || $courier->role !== 'courier') {
            return response()->json([
                'error' => 'This account is not a courier/logistics account',
            ], 400);
        }
        
        // Validate that it's pending
        if ($courier->status !== 'pending') {
            return response()->json([
                'error' => 'Application is not pending',
                'current_status' => $courier->status,
            ], 400);
        }
        
        $reason = $request->input('reason', 'Application rejected by logistics team');
        
        // Reject the courier
        $courier->update([
            'status' => 'rejected',
        ]);
        
        \Log::info('Courier application rejected', [
            'courier_id' => $courier->id,
            'company_name' => $courier->business_name ?? $courier->name,
            'reason' => $reason,
            'rejected_by' => auth()->id(),
            'rejected_at' => now(),
        ]);
        
        // TODO: Send email notification to courier about rejection with reason
        
        return response()->json([
            'success' => true,
            'message' => 'Courier application rejected',
            'courier' => [
                'id' => $courier->id,
                'status' => $courier->status,
            ],
        ]);
    });
    
    // Logistics Sort & Assign
    Route::get('/logistics/sort-assign', function () {
        $user = auth()->user();
        
        // Fetch orders with status "shipped" (confirmed at logistics hub, ready for sorting)
        $transitOrders = \App\Models\Order::where(fn ($w) => $w->where('status', 'shipped')
                ->orWhere(fn ($o) => \App\Services\StuckOrderGuard::orphanScope($o))) // + orders left in_transit with nobody holding them
            ->whereDoesntHave('shipmentAssignments', fn ($q) => $q->active()) // already dispatched (rider sync sets shipped again)
            ->with(['items.product'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($order) {
                
                // Get seller info from first item's product
                $sellerName = 'N/A';
                if ($order->items->isNotEmpty()) {
                    $product = $order->items->first()->product;
                    if ($product && $product->seller_id) {
                        $seller = \App\Models\User::find($product->seller_id);
                        $sellerName = $seller ? ($seller->business_name ?? $seller->name) : 'N/A';
                    }
                }
                
                // Barangay + city for courier service-area matching — from the
                // order's structured snapshot (see Order::recipient()).
                $recipient = $order->recipient();
                $barangay = $recipient['barangay'] ?? 'Unknown';
                $city = $recipient['city'] ?? 'Unknown';
                
                // Normalize payment method (database stores "cod", "gcash", etc. in lowercase)
                $paymentMethod = strtolower($order->payment_method ?? 'cod');
                $paymentMethodDisplay = match($paymentMethod) {
                    'cod' => 'Cash on Delivery',
                    'gcash' => 'GCash',
                    'paymaya' => 'PayMaya',
                    'card' => 'Credit/Debit Card',
                    default => 'Cash on Delivery',
                };
                
                // Compute estimated weight (0.3kg per item)
                $estimatedWeight = $order->items->sum(function ($item) {
                    return $item->quantity * 0.3;
                });
                
                return [
                    'id' => $order->id,
                    'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'waybill_number' => $order->waybill_number,
                    ...$order->buyerFields(),
                    'barangay' => $barangay,
                    'city' => $city, // Add city/municipality for matching
                    'seller_name' => $sellerName,
                    'total_amount' => $order->total ?? 0,
                    'payment_method' => $paymentMethodDisplay,
                    'items_count' => $order->items->count(),
                    'weight' => round($estimatedWeight, 1),
                    'confirmed_at' => $order->updated_at->format('M d, Y H:i'),
                    'status' => 'shipped',
                    // ONLY the best-matching couriers for this buyer address (barangay > city > province tier)
                    'eligible_courier_ids' => \App\Services\ShippingService::eligibleCouriers($order)->pluck('user.id')->values()->all(),
                    'eligible_tier' => \App\Services\ShippingService::eligibleCouriers($order)->first()['tier'] ?? null,
                ];
            });
        
        // Fetch approved courier/logistics companies with their service areas
        // ONLY fetch users with role='courier' (not logistics_staff)
        $approvedCouriers = \App\Models\User::where('account_type', 'logistics')
            ->where('role', 'courier') // Only couriers, not logistics_staff
            ->where('status', 'approved')
            ->orderBy('company_name')
            ->get()
            ->map(function ($courier) {
                // Parse service_areas JSON (array of barangays/municipalities the courier services)
                $serviceAreas = [];
                if ($courier->service_areas) {
                    $serviceAreas = is_string($courier->service_areas) 
                        ? json_decode($courier->service_areas, true) 
                        : $courier->service_areas;
                }
                
                return [
                    'id' => $courier->id,
                    'name' => $courier->company_name ?? $courier->business_name ?? $courier->name,
                    'contact_person' => trim(($courier->contact_first_name ?? '') . ' ' . ($courier->contact_last_name ?? '')),
                    'email' => $courier->email,
                    'service_areas' => $serviceAreas ?? [], // Array of barangays/cities they service
                    'region' => $courier->region,
                    'province' => $courier->province,
                    'municipality_city' => $courier->municipality_city,
                ];
            });
        
        return Inertia::render('logistics/SortAssign', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
            'parcels' => $transitOrders,
            'couriers' => $approvedCouriers,
        ]);
    })->name('logistics.sort-assign');
    
    // API: Assign parcels to courier
    Route::post('/api/logistics/assign-to-courier', function (Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'parcel_ids' => 'required|array|min:1',
            'parcel_ids.*' => 'integer|exists:orders,id',
            'courier_id' => 'required|integer|exists:users,id',
        ]);
        
        $user = auth()->user();
        $courierId = $validated['courier_id'];
        $parcelIds = $validated['parcel_ids'];
        
        // Verify courier exists and is approved
        $courier = \App\Models\User::where('id', $courierId)
            ->where('account_type', 'logistics')
            ->where('role', 'courier')
            ->where('status', 'approved')
            ->first();
        
        if (!$courier) {
            return response()->json(['error' => 'Invalid courier selected'], 400);
        }
        
        try {
            DB::beginTransaction();
            
            $assignedCount = 0;
            $skippedCount = 0;
            $errors = [];
            
            foreach ($parcelIds as $orderId) {
                $order = \App\Models\Order::lockForUpdate()->find($orderId); // two staff assigning at once: one waits
                
                if (!$order) {
                    $errors[] = "Order #$orderId not found";
                    $skippedCount++;
                    continue;
                }
                
                // Check if order is in correct status (shipped = confirmed at logistics hub)
                if ($order->status !== 'shipped' && ! \App\Services\StuckOrderGuard::isOrphan($order)) {
                    $errors[] = "Order {$order->waybill_number} is not ready for assignment (status: {$order->status})";
                    $skippedCount++;
                    continue;
                }
                
                // The courier must be one of the best matches for this buyer's address
                if (! \App\Services\ShippingService::eligibleCouriers($order)->contains(fn ($e) => (int) $e['user']->id === (int) $courierId)) {
                    $errors[] = "{$courier->company_name} does not cover the delivery address of {$order->waybill_number}";
                    $skippedCount++;
                    continue;
                }

                // Check if already assigned
                $existingAssignment = \App\Models\ShipmentAssignment::where('order_id', $orderId)
                    ->active()
                    ->first();
                
                if ($existingAssignment) {
                    $errors[] = "Order {$order->waybill_number} is already assigned";
                    $skippedCount++;
                    continue;
                }
                
                // Create shipment assignment
                $assignment = \App\Models\ShipmentAssignment::create([
                    'order_id' => $orderId,
                    'courier_id' => $courierId,
                    'assigned_by' => $user->id,
                    'assigned_at' => now(),
                    'assignment_status' => 'pending', // Courier needs to accept/reject
                    'acceptance_deadline' => now()->addHours(24), // 24 hours to accept
                    'pickup_status' => 'pending_pickup',
                    'weight' => $order->items->sum(function ($item) {
                        return $item->quantity * 0.3; // Estimated weight
                    }),
                ]);
                
                // Add history
                $assignment->addHistory('assigned', $user->id, "Assigned to {$courier->company_name}");
                
                // Update order status to 'in_transit' (assigned to courier)
                $order->update([
                    'status' => 'in_transit',
                    'assigned_courier_id' => $courierId,
                    'courier_assigned_at' => now(),
                ]);
                
                // Update tracking status for buyer visibility
                $courierName = $courier->company_name ?? $courier->business_name ?? 'courier';
                $order->updateTracking('assigned_courier', "Parcel assigned to {$courierName}");
                
                $assignedCount++;
                
                \Log::info('Parcel assigned to courier', [
                    'order_id' => $orderId,
                    'waybill_number' => $order->waybill_number,
                    'courier_id' => $courierId,
                    'courier_name' => $courier->company_name,
                    'assigned_by' => $user->id,
                ]);
            }
            
            DB::commit();
            
            $message = "Successfully assigned $assignedCount parcel(s) to {$courier->company_name}";
            if ($skippedCount > 0) {
                $message .= " ($skippedCount skipped)";
            }
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'assigned_count' => $assignedCount,
                'skipped_count' => $skippedCount,
                'errors' => $errors,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to assign parcels to courier', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Failed to assign parcels: ' . $e->getMessage(),
            ], 500);
        }
    });

    
    Route::middleware('role:logistics_staff')->group(function () {
        Route::get('/logistics/monitoring-data', [\App\Http\Controllers\Logistics\OperationsController::class, 'monitoring'])->middleware('throttle:120,1,logi-monitoring');
        Route::get('/logistics/riders-data', [\App\Http\Controllers\Logistics\OperationsController::class, 'riders'])->middleware('throttle:120,1,logi-riders');
        Route::post('/logistics/riders', [\App\Http\Controllers\Logistics\OperationsController::class, 'storeRider'])->middleware('throttle:30,1,logi-riders-write');
        Route::put('/logistics/riders/{id}', [\App\Http\Controllers\Logistics\OperationsController::class, 'updateRider'])->middleware('throttle:60,1,logi-riders-write')->whereNumber('id');
        Route::get('/logistics/reports-data', [\App\Http\Controllers\Logistics\OperationsController::class, 'reports'])->middleware('throttle:60,1,logi-reports');
    });

    // Logistics Delivery Monitoring
    Route::get('/logistics/delivery-monitoring', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/DeliveryMonitoring', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.delivery-monitoring');
    
    // Logistics Riders
    Route::get('/logistics/riders', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/Riders', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.riders');
    
    Route::redirect('/logistics/branches-checklists', '/logistics/branches-facilities'); // old bookmarks
    
    // Logistics Branches & Facilities
    Route::get('/logistics/branches-facilities', function () {
        $user = auth()->user();
        
        $company = \App\Support\CourierCompanyResolver::scope($user);
        $facilities = \App\Models\CourierFacility::where('courier_id', $company->id)->with('parentFacility')->orderBy('facility_type')->orderBy('facility_name')->get()
            ->map(fn ($f) => [
                'id' => $f->id, 'facility_name' => $f->facility_name, 'facility_code' => $f->facility_code, 'facility_type' => $f->facility_type,
                'parent_facility_id' => $f->parent_facility_id, 'parent_facility' => $f->parentFacility?->facility_name, 'status' => $f->status,
                'region' => $f->region, 'province' => $f->province, 'city' => $f->city, 'address' => $f->address,
                'manager' => $f->manager_name, 'contact' => $f->contact_number, 'coverage' => $f->coverage_cities,
            ]);

        return Inertia::render('logistics/BranchesFacilities', [
            'facilities' => $facilities,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.branches-facilities');
    
    // Per-facility operational checklists (real rows)
    Route::middleware('role:logistics_staff')->group(function () {
        Route::get('/logistics/facilities/{id}/checklist', [\App\Http\Controllers\Logistics\FacilityChecklistController::class, 'index'])->middleware('throttle:120,1,facility-checklist')->whereNumber('id');
        Route::post('/logistics/facilities/{id}/checklist', [\App\Http\Controllers\Logistics\FacilityChecklistController::class, 'store'])->middleware('throttle:60,1,facility-checklist-w')->whereNumber('id');
        Route::post('/logistics/facilities/{id}/checklist/reset', [\App\Http\Controllers\Logistics\FacilityChecklistController::class, 'reset'])->middleware('throttle:30,1,facility-checklist-w')->whereNumber('id');
        Route::put('/logistics/checklist-items/{id}', [\App\Http\Controllers\Logistics\FacilityChecklistController::class, 'update'])->middleware('throttle:120,1,facility-checklist-w')->whereNumber('id');
        Route::delete('/logistics/checklist-items/{id}', [\App\Http\Controllers\Logistics\FacilityChecklistController::class, 'destroy'])->middleware('throttle:60,1,facility-checklist-w')->whereNumber('id');
    });

    // Zones & rates data + management (checkout shipping fee reads these)
    Route::middleware('role:logistics_staff')->group(function () {
        Route::get('/logistics/zones-data', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'data']);
        Route::post('/logistics/zones', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'storeZone'])->middleware('throttle:60,1,zones-write');
        Route::put('/logistics/zones/{id}', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'updateZone'])->middleware('throttle:60,1,zones-write')->whereNumber('id');
        Route::delete('/logistics/zones/{id}', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'destroyZone'])->middleware('throttle:60,1,zones-write')->whereNumber('id');
        Route::post('/logistics/zones/{id}/rates', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'storeRate'])->middleware('throttle:60,1,zones-write')->whereNumber('id');
        Route::put('/logistics/rates/{id}', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'updateRate'])->middleware('throttle:60,1,zones-write')->whereNumber('id');
        Route::delete('/logistics/rates/{id}', [\App\Http\Controllers\Logistics\ZonesRatesController::class, 'destroyRate'])->middleware('throttle:60,1,zones-write')->whereNumber('id');
    });

    // Logistics Zones & Rates
    Route::get('/logistics/zones-rates', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/ZonesRates', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.zones-rates');
    
    Route::middleware('role:logistics_staff')->group(function () {
        Route::get('/logistics/cod-data', [\App\Http\Controllers\Logistics\CodSettlementController::class, 'data'])->middleware('throttle:120,1,cod-data');
        Route::post('/logistics/cod/{id}/received', [\App\Http\Controllers\Logistics\CodSettlementController::class, 'received'])->middleware('throttle:30,1,cod-step')->whereNumber('id');
        Route::post('/logistics/cod/{id}/settled', [\App\Http\Controllers\Logistics\CodSettlementController::class, 'settled'])->middleware('throttle:30,1,cod-step')->whereNumber('id');
    });

    // Logistics COD & Remittance
    Route::get('/logistics/cod-remittance', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/CODRemittance', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.cod-remittance');
    
    // Logistics Reports
    Route::get('/logistics/reports', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/Reports', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.reports');
    
    // Support queues for logistics / courier staff (tickets routed to them, A5)
    Route::prefix('staff-support')->middleware('role:logistics_staff,courier')->group(function () {
        Route::get('/feed', [\App\Http\Controllers\StaffSupportController::class, 'feed'])->middleware('throttle:120,1,staff-support-feed');
        Route::get('/{id}', [\App\Http\Controllers\StaffSupportController::class, 'show'])->middleware('throttle:120,1,staff-support-show')->whereNumber('id');
        Route::post('/{id}/reply', [\App\Http\Controllers\StaffSupportController::class, 'reply'])->middleware('throttle:60,1,staff-support-reply')->whereNumber('id');
        Route::post('/{id}/status', [\App\Http\Controllers\StaffSupportController::class, 'status'])->middleware('throttle:60,1,staff-support-status')->whereNumber('id');
    });

    // Logistics Support
    Route::get('/logistics/support', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/Support', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.support');
    
    // Logistics Messages
    Route::get('/logistics/messages', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/Messages', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.messages');
    
    // Logistics Account
    Route::get('/logistics/account', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/Account', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'company' => [
                'name' => $user->company_name ?? $user->business_name,
                'contact_person' => trim($user->contact_first_name . ' ' . $user->contact_last_name),
            ],
        ]);
    })->name('logistics.account');
    
    // Seller Orders Page
    Route::get('/seller/orders', function () {
        // Don't load orders here - let the frontend fetch via API
        return Inertia::render('seller/SellerOrders', [
            'orders' => [], // Empty - frontend will fetch
        ]);
    })->name('seller.orders');
    
    // Seller Products page
    Route::get('/seller/products', function () {
        $user = Auth::user();
        
        return Inertia::render('seller/SellerProducts', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'seller' => [
                'store_name' => $user->business_name ?? 'Your Store',
                'business_name' => $user->business_name,
            ],
            'products' => [], // Empty - let frontend fetch via API for faster navigation
        ]);
    })->name('seller.products');
    
    // Add Product page
    Route::get('/seller/products/create', function () {
        return Inertia::render('seller/ProductForm');
    })->name('seller.products.create');
    
    // Edit Product page
    Route::get('/seller/products/{id}/edit', function ($id) {
        $product = \App\Models\Product::findOrFail($id);
        
        // Check if product belongs to this seller
        if ($product->seller_id !== auth()->id()) {
            abort(403);
        }
        
        return Inertia::render('seller/ProductForm', [
            'product' => [
                'id' => (string) $product->id,
                'name' => $product->name,
                'category' => $product->category ?? '',
                'brand' => $product->brand ?? '',
                'description' => $product->description ?? '',
                'images' => $product->images ?? [],
                'mainIdx' => $product->main_image_index ?? 0,
                'price' => (float) $product->price,
                'salePrice' => $product->sale_price ? (float) $product->sale_price : null,
                'stock' => $product->stock,
                'sku' => $product->sku,
                'weight' => $product->weight ? (float) $product->weight : null,
                'status' => $product->status === 'active' ? 'published' : 'draft', // Convert active → published
                'has_variants' => $product->has_variants ?? false,
                'variant_options' => $product->variant_options ?? [],
                'variants' => $product->variants ?? [],
            ],
        ]);
    })->name('seller.products.edit');
    
    // Seller Settings page
    Route::get('/seller/settings', function () {
        $user = auth()->user();
        return Inertia::render('seller/SellerSettings', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'seller' => [
                'store_name' => $user->business_name ?? $user->name,
                'store_category' => $user->line_of_business ?? 'Health and Beauty',
                'phone' => $user->contact_number ?? '',
                'address_line1' => $user->street_address ?? '',
                'barangay' => $user->barangay ?? '',
                'city' => $user->municipality_city ?? '',
                'province' => $user->province ?? '',
                'postal_code' => '',
                'registered_at' => $user->created_at?->toDateString(),
            ],
        ]);
    })->name('seller.settings');
    
    // Persist the store (brand) name. Stored in users.business_name, the same column
    // the registration form fills, so the admin seller list/detail shows the current name.
    Route::put('/seller/store-name', [\App\Http\Controllers\SellerDashboardController::class, 'updateStoreName'])
        ->name('seller.store-name')->middleware('role:seller');

    // Seller Account Management page
    Route::get('/seller/account', function () {
        $user = auth()->user();
        
        return Inertia::render('seller/SellerAccount', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
            ],
            'seller' => [
                // From registration form
                'store_name' => $user->business_name ?? $user->name,
                'store_description' => $user->line_of_business ?? '',
                'store_category' => 'Health and Beauty', // You can add this field to users table later
                'phone' => $user->contact_number ?? '',
                'address_line1' => $user->street_address ?? '',
                'barangay' => $user->barangay ?? '',
                'city' => $user->municipality_city ?? '',
                'province' => $user->province ?? '',
                'postal_code' => '', // Add postal_code field to users table if needed
                'store_logo' => '', // Add store_logo field to users table if needed
                
                // Additional user info
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'middle_initial' => $user->middle_initial,
                'sex' => $user->sex,
                'birthday' => $user->birthday,
            ],
        ]);
    })->name('seller.account');
    
    // Seller Customers page
    Route::get('/seller/customers', function (\Illuminate\Http\Request $request) {
        $sellerId = (int) $request->user()->id;

        // One row per buyer who bought my items (cancelled orders excluded).
        $rows = \Illuminate\Support\Facades\DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('users', 'users.id', '=', 'orders.buyer_id')
            ->where('order_items.seller_id', $sellerId)
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('orders.buyer_id', 'users.name', 'users.email')
            ->selectRaw('orders.buyer_id AS id, users.name, users.email, COUNT(DISTINCT orders.id) AS orders, SUM(order_items.quantity * order_items.unit_price) AS spent, MIN(orders.created_at) AS first_order, MAX(orders.created_at) AS last_order')
            ->orderByDesc('last_order')
            ->limit(500)
            ->get();

        $monthStart = now()->startOfMonth();
        $orderCount = (int) $rows->sum('orders');

        return Inertia::render('seller/SellerCustomers', [
            'customers' => $rows->map(fn ($r) => [
                'id'         => (int) $r->id,
                'name'       => $r->name,
                'email'      => $r->email,
                'orders'     => (int) $r->orders,
                'spent'      => round((float) $r->spent, 2),
                'last_order' => \Illuminate\Support\Carbon::parse($r->last_order)->toISOString(),
            ])->values(),
            'stats' => [
                'total'     => $rows->count(),
                'new_month' => $rows->filter(fn ($r) => \Illuminate\Support\Carbon::parse($r->first_order)->gte($monthStart))->count(),
                'repeat'    => $rows->filter(fn ($r) => (int) $r->orders > 1)->count(),
                'avg_order' => $orderCount > 0 ? round((float) $rows->sum('spent') / $orderCount, 2) : 0,
            ],
            'initialTab' => $request->query('tab') === 'feedback' ? 'feedback' : 'customers',
        ]);
    })->name('seller.customers');
    
    // Seller Analytics page
    Route::get('/seller/analytics', function () {
        return Inertia::render('seller/SellerAnalytics');
    })->name('seller.analytics');
    
    // Seller Messages page
    Route::get('/seller/messages', function () {
        return Inertia::render('seller/SellerMessages');
    })->name('seller.messages');
});

Route::get('/register', function () {
    return Inertia::render('Register');
})->name('register');

Route::get('/register/seller', function () {
    return Inertia::render('seller/SellerRegistration');
})->name('register.seller');

Route::get('/register/logistics', function () {
    return Inertia::render('logistics/LogisticsRegistration');
})->name('register.logistics');

Route::get('/register/courier', function () {
    // Force logout if already authenticated
    if (Auth::check()) {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
    return Inertia::render('logistics/CourierRegistration');
})->name('register.courier');

// Rider Registration Routes
Route::get('/register/rider', [App\Http\Controllers\RiderRegistrationController::class, 'create'])->name('register.rider');
Route::post('/register/rider', [App\Http\Controllers\RiderRegistrationController::class, 'store'])->name('register.rider.store');
Route::get('/register/rider/pending', [App\Http\Controllers\RiderRegistrationController::class, 'pending'])->name('register.rider.pending');

// Rider Registration Routes (branch assignment removed - handled by courier during approval)
// No API routes needed for frontend registration

// Polled by the pending-approval pages: signs the user in once the admin has approved them.
Route::get('/register/approval-status', [\App\Http\Controllers\Auth\ApprovalStatusController::class, 'show'])
    ->middleware('throttle:60,1,approval-status')->name('register.approval-status');

Route::get('/register/pending', function () {
    return Inertia::render('register-pending');
})->name('register.pending');

// Email verification routes (OTP-based)
Route::get('/verify-email', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'showVerification'])
    ->name('otp.show');
Route::post('/verify-email', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'verifyOtp'])
    ->name('otp.verify');
Route::post('/verify-email/resend', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'resendOtp'])
    ->name('otp.resend');

// Seller pending approval page
Route::get('/seller/pending-approval', function () {
    return Inertia::render('seller/PendingApproval');
})->name('seller.pending-approval');

// Logistics pending approval page
Route::get('/logistics/pending-approval', function () {
    return Inertia::render('logistics/PendingApproval');
})->name('logistics.pending-approval');

// Privacy Policy page
Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy.policy');

// Terms page (assuming you already have this)
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/homepage', function (Illuminate\Http\Request $request) {
    // Base query for products
    $query = \App\Models\Product::with('seller:id,business_name,name')
        ->sellerActive() // hide suspended / deactivated sellers
        ->where('status', 'active')
        ->where('approval_status', 'approved');
    
    // Apply search filter
    if ($request->has('search') && $request->input('search') !== '') {
        $search = $request->input('search');
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%")
                ->orWhere('brand', 'like', "%{$search}%");
        });
    }
    
    // Apply category filter
    if ($request->has('category') && $request->input('category') !== '') {
        $query->where('category', $request->input('category'));
    }
    
    // Fetch top-selling products from the last 7 days with applied filters
    $products = $query->withCount(['orderItems as total_sold' => function ($query) {
            $query->selectRaw('COALESCE(SUM(quantity), 0)')
                ->whereHas('order', function ($q) {
                    $q->where('status', '!=', 'cancelled')
                        ->where('status', '!=', 'failed')
                        ->where('created_at', '>=', now()->subDays(7));
                });
        }])
        ->orderBy('total_sold', 'desc')
        ->orderBy('created_at', 'desc')
        ->take(50) // Increased to 50 for better filtering results
        ->get()
        ->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'effective_price' => (float) ($product->sale_price ?? $product->price),
                'is_on_sale' => $product->sale_price !== null,
                'stock' => $product->stock,
                'stock_status' => $product->stock_status,
                'is_in_stock' => $product->stock > 0,
                'is_low_stock' => $product->stock > 0 && $product->stock <= ($product->low_stock_threshold ?? 5),
                'main_image' => $product->main_image,
                'seller_name' => $product->seller->business_name ?? $product->seller->name,
                'category' => $product->category,
                'brand' => $product->brand,
                'total_sold' => $product->total_sold ?? 0,
            ];
        });
    
    return Inertia::render('Homepage', [
        'initialProducts' => $products,
        'filters' => [
            'search' => $request->input('search', ''),
            'category' => $request->input('category', ''),
        ],
        // Live vouchers (active, started, not ended, uses left) with this buyer's
        // claim state. Same rules as /api/vouchers/available and the mobile app.
        'vouchers' => \App\Services\VoucherService::available($request->user(), 12),
        // Admin-managed banners that are live right now (hero / secondary / sidebar)
        'banners' => \App\Models\Banner::liveByPosition(),
    ]);
})->name('homepage');

// Live banners for the buyer app (same data as the web homepage). Public.
Route::get('/api/banners', fn () => response()->json(['data' => \App\Models\Banner::liveByPosition()]))->middleware('throttle:60,1,public-banners');

// Buyer <-> seller chat page (real threads, same data as the mobile app).
// resources/views/messages.blade.php (old hardcoded mock) is no longer used.
// ?thread={id} opens a thread; ?seller_id=&product_id= starts/opens the thread with that seller.
Route::get('/messages', function (\Illuminate\Http\Request $request) {
    $user = $request->user();
    if ($user->account_type === 'seller') {
        return redirect('/seller/messages');
    }
    abort_unless($user->account_type === 'buyer', 403);

    $int = fn (string $key) => ctype_digit((string) $request->query($key)) ? (int) $request->query($key) : null;

    return Inertia::render('BuyerMessages', [
        'initialThreadId' => $int('thread'),
        'startSellerId'   => $int('seller_id'),
        'startProductId'  => $int('product_id'),
        // ?tab=riders&order={id}: open the rider chat of that order.
        'initialTab'      => $request->query('tab') === 'riders' ? 'riders' : 'sellers',
        'riderOrderId'    => $int('order'),
    ]);
})->middleware(['auth', 'approved'])->name('messages');

// Buyer checkout and order routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/cart', function () {
        // Fetch suggested products (top-selling or random)
        $suggestedProducts = \App\Models\Product::sellerActive()->where('status', 'active')
            ->where('stock', '>', 0)
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'effective_price' => (float) ($product->sale_price ?? $product->price),
                    'is_on_sale' => $product->sale_price !== null,
                    'main_image' => $product->main_image,
                    'seller_name' => $product->seller->business_name ?? $product->seller->name,
                ];
            });
        
        return Inertia::render('Cart', [
            'suggestedProducts' => $suggestedProducts,
        ]);
    })->name('cart');
    
    Route::get('/checkout', [\App\Http\Controllers\OrderController::class, 'checkout'])->name('checkout');
    Route::get('/api/shipping/quote', [\App\Http\Controllers\OrderController::class, 'shippingQuote'])->middleware('throttle:60,1,shipping-quote')->name('shipping.quote');
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/success', [\App\Http\Controllers\OrderController::class, 'success'])->name('orders.success');
    Route::get('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'show'])->name('orders.show')->whereNumber('id');
    Route::get('/orders/{id}/tracking', [\App\Http\Controllers\Buyer\OrderTrackingController::class, 'page'])->name('orders.tracking')->whereNumber('id');
});

Route::get('/product/{id}', function (string $id) {
    $product = \App\Models\Product::with('seller:id,business_name,name,profile_photo')
        ->sellerActive() // product page of a deactivated seller is a 404
        ->findOrFail($id);
    
    return Inertia::render('ProductDetail', [
        'product' => [
            'id' => (string) $product->id,
            'name' => $product->name,
            'description' => $product->description ?? '',
            'category' => $product->category ?? '',
            'price' => (float) $product->price,
            'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
            'effective_price' => (float) ($product->sale_price ?? $product->price),
            'is_on_sale' => $product->sale_price !== null,
            'stock' => $product->stock,
            'stock_status' => $product->stock_status,
            'is_in_stock' => $product->stock > 0,
            'is_low_stock' => $product->stock > 0 && $product->stock <= 10,
            'images' => $product->images ?? [],
            'main_image_index' => $product->main_image_index ?? 0,
            'weight' => $product->weight ? (float) $product->weight : null,
            'brand' => $product->brand ?? '',
            'sku' => $product->sku,
            'seller_name' => $product->seller->business_name ?? $product->seller->name,
            'seller_id' => $product->seller_id,
            'seller_profile_photo' => \App\Support\AvatarUrl::fromPath($product->seller->profile_photo),
            'has_variants' => $product->has_variants ?? false,
            'variant_options' => $product->variant_options ?? null,
            'variants' => $product->variants ?? null,
            // Seller rating across all reviews of this seller's products.
            'seller_rating' => (function () use ($product) {
                $agg = \App\Models\Review::whereHas('product', fn ($p) => $p->where('seller_id', $product->seller_id))
                    ->selectRaw('COUNT(*) AS c, AVG(rating) AS a')
                    ->first();
                return ['count' => (int) ($agg->c ?? 0), 'avg' => $agg && $agg->c ? round((float) $agg->a, 1) : null];
            })(),
        ],
        // Real reviews (additive): same data and shape as the mobile
        // GET /api/buyer/products/{id}/reviews (names masked).
        'reviews' => app(\App\Http\Controllers\Api\BuyerReviewController::class)
            ->productReviews(\Illuminate\Http\Request::create('/', 'GET', ['per_page' => 10]), (int) $product->id)
            ->getData(true),
    ]);
})->name('product.show');

Route::get('/seller/{id}', function (string $id) {
    $seller = \App\Models\User::where('id', $id)
        ->where('account_type', 'seller')
        ->whereNotIn('status', \App\Support\AccountStatus::BLOCKED) // deactivated / suspended stores are hidden
        ->firstOrFail();
    
    $sellerData = [
        'id' => $seller->id,
        'name' => $seller->name,
        'business_name' => $seller->business_name,
        'email' => $seller->email,
        'profile_photo_url' => \App\Support\AvatarUrl::fromPath($seller->profile_photo),
        'cover_photo_url' => $seller->cover_photo ? asset('storage/' . $seller->cover_photo) : null,
    ];
    
    // Debug logging
    \Log::info('ViewSeller data:', $sellerData);
    
    return Inertia::render('ViewSeller', [
        'seller' => $sellerData,
    ]);
})->name('seller.view')->whereNumber('id');

Route::get('/category/{category}', function (string $category) {
    $products = \App\Models\Product::with('seller:id,business_name,name')
        ->sellerActive()
        ->where('category', $category)
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'effective_price' => (float) ($product->sale_price ?? $product->price),
                'is_on_sale' => $product->sale_price !== null,
                'main_image' => $product->main_image,
                'stock' => $product->stock,
                'category' => $product->category,
                'seller_name' => $product->seller->business_name ?? $product->seller->name,
            ];
        });

    return Inertia::render('CategoryPage', [
        'category' => $category,
        'products' => $products,
    ]);
})->name('category.show');


// Waybill QR code (public for scanning)
Route::get('/waybill/{waybillNumber}/qr', [\App\Http\Controllers\WaybillController::class, 'qrCode'])->name('waybill.qr');

// ---------------------------------------------------------------------------
// Product API routes
// ---------------------------------------------------------------------------

// Public product routes (buyers) - upgraded with search, filter, sort, pagination
Route::get('/api/products', [ProductController::class, 'index']); // List active products
Route::get('/api/products/{id}', [ProductController::class, 'show']); // Single product

// Public seller store data
Route::get('/api/seller/{id}/store', [ProductController::class, 'getSellerStore']); // Seller store with products and stats

// Protected buyer routes - Cart & Orders API
Route::middleware(['auth', 'verified'])->group(function () {
    // Cart
    Route::get('/api/cart', [\App\Http\Controllers\CartController::class, 'index']);
    Route::get('/api/cart/count', [\App\Http\Controllers\CartController::class, 'getCount']);
    Route::post('/api/cart/items', [\App\Http\Controllers\CartController::class, 'addItem']);
    Route::patch('/api/cart/items/{id}', [\App\Http\Controllers\CartController::class, 'updateItem']);
    Route::delete('/api/cart/items/{id}', [\App\Http\Controllers\CartController::class, 'removeItem']);
    
    // Wishlist
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'show'])->name('wishlist');
    Route::get('/api/wishlist', [\App\Http\Controllers\WishlistController::class, 'index']);
    Route::get('/api/wishlist/count', [\App\Http\Controllers\WishlistController::class, 'count']);
    Route::post('/api/wishlist/check', [\App\Http\Controllers\WishlistController::class, 'check']);
    Route::post('/api/wishlist/items', [\App\Http\Controllers\WishlistController::class, 'addItem']);
    Route::delete('/api/wishlist/items/{id}', [\App\Http\Controllers\WishlistController::class, 'removeItem']);
    Route::post('/api/wishlist/toggle', [\App\Http\Controllers\WishlistController::class, 'toggleItem']);
    
    // Orders
    Route::post('/api/orders', [\App\Http\Controllers\OrderController::class, 'store']);
    Route::post('/api/orders/{id}/cancel', [\App\Http\Controllers\OrderController::class, 'cancel']);
    // Buyer delivery code (read-only; same controller as GET /api/buyer/orders/{id}/delivery-code)
    Route::get('/api/orders/{id}/delivery-code', [\App\Http\Controllers\Api\BuyerDeliveryCodeController::class, 'show'])->middleware('throttle:30,1')->whereNumber('id');
    // Order received + proof-of-delivery photo (same controllers as /api/buyer/orders/{id}/receive|pod-photo)
    Route::post('/api/orders/{id}/receive', [\App\Http\Controllers\Api\BuyerOrderController::class, 'receive'])->middleware('throttle:10,1,web-order-receive')->whereNumber('id');
    Route::get('/api/orders/{id}/pod-photo', [\App\Http\Controllers\Api\DeliveryPodPhotoController::class, 'buyerOrderPhoto'])->middleware('throttle:60,1,web-pod-photo')->whereNumber('id');

    // Buyer <-> rider delivery chat for the web (session). Same controller and JSON as /api/buyer/orders/{id}/chat.
    Route::get('/buyer/rider-chats', [\App\Http\Controllers\Api\DeliveryChatController::class, 'buyerThreads'])->middleware('throttle:120,1,web-rider-chats');
    Route::get('/buyer/orders/{id}/rider-chat', [\App\Http\Controllers\Api\DeliveryChatController::class, 'buyerIndex'])->middleware('throttle:120,1,web-rider-chat')->whereNumber('id');
    Route::post('/buyer/orders/{id}/rider-chat', [\App\Http\Controllers\Api\DeliveryChatController::class, 'buyerSend'])->middleware('throttle:30,1,web-rider-chat-send')->whereNumber('id');
    Route::post('/buyer/orders/{id}/rider-chat/read', [\App\Http\Controllers\Api\DeliveryChatController::class, 'buyerRead'])->middleware('throttle:60,1,web-rider-chat-read')->whereNumber('id');

    // Address book (same controller/rules as /api/buyer/addresses)
    Route::get('/addresses', fn () => Inertia::render('BuyerAddresses'))->name('buyer.addresses');
    Route::get('/buyer/addresses', [\App\Http\Controllers\Api\BuyerAddressController::class, 'index']);
    Route::post('/buyer/addresses', [\App\Http\Controllers\Api\BuyerAddressController::class, 'store'])->middleware('throttle:30,1,web-address-store');
    Route::put('/buyer/addresses/{id}', [\App\Http\Controllers\Api\BuyerAddressController::class, 'update'])->middleware('throttle:30,1,web-address-update')->whereNumber('id');
    Route::delete('/buyer/addresses/{id}', [\App\Http\Controllers\Api\BuyerAddressController::class, 'destroy'])->middleware('throttle:30,1,web-address-destroy')->whereNumber('id');
    Route::post('/buyer/addresses/{id}/default', [\App\Http\Controllers\Api\BuyerAddressController::class, 'setDefault'])->middleware('throttle:30,1,web-address-default')->whereNumber('id');

    // Voucher wallet (same controller as /api/buyer/vouchers*)
    Route::get('/vouchers', fn () => Inertia::render('BuyerVouchers'))->name('buyer.vouchers');
    Route::get('/buyer/vouchers', [\App\Http\Controllers\Api\BuyerVoucherController::class, 'index']);
    Route::get('/buyer/vouchers/mine', [\App\Http\Controllers\Api\BuyerVoucherController::class, 'mine']);
    Route::post('/buyer/vouchers/claim', [\App\Http\Controllers\Api\BuyerVoucherController::class, 'claim'])->middleware('throttle:20,1,web-voucher-claim');

    // Profile photo (same controller as POST /api/buyer/profile/photo)
    Route::post('/buyer/profile/photo', [\App\Http\Controllers\Api\BuyerAccountController::class, 'uploadPhoto'])->middleware('throttle:10,1,web-buyer-profile-photo');

    // Track Order transit log (same controller/JSON as GET /api/buyer/orders/{id}/tracking)
    Route::get('/api/orders/{id}/tracking', [\App\Http\Controllers\Buyer\OrderTrackingController::class, 'show'])->middleware('throttle:60,1,web-order-tracking')->whereNumber('id');
    
    // Voucher validation
    Route::post('/api/vouchers/validate', [\App\Http\Controllers\Admin\VoucherController::class, 'validate']);
    Route::get('/api/vouchers/available', [\App\Http\Controllers\Admin\VoucherController::class, 'available']);
    Route::post('/api/vouchers/claim', [\App\Http\Controllers\Admin\VoucherController::class, 'claim']);
    
    
    // Orders data refresh endpoint
    Route::get('/orders/data', [\App\Http\Controllers\OrderController::class, 'getData']);

    // Buyer in-app notifications for the web bell (session auth). Same
    // controller, queries and JSON shape as /api/buyer/notifications; buyer
    // accounts only (403 otherwise), each buyer sees only their own rows.
    Route::get('/buyer/notifications/feed', [\App\Http\Controllers\Api\BuyerNotificationController::class, 'index']);
    Route::post('/buyer/notifications/read-all', [\App\Http\Controllers\Api\BuyerNotificationController::class, 'markAllRead'])->middleware('throttle:30,1,web-notification-markallread');
    Route::post('/buyer/notifications/{id}/read', [\App\Http\Controllers\Api\BuyerNotificationController::class, 'markRead'])->middleware('throttle:60,1,web-notification-markread')->whereNumber('id');
    // Buyer notification feed page (Inertia, buyer only, newest first, paginated).
    Route::get('/buyer/notifications', [\App\Http\Controllers\Buyer\NotificationController::class, 'index'])->name('buyer.notifications');
    
    // Buyer <-> seller chat for the web (session auth). Same controller, queries
    // and JSON shape as /api/buyer/chat* used by the mobile app; buyer only.
    Route::post('/buyer/chat/start', [\App\Http\Controllers\Api\BuyerChatController::class, 'start'])->middleware('throttle:20,1,web-chat-start');
    Route::get('/buyer/chat/threads', [\App\Http\Controllers\Api\BuyerChatController::class, 'index'])->middleware('throttle:120,1,web-chat-threads');
    Route::get('/buyer/chat/{id}/messages', [\App\Http\Controllers\Api\BuyerChatController::class, 'messages'])->middleware('throttle:120,1,web-chat-messages')->whereNumber('id');
    Route::post('/buyer/chat/{id}/messages', [\App\Http\Controllers\Api\BuyerChatController::class, 'send'])->middleware('throttle:30,1,web-chat-send')->whereNumber('id');

    // Follow stores + following list for the web (session auth). Same controller,
    // rules and JSON as /api/buyer/* used by the mobile app; buyer accounts only.
    Route::post('/buyer/sellers/{id}/follow', [\App\Http\Controllers\Api\BuyerFollowController::class, 'follow'])->middleware('throttle:30,1,web-follow-follow')->whereNumber('id');
    Route::delete('/buyer/sellers/{id}/follow', [\App\Http\Controllers\Api\BuyerFollowController::class, 'unfollow'])->middleware('throttle:30,1,web-follow-unfollow')->whereNumber('id');
    Route::get('/buyer/following', [\App\Http\Controllers\Api\BuyerFollowController::class, 'index']);
    Route::get('/following', fn () => Inertia::render('BuyerFollowing'))->name('buyer.following');

    // Account settings for the web (session auth): profile, change email / phone (OTP) and password.
    // Same controllers, validation, OTP rules and rate limits as the mobile app; buyer accounts only.
    Route::get('/buyer/profile', [\App\Http\Controllers\Api\BuyerProfileController::class, 'show']);
    Route::put('/buyer/profile', [\App\Http\Controllers\Api\BuyerProfileController::class, 'update'])->middleware('throttle:30,1,web-buyer-profile');
    Route::post('/buyer/change-password', [\App\Http\Controllers\Api\BuyerAccountController::class, 'changePassword'])->middleware('throttle:10,1,web-buyer-change-password');
    Route::post('/buyer/change-email/request', [\App\Http\Controllers\Api\BuyerAccountController::class, 'changeEmailRequest'])->middleware('throttle:5,1,web-buyer-change-email-request');
    Route::post('/buyer/change-email/verify', [\App\Http\Controllers\Api\BuyerAccountController::class, 'changeEmailVerify'])->middleware('throttle:10,1,web-buyer-change-email-verify');
    Route::post('/buyer/change-phone/request', [\App\Http\Controllers\Api\BuyerAccountController::class, 'changePhoneRequest'])->middleware('throttle:5,1,web-buyer-change-phone-request');
    Route::post('/buyer/change-phone/verify', [\App\Http\Controllers\Api\BuyerAccountController::class, 'changePhoneVerify'])->middleware('throttle:10,1,web-buyer-change-phone-verify');

    // Returns / refunds for the web (session auth). Same controller, rules and
    // JSON shape as /api/buyer/* used by the mobile app; buyer only.
    Route::post('/buyer/orders/{id}/return', [\App\Http\Controllers\Api\BuyerReturnController::class, 'store'])->middleware('throttle:10,1,web-return-store')->whereNumber('id');
    Route::get('/buyer/returns', [\App\Http\Controllers\Api\BuyerReturnController::class, 'index']);
    Route::get('/buyer/returns/{id}', [\App\Http\Controllers\Api\BuyerReturnController::class, 'show'])->whereNumber('id');
    Route::post('/buyer/returns/{id}/escalate', [\App\Http\Controllers\Api\BuyerReturnController::class, 'escalate'])->middleware('throttle:5,1,web-return-escalate')->whereNumber('id');
    Route::get('/returns', fn () => Inertia::render('BuyerReturns'))->name('buyer.returns');
    // Refund status per return request (web only; the mobile /api/buyer/returns payload is unchanged).
    Route::get('/buyer/refunds', [\App\Http\Controllers\Buyer\RefundStatusController::class, 'index']);

    // Reviews for the web (session auth). Same controller as the mobile app.
    Route::post('/buyer/orders/{orderId}/items/{itemId}/review', [\App\Http\Controllers\Api\BuyerReviewController::class, 'store'])->middleware('throttle:10,1,web-review-store')->whereNumber(['orderId', 'itemId']);
    Route::put('/buyer/reviews/{id}', [\App\Http\Controllers\Api\BuyerReviewController::class, 'update'])->middleware('throttle:10,1,web-review-update')->whereNumber('id');
    Route::get('/my-reviews', [\App\Http\Controllers\Buyer\MyReviewsController::class, 'index'])->name('buyer.reviews');

    // Product Reports
    Route::post('/api/products/{id}/report', [ProductController::class, 'reportProduct']);

    // Parcel problem reports (buyer, web session). Same controller as the app.
    Route::get('/buyer/orders/{id}/parcel-report', [\App\Http\Controllers\Api\ParcelReportController::class, 'buyerShow'])->middleware('throttle:60,1,web-parcel-report-show')->whereNumber('id');
    Route::post('/buyer/orders/{id}/parcel-report', [\App\Http\Controllers\Api\ParcelReportController::class, 'buyerStore'])->middleware('throttle:10,1,web-parcel-report')->whereNumber('id');

    // Support tickets (web session: buyer + seller pages; JSON shared with the apps).
    Route::get('/support', [\App\Http\Controllers\SupportTicketController::class, 'buyerPage'])->middleware('role:buyer')->name('buyer.support');
    Route::get('/complaints', [\App\Http\Controllers\Buyer\ComplaintController::class, 'index'])->middleware('role:buyer')->name('buyer.complaints');
    Route::post('/complaints', [\App\Http\Controllers\Buyer\ComplaintController::class, 'store'])->middleware(['role:buyer', 'throttle:10,1,buyer-complaint'])->name('buyer.complaints.store');
    Route::get('/seller/support', [\App\Http\Controllers\SupportTicketController::class, 'sellerPage'])->middleware(['role:seller', 'approved'])->name('seller.support');
    Route::get('/support/attachments/{id}', [\App\Http\Controllers\SupportAttachmentController::class, 'show'])->middleware('throttle:120,1,web-support-file')->whereNumber('id');
    Route::get('/support/tickets', [\App\Http\Controllers\SupportTicketController::class, 'index'])->middleware('throttle:60,1,web-support-list');
    Route::post('/support/tickets', [\App\Http\Controllers\SupportTicketController::class, 'store'])->middleware('throttle:5,1,web-support-store');
    Route::get('/support/tickets/{id}', [\App\Http\Controllers\SupportTicketController::class, 'show'])->middleware('throttle:60,1,web-support-show')->whereNumber('id');
    Route::post('/support/tickets/{id}/replies', [\App\Http\Controllers\SupportTicketController::class, 'reply'])->middleware('throttle:20,1,web-support-reply')->whereNumber('id');
});

// Protected seller product routes
Route::middleware(['auth', 'verified', 'approved'])->group(function () {
    // Seller in-app notifications (seller accounts only; each seller sees only their own rows).
    Route::get('/seller/notifications', [\App\Http\Controllers\Seller\NotificationController::class, 'page'])->name('seller.notifications');
    Route::get('/seller/notifications/feed', [\App\Http\Controllers\Seller\NotificationController::class, 'feed']);
    Route::post('/seller/notifications/read-all', [\App\Http\Controllers\Seller\NotificationController::class, 'markAllRead'])->middleware('throttle:30,1,seller-notification-markallread');
    Route::post('/seller/notifications/{id}/read', [\App\Http\Controllers\Seller\NotificationController::class, 'markRead'])->middleware('throttle:60,1,seller-notification-markread')->whereNumber('id');

    // Role messaging (seller, courier, logistics, buyer<->admin): same controller as the admin and app routes.
    Route::prefix('messaging')->group(function () {
        Route::get('/contacts', [\App\Http\Controllers\MessagingController::class, 'contacts'])->middleware('throttle:60,1,web-msg-contacts');
        Route::get('/threads', [\App\Http\Controllers\MessagingController::class, 'threads'])->middleware('throttle:120,1,web-msg-threads');
        Route::post('/start', [\App\Http\Controllers\MessagingController::class, 'start'])->middleware('throttle:20,1,web-msg-start');
        Route::get('/threads/{id}/messages', [\App\Http\Controllers\MessagingController::class, 'messages'])->middleware('throttle:120,1,web-msg-messages')->whereNumber('id');
        Route::post('/threads/{id}/messages', [\App\Http\Controllers\MessagingController::class, 'send'])->middleware('throttle:30,1,web-msg-send')->whereNumber('id');
        Route::post('/threads/{id}/read', [\App\Http\Controllers\MessagingController::class, 'read'])->middleware('throttle:60,1,web-msg-read')->whereNumber('id');
        Route::get('/messages/{id}/image', [\App\Http\Controllers\MessagingController::class, 'image'])->middleware('throttle:120,1,web-msg-image')->whereNumber('id');
    });

    // Seller returns (own items only; approve/reject pending) and replies to reviews of own products.
    Route::get('/seller/returns', [\App\Http\Controllers\Seller\ReturnsController::class, 'page'])->name('seller.returns');
    Route::get('/seller/returns/feed', [\App\Http\Controllers\Seller\ReturnsController::class, 'feed']);
    Route::post('/seller/returns/{id}/decision', [\App\Http\Controllers\Seller\ReturnsController::class, 'decision'])->middleware('throttle:30,1,seller-return-decision')->whereNumber('id');
    Route::get('/seller/returns/{id}/photo/{filename}', [\App\Http\Controllers\Seller\ReturnsController::class, 'photo'])->whereNumber('id');
    Route::get('/seller/reviews/feed', [\App\Http\Controllers\Seller\ReviewsController::class, 'feed']);
    Route::post('/seller/reviews/{id}/reply', [\App\Http\Controllers\Seller\ReviewsController::class, 'reply'])->middleware('throttle:30,1,seller-review-reply')->whereNumber('id');

    // Seller side of buyer <-> seller chat (seller accounts only; own threads only, 404 otherwise).
    Route::get('/seller/chat/threads', [\App\Http\Controllers\Api\SellerChatController::class, 'index'])->middleware('throttle:120,1,seller-chat-threads');
    Route::get('/seller/chat/{id}/messages', [\App\Http\Controllers\Api\SellerChatController::class, 'messages'])->middleware('throttle:120,1,seller-chat-messages')->whereNumber('id');
    Route::post('/seller/chat/{id}/messages', [\App\Http\Controllers\Api\SellerChatController::class, 'send'])->middleware('throttle:30,1,seller-chat-send')->whereNumber('id');
    Route::post('/seller/chat/{id}/read', [\App\Http\Controllers\Api\SellerChatController::class, 'markRead'])->middleware('throttle:60,1,seller-chat-read')->whereNumber('id');

    // Analytics
    Route::get('/api/seller/analytics', [\App\Http\Controllers\SellerAnalyticsController::class, 'index']);
    
    // Products CRUD
    Route::get('/api/seller/products', [ProductController::class, 'sellerIndex']); // Seller's own products (upgraded with filters)
    Route::post('/api/products', [ProductController::class, 'store']); // Create product
    Route::patch('/api/products/{id}', [ProductController::class, 'update']); // Update product (all fields)
    Route::patch('/api/products/{id}/stock', [ProductController::class, 'updateStock']); // Update stock only
    Route::patch('/api/products/{id}/variants/{variantId}/stock', [ProductController::class, 'updateVariantStock']); // Update variant stock
    Route::delete('/api/products/{id}', [ProductController::class, 'destroy']); // Soft delete product
    
    // Stock logs
    Route::get('/api/products/{id}/stock-logs', [ProductController::class, 'getStockLogs']);
    
    // Seller Orders
    Route::get('/api/seller/orders', [\App\Http\Controllers\SellerOrderController::class, 'index']);
    Route::get('/api/seller/orders/recent', [\App\Http\Controllers\SellerOrderController::class, 'recent']);
    Route::patch('/api/seller/orders/{id}/status', [\App\Http\Controllers\SellerOrderController::class, 'updateStatus']);
    
    // Waybill routes (accessible by seller and logistics)
    Route::post('/api/orders/{id}/waybill/generate', [\App\Http\Controllers\WaybillController::class, 'generate']);
    Route::get('/api/orders/{id}/waybill', [\App\Http\Controllers\WaybillController::class, 'show']);
    Route::post('/api/orders/{id}/waybill/mark-printed', [\App\Http\Controllers\WaybillController::class, 'markPrinted']);
    
    // Real-time seller dashboard stream (SSE)
    Route::get('/api/seller/dashboard/stream', [\App\Http\Controllers\SellerDashboardStreamController::class, 'stream']);
    
    // Store Photos Management
    Route::post('/api/seller/profile-photo', [\App\Http\Controllers\Api\SellerStorePhotoController::class, 'uploadProfilePhoto']);
    Route::post('/api/seller/cover-photo', [\App\Http\Controllers\Api\SellerStorePhotoController::class, 'uploadCoverPhoto']);
    Route::delete('/api/seller/profile-photo', [\App\Http\Controllers\Api\SellerStorePhotoController::class, 'deleteProfilePhoto']);
    Route::delete('/api/seller/cover-photo', [\App\Http\Controllers\Api\SellerStorePhotoController::class, 'deleteCoverPhoto']);
});

require __DIR__.'/settings.php';

// ---------------------------------------------------------------------------
// Admin Panel — secret, session-protected area
// Access via /admin with the master code stored in ADMIN_MASTER_CODE (.env)
// ---------------------------------------------------------------------------
Route::prefix('admin')->name('admin.')->group(function () {
    // Public entry point — show the master code form
    Route::get('/', [AdminController::class, 'index'])->name('login');

    // Code verification — POST only, rate-limited to 10 attempts/minute
    Route::post('/verify', [AdminController::class, 'verify'])->name('verify')->middleware('throttle:10,1');

    // Protected routes — require the session flag set by verify()
    Route::middleware('admin.verified')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        
        // Vouchers Management
        Route::get('/vouchers', [App\Http\Controllers\Admin\VoucherController::class, 'index'])->name('vouchers');
        Route::post('/vouchers', [App\Http\Controllers\Admin\VoucherController::class, 'store']);
        Route::put('/vouchers/{voucher}', [App\Http\Controllers\Admin\VoucherController::class, 'update']);
        Route::delete('/vouchers/{voucher}', [App\Http\Controllers\Admin\VoucherController::class, 'destroy']);
        Route::patch('/vouchers/{voucher}/toggle', [App\Http\Controllers\Admin\VoucherController::class, 'toggleStatus']);
        
        // Banner Management
        Route::get('/banners', [\App\Http\Controllers\Admin\BannerController::class, 'page'])->name('banners');
        Route::get('/banners/data', [\App\Http\Controllers\Admin\BannerController::class, 'data'])->middleware('throttle:120,1,admin-banners-read');
        Route::post('/banners', [\App\Http\Controllers\Admin\BannerController::class, 'store'])->middleware('throttle:30,1,admin-banners-write');
        Route::post('/banners/{id}', [\App\Http\Controllers\Admin\BannerController::class, 'update'])->middleware('throttle:30,1,admin-banners-write')->whereNumber('id');
        Route::post('/banners/{id}/toggle', [\App\Http\Controllers\Admin\BannerController::class, 'toggle'])->middleware('throttle:60,1,admin-banners-write')->whereNumber('id');
        Route::post('/banners/{id}/move', [\App\Http\Controllers\Admin\BannerController::class, 'move'])->middleware('throttle:60,1,admin-banners-write')->whereNumber('id');
        Route::delete('/banners/{id}', [\App\Http\Controllers\Admin\BannerController::class, 'destroy'])->middleware('throttle:30,1,admin-banners-write')->whereNumber('id');
        
        
        // Generate Reports (Sales Summary / Commission; CSV export)
        Route::get('/generate-reports', [\App\Http\Controllers\Admin\AdminReportsController::class, 'page'])->name('generate-reports');
        Route::get('/generate-reports/export', [\App\Http\Controllers\Admin\AdminReportsController::class, 'export'])->middleware('throttle:20,1,admin-report-export')->name('generate-reports.export');

        Route::get('/pending-approval', fn () => redirect('/admin/accounts-approval?status=pending'))->name('pending-approval');

        // ERP: Manage User Accounts
        Route::get('/user-accounts', [\App\Http\Controllers\Admin\UserAccountsController::class, 'index'])->name('user-accounts');
        Route::get('/user-accounts/{id}', [\App\Http\Controllers\Admin\UserAccountsController::class, 'show'])->name('user-accounts.show')->whereNumber('id');
        Route::post('/user-accounts/{id}/status', [\App\Http\Controllers\Admin\UserAccountsController::class, 'updateStatus'])->middleware('throttle:30,1,admin-user-status')->name('user-accounts.status')->whereNumber('id');

        // ERP: Monitor Seller Compliance
        Route::get('/seller-compliance', [\App\Http\Controllers\Admin\SellerComplianceController::class, 'index'])->name('seller-compliance');
        Route::post('/seller-compliance/sellers/{seller}/warn', [\App\Http\Controllers\Admin\SellerComplianceController::class, 'warn'])->middleware('throttle:30,1,admin-compliance')->whereNumber('seller');
        Route::post('/seller-compliance/products/{product}/hide', [\App\Http\Controllers\Admin\SellerComplianceController::class, 'hide'])->middleware('throttle:30,1,admin-compliance')->whereNumber('product');
        Route::post('/seller-compliance/products/{product}/unhide', [\App\Http\Controllers\Admin\SellerComplianceController::class, 'unhide'])->middleware('throttle:30,1,admin-compliance')->whereNumber('product');
        Route::delete('/seller-compliance/products/{product}', [\App\Http\Controllers\Admin\SellerComplianceController::class, 'remove'])->middleware('throttle:30,1,admin-compliance')->whereNumber('product');

        // ERP: Manage Complaints and Disputes
        Route::get('/complaints', [\App\Http\Controllers\Admin\ComplaintsController::class, 'index'])->name('complaints');
        Route::get('/complaints/{id}', [\App\Http\Controllers\Admin\ComplaintsController::class, 'show'])->whereNumber('id');
        Route::post('/complaints/{id}', [\App\Http\Controllers\Admin\ComplaintsController::class, 'update'])->middleware('throttle:60,1,admin-complaint-update')->whereNumber('id');
        Route::get('/complaints/{id}/evidence/{index}', [\App\Http\Controllers\Admin\ComplaintsController::class, 'evidence'])->name('complaints.evidence')->whereNumber(['id', 'index']);

        // ERP: Manage Commission (10%)
        Route::get('/commission', [\App\Http\Controllers\Admin\CommissionController::class, 'index'])->name('commission');

        // ERP: Manage Platform Settings
        Route::get('/platform-settings', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'index'])->name('platform-settings');
        Route::post('/platform-settings/announcements', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'saveAnnouncement'])->middleware('throttle:30,1,admin-announce');
        Route::put('/platform-settings/announcements/{id}', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'saveAnnouncement'])->middleware('throttle:30,1,admin-announce')->whereNumber('id');
        Route::post('/platform-settings/announcements/{id}/publish', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'publishAnnouncement'])->middleware('throttle:10,1,admin-announce-publish')->whereNumber('id');
        Route::post('/platform-settings/announcements/{id}/unpublish', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'unpublishAnnouncement'])->middleware('throttle:30,1,admin-announce')->whereNumber('id');
        Route::delete('/platform-settings/announcements/{id}', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'deleteAnnouncement'])->middleware('throttle:30,1,admin-announce')->whereNumber('id');
        Route::post('/platform-settings/policies', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'savePolicy'])->middleware('throttle:20,1,admin-policy');
        Route::post('/platform-settings/keywords', [\App\Http\Controllers\Admin\PlatformSettingsController::class, 'saveKeywords'])->middleware('throttle:20,1,admin-keywords');

        // Seller approval routes
        // One approval page for every role that needs admin approval (seller, logistics)
        Route::get('/accounts-approval', [AdminController::class, 'accountsApproval'])->name('accounts-approval');
        Route::get('/seller-approval', fn () => redirect('/admin/accounts-approval?type=seller'))->name('seller-approval');
        Route::get('/seller-approval/{userId}/details', [AdminController::class, 'getSellerDetails'])->name('seller-approval.details');
        Route::get('/seller-approval/{userId}/download/{type}', [AdminController::class, 'downloadDocument'])->name('download-document');
        Route::post('/seller-approval/{userId}/approve', [AdminController::class, 'approveSellerRegistration'])->name('seller-approval.approve');
        Route::post('/seller-approval/{userId}/disapprove', [AdminController::class, 'disapproveSellerRegistration'])->name('seller-approval.disapprove');
        
        // Logistics approval routes
        Route::get('/logistics-approval', fn () => redirect('/admin/accounts-approval?type=logistics'))->name('logistics-approval');
        Route::get('/logistics-approval/{userId}/details', [AdminController::class, 'getLogisticsDetails'])->name('logistics-approval.details');
        Route::post('/logistics-approval/{userId}/approve', [AdminController::class, 'approveLogisticsRegistration'])->name('logistics-approval.approve');
        Route::post('/logistics-approval/{userId}/disapprove', [AdminController::class, 'disapproveLogisticsRegistration'])->name('logistics-approval.disapprove');
        
        // Product approval routes
        Route::get('/product-approval', [AdminController::class, 'productApproval'])->name('product-approval');
        
        // Product reports routes
        Route::get('/reports', [AdminController::class, 'productReports'])->name('reports');
        
        // Admin inbox (master-code session = admin team identity).
        Route::prefix('messaging')->group(function () {
            Route::get('/contacts', [\App\Http\Controllers\MessagingController::class, 'contacts'])->middleware('throttle:60,1,admin-msg-contacts');
            Route::get('/threads', [\App\Http\Controllers\MessagingController::class, 'threads'])->middleware('throttle:120,1,admin-msg-threads');
            Route::post('/start', [\App\Http\Controllers\MessagingController::class, 'start'])->middleware('throttle:20,1,admin-msg-start');
            Route::get('/threads/{id}/messages', [\App\Http\Controllers\MessagingController::class, 'messages'])->middleware('throttle:120,1,admin-msg-messages')->whereNumber('id');
            Route::post('/threads/{id}/messages', [\App\Http\Controllers\MessagingController::class, 'send'])->middleware('throttle:30,1,admin-msg-send')->whereNumber('id');
            Route::post('/threads/{id}/read', [\App\Http\Controllers\MessagingController::class, 'read'])->middleware('throttle:60,1,admin-msg-read')->whereNumber('id');
            Route::get('/messages/{id}/image', [\App\Http\Controllers\MessagingController::class, 'image'])->middleware('throttle:120,1,admin-msg-image')->whereNumber('id');
        });

        Route::get('/messages', fn () => Inertia::render('admin/Messages'))->name('messages');

        // Admin notifications (header bell) and settings (header cog).
        Route::get('/notifications', [\App\Http\Controllers\Admin\AdminAccountController::class, 'notificationsPage'])->name('notifications');
        Route::get('/notifications/feed', [\App\Http\Controllers\Admin\AdminAccountController::class, 'feed'])->middleware('throttle:120,1,admin-notif-feed');
        Route::get('/notifications/unread-count', [\App\Http\Controllers\Admin\AdminAccountController::class, 'unreadCount'])->middleware('throttle:120,1,admin-notif-count');
        Route::post('/notifications/read-all', [\App\Http\Controllers\Admin\AdminAccountController::class, 'markAllRead'])->middleware('throttle:30,1,admin-notif-readall');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Admin\AdminAccountController::class, 'markRead'])->middleware('throttle:120,1,admin-notif-read')->whereNumber('id');
        Route::get('/settings', [\App\Http\Controllers\Admin\AdminAccountController::class, 'settingsPage'])->name('settings');
        Route::post('/settings/platform', [\App\Http\Controllers\Admin\AdminAccountController::class, 'updatePlatform'])->middleware('throttle:20,1,admin-settings-platform');
        Route::post('/settings/profile', [\App\Http\Controllers\Admin\AdminAccountController::class, 'updateProfile'])->middleware('throttle:20,1,admin-settings-profile');
        Route::post('/settings/password', [\App\Http\Controllers\Admin\AdminAccountController::class, 'updatePassword'])->middleware('throttle:5,1,admin-settings-password');

        // Parcel reports (admin reviews / resolves; note is internal)
        Route::get('/parcel-reports', [\App\Http\Controllers\Admin\ParcelReportsController::class, 'page'])->name('parcel-reports');
        Route::get('/parcel-reports/feed', [\App\Http\Controllers\Admin\ParcelReportsController::class, 'feed'])->middleware('throttle:120,1,admin-parcel-feed');
        Route::post('/parcel-reports/{id}/status', [\App\Http\Controllers\Admin\ParcelReportsController::class, 'status'])->middleware('throttle:60,1,admin-parcel-status')->whereNumber('id');

        // Support tickets
        Route::get('/support', [\App\Http\Controllers\Admin\SupportTicketsController::class, 'page'])->name('support');
        Route::get('/support/attachments/{id}', [\App\Http\Controllers\SupportAttachmentController::class, 'show'])->middleware('throttle:120,1,admin-support-file')->whereNumber('id');
        Route::get('/support/feed', [\App\Http\Controllers\Admin\SupportTicketsController::class, 'feed'])->middleware('throttle:120,1,admin-support-feed');
        Route::get('/support/{id}', [\App\Http\Controllers\Admin\SupportTicketsController::class, 'show'])->middleware('throttle:120,1,admin-support-show')->whereNumber('id');
        Route::post('/support/{id}/reply', [\App\Http\Controllers\Admin\SupportTicketsController::class, 'reply'])->middleware('throttle:60,1,admin-support-reply')->whereNumber('id');
        Route::post('/support/{id}/status', [\App\Http\Controllers\Admin\SupportTicketsController::class, 'status'])->middleware('throttle:60,1,admin-support-status')->whereNumber('id');

        // Escalated returns (admin decides)
        Route::get('/returns', [\App\Http\Controllers\Admin\ReturnsController::class, 'page'])->name('returns');
        Route::get('/returns/feed', [\App\Http\Controllers\Admin\ReturnsController::class, 'feed'])->name('returns.feed');
        Route::post('/returns/{id}/decision', [\App\Http\Controllers\Admin\ReturnsController::class, 'decision'])->name('returns.decision')->whereNumber('id');
        Route::post('/returns/{id}/refund', [\App\Http\Controllers\Admin\ReturnsController::class, 'refund'])->name('returns.refund')->whereNumber('id');
        Route::get('/returns/{id}/photo/{filename}', [\App\Http\Controllers\Admin\ReturnsController::class, 'photo'])->name('returns.photo')->whereNumber('id');
        
        Route::post('/logout', [AdminController::class, 'logout'])->name('logout');
    });
});

// Product approval API routes (outside admin prefix but still protected)
Route::middleware(['web', 'admin.verified'])->prefix('api/admin')->group(function () {
    Route::get('/products/pending', [ProductController::class, 'adminPendingProducts']);
    Route::get('/products', [ProductController::class, 'adminAllProducts']);
    Route::post('/products/{id}/approve', [ProductController::class, 'adminApproveProduct']);
    Route::post('/products/{id}/reject', [ProductController::class, 'adminRejectProduct']);
    
    // Product Reports
    Route::get('/reports', [ProductController::class, 'adminGetReports']);
    Route::post('/reports/{id}/approve', [ProductController::class, 'adminApproveReport']); // Delete product
    Route::post('/reports/{id}/reject', [ProductController::class, 'adminRejectReport']); // Keep product
});
