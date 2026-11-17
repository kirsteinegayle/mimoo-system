<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Services\SupportAttachmentService;
use App\Services\SupportTicketService;
use App\Support\PortalRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Logistics Support and Courier Support queues (web session). Same ticket system as the admin
 * queue (A5 routing): a logistics company sees tickets routed to "logistics", a courier company
 * tickets routed to "courier". A ticket linked to an order is only visible to the company that
 * handles that order; tickets without an order are visible to every company of that queue.
 *
 *   GET  /staff-support/feed?status=      list + counts
 *   GET  /staff-support/{id}              ticket + thread
 *   POST /staff-support/{id}/reply        {body}
 *   POST /staff-support/{id}/status       {status}
 */
class StaffSupportController extends Controller
{
    private function target(Request $request): ?string
    {
        return match (PortalRole::roleOf($request->user())) {
            'logistics_staff' => 'logistics',
            'courier' => 'courier',
            default => null,
        };
    }

    /** Tickets of this queue that this company may see. */
    private function scoped(Request $request)
    {
        $me = (int) $request->user()->id;
        $target = $this->target($request);
        $orderCol = $target === 'logistics' ? 'logistics_id' : 'assigned_courier_id';

        return SupportTicket::where('target', $target)
            ->where(fn ($q) => $q->whereNull('order_id')
                ->orWhereIn('order_id', DB::table('orders')->where($orderCol, $me)->select('id')));
    }

    public function feed(Request $request): JsonResponse
    {
        if (! $this->target($request)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $status = (string) $request->query('status', 'all');
        $q = $this->scoped($request)->with('user:id,name,first_name,last_name,business_name,company_name,email')->latest('updated_at');
        if (in_array($status, SupportTicketService::STATUSES, true)) {
            $q->where('status', $status);
        }
        $counts = $this->scoped($request)->select('status', DB::raw('COUNT(*) c'))->groupBy('status')->pluck('c', 'status');

        return response()->json([
            'data' => $q->limit(200)->get()->map(fn (SupportTicket $t) => $this->row($t)),
            'counts' => collect(SupportTicketService::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($counts[$s] ?? 0)]),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $t = $this->find($request, $id);
        if (! $t) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        $files = SupportAttachmentService::grouped((int) $t->id, $request);

        return response()->json(['data' => $this->row($t) + [
            'attachments' => $files[0] ?? [],
            'replies' => $t->replies->map(fn (SupportTicketReply $r) => [
                'id' => $r->id, 'from' => $r->author_type, 'body' => $r->body, 'attachments' => $files[$r->id] ?? [], 'created_at' => $r->created_at?->toISOString(),
            ])->values(),
        ]]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $v = Validator::make($request->all(), SupportTicketService::replyRules() + SupportAttachmentService::rules(), SupportAttachmentService::messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }

        return DB::transaction(function () use ($request, $id, $v) {
            $t = $this->find($request, $id, true);
            if (! $t) {
                return response()->json(['message' => 'Ticket not found.'], 404);
            }
            $reply = SupportTicketService::adminReply($t, $v->validated()['body'], $t->target, (int) $request->user()->id);
            SupportAttachmentService::store($t, (int) $reply->id, (int) $request->user()->id, (array) $request->file('attachments', []));

            return response()->json(['message' => 'Reply sent.', 'status' => $t->status], 201);
        });
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $v = Validator::make($request->all(), ['status' => 'required|in:' . implode(',', SupportTicketService::STATUSES)]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }

        return DB::transaction(function () use ($request, $id, $v) {
            $t = $this->find($request, $id, true);
            if (! $t) {
                return response()->json(['message' => 'Ticket not found.'], 404);
            }
            $changed = SupportTicketService::setStatus($t, $v->validated()['status']);

            return response()->json(['message' => $changed ? 'Status updated.' : 'No change.', 'status' => $t->status]);
        });
    }

    /** Used by SupportAttachmentController: may this staff user see the ticket (right queue, own company)? */
    public function canSee(Request $request, int $ticketId): bool
    {
        return $this->target($request) !== null && $this->scoped($request)->where('id', $ticketId)->exists();
    }

    private function find(Request $request, int $id, bool $lock = false): ?SupportTicket
    {
        if (! $this->target($request)) {
            return null;
        }
        $q = $this->scoped($request)->with(['user:id,name,first_name,last_name,business_name,company_name,email', 'replies'])->where('id', $id);

        return ($lock ? $q->lockForUpdate() : $q)->first();
    }

    private function row(SupportTicket $t): array
    {
        $u = $t->user;

        return [
            'id'             => $t->id,
            'user_role'      => $t->user_role,
            'user_name'      => $u ? (trim(($u->business_name ?: $u->company_name ?: '') ?: trim($u->first_name . ' ' . $u->last_name)) ?: $u->name) : 'Deleted user',
            'user_email'     => $u?->email,
            'category'       => $t->category,
            'category_label' => SupportTicketService::CATEGORIES[$t->category] ?? $t->category,
            'order_id'       => $t->order_id,
            'order_number'   => $t->order_id ? 'MIM-' . str_pad((string) $t->order_id, 8, '0', STR_PAD_LEFT) : null,
            'subject'        => $t->subject,
            'message'        => $t->message,
            'status'         => $t->status,
            'created_at'     => $t->created_at?->toISOString(),
            'updated_at'     => $t->updated_at?->toISOString(),
        ];
    }
}
