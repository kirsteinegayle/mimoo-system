<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\ShipmentAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IncomingShipmentsController extends Controller
{
    /**
     * Display incoming shipments page.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Build query
        $query = ShipmentAssignment::with([
            'order.items.product',
            'order.buyer',
        ])
        ->where('courier_id', $user->id);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('waybill_number', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('assignment_status', $request->status);
        }

        if ($request->filled('seller')) {
            $query->whereHas('order.items', function ($q) use ($request) {
                $q->where('seller_id', $request->seller);
            });
        }

        if ($request->filled('destination')) {
            $destination = $request->destination;
            $query->whereHas('order', function ($q) use ($destination) {
                $q->where('shipping_address', 'like', "%{$destination}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('assigned_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('assigned_at', '<=', $request->date_to);
        }

        // Get paginated results
        $assignments = $query->orderBy('assigned_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Transform data
        $shipments = $assignments->map(function ($assignment) {
            $order = $assignment->order;
            
            // Get seller name from first item
            $sellerName = 'N/A';
            $sellerId = null;
            if ($order->items->isNotEmpty()) {
                $firstItem = $order->items->first();
                $sellerId = $firstItem->seller_id;
                $seller = User::find($sellerId);
                $sellerName = $seller ? ($seller->business_name ?? $seller->name) : 'N/A';
            }

            // Get pickup address (seller's address)
            $pickupAddress = 'Not provided';
            if ($sellerId) {
                $seller = User::find($sellerId);
                if ($seller && $seller->street_address) {
                    $pickupAddress = $seller->street_address;
                    if ($seller->municipality_city) {
                        $pickupAddress .= ', ' . $seller->municipality_city;
                    }
                    if ($seller->province) {
                        $pickupAddress .= ', ' . $seller->province;
                    }
                }
            }

            // Get buyer destination from shipping address (city and barangay only)
            $destination = 'Not provided';
            if ($order->shipping_address) {
                $address = $order->shipping_address;
                $parts = array_map('trim', explode(',', $address));
                
                // Format: Street, Barangay, City, Province/Region
                if (count($parts) >= 3) {
                    $barangay = isset($parts[1]) ? preg_replace('/^(Brgy\.?|Barangay)\s+/i', '', $parts[1]) : '';
                    $city = isset($parts[count($parts) - 2]) ? preg_replace('/^(City of|Municipality of)\s+/i', '', $parts[count($parts) - 2]) : '';
                    
                    if ($barangay && $city) {
                        $destination = "$city, $barangay";
                    } elseif ($city) {
                        $destination = $city;
                    }
                }
            }

            return [
                'id' => $assignment->id,
                'waybill_number' => $order->waybill_number,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'seller_name' => $sellerName,
                'seller_id' => $sellerId,
                'pickup_address' => $pickupAddress,
                'destination' => $destination,
                'weight' => $assignment->weight ?? 'Not provided',
                'dimensions' => $assignment->dimensions ?? 'Not provided',
                'assigned_date' => $assignment->assigned_at->format('M d, Y H:i'),
                'assignment_status' => $assignment->assignment_status,
                'is_overdue' => $assignment->isOverdue(),
                'is_expiring_soon' => $assignment->isExpiringSoon(),
            ];
        });

        // Get summary stats
        $stats = [
            'total' => ShipmentAssignment::where('courier_id', $user->id)->count(),
            'pending' => ShipmentAssignment::where('courier_id', $user->id)
                ->where('assignment_status', 'pending')->count(),
            'accepted' => ShipmentAssignment::where('courier_id', $user->id)
                ->where('assignment_status', 'accepted')->count(),
            'rejected' => ShipmentAssignment::where('courier_id', $user->id)
                ->where('assignment_status', 'rejected')->count(),
            'expiring' => ShipmentAssignment::where('courier_id', $user->id)
                ->where('assignment_status', 'pending')
                ->where('acceptance_deadline', '>', now())
                ->where('acceptance_deadline', '<=', now()->addHours(2))
                ->count() + ShipmentAssignment::where('courier_id', $user->id)
                ->where('assignment_status', 'pending')
                ->where('acceptance_deadline', '<', now())
                ->count(),
        ];

        // Get unique sellers for filter
        $sellers = ShipmentAssignment::where('courier_id', $user->id)
            ->with('order.items')
            ->get()
            ->pluck('order.items')
            ->flatten()
            ->pluck('seller_id')
            ->unique()
            ->map(function ($sellerId) {
                $seller = User::find($sellerId);
                return [
                    'id' => $sellerId,
                    'name' => $seller ? ($seller->business_name ?? $seller->name) : 'Unknown',
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('courier/IncomingShipments', [
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
            'shipments' => $shipments,
            'stats' => $stats,
            'sellers' => $sellers,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'all',
                'seller' => $request->seller,
                'destination' => $request->destination,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'pagination' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
                'links' => $assignments->linkCollection()->toArray(),
            ],
        ]);
    }

    /**
     * Get shipment details.
     */
    public function show($id)
    {
        $user = auth()->user();

        $assignment = ShipmentAssignment::with([
            'order.items.product',
            'order.buyer',
            'history.performer',
            'assigner',
        ])
        ->where('courier_id', $user->id)
        ->findOrFail($id);

        $order = $assignment->order;

        // Get seller details from first item
        $sellerDetails = null;
        if ($order->items->isNotEmpty()) {
            $firstItem = $order->items->first();
            $seller = User::find($firstItem->seller_id);
            if ($seller) {
                $sellerDetails = [
                    'id' => $seller->id,
                    'name' => $seller->business_name ?? $seller->name,
                    'email' => $seller->email,
                    'phone' => $seller->contact_number ?? 'Not provided',
                    'address' => $seller->street_address ?? 'Not provided',
                    'city' => $seller->municipality_city ?? 'Not provided',
                    'province' => $seller->province ?? 'Not provided',
                ];
            }
        }

        // Get buyer destination from shipping address
        $buyerDestination = [
            'city' => 'Not provided',
            'barangay' => 'Not provided',
            'province' => 'Not provided',
            'region' => 'Not provided',
        ];
        
        // Parse shipping address to extract city, barangay, province, region
        if ($order->shipping_address) {
            $address = $order->shipping_address;
            $parts = array_map('trim', explode(',', $address));
            
            // Address format: Street, Barangay, City, Province/Region
            // Example: "092 Gen Luna St., Maracta (Pob.), Lumban, Laguna"
            
            if (count($parts) >= 4) {
                // Extract barangay (usually 2nd part)
                if (isset($parts[1])) {
                    $barangay = $parts[1];
                    // Clean up "Brgy." or "Barangay" prefix
                    $barangay = preg_replace('/^(Brgy\.?|Barangay)\s+/i', '', $barangay);
                    $buyerDestination['barangay'] = $barangay;
                }
                
                // Extract city (usually 3rd part, second to last)
                if (isset($parts[count($parts) - 2])) {
                    $city = $parts[count($parts) - 2];
                    // Clean up "City of" or "Municipality of" prefix
                    $city = preg_replace('/^(City of|Municipality of)\s+/i', '', $city);
                    $buyerDestination['city'] = $city;
                }
                
                // Extract province/region (usually last part)
                if (isset($parts[count($parts) - 1])) {
                    $provinceOrRegion = $parts[count($parts) - 1];
                    
                    // Check if it's a region (contains "Region" or known region names)
                    if (preg_match('/(Region|NCR|CALABARZON|Metro Manila)/i', $provinceOrRegion)) {
                        $buyerDestination['region'] = $provinceOrRegion;
                    } else {
                        $buyerDestination['province'] = $provinceOrRegion;
                    }
                }
            } elseif (count($parts) >= 2) {
                // Fallback for shorter addresses
                $buyerDestination['city'] = $parts[count($parts) - 1];
                if (isset($parts[count($parts) - 2])) {
                    $buyerDestination['barangay'] = $parts[count($parts) - 2];
                }
            }
        }

        // Transform history
        $history = $assignment->history->map(function ($entry) {
            return [
                'action' => $entry->action,
                'performed_by' => $entry->performer->name ?? 'System',
                'notes' => $entry->notes,
                'created_at' => $entry->created_at->format('M d, Y H:i A'),
            ];
        });

        return response()->json([
            'assignment' => [
                'id' => $assignment->id,
                'waybill_number' => $order->waybill_number,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'assignment_status' => $assignment->assignment_status,
                'assigned_at' => $assignment->assigned_at->format('M d, Y H:i A'),
                'acceptance_deadline' => $assignment->acceptance_deadline->format('M d, Y H:i A'),
                'accepted_at' => $assignment->accepted_at?->format('M d, Y H:i A'),
                'rejected_at' => $assignment->rejected_at?->format('M d, Y H:i A'),
                'rejection_reason' => $assignment->rejection_reason,
                'weight' => $assignment->weight ?? 'Not provided',
                'dimensions' => $assignment->dimensions ?? 'Not provided',
                'pickup_instructions' => $assignment->pickup_instructions ?? 'No special instructions',
                'seller' => $sellerDetails,
                'buyer_destination' => $buyerDestination,
                'total_amount' => $order->total,
                'payment_method' => $order->payment_method,
                'items_count' => $order->items->count(),
                'assigned_by' => $assignment->assigner->name ?? 'System',
            ],
            'history' => $history,
        ]);
    }

    /**
     * Accept assignment.
     */
    public function accept(Request $request, $id)
    {
        $user = auth()->user();

        $assignment = ShipmentAssignment::with('order')
            ->where('courier_id', $user->id)
            ->findOrFail($id);

        if (!$assignment->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'This assignment has already been processed.',
            ], 400);
        }

        $success = $assignment->accept($user->id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept assignment.',
            ], 500);
        }

        // Update order tracking status for buyer visibility
        $order = $assignment->order;
        $order->update(['courier_accepted_at' => now()]);
        $order->updateTracking('accepted_courier', 'Accepted by courier, in transit to nearest sorting hub');

        return response()->json([
            'success' => true,
            'message' => 'Assignment accepted successfully!',
            'assignment' => [
                'id' => $assignment->id,
                'assignment_status' => $assignment->assignment_status,
                'accepted_at' => $assignment->accepted_at->format('M d, Y H:i A'),
            ],
        ]);
    }

    /**
     * Reject assignment.
     */
    public function reject(Request $request, $id)
    {
        $user = auth()->user();

        $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ], [
            'reason.required' => 'Please provide a reason for rejection.',
            'reason.min' => 'Reason must be at least 10 characters.',
            'reason.max' => 'Reason must not exceed 500 characters.',
        ]);

        $assignment = ShipmentAssignment::where('courier_id', $user->id)
            ->findOrFail($id);

        if (!$assignment->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'This assignment has already been processed.',
            ], 400);
        }

        $reason = trim($request->reason);
        if (empty($reason)) {
            return response()->json([
                'success' => false,
                'message' => 'Rejection reason cannot be empty or whitespace only.',
            ], 400);
        }

        $success = $assignment->reject($user->id, $reason);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject assignment.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Assignment rejected.',
            'assignment' => [
                'id' => $assignment->id,
                'assignment_status' => $assignment->assignment_status,
                'rejected_at' => $assignment->rejected_at->format('M d, Y H:i A'),
                'rejection_reason' => $assignment->rejection_reason,
            ],
        ]);
    }
}
