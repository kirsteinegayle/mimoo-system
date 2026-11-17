<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Rules\PhilippineMobile;
use App\Support\CourierCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Company Settings (courier company; its logistics staff edit the same company record).
 * What a courier company controls about itself: contact details, where it delivers (these service areas
 * decide which parcels Sort & Assign offers it) and its pickup / delivery-time info.
 *
 *   GET  /courier/company-settings
 *   POST /courier/company-settings
 */
class CompanySettingsController extends Controller
{
    private function company(Request $request)
    {
        return CourierCompanyResolver::scope($request->user());
    }

    public function show(Request $request): JsonResponse
    {
        $c = $this->company($request);

        return response()->json(['data' => [
            'company_name' => $c->company_name,
            'trade_name' => $c->trade_name,
            'business_email' => $c->business_email ?: $c->email,
            'company_contact_number' => $c->company_contact_number,
            'company_website' => $c->company_website,
            'business_address' => $c->business_address,
            'service_areas' => array_values((array) $c->service_areas),
            'cities_served' => array_values((array) $c->cities_served),
            'provinces_served' => array_values((array) $c->provinces_served),
            'pickup_available' => $c->pickup_available,
            'estimated_delivery_time' => $c->estimated_delivery_time,
            'status' => $c->status,
            'sec_registration_no' => $c->sec_registration_no, // read only: changed through admin / registration
        ]]);
    }

    public function update(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'trade_name' => ['nullable', 'string', 'max:255'],
            'business_email' => ['required', 'email', 'max:255'],
            'company_contact_number' => ['required', 'string', new PhilippineMobile()],
            'company_website' => ['nullable', 'url', 'max:255'],
            'business_address' => ['required', 'string', 'max:500'],
            'service_areas' => ['nullable', 'array', 'max:300'],
            'service_areas.*' => ['string', 'max:100'],
            'cities_served' => ['nullable', 'array', 'max:300'],
            'cities_served.*' => ['string', 'max:100'],
            'provinces_served' => ['nullable', 'array', 'max:100'],
            'provinces_served.*' => ['string', 'max:100'],
            'pickup_available' => ['nullable', 'in:yes,no'],
            'estimated_delivery_time' => ['nullable', 'string', 'max:255'],
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $d = $v->validated();
        $clean = fn ($a) => array_values(array_unique(array_filter(array_map('trim', (array) $a), fn ($x) => $x !== '')));
        foreach (['service_areas', 'cities_served', 'provinces_served'] as $k) {
            if (array_key_exists($k, $d)) {
                $d[$k] = $clean($d[$k]);
            }
        }
        if (isset($d['company_contact_number'])) {
            $d['company_contact_number'] = PhilippineMobile::normalize($d['company_contact_number']);
        }
        $this->company($request)->forceFill($d)->save();

        return response()->json(['message' => 'Company settings saved.']);
    }
}
