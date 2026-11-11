<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyerNotification;
use App\Models\CourierPersonnel;
use App\Models\DeliveryJob;
use App\Models\DeliveryMessage;
use App\Models\Order;
use App\Models\RiderNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Rider <-> buyer text chat for one delivery job (polling, no websocket).
 *
 * Rider (Sanctum + rider.role):
 *   GET  /api/rider-app/jobs/{id}/messages?after_id=   id = delivery_jobs.id
 *   POST /api/rider-app/jobs/{id}/messages            { body }
 *   POST /api/rider-app/jobs/{id}/messages/read
 *
 * Buyer (Sanctum, account_type = buyer):
 *   GET  /api/buyer/orders/{id}/chat?after_id=         id = orders.id (latest job)
 *   POST /api/buyer/orders/{id}/chat                   { body }
 *   POST /api/buyer/orders/{id}/chat/read
 *
 * Access: only the job's rider (same rule as RiderDeliveryController: own
 * rider_user_id + own active courier_personnel row) and only the order's
 * buyer; anyone else gets 403. Sending is allowed while the job is assigned
 * or out_for_delivery; after that the chat is read-only.
 *
 * Writes: delivery_messages, plus one additive notification for the other
 * side (rider_notifications / buyer_notifications). Never touches orders.
 */
class DeliveryChatController extends Controller
{
    /** Job statuses where both sides can still send messages. */
    public const OPEN_STATUSES = [DeliveryJob::STATUS_ASSIGNED, DeliveryJob::STATUS_OUT_FOR_DELIVERY];

    /** Max messages returned per poll. */
    private const PAGE = 100;

    // ── Rider ────────────────────────────────────────────────────────────────

    public function riderIndex(Request $request, int $id): JsonResponse
    {
        [$job, $error] = $this->riderJob($request, $id);
        return $error ?? $this->list($request, $job, DeliveryMessage::ROLE_RIDER);
    }

    public function riderSend(Request $request, int $id): JsonResponse
    {
        [$job, $error] = $this->riderJob($request, $id);
        return $error ?? $this->send($request, $job, DeliveryMessage::ROLE_RIDER);
    }

    public function riderRead(Request $request, int $id): JsonResponse
    {
        [$job, $error] = $this->riderJob($request, $id);
        return $error ?? $this->markRead($job, DeliveryMessage::ROLE_RIDER);
    }

    // ── Buyer ────────────────────────────────────────────────────────────────

    public function buyerIndex(Request $request, int $id): JsonResponse
    {
        [$job, $error] = $this->buyerJob($request, $id);
        return $error ?? $this->list($request, $job, DeliveryMessage::ROLE_BUYER);
    }

    public function buyerSend(Request $request, int $id): JsonResponse
    {
        [$job, $error] = $this->buyerJob($request, $id);
        return $error ?? $this->send($request, $job, DeliveryMessage::ROLE_BUYER);
    }

    public function buyerRead(Request $request, int $id): JsonResponse
    {
        [$job, $error] = $this->buyerJob($request, $id);
        return $error ?? $this->markRead($job, DeliveryMessage::ROLE_BUYER);
    }

    // ── Shared ───────────────────────────────────────────────────────────────

    private function list(Request $request, DeliveryJob $job, string $me): JsonResponse
    {
        $afterId = max(0, (int) $request->query('after_id', 0));

        $query = DeliveryMessage::where('delivery_job_id', $job->id);
        $messages = $afterId > 0
            ? $query->where('id', '>', $afterId)->orderBy('id')->limit(self::PAGE)->get()
            : $query->orderByDesc('id')->limit(self::PAGE)->get()->reverse()->values();

        return $this->noStore([
            'data' => $messages->map(fn (DeliveryMessage $m) => $this->row($m, $me))->values(),
            'meta' => $this->meta($job, $me),
        ]);
    }

    private function send(Request $request, DeliveryJob $job, string $me): JsonResponse
    {
        $request->validate([
            'body' => ['required', 'string', 'max:' . DeliveryMessage::MAX_LENGTH],
        ], [
            'body.required' => 'Please type a message.',
            'body.max'      => 'Messages can be up to ' . DeliveryMessage::MAX_LENGTH . ' characters.',
        ]);

        $body = trim((string) $request->input('body'));
        if ($body === '') {
            return response()->json([
                'message' => 'Please type a message.',
                'errors'  => ['body' => ['Please type a message.']],
            ], 422);
        }

        if (! $this->isOpen($job)) {
            return response()->json([
                'message'    => 'This chat is closed. The delivery is no longer active.',
                'chat_open'  => false,
            ], 422);
        }

        $message = DeliveryMessage::create([
            'delivery_job_id' => $job->id,
            'sender_role'     => $me,
            'sender_id'       => $request->user()->id,
            'body'            => $body,
        ]);

        $this->notifyOtherSide($job, $message);

        return $this->noStore([
            'message' => 'Message sent.',
            'data'    => $this->row($message, $me),
            'meta'    => $this->meta($job, $me),
        ], 201);
    }

