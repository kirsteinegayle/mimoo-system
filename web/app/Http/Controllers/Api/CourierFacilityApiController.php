<?php

namespace App\Http\Controllers\Api;

use App\Models\CourierFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Facility management for the courier mobile app.
 *
 * Mirrors App\Http\Controllers\Courier\FacilityController validation,
 * facility-code generation and delete rules, but returns JSON.
 */
class CourierFacilityApiController extends CourierBaseController
{
    public function store(Request $request): JsonResponse
    {
        $courier = $request->user();

        $validated = $this->validatePayload($request, $courier->id);

        $facilityType = $validated['facility_type'];
        $existing = CourierFacility::where('courier_id', $courier->id)
            ->where('facility_type', $facilityType)
            ->count();

        $prefix = match ($facilityType) {
            'Main Hub'    => 'HUB',
            'Sorting Hub' => 'SRT',
            'Branch'      => 'BRN',
            default       => 'FAC',
        };

        $facility = CourierFacility::create([
            'courier_id'         => $courier->id,
            'facility_name'      => $validated['facility_name'],
            'facility_code'      => $prefix . '-' . str_pad($existing + 1, 3, '0', STR_PAD_LEFT),
            'facility_type'      => $facilityType,
            'parent_facility_id' => $validated['parent_facility_id'] ?? null,
            'status'             => $validated['status'],
            'region'             => $validated['region'],
            'province'           => $validated['province'] ?? null,
            'city'               => $validated['city'],
            'address'            => $validated['address'],
            'manager_name'       => $validated['manager_name'],
            'contact_number'     => $validated['contact_number'],
            'coverage_cities'    => $validated['coverage_cities'],
        ]);

        return response()->json([
            'message' => 'Facility created successfully.',
            'data'    => $this->present($facility),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $courier = $request->user();

        $facility = CourierFacility::where('courier_id', $courier->id)->find($id);

        if (! $facility) {
            return response()->json(['message' => 'Facility not found.'], 404);
        }

        $validated = $this->validatePayload($request, $courier->id, $facility->id);

        // Keep the original code when the facility type is unchanged.
        if ($validated['facility_type'] !== $facility->facility_type) {
            $existing = CourierFacility::where('courier_id', $courier->id)
                ->where('facility_type', $validated['facility_type'])
                ->count();

            $prefix = match ($validated['facility_type']) {
                'Main Hub'    => 'HUB',
                'Sorting Hub' => 'SRT',
                'Branch'      => 'BRN',
                default       => 'FAC',
            };

            $validated['facility_code'] = $prefix . '-' . str_pad($existing + 1, 3, '0', STR_PAD_LEFT);
        }

        $facility->update($validated);

        return response()->json([
            'message' => 'Facility updated successfully.',
            'data'    => $this->present($facility->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $courier = $request->user();

        $facility = CourierFacility::where('courier_id', $courier->id)->find($id);

        if (! $facility) {
            return response()->json(['message' => 'Facility not found.'], 404);
        }

        if ($facility->childFacilities()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete facility with child facilities. Please reassign or delete child facilities first.',
            ], 422);
        }

        $facility->delete();

        return response()->json(['message' => 'Facility deleted successfully.']);
    }

    private function validatePayload(Request $request, int $courierId, ?int $ignoreId = null): array
    {
        return $request->validate([
            'facility_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('courier_facilities')
                    ->where(fn ($query) => $query->where('courier_id', $courierId))
                    ->ignore($ignoreId),
            ],
            'facility_type' => ['required', 'in:Main Hub,Sorting Hub,Branch'],
            'parent_facility_id' => [
                'nullable',
                'integer',
                Rule::exists('courier_facilities', 'id')
                    ->where(fn ($query) => $query->where('courier_id', $courierId)),
                function ($attribute, $value, $fail) use ($request, $courierId, $ignoreId) {
                    if ($request->facility_type === 'Main Hub' && $value) {
                        $fail('Main Hub cannot have a parent facility.');
                    }

                    $existingFacilities = CourierFacility::where('courier_id', $courierId)
                        ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                        ->count();

                    if ($request->facility_type !== 'Main Hub' && ! $value && $existingFacilities > 0) {
                        $fail('This facility type requires a parent facility. Please create a Main Hub first or select an existing parent facility.');
                    }

                    if ($ignoreId && (int) $value === $ignoreId) {
                        $fail('A facility cannot be its own parent.');
                    }
                },
            ],
            'status' => ['required', 'in:Active,Inactive'],
            'region' => ['required', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'manager_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'coverage_cities' => ['required', 'array', 'min:1'],
            'coverage_cities.*' => ['required', 'string'],
        ], [
            'contact_number.regex' => 'Contact number must be a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX).',
            'coverage_cities.min'  => 'Select at least one coverage city.',
        ]);
    }

    private function present(CourierFacility $facility): array
    {
        return [
            'id'                 => $facility->id,
            'facility_name'      => $facility->facility_name,
            'facility_code'      => $facility->facility_code,
            'facility_type'      => $facility->facility_type,
            'parent_facility'    => $facility->parentFacility?->facility_name,
            'parent_facility_id' => $facility->parent_facility_id,
            'status'             => $facility->status,
            'region'             => $facility->region,
            'province'           => $facility->province,
            'city'               => $facility->city,
            'address'            => $facility->address,
            'manager'            => $facility->manager_name,
            'contact'            => $facility->contact_number,
            'coverage'           => $facility->coverage_cities,
        ];
    }
}
