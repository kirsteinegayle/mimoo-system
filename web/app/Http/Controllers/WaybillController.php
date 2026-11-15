<?php

namespace App\Http\Controllers;

use App\Models\Order;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WaybillController extends Controller
{
    /**
     * Generate waybill for an order.
     */
    public function generate(Request $request, int $orderId): JsonResponse
    {
        $user = Auth::user();

        // Check if user is seller or logistics
        if (!in_array($user->account_type, ['seller', 'logistics'])) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // For sellers, ensure this order contains their products
        $query = Order::query();
        if ($user->account_type === 'seller') {
            $query->whereHas('items', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            });
        }

        $order = $query->with(['buyer', 'items.product'])->findOrFail($orderId);

        // Only generate waybill for packed or shipped orders
        if (!in_array($order->status, ['packed', 'shipped', 'in_transit', 'out_for_delivery'])) {
            return response()->json([
                'error' => 'Waybill can only be generated for packed or shipped orders.'
            ], 400);
        }

        // Generate waybill number if not exists
        $waybillNumber = $order->generateWaybillNumber();

        return response()->json([
            'waybill' => [
                'number' => $waybillNumber,
                'order_id' => $order->id,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'generated_at' => $order->waybill_generated_at?->format('M d, Y h:i A'),
                'printed_at' => $order->waybill_printed_at?->format('M d, Y h:i A'),
            ],
        ]);
    }

    /**
     * Get waybill details for preview/print.
     */
    public function show(int $orderId): JsonResponse
    {
        $user = Auth::user();

        // Check if user is seller or logistics
        if (!in_array($user->account_type, ['seller', 'logistics'])) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // For sellers, ensure this order contains their products
        $query = Order::query();
        if ($user->account_type === 'seller') {
            $query->whereHas('items', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            });
        }

        $order = $query->with(['buyer', 'items' => function ($query) use ($user) {
            if ($user->account_type === 'seller') {
                $query->where('seller_id', $user->id);
            }
            $query->with('product');
        }])->findOrFail($orderId);

        if (!$order->hasWaybill()) {
            return response()->json(['error' => 'Waybill not generated yet.'], 404);
        }

        // Calculate seller-specific totals
        $items = $order->items->map(function ($item) {
            return [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
                'variant' => $item->variant_snapshot ? json_decode($item->variant_snapshot, true) : null,
            ];
        });

        $totalAmount = $order->items->sum(fn($item) => $item->quantity * $item->unit_price);

        return response()->json([
            'waybill' => [
                'number' => $order->waybill_number,
                'order_number' => 'MIM-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'generated_at' => $order->waybill_generated_at?->format('M d, Y h:i A'),
                'printed_at' => $order->waybill_printed_at?->format('M d, Y h:i A'),
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'shipping' => array_intersect_key(
                    $order->recipient(),
                    array_flip(['name', 'phone', 'address'])
                ),
                'items' => $items,
                'total_amount' => number_format($totalAmount, 2),
                'item_count' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
            ],
        ]);
    }

    /**
     * Mark waybill as printed.
     */
    public function markPrinted(int $orderId): JsonResponse
    {
        $user = Auth::user();

        // Check if user is seller or logistics
        if (!in_array($user->account_type, ['seller', 'logistics'])) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // For sellers, ensure this order contains their products
        $query = Order::query();
        if ($user->account_type === 'seller') {
            $query->whereHas('items', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            });
        }

        $order = $query->findOrFail($orderId);

        if (!$order->hasWaybill()) {
            return response()->json(['error' => 'Waybill not generated yet.'], 404);
        }

        $order->markWaybillPrinted();

        return response()->json([
            'message' => 'Waybill marked as printed.',
            'printed_at' => $order->waybill_printed_at->format('M d, Y h:i A'),
        ]);
    }

    /**
     * Generate QR code for waybill.
     */
    public function qrCode(string $waybillNumber): mixed
    {
        // Generate QR code as SVG without validating if waybill exists
        // This allows preview/generation even before the waybill is saved
        $options = new QROptions([
            'version'    => 5,
            'outputType' => QRCode::OUTPUT_MARKUP_SVG,
            'eccLevel'   => QRCode::ECC_L,
        ]);

        $qrcode = new QRCode($options);
        $svg = $qrcode->render($waybillNumber);

        return response($svg)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    }
}