    /** Marks the OTHER side's unread messages as read. */
    private function markRead(DeliveryJob $job, string $me): JsonResponse
    {
        $marked = DeliveryMessage::where('delivery_job_id', $job->id)
            ->where('sender_role', '!=', $me)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->noStore(['data' => ['marked' => $marked]]);
    }

    private function notifyOtherSide(DeliveryJob $job, DeliveryMessage $message): void
    {
        $snippet = Str::limit($message->body, 80);

        if ($message->sender_role === DeliveryMessage::ROLE_RIDER) {
            $buyerId = Order::whereKey($job->order_id)->value('buyer_id');
            if (! $buyerId) {
                return;
            }
            try {
                BuyerNotification::create([
                    'buyer_id' => (int) $buyerId,
                    'type'     => 'delivery_chat',
                    'title'    => 'New message from your rider',
                    'body'     => $snippet,
                    'data'     => [
                        'order_id'        => $job->order_id,
                        'delivery_job_id' => $job->id,
                        'message_id'      => $message->id,
                    ],
                ]);
            } catch (\Throwable $e) {
                report($e); // a failed notification must not block the chat
            }
            return;
        }

        RiderNotification::notify((int) $job->rider_user_id, 'delivery_chat', 'New message from the buyer',
            $snippet, $job->id, $job->order_id);
    }

    private function row(DeliveryMessage $m, string $me): array
    {
        return [
            'id'          => $m->id,
            'sender_role' => $m->sender_role,
            'mine'        => $m->sender_role === $me,
            'body'        => $m->body,
            'read_at'     => $m->read_at?->toIso8601String(),
            'created_at'  => $m->created_at?->toIso8601String(),
        ];
    }

    private function meta(DeliveryJob $job, string $me): array
    {
        return [
            'delivery_job_id'  => $job->id,
            'order_id'         => $job->order_id,
            'job_status'       => $job->status,
            'can_send'         => $this->isOpen($job),
            'counterpart_name' => $me === DeliveryMessage::ROLE_RIDER ? $this->buyerName($job) : $this->riderFirstName($job),
        ];
    }

    private function isOpen(DeliveryJob $job): bool
    {
        return in_array($job->status, self::OPEN_STATUSES, true);
    }

    /** @return array{0: ?DeliveryJob, 1: ?JsonResponse} */
    private function riderJob(Request $request, int $id): array
    {
        $job = DeliveryJob::find($id);
        if (! $job) {
            return [null, response()->json(['message' => 'Delivery not found.'], 404)];
        }

        $user      = $request->user();
        $personnel = CourierPersonnel::where('user_id', $user->id)->where('status', 'active')->first();
        if (! $personnel || (int) $job->rider_user_id !== (int) $user->id || (int) $job->personnel_id !== (int) $personnel->id) {
            return [null, response()->json(['message' => 'You can only chat about your own deliveries.'], 403)];
        }

        return [$job, null];
    }

    /** @return array{0: ?DeliveryJob, 1: ?JsonResponse} */
    private function buyerJob(Request $request, int $id): array
    {
        $user = $request->user();
        if ($user->account_type !== 'buyer') {
            return [null, response()->json(['message' => 'Only buyers can access orders.'], 403)];
        }

        $order = Order::find($id, ['id', 'buyer_id']);
        if (! $order) {
            return [null, response()->json(['message' => 'Order not found.'], 404)];
        }
        if ((int) $order->buyer_id !== (int) $user->id) {
            return [null, response()->json(['message' => 'You can only chat about your own orders.'], 403)];
        }

        $job = DeliveryJob::where('order_id', $order->id)->latest('id')->first();
        if (! $job) {
            return [null, response()->json(['message' => 'No rider is assigned to this order yet.', 'reason' => 'no_delivery'], 404)];
        }

        return [$job, null];
    }

    private function buyerName(DeliveryJob $job): string
    {
        $order = Order::with('buyer:id,name')->find($job->order_id, ['id', 'buyer_id', 'shipping_name']);
        $name  = trim((string) ($order->shipping_name ?? $order?->buyer?->name ?? ''));
        return $name !== '' ? $name : 'Buyer';
    }

    private function riderFirstName(DeliveryJob $job): string
    {
        $rider = User::find($job->rider_user_id, ['id', 'first_name', 'name']);
        $first = trim((string) ($rider->first_name ?? ''));
        if ($first === '') {
            $first = trim((string) strtok(trim((string) ($rider->name ?? '')), ' '));
        }
        return $first !== '' ? $first : 'Your rider';
    }

    private function noStore(array $body, int $status = 200): JsonResponse
    {
        return response()->json($body, $status)->header('Cache-Control', 'no-store, private');
    }
}
