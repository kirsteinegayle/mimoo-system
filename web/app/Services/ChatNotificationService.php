<?php

namespace App\Services;

use App\Models\BuyerNotification;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\SellerNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * In-app notifications for buyer <-> seller chat (chat_threads/chat_messages).
 *
 * ONE notification per thread per unread batch: a message only notifies when
 * it starts a new batch, i.e. the other side has read everything this sender
 * wrote before it. Further messages while the batch is still unread add
 * nothing. Opening the thread (messages marked read) also marks that thread's
 * chat notifications read, so the next message starts a new batch.
 *
 *   seller row  type chat_message, dedupe_key chat:{thread}:{first unread msg id}
 *               (UNIQUE seller_id+dedupe_key + insertOrIgnore: never doubled)
 *   buyer row   type chat_message, data.thread_id; skipped while an unread
 *               chat row for the same thread exists (no dedupe column there)
 *
 * Never throws; inserts run after the surrounding transaction commits.
 */
class ChatNotificationService
{
    public const TYPE = 'chat_message';

    public static function sellerUrl(int $threadId): string
    {
        return '/seller/messages?thread=' . $threadId;
    }

    public static function buyerUrl(int $threadId): string
    {
        return '/messages?thread=' . $threadId;
    }

    public static function messageSent(ChatThread $thread, ChatMessage $message): void
    {
        try {
            $senderId  = (int) $message->sender_id;
            $fromBuyer = $senderId === (int) $thread->buyer_id;

            // First message of the current unread batch from this sender.
            $firstUnread = (int) ChatMessage::where('thread_id', $thread->id)
                ->where('sender_id', $senderId)
                ->whereNull('read_at')
                ->min('id');
            if ($firstUnread === 0) {
                return;
            }

            $snippet = $message->body !== null && $message->body !== ''
                ? Str::limit($message->body, 80)
                : 'Sent a photo';

            if ($fromBuyer) {
                self::notifySeller($thread, $message, $firstUnread, $snippet);
            } elseif ($firstUnread === (int) $message->id) {
                self::notifyBuyer($thread, $message, $snippet);
            }
        } catch (\Throwable $e) {
            Log::warning('Chat notification failed: ' . $e->getMessage());
        }
    }

    /** Recipient opened the thread: their chat notifications for it are read. */
    public static function threadRead(ChatThread $thread, int $readerId): void
    {
        try {
            if ($readerId === (int) $thread->seller_id) {
                SellerNotification::where('seller_id', $readerId)
                    ->where('type', self::TYPE)
                    ->where('dedupe_key', 'like', 'chat:' . $thread->id . ':%')
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);
            } elseif ($readerId === (int) $thread->buyer_id) {
                BuyerNotification::where('buyer_id', $readerId)
                    ->where('type', self::TYPE)
                    ->where('data->thread_id', (int) $thread->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);
            }
        } catch (\Throwable $e) {
            Log::warning('Chat notification read failed: ' . $e->getMessage());
        }
    }

    private static function notifySeller(ChatThread $thread, ChatMessage $m, int $firstUnread, string $snippet): void
    {
        $sellerId = (int) $thread->seller_id;
        $threadId = (int) $thread->id;
        $buyerId  = (int) $thread->buyer_id;
        $name     = self::userName(User::find($buyerId, ['id', 'name', 'first_name', 'last_name']), 'A buyer');

        DB::afterCommit(function () use ($sellerId, $threadId, $buyerId, $m, $firstUnread, $snippet, $name) {
            try {
                $now = now();
                DB::table('seller_notifications')->insertOrIgnore([
                    'seller_id'  => $sellerId,
                    'type'       => self::TYPE,
                    'title'      => "New message from {$name}",
                    'message'    => $snippet,
                    'data'       => json_encode(['thread_id' => $threadId, 'buyer_id' => $buyerId, 'message_id' => (int) $m->id]),
                    'url'        => self::sellerUrl($threadId),
                    'dedupe_key' => "chat:{$threadId}:{$firstUnread}",
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Seller chat notification insert failed: ' . $e->getMessage());
            }
        });
    }

    private static function notifyBuyer(ChatThread $thread, ChatMessage $m, string $snippet): void
    {
        $buyerId  = (int) $thread->buyer_id;
        $threadId = (int) $thread->id;
        $sellerId = (int) $thread->seller_id;
        $seller   = User::find($sellerId, ['id', 'name', 'first_name', 'last_name', 'business_name']);
        $name     = ! empty($seller?->business_name) ? $seller->business_name : self::userName($seller, 'the seller');

        DB::afterCommit(function () use ($buyerId, $threadId, $sellerId, $m, $snippet, $name) {
            try {
                $pending = BuyerNotification::where('buyer_id', $buyerId)
                    ->where('type', self::TYPE)
                    ->where('data->thread_id', $threadId)
                    ->whereNull('read_at')
                    ->exists();
                if ($pending) {
                    return;
                }
                BuyerNotification::create([
                    'buyer_id' => $buyerId,
                    'type'     => self::TYPE,
                    'title'    => "New message from {$name}",
                    'body'     => $snippet,
                    'data'     => [
                        'thread_id'  => $threadId,
                        'seller_id'  => $sellerId,
                        'message_id' => (int) $m->id,
                        'url'        => self::buyerUrl($threadId),
                    ],
                ]);
            } catch (\Throwable $e) {
                Log::warning('Buyer chat notification insert failed: ' . $e->getMessage());
            }
        });
    }

    public static function userName(?User $u, string $fallback): string
    {
        if (! $u) {
            return $fallback;
        }
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        if ($full === '') {
            $full = trim((string) ($u->name ?? ''));
        }
        return $full !== '' ? $full : $fallback;
    }
}
