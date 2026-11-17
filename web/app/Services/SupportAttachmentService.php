<?php

namespace App\Services;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Attachments on support tickets and replies: up to MAX_FILES images (jpg, png, webp) or PDFs, MAX_KB each.
 * Files go to the PRIVATE disk under a random name (the client's filename is only kept as a display label and is
 * never used as a path) and are served only through SupportAttachmentController, which checks who is asking.
 */
class SupportAttachmentService
{
    public const MAX_FILES = 3;

    public const MAX_KB = 5120;

    public const EXTENSIONS = 'jpg,jpeg,png,webp,pdf';

    public static function rules(): array
    {
        return [
            'attachments' => ['nullable', 'array', 'max:' . self::MAX_FILES],
            'attachments.*' => ['file', 'mimes:' . self::EXTENSIONS, 'mimetypes:image/jpeg,image/png,image/webp,application/pdf', 'max:' . self::MAX_KB],
        ];
    }

    public static function messages(): array
    {
        return [
            'attachments.max' => 'You can attach up to ' . self::MAX_FILES . ' files.',
            'attachments.*.mimes' => 'Attachments must be JPG, PNG, WEBP or PDF files.',
            'attachments.*.mimetypes' => 'Attachments must be JPG, PNG, WEBP or PDF files.',
            'attachments.*.max' => 'Each attachment must be ' . (self::MAX_KB / 1024) . ' MB or smaller.',
            'attachments.*.file' => 'One of the attachments could not be uploaded.',
        ];
    }

    /** @param  array<int, UploadedFile>  $files */
    public static function store(SupportTicket $ticket, ?int $replyId, ?int $userId, array $files): void
    {
        if (! Schema::hasTable('support_ticket_attachments')) {
            return;
        }
        foreach (array_slice($files, 0, self::MAX_FILES) as $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                continue;
            }
            $ext = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension());
            $path = $file->storeAs("support_attachments/{$ticket->id}", Str::random(32) . '.' . $ext, 'local');
            DB::table('support_ticket_attachments')->insert([
                'ticket_id' => $ticket->id, 'reply_id' => $replyId, 'user_id' => $userId, 'path' => $path,
                'original_name' => Str::limit(preg_replace('/[^\w.\- ()]/u', '_', $file->getClientOriginalName()), 100, ''),
                'mime' => (string) $file->getMimeType(), 'size' => (int) $file->getSize(), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    /** URL prefix of the download route for the surface that is asking (web, admin, or one of the app APIs). */
    public static function urlBase(?Request $request = null): string
    {
        $request ??= request();

        return match (true) {
            $request->is('admin/*') => '/admin/support/attachments/',
            $request->is('api/courier-app/*') => '/api/courier-app/support/attachments/',
            $request->is('api/rider-app/*') => '/api/rider-app/support/attachments/',
            $request->is('api/buyer/*') => '/api/buyer/support/attachments/',
            default => '/support/attachments/',
        };
    }

    /** @return array<int, array<int, array<string, mixed>>> attachments keyed by reply id (0 = the ticket itself) */
    public static function grouped(int $ticketId, ?Request $request = null): array
    {
        if (! Schema::hasTable('support_ticket_attachments')) {
            return [];
        }
        $base = self::urlBase($request);
        $out = [];
        foreach (DB::table('support_ticket_attachments')->where('ticket_id', $ticketId)->orderBy('id')->get() as $a) {
            $out[(int) ($a->reply_id ?? 0)][] = [
                'id' => $a->id, 'name' => $a->original_name, 'mime' => $a->mime, 'size' => (int) $a->size,
                'is_image' => str_starts_with($a->mime, 'image/'), 'url' => $base . $a->id,
            ];
        }

        return $out;
    }
}
