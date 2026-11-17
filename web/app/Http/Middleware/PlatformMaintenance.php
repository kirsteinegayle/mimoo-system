<?php

namespace App\Http\Middleware;

use App\Models\AdminSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admin > Settings > Maintenance mode: everyone except the admin panel gets a 503 with the admin's message.
 * Health check, admin pages / APIs and an already verified admin session stay available.
 */
class PlatformMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('admin', 'admin/*', 'api/admin/*', 'up') || ($request->hasSession() && $request->session()->get('admin_verified') === true)) {
            return $next($request);
        }

        try {
            $on = AdminSetting::get('maintenance_mode', '0') === '1';
        } catch (\Throwable) {
            $on = false;
        }
        if (! $on) {
            return $next($request);
        }

        $message = AdminSetting::get('maintenance_message', 'We are doing some maintenance and will be back shortly.');

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json(['message' => $message, 'maintenance' => true], 503, ['Retry-After' => '300']);
        }

        return response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maintenance</title>'
            . '<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f5f4f8;color:#2a1b4d;text-align:center;padding:24px">'
            . '<div><h1 style="margin:0 0 8px">Back soon</h1><p style="margin:0;max-width:32rem">' . e($message) . '</p></div></body>', 503, ['Retry-After' => '300']);
    }
}
