<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Product;
use App\Services\ChatNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Seller side of buyer <-> seller chat (session auth, seller accounts only).
 * Same tables, threads and messages as BuyerChatController (mobile + web).
 * Polling-based (no websockets).
 *
 * GET  /seller/chat/threads                 own threads + last message + unread count
 * GET  /seller/chat/{id}/messages?after_id= (marks the buyer's messages read)
 * POST /seller/chat/{id}/messages           body (1–1000) and/or image (JPG/PNG ≤ 5 MB)
 * POST /seller/chat/{id}/read               mark the buyer's messages read
 *
 * Access: 403 for non-seller accounts; 404 for a thread of another seller.
 * Message bodies are plain text; clients must never render them as HTML.
 */
class SellerChatController extends Controller
{
    use BuyerApiHelpers;

    /** Same storage as BuyerChatController (served by /api/buyer/chat-image). */
    private const FOLDER = 'chat_images';
    private const PREFIX = 'chat';

    public const MAX_LENGTH = 1000;

    private function sellerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()?->account_type !== 'seller') {
            return response()->json(['message' => 'Only seller accounts can access this endpoint.'], 403);
        }
        return null;
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

    private function formatMessage(ChatMessage $m, int $sellerId): array
    {
        return [
            'id'         => $m->id,
            'thread_id'  => $m->thread_id,
            'is_mine'    => (int) $m->sender_id === $sellerId,
            'body'       => $m->body,
            'image_url'  => $this->imageUrlFor($m->image_path, 'chat-image'),
            'read_at'    => $m->read_at?->toISOString(),
            'created_at' => $m->created_at?->toISOString(),
        ];
    }

    private function unreadFor(int $threadId, int $sellerId): int
    {
        return ChatMessage::where('thread_id', $threadId)
            ->where('sender_id', '!=', $sellerId)
            ->whereNull('read_at')
            ->count();
    }

    private function formatThread(ChatThread $t, int $sellerId): array
    {
        $last = $t->latestMessage;
        return [
            'id'              => $t->id,
            'buyer_id'        => $t->buyer_id,
            'buyer_name'      => ChatNotificationService::userName($t->buyer, 'Buyer'),
            'product'         => $this->productCard($t->product),
            'last_message'    => $last ? $this->formatMessage($last, $sellerId) : null,
            'last_message_at' => $t->last_message_at?->toISOString(),
            'unread_count'    => $this->unreadFor($t->id, $sellerId),
        ];
    }

    private function unreadTotal(int $sellerId): int
    {
        return ChatMessage::whereIn('thread_id', ChatThread::where('seller_id', $sellerId)->select('id'))
            ->where('sender_id', '!=', $sellerId)
            ->whereNull('read_at')
            ->count();
    }

    private function ownThread(Request $request, int $id): ?ChatThread
    {
        return ChatThread::with('buyer:id,name,first_name,last_name', 'product')
            ->where('seller_id', $request->user()->id)
            ->find($id);
    }

    private function notFound(): JsonResponse
    {
        return response()->json(['message' => 'Chat not found.'], 404);
    }

    private function markThreadRead(ChatThread $thread, int $sellerId): int
    {
        $marked = ChatMessage::where('thread_id', $thread->id)
            ->where('sender_id', '!=', $sellerId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        ChatNotificationService::threadRead($thread, $sellerId);
        return $marked;
    }

    // GET /seller/chat/threads
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->sellerGuard($request)) return $err;
        $sellerId = (int) $request->user()->id;

        $threads = ChatThread::with('buyer:id,name,first_name,last_name', 'product', 'latestMessage')
            ->where('seller_id', $sellerId)
            ->orderByRaw('last_message_at IS NULL, last_message_at DESC')
            ->get();

        $data = $threads->map(fn ($t) => $this->formatThread($t, $sellerId))->values();

        return response()->json([
            'data' => $data,
            'meta' => ['unread_total' => $data->sum('unread_count')],
        ]);
    }

    // GET /seller/chat/{id}/messages?after_id=
    public function messages(Request $request, int $id): JsonResponse
    {
        if ($err = $this->sellerGuard($request)) return $err;
        $sellerId = (int) $request->user()->id;

        $thread = $this->ownThread($request, $id);
        if (! $thread) return $this->notFound();

        $afterId = max(0, (int) $request->input('after_id', 0));
        $msgs = $afterId > 0
            ? ChatMessage::where('thread_id', $thread->id)->where('id', '>', $afterId)->orderBy('id')->limit(100)->get()
            : ChatMessage::where('thread_id', $thread->id)->orderByDesc('id')->limit(50)->get()->reverse()->values();

        // Opening the thread marks the buyer's messages as read.
        $this->markThreadRead($thread, $sellerId);

        return response()->json([
            'data'   => $msgs->map(fn ($m) => $this->formatMessage($m, $sellerId))->values(),
            'thread' => [
                'id'         => $thread->id,
                'buyer_id'   => $thread->buyer_id,
                'buyer_name' => ChatNotificationService::userName($thread->buyer, 'Buyer'),
                'product'    => $this->productCard($thread->product),
            ],
            'meta'   => ['unread_total' => $this->unreadTotal($sellerId)],
        ]);
    }

    // POST /seller/chat/{id}/messages
    public function send(Request $request, int $id): JsonResponse
    {
        if ($err = $this->sellerGuard($request)) return $err;
        $sellerId = (int) $request->user()->id;

        $thread = $this->ownThread($request, $id);
        if (! $thread) return $this->notFound();

        $body     = $request->input('body');
        $body     = is_string($body) ? trim($body) : null;
        $hasImage = $request->hasFile('image');

        if (($body === null || $body === '') && ! $hasImage) {
            return $this->validationError('body', 'Message cannot be empty.');
        }
        if ($body !== null && mb_strlen($body) > self::MAX_LENGTH) {
            return $this->validationError('body', 'Message must not exceed ' . self::MAX_LENGTH . ' characters.');
        }

        $path = null;
        if ($hasImage) {
            if ($msg = $this->imageError($request->file('image'))) {
                return $this->validationError('image', $msg);
            }
            $path = $this->storeImage($request->file('image'), self::FOLDER, self::PREFIX);
        }

        $m = DB::transaction(function () use ($thread, $sellerId, $body, $path) {
            // Replying means the seller has seen the buyer's messages.
            $this->markThreadRead($thread, $sellerId);
            $m = ChatMessage::create([
                'thread_id'  => $thread->id,
                'sender_id'  => $sellerId,
                'body'       => $body !== '' ? $body : null,
                'image_path' => $path,
            ]);
            $thread->update(['last_message_at' => $m->created_at]);
            ChatNotificationService::messageSent($thread, $m);
            return $m;
        });

        return response()->json(['data' => $this->formatMessage($m, $sellerId)], 201);
    }

    // POST /seller/chat/{id}/read
    public function markRead(Request $request, int $id): JsonResponse
    {
        if ($err = $this->sellerGuard($request)) return $err;
        $sellerId = (int) $request->user()->id;

        $thread = $this->ownThread($request, $id);
        if (! $thread) return $this->notFound();

        $marked = $this->markThreadRead($thread, $sellerId);

        return response()->json(['data' => ['marked' => $marked], 'meta' => ['unread_total' => $this->unreadTotal($sellerId)]]);
    }
}
