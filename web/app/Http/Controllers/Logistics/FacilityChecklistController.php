<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use App\Models\CourierFacility;
use App\Support\CourierCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Operational checklists per facility (Branches & Facilities page). Real rows, scoped to the
 * facility's company; staff create, edit, tick / untick, delete and reset them.
 *
 *   GET    /logistics/facilities/{id}/checklist
 *   POST   /logistics/facilities/{id}/checklist          {type, title, note?}
 *   PUT    /logistics/checklist-items/{id}                {title?, note?, is_done?}
 *   DELETE /logistics/checklist-items/{id}
 *   POST   /logistics/facilities/{id}/checklist/reset     {type}  untick every item of a list (new shift)
 */
class FacilityChecklistController extends Controller
{
    private function facility(Request $request, int $id): ?CourierFacility
    {
        return CourierFacility::where('id', $id)->where('courier_id', CourierCompanyResolver::scope($request->user())->id)->first();
    }

    private function item(Request $request, int $id): ?object
    {
        $row = DB::table('facility_checklist_items')->where('id', $id)->first();

        return ($row && $this->facility($request, (int) $row->courier_facility_id)) ? $row : null;
    }

    private function actor(Request $request): string
    {
        $u = $request->user();

        return mb_substr(trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')) ?: (string) $u->name, 0, 120);
    }

    public function index(Request $request, int $id): JsonResponse
    {
        if (! $this->facility($request, $id)) {
            return response()->json(['message' => 'Facility not found.'], 404);
        }
        $rows = DB::table('facility_checklist_items')->where('courier_facility_id', $id)->orderBy('type')->orderBy('sort_order')->orderBy('id')->get();

        return response()->json(['data' => $rows->map(fn ($r) => [
            'id' => $r->id, 'type' => $r->type, 'title' => $r->title, 'note' => $r->note, 'is_done' => (bool) $r->is_done,
            'done_at' => $r->done_at, 'done_by' => $r->done_by,
        ])->values()]);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        if (! $this->facility($request, $id)) {
            return response()->json(['message' => 'Facility not found.'], 404);
        }
        $v = Validator::make($request->all(), ['type' => ['required', 'in:inbound,outbound'], 'title' => ['required', 'string', 'min:2', 'max:160'], 'note' => ['nullable', 'string', 'max:255']]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        $order = (int) DB::table('facility_checklist_items')->where('courier_facility_id', $id)->where('type', $d['type'])->max('sort_order') + 1;
        $newId = DB::table('facility_checklist_items')->insertGetId($d + ['courier_facility_id' => $id, 'sort_order' => $order, 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Checklist item added.', 'id' => $newId], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $row = $this->item($request, $id);
        if (! $row) {
            return response()->json(['message' => 'Item not found.'], 404);
        }
        $v = Validator::make($request->all(), ['title' => ['sometimes', 'required', 'string', 'min:2', 'max:160'], 'note' => ['nullable', 'string', 'max:255'], 'is_done' => ['sometimes', 'boolean']]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        if (array_key_exists('is_done', $d)) {
            $d['done_at'] = $d['is_done'] ? now() : null;
            $d['done_by'] = $d['is_done'] ? $this->actor($request) : null;
        }
        DB::table('facility_checklist_items')->where('id', $id)->update($d + ['updated_at' => now()]);

        return response()->json(['message' => 'Updated.']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! $this->item($request, $id)) {
            return response()->json(['message' => 'Item not found.'], 404);
        }
        DB::table('facility_checklist_items')->where('id', $id)->delete();

        return response()->json(['message' => 'Item deleted.']);
    }

    public function reset(Request $request, int $id): JsonResponse
    {
        if (! $this->facility($request, $id)) {
            return response()->json(['message' => 'Facility not found.'], 404);
        }
        $type = $request->input('type');
        if (! in_array($type, ['inbound', 'outbound'], true)) {
            return response()->json(['message' => 'Choose inbound or outbound.'], 422);
        }
        $n = DB::table('facility_checklist_items')->where('courier_facility_id', $id)->where('type', $type)->where('is_done', true)
            ->update(['is_done' => false, 'done_at' => null, 'done_by' => null, 'updated_at' => now()]);

        return response()->json(['message' => "Cleared {$n} tick(s)."]);
    }
}
