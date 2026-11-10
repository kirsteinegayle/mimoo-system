import { Link, router } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import StepProgress from '../../components/registration/StepProgress';
import MultiSelectChips from '../../components/registration/MultiSelectChips';
import RadioCards from '../../components/registration/RadioCards';
import * as psgcApi from '../../services/psgcApi';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

const TOTAL_STEPS = 5;
const MAX_FILE_MB = 5;
const PH_MOBILE_RE = /^(09|\+639)\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIDEBAR_STEPS = [
    'Personal information and contact details',
    'Account credentials and authentication',
    'Delivery vehicle and service areas',
    'Complete address information',
    'Upload documents and verification',
];

const VEHICLE_TYPES = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'car', label: 'Car' },
    { value: 'tricycle', label: 'Tricycle' },
];

type FormShape = {
    // Step 1: Personal Information
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    birthdate: string;
    gender: string;
    contact_number: string;
    email: string;
    profile_picture: File | null;
    
    // Step 2: Account
    username: string;
    password: string;
    password_confirmation: string;
    
    // Step 3: Delivery Info (Service areas will determine branch assignment by courier)
    service_areas: string[];
    vehicle_type: string;
    plate_number: string;
    drivers_license_number: string;
    
    // Step 4: Address
    region: string;
    province: string;
    city_municipality: string;
    barangay: string;
    street_address: string;
    
    // Step 5: Documents
    government_id: File | null;
    drivers_license: File | null;
    vehicle_or_cr: File | null;
    
    privacy_policy_accepted: boolean;
    
    // Backend will set these during approval:
    // courier_company_id: from application context
    // assigned_branch_id: courier assigns based on service_areas
    // employment_status: set to 'active' upon approval
};

type FieldName = keyof FormShape;
type Errs = Partial<Record<FieldName, string>>;

const FIELD_STEP: Partial<Record<FieldName, number>> = {
    first_name: 1, middle_name: 1, last_name: 1, suffix: 1, birthdate: 1, gender: 1, contact_number: 1, email: 1, profile_picture: 1,
    username: 2, password: 2, password_confirmation: 2,
    service_areas: 3, vehicle_type: 3, plate_number: 3, drivers_license_number: 3,
    region: 4, province: 4, city_municipality: 4, barangay: 4, street_address: 4,
    government_id: 5, drivers_license: 5, vehicle_or_cr: 5,
};

const FIELD_LABEL: Partial<Record<FieldName, string>> = {
    first_name: 'First Name',
    middle_name: 'Middle Name',
    last_name: 'Last Name',
    suffix: 'Suffix',
    birthdate: 'Birthdate',
    gender: 'Gender',
    contact_number: 'Contact Number',
    email: 'Email Address',
    profile_picture: 'Profile Picture',
    username: 'Username',
    password: 'Password',
    password_confirmation: 'Confirm Password',
    service_areas: 'Service Areas',
    vehicle_type: 'Vehicle Type',
    plate_number: 'Plate Number',
    drivers_license_number: "Driver's License Number",
    region: 'Region',
    province: 'Province',
    city_municipality: 'City/Municipality',
    barangay: 'Barangay',
    street_address: 'Street Address',
    government_id: 'Government ID',
    drivers_license: "Driver's License",
    vehicle_or_cr: 'Vehicle OR/CR',
    privacy_policy_accepted: 'Privacy Policy',
};

function optionalFileError(f: File | null): string | undefined {
    if (!f) return undefined;
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return 'Use a PDF, JPG or PNG file.';
    if (f.size > MAX_FILE_MB * 1024 * 1024) return `File is too large. Max ${MAX_FILE_MB}MB.`;
    return undefined;
}

function requiredFileError(f: File | null): string | undefined {
    if (!f) return 'This file is required.';
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return 'Use a PDF, JPG or PNG file.';
    if (f.size > MAX_FILE_MB * 1024 * 1024) return `File is too large. Max ${MAX_FILE_MB}MB.`;
    return undefined;
}

