<?php

namespace App\Services;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;

/**
 * Support tickets: buyers, sellers, riders and couriers write to the admin team.
 *
 *  Submit:  category in CATEGORIES, subject 3-120, message 10-2000.
 *           At most MAX_ACTIVE unresolved tickets per user; the same subject
 *           while an earlier one is still unresolved = duplicate.
 *  Reply:   only on your own, unresolved ticket.
 *  Admin:   reply (an open ticket becomes in_progress) and status changes
 *           open | in_progress | resolved. The submitter is notified on every
 *           admin reply and status change (generic text, links to the ticket).
 */
class SupportTicketService
{
    public const CATEGORIES = [
        'account'   => 'Account',
        'order'     => 'Orders',
        'payment'   => 'Payment / COD',
        'delivery'  => 'Delivery',
        'technical' => 'Technical problem',
        'other'     => 'Other',
        // Routed categories (see targetFor)
        'logistics'      => 'Logistics issue (delivery, rider, parcel)',
        'seller_product' => 'Seller / product issue',
        'seller_web'     => 'My seller account / website issue',
        'courier'        => 'Courier issue',
    ];

    /** Queues a ticket can be routed to. */
    public const TARGETS = ['admin', 'logistics', 'courier'];

    public const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

    /** Statuses where the thread is finished (no more replies / not counted as active). */
    public const DONE = ['resolved', 'closed'];

    /**
     * Routing: logistics issues -> Logistics Support, courier issues -> Courier Support,
     * everything else (seller/product issues from buyers, a seller's own web issue, account,
     * payment, technical, other) -> Admin Help and Support.
     */
    public static function targetFor(string $category): string
    {
        return match ($category) {
            'logistics', 'delivery' => 'logistics',
            'courier' => 'courier',
            default => 'admin',
        };
    }

    /** Categories a role may pick: seller/product issues come from buyers, the seller web issue from sellers. */
    public static function categoriesFor(?string $role): array
    {
        $c = self::CATEGORIES;
        unset($c['delivery']); // replaced by the routed "logistics" category
        if ($role !== 'buyer') {
            unset($c['seller_product']);
        }
        if ($role !== 'seller') {
            unset($c['seller_web']);
        }

        return $c;
    }

    public const MAX_ACTIVE = 5;

    public const NOTIFY_TYPE = 'support_ticket';

    public const ERR_DUPLICATE = 'duplicate';
    public const ERR_TOO_MANY  = 'too_many';
    public const ERR_RESOLVED  = 'resolved';
    public const ERR_CATEGORY  = 'category';

    public static function rules(): array
    {
        return [
            'category' => 'required|string|in:' . implode(',', array_keys(self::CATEGORIES)),
            'subject'  => 'required|string|min:3|max:120',
            'message'  => 'required|string|min:10|max:2000',
            'order_id' => 'nullable|integer|exists:orders,id', // the parcel / order the issue is about
        ];
    }

    public static function replyRules(): array
    {
        return ['body' => 'required|string|min:1|max:2000'];
    }

    /** @return array{error: ?string, ticket: ?SupportTicket} */
    public static function submit(User $user, string $role, array $v): array
    {
        if (! array_key_exists($v['category'], self::categoriesFor($role))) {
            return ['error' => self::ERR_CATEGORY, 'ticket' => null];
        }
        $orderId = ! empty($v['order_id']) && \App\Models\Order::where('id', $v['order_id'])->where(fn ($q) => $q->where('buyer_id', $user->id)
            ->orWhereHas('items', fn ($i) => $i->where('seller_id', $user->id))->orWhere('assigned_courier_id', $user->id))->exists() ? (int) $v['order_id'] : null;
        $active = SupportTicket::where('user_id', $user->id)->whereNotIn('status', self::DONE)->lockForUpdate()->get(['id', 'subject']);
        $subject = trim((string) $v['subject']);
        if ($active->contains(fn ($t) => mb_strtolower(trim($t->subject)) === mb_strtolower($subject))) {
            return ['error' => self::ERR_DUPLICATE, 'ticket' => null];
        }
        if ($active->count() >= self::MAX_ACTIVE) {
            return ['error' => self::ERR_TOO_MANY, 'ticket' => null];
        }

        $ticket = SupportTicket::create([
            'user_id'   => $user->id,
            'user_role' => $role,
            'category'  => $v['category'],
            'subject'   => $subject,
            'message'   => trim((string) $v['message']),
            'status'    => 'open',
            'target'    => self::targetFor($v['category']),
            'order_id'  => $orderId,
        ]);

        return ['error' => null, 'ticket' => $ticket];
    }

