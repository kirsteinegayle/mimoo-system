<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

/**
 * GET /api/avatar/rider/{filename}
 * Rider profile pictures (riders/profile_pictures) with CORS, so Flutter Web and
 * the courier web pages can show them. Same files were already public under
 * /storage; this only adds CORS + caching. Images only, no path traversal.
 */
class AvatarController extends Controller
{
    public function rider(string $filename): Response
    {
        if ($filename !== basename($filename) || ! preg_match('/^[A-Za-z0-9_-]{1,80}\.(jpe?g|png)$/i', $filename)) {
            abort(404);
        }
        $path = 'riders/profile_pictures/' . $filename;
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $contents = Storage::disk('public')->get($path);
        if (@getimagesizefromstring($contents) === false) {
            abort(404);
        }
        $etag = '"' . md5($contents) . '"';
        if (request()->header('If-None-Match') === $etag) {
            return response('', 304);
        }

        return response($contents, 200, [
            'Content-Type'                => preg_match('/\.png$/i', $filename) ? 'image/png' : 'image/jpeg',
            'Cache-Control'               => 'public, max-age=86400',
            'ETag'                        => $etag,
            'X-Content-Type-Options'      => 'nosniff',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
