<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use App\Services\MessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Role-to-role messaging (admin, seller, courier, logistics, rider, buyer-with-admin).
 * One controller, mounted three times with the same JSON:
 *   web session     /messaging/*          seller, courier, logistics (and buyer)
 *   admin session   /admin/messaging/*    master-code admin (identity admin:0)
 *   Sanctum apps    /api/rider-app/messaging/*, /api/courier-app/messaging/*
 *
 *   GET  contacts               allowed counterparts (MessagingService rules)
 *   GET  threads                my conversations (+ meta.unread_total)
 *   POST start {role,id}        get-or-create; 403 for a pair that is not allowed
 *   GET  threads/{id}/messages  participant only (404 otherwise), ?after_id= for polling (5 s), marks read
 *   POST threads/{id}/messages  {body<=500 and/or image}
 *   POST threads/{id}/read
 *   GET  messages/{id}/image
 */
class MessagingController extends Controller
{
    use BuyerApiHelpers;

    private const FOLDER = 'conversation_images';
    private const PREFIX = 'conv';

    /** @return array{role:string,id:int}|null */
    private function me(Request $request): ?array
    {
        if ($request->is('admin/*')) {
            return MessagingService::ADMIN; // route is behind admin.verified
        }
        $user = $request->user();

        return $user ? MessagingService::identityOf($user) : null;
    }

    private function deny(): JsonResponse
    {
        return response()->json(['message' => 'Messaging is not available for this account.'], 403);
    }

    private function base(Request $request): string
    {
        return url('/' . explode('/messaging', $request->path())[0] . '/messaging');
    }

    private function mine(Request $request, int $id, array $me): ?Conversation
    {
        $conv = Conversation::find($id);

        return $conv && MessagingService::participant($conv, $me) ? $conv : null;
    }

    private function formatMessage(ConversationMessage $m, array $me, ?ConversationParticipant $other, string $base): array
    {
        $mine = $m->sender_role === $me['role'] && (int) $m->sender_user_id === $me['id'];

        return [
            'id'         => $m->id,
            'thread_id'  => $m->conversation_id,
            'is_mine'    => $mine,
            'body'       => $m->body,
            'image_url'  => $m->image_path ? "{$base}/messages/{$m->id}/image" : null,
            'read_at'    => $mine && $other && (int) $other->last_read_message_id >= $m->id ? $m->created_at?->toISOString() : null,
            'created_at' => $m->created_at?->toISOString(),
        ];
    }

    private function formatThread(Conversation $c, array $me): array
    {
        $other = MessagingService::counterpart($c, $me);
        $last  = ConversationMessage::where('conversation_id', $c->id)->latest('id')->first();
        $who   = $other ? ['role' => $other->role, 'id' => (int) $other->user_id] : null;

        return [
            'id'                => $c->id,
            'counterpart_name'  => $who ? MessagingService::nameOf($who) : 'Unknown',
            'counterpart_role'  => $who['role'] ?? null,
            'last_message'      => $last ? ['id' => $last->id, 'body' => $last->body ?? ($last->image_path ? 'Photo' : null), 'created_at' => $last->created_at?->toISOString()] : null,
            'last_message_at'   => $c->last_message_at?->toISOString(),
            'unread_count'      => MessagingService::unread($c->id, $me),
        ];
    }

    public function contacts(Request $request): JsonResponse
    {
        if (! $me = $this->me($request)) return $this->deny();

        return response()->json(['data' => MessagingService::contacts($me, trim((string) $request->query('q', '')))]);
    }

    public function threads(Request $request): JsonResponse
    {
        if (! $me = $this->me($request)) return $this->deny();

        $ids = ConversationParticipant::where('role', $me['role'])->where('user_id', $me['id'])->pluck('conversation_id');
        $data = Conversation::whereIn('id', $ids)->whereHas('messages')->orderByDesc('last_message_at')->orderByDesc('id')->get()
            ->map(fn ($c) => $this->formatThread($c, $me))->values();

        return response()->json(['data' => $data, 'meta' => ['unread_total' => $data->sum('unread_count')]]);
    }

