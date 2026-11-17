<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Services\SupportAttachmentService;
use App\Services\SupportTicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin support tickets (admin.verified session).
 *   GET  /admin/support                     page
 *   GET  /admin/support/feed?status=        list (open | in_progress | resolved | all)
 *   GET  /admin/support/{id}                ticket + thread
 *   POST /admin/support/{id}/reply          {body}
 *   POST /admin/support/{id}/status         {status}
 */
class SupportTicketsController extends Controller
{
    public function page(): Response
    {
        return Inertia::render('admin/SupportTickets');
    }

    public function feed(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'open');
        $q = SupportTicket::with('user:id,name,first_name,last_name,business_name,company_name,email')
            ->withCount('replies')->where('target', 'admin')->latest('updated_at');
        if (in_array($status, SupportTicketService::STATUSES, true)) {
            $q->where('status', $status);
        }
        $rows = $q->limit(200)->get()->map(fn (SupportTicket $t) => $this->row($t) + ['replies_count' => (int) $t->replies_count]);
        $counts = SupportTicket::where('target', 'admin')->select('status', DB::raw('COUNT(*) c'))->groupBy('status')->pluck('c', 'status');

        return response()->json(['data' => $rows, 'counts' => [
            'open' => (int) ($counts['open'] ?? 0), 'in_progress' => (int) ($counts['in_progress'] ?? 0), 'resolved' => (int) ($counts['resolved'] ?? 0), 'closed' => (int) ($counts['closed'] ?? 0),
        ]]);
    }

    public function show(int $id): JsonResponse
    {
        $t = SupportTicket::with(['user:id,name,first_name,last_name,business_name,company_name,email', 'replies'])->find($id);
        if (! $t) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        $files = SupportAttachmentService::grouped((int) $t->id);

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

        return DB::transaction(function () use ($id, $v, $request) {
            $t = SupportTicket::lockForUpdate()->find($id);
            if (! $t) {
                return response()->json(['message' => 'Ticket not found.'], 404);
            }
            $reply = SupportTicketService::adminReply($t, $v->validated()['body']);
            SupportAttachmentService::store($t, (int) $reply->id, null, (array) $request->file('attachments', []));

            return response()->json(['message' => 'Reply sent.', 'status' => $t->status], 201);
        });
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $v = Validator::make($request->all(), ['status' => 'required|in:' . implode(',', SupportTicketService::STATUSES)]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }

        return DB::transaction(function () use ($id, $v) {
            $t = SupportTicket::lockForUpdate()->find($id);
            if (! $t) {
                return response()->json(['message' => 'Ticket not found.'], 404);
            }
            $changed = SupportTicketService::setStatus($t, $v->validated()['status']);

            return response()->json(['message' => $changed ? 'Status updated.' : 'No change.', 'status' => $t->status]);
        });
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
            'subject'        => $t->subject,
            'message'        => $t->message,
            'status'         => $t->status,
            'created_at'     => $t->created_at?->toISOString(),
            'updated_at'     => $t->updated_at?->toISOString(),
            'last_reply_at'  => $t->last_reply_at?->toISOString(),
        ];
    }
}
