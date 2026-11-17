<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin Banner Management (admin.verified session). Banners appear on the buyer homepage
 * (and in the app via GET /api/banners) while they are active and inside their schedule.
 *
 *   GET    /admin/banners              page
 *   GET    /admin/banners/data         list
 *   POST   /admin/banners              create (multipart, image required)
 *   POST   /admin/banners/{id}         update (multipart, image optional)
 *   POST   /admin/banners/{id}/toggle  activate / deactivate
 *   POST   /admin/banners/{id}/move    {dir: up|down} within its position
 *   DELETE /admin/banners/{id}
 */
class BannerController extends Controller
{
    public function page(): Response
    {
        return Inertia::render('admin/BannerManagement');
    }

    public function data(): JsonResponse
    {
        return response()->json(['data' => Banner::orderBy('position')->orderBy('sort_order')->orderBy('id')->get()->map->present()->values()]);
    }

    private function rules(bool $imageRequired): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'image' => [$imageRequired ? 'required' : 'nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'link_url' => ['nullable', 'string', 'max:255', 'regex:#^(/|https?://)#'],
            'position' => ['required', 'in:' . implode(',', Banner::POSITIONS)],
            'status' => ['required', 'in:active,inactive'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
        ];
    }

    private function messages(): array
    {
        return ['link_url.regex' => 'The link must start with / (a page on this site) or http(s)://.', 'ends_at.after' => 'The end date must be after the start date.'];
    }

    private function storeImage(Request $request): string
    {
        return '/storage/' . $request->file('image')->store('banners', 'public');
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), $this->rules(true), $this->messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        $d['image'] = $this->storeImage($request);
        $d['sort_order'] = (int) Banner::where('position', $d['position'])->max('sort_order') + 1;
        $banner = Banner::create($d);

        return response()->json(['message' => 'Banner created.', 'data' => $banner->present()], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $banner = Banner::find($id);
        if (! $banner) {
            return response()->json(['message' => 'Banner not found.'], 404);
        }
        $v = Validator::make($request->all(), $this->rules(false), $this->messages());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        unset($d['image']);
        if ($request->hasFile('image')) {
            $this->deleteUploaded($banner);
            $d['image'] = $this->storeImage($request);
        }
        if ($d['position'] !== $banner->position) {
            $d['sort_order'] = (int) Banner::where('position', $d['position'])->max('sort_order') + 1;
        }
        $banner->update($d);

        return response()->json(['message' => 'Banner updated.', 'data' => $banner->fresh()->present()]);
    }

    public function toggle(int $id): JsonResponse
    {
        $banner = Banner::find($id);
        if (! $banner) {
            return response()->json(['message' => 'Banner not found.'], 404);
        }
        $banner->update(['status' => $banner->status === 'active' ? 'inactive' : 'active']);

        return response()->json(['message' => $banner->status === 'active' ? 'Banner activated.' : 'Banner deactivated.']);
    }

    public function move(Request $request, int $id): JsonResponse
    {
        $banner = Banner::find($id);
        $dir = $request->input('dir');
        if (! $banner || ! in_array($dir, ['up', 'down'], true)) {
            return response()->json(['message' => 'Banner not found.'], 404);
        }
        $list = Banner::where('position', $banner->position)->orderBy('sort_order')->orderBy('id')->get()->values();
        $i = $list->search(fn ($b) => $b->id === $banner->id);
        $j = $dir === 'up' ? $i - 1 : $i + 1;
        if (! isset($list[$j])) {
            return response()->json(['message' => 'Already at the edge.']);
        }
        // renumber the slot so equal sort_order values can never block a move
        $order = $list->pluck('id')->all();
        [$order[$i], $order[$j]] = [$order[$j], $order[$i]];
        foreach ($order as $n => $bid) {
            Banner::where('id', $bid)->update(['sort_order' => $n + 1]);
        }

        return response()->json(['message' => 'Banner moved.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $banner = Banner::find($id);
        if (! $banner) {
            return response()->json(['message' => 'Banner not found.'], 404);
        }
        $this->deleteUploaded($banner);
        $banner->delete();

        return response()->json(['message' => 'Banner deleted.']);
    }

    /** Only files we uploaded (/storage/banners/...) are removed; bundled /images/... files stay. */
    private function deleteUploaded(Banner $banner): void
    {
        if (str_starts_with($banner->image, '/storage/banners/')) {
            Storage::disk('public')->delete(substr($banner->image, strlen('/storage/')));
        }
    }
}