    public function start(Request $request): JsonResponse
    {
        if (! $me = $this->me($request)) return $this->deny();

        $data = $request->validate([
            'role' => ['required', 'string', 'in:admin,seller,courier,logistics,rider,buyer'],
            'id'   => ['required', 'integer', 'min:0'],
        ]);
        $them = ['role' => $data['role'], 'id' => (int) $data['id']];
        if (! MessagingService::canMessage($me, $them)) {
            return response()->json(['message' => 'You cannot message this account.'], 403);
        }
        $conv = MessagingService::open($me, $them);

        return response()->json(['data' => $this->formatThread($conv, $me)], 201);
    }

    public function messages(Request $request, int $id): JsonResponse
    {
        if (! $me = $this->me($request)) return $this->deny();
        if (! $conv = $this->mine($request, $id, $me)) {
            return response()->json(['message' => 'Conversation not found.'], 404);
        }

        $after = max(0, (int) $request->query('after_id', 0));
        $rows  = ConversationMessage::where('conversation_id', $conv->id)
            ->when($after > 0, fn ($q) => $q->where('id', '>', $after))
            ->orderByDesc('id')->limit(100)->get()->reverse()->values();
        MessagingService::markRead($conv, $me);
        $other = MessagingService::counterpart($conv, $me);
        $base  = $this->base($request);

        return response()->json([
            'data'   => $rows->map(fn ($m) => $this->formatMessage($m, $me, $other, $base))->values(),
            'thread' => ['id' => $conv->id, 'name' => $other ? MessagingService::nameOf(['role' => $other->role, 'id' => (int) $other->user_id]) : 'Unknown', 'product' => null],
            'meta'   => ['unread_total' => MessagingService::unreadTotal($me)],
        ]);
    }

    public function send(Request $request, int $id): JsonResponse
    {
        if (! $me = $this->me($request)) return $this->deny();
        if (! $conv = $this->mine($request, $id, $me)) {
            return response()->json(['message' => 'Conversation not found.'], 404);
        }
        // The pair rules are checked again on every send (e.g. a rider removed from the company).
        $other = MessagingService::counterpart($conv, $me);
        if (! $other || ! MessagingService::canMessage($me, ['role' => $other->role, 'id' => (int) $other->user_id])) {
            return response()->json(['message' => 'You can no longer message this account.'], 403);
        }

        $body     = $request->input('body');
        $body     = is_string($body) ? trim($body) : null;
        $hasImage = $request->hasFile('image');
        if (($body === null || $body === '') && ! $hasImage) {
            return $this->validationError('body', 'Message cannot be empty.');
        }
        if ($body !== null && mb_strlen($body) > MessagingService::BODY_MAX) {
            return $this->validationError('body', 'Message must not exceed ' . MessagingService::BODY_MAX . ' characters.');
        }
        $path = null;
        if ($hasImage) {
            if ($msg = $this->imageError($request->file('image'))) {
                return $this->validationError('image', $msg);
            }
            $path = $this->storeImage($request->file('image'), self::FOLDER, self::PREFIX);
        }

        $m = MessagingService::send($conv, $me, $body, $path);

        return response()->json(['data' => $this->formatMessage($m, $me, MessagingService::counterpart($conv, $me), $this->base($request))], 201);
    }

    public function read(Request $request, int $id): JsonResponse
    {
        if (! $me = $this->me($request)) return $this->deny();
        if (! $conv = $this->mine($request, $id, $me)) {
            return response()->json(['message' => 'Conversation not found.'], 404);
        }
        $marked = MessagingService::markRead($conv, $me);

        return response()->json(['data' => ['marked' => $marked], 'meta' => ['unread_total' => MessagingService::unreadTotal($me)]]);
    }

    public function image(Request $request, int $id)
    {
        if (! $me = $this->me($request)) return $this->deny();
        $m = ConversationMessage::find($id);
        if (! $m || ! $m->image_path || ! MessagingService::participant($m->conversation_id, $me)) {
            abort(404);
        }
        $name = basename($m->image_path);
        if (! preg_match('/^conv_[A-Za-z0-9]{32}\.(jpg|png)$/', $name) || ! Storage::disk('public')->exists(self::FOLDER . '/' . $name)) {
            abort(404);
        }

        return response(Storage::disk('public')->get(self::FOLDER . '/' . $name), 200, [
            'Content-Type'           => str_ends_with($name, '.png') ? 'image/png' : 'image/jpeg',
            'Cache-Control'          => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
