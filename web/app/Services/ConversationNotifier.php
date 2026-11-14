<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * In-app notification to the OTHER side of a role conversation: ONE per unread
 * batch (a message only notifies when the other side has read everything this
 * sender wrote before it), dedupe_key conv:{conversation}:{first unread message}
 * (UNIQUE per recipient, insertOrIgnore), inserted after the surrounding
 * transaction commits, never throws.
 *
 *   seller   -> seller_notifications   (type conversation_message, url /seller/messages)
 *   courier  -> courier_notifications  (url /courier/messages)
 *   admin    -> none exists (admin has no notification table/UI)        [listed in the report]
 *   buyer, logistics, rider -> none requested (rider / buyer apps are not touched)
 * Opening the thread (mark read) marks that thread's notifications read, so the next message starts a new batch.
 */
class ConversationNotifier
{
    public static function messageSent(Conversation $conv, ConversationMessage $m): void
    {
        try {
            $other = ConversationParticipant::where('conversation_id', $conv->id)
                ->where(fn ($q) => $q->where('role', '!=', $m->sender_role)->orWhere('user_id', '!=', $m->sender_user_id))->first();
            if (! $other || ! in_array($other->role, ['seller', 'courier'], true)) {
                return;
            }
            $prevFromSender = (int) ConversationMessage::where('conversation_id', $conv->id)->where('id', '<', $m->id)
                ->where('sender_role', $m->sender_role)->where('sender_user_id', $m->sender_user_id)->max('id');
            if ($prevFromSender > 0 && $prevFromSender > (int) $other->last_read_message_id) {
                return; // that batch already notified and is still unread
            }
            $from  = MessagingService::nameOf(['role' => $m->sender_role, 'id' => (int) $m->sender_user_id]);
            $key   = "conv:{$conv->id}:{$m->id}";
            $title = 'New message';
            $text  = "{$from} sent you a message.";
            $data  = ['conversation_id' => $conv->id];

            if ($other->role === 'seller') {
                SellerNotificationService::custom((int) $other->user_id, 'conversation_message', $title, $text, $key, $data, '/seller/messages?tab=team&thread=' . $conv->id);
            } else {
                CourierNotificationService::create((int) $other->user_id, 'conversation_message', $title, $text, $key, $data, '/courier/messages?thread=' . $conv->id);
            }
        } catch (\Throwable $e) {
            Log::warning('Conversation notification failed: ' . $e->getMessage());
        }
    }

    /** The reader opened the thread: its notifications are read, so the next message notifies again. */
    public static function cleared(Conversation $conv, array $me): void
    {
        try {
            $table = match ($me['role']) {
                'seller'  => ['seller_notifications', 'seller_id'],
                'courier' => ['courier_notifications', 'courier_id'],
                default   => null,
            };
            if ($table) {
                DB::table($table[0])->where($table[1], $me['id'])->where('type', 'conversation_message')
                    ->where('dedupe_key', 'like', "conv:{$conv->id}:%")->whereNull('read_at')->update(['read_at' => now()]);
            }
        } catch (\Throwable $e) {
            Log::warning('Conversation notification clear failed: ' . $e->getMessage());
        }
    }
}
