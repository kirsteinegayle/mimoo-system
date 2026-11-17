<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves a ticket attachment to people who may see the ticket: its owner, the admin session, or staff of the
 * queue it was routed to (logistics / courier, scoped like StaffSupportController). Everyone else gets 404.
 */
class SupportAttachmentController extends Controller
{
    public function show(Request $request, int $id): Response
    {
        $a = DB::table('support_ticket_attachments')->where('id', $id)->first();
        $ticket = $a ? SupportTicket::find($a->ticket_id) : null;
        abort_unless($a && $ticket && $this->allowed($request, $ticket), 404);
        abort_unless(Storage::disk('local')->exists($a->path), 404);

        $safe = in_array($a->mime, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], true) ? $a->mime : 'application/octet-stream';

        return Storage::disk('local')->response($a->path, $a->original_name, [
            'Content-Type' => $safe,
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=3600',
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:",
        ], $request->boolean('download') ? 'attachment' : 'inline');
    }

    private function allowed(Request $request, SupportTicket $ticket): bool
    {
        if ($request->is('admin/*')) {
            return $request->session()->get('admin_verified') === true;
        }
        $user = $request->user();
        if (! $user) {
            return false;
        }
        if ((int) $ticket->user_id === (int) $user->id) {
            return true;
        }

        return app(StaffSupportController::class)->canSee($request, (int) $ticket->id);
    }
}
