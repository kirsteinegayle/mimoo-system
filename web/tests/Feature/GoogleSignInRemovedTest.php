<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/** "Continue with Google" was removed everywhere: no route, no config, email/password login still registered. */
class GoogleSignInRemovedTest extends TestCase
{
    public function test_google_routes_are_gone(): void
    {
        $this->get('/auth/google')->assertNotFound();
        $this->get('/auth/google/callback')->assertNotFound();
        $this->assertFalse(Route::has('auth.google'));
        $this->assertFalse(Route::has('auth.google.callback'));
        $this->assertNull(config('services.google'));
    }

    public function test_email_password_login_and_registration_routes_remain(): void
    {
        $this->assertTrue(Route::has('login'));
        $this->assertTrue(collect(Route::getRoutes())->contains(fn ($r) => $r->uri() === 'login' && in_array('POST', $r->methods(), true)));
        $this->assertTrue(collect(Route::getRoutes())->contains(fn ($r) => $r->uri() === 'register' && in_array('POST', $r->methods(), true)));
        $this->assertFalse(class_exists(\Laravel\Socialite\Facades\Socialite::class));
    }
}
