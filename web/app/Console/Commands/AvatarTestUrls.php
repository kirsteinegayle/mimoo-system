<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RollbackFlowHelpers;
use App\Models\CourierPersonnel;
use App\Models\Rider;
use App\Models\User;
use App\Support\AvatarUrl;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Rollback-only checks for profile pictures (App\Support\AvatarUrl):
 *  - helper: with / without picture, old localhost / 127.0.0.1 / APP_URL / '/storage/'
 *    values, external https, PDF, missing file, traversal, initials
 *  - URLs use the current host (never a host saved in the DB)
 *  - CORS serving endpoints answer 200 + Access-Control-Allow-Origin
 *  - APIs return the URL: buyer /profile, rider /me (rider-application fallback),
 *    courier /me, courier rider list, messaging threads, Inertia currentAvatar
 * Temporary image files are created and deleted; DB is rolled back.
 *
 *   php artisan avatar:test-urls
 */
class AvatarTestUrls extends Command
{
    use RollbackFlowHelpers;

    protected $signature = 'avatar:test-urls';

    protected $description = 'Rollback-only: avatar URL helper, old values, CORS endpoints, API/Inertia avatar fields';

    /** 1x1 PNG */
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    private array $files = [];

    private array $tokens = [];

    public function handle(): int
    {
        $tag = Str::lower(Str::random(16));
        $this->files = [
            'buyer' => "buyer_photos/buyer_photo_999999_" . Str::random(16) . '.png',
            'seller' => 'store_photos/profiles/profile_999999_' . time() . '.png',
            'rider' => 'riders/profile_pictures/avatartest' . $tag . '.png',
        ];
        foreach ($this->files as $f) {
            Storage::disk('public')->put($f, base64_decode(self::PNG));
        }
        Storage::disk('public')->put('riders/profile_pictures/avatartest' . $tag . '.pdf', '%PDF-1.4 test');
        $this->files['pdf'] = 'riders/profile_pictures/avatartest' . $tag . '.pdf';

        try {
            return $this->runRolledBack(fn () => $this->runTests(), ['users', 'riders', 'courier_personnel', 'personal_access_tokens', 'conversations', 'conversation_messages', 'courier_notifications', 'seller_notifications']);
        } finally {
            foreach ($this->files as $f) {
                Storage::disk('public')->delete($f);
            }
        }
    }

    private function api(User $u, string $method, string $uri, array $data = []): array
    {
        $this->tokens[$u->id] ??= $u->createToken('avatar-test')->plainTextToken;
        Auth::forgetGuards();
        $res = app()->handle(Request::create($uri, $method, $data, [], [], [
            'HTTP_ACCEPT' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer ' . $this->tokens[$u->id],
        ]));

        return ['status' => $res->getStatusCode(), 'body' => json_decode((string) $res->getContent(), true) ?? [], 'headers' => $res->headers];
    }

    /** JSON of a value at a dot path; 'missing' only when the key is absent (null stays null). */
    private function val(array $a, string $path): string
    {
        return \Illuminate\Support\Arr::has($a, $path) ? json_encode(\Illuminate\Support\Arr::get($a, $path)) : 'missing';
    }

