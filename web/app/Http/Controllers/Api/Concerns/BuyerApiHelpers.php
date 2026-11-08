<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Shared helpers for the buyer mobile API controllers:
 *   - buyer-only guard (403)
 *   - JPG/PNG image upload validated by file CONTENT, max 5 MB, random filename
 *   - safe image serving (no path traversal, strict filename pattern, CORS + Cache-Control)
 */
trait BuyerApiHelpers
{
    protected function buyerGuard(Request $request): ?JsonResponse
    {
        if ($request->user()?->account_type !== 'buyer') {
            return response()->json(['message' => 'Only buyer accounts can access this endpoint.'], 403);
        }
        return null;
    }

    protected function validationError(string $field, string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors'  => [$field => [$message]],
        ], 422);
    }

    /**
     * Returns an error message when the file is not an acceptable image,
     * or null when it is OK.
     */
    protected function imageError(?UploadedFile $file): ?string
    {
        if (! $file || ! $file->isValid()) {
            return 'Image upload failed. Please try again.';
        }
        if ($file->getSize() > 5 * 1024 * 1024) {
            return 'Each image must not be larger than 5 MB.';
        }
        // getMimeType() inspects file content (finfo), not the extension.
        if (! in_array($file->getMimeType(), ['image/jpeg', 'image/png'], true)) {
            return 'Only JPG and PNG images are accepted.';
        }
        $info = @getimagesize($file->getRealPath());
        if ($info === false || ! in_array($info[2] ?? null, [IMAGETYPE_JPEG, IMAGETYPE_PNG], true)) {
            return 'Only JPG and PNG images are accepted.';
        }
        return null;
    }

    /** Stores an already-validated image and returns its relative path. */
    protected function storeImage(UploadedFile $file, string $folder, string $prefix): string
    {
        $ext      = $file->getMimeType() === 'image/png' ? 'png' : 'jpg';
        $filename = $prefix . '_' . Str::random(32) . '.' . $ext;
        Storage::disk('public')->putFileAs($folder, $file, $filename);
        return $folder . '/' . $filename;
    }

    protected function imageUrlFor(?string $path, string $routeSegment): ?string
    {
        if (empty($path)) {
            return null;
        }
        return url('/api/buyer/' . $routeSegment . '/' . basename($path));
    }

    protected function serveStoredImage(string $folder, string $prefix, string $filename): Response
    {
        if (preg_match('/[\/\\\\]|\.\./', $filename) || $filename !== basename($filename)) {
            abort(404);
        }
        if (! preg_match('/^' . preg_quote($prefix, '/') . '_[A-Za-z0-9]{32}\.(jpg|png)$/', $filename)) {
            abort(404);
        }

        $path = $folder . '/' . $filename;
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $contents = Storage::disk('public')->get($path);
        $etag     = '"' . md5($contents) . '"';

        if (request()->header('If-None-Match') === $etag) {
            return response('', 304);
        }

        return response($contents, 200, [
            'Content-Type'                => str_ends_with($filename, '.png') ? 'image/png' : 'image/jpeg',
            'Cache-Control'               => 'public, max-age=86400',
            'ETag'                        => $etag,
            'X-Content-Type-Options'      => 'nosniff',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
