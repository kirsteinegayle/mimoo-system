<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use App\Models\CourierPersonnel;
use App\Models\OrderItem;
use App\Models\ShipmentAssignment;
use App\Models\User;
use App\Support\PortalRole;
use Illuminate\Support\Facades\DB;

/**
 * Role-to-role messaging rules + storage (conversations / participants / messages).
 * Buyer <-> seller (chat_threads) and rider <-> buyer (delivery_messages) are NOT here.
 *
 * Identity = [role, id]:
 *   admin     ['admin', 0]  (master-code admin has no users row: one shared admin team)
 *   seller / buyer / rider  their own user id
 *   courier   the courier company user (role courier)
 *   logistics their own user id (logistics_staff)
 *
 * Allowed pairs (everything else is refused with 403):
 *   admin <-> seller | buyer | courier | logistics
 *   seller <-> courier   only when the courier company has a shipment of an order that has an item of that seller
 *   courier <-> rider    only the company's own active rider personnel (courier_personnel.courier_id)
 * Deliberately NOT allowed: seller-seller, seller-logistics, seller-rider, courier-logistics,
 * courier-courier, rider-admin, rider-seller, rider-logistics, buyer-courier / logistics / rider
 * (buyer-seller and buyer-rider already exist elsewhere), and anyone with themselves.
 */
class MessagingService
{
    public const BODY_MAX = 500;

    public const ADMIN = ['role' => 'admin', 'id' => 0];

    private const PAIRS = [
        'admin|seller', 'admin|buyer', 'admin|courier', 'admin|logistics',
        'courier|seller', 'courier|rider',
    ];

    public static function identityOf(User $user): ?array
    {
        $role = match (PortalRole::roleOf($user)) {
            'logistics_staff' => 'logistics',
            'buyer', 'seller', 'courier', 'rider' => PortalRole::roleOf($user),
            default => null,
        };

        return $role ? ['role' => $role, 'id' => (int) $user->id] : null;
    }

    private static function typeOf(array $a, array $b): ?string
    {
        $roles = [$a['role'], $b['role']];
        sort($roles);
        $type = implode('|', $roles);

        return in_array($type, self::PAIRS, true) ? $type : null;
    }

    public static function canMessage(array $a, array $b): bool
    {
        if ($a['role'] === $b['role'] && $a['id'] === $b['id']) {
            return false;
        }
        $type = self::typeOf($a, $b);
        if ($type === null) {
            return false;
        }
        $by = [$a['role'] => $a['id'], $b['role'] => $b['id']];

        return match ($type) {
            'admin|seller', 'admin|buyer', 'admin|courier', 'admin|logistics' => self::exists($by),
            'courier|seller' => ShipmentAssignment::where('courier_id', $by['courier'])
                ->whereIn('order_id', OrderItem::where('seller_id', $by['seller'])->select('order_id'))->exists(),
            'courier|rider' => CourierPersonnel::where('courier_id', $by['courier'])->where('user_id', $by['rider'])
                ->where('status', 'active')->exists(),
            default => false,
        };
    }

    /** The non-admin side must be a real user of that role (admin team id 0 always exists). */
    private static function exists(array $by): bool
    {
        foreach ($by as $role => $id) {
            if ($role === 'admin') {
                continue;
            }
            $dbRole = $role === 'logistics' ? 'logistics_staff' : $role;
            $q = User::whereKey($id)->where('role', $dbRole);
            if ($role !== 'buyer' && $role !== 'rider') {
                $q->where('status', 'approved');
            }
            if (! $q->exists()) {
                return false;
            }
        }

        return true;
    }

