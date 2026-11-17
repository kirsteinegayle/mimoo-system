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
 *   logistics their own user id (logistics_staff, linked to a company via courier_company_id)
 *
 * ALL rules live in MATRIX below — canMessage(), contacts() and the conversation
 * type are derived from it. To allow a new pair, add it on BOTH sides.
 * Anything not in the matrix is refused (403), and nobody can message themselves.
 */
class MessagingService
{
    public const BODY_MAX = 500;

    public const ADMIN = ['role' => 'admin', 'id' => 0];

    /**
     * Who may message whom, and under which relationship ("scope"):
     *   any       – always (both accounts must exist / be approved)
     *   company   – both sides belong to the same courier company
     *               (courier = the company, logistics = courier_company_id, rider = active personnel)
     *   shipment  – the seller has an order item shipped by the other side's courier company
     */
    public const MATRIX = [
        'admin'     => ['seller' => 'any', 'buyer' => 'any', 'courier' => 'any', 'logistics' => 'any'],
        'seller'    => ['admin' => 'any', 'courier' => 'shipment', 'logistics' => 'shipment'],
        'courier'   => ['admin' => 'any', 'seller' => 'shipment', 'logistics' => 'company', 'rider' => 'company'],
        'logistics' => ['admin' => 'any', 'seller' => 'shipment', 'courier' => 'company'],
        'rider'     => ['courier' => 'company'],
        'buyer'     => ['admin' => 'any'],
    ];

    public static function scopeOf(string $from, string $to): ?string
    {
        return self::MATRIX[$from][$to] ?? null;
    }

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
        if (self::scopeOf($a['role'], $b['role']) === null) {
            return null;
        }
        $roles = [$a['role'], $b['role']];
        sort($roles);

        return implode('|', $roles);
    }

    public static function canMessage(array $a, array $b): bool
    {
        if ($a['role'] === $b['role'] && $a['id'] === $b['id']) {
            return false;
        }
        $scope = self::scopeOf($a['role'], $b['role']);
        if ($scope === null || ! self::exists($a) || ! self::exists($b)) {
            return false;
        }

        return match ($scope) {
            'any'      => true,
            'company'  => array_intersect(self::companiesOf($a), self::companiesOf($b)) !== [],
            'shipment' => self::shareShipment($a, $b),
            default    => false,
        };
    }

    /** A real user of that role (admin team id 0 always exists). */
    private static function exists(array $who): bool
    {
        if ($who['role'] === 'admin') {
            return $who['id'] === 0;
        }
        $q = User::whereKey($who['id'])->where('role', self::dbRole($who['role']));
        if ($who['role'] !== 'buyer' && $who['role'] !== 'rider') {
            $q->where('status', 'approved');
        }

        return $q->exists();
    }

    private static function dbRole(string $role): string
    {
        return $role === 'logistics' ? 'logistics_staff' : $role;
    }

    /**
     * Courier company ids an identity belongs to.
     * @return int[]
     */
    public static function companiesOf(array $who): array
    {
        $personnel = fn () => CourierPersonnel::where('user_id', $who['id'])->where('status', 'active')
            ->pluck('courier_id')->map(fn ($v) => (int) $v)->all();

        return array_values(array_unique(match ($who['role']) {
            'courier'   => [(int) $who['id']],
            'logistics' => ($c = (int) User::whereKey($who['id'])->value('courier_company_id')) > 0 ? [$c] : $personnel(),
            'rider'     => $personnel(),
            default     => [],
        }));
    }

    /** Seller side + courier/logistics side: a shipment of the seller's item by that company. */
    private static function shareShipment(array $a, array $b): bool
    {
        [$seller, $other] = $a['role'] === 'seller' ? [$a, $b] : [$b, $a];
        if ($seller['role'] !== 'seller') {
            return false;
        }
        $companies = self::companiesOf($other);

        return $companies !== [] && ShipmentAssignment::whereIn('courier_id', $companies)
            ->whereIn('order_id', OrderItem::where('seller_id', $seller['id'])->select('order_id'))->exists();
    }

    /**
     * Ids of $role accounts belonging to the given courier companies.
     * @param int[] $companies
     */
    private static function membersOf(string $role, array $companies): array
    {
        if ($companies === []) {
            return [];
        }

        return match ($role) {
            'courier'   => $companies,
            'logistics' => User::where('role', 'logistics_staff')
                ->where(fn ($q) => $q->whereIn('courier_company_id', $companies)
                    ->orWhereIn('id', CourierPersonnel::whereIn('courier_id', $companies)->where('status', 'active')->select('user_id')))
                ->pluck('id')->all(),
            'rider'     => CourierPersonnel::whereIn('courier_id', $companies)->where('status', 'active')
                ->whereNotNull('user_id')->pluck('user_id')->all(),
            default     => [],
        };
    }

    /** Avatar URL of a participant (null for the admin team / no picture). */
    public static function photoOf(array $who): ?string
    {
        if ($who['role'] === 'admin') {
            return null;
        }

        return \App\Support\AvatarUrl::forUser(User::find($who['id']));
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
        $users = fn (string $role) => User::where('role', self::dbRole($role))
            ->when($role !== 'buyer' && $role !== 'rider', fn ($x) => $x->where('status', 'approved'))
            ->when($like, fn ($x) => $x->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('business_name', 'like', $like)
                ->orWhere('company_name', 'like', $like)->orWhere('email', 'like', $like)))
            ->orderBy('id')->limit(30)->pluck('id');

        // Built only from MATRIX — no per-role branches.
        foreach (self::MATRIX[$me['role']] ?? [] as $role => $scope) {
            if ($role === 'admin') {
                $out[] = ['role' => 'admin', 'id' => 0, 'name' => 'mimoo Admin'];
                continue;
            }
            $ids = match ($scope) {
                'any'      => $users($role),
                'company'  => self::membersOf($role, self::companiesOf($me)),
                'shipment' => $me['role'] === 'seller'
                    // seller -> courier/logistics of companies that shipped my items
                    ? self::membersOf($role, ShipmentAssignment::whereIn('order_id', OrderItem::where('seller_id', $me['id'])->select('order_id'))
                        ->distinct()->pluck('courier_id')->map(fn ($v) => (int) $v)->all())
                    // courier/logistics -> sellers whose items my company shipped
                    : OrderItem::whereIn('order_id', ShipmentAssignment::whereIn('courier_id', self::companiesOf($me))->select('order_id'))
                        ->whereNotNull('seller_id')->distinct()->pluck('seller_id'),
                default    => [],
            };
            $add($role, $ids);
        }

        // Search for the relationship-scoped lists (the "any" lists are searched in SQL).
        if ($q !== '') {
            $out = array_filter($out, fn ($c) => $c['role'] === 'admin' || stripos($c['name'], $q) !== false
                || self::scopeOf($me['role'], $c['role']) === 'any');
        }

        // drop anything the rules would refuse (e.g. a deactivated rider) and myself
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
