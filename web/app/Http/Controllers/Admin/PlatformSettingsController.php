<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\PlatformPolicy;
use App\Services\UserNotifier;
use App\Support\AccountStatus;
use App\Support\SellerCompliance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** ERP Admin: Manage Platform Settings (announcements, policies, prohibited keywords). */
class PlatformSettingsController extends Controller
{
    public function index(): Response
    {
        $policies = collect(PlatformPolicy::TYPES)->map(function ($label, $type) {
            $cur = PlatformPolicy::current($type);

            return [
                'type' => $type,
                'label' => $label,
                'content' => $cur?->content ?? '',
                'version' => $cur?->version ?? 0,
                'updated_at' => $cur?->created_at?->format('M d, Y g:i A'),
                'updated_by' => $cur?->updated_by,
                'public_url' => "/policies/{$type}",
                'history' => PlatformPolicy::where('type', $type)->orderByDesc('version')->limit(10)->get(['version', 'updated_by', 'created_at'])
                    ->map(fn ($p) => ['version' => $p->version, 'by' => $p->updated_by, 'at' => $p->created_at?->format('M d, Y')])->values(),
            ];
        })->values();

        return Inertia::render('admin/PlatformSettings', [
            'announcements' => Announcement::orderByDesc('id')->limit(100)->get()->map(fn ($a) => [
                'id' => $a->id, 'title' => $a->title, 'body' => $a->body, 'audience' => $a->audience, 'status' => $a->status,
                'published_at' => $a->published_at?->format('M d, Y g:i A'), 'created_at' => $a->created_at?->format('M d, Y'),
            ])->values(),
            'audiences' => Announcement::AUDIENCES,
            'policies' => $policies,
            'keywords' => SellerCompliance::keywords(),
        ]);
    }

    // ── Announcements ────────────────────────────────────────────────────────

    public function saveAnnouncement(Request $request, ?int $id = null): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'min:3', 'max:150'],
            'body' => ['required', 'string', 'min:5', 'max:2000'],
            'audience' => ['required', 'in:' . implode(',', Announcement::AUDIENCES)],
        ]);

        $a = $id ? Announcement::findOrFail($id) : new Announcement(['status' => 'draft']);
        $a->fill(['title' => trim($data['title']), 'body' => trim($data['body']), 'audience' => $data['audience']])->save();

        return back()->with('success', $id ? 'Announcement updated.' : 'Announcement saved as a draft.');
    }

    public function publishAnnouncement(int $id): RedirectResponse
    {
        $a = Announcement::findOrFail($id);
        if ($a->status === 'published') {
            return back()->withErrors(['announcement' => 'This announcement is already published.']);
        }

        $first = $a->published_at === null; // re-publishing after an unpublish does not spam notifications again
        $a->forceFill(['status' => 'published', 'published_at' => $a->published_at ?? now()])->save();

        if ($first) {
            $a->recipients()->select('users.*')->chunkById(200, function ($users) use ($a) {
                foreach ($users as $u) {
                    UserNotifier::send($u, 'announcement', $a->title, Str::limit($a->body, 240), 'announcement:' . $a->id, ['announcement_id' => $a->id]);
                }
            });
        }

        return back()->with('success', 'Announcement published' . ($first ? ' and sent as a notification.' : '.'));
    }

    public function unpublishAnnouncement(int $id): RedirectResponse
    {
        Announcement::findOrFail($id)->update(['status' => 'unpublished']);

        return back()->with('success', 'Announcement unpublished.');
    }

    public function deleteAnnouncement(int $id): RedirectResponse
    {
        Announcement::findOrFail($id)->delete();

        return back()->with('success', 'Announcement deleted.');
    }

    // ── Policies (versioned) ─────────────────────────────────────────────────

    public function savePolicy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:' . implode(',', array_keys(PlatformPolicy::TYPES))],
            'content' => ['required', 'string', 'min:20', 'max:50000'],
        ], ['content.min' => 'The policy text is too short.']);

        $cur = PlatformPolicy::current($data['type']);
        if ($cur && trim($cur->content) === trim($data['content'])) {
            return back()->withErrors(['content' => 'Nothing changed, so no new version was saved.']);
        }

        DB::transaction(fn () => PlatformPolicy::create([
            'type' => $data['type'],
            'version' => ($cur?->version ?? 0) + 1,
            'content' => trim($data['content']),
            'updated_by' => AccountStatus::adminLabel(),
        ]));

        return back()->with('success', PlatformPolicy::TYPES[$data['type']] . ' saved as version ' . (($cur?->version ?? 0) + 1) . '.');
    }

    // ── Prohibited keywords (used by Seller Compliance) ──────────────────────

    public function saveKeywords(Request $request): RedirectResponse
    {
        $data = $request->validate(['keywords' => ['nullable', 'string', 'max:5000']]);

        $list = collect(preg_split('/[\r\n,]+/', (string) ($data['keywords'] ?? '')))
            ->map(fn ($k) => mb_strtolower(trim($k)))->filter()->unique()->values();

        if ($list->contains(fn ($k) => mb_strlen($k) > 60)) {
            return back()->withErrors(['keywords' => 'Each keyword can be at most 60 characters.']);
        }
        if ($list->count() > 300) {
            return back()->withErrors(['keywords' => 'You can keep up to 300 keywords.']);
        }

        SellerCompliance::saveKeywords($list->all());

        return back()->with('success', $list->count() . ' prohibited keyword(s) saved.');
    }
}
