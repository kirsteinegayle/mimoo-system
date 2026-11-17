<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Streams a user's registration document from the private `local` disk
 * (root: storage/app/private). Uploads are stored there by CreateNewUser, so the
 * files are NOT reachable through the /storage symlink and must not be read via
 * storage_path('app/...') (that points one folder too high).
 */
class PrivateDocument
{
    /** User column => allowed. Anything else is rejected. */
    public const TYPES = [
        'id_document', 'business_permit', 'dti_registration', 'bir_2303', 'sec_certificate',
        'valid_id', 'proof_of_address', 'operating_permits', 'company_logo',
    ];

    public static function stream(User $user, string $type, bool $download = false): Response
    {
        abort_unless(in_array($type, self::TYPES, true), 404, 'Invalid document type.');

        $path = $user->{$type};
        $disk = Storage::disk('local');

        // Stored value is relative to the disk root; refuse traversal just in case.
        if (! is_string($path) || $path === '' || str_contains($path, '..') || ! $disk->exists($path)) {
            Log::warning('Document not found on private disk', ['user_id' => $user->id, 'type' => $type, 'path' => $path]);
            abort(404, 'Document not found.');
        }

        $name = basename($path);

        return $download ? $disk->download($path, $name) : $disk->response($path, $name);
    }
}
