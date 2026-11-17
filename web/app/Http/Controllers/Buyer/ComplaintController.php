<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Order;
use App\Services\BuyerNotificationService;
use App\Services\UserNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Buyer side of Complaints & Disputes: file a complaint about one of their orders, with evidence. */
class ComplaintController extends Controller
{
    private function buyerId(Request $request): int
    {
        abort_unless($request->user()?->account_type === 'buyer', 403, 'Only buyers can file complaints.');

        return (int) $request->user()->id;
    }

    public function index(Request $request): Response
    {
        $buyerId = $this->buyerId($request);

        $orders = Order::where('buyer_id', $buyerId)->whereNotIn('status', ['pending', 'cancelled'])
            ->with('items:id,order_id,seller_id,product_name')->orderByDesc('id')->limit(100)->get()
            ->map(function (Order $o) {
                $sellers = DB::table('users')->whereIn('id', $o->items->pluck('seller_id')->filter()->unique())
                    ->get(['id', 'name', 'business_name'])->map(fn ($u) => ['id' => $u->id, 'name' => $u->business_name ?: $u->name])->values();

                return [
                    'id' => $o->id,
                    'label' => BuyerNotificationService::orderNumber($o->id) . ' · ' . Str::limit($o->items->pluck('product_name')->implode(', '), 60),
                    'sellers' => $sellers,
                ];
            });

        $mine = Complaint::where('buyer_id', $buyerId)->orderByDesc('id')->limit(50)->get()->map(fn (Complaint $c) => [
            'id' => $c->id,
            'order' => BuyerNotificationService::orderNumber($c->order_id),
            'type' => Complaint::TYPES[$c->type] ?? $c->type,
            'description' => $c->description,
            'status' => $c->status,
            'resolution' => in_array($c->status, ['resolved', 'rejected'], true) ? $c->resolution : null,
            'created_at' => $c->created_at?->format('M d, Y'),
        ]);

        return Inertia::render('BuyerComplaints', [
            'orders' => $orders,
            'types' => collect(Complaint::TYPES)->map(fn ($label, $key) => ['value' => $key, 'label' => $label])->values(),
            'complaints' => $mine,
            'preselectOrder' => (int) $request->query('order', 0) ?: null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $buyerId = $this->buyerId($request);

        $data = $request->validate([
            'order_id' => ['required', 'integer'],
            'seller_id' => ['nullable', 'integer'],
            'type' => ['required', 'in:' . implode(',', array_keys(Complaint::TYPES))],
            'description' => ['required', 'string', 'min:20', 'max:2000'],
            'evidence' => ['nullable', 'array', 'max:5'],
            'evidence.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ], [
            'description.min' => 'Please describe the problem in at least 20 characters so we can review it.',
            'evidence.max' => 'You can attach up to 5 files.',
            'evidence.*.max' => 'Each file must be 5 MB or smaller.',
            'evidence.*.mimes' => 'Evidence must be a JPG, PNG, WEBP or PDF file.',
        ]);

        $order = Order::where('buyer_id', $buyerId)->with('items:id,order_id,seller_id')->find($data['order_id']);
        if (! $order) {
            return back()->withErrors(['order_id' => 'Choose one of your own orders.']);
        }

        $sellerIds = $order->items->pluck('seller_id')->filter()->unique()->values();
        $sellerId = $data['seller_id'] ?? $sellerIds->first();
        if ($sellerId && ! $sellerIds->contains((int) $sellerId)) {
            return back()->withErrors(['seller_id' => 'That seller is not part of this order.']);
        }

        $complaint = Complaint::create([
            'buyer_id' => $buyerId,
            'seller_id' => $sellerId,
            'courier_id' => $order->assigned_courier_id,
            'order_id' => $order->id,
            'type' => $data['type'],
            'description' => trim($data['description']),
            'status' => 'open',
        ]);

        $evidence = [];
        foreach ((array) $request->file('evidence', []) as $file) {
            $name = Str::random(24) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs("complaints/{$complaint->id}", $name, 'local'); // private disk
            $evidence[] = ['path' => $path, 'name' => Str::limit($file->getClientOriginalName(), 80, ''), 'mime' => $file->getMimeType()];
        }
        if ($evidence) {
            $complaint->update(['evidence' => $evidence]);
        }

        UserNotifier::send($request->user(), 'complaint_received', 'Complaint received',
            'We received your complaint about order ' . BuyerNotificationService::orderNumber($order->id) . '. Our team will review it.',
            'complaint_received:' . $complaint->id, ['complaint_id' => $complaint->id], '/complaints');

        return back()->with('success', 'Your complaint was submitted. We will review it and update you here.');
    }
}
