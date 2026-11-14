<?php

namespace App\Console\Commands;

use App\Models\DeliveryJob;
use App\Models\Order;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request as IlluminateRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * artisan buyer:test-delivery-code
 *
 * End-to-end checks for the delivery flow WITHOUT a delivery code (proof of delivery only),
 * using the REAL rider flow (DEMO data only):
 *   BC-1 rider goes out for delivery; an old app's code request issues nothing
 *   BC-2 owner buyer sees no code (code null, reason not_required)
 *   BC-3 another buyer gets the same 404
 *   BC-4 no token gets 401
 *   BC-5 deliver without the POD photo -> 422 with a clear message
 *   BC-6 POD + deliver -> accepted (a stray otp field is ignored)
 *
 * Needs: rider:demo-seed + rider:demo-delivery. This DELIVERS the demo job, so
 * afterwards run rider:demo-clean, rider:demo-seed, rider:demo-delivery for
 * fresh demo data. Removes its temporary second buyer and test tokens.
 */
class BuyerTestDeliveryCode extends Command
{
    protected $signature   = 'buyer:test-delivery-code';
    protected $description = 'Test the buyer delivery-code endpoint end to end (DEMO data only, no DB wipe).';

    private const BUYER_EMAIL = 'demo.buyer.rider@mimoo-demo.test';
    private const OTHER_EMAIL = 'demo.buyer.other@mimoo-demo.test';
    private const RIDER_EMAIL = 'demo.rider@mimoo-demo.test';
    private const RIDER_PASS  = 'Demo@1234!';

    private int $passed = 0;
    private int $failed = 0;

