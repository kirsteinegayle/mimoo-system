<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Product;
use App\Models\User;
use App\Services\ChatNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Buyer ↔ seller chat (auth:sanctum, buyer only). Polling-based (no websockets).
 *
 * POST /api/buyer/chat/start                 {seller_id, product_id?}  get-or-create thread
 * GET  /api/buyer/chat                       threads with last message + unread count
 * GET  /api/buyer/chat/{id}/messages         ?after_id=  (marks seller messages read)
 * POST /api/buyer/chat/{id}/messages         body (1–1000) and/or image (JPG/PNG ≤ 5 MB)
 * GET  /api/buyer/chat-image/{filename}      image serving
 *
 * Message bodies are stored and returned as plain text; clients must never
 * render them as HTML.
 */
class BuyerChatController extends Controller
{
    use BuyerApiHelpers;

    private const FOLDER = 'chat_images';
    private const PREFIX = 'chat';

    private function sellerName(?User $s): ?string
    {
        if (! $s) return null;
        return ! empty($s->business_name) ? $s->business_name : trim($s->first_name . ' ' . $s->last_name);
    }

    private function productCard(?Product $p): ?array
    {
        if (! $p) return null;
        $idx = $p->main_image_index ?? 0;
        return [
            'id'              => $p->id,
            'name'            => $p->name,
            'effective_price' => (float) ($p->sale_price ?? $p->price),
            'image_url'       => ! empty(($p->images ?? [])[$idx] ?? null)
                ? url("/api/buyer/products/{$p->id}/image/{$idx}")
                : null,
        ];
    }

    private function formatMessage(ChatMessage $m, int $buyerId): array
    {
        return [
            'id'         => $m->id,
            'thread_id'  => $m->thread_id,
            'is_mine'    => $m->sender_id === $buyerId,
            'body'       => $m->body,
            'image_url'  => $this->imageUrlFor($m->image_path, 'chat-image'),
            'read_at'    => $m->read_at?->toISOString(),
            'created_at' => $m->created_at?->toISOString(),
        ];
    }

    private function formatThread(ChatThread $t, int $buyerId): array
    {
        $last = $t->latestMessage;
        return [
            'id'              => $t->id,
            'seller_id'       => $t->seller_id,
            'seller_name'     => $this->sellerName($t->seller),
            'seller_photo_url'=> ProductController::sellerPhotoUrl($t->seller?->profile_photo),
            'product'         => $this->productCard($t->product),
            'last_message'    => $last ? $this->formatMessage($last, $buyerId) : null,
            'last_message_at' => $t->last_message_at?->toISOString(),
            'unread_count'    => ChatMessage::where('thread_id', $t->id)
                ->where('sender_id', '!=', $buyerId)
                ->whereNull('read_at')
                ->count(),
        ];
    }

    private function ownThread(Request $request, int $id): ?ChatThread
    {
        return ChatThread::with('seller', 'product')
            ->where('buyer_id', $request->user()->id)
            ->find($id);
    }

    // POST /api/buyer/chat/start
    public function start(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        $request->validate([
            'seller_id'  => ['required', 'integer'],
            'product_id' => ['nullable', 'integer'],
        ], ['seller_id.required' => 'Seller is required.']);

        $seller = User::find($request->integer('seller_id'));
        if (! $seller || $seller->account_type !== 'seller' || $seller->status !== 'approved') {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        $productId = null;
        if ($request->filled('product_id')) {
            $product = Product::where('id', $request->integer('product_id'))
                ->where('seller_id', $seller->id)
                ->first();
            if (! $product) {
                return $this->validationError('product_id', 'This product does not belong to the seller.');
            }
            $productId = $product->id;
        }

        $thread = ChatThread::firstOrCreate(
            ['buyer_id' => $buyerId, 'seller_id' => $seller->id],
            ['product_id' => $productId]
        );
        // Product context (the product card shown at the top of the thread)
        // follows the product the buyer most recently asked about.
        if ($productId && $thread->product_id !== $productId) {
            $thread->update(['product_id' => $productId]);
        }

        $thread->load('seller', 'product', 'latestMessage');

        return response()->json(['data' => $this->formatThread($thread, $buyerId)]);
    }

    // GET /api/buyer/chat
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        $threads = ChatThread::with('seller', 'product', 'latestMessage')
            ->where('buyer_id', $buyerId)
            ->orderByRaw('last_message_at IS NULL, last_message_at DESC')
            ->get();

        $data = $threads->map(fn ($t) => $this->formatThread($t, $buyerId))->values();

        return response()->json([
            'data' => $data,
            'meta' => ['unread_total' => $data->sum('unread_count')],
        ]);
    }

    // GET /api/buyer/chat/{id}/messages?after_id=
    public function messages(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        $thread = $this->ownThread($request, $id);
        if (! $thread) {
            return response()->json(['message' => 'Chat not found.'], 404);
        }

        $afterId = max(0, (int) $request->input('after_id', 0));

        if ($afterId > 0) {
            $msgs = ChatMessage::where('thread_id', $thread->id)
                ->where('id', '>', $afterId)
                ->orderBy('id')
                ->limit(100)
                ->get();
        } else {
            $msgs = ChatMessage::where('thread_id', $thread->id)
                ->orderByDesc('id')
                ->limit(50)
                ->get()
                ->reverse()
                ->values();
        }

        // Opening the thread marks the seller's messages as read.
        ChatMessage::where('thread_id', $thread->id)
            ->where('sender_id', '!=', $buyerId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        ChatNotificationService::threadRead($thread, $buyerId);

        return response()->json([
            'data'   => $msgs->map(fn ($m) => $this->formatMessage($m, $buyerId))->values(),
            'thread' => [
                'id'          => $thread->id,
                'seller_id'   => $thread->seller_id,
                'seller_name' => $this->sellerName($thread->seller),
                'product'     => $this->productCard($thread->product),
            ],
        ]);
    }

    // POST /api/buyer/chat/{id}/messages
    public function send(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $buyerId = $request->user()->id;

        $thread = $this->ownThread($request, $id);
        if (! $thread) {
            return response()->json(['message' => 'Chat not found.'], 404);
        }

        $body     = $request->input('body');
        $body     = is_string($body) ? trim($body) : null;
        $hasImage = $request->hasFile('image');

        if (($body === null || $body === '') && ! $hasImage) {
            return $this->validationError('body', 'Message cannot be empty.');
        }
        if ($body !== null && mb_strlen($body) > 1000) {
            return $this->validationError('body', 'Message must not exceed 1000 characters.');
        }

        $path = null;
        if ($hasImage) {
            if ($msg = $this->imageError($request->file('image'))) {
                return $this->validationError('image', $msg);
            }
            $path = $this->storeImage($request->file('image'), self::FOLDER, self::PREFIX);
        }

        // Message + thread timestamp commit together; the seller notification
        // (one per unread batch) is inserted after the commit.
        $m = DB::transaction(function () use ($thread, $buyerId, $body, $path) {
            $m = ChatMessage::create([
                'thread_id'  => $thread->id,
                'sender_id'  => $buyerId,
                'body'       => $body !== '' ? $body : null,
                'image_path' => $path,
            ]);
            $thread->update(['last_message_at' => $m->created_at]);
            ChatNotificationService::messageSent($thread, $m);
            return $m;
        });

        return response()->json(['data' => $this->formatMessage($m, $buyerId)], 201);
    }

    // GET /api/buyer/chat-image/{filename}
    public function serveImage(string $filename): Response
    {
        return $this->serveStoredImage(self::FOLDER, self::PREFIX, $filename);
    }
}
