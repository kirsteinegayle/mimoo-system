<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\PlatformPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Public platform policies, plus the announcements feed for the mobile apps. */
class PolicyController extends Controller
{
    public function show(string $type): Response|\Illuminate\Http\RedirectResponse
    {
        abort_unless(isset(PlatformPolicy::TYPES[$type]), 404);
        $p = PlatformPolicy::current($type);

        // Until the admin writes a Privacy Policy here, keep showing the original static page.
        if ($type === 'privacy' && ! $p) {
            return redirect('/privacy-policy');
        }

        return Inertia::render('PlatformPolicy', [
            'type' => $type,
            'title' => PlatformPolicy::TYPES[$type],
            'content' => $p?->content,
            'version' => $p?->version,
            'updatedAt' => $p?->created_at?->format('F d, Y'),
            'others' => collect(PlatformPolicy::TYPES)->map(fn ($label, $key) => ['type' => $key, 'label' => $label])->values(),
        ]);
    }

    /** GET /api/announcements (Sanctum): published announcements for the signed-in user's role. */
    public function feed(Request $request): JsonResponse
    {
        return response()->json(['data' => Announcement::forUser($request->user(), 10)]);
    }
}