    public static function nameOf(array $who): string
    {
        if ($who['role'] === 'admin') {
            return 'mimoo Admin';
        }
        $u = User::find($who['id']);
        if (! $u) {
            return 'Unknown';
        }
        $name = $who['role'] === 'seller' || $who['role'] === 'courier' || $who['role'] === 'logistics'
            ? ($u->business_name ?: $u->company_name ?: null) : null;

        return $name ?: (trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')) ?: $u->name ?: 'User');
    }

    /** Allowed counterparts for the contact picker. @return array<int, array{role:string,id:int,name:string}> */
    public static function contacts(array $me, string $q = ''): array
    {
        $out = [];
        $add = function (string $role, $ids) use (&$out) {
            foreach (collect($ids)->unique() as $id) {
                $out[] = ['role' => $role, 'id' => (int) $id, 'name' => self::nameOf(['role' => $role, 'id' => (int) $id])];
            }
        };
        $like = $q !== '' ? "%{$q}%" : null;
        $users = fn (string $dbRole, bool $approved = true) => User::where('role', $dbRole)
            ->when($approved, fn ($x) => $x->where('status', 'approved'))
            ->when($like, fn ($x) => $x->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('business_name', 'like', $like)
                ->orWhere('company_name', 'like', $like)->orWhere('email', 'like', $like)))
            ->orderBy('id')->limit(30)->pluck('id');

        switch ($me['role']) {
            case 'admin':
                $add('seller', $users('seller'));
                $add('courier', $users('courier'));
                $add('logistics', $users('logistics_staff'));
                $add('buyer', $users('buyer', false));
                break;
            case 'seller':
                $out[] = ['role' => 'admin', 'id' => 0, 'name' => 'mimoo Admin'];
                $add('courier', ShipmentAssignment::whereIn('order_id', OrderItem::where('seller_id', $me['id'])->select('order_id'))->distinct()->pluck('courier_id'));
                break;
            case 'courier':
                $out[] = ['role' => 'admin', 'id' => 0, 'name' => 'mimoo Admin'];
                $add('seller', OrderItem::whereIn('order_id', ShipmentAssignment::where('courier_id', $me['id'])->select('order_id'))->whereNotNull('seller_id')->distinct()->pluck('seller_id'));
                $add('rider', CourierPersonnel::where('courier_id', $me['id'])->where('status', 'active')->whereNotNull('user_id')->pluck('user_id'));
                break;
            case 'rider':
                $add('courier', CourierPersonnel::where('user_id', $me['id'])->where('status', 'active')->pluck('courier_id'));
                break;
            default: // buyer, logistics
                $out[] = ['role' => 'admin', 'id' => 0, 'name' => 'mimoo Admin'];
        }

        // drop anything the rules would refuse (e.g. a deactivated rider)
        return array_values(array_filter($out, fn ($c) => self::canMessage($me, $c)));
    }

    public static function pairKey(array $a, array $b): string
    {
        $k = ["{$a['role']}:{$a['id']}", "{$b['role']}:{$b['id']}"];
        sort($k);

        return implode('|', $k);
    }

    /** Get-or-create the one conversation of a pair. Caller must have checked canMessage(). */
    public static function open(array $a, array $b): Conversation
    {
        $key = self::pairKey($a, $b);
        $conv = Conversation::firstOrCreate(['pair_key' => $key], ['type' => self::typeOf($a, $b)]);
        foreach ([$a, $b] as $p) {
            ConversationParticipant::firstOrCreate(['conversation_id' => $conv->id, 'role' => $p['role'], 'user_id' => $p['id']]);
        }

        return $conv;
    }

    public static function participant(Conversation|int $conv, array $me): ?ConversationParticipant
    {
        $id = $conv instanceof Conversation ? $conv->id : $conv;

        return ConversationParticipant::where('conversation_id', $id)->where('role', $me['role'])->where('user_id', $me['id'])->first();
    }

    public static function counterpart(Conversation|int $conv, array $me): ?ConversationParticipant
    {
        $id = $conv instanceof Conversation ? $conv->id : $conv;

        return ConversationParticipant::where('conversation_id', $id)
            ->where(fn ($q) => $q->where('role', '!=', $me['role'])->orWhere('user_id', '!=', $me['id']))->first();
    }

    public static function unread(int $conversationId, array $me): int
    {
        $p = self::participant($conversationId, $me);

        return $p ? self::unreadFor($p) : 0;
    }

    public static function unreadFor(ConversationParticipant $p): int
    {
        return ConversationMessage::where('conversation_id', $p->conversation_id)
            ->where('id', '>', (int) $p->last_read_message_id)
            ->where(fn ($q) => $q->where('sender_role', '!=', $p->role)->orWhere('sender_user_id', '!=', $p->user_id))
            ->count();
    }

    public static function unreadTotal(array $me): int
    {
        return (int) ConversationParticipant::where('role', $me['role'])->where('user_id', $me['id'])->get()
            ->sum(fn ($p) => self::unreadFor($p));
    }

    /** Marks everything up to now as read for $me and clears that thread's message notifications. */
    public static function markRead(Conversation $conv, array $me): int
    {
        $p = self::participant($conv, $me);
        if (! $p) {
            return 0;
        }
        $unread = self::unreadFor($p);
        $last = (int) ConversationMessage::where('conversation_id', $conv->id)->max('id');
        if ($last > (int) $p->last_read_message_id) {
            $p->update(['last_read_message_id' => $last]);
        }
        ConversationNotifier::cleared($conv, $me);

        return $unread;
    }

    /** Stores a message (caller validated access, body and image). Replying implies the sender has read the thread. */
    public static function send(Conversation $conv, array $me, ?string $body, ?string $imagePath): ConversationMessage
    {
        return DB::transaction(function () use ($conv, $me, $body, $imagePath) {
            self::markRead($conv, $me);
            $m = ConversationMessage::create([
                'conversation_id' => $conv->id, 'sender_role' => $me['role'], 'sender_user_id' => $me['id'],
                'body' => $body !== '' ? $body : null, 'image_path' => $imagePath,
            ]);
            $conv->update(['last_message_at' => $m->created_at]);
            ConversationNotifier::messageSent($conv, $m);

            return $m;
        });
    }
}
