<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /** True for a plain-http request to a loopback / emulator / private-LAN host. */
    private function isLocalHttpRequest(): bool
    {
        if ($this->app->runningInConsole()) {
            return false;
        }
        try {
            $req = request();
            if ($req->isSecure()) {
                return false;
            }
            $host = strtolower($req->getHost());
        } catch (\Throwable) {
            return false;
        }
        if (in_array($host, ['localhost', '::1', '[::1]'], true)) {
            return true;
        }

        return filter_var($host, FILTER_VALIDATE_IP) !== false
            && filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    }

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Admin > Settings values (platform name, commission rate) feed the config() readers
        \App\Support\PlatformSettings::applyRuntime();

        // Behind the Cloudflare Tunnel, generate https URLs when APP_URL is https.
        // NOT for local/LAN hosts (127.0.0.1, 10.0.2.2 emulator, 192.168.x.x):
        // `php artisan serve` speaks plain http there, and forced https made every
        // image/avatar URL returned to the Flutter apps unreachable.
        if (str_starts_with((string) config('app.url'), 'https://') && ! $this->isLocalHttpRequest()) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