    private function runTests(): void
    {
        $f    = $this->files;
        // url() follows the request being handled; compare against the current root at check time.
        $root = new class {
            public function __toString(): string
            {
                return rtrim(url('/'), '/');
            }
        };
        $this->check('URL root = current request host', (string) $root, rtrim(url('/'), '/'));
        $bf   = basename($f['buyer']);
        $sf   = basename($f['seller']);
        $rf   = basename($f['rider']);

        // ── Helper: values ────────────────────────────────────────────────
        $this->check('no picture -> null', json_encode(AvatarUrl::fromPath(null)) . '/' . json_encode(AvatarUrl::fromPath('  ')), 'null/null');
        $this->check('buyer relative path', AvatarUrl::fromPath($f['buyer']), "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $this->check('seller relative path', AvatarUrl::fromPath($f['seller']), "{$root}/api/buyer/seller-photo/profile/{$sf}");
        $this->check('rider relative path', AvatarUrl::fromPath($f['rider']), "{$root}/api/avatar/rider/{$rf}");
        $this->check('old "/storage/..." value', AvatarUrl::fromPath('/storage/' . $f['buyer']), "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $this->check('old "public/..." value', AvatarUrl::fromPath('public/' . $f['buyer']), "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $this->check('old http://localhost URL', AvatarUrl::fromPath('http://localhost/storage/' . $f['buyer']), "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $this->check('old http://127.0.0.1:8000 URL', AvatarUrl::fromPath('http://127.0.0.1:8000/storage/' . $f['seller']), "{$root}/api/buyer/seller-photo/profile/{$sf}");
        $this->check('old 10.0.2.2 serving URL', AvatarUrl::fromPath('http://10.0.2.2:8000/api/buyer/seller-photo/profile/' . $sf), "{$root}/api/buyer/seller-photo/profile/{$sf}");
        $appUrl = rtrim((string) config('app.url'), '/');
        $this->check('old APP_URL absolute URL', AvatarUrl::fromPath($appUrl . '/storage/' . $f['rider']), "{$root}/api/avatar/rider/{$rf}");
        $this->check('external https kept', AvatarUrl::fromPath('https://lh3.googleusercontent.com/a/abc'), 'https://lh3.googleusercontent.com/a/abc');
        $this->check('external http dropped', json_encode(AvatarUrl::fromPath('http://example.com/x.png')), 'null');
        $this->check('PDF "picture" -> null', json_encode(AvatarUrl::fromPath($f['pdf'])), 'null');
        $this->check('missing file -> null', json_encode(AvatarUrl::fromPath('buyer_photos/buyer_photo_1_nope000000000000.png')), 'null');
        $this->check('traversal -> null', json_encode(AvatarUrl::fromPath('buyer_photos/../../.env')), 'null');
        $this->check('unknown folder -> null', json_encode(AvatarUrl::fromPath('products/x.png')), 'null');
        $this->check('URL host is current host (not DB host)', str_starts_with((string) AvatarUrl::fromPath('http://localhost/storage/' . $f['buyer']), $root) ? 'yes' : 'no', 'yes');
        $this->check('initials', AvatarUrl::initials('Juan dela Cruz') . '/' . AvatarUrl::initials('ana') . '/' . AvatarUrl::initials(''), 'JC/A/?');
        $this->check('sellerPhotoUrl tolerates old value', \App\Http\Controllers\Api\ProductController::sellerPhotoUrl('http://localhost/storage/' . $f['seller']), "{$root}/api/buyer/seller-photo/profile/{$sf}");

        // ── Serving endpoints (CORS) ──────────────────────────────────────
        foreach (['buyer' => "/api/buyer/buyer/profile-photo/{$bf}", 'seller' => "/api/buyer/seller-photo/profile/{$sf}", 'rider' => "/api/avatar/rider/{$rf}"] as $k => $uri) {
            $res = app()->handle(Request::create($uri, 'GET'));
            $this->check("serve {$k}: 200 + CORS", $res->getStatusCode() . '/' . ($res->headers->get('Access-Control-Allow-Origin') ?? '-'), '200/*');
        }
        $res = app()->handle(Request::create('/api/avatar/rider/' . basename($f['pdf']), 'GET'));
        $this->check('serve rider PDF -> 404', $res->getStatusCode(), 404);
        $res = app()->handle(Request::create('/api/avatar/rider/..%2F..%2F.env', 'GET'));
        $this->check('serve traversal -> 404', $res->getStatusCode(), 404);

        // ── Users + APIs ──────────────────────────────────────────────────
        $buyer  = $this->makeUser('av-buyer', ['account_type' => 'buyer', 'role' => 'buyer', 'email_verified_at' => now(), 'profile_photo' => 'http://localhost/storage/' . $f['buyer']]);
        $nopic  = $this->makeUser('av-nopic', ['account_type' => 'buyer', 'role' => 'buyer', 'email_verified_at' => now()]);
        $this->check('forUser with picture (old localhost value)', AvatarUrl::forUser($buyer), "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $this->check('forUser without picture', json_encode(AvatarUrl::forUser($nopic)), 'null');
        $this->check('DB value NOT rewritten', $buyer->fresh()->profile_photo, 'http://localhost/storage/' . $f['buyer']);

        $r = $this->api($buyer, 'GET', '/api/buyer/profile');
        $this->check('buyer API /profile profile_photo_url', $r['body']['data']['profile_photo_url'] ?? '-', "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $r = $this->api($nopic, 'GET', '/api/buyer/profile');
        $this->check('buyer API /profile without picture', $this->val($r['body'], 'data.profile_photo_url'), 'null');

        // Rider: no users.profile_photo -> approved rider application picture.
        $company = $this->makeUser('av-courier', ['account_type' => 'logistics', 'role' => 'courier', 'verification_status' => 'verified', 'company_name' => 'Avatar Test Courier']);
        $riderU  = $this->makeUser('av-rider', ['account_type' => 'logistics', 'role' => 'rider', 'verification_status' => 'verified']);
        $pers    = new CourierPersonnel();
        $pers->forceFill(['courier_id' => $company->id, 'user_id' => $riderU->id, 'name' => 'Avatar Rider', 'role' => 'rider', 'status' => 'active'])->save();
        $app = new Rider();
        $app->forceFill([
            'first_name' => 'Avatar', 'last_name' => 'Rider', 'birthdate' => '1995-01-01', 'gender' => 'male',
            'contact_number' => '09170000000', 'email' => $riderU->email, 'rider_id' => Rider::generateRiderId(),
            'username' => 'avatartest' . Str::lower(Str::random(6)), 'password' => bcrypt(Str::random(12)),
            'courier_company_id' => $company->id, 'employment_status' => 'active', 'service_areas' => ['CHECK'],
            'vehicle_type' => 'motorcycle', 'plate_number' => 'AV 1', 'region' => 'CHECK', 'city_municipality' => 'CHECK',
            'barangay' => 'CHECK', 'government_id' => 'check/none.jpg', 'privacy_policy_accepted' => true,
            'verification_status' => 'approved', 'profile_picture' => $f['rider'],
        ])->save();
        $this->check('rider fallback to application picture', AvatarUrl::forUser($riderU), "{$root}/api/avatar/rider/{$rf}");
        $r = $this->api($riderU, 'GET', '/api/rider-app/me');
        $this->check('rider API /me profile_photo_url', $r['status'] . '/' . ($r['body']['data']['rider']['profile_photo_url'] ?? '-'), "200/{$root}/api/avatar/rider/{$rf}");
        $r = $this->api($company, 'GET', '/api/courier-app/riders');
        $row = collect($r['body']['data'] ?? [])->firstWhere('personnel_id', $pers->id);
        $this->check('courier API rider list photo', $row['profile_photo_url'] ?? '-', "{$root}/api/avatar/rider/{$rf}");
        $r = $this->api($company, 'GET', '/api/courier-app/me');
        $this->check('courier API /me (no picture) -> null', $r['status'] . '/' . $this->val($r['body'], 'data.courier.profile_photo_url'), '200/null');

        // Messaging thread carries the counterpart avatar.
        $s = $this->api($riderU, 'POST', '/api/rider-app/messaging/start', ['role' => 'courier', 'id' => $company->id]);
        $this->check('rider thread has counterpart_photo_url key', array_key_exists('counterpart_photo_url', $s['body']['data'] ?? []) ? 'yes' : 'no', 'yes', (string) $s['status']);
        if (! empty($s['body']['data']['id'])) {
            $this->api($riderU, 'POST', '/api/rider-app/messaging/threads/' . $s['body']['data']['id'] . '/messages', ['body' => 'avatar test']);
        }
        $t = $this->api($company, 'GET', '/api/courier-app/messaging/threads');
        $row = collect($t['body']['data'] ?? [])->firstWhere('counterpart_role', 'rider');
        $this->check('courier sees rider avatar in thread', $row['counterpart_photo_url'] ?? '-', "{$root}/api/avatar/rider/{$rf}");

        // Inertia shared prop for the web headers.
        $res  = $this->http($buyer, 'GET', '/homepage', [], true);
        $prop = $res['body']['props']['currentAvatar'] ?? null;
        $this->check('Inertia currentAvatar.url', $prop['url'] ?? '-', "{$root}/api/buyer/buyer/profile-photo/{$bf}", (string) $res['status']);
        $this->check('Inertia auth.user.avatar', $res['body']['props']['auth']['user']['avatar'] ?? '-', "{$root}/api/buyer/buyer/profile-photo/{$bf}");
        $res = $this->http($nopic, 'GET', '/homepage', [], true);
        $this->check('Inertia currentAvatar without picture', $this->val($res['body'], 'props.currentAvatar.url'), 'null');
    }
}
