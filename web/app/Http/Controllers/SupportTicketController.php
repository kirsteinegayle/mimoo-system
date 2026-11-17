<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Services\SupportAttachmentService;
use App\Services\SupportTicketService;
use App\Services\UserNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Submitter side of support tickets. Same JSON for web (session) and the apps (Sanctum):
 *   GET  .../support/tickets              own tickets
 *   POST .../support/tickets              {category, subject, message}
 *   GET  .../support/tickets/{id}         own ticket + replies (404 if not yours)
 *   POST .../support/tickets/{id}/replies {body}
 * Pages: /support (buyer), /seller/support (seller).
 */
class SupportTicketController extends Controller
{
    public function buyerPage(): Response
    {
        return Inertia::render('BuyerSupport', ['categories' => SupportTicketService::categoriesFor('buyer')]);
    }

    public function sellerPage(): Response
    {
        return Inertia::render('seller/SellerSupport', ['categories' => SupportTicketService::categoriesFor('seller')]);
    }

    public function index(Request $request): JsonResponse
    {
        if ($deny = $this->deny($request)) {
            return $deny;
        }
        $rows = SupportTicket::where('user_id', $request->user()->id)->latest('updated_at')->limit(100)->get()
            ->map(fn ($t) => SupportTicketService::present($t));

        return response()->json(['data' => $rows, 'meta' => ['categories' => SupportTicketService::categoriesFor(UserNotifier::roleOf($request->user()))]]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($deny = $this->deny($request)) {
            return $deny;
        }
        $v = Validator::make($request->all(), SupportTicketService::rules() + SupportAttachmentService::rules(), SupportAttachmentService::messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $user = $request->user();
        $res  = DB::transaction(function () use ($user, $v, $request) {
            $r = SupportTicketService::submit($user, UserNotifier::roleOf($user), $v->validated());
            if ($r['ticket']) {
                SupportAttachmentService::store($r['ticket'], null, (int) $user->id, (array) $request->file('attachments', []));
            }

            return $r;
        });

        return match ($res['error']) {
            SupportTicketService::ERR_DUPLICATE => response()->json(['message' => 'You already have an open ticket with this subject. Please add a reply to it instead.'], 409),
            SupportTicketService::ERR_TOO_MANY  => response()->json(['message' => 'You have too many open tickets. Please wait for a reply on your current tickets.'], 429),
            SupportTicketService::ERR_CATEGORY  => response()->json(['message' => 'That category is not available for your account.'], 422),
            default => response()->json(['message' => 'Ticket sent. Our support team will reply soon.', 'data' => SupportTicketService::present($res['ticket'], true)], 201),
        };
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->deny($request)) {
            return $deny;
        }
        $t = SupportTicket::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (! $t) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        return response()->json(['data' => SupportTicketService::present($t, true)]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->deny($request)) {
            return $deny;
        }
        $v = Validator::make($request->all(), SupportTicketService::replyRules() + SupportAttachmentService::rules(), SupportAttachmentService::messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }

        return DB::transaction(function () use ($request, $id, $v) {
            $t = SupportTicket::where('id', $id)->where('user_id', $request->user()->id)->lockForUpdate()->first();
            if (! $t) {
                return response()->json(['message' => 'Ticket not found.'], 404);
            }
            $res = SupportTicketService::userReply($t, $request->user(), $v->validated()['body']);
            if ($res['error']) {
                return response()->json(['message' => 'This ticket is resolved. Please open a new ticket.'], 409);
            }

            SupportAttachmentService::store($t, (int) $res['reply']->id, (int) $request->user()->id, (array) $request->file('attachments', []));

            return response()->json(['message' => 'Reply sent.', 'data' => SupportTicketService::present($t->fresh(), true)], 201);
        });
    }

    private function deny(Request $request): ?JsonResponse
    {
        $u = $request->user();

        return ($u && UserNotifier::roleOf($u) !== null) ? null
            : response()->json(['message' => 'Support tickets are for buyer, seller, rider and courier accounts.'], 403);
    }
}
