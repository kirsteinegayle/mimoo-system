<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * ONE place that turns a stored profile picture into a URL the web pages and
 * the Flutter apps (incl. Flutter Web, which needs CORS) can load.
 *
 * Stored values are never rewritten. Old/odd values are normalised in code:
 *   'buyer_photos/x.png', '/storage/buyer_photos/x.png', 'public/buyer_photos/x.png',
 *   'http://localhost/storage/buyer_photos/x.png', 'http://127.0.0.1:8000/storage/...',
 *   'https://mimoo-market.shop/storage/...'  -> relative public-disk path.
 * External https URLs on other hosts (e.g. a Google avatar) are returned as-is.
 *
 * Every URL is built with url() = the CURRENT request host + scheme (the
 * tunnel domain on the live site, 10.0.2.2 / 127.0.0.1 for local apps), never
 * a hostname stored in the DB. Missing files / non-images give null so the UI
 * shows the initials fallback instead of a broken image.
 *
 * Served through the existing CORS endpoints:
 *   buyer_photos/*            -> /api/buyer/buyer/profile-photo/{file}
 *   store_photos/profiles/*   -> /api/buyer/seller-photo/profile/{file}
 *   riders/profile_pictures/* -> /api/avatar/rider/{file}
 */
final class AvatarUrl
{
    /** Hosts whose absolute URLs are treated as "ours" (path is kept, host dropped). */
    private const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '10.0.2.2', '::1', '[::1]'];

    private const IMAGE_EXT = '/\.(jpe?g|png)$/i';

    /** Relative public-disk path, an external https URL (prefixed 'ext:'), or null. */
    public static function normalize(?string $raw): ?string
    {
        $v = trim((string) $raw);
        if ($v === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $v)) {
            $host = strtolower((string) parse_url($v, PHP_URL_HOST));
            $path = (string) parse_url($v, PHP_URL_PATH);
            if (! self::isOurHost($host)) {
                return str_starts_with(strtolower($v), 'https://') ? 'ext:' . $v : null;
            }
            $v = $path;
            // Old absolute links to our own serving routes.
            if (preg_match('#/api/buyer/seller-photo/profile/([^/]+)$#', $v, $m)) {
                return 'store_photos/profiles/' . $m[1];
            }
            if (preg_match('#/api/buyer/buyer/profile-photo/([^/]+)$#', $v, $m)) {
                return 'buyer_photos/' . $m[1];
            }
            if (preg_match('#/api/avatar/rider/([^/]+)$#', $v, $m)) {
                return 'riders/profile_pictures/' . $m[1];
            }
        }

        $v = str_replace('\\', '/', $v);
        $v = ltrim($v, '/');
        foreach (['storage/', 'public/', 'app/public/'] as $prefix) {
            if (str_starts_with($v, $prefix)) {
                $v = substr($v, strlen($prefix));
            }
        }
        if ($v === '' || str_contains($v, '..')) {
            return null;
        }

        return $v;
    }

    /** URL for a stored value, or null (=> show initials). */
    public static function fromPath(?string $raw): ?string
    {
        $rel = self::normalize($raw);
        if ($rel === null) {
            return null;
        }
        if (str_starts_with($rel, 'ext:')) {
            return substr($rel, 4);
        }

        $file = basename($rel);
        $dir  = trim(dirname($rel), '/');
        if (! preg_match(self::IMAGE_EXT, $file) || ! preg_match('/^[A-Za-z0-9._-]+$/', $file)) {
            return null; // e.g. a rider "profile picture" uploaded as PDF
        }
        if (! Storage::disk('public')->exists($dir . '/' . $file)) {
            return null;
        }

        return match ($dir) {
            'buyer_photos'            => url('/api/buyer/buyer/profile-photo/' . $file),
            'store_photos/profiles'   => url('/api/buyer/seller-photo/profile/' . $file),
            'riders/profile_pictures' => url('/api/avatar/rider/' . $file),
            default                   => null, // anything else is not served
        };
    }

    /**
     * Profile picture of any user: users.profile_photo first; rider accounts
     * fall back to the picture from their approved rider application
     * (riders.email = users.email, same rule as the rider-app vehicle info).
     */
    public static function forUser(?User $user): ?string
    {
        if (! $user) {
            return null;
        }
        $url = self::fromPath($user->profile_photo ?? null);
        if ($url !== null || ($user->role ?? null) !== 'rider') {
            return $url;
        }
        $email = strtolower(trim((string) $user->email));
        if ($email === '') {
            return null;
        }
        $pic = \App\Models\Rider::whereRaw('LOWER(email) = ?', [$email])
            ->whereNotNull('profile_picture')
            ->orderByRaw("verification_status = 'approved' DESC")
            ->latest('id')
            ->value('profile_picture');

        return self::fromPath($pic);
    }

    /** Up to two initials for the fallback circle ('?' when no name). */
    public static function initials(?string $name): string
    {
        $parts = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (! $parts) {
            return '?';
        }
        $first = mb_substr($parts[0], 0, 1);
        $last  = count($parts) > 1 ? mb_substr(end($parts), 0, 1) : '';

        return mb_strtoupper($first . $last);
    }

    private static function isOurHost(string $host): bool
    {
        if ($host === '' || in_array($host, self::LOCAL_HOSTS, true)) {
            return true;
        }
        $appHost = strtolower((string) parse_url((string) config('app.url'), PHP_URL_HOST));
        if ($host === $appHost) {
            return true;
        }
        try {
            $reqHost = request()?->getHost();
        } catch (\Throwable) {
            $reqHost = null;
        }

        return $reqHost !== null && $host === strtolower($reqHost);
    }
}
