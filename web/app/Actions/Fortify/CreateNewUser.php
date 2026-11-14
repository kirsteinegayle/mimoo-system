<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\EmailVerification;
use App\Models\User;
use App\Notifications\EmailVerificationNotification;
use App\Rules\PhilippineMobile;
use App\Rules\StrongPassword;
use App\Rules\ValidName;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * Handles both buyer and seller registrations. File uploads (id_document,
     * business_permit) are stored in the private `registrations` disk so they
     * are not publicly accessible without an explicit controller action.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        // DEBUG: Log RAW received input
        \Log::info('=== RAW INPUT RECEIVED ===', [
            'all_keys' => array_keys($input),
            'company_name_raw' => $input['company_name'] ?? 'KEY_NOT_SET',
            'trade_name_raw' => $input['trade_name'] ?? 'KEY_NOT_SET',
            'company_website_raw' => $input['company_website'] ?? 'KEY_NOT_SET',
            'sec_registration_no_raw' => $input['sec_registration_no'] ?? 'KEY_NOT_SET',
            'contact_first_name_raw' => $input['contact_first_name'] ?? 'KEY_NOT_SET',
            'contact_last_name_raw' => $input['contact_last_name'] ?? 'KEY_NOT_SET',
            'contact_position_raw' => $input['contact_position'] ?? 'KEY_NOT_SET',
            'delivery_services_raw' => isset($input['delivery_services']) ? json_encode($input['delivery_services']) : 'KEY_NOT_SET',
            'regions_served_raw' => isset($input['regions_served']) ? json_encode($input['regions_served']) : 'KEY_NOT_SET',
            'provinces_served_raw' => isset($input['provinces_served']) ? json_encode($input['provinces_served']) : 'KEY_NOT_SET',
            'cities_served_raw' => isset($input['cities_served']) ? json_encode($input['cities_served']) : 'KEY_NOT_SET',
            'pickup_available_raw' => $input['pickup_available'] ?? 'KEY_NOT_SET',
            'estimated_delivery_time_raw' => $input['estimated_delivery_time'] ?? 'KEY_NOT_SET',
            'service_areas_raw' => isset($input['service_areas']) ? json_encode($input['service_areas']) : 'KEY_NOT_SET',
        ]);
        
        // DEBUG: Log received input - show actual values including empty strings
        \Log::info('=== REGISTRATION INPUT ===', [
            'account_type' => $input['account_type'] ?? 'NOT SET',
            'company_name' => isset($input['company_name']) ? "'{$input['company_name']}'" : 'NOT SET',
            'trade_name' => isset($input['trade_name']) ? "'{$input['trade_name']}'" : 'NOT SET',
            'company_website' => isset($input['company_website']) ? "'{$input['company_website']}'" : 'NOT SET',
            'sec_registration_no' => isset($input['sec_registration_no']) ? "'{$input['sec_registration_no']}'" : 'NOT SET',
            'contact_first_name' => isset($input['contact_first_name']) ? "'{$input['contact_first_name']}'" : 'NOT SET',
            'contact_last_name' => isset($input['contact_last_name']) ? "'{$input['contact_last_name']}'" : 'NOT SET',
            'contact_position' => isset($input['contact_position']) ? "'{$input['contact_position']}'" : 'NOT SET',
            'delivery_services' => isset($input['delivery_services']) ? json_encode($input['delivery_services']) : 'NOT SET',
            'regions_served' => isset($input['regions_served']) ? json_encode($input['regions_served']) : 'NOT SET',
            'provinces_served' => isset($input['provinces_served']) ? json_encode($input['provinces_served']) : 'NOT SET',
            'cities_served' => isset($input['cities_served']) ? json_encode($input['cities_served']) : 'NOT SET',
            'pickup_available' => isset($input['pickup_available']) ? "'{$input['pickup_available']}'" : 'NOT SET',
            'estimated_delivery_time' => isset($input['estimated_delivery_time']) ? "'{$input['estimated_delivery_time']}'" : 'NOT SET',
            'service_areas' => isset($input['service_areas']) ? json_encode($input['service_areas']) : 'NOT SET',
            'all_keys' => array_keys($input),
        ]);
        
        // Trim email and normalize mobile number before validation
        $input['email'] = trim($input['email'] ?? '');
        $input['contact_number'] = PhilippineMobile::normalize($input['contact_number'] ?? '');
        
        // Trim names and TIN
        $input['first_name'] = trim($input['first_name'] ?? '');
        $input['last_name'] = trim($input['last_name'] ?? '');
        $input['tin'] = trim($input['tin'] ?? '');
        
        // Trim and normalize courier-specific fields
        if (($input['account_type'] ?? '') === 'logistics') {
            $input['company_name'] = !empty($input['company_name']) ? trim($input['company_name']) : null;
            $input['trade_name'] = !empty($input['trade_name']) ? trim($input['trade_name']) : null;
            $input['business_email'] = !empty($input['business_email']) ? trim($input['business_email']) : null;
            $input['username'] = !empty($input['username']) ? trim($input['username']) : null;
            $input['company_contact_number'] = !empty($input['company_contact_number']) 
                ? PhilippineMobile::normalize($input['company_contact_number']) 
                : null;
            $input['rep_contact_number'] = !empty($input['rep_contact_number']) 
                ? PhilippineMobile::normalize($input['rep_contact_number']) 
                : null;
            $input['company_website'] = !empty($input['company_website']) ? trim($input['company_website']) : null;
            $input['business_address'] = !empty($input['business_address']) ? trim($input['business_address']) : null;
            $input['sec_registration_no'] = !empty($input['sec_registration_no']) ? trim($input['sec_registration_no']) : null;
            $input['rep_full_name'] = !empty($input['rep_full_name']) ? trim($input['rep_full_name']) : null;
            $input['contact_first_name'] = !empty($input['contact_first_name']) ? trim($input['contact_first_name']) : null;
            $input['contact_last_name'] = !empty($input['contact_last_name']) ? trim($input['contact_last_name']) : null;
            $input['contact_position'] = !empty($input['contact_position']) ? trim($input['contact_position']) : null;
            $input['pickup_available'] = !empty($input['pickup_available']) ? trim($input['pickup_available']) : null;
            $input['estimated_delivery_time'] = !empty($input['estimated_delivery_time']) ? trim($input['estimated_delivery_time']) : null;
        }
        
        $validator = Validator::make($input, [
            // ── Personal details ──────────────────────────────────────────
            'first_name'      => ['required', 'string', new ValidName()],
            'last_name'       => [
                ($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 
                'string', 
                new ValidName()
            ],
            'middle_initial'  => ['nullable', 'string', 'max:2'],
            'sex'             => [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'in:male,female'],
            'email'           => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'contact_number'  => ['required', 'string', new PhilippineMobile(), 'unique:users,contact_number'],
            'tin'             => ['nullable', 'string', 'max:50'], // For sellers
            'birthday'        => [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'date', 'before:-18 years'],
            'account_type'    => ['required', 'in:buyer,seller,logistics'],
            // Which logistics form was used: /register/logistics (company) or /register/courier (hub branch).
            'applicant_type'  => ['nullable', 'in:logistics,courier'],
            'terms_accepted'  => ['sometimes', 'required_if:account_type,buyer', 'accepted'],
            'privacy_policy_accepted' => ['sometimes', 'required_if:account_type,seller,logistics', 'accepted'],

            // ── Address ───────────────────────────────────────────────────
            'region'           => [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'string', 'max:100'],
            'province'         => ['nullable', 'string', 'max:100'], // Not required for NCR
            'district'         => ['nullable', 'string', 'max:100'], // NCR: required, non-NCR: not used
            'municipality_city'=> [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'string', 'max:100'],
            'barangay'         => [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'string', 'max:100'],
            'postal_code'      => ['nullable', 'string', 'max:10'], // For sellers
            'street_address'   => [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'string', 'max:255'],

            // ── Identity document ───────────────────────────────────────────
            'id_document'     => [($input['account_type'] ?? '') === 'logistics' ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            // ── Seller-only fields ────────────────────────────────────────
            'business_name'    => ['required_if:account_type,seller', 'nullable', 'string', 'max:255'],
            'business_type'    => ['required_if:account_type,seller', 'nullable', 'in:sole_proprietor,partnership,corporation'],
            'line_of_business' => ['required_if:account_type,seller', 'nullable', 'string', 'max:100'],
            'business_permit'  => ['required_if:account_type,seller,logistics', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'dti_registration' => ['required_if:account_type,seller', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'bir_2303'         => ['required_if:account_type,seller', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'sec_certificate'  => ['required_if:business_type,corporation', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            // ── Logistics-only fields ─────────────────────────────────────
            'company_name'        => ['required_if:account_type,logistics', 'nullable', 'string', 'max:255'],
            'trade_name'          => ['required_if:account_type,logistics', 'nullable', 'string', 'max:255'],
            'business_email'      => ['required_if:account_type,logistics', 'nullable', 'email', 'max:255'],
            'username'            => ['nullable', 'string', 'min:4', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/', 'unique:users,username'],
            'business_address'    => ['required_if:account_type,logistics', 'nullable', 'string'],
            'company_contact_number' => ['required_if:account_type,logistics', 'nullable', 'string', new PhilippineMobile()],
            'rep_contact_number'  => ['required_if:account_type,logistics', 'nullable', 'string', new PhilippineMobile()],
            'company_website'     => ['nullable', 'string', 'url', 'max:255'],
            'company_logo'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'sec_registration_no' => ['required_if:account_type,logistics', 'nullable', 'string', 'max:50'],
            'rep_full_name'       => ['required_if:account_type,logistics', 'nullable', 'string', 'max:255'],
            'contact_first_name'  => ['nullable', 'string', 'max:100'],
            'contact_last_name'   => ['nullable', 'string', 'max:100'],
            'contact_position'    => ['required_if:account_type,logistics', 'nullable', 'string', 'max:100'],
            'regions_served'      => ['required_if:account_type,logistics', 'nullable', 'array'],
            'regions_served.*'    => ['string', 'max:100'],
            'provinces_served'    => ['nullable', 'array'],
            'provinces_served.*'  => ['string', 'max:100'],
            'cities_served'       => ['required_if:account_type,logistics', 'nullable', 'array'],
            'cities_served.*'     => ['string', 'max:100'],
            'delivery_services'   => ['required_if:account_type,logistics', 'nullable', 'array'],
            'delivery_services.*' => ['string', 'max:100'],
            'pickup_available'    => ['nullable', 'string', 'max:50'],
            'estimated_delivery_time' => ['nullable', 'string', 'max:255'],
            'sec_certificate'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'operating_permits'   => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'valid_id'            => ['required_if:account_type,logistics', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'proof_of_address'    => ['required_if:account_type,logistics', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            // ── Security ──────────────────────────────────────────────────
            'password'        => ['required', 'string', new StrongPassword(), 'confirmed'],
        ], [
            'birthday.before'          => 'You must be at least 18 years old.',
            'contact_number.unique'    => 'Mobile number is already in use.',
            'email.unique'             => 'This email is already registered.',
            'username.unique'          => 'This username is already taken.',
            'username.regex'           => 'Username can only contain letters, numbers, and underscores.',
            'id_document.required'     => 'Please upload a valid government-issued ID.',
            'business_permit.required_if' => 'A business permit is required for seller and logistics accounts.',
            'dti_registration.required_if' => 'DTI registration is required for sellers.',
            'bir_2303.required_if' => 'BIR Form 2303 is required for sellers.',
            'sec_certificate.required_if' => 'SEC certificate is required for corporations and logistics companies.',
            'terms_accepted.required_if' => 'You must accept the Terms and Privacy Policy.',
            'terms_accepted.accepted' => 'You must accept the Terms and Privacy Policy.',
            'privacy_policy_accepted.required_if' => 'You must accept the Privacy Policy.',
            'privacy_policy_accepted.accepted' => 'You must accept the Privacy Policy.',
            'company_name.required_if' => 'Company name is required for logistics registration.',
            'trade_name.required_if' => 'Trade name is required for logistics registration.',
            'business_email.required_if' => 'Business email is required for logistics registration.',
            'business_address.required_if' => 'Business address is required for logistics registration.',
            'company_contact_number.required_if' => 'Company contact number is required for logistics registration.',
            'rep_contact_number.required_if' => 'Representative contact number is required for logistics registration.',
            'sec_registration_no.required_if' => 'SEC registration number is required for logistics companies.',
            'rep_full_name.required_if' => 'Representative full name is required for logistics registration.',
            'contact_position.required_if' => 'Contact person position is required for logistics registration.',
            'regions_served.required_if' => 'At least one region is required for logistics registration.',
            'cities_served.required_if' => 'At least one city is required for logistics registration.',
            'delivery_services.required_if' => 'At least one delivery service is required for logistics registration.',
            'valid_id.required_if' => 'Valid ID of authorized representative is required for logistics registration.',
            'proof_of_address.required_if' => 'Proof of address is required for logistics registration.',
        ]);
        
        try {
            $validator->validate();
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('=== VALIDATION FAILED ===', [
                'errors' => $e->errors(),
                'email' => $input['email'] ?? 'no email',
            ]);
            throw $e;
        }
        
        \Log::info('=== VALIDATION PASSED ===');
        
        // DEBUG: Log PROCESSED values that will be saved
        \Log::info('=== PROCESSED VALUES TO SAVE ===', [
            'company_name_processed' => $input['company_name'] ?? 'NOT_SET',
            'trade_name_processed' => $input['trade_name'] ?? 'NOT_SET',
            'company_website_processed' => $input['company_website'] ?? 'NOT_SET',
            'sec_registration_no_processed' => $input['sec_registration_no'] ?? 'NOT_SET',
            'contact_first_name_processed' => $input['contact_first_name'] ?? 'NOT_SET',
            'contact_last_name_processed' => $input['contact_last_name'] ?? 'NOT_SET',
            'contact_position_processed' => $input['contact_position'] ?? 'NOT_SET',
            'delivery_services_processed' => isset($input['delivery_services']) ? json_encode($input['delivery_services']) : 'NOT_SET',
            'regions_served_processed' => isset($input['regions_served']) ? json_encode($input['regions_served']) : 'NOT_SET',
            'provinces_served_processed' => isset($input['provinces_served']) ? json_encode($input['provinces_served']) : 'NOT_SET',
            'cities_served_processed' => isset($input['cities_served']) ? json_encode($input['cities_served']) : 'NOT_SET',
            'pickup_available_processed' => $input['pickup_available'] ?? 'NOT_SET',
            'estimated_delivery_time_processed' => $input['estimated_delivery_time'] ?? 'NOT_SET',
            'service_areas_processed' => isset($input['service_areas']) ? json_encode($input['service_areas']) : 'NOT_SET',
        ]);

        // Use transaction for atomicity
        try {
            $result = DB::transaction(function () use ($input) {
            // ── Store uploaded files ───────────────────────────────────────────
            // For logistics: valid_id is source of truth, id_document not used
            // For buyer/seller: id_document is required
            $idDocumentPath = (($input['account_type'] ?? '') !== 'logistics' && isset($input['id_document']) && $input['id_document'] instanceof UploadedFile)
                ? $this->storeFile($input['id_document'], 'id_documents')
                : null;
            $businessPermitPath = isset($input['business_permit']) && $input['business_permit'] instanceof UploadedFile
                ? $this->storeFile($input['business_permit'], 'business_permits')
                : null;
            $dtiRegistrationPath = isset($input['dti_registration']) && $input['dti_registration'] instanceof UploadedFile
                ? $this->storeFile($input['dti_registration'], 'dti_registrations')
                : null;
            $bir2303Path = isset($input['bir_2303']) && $input['bir_2303'] instanceof UploadedFile
                ? $this->storeFile($input['bir_2303'], 'bir_2303')
                : null;
            $secCertificatePath = isset($input['sec_certificate']) && $input['sec_certificate'] instanceof UploadedFile
                ? $this->storeFile($input['sec_certificate'], 'sec_certificates')
                : null;
            $validIdPath = isset($input['valid_id']) && $input['valid_id'] instanceof UploadedFile
                ? $this->storeFile($input['valid_id'], 'valid_ids')
                : null;
            $proofOfAddressPath = isset($input['proof_of_address']) && $input['proof_of_address'] instanceof UploadedFile
                ? $this->storeFile($input['proof_of_address'], 'proof_of_address')
                : null;
            $operatingPermitsPath = isset($input['operating_permits']) && $input['operating_permits'] instanceof UploadedFile
                ? $this->storeFile($input['operating_permits'], 'operating_permits')
                : null;
            $companyLogoPath = isset($input['company_logo']) && $input['company_logo'] instanceof UploadedFile
                ? $this->storeFile($input['company_logo'], 'company_logos')
                : null;

            // For courier registrations, split rep_full_name for compatibility
            $repFirstName = null;
            $repLastName = null;
            if (($input['account_type'] ?? '') === 'logistics' && !empty($input['rep_full_name'])) {
                $nameParts = explode(' ', trim($input['rep_full_name']), 2);
                $repFirstName = $nameParts[0];
                $repLastName = $nameParts[1] ?? null; // Allow null for one-word names
            }

            // Derive service_areas for compatibility (if anything still reads it)
            $serviceAreasForCompat = null;
            if (($input['account_type'] ?? '') === 'logistics') {
                $allAreas = array_merge(
                    $input['regions_served'] ?? [],
                    $input['provinces_served'] ?? [],
                    $input['cities_served'] ?? []
                );
                $serviceAreasForCompat = !empty($allAreas) ? $allAreas : null;
            }

            // ── Create user ────────────────────────────────────────────────────
            $user = User::create([
                // Computed full name for backward-compat with anything that reads `name`
                'name'              => trim(($input['first_name'] ?? '').' '.($input['last_name'] ?? '')),
                'first_name'        => $input['first_name'] ?? null,
                'last_name'         => $input['last_name'] ?? null,
                'middle_initial'    => $input['middle_initial'] ?? null,
                'sex'               => $input['sex'] ?? null,
                'email'             => $input['email'],
                'contact_number'    => $input['contact_number'], // Already normalized
                'tin'               => $input['tin'] ?? null,
                'birthday'          => $input['birthday'] ?? null,
                'account_type'      => $input['account_type'],
                'role'              => match($input['account_type']) {
                    'buyer' => 'buyer',
                    'seller' => 'seller',
                    // /register/logistics -> logistics company (hub); /register/courier -> courier hub.
                    // Missing applicant_type keeps the legacy value 'courier' (lowest privilege).
                    'logistics' => ($input['applicant_type'] ?? 'courier') === 'logistics' ? 'logistics_staff' : 'courier',
                    default => $input['account_type'],
                },
                'region'            => $input['region'] ?? null,
                'province'          => $input['province'] ?? null,
                'district'          => $input['district'] ?? null,
                'municipality_city' => $input['municipality_city'] ?? null,
                'barangay'          => $input['barangay'] ?? null,
                'postal_code'       => $input['postal_code'] ?? null,
                'street_address'    => $input['street_address'] ?? null,
                'id_document'       => $idDocumentPath, // NULL for logistics accounts
                'business_name'     => $input['business_name'] ?? null,
                'business_type'     => $input['business_type'] ?? null,
                'line_of_business'  => $input['line_of_business'] ?? null,
                'business_permit'   => $businessPermitPath,
                'dti_registration'  => $dtiRegistrationPath,
                'bir_2303'          => $bir2303Path,
                'sec_certificate'   => $secCertificatePath,
                // New courier fields
                'company_name'      => $input['company_name'] ?? null,
                'trade_name'        => $input['trade_name'] ?? null,
                'business_email'    => $input['business_email'] ?? null,
                'username'          => $input['username'] ?? null,
                'business_address'  => $input['business_address'] ?? null,
                'company_contact_number' => $input['company_contact_number'] ?? null,
                'rep_contact_number'     => $input['rep_contact_number'] ?? null,
                'company_website'   => $input['company_website'] ?? null,
                'company_logo'      => $companyLogoPath,
                'sec_registration_no' => $input['sec_registration_no'] ?? null,
                'rep_full_name'     => $input['rep_full_name'] ?? null,
                'contact_first_name' => $repFirstName ?? $input['contact_first_name'] ?? null,
                'contact_last_name'  => $repLastName ?? $input['contact_last_name'] ?? null,
                'contact_position'   => $input['contact_position'] ?? null,
                'service_areas'      => $serviceAreasForCompat, // For backward compatibility
                'regions_served'     => $input['regions_served'] ?? null,
                'provinces_served'   => $input['provinces_served'] ?? null,
                'cities_served'      => $input['cities_served'] ?? null,
                'delivery_services'  => $input['delivery_services'] ?? null,
                'pickup_available'   => $input['pickup_available'] ?? null,
                'estimated_delivery_time' => $input['estimated_delivery_time'] ?? null,
                'valid_id'           => $validIdPath,
                'proof_of_address'   => $proofOfAddressPath,
                'operating_permits'  => $operatingPermitsPath,
                'privacy_policy_accepted' => filter_var($input['privacy_policy_accepted'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'password'          => $input['password'],
                // All accounts start as pending and unverified
                'status'            => 'pending',
                'verification_status' => 'unverified',
                'approved_at'       => null,
            ]);

            // Create OTP inside the transaction; send email after commit so SMTP
            // cannot roll back the user or block the HTTP response.
            $verification = EmailVerification::createForEmail($user->email);

            return [$user, $verification->code];
        });
        } catch (\Throwable $e) {
            \Log::error('=== DATABASE TRANSACTION FAILED ===', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'email' => $input['email'] ?? 'no email',
            ]);
            throw $e;
        }

        [$user, $otpCode] = $result;

        // Never block registration on email delivery — log OTP and attempt send quickly.
        \Log::info('Registration OTP created', [
            'email' => $user->email,
            'code' => $otpCode,
        ]);

        try {
            Notification::route('mail', $user->email)
                ->notifyNow(new EmailVerificationNotification($otpCode));
        } catch (\Throwable $e) {
            \Log::warning('Registration OTP email failed (user can resend on verify page)', [
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

        return $user;
    }

    /**
     * Store an uploaded file and return its path relative to the storage disk.
     */
    private function storeFile(mixed $file, string $directory): ?string
    {
        if (! $file instanceof UploadedFile) {
            return null;
        }

        return $file->store($directory, 'local');
    }
}