    public function handle(): int
    {
        $buyer = User::where('email', self::BUYER_EMAIL)->first();
        $rider = User::where('email', self::RIDER_EMAIL)->first();
        if (! $buyer || ! $rider) {
            $this->error('Demo buyer/rider not found. Run rider:demo-seed and rider:demo-delivery first.');
            return self::FAILURE;
        }
        $job = DeliveryJob::whereIn('order_id', Order::where('buyer_id', $buyer->id)->pluck('id'))
            ->where('rider_user_id', $rider->id)
            ->where('status', DeliveryJob::STATUS_ASSIGNED)
            ->latest('id')->first();
        if (! $job) {
            $this->error('No assigned demo delivery job. Run rider:demo-clean, rider:demo-seed, rider:demo-delivery.');
            return self::FAILURE;
        }

        $other = null;
        try {
            $other = User::create([
                'name' => 'DEMO-OtherBuyer', 'first_name' => 'DEMO', 'last_name' => 'OtherBuyer',
                'email' => self::OTHER_EMAIL, 'password' => Hash::make(Str::random(24)),
                'account_type' => 'buyer', 'role' => 'buyer',
                'status' => 'approved', 'verification_status' => 'verified',
            ]);
            $buyerToken = $buyer->createToken('bc-test')->plainTextToken;
            $otherToken = $other->createToken('bc-test')->plainTextToken;

            $login = $this->call2('POST', '/api/rider-app/login', null, ['email' => self::RIDER_EMAIL, 'password' => self::RIDER_PASS]);
            $riderToken = json_decode($login->getContent(), true)['data']['token'] ?? null;
            if (! $riderToken) {
                $this->bad('BC-1', 'rider login failed: HTTP ' . $login->getStatusCode());
                return self::FAILURE;
            }

            $codePath = "/api/buyer/orders/{$job->order_id}/delivery-code";
            $base     = "/api/rider-app/deliveries/{$job->id}";

            // BC-1 rider: out for delivery. An old app may still ask for a code: nothing is issued.
            $r1 = $this->call2('POST', "{$base}/out-for-delivery", $riderToken);
            $r2 = $this->call2('POST', "{$base}/otp", $riderToken);
            $b2 = json_decode($r2->getContent(), true) ?? [];
            $r1->getStatusCode() === 200 && $r2->getStatusCode() === 200 && ! isset($b2['debug_otp']) && $job->otps()->count() === 0
                ? $this->ok('BC-1', 'rider out for delivery; the old code request issues nothing')
                : $this->bad('BC-1', "HTTP {$r1->getStatusCode()} / {$r2->getStatusCode()}");

            // BC-2 owner buyer: the code card stays hidden (code null, reason not_required)
            $r = $this->call2('GET', $codePath, $buyerToken);
            $d = json_decode($r->getContent(), true)['data'] ?? [];
            $r->getStatusCode() === 200 && array_key_exists('code', $d) && $d['code'] === null && ($d['reason'] ?? '') === 'not_required'
                ? $this->ok('BC-2', 'owner sees no code (' . ($d['reason'] ?? '') . ')')
                : $this->bad('BC-2', 'HTTP ' . $r->getStatusCode() . ' ' . substr($r->getContent(), 0, 120));

            // BC-3 another buyer
            $r = $this->call2('GET', $codePath, $otherToken);
            $b = json_decode($r->getContent(), true) ?? [];
            $r->getStatusCode() === 404 && ! array_key_exists('data', $b)
                ? $this->ok('BC-3', 'other buyer gets 404 "' . ($b['message'] ?? '') . '"')
                : $this->bad('BC-3', 'HTTP ' . $r->getStatusCode());

            // BC-4 no auth
            $r = $this->call2('GET', $codePath, null);
            $r->getStatusCode() === 401
                ? $this->ok('BC-4', 'no token gets 401')
                : $this->bad('BC-4', 'HTTP ' . $r->getStatusCode());

            // BC-5 delivering without the POD photo is refused with a clear message
            $body = [];
            if ($job->hasCod()) {
                $body['cod_collected'] = (float) $job->cod_amount;
            }
            $r = $this->call2('POST', "{$base}/deliver", $riderToken, $body);
            $m = json_decode($r->getContent(), true)['message'] ?? '';
            $r->getStatusCode() === 422 && str_contains($m, 'Proof of delivery is required')
                ? $this->ok('BC-5', 'no POD: 422 "' . $m . '"')
                : $this->bad('BC-5', 'HTTP ' . $r->getStatusCode() . ' ' . substr($r->getContent(), 0, 120));

            // BC-6 with the POD photo it is delivered (no code asked; a stray otp field is ignored)
            $pod = $this->callPod("{$base}/pod", $riderToken);
            $r = $this->call2('POST', "{$base}/deliver", $riderToken, $body + ['otp' => '000000']);
            $pod->getStatusCode() === 200 && $r->getStatusCode() === 200
                ? $this->ok('BC-6', 'POD + deliver accepted, otp field ignored')
                : $this->bad('BC-6', "POD HTTP {$pod->getStatusCode()}, deliver HTTP {$r->getStatusCode()} " . substr($r->getContent(), 0, 120));
        } finally {
            $buyer->tokens()->where('name', 'bc-test')->delete();
            if ($other) {
                $other->tokens()->delete();
                $other->delete();
            }
        }

        $this->line('');
        $this->line('  Total: ' . ($this->passed + $this->failed) . "  PASS: {$this->passed}  FAIL: {$this->failed}");
        $this->line('  Demo job is now delivered. Run rider:demo-clean, rider:demo-seed, rider:demo-delivery for fresh demo data.');
        return $this->failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function call2(string $method, string $url, ?string $token, array $body = []): \Symfony\Component\HttpFoundation\Response
    {
        $server = ['HTTP_ACCEPT' => 'application/json'];
        if ($token) {
            $server['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
        }
        $content = $body ? json_encode($body) : null;
        if ($content) {
            $server['CONTENT_TYPE'] = 'application/json';
        }
        return $this->send(IlluminateRequest::create($url, $method, $body, [], [], $server, $content));
    }

    private function callPod(string $url, string $token): \Symfony\Component\HttpFoundation\Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'pod');
        file_put_contents($tmp, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));
        $file = new UploadedFile($tmp, 'pod.png', 'image/png', null, true);
        $server = ['HTTP_ACCEPT' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer ' . $token];
        try {
            return $this->send(IlluminateRequest::create($url, 'POST', [], [], ['photo' => $file], $server));
        } finally {
            @unlink($tmp);
        }
    }

    private function send(IlluminateRequest $req): \Symfony\Component\HttpFoundation\Response
    {
        $kernel = app(HttpKernel::class);
        $res = $kernel->handle($req);
        $kernel->terminate($req, $res);
        app('auth')->forgetGuards(); // fresh auth per call: tokens never leak between requests
        return $res;
    }

    private function ok(string $step, string $note): void
    {
        $this->passed++;
        $this->line("  ✅ {$step}: {$note}");
    }

    private function bad(string $step, string $note): void
    {
        $this->failed++;
        $this->line("  ❌ {$step}: {$note}");
    }
}