    /** @return array{error: ?string, reply: ?SupportTicketReply} */
    public static function userReply(SupportTicket $t, User $user, string $body): array
    {
        if (in_array($t->status, self::DONE, true)) {
            return ['error' => self::ERR_RESOLVED, 'reply' => null];
        }
        $reply = SupportTicketReply::create(['ticket_id' => $t->id, 'author_type' => 'user', 'user_id' => $user->id, 'body' => trim($body)]);
        $t->forceFill(['last_reply_at' => now()])->save();

        return ['error' => null, 'reply' => $reply];
    }

    public static function adminReply(SupportTicket $t, string $body, string $author = 'admin', ?int $staffId = null): SupportTicketReply
    {
        $reply = SupportTicketReply::create(['ticket_id' => $t->id, 'author_type' => $author, 'user_id' => $staffId, 'body' => trim($body)]);
        $t->forceFill([
            'last_reply_at' => now(),
            'status'        => $t->status === 'open' ? 'in_progress' : $t->status,
        ])->save();

        self::notify($t, 'Support replied to your ticket', "The mimoo support team replied to your ticket \"" . self::short($t) . "\".", "reply:{$reply->id}");

        return $reply;
    }

    /** @return bool changed */
    public static function setStatus(SupportTicket $t, string $status): bool
    {
        if ($t->status === $status) {
            return false;
        }
        $t->forceFill([
            'status'      => $status,
            'resolved_at' => in_array($status, self::DONE, true) ? now() : null,
        ])->save();

        $label = ['open' => 'reopened', 'in_progress' => 'in progress', 'resolved' => 'resolved', 'closed' => 'closed'][$status];
        self::notify($t, 'Support ticket ' . $label, "Your ticket \"" . self::short($t) . "\" is now {$label}.", "status:{$status}:" . now()->timestamp);

        return true;
    }

    private static function short(SupportTicket $t): string
    {
        return \Illuminate\Support\Str::limit((string) $t->subject, 60);
    }

    private static function notify(SupportTicket $t, string $title, string $body, string $key): void
    {
        $user = User::find($t->user_id);
        if (! $user) {
            return;
        }
        $url = match ($t->user_role) {
            'buyer'  => '/support?ticket=' . $t->id,
            'seller' => '/seller/support?ticket=' . $t->id,
            default  => '',
        };
        UserNotifier::send($user, self::NOTIFY_TYPE, $title, $body, "support:{$t->id}:{$key}", ['ticket_id' => $t->id, 'status' => $t->status], $url);
    }

    /** Submitter-facing shape. */
    public static function present(SupportTicket $t, bool $withReplies = false): array
    {
        $out = [
            'id'             => $t->id,
            'category'       => $t->category,
            'category_label' => self::CATEGORIES[$t->category] ?? $t->category,
            'target'         => $t->target ?? 'admin',
            'order_id'       => $t->order_id,
            'subject'        => $t->subject,
            'message'        => $t->message,
            'status'         => $t->status,
            'created_at'     => $t->created_at?->toISOString(),
            'updated_at'     => $t->updated_at?->toISOString(),
            'last_reply_at'  => $t->last_reply_at?->toISOString(),
        ];
        if ($withReplies) {
            $files = SupportAttachmentService::grouped((int) $t->id);
            $out['attachments'] = $files[0] ?? [];
            $out['replies'] = $t->replies->map(fn (SupportTicketReply $r) => [
                'id'          => $r->id,
                'from'        => $r->author_type === 'user' ? 'me' : 'support',
                'body'        => $r->body,
                'attachments' => $files[$r->id] ?? [],
                'created_at'  => $r->created_at?->toISOString(),
            ])->values()->all();
        }

        return $out;
    }
}
