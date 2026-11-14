<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing');
})->name('home');

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
        ]);
    })->name('courier.dashboard')->middleware('role:courier,logistics_staff');
    
    // Courier - Incoming Shipments (with full functionality)
    Route::get('/courier/incoming-shipments', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'index'])->name('courier.incoming-shipments')->middleware('role:courier,logistics_staff');
    Route::get('/api/courier/shipments/{id}', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'show'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/shipments/{id}/accept', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'accept'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/shipments/{id}/reject', [\App\Http\Controllers\Courier\IncomingShipmentsController::class, 'reject'])->middleware('role:courier,logistics_staff');
    
    // Courier - Pickup Management (with full functionality)
    Route::get('/courier/pickup-management', [\App\Http\Controllers\Courier\PickupManagementController::class, 'index'])->name('courier.pickup-management')->middleware('role:courier,logistics_staff');
    Route::get('/api/courier/pickups/{id}', [\App\Http\Controllers\Courier\PickupManagementController::class, 'show'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/pickups/{id}/schedule', [\App\Http\Controllers\Courier\PickupManagementController::class, 'schedule'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/pickups/{id}/assign-personnel', [\App\Http\Controllers\Courier\PickupManagementController::class, 'assignPersonnel'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/pickups/{id}/reschedule', [\App\Http\Controllers\Courier\PickupManagementController::class, 'reschedule'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/pickups/{id}/cancel', [\App\Http\Controllers\Courier\PickupManagementController::class, 'cancel'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/pickups/{id}/record-failed', [\App\Http\Controllers\Courier\PickupManagementController::class, 'recordFailed'])->middleware('role:courier,logistics_staff');
    Route::post('/api/courier/pickups/{id}/confirm', [\App\Http\Controllers\Courier\PickupManagementController::class, 'confirmPickup'])->middleware('role:courier,logistics_staff');
    
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
            'buyer_name' => $order->shipping_name ?? $order->buyer->name ?? 'Unknown',
            'buyer_address' => $order->shipping_address,
            'buyer_city' => $order->shipping_municipality_city,
            'buyer_barangay' => $order->shipping_barangay,
            'buyer_phone' => $order->shipping_phone,
            'seller_name' => $order->items->first()->product->seller->business_name ?? $order->items->first()->product->seller->name ?? 'Unknown Seller',
            'weight' => round($totalWeight, 2),
            'payment_method' => strtoupper($order->payment_method),
            'total_amount' => $order->total,
            'destination' => $order->shipping_municipality_city . ', ' . $order->shipping_province,
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
                $totalWeight = $order->items->sum(function ($item) {
                    return ($item->product->weight ?? 0) * $item->quantity;
                });
                
                return [
                    'id' => $latestScan->id,
                    'waybill_number' => $latestScan->waybill_number,
                    'order_number' => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'buyer_name' => $order->shipping_name ?? $order->buyer->name ?? 'Unknown',
                    'buyer_address' => $order->shipping_address,
                    'destination' => $order->shipping_municipality_city,
                    'weight' => round($totalWeight, 2),
                    'payment_method' => strtoupper($order->payment_method),
                    'total_amount' => $order->total,
                    'status' => $order->status,
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
                $totalWeight = $order->items->sum(function ($item) {
                    return ($item->product->weight ?? 0) * $item->quantity;
                });
                
                return [
                    'id' => $facilityReceiveScan->id,
                    'waybill_number' => $facilityReceiveScan->waybill_number,
                    'order_number' => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'buyer_name' => $order->shipping_name ?? $order->buyer->name ?? 'Unknown',
                    'destination' => $order->shipping_municipality_city,
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
                // Get buyer info
                $buyer = \App\Models\User::find($order->buyer_id);
                
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
                    'buyer_name' => $buyer->name ?? $order->shipping_name ?? 'N/A',
                    'buyer_phone' => $order->shipping_phone ?? 'N/A',
                    'buyer_address' => $order->shipping_address ?? 'N/A',
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
        
        // Get buyer info
        $buyer = \App\Models\User::find($order->buyer_id);
        
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
                'buyer_name' => $buyer->name ?? $order->shipping_name ?? 'N/A',
                'buyer_phone' => $order->shipping_phone ?? 'N/A',
                'buyer_address' => $order->shipping_address ?? 'N/A',
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
                // Get buyer info
                $buyer = \App\Models\User::find($order->buyer_id);
                
                // Get seller info from first item's product
                $sellerName = 'N/A';
                if ($order->items->isNotEmpty()) {
                    $product = $order->items->first()->product;
                    if ($product && $product->seller_id) {
                        $seller = \App\Models\User::find($product->seller_id);
                        $sellerName = $seller ? ($seller->business_name ?? $seller->name) : 'N/A';
                    }
                }
                
                // Extract barangay AND municipality/city from shipping address
                $address = $order->shipping_address ?? '';
                $barangay = 'Unknown';
                $city = 'Unknown';
                
                // Extract barangay
                if (preg_match('/Brgy\.?\s+([^,]+)/i', $address, $matches)) {
                    $barangay = trim($matches[1]);
                } elseif (preg_match('/Barangay\s+([^,]+)/i', $address, $matches)) {
                    $barangay = trim($matches[1]);
                }
                
                // Extract city/municipality (usually the second-to-last or last part before region)
                $addressParts = array_map('trim', explode(',', $address));
                if (count($addressParts) >= 2) {
                    // Try to find city/municipality (usually after barangay)
                    // Format: Street, Barangay, City, Province/Region
                    $city = $addressParts[count($addressParts) - 2] ?? 'Unknown'; // Second to last
                    
                    // Clean up common patterns
                    $city = preg_replace('/^(City of|Municipality of)\s+/i', '', $city);
                    $city = trim($city);
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
                
                return [
                    'id' => $order->id,
                    'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                    'waybill_number' => $order->waybill_number,
                    'buyer_name' => $buyer->name ?? $order->shipping_name ?? 'N/A',
                    'buyer_phone' => $order->shipping_phone ?? 'N/A',
                    'buyer_address' => $order->shipping_address ?? 'N/A',
                    'barangay' => $barangay,
                    'city' => $city, // Add city/municipality for matching
                    'seller_name' => $sellerName,
                    'total_amount' => $order->total ?? 0,
                    'payment_method' => $paymentMethodDisplay,
                    'items_count' => $order->items->count(),
                    'weight' => round($estimatedWeight, 1),
                    'confirmed_at' => $order->updated_at->format('M d, Y H:i'),
                    'status' => 'shipped',
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
    
    // Logistics Branches & Checklists
    Route::get('/logistics/branches-checklists', function () {
        $user = auth()->user();
        
        return Inertia::render('logistics/BranchesChecklists', [
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
    })->name('logistics.branches-checklists');
    
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
    Route::get('/seller/customers', function () {
        return Inertia::render('seller/SellerCustomers');
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
        'vouchers' => \App\Models\Voucher::where('status', 'active')
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($voucher) use ($request) {
                $user = $request->user();
                
                // Check if user has already claimed this voucher
                $userClaim = $user ? \App\Models\VoucherUsage::where('voucher_id', $voucher->id)
                    ->where('user_id', $user->id)
                    ->first() : null;
                
                return [
                    'id' => $voucher->id,
                    'code' => $voucher->code,
                    'name' => $voucher->name,
                    'description' => $voucher->description,
                    'type' => $voucher->type,
                    'value' => $voucher->value,
                    'min_purchase' => $voucher->min_purchase,
                    'max_discount' => $voucher->max_discount,
                    'valid_until_formatted' => $voucher->valid_until->format('M d, Y'),
                    'is_claimed' => $userClaim !== null,
                    'is_used' => $userClaim && $userClaim->used_at !== null,
                    'claimed_at' => $userClaim?->claimed_at?->format('M d, Y'),
                    'used_at' => $userClaim?->used_at?->format('M d, Y'),
                ];
            }),
    ]);
})->name('homepage');

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
    ]);
})->middleware(['auth', 'approved'])->name('messages');

// Buyer checkout and order routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/cart', function () {
        // Fetch suggested products (top-selling or random)
        $suggestedProducts = \App\Models\Product::where('status', 'active')
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
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/success', [\App\Http\Controllers\OrderController::class, 'success'])->name('orders.success');
    Route::get('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'show'])->name('orders.show');
});

Route::get('/product/{id}', function (string $id) {
    $product = \App\Models\Product::with('seller:id,business_name,name,profile_photo')
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
            'seller_profile_photo' => $product->seller->profile_photo ? asset('storage/' . $product->seller->profile_photo) : null,
            'has_variants' => $product->has_variants ?? false,
            'variant_options' => $product->variant_options ?? null,
            'variants' => $product->variants ?? null,
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
        ->firstOrFail();
    
    $sellerData = [
        'id' => $seller->id,
        'name' => $seller->name,
        'business_name' => $seller->business_name,
        'email' => $seller->email,
        'profile_photo_url' => $seller->profile_photo ? asset('storage/' . $seller->profile_photo) : null,
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

// Google OAuth routes
Route::get('/auth/google', [SocialiteController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback'])->name('auth.google.callback');

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
        Route::get('/banners', function () {
            return Inertia::render('admin/BannerManagement');
        })->name('banners');
        
        Route::get('/manage-registrations', [AdminController::class, 'manageRegistrations'])->name('manage-registrations');
        Route::post('/registrations/{userId}/approve', [AdminController::class, 'approveRegistration'])->name('registrations.approve');
        Route::post('/registrations/{userId}/disapprove', [AdminController::class, 'disapproveRegistration'])->name('registrations.disapprove');
        
        // Seller approval routes
        Route::get('/seller-approval', [AdminController::class, 'sellerApproval'])->name('seller-approval');
        Route::get('/seller-approval/{userId}/details', [AdminController::class, 'getSellerDetails'])->name('seller-approval.details');
        Route::get('/seller-approval/{userId}/download/{type}', [AdminController::class, 'downloadDocument'])->name('download-document');
        Route::post('/seller-approval/{userId}/approve', [AdminController::class, 'approveSellerRegistration'])->name('seller-approval.approve');
        Route::post('/seller-approval/{userId}/disapprove', [AdminController::class, 'disapproveSellerRegistration'])->name('seller-approval.disapprove');
        
        // Logistics approval routes
        Route::get('/logistics-approval', [AdminController::class, 'logisticsApproval'])->name('logistics-approval');
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