function validate(step: number, d: FormShape): Errs {
    const e: Errs = {};
    
    if (step === 1) {
        const firstName = d.first_name.trim();
        if (!firstName) {
            e.first_name = 'Enter your first name.';
        } else if (!/^[a-zA-Z\s\-'.]+$/.test(firstName)) {
            e.first_name = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods.';
        }
        
        const lastName = d.last_name.trim();
        if (!lastName) {
            e.last_name = 'Enter your last name.';
        } else if (!/^[a-zA-Z\s\-'.]+$/.test(lastName)) {
            e.last_name = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods.';
        }
        
        if (!d.birthdate) {
            e.birthdate = 'Enter your birthdate.';
        } else {
            const age = Math.floor((Date.now() - new Date(d.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 18) {
                e.birthdate = 'You must be at least 18 years old.';
            }
        }
        
        if (!d.gender) {
            e.gender = 'Select your gender.';
        }
        
        const contact = d.contact_number.trim();
        if (!contact) {
            e.contact_number = 'Enter your contact number.';
        } else if (!PH_MOBILE_RE.test(contact.replace(/[\s\-]/g, ''))) {
            e.contact_number = 'Enter a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX)';
        }
        
        const email = d.email.trim();
        if (!email) {
            e.email = 'Enter your email address.';
        } else if (!EMAIL_RE.test(email)) {
            e.email = 'Enter a valid email address.';
        }
    }
    
    if (step === 2) {
        const username = d.username.trim();
        if (!username) {
            e.username = 'Enter a username.';
        } else if (username.length < 4) {
            e.username = 'Username must be at least 4 characters long.';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            e.username = 'Username can only contain letters, numbers, and underscores.';
        }
        
        if (!d.password) {
            e.password = 'Enter a password.';
        } else if (d.password.length < 8) {
            e.password = 'Password must be at least 8 characters long.';
        } else {
            const hasUpper = /[A-Z]/.test(d.password);
            const hasLower = /[a-z]/.test(d.password);
            const hasNumber = /\d/.test(d.password);
            const hasSpecial = /[@$!%*?&_#-]/.test(d.password);
            if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
                e.password = 'Password must include uppercase, lowercase, number, and special character.';
            }
        }
        
        if (!d.password_confirmation) {
            e.password_confirmation = 'Confirm your password.';
        } else if (d.password_confirmation !== d.password) {
            e.password_confirmation = 'Passwords don\'t match.';
        }
    }
    
    if (step === 3) {
        if (d.service_areas.length === 0) {
            e.service_areas = 'Select at least one service area.';
        }
        
        if (!d.vehicle_type) {
            e.vehicle_type = 'Select your vehicle type.';
        }
        
        const needsPlate = ['motorcycle', 'car', 'tricycle'].includes(d.vehicle_type);
        if (needsPlate && !d.plate_number.trim()) {
            e.plate_number = 'Enter your vehicle plate number.';
        }
        
        const needsLicense = ['motorcycle', 'car', 'tricycle'].includes(d.vehicle_type);
        if (needsLicense && !d.drivers_license_number.trim()) {
            e.drivers_license_number = 'Enter your driver\'s license number.';
        }
    }
    
    if (step === 4) {
        if (!d.region) {
            e.region = 'Select your region.';
        }
        
        if (d.region !== 'National Capital Region (NCR)' && !d.province) {
            e.province = 'Select your province.';
        }
        
        if (!d.city_municipality) {
            e.city_municipality = 'Select your city/municipality.';
        }
        
        if (!d.barangay) {
            e.barangay = 'Select your barangay.';
        }
    }
    
    if (step === 5) {
        const govIdErr = requiredFileError(d.government_id);
        if (govIdErr) e.government_id = govIdErr;
        
        const needsLicense = ['motorcycle', 'car', 'tricycle'].includes(d.vehicle_type);
        if (needsLicense) {
            const licenseErr = requiredFileError(d.drivers_license);
            if (licenseErr) e.drivers_license = licenseErr;
        }
        
        const needsORCR = ['motorcycle', 'car', 'tricycle'].includes(d.vehicle_type);
        if (needsORCR) {
            const orCrErr = requiredFileError(d.vehicle_or_cr);
            if (orCrErr) e.vehicle_or_cr = orCrErr;
        }
        
        if (!d.privacy_policy_accepted) {
            e.privacy_policy_accepted = 'You must accept the Privacy Policy.';
        }
    }
    
    return e;
}

const inputCls = (err?: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30 focus:border-[#3B1F6B] transition ${
        err ? 'border-red-400 bg-red-50' : 'border-[#DDD5EE]'
    }`;

const selectCls = (err?: string, disabled?: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30 focus:border-[#3B1F6B] transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1rem] bg-[center_right_0.75rem] bg-no-repeat pr-10 ${
        disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' : 'text-gray-900 cursor-pointer hover:border-[#B4A7D6]'
    } ${err ? 'border-red-400' : 'border-[#DDD5EE]'} [&>option]:text-sm [&>option]:py-2 [&>option]:px-3 [&>option:hover]:bg-[#F8F6FC] [&>option:checked]:bg-[#3B1F6B] [&>option:checked]:text-white`;

function Field({
    label, htmlFor, required, error, hint, className = '', children,
}: {
    label: string; htmlFor: string; required?: boolean; error?: string; hint?: string;
    className?: string; children: ReactNode;
}) {
    return (
        <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
            <label htmlFor={htmlFor} className="text-sm font-medium text-gray-800">
                {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
            </label>
            {children}
            {hint && !error && <span id={`${htmlFor}-hint`} className="text-xs text-gray-500">{hint}</span>}
            {error && (
                <span id={`${htmlFor}-err`} className="text-xs font-medium text-red-600" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}

function CustomSelect({
    id, value, onChange, options, placeholder, disabled, error
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder: string;
    disabled?: boolean;
    error?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={selectRef} className="relative">
            <button
                type="button"
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                aria-expanded={isOpen}
                className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9B5DE5]/20 focus:border-[#9B5DE5] transition flex items-center justify-between ${
                    disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:border-[#B4A7D6]'
                } ${error ? 'border-red-400' : 'border-[#DDD5EE]'} ${!value ? 'text-gray-400' : 'text-gray-900'}`}
            >
                <span className="block truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#DDD5EE] rounded-xl shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition ${
                                value === option.value
                                    ? 'bg-[#F8F6FC] text-[#3B1F6B] font-medium'
                                    : 'text-gray-900 hover:bg-[#F8F6FC]'
                            } ${option.value === '' ? 'text-gray-500' : ''}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function PasswordInput({
    id, value, onChange, error, autoComplete,
}: { id: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string }) {
    const [show, setShow] = useState(false);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&_#-]/.test(value);
    const hasLength = value.length >= 8;

    return (
        <div>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-err` : undefined}
                    className={`${inputCls(error)} pr-12`}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-[#3B1F6B]"
                >
                    {show ? 'Hide' : 'Show'}
                </button>
            </div>
            {value && (
                <div className="mt-2 text-xs space-y-1">
                    <div className={hasLength ? 'text-green-600' : 'text-gray-500'}>✓ 8+ characters</div>
                    <div className={hasUpper ? 'text-green-600' : 'text-gray-500'}>✓ Uppercase</div>
                    <div className={hasLower ? 'text-green-600' : 'text-gray-500'}>✓ Lowercase</div>
                    <div className={hasNumber ? 'text-green-600' : 'text-gray-500'}>✓ Number</div>
                    <div className={hasSpecial ? 'text-green-600' : 'text-gray-500'}>✓ Special character</div>
                </div>
            )}
        </div>
    );
}

function FileField({
    id, label, hint, file, error, onPick, required,
}: {
    id: string; label: string; hint: string;
    file: File | null; error?: string; onPick: (f: File | null) => void; required?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <Field label={label} htmlFor={id} required={required} error={error}>
            <div className={`flex items-center gap-3 rounded-xl p-4 ${
                file ? 'border border-[#B4A7D6] bg-white' : 'border-2 border-dashed border-[#DDD5EE] bg-[#F8F6FC]'
            }`}>
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[#F1EDFB] text-[#3B1F6B] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" strokeLinejoin="round" />
                        <path d="M14 3v5h5" strokeLinejoin="round" />
                    </svg>
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-gray-800 break-words">
                        {file ? file.name : 'No file selected'}
                    </span>
                    <span className="block text-xs text-gray-500">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : hint}
                    </span>
                </span>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0 rounded-lg border border-[#DDD5EE] bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 hover:border-[#9B5DE5] hover:text-[#3B1F6B] transition"
                >
                    {file ? 'Change' : 'Choose file'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    tabIndex={-1}
                    className="sr-only"
                    onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                />
            </div>
        </Field>
    );
}

export default function RiderRegistration() {
    const [step, setStep] = useState(1);
    const [clientErrors, setClientErrors] = useState<Errs>({});
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const [data, setDataRaw] = useState<FormShape>({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        birthdate: '',
        gender: '',
        contact_number: '',
        email: '',
        profile_picture: null,
        username: '',
        password: '',
        password_confirmation: '',
        service_areas: [],
        vehicle_type: '',
        plate_number: '',
        drivers_license_number: '',
        region: '',
        province: '',
        city_municipality: '',
        barangay: '',
        street_address: '',
        government_id: null,
        drivers_license: null,
        vehicle_or_cr: null,
        privacy_policy_accepted: false,
    });

    const allErrors: Errs = { ...clientErrors };
    Object.keys(serverErrors).forEach((key) => {
        if (serverErrors[key] && serverErrors[key].length > 0) {
            // Handle both string and array error formats
            const errorValue = serverErrors[key];
            if (Array.isArray(errorValue)) {
                allErrors[key as FieldName] = errorValue[0];
            } else if (typeof errorValue === 'string') {
                allErrors[key as FieldName] = errorValue;
            }
        }
    });

    const err = (f: FieldName) => allErrors[f];
    const summary = (Object.keys(allErrors) as FieldName[]).filter((f) => allErrors[f]);

    // PSGC API State
    const [psgcRegions, setPsgcRegions] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcProvinces, setPsgcProvinces] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcCities, setPsgcCities] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcBarangays, setPsgcBarangays] = useState<Array<{ name: string; code: string }>>([]);

    // Load PSGC data for Step 4 (Address Information)
    useEffect(() => {
        if (step === 4 && psgcRegions.length === 0) {
            psgcApi.fetchRegions().then(({ data: apiData }) => {
                setPsgcRegions(apiData);
            });
        }
    }, [step]);

    useEffect(() => {
        if (step === 4 && data.region) {
            const r = psgcRegions.find(x => x.name === data.region);
            if (r) psgcApi.fetchProvinces([r.code]).then(({ data: apiData }) => {
                setPsgcProvinces(apiData);
            });
        }
    }, [step, data.region, psgcRegions]);

    useEffect(() => {
        if (step === 4) {
            if (data.region === 'National Capital Region (NCR)') {
                const r = psgcRegions.find(x => x.name === data.region);
                if (r) psgcApi.fetchCitiesByRegion([r.code]).then(({ data: apiData }) => {
                    setPsgcCities(apiData);
                });
            } else if (data.province) {
                const p = psgcProvinces.find(x => x.name === data.province);
                if (p) psgcApi.fetchCitiesByProvince([p.code]).then(({ data: apiData }) => {
                    setPsgcCities(apiData);
                });
            }
        }
    }, [step, data.region, data.province, psgcRegions, psgcProvinces]);

    useEffect(() => {
        if (step === 4 && data.city_municipality) {
            const c = psgcCities.find(x => x.name === data.city_municipality);
            if (c) {
                psgcApi.fetchBarangays([c.code])
                    .then(({ data: apiData }) => {
                        setPsgcBarangays(apiData);
                    })
                    .catch((error) => {
                        console.error('[PSGC] Failed to fetch barangays:', error);
                        setPsgcBarangays([]);
                    });
            }
        }
    }, [step, data.city_municipality, psgcCities]);

    useEffect(() => {
        const errorFields = Object.keys(serverErrors);
        if (errorFields.length > 0) {
            const steps = errorFields
                .map((f) => FIELD_STEP[f as FieldName])
                .filter(Boolean) as number[];
            if (steps.length) {
                setStep(Math.min(...steps));
            }
        }
    }, [serverErrors]);

    const setData = <K extends keyof FormShape>(key: K, value: FormShape[K]) => {
        setDataRaw(prev => ({ ...prev, [key]: value }));
        if (clientErrors[key]) {
            setClientErrors((c) => ({ ...c, [key]: undefined }));
        }
        if (serverErrors[key]) {
            setServerErrors((s) => {
                const copy = { ...s };
                delete copy[key];
                return copy;
            });
        }
    };

    const goTo = (n: number) => {
        setStep(n);
        setTimeout(() => headingRef.current?.focus(), 0);
    };

    const goNext = () => {
        const e = validate(step, data);
        if (Object.keys(e).length) {
            setClientErrors(e);
            setTimeout(() => {
                const firstError = document.querySelector('[aria-invalid="true"]');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    (firstError as HTMLElement).focus();
                }
            }, 100);
            return;
        }
        setClientErrors({});
        if (step < TOTAL_STEPS) {
            goTo(step + 1);
        } else {
            submitRegistration();
        }
    };

    const submitRegistration = async () => {
        setSubmitting(true);
        setServerErrors({});

        // Prepare FormData for file uploads
        const formData = new FormData();
        
        // Personal Information
        formData.append('first_name', data.first_name);
        formData.append('middle_name', data.middle_name);
        formData.append('last_name', data.last_name);
        formData.append('suffix', data.suffix);
        formData.append('birthdate', data.birthdate);
        formData.append('gender', data.gender);
        formData.append('contact_number', data.contact_number);
        formData.append('email', data.email);
        if (data.profile_picture) {
            formData.append('profile_picture', data.profile_picture);
        }
        
        // Account Information
        formData.append('username', data.username);
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
        
        // Delivery Information
        data.service_areas.forEach((area, index) => {
            formData.append(`service_areas[${index}]`, area);
        });
        formData.append('vehicle_type', data.vehicle_type);
        formData.append('plate_number', data.plate_number);
        formData.append('drivers_license_number', data.drivers_license_number);
        
        // Address Information
        formData.append('region', data.region);
        formData.append('province', data.province);
        formData.append('city_municipality', data.city_municipality);
        formData.append('barangay', data.barangay);
        formData.append('street_address', data.street_address);
        
        // Supporting Documents
        if (data.government_id) {
            formData.append('government_id', data.government_id);
        }
        if (data.drivers_license) {
            formData.append('drivers_license', data.drivers_license);
        }
        if (data.vehicle_or_cr) {
            formData.append('vehicle_or_cr', data.vehicle_or_cr);
        }
        
        // Privacy Policy
        formData.append('privacy_policy_accepted', data.privacy_policy_accepted ? '1' : '0');

        // Submit using Inertia router
        router.post('/register/rider', formData, {
            forceFormData: true,
            onSuccess: () => {
                // Redirect to pending page or show success message
                alert('Rider registration submitted successfully! Your application is now pending approval.');
                // Optionally redirect to a pending page
                // router.visit('/register/rider/pending');
            },
            onError: (errors: any) => {
                console.error('Validation errors:', errors);
                setServerErrors(errors);
                setSubmitting(false);
                
                // Scroll to first error
                setTimeout(() => {
                    const firstError = document.querySelector('[aria-invalid="true"]');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        (firstError as HTMLElement).focus();
                    }
                }, 100);
            },
            onFinish: () => {
                setSubmitting(false);
            },
        });
    };

    const goBack = () => {
        if (step > 1) {
            setClientErrors({});
            goTo(step - 1);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        goNext();
    };

    const focusField = (f: FieldName) => document.getElementById(f as string)?.focus();

    const stepTitles = [
        'Personal Information',
        'Account Information',
        'Delivery Information',
        'Address Information',
        'Supporting Documents'
    ];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden" style={fontPoppins}>
            {/* Mobile header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B1F6B]" />
                    <h1 className="text-base font-bold tracking-widest text-gray-900" style={fontSyncopate}>mimoo</h1>
                </Link>
                <span className="text-xs bg-[#F1EDFB] text-[#3B1F6B] px-3 py-1 rounded-full font-medium" style={fontSFCompact}>
                    STEP {step} OF {TOTAL_STEPS}
                </span>
            </div>

            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex lg:w-80 lg:h-screen lg:sticky lg:top-0 shrink-0 flex-col gap-9 px-8 pt-10 pb-10 text-[#F1EEFB]"
                style={{ background: 'radial-gradient(120% 140% at 15% 0%, #2B2249 0%, #201A33 60%)' }}
            >
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#9B5DE5]" />
                        <h1 className="text-lg font-bold tracking-widest" style={fontSyncopate}>mimoo</h1>
                    </Link>
                    <div className="mt-6">
                        <span
                            key={step}
                            className="text-xs bg-white/10 px-3 py-1 rounded-full inline-block"
                            style={fontSFCompact}
                        >
                            STEP {step} OF {TOTAL_STEPS}
                        </span>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-[1.7rem] leading-tight font-black mb-2.5" style={fontCalibri}>
                        Register as a Rider
                    </h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Join our logistics network. An admin will review your application.
                    </p>
                </div>

                <div className="relative z-10 mt-auto flex flex-col gap-4">
                    <p className="uppercase tracking-[0.08em] text-[0.7rem] font-bold text-[#B4A7D6]" style={fontSFCompact}>
                        Registration Steps
                    </p>
                    <ol className="flex flex-col gap-3.5">
                        {SIDEBAR_STEPS.map((label, i) => {
                            const isDone = i + 1 < step;
                            const isCurrent = i + 1 === step;
                            return (
                                <li key={label} className="flex items-start gap-3 text-[0.85rem]">
                                    <span className={`relative mt-0.5 w-5 h-5 shrink-0 rounded-full border-[1.5px] flex items-center justify-center ${
                                        isDone ? 'bg-[#B4A7D6] border-[#B4A7D6]' :
                                        isCurrent ? 'border-white' : 'border-[#B4A7D6]'
                                    }`}>
                                        {isDone && <span className="w-1.5 h-1.5 rounded-full bg-[#201A33]" />}
                                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </span>
                                    <span className={isDone || isCurrent ? 'text-white' : 'text-white/40'}>{label}</span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <p className="relative z-10 border-t border-white/10 pt-4 text-[0.78rem] text-[#B4A7D6]">
                    Your information is only used to verify your rider registration.
                </p>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
                <div className="max-w-3xl mx-auto lg:mx-0">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            rider registration
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            For delivery riders joining our logistics network.
                        </p>
                    </div>
                    <p className="text-gray-500 mt-1 text-xs">
                        Fields marked <span className="text-red-600">*</span> are required.
                    </p>

                    <StepProgress currentStep={step} />

                    {/* Error summary */}
                    {summary.length > 0 && (
                        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                            <h3 className="text-sm font-semibold mb-1">Please fix the following:</h3>
                            <ul className="list-disc pl-5 text-sm">
                                {summary.map((f) => (
                                    <li key={f}>
                                        <button type="button" onClick={() => focusField(f)} className="underline">
                                            {FIELD_LABEL[f]}
                                        </button>: {allErrors[f]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6" noValidate>
                        <h3
                            ref={headingRef}
                            tabIndex={-1}
                            className="text-xs font-semibold uppercase tracking-wide text-[#7A63AC] mb-4 focus:outline-none"
                            style={fontSFCompact}
                        >
                            Step {step} · {stepTitles[step - 1]}
                        </h3>

                        {/* STEP 1: Personal Information */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="First Name" htmlFor="first_name" required error={err('first_name')}>
                                        <input
                                            id="first_name"
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            autoComplete="given-name"
                                            placeholder="e.g., Juan"
                                            aria-invalid={!!err('first_name')}
                                            className={inputCls(err('first_name'))}
                                        />
                                    </Field>

                                    <Field label="Middle Name" htmlFor="middle_name" hint="Optional">
                                        <input
                                            id="middle_name"
                                            type="text"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                            placeholder="Optional"
                                            className={inputCls()}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Last Name" htmlFor="last_name" required error={err('last_name')}>
                                        <input
                                            id="last_name"
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            autoComplete="family-name"
                                            placeholder="e.g., Dela Cruz"
                                            aria-invalid={!!err('last_name')}
                                            className={inputCls(err('last_name'))}
                                        />
                                    </Field>

                                    <Field label="Suffix" htmlFor="suffix" hint="e.g., Jr., Sr., III (Optional)">
                                        <input
                                            id="suffix"
                                            type="text"
                                            value={data.suffix}
                                            onChange={(e) => setData('suffix', e.target.value)}
                                            placeholder="Optional"
                                            className={inputCls()}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Birthdate" htmlFor="birthdate" required error={err('birthdate')} hint="You must be 18 years or older">
                                        <input
                                            id="birthdate"
                                            type="date"
                                            value={data.birthdate}
                                            onChange={(e) => setData('birthdate', e.target.value)}
                                            aria-invalid={!!err('birthdate')}
                                            className={inputCls(err('birthdate'))}
                                        />
                                    </Field>

                                    <Field label="Gender" htmlFor="gender" required error={err('gender')}>
                                        <CustomSelect
                                            id="gender"
                                            value={data.gender}
                                            onChange={(value) => setData('gender', value)}
                                            options={[
                                                { value: '', label: 'Select gender' },
                                                { value: 'male', label: 'Male' },
                                                { value: 'female', label: 'Female' },
                                                { value: 'other', label: 'Other' },
                                            ]}
                                            placeholder="Select gender"
                                            error={err('gender')}
                                        />
                                    </Field>
                                </div>

                                <Field label="Contact Number" htmlFor="contact_number" required error={err('contact_number')} hint="09XXXXXXXXX or +639XXXXXXXXX">
                                    <input
                                        id="contact_number"
                                        type="tel"
                                        inputMode="numeric"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value.replace(/[^\d+]/g, ''))}
                                        autoComplete="tel"
                                        placeholder="09171234567"
                                        aria-invalid={!!err('contact_number')}
                                        className={inputCls(err('contact_number'))}
                                    />
                                </Field>

                                <Field label="Email Address" htmlFor="email" required error={err('email')}>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="email"
                                        placeholder="your.email@example.com"
                                        aria-invalid={!!err('email')}
                                        className={inputCls(err('email'))}
                                    />
                                </Field>

                                <FileField
                                    id="profile_picture"
                                    label="Profile Picture"
                                    hint="PDF, JPG, or PNG (Max 5MB) - Optional"
                                    file={data.profile_picture}
                                    error={err('profile_picture')}
                                    onPick={(f) => setData('profile_picture', f)}
                                />
                            </div>
                        )}

                        {/* STEP 2: Account Information */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="rounded-xl bg-[#F1EDFB] border border-[#DDD5EE] p-4 text-sm text-gray-700">
                                    <p className="font-semibold mb-1">ℹ️ Rider ID</p>
                                    <p>Your Rider ID will be auto-generated after admin approval.</p>
                                </div>

                                <Field label="Username" htmlFor="username" required error={err('username')} hint="4+ characters, letters, numbers, and underscores only">
                                    <input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        autoComplete="username"
                                        placeholder="e.g., jdelacruz_rider"
                                        aria-invalid={!!err('username')}
                                        className={inputCls(err('username'))}
                                    />
                                </Field>

                                <Field label="Password" htmlFor="password" required error={err('password')}>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(v) => setData('password', v)}
                                        error={err('password')}
                                        autoComplete="new-password"
                                    />
                                </Field>

                                <Field label="Confirm Password" htmlFor="password_confirmation" required error={err('password_confirmation')}>
                                    <PasswordInput
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(v) => setData('password_confirmation', v)}
                                        error={err('password_confirmation')}
                                        autoComplete="new-password"
                                    />
                                </Field>
                            </div>
                        )}

                        {/* STEP 3: Delivery Information */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
                                    <p className="font-semibold mb-1">ℹ️ Important</p>
                                    <p>Select your service areas. The courier company will assign you to an appropriate branch based on your coverage.</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-800 block mb-1.5">
                                        Area of Service <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Manila, Quezon City, Makati (separated by commas)"
                                        value={data.service_areas.join(', ')}
                                        onChange={(e) => {
                                            const areas = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
                                            setData('service_areas', areas);
                                        }}
                                        aria-invalid={!!err('service_areas')}
                                        className={inputCls(err('service_areas'))}
                                    />
                                    {err('service_areas') && (
                                        <span className="text-xs font-medium text-red-600 mt-1.5 block">{err('service_areas')}</span>
                                    )}
                                    <span className="text-xs text-gray-500 mt-1.5 block">Enter municipalities/cities where you can deliver</span>
                                </div>

                                <div>
                                    <RadioCards
                                        label="Vehicle Type"
                                        required={true}
                                        options={VEHICLE_TYPES}
                                        selected={data.vehicle_type}
                                        onChange={(value) => setData('vehicle_type', value)}
                                        error={err('vehicle_type')}
                                    />
                                </div>

                                {['motorcycle', 'car', 'tricycle'].includes(data.vehicle_type) && (
                                    <>
                                        <Field label="Plate Number" htmlFor="plate_number" required error={err('plate_number')}>
                                            <input
                                                id="plate_number"
                                                type="text"
                                                value={data.plate_number}
                                                onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                                                placeholder="ABC 1234"
                                                aria-invalid={!!err('plate_number')}
                                                className={inputCls(err('plate_number'))}
                                            />
                                        </Field>

                                        <Field label="Driver's License Number" htmlFor="drivers_license_number" required error={err('drivers_license_number')}>
                                            <input
                                                id="drivers_license_number"
                                                type="text"
                                                value={data.drivers_license_number}
                                                onChange={(e) => setData('drivers_license_number', e.target.value)}
                                                placeholder="N00-00-000000"
                                                aria-invalid={!!err('drivers_license_number')}
                                                className={inputCls(err('drivers_license_number'))}
                                            />
                                        </Field>
                                    </>
                                )}

                                {data.vehicle_type === 'bicycle' && (
                                    <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-900">
                                        <p className="font-semibold mb-1">✓ Bicycle Delivery</p>
                                        <p>No plate number or driver's license required for bicycle delivery.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: Address Information */}
                        {step === 4 && (
                            <div className="space-y-5">
                                <Field label="Region" htmlFor="region" required error={err('region')}>
                                    <CustomSelect
                                        id="region"
                                        value={data.region}
                                        onChange={(value) => {
                                            setData('region', value);
                                            setData('province', '');
                                            setData('city_municipality', '');
                                            setData('barangay', '');
                                        }}
                                        options={[
                                            { value: '', label: 'Select region' },
                                            ...psgcRegions.map(r => ({ value: r.name, label: r.name }))
                                        ]}
                                        placeholder="Select region"
                                        error={err('region')}
                                    />
                                </Field>

                                {data.region && data.region !== 'National Capital Region (NCR)' && (
                                    <Field label="Province" htmlFor="province" required error={err('province')}>
                                        <CustomSelect
                                            id="province"
                                            value={data.province}
                                            onChange={(value) => {
                                                setData('province', value);
                                                setData('city_municipality', '');
                                                setData('barangay', '');
                                            }}
                                            options={[
                                                { value: '', label: 'Select province' },
                                                ...psgcProvinces.map(p => ({ value: p.name, label: p.name }))
                                            ]}
                                            placeholder="Select province"
                                            error={err('province')}
                                        />
                                    </Field>
                                )}

                                <Field label="City/Municipality" htmlFor="city_municipality" required error={err('city_municipality')}>
                                    <CustomSelect
                                        id="city_municipality"
                                        value={data.city_municipality}
                                        onChange={(value) => {
                                            setData('city_municipality', value);
                                            setData('barangay', '');
                                        }}
                                        options={[
                                            { value: '', label: 'Select city/municipality' },
                                            ...psgcCities.map(c => ({ value: c.name, label: c.name }))
                                        ]}
                                        placeholder="Select city/municipality"
                                        disabled={!data.region || (data.region !== 'National Capital Region (NCR)' && !data.province)}
                                        error={err('city_municipality')}
                                    />
                                </Field>

                                <Field label="Barangay" htmlFor="barangay" required error={err('barangay')}>
                                    <CustomSelect
                                        id="barangay"
                                        value={data.barangay}
                                        onChange={(value) => setData('barangay', value)}
                                        options={[
                                            { value: '', label: 'Select barangay' },
                                            ...psgcBarangays.map(b => ({ value: b.name, label: b.name }))
                                        ]}
                                        placeholder="Select barangay"
                                        disabled={!data.city_municipality}
                                        error={err('barangay')}
                                    />
                                </Field>

                                <Field label="Street / House Number" htmlFor="street_address" hint="Optional">
                                    <input
                                        id="street_address"
                                        type="text"
                                        value={data.street_address}
                                        onChange={(e) => setData('street_address', e.target.value)}
                                        placeholder="e.g., 123 Main Street, Building A"
                                        className={inputCls()}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* STEP 5: Supporting Documents */}
                        {step === 5 && (
                            <div className="space-y-5">
                                <FileField
                                    id="government_id"
                                    label="Valid Government ID"
                                    hint="PDF, JPG, or PNG (Max 5MB)"
                                    file={data.government_id}
                                    error={err('government_id')}
                                    onPick={(f) => setData('government_id', f)}
                                    required
                                />

                                {['motorcycle', 'car', 'tricycle'].includes(data.vehicle_type) && (
                                    <>
                                        <FileField
                                            id="drivers_license"
                                            label="Driver's License"
                                            hint="PDF, JPG, or PNG (Max 5MB)"
                                            file={data.drivers_license}
                                            error={err('drivers_license')}
                                            onPick={(f) => setData('drivers_license', f)}
                                            required
                                        />

                                        <FileField
                                            id="vehicle_or_cr"
                                            label="Vehicle Registration (OR/CR)"
                                            hint="PDF, JPG, or PNG (Max 5MB)"
                                            file={data.vehicle_or_cr}
                                            error={err('vehicle_or_cr')}
                                            onPick={(f) => setData('vehicle_or_cr', f)}
                                            required
                                        />
                                    </>
                                )}

                                <div className="flex items-start gap-3 rounded-xl border border-[#DDD5EE] bg-white p-4">
                                    <input
                                        id="privacy_policy_accepted"
                                        type="checkbox"
                                        checked={data.privacy_policy_accepted}
                                        onChange={(e) => setData('privacy_policy_accepted', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 text-[#3B1F6B] rounded border-gray-300 focus:ring-[#3B1F6B]"
                                        aria-invalid={!!err('privacy_policy_accepted')}
                                    />
                                    <label htmlFor="privacy_policy_accepted" className="text-sm text-gray-700">
                                        I have read and agree to the{' '}
                                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3B1F6B] underline">
                                            Privacy Policy
                                        </a>{' '}
                                        and{' '}
                                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#3B1F6B] underline">
                                            Terms of Service
                                        </a>
                                        . <span className="text-red-600">*</span>
                                    </label>
                                </div>
                                {err('privacy_policy_accepted') && (
                                    <span className="text-xs font-medium text-red-600 block">{err('privacy_policy_accepted')}</span>
                                )}
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="mt-8 flex items-center justify-between gap-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={goBack}
                                    disabled={submitting}
                                    className="rounded-lg border-2 border-[#DDD5EE] bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:border-[#3B1F6B] hover:text-[#3B1F6B] transition disabled:opacity-50"
                                >
                                    ← Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="ml-auto rounded-lg bg-[#3B1F6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2E1854] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : step < TOTAL_STEPS ? 'Continue →' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

RiderRegistration.layout = (page: ReactNode) => page;
