<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RiderRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            // Personal Information
            'first_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\-\'.]+$/'],
            'middle_name' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z\s\-\'.]+$/'],
            'last_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\-\'.]+$/'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'birthdate' => ['required', 'date', 'before:' . now()->subYears(18)->format('Y-m-d')],
            'gender' => ['required', 'in:male,female,other'],
            'contact_number' => ['required', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:riders,email'],
            'profile_picture' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            
            // Account Information
            'username' => ['required', 'string', 'min:4', 'max:100', 'regex:/^[a-zA-Z0-9_]+$/', 'unique:riders,username'],
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#-])[A-Za-z\d@$!%*?&_#-]+$/'],
            'password_confirmation' => ['required', 'same:password'],
            
            // Branch Assignment (will be set by courier during approval)
            // courier_company_id and assigned_branch_id will be null on registration
            // Courier will assign branch based on service_areas during approval
            
            // Delivery Information
            'service_areas' => ['required', 'array', 'min:1'],
            'service_areas.*' => ['required', 'string'],
            'vehicle_type' => ['required', 'in:motorcycle,bicycle,car,tricycle'],
            
            // Address Information
            'region' => ['required', 'string'],
            'province' => ['nullable', 'string'],
            'city_municipality' => ['required', 'string'],
            'barangay' => ['required', 'string'],
            'street_address' => ['nullable', 'string'],
            
            // Supporting Documents
            'government_id' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            
            // Privacy Policy
            'privacy_policy_accepted' => ['required', 'accepted'],
        ];

        // Conditional validation based on vehicle type
        $vehicleType = $this->input('vehicle_type');
        if (in_array($vehicleType, ['motorcycle', 'car', 'tricycle'])) {
            $rules['plate_number'] = ['required', 'string', 'max:50'];
            $rules['drivers_license_number'] = ['required', 'string', 'max:50'];
            $rules['drivers_license'] = ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];
            $rules['vehicle_or_cr'] = ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];
        } else {
            $rules['plate_number'] = ['nullable', 'string', 'max:50'];
            $rules['drivers_license_number'] = ['nullable', 'string', 'max:50'];
            $rules['drivers_license'] = ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];
            $rules['vehicle_or_cr'] = ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, apostrophes, and periods.',
            'last_name.required' => 'Last name is required.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods.',
            'birthdate.before' => 'You must be at least 18 years old to register.',
            'contact_number.regex' => 'Enter a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX).',
            'email.unique' => 'This email is already registered.',
            'username.unique' => 'This username is already taken.',
            'username.regex' => 'Username can only contain letters, numbers, and underscores.',
            'password.regex' => 'Password must include uppercase, lowercase, number, and special character.',
            'password_confirmation.same' => 'Passwords do not match.',
            'service_areas.min' => 'Select at least one service area.',
            'government_id.required' => 'Government ID is required.',
            'drivers_license.required' => 'Driver\'s license is required for this vehicle type.',
            'vehicle_or_cr.required' => 'Vehicle registration (OR/CR) is required for this vehicle type.',
            'privacy_policy_accepted.accepted' => 'You must accept the Privacy Policy to continue.',
        ];
    }
}
