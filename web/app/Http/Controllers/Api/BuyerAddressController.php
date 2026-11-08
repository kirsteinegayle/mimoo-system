<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuyerApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\BuyerAddress;
use App\Models\User;
use App\Rules\PhilippineMobile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Buyer address book (auth:sanctum, buyer only).
 *
 * GET    /api/buyer/addresses
 * POST   /api/buyer/addresses
 * PUT    /api/buyer/addresses/{id}
 * DELETE /api/buyer/addresses/{id}
 * POST   /api/buyer/addresses/{id}/default
 *
 * Invariants: max 10 per buyer; exactly one default whenever the list is
 * non-empty; the first address is the default; the default can't be deleted.
 * Location fields are PSGC names stored as strings (same as PUT /profile).
 */
class BuyerAddressController extends Controller
{
    use BuyerApiHelpers;

    private function rules(): array
    {
        return [
            'label'             => ['required', 'string', 'max:50'],
            'recipient_name'    => ['required', 'string', 'min:2', 'max:255'],
            'phone'             => ['required', 'string', new PhilippineMobile()],
            'region'            => ['required', 'string', 'max:100'],
            'province'          => ['nullable', 'string', 'max:100'],
            'district'          => ['nullable', 'string', 'max:255'],
            'municipality_city' => ['required', 'string', 'max:100'],
            'barangay'          => ['required', 'string', 'max:100'],
            'street_address'    => ['required', 'string', 'max:255'],
            'postal_code'       => ['nullable', 'regex:/^\d{4}$/'],
        ];
    }

    private function messages(): array
    {
        return [
            'postal_code.regex' => 'Postal code must be 4 digits.',
            'recipient_name.required' => 'Recipient name is required.',
            'street_address.required' => 'Street address is required.',
        ];
    }

    private function format(BuyerAddress $a): array
    {
        return [
            'id'                => $a->id,
            'label'             => $a->label,
            'recipient_name'    => $a->recipient_name,
            'phone'             => $a->phone,
            'region'            => $a->region,
            'province'          => $a->province,
            'district'          => $a->district,
            'municipality_city' => $a->municipality_city,
            'barangay'          => $a->barangay,
            'street_address'    => $a->street_address,
            'postal_code'       => $a->postal_code,
            'is_default'        => (bool) $a->is_default,
            'full_address'      => $a->fullAddress(),
        ];
    }

    private function listFor(int $buyerId)
    {
        return BuyerAddress::where('buyer_id', $buyerId)
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->get();
    }

    /**
     * One-time import of the profile address when the address book is empty.
     * Once imported the list can never become empty again (the default can't
     * be deleted), so this only ever runs once per buyer.
     */
    private function importFromProfile(User $user): void
    {
        if (empty($user->region) || empty($user->municipality_city)
            || empty($user->barangay) || empty($user->street_address)) {
            return;
        }

        $phone = $user->contact_number ? PhilippineMobile::normalize($user->contact_number) : '';
        $name  = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: ($user->name ?? '');

        BuyerAddress::create([
            'buyer_id'          => $user->id,
            'label'             => 'Home',
            'recipient_name'    => mb_substr($name, 0, 255),
            'phone'             => mb_substr($phone, 0, 20),
            'region'            => $user->region,
            'province'          => $user->province,
            'district'          => $user->district,
            'municipality_city' => $user->municipality_city,
            'barangay'          => $user->barangay,
            'street_address'    => $user->street_address,
            'postal_code'       => null,
            'is_default'        => true,
        ]);
    }

    // GET /api/buyer/addresses
    public function index(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $user = $request->user();

        DB::transaction(function () use ($user) {
            // Lock the user row so two concurrent first loads can't both import.
            User::whereKey($user->id)->lockForUpdate()->first();
            if (! BuyerAddress::where('buyer_id', $user->id)->exists()) {
                $this->importFromProfile($user);
            }
        });

        $list = $this->listFor($user->id);

        return response()->json([
            'data' => $list->map(fn ($a) => $this->format($a))->values(),
            'meta' => ['count' => $list->count(), 'max' => BuyerAddress::MAX_PER_BUYER],
        ]);
    }

    // POST /api/buyer/addresses
    public function store(Request $request): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $user = $request->user();

        $validated = validator($request->all(), $this->rules(), $this->messages())->validate();
        $validated['phone'] = PhilippineMobile::normalize($validated['phone']);
        $makeDefault = $request->boolean('is_default');

        $result = DB::transaction(function () use ($user, $validated, $makeDefault) {
            User::whereKey($user->id)->lockForUpdate()->first();

            $count = BuyerAddress::where('buyer_id', $user->id)->count();
            if ($count >= BuyerAddress::MAX_PER_BUYER) {
                return null;
            }

            $isDefault = $count === 0 || $makeDefault;
            if ($isDefault) {
                BuyerAddress::where('buyer_id', $user->id)->update(['is_default' => false]);
            }

            return BuyerAddress::create($validated + [
                'buyer_id'   => $user->id,
                'is_default' => $isDefault,
            ]);
        });

        if (! $result) {
            return $this->validationError('address', 'You can save up to ' . BuyerAddress::MAX_PER_BUYER . ' addresses only. Delete one to add a new address.');
        }

        return response()->json([
            'message' => 'Address saved.',
            'data'    => $this->format($result),
        ], 201);
    }

    // PUT /api/buyer/addresses/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $user = $request->user();

        $address = BuyerAddress::where('buyer_id', $user->id)->find($id);
        if (! $address) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        $validated = validator($request->all(), $this->rules(), $this->messages())->validate();
        $validated['phone'] = PhilippineMobile::normalize($validated['phone']);

        DB::transaction(function () use ($user, $address, $validated, $request) {
            $address->fill($validated);
            if ($request->boolean('is_default') && ! $address->is_default) {
                BuyerAddress::where('buyer_id', $user->id)->update(['is_default' => false]);
                $address->is_default = true;
            }
            $address->save();
        });

        return response()->json([
            'message' => 'Address updated.',
            'data'    => $this->format($address->fresh()),
        ]);
    }

    // DELETE /api/buyer/addresses/{id}
    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;

        $address = BuyerAddress::where('buyer_id', $request->user()->id)->find($id);
        if (! $address) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        if ($address->is_default) {
            return $this->validationError('address', 'This is your default address. Set another address as default before deleting it.');
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    // POST /api/buyer/addresses/{id}/default
    public function setDefault(Request $request, int $id): JsonResponse
    {
        if ($err = $this->buyerGuard($request)) return $err;
        $user = $request->user();

        $address = BuyerAddress::where('buyer_id', $user->id)->find($id);
        if (! $address) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        DB::transaction(function () use ($user, $address) {
            BuyerAddress::where('buyer_id', $user->id)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return response()->json([
            'message' => 'Default address updated.',
            'data'    => $this->listFor($user->id)->map(fn ($a) => $this->format($a))->values(),
        ]);
    }
}
