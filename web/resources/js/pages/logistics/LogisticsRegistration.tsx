import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import StepProgress from '../../components/registration/StepProgress';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

const TOTAL_STEPS = 4;
const MAX_FILE_MB = 5;
const PH_MOBILE_RE = /^09\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEC_RE = /^[A-Z]{2}\d{9}$/;
const TIN_RE = /^\d{9}-\d{3}$/;
const NCR_NAME = "National Capital Region (NCR)";

const NCR_DISTRICTS = [
    '1st District (Manila)',
    '2nd District (Marikina, Pasig, Quezon City - East)',
    '3rd District (Caloocan, Malabon, Navotas, Valenzuela)',
    '4th District (Las PiÃ±as, Muntinlupa, ParaÃ±aque, Pasay, Taguig)',
];

const SIDEBAR_STEPS = [
    'Company information and registration details',
    'Business address and postal code',
    'Contact person details and coverage areas',
    'Upload documents and set password',
];

const REGIONS = [
    'National Capital Region (NCR)',
    'CAR',
    'Region I (Ilocos Region)',
    'Region II (Cagayan Valley)',
    'Region III (Central Luzon)',
    'Region IV-A (CALABARZON)',
    'MIMAROPA (Region IV-B)',
    'Region V (Bicol Region)',
    'Region VI (Western Visayas)',
    'Region VII (Central Visayas)',
    'Region VIII (Eastern Visayas)',
    'Region IX (Zamboanga Peninsula)',
    'Region X (Northern Mindanao)',
    'Region XI (Davao Region)',
    'Region XII (SOCCSKSARGEN)',
    'Region XIII (Caraga)',
    'BARMM',
];

// PSGC API Types
interface Region { code: string; name: string; }
interface Province { code: string; name: string; regionCode: string }
interface CityMunicipality { code: string; name: string; provinceCode: string }
interface Barangay { code: string; name: string; cityCode: string }

type FormShape = {
    // Step 1: Company
    company_name: string;
    sec_registration_no: string;
    tin: string;
    // Step 2: Business Address
    region: string;
    province: string;
    district: string; // NCR only: 1st-4th District
    municipality_city: string;
    barangay: string;
    street_address: string;
    postal_code: string;
    // Step 3: Contact Person & Coverage
    contact_first_name: string;
    contact_last_name: string;
    contact_position: string;
    email: string;
    contact_number: string;
    service_areas: string[]; // Multiple regions
    // Step 4: Documents & Password
    sec_certificate: File | null;
    bir_form_2303: File | null;
    business_permit: File | null;
    valid_id: File | null;
    password: string;
    password_confirmation: string;
    privacy_policy_accepted: boolean;
    account_type: string;
    // Hidden fields mapped from contact person
    first_name: string;
    last_name: string;
    sex: string;
    birthday: string;
    middle_initial: string;
    business_name: string;
};

type FieldName = keyof FormShape;
type Errs = Partial<Record<FieldName, string>>;

const FIELD_STEP: Partial<Record<FieldName, number>> = {
    company_name: 1, sec_registration_no: 1, tin: 1,
    region: 2, province: 2, district: 2, municipality_city: 2, barangay: 2, street_address: 2, postal_code: 2,
    contact_first_name: 3, contact_last_name: 3, contact_position: 3, email: 3, contact_number: 3, service_areas: 3,
    sec_certificate: 4, bir_form_2303: 4, business_permit: 4, valid_id: 4, password: 4, password_confirmation: 4,
};

const FIELD_LABEL: Partial<Record<FieldName, string>> = {
    company_name: 'Company Name',
    sec_registration_no: 'SEC Registration No.',
    tin: 'TIN',
    region: 'Region',
    province: 'Province',
    district: 'District',
    municipality_city: 'City / Municipality',
    barangay: 'Barangay',
    street_address: 'Street Address',
    postal_code: 'Postal Code',
    contact_first_name: 'Contact Person First Name',
    contact_last_name: 'Contact Person Last Name',
    contact_position: 'Position',
    email: 'Email',
    contact_number: 'Mobile Number',
    service_areas: 'Service Areas',
    sec_certificate: 'SEC Certificate',
    bir_form_2303: 'BIR Form 2303',
    business_permit: 'Mayor\'s / Business Permit',
    valid_id: 'Valid ID of Authorized Representative',
    password: 'Password',
    password_confirmation: 'Confirm Password',
    privacy_policy_accepted: 'Privacy Policy',
};

function requiredFileError(f: File | null): string | undefined {
    if (!f) return 'This file is required.';
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return 'Use a PDF, JPG or PNG file.';
    if (f.size > MAX_FILE_MB * 1024 * 1024) return `File is too large. Max ${MAX_FILE_MB}MB.`;
    return undefined;
}

function validate(step: number, d: FormShape): Errs {
    const e: Errs = {};
    if (step === 1) {
        if (!d.company_name.trim()) e.company_name = 'Enter company name.';
        if (!SEC_RE.test(d.sec_registration_no.trim())) e.sec_registration_no = '2 letters followed by 9 digits (e.g. CS202012345).';
        if (!TIN_RE.test(d.tin.trim())) e.tin = '9-digit TIN plus 3-digit branch code (e.g. 123456789-000).';
    }
    if (step === 2) {
        const isNCR = d.region === NCR_NAME;
        if (!d.region) e.region = 'Select a region.';
        if (!isNCR && !d.province) e.province = 'Select a province.';
        if (isNCR && !d.district) e.district = 'Select a district.';
        if (!d.municipality_city) e.municipality_city = 'Select a city or municipality.';
        if (!d.barangay) e.barangay = 'Select a barangay.';
        if (!d.street_address.trim()) e.street_address = 'Enter street address.';
        if (!d.postal_code.trim()) e.postal_code = 'Enter postal code.';
    }
    if (step === 3) {
        if (!d.contact_first_name.trim()) e.contact_first_name = 'Enter first name.';
        if (!d.contact_last_name.trim()) e.contact_last_name = 'Enter last name.';
        if (!d.contact_position.trim()) e.contact_position = 'Enter position.';
        if (!EMAIL_RE.test(d.email.trim())) e.email = 'Enter a valid email address.';
        if (!PH_MOBILE_RE.test(d.contact_number.trim())) e.contact_number = 'Enter a valid PH mobile number (09XXXXXXXXX).';
        if (!d.service_areas.length) e.service_areas = 'Choose at least one region you deliver to.';
    }
    if (step === 4) {
        const secErr = requiredFileError(d.sec_certificate);
        if (secErr) e.sec_certificate = secErr;
        const birErr = requiredFileError(d.bir_form_2303);
        if (birErr) e.bir_form_2303 = birErr;
        const permitErr = requiredFileError(d.business_permit);
        if (permitErr) e.business_permit = permitErr;
        const idErr = requiredFileError(d.valid_id);
        if (idErr) e.valid_id = idErr;
        if (d.password.length < 8) e.password = 'Use at least 8 characters.';
        const hasUpper = /[A-Z]/.test(d.password);
        const hasLower = /[a-z]/.test(d.password);
        const hasNumber = /\d/.test(d.password);
        const hasSpecial = /[^A-Za-z0-9]/.test(d.password);
        if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            e.password = 'Password must include uppercase, lowercase, number, and special character.';
        }
        if (!d.password_confirmation || d.password_confirmation !== d.password)
            e.password_confirmation = "Passwords don't match.";
        if (!d.privacy_policy_accepted) e.privacy_policy_accepted = 'You must accept the Privacy Policy.';
    }
    return e;
}

const inputCls = (err?: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30 focus:border-[#3B1F6B] transition ${
        err ? 'border-red-400 bg-red-50' : 'border-[#DDD5EE]'
    }`;

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

function PasswordInput({
    id, value, onChange, error, autoComplete,
}: { id: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string }) {
    const [show, setShow] = useState(false);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
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
                    <div className={hasLength ? 'text-green-600' : 'text-gray-500'}>âœ“ 8+ characters</div>
                    <div className={hasUpper ? 'text-green-600' : 'text-gray-500'}>âœ“ Uppercase</div>
                    <div className={hasLower ? 'text-green-600' : 'text-gray-500'}>âœ“ Lowercase</div>
                    <div className={hasNumber ? 'text-green-600' : 'text-gray-500'}>âœ“ Number</div>
                    <div className={hasSpecial ? 'text-green-600' : 'text-gray-500'}>âœ“ Special character</div>
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

export default function LogisticsRegistration() {
    const [step, setStep] = useState(1);
    const [clientErrors, setClientErrors] = useState<Errs>({});
    const headingRef = useRef<HTMLHeadingElement>(null);

    // PSGC API states
    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<CityMunicipality[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [loading, setLoading] = useState({ regions: false, provinces: false, cities: false, barangays: false });

    const { data, setData, post, processing, errors } = useForm<FormShape>({
        company_name: '',
        sec_registration_no: '',
        tin: '',
        region: '',
        province: '',
        district: '',
        municipality_city: '',
        barangay: '',
        street_address: '',
        postal_code: '',
        contact_first_name: '',
        contact_last_name: '',
        contact_position: '',
        email: '',
        contact_number: '',
        service_areas: [],
        sec_certificate: null,
        bir_form_2303: null,
        business_permit: null,
        valid_id: null,
        password: '',
        password_confirmation: '',
        privacy_policy_accepted: false,
        account_type: 'logistics',
        // Mapped fields
        first_name: '',
        last_name: '',
        sex: 'male', // Default value since not collected
        birthday: '1990-01-01', // Default value since not collected  
        middle_initial: '',
        business_name: '',
    });

    const allErrors: Errs = { ...(errors as Errs), ...clientErrors };
    const err = (f: FieldName) => allErrors[f];
    const summary = (Object.keys(clientErrors) as FieldName[]).filter((f) => clientErrors[f]);

    // Check if selected region is NCR (flexible matching)
    const isNCR = data.region.toUpperCase().includes('NCR') || data.region === NCR_NAME;

    // Load regions on mount
    useEffect(() => {
        setLoading((prev) => ({ ...prev, regions: true }));
        fetch('https://psgc.gitlab.io/api/regions/')
            .then((res) => res.json())
            .then((list: Region[]) => {
                setRegions(list.sort((a, b) => a.name.localeCompare(b.name)));
                setLoading((prev) => ({ ...prev, regions: false }));
            })
            .catch(() => setLoading((prev) => ({ ...prev, regions: false })));
    }, []);

    // Load provinces when region changes (skip for NCR)
    useEffect(() => {
        if (!data.region) {
            // Clear all when no region selected
            setProvinces([]);
            setCities([]);
            setBarangays([]);
            return;
        }

        const selected = regions.find((r) => r.name === data.region);
        if (!selected) return;

        if (isNCR) {
            // For NCR, load cities directly from region
            setProvinces([]);
            setData('province', 'N/A'); // Set province to N/A for NCR
            setLoading((prev) => ({ ...prev, cities: true }));
            fetch(`https://psgc.gitlab.io/api/regions/${selected.code}/cities-municipalities/`)
                .then((res) => res.json())
                .then((list: CityMunicipality[]) => {
                    setCities(list.sort((a, b) => a.name.localeCompare(b.name)));
                    setLoading((prev) => ({ ...prev, cities: false }));
                })
                .catch(() => setLoading((prev) => ({ ...prev, cities: false })));
        } else {
            // For non-NCR, load provinces first
            setCities([]);
            setLoading((prev) => ({ ...prev, provinces: true }));
            fetch(`https://psgc.gitlab.io/api/regions/${selected.code}/provinces/`)
                .then((res) => res.json())
                .then((list: Province[]) => {
                    setProvinces(list.sort((a, b) => a.name.localeCompare(b.name)));
                    setLoading((prev) => ({ ...prev, provinces: false }));
                })
                .catch(() => setLoading((prev) => ({ ...prev, provinces: false })));
        }
    }, [data.region, regions]);

    // Load cities/municipalities when province changes (only for non-NCR)
    useEffect(() => {
        if (isNCR) {
            // Cities already loaded for NCR in region effect
            return;
        }

        if (data.province && data.province !== 'N/A') {
            const selected = provinces.find((p) => p.name === data.province);
            if (selected) {
                setLoading((prev) => ({ ...prev, cities: true }));
                fetch(`https://psgc.gitlab.io/api/provinces/${selected.code}/cities-municipalities/`)
                    .then((res) => res.json())
                    .then((list: CityMunicipality[]) => {
                        setCities(list.sort((a, b) => a.name.localeCompare(b.name)));
                        setLoading((prev) => ({ ...prev, cities: false }));
                    })
                    .catch(() => setLoading((prev) => ({ ...prev, cities: false })));
            }
        } else {
            setCities([]);
        }
    }, [data.province, provinces, isNCR]);

    // Load barangays when city/municipality changes
    useEffect(() => {
        if (data.municipality_city) {
            const selected = cities.find((c) => c.name === data.municipality_city);
            if (selected) {
                setLoading((prev) => ({ ...prev, barangays: true }));
                fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selected.code}/barangays/`)
                    .then((res) => res.json())
                    .then((list: Barangay[]) => {
                        setBarangays(list.sort((a, b) => a.name.localeCompare(b.name)));
                        setLoading((prev) => ({ ...prev, barangays: false }));
                    })
                    .catch(() => setLoading((prev) => ({ ...prev, barangays: false })));
            }
        } else {
            setBarangays([]);
        }
    }, [data.municipality_city, cities]);

    // Kapag may server-side error, ibalik sa step na may unang error
    useEffect(() => {
        const steps = (Object.keys(errors) as FieldName[]).map((f) => FIELD_STEP[f]).filter(Boolean) as number[];
        if (steps.length) setStep(Math.min(...steps));
    }, [errors]);

    const set = <K extends FieldName>(key: K, value: FormShape[K]) => {
        setData(key, value as any);
        if (clientErrors[key]) setClientErrors((c) => ({ ...c, [key]: undefined }));
    };

    const toggleServiceArea = (region: string) => {
        const current = data.service_areas;
        if (current.includes(region)) {
            set('service_areas', current.filter((r) => r !== region));
        } else {
            set('service_areas', [...current, region]);
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
            return;
        }
        setClientErrors({});
        if (step < TOTAL_STEPS) goTo(step + 1);
        else {
            const email = data.email.trim();
            
            // Build rep_full_name from contact person names
            const repFullName = `${data.contact_first_name.trim()} ${data.contact_last_name.trim()}`.trim();
            
            // Build full address for business_address field
            const addressParts = [
                data.street_address,
                data.barangay,
                data.municipality_city,
                data.region === NCR_NAME ? data.district : data.province,
                data.region,
                data.postal_code ? `Postal Code: ${data.postal_code}` : '',
            ].filter(Boolean);
            const businessAddress = addressParts.join(', ');
            
            // Build the regions_served array from service_areas
            const regionsServed = data.service_areas.length > 0 ? data.service_areas : [];
            
            // Create FormData with all the mapped fields
            const formData = new FormData();
            
            // Personal/Account fields (mapped from contact person)
            formData.append('first_name', data.contact_first_name.trim());
            formData.append('last_name', data.contact_last_name.trim());
            formData.append('middle_initial', data.middle_initial || '');
            formData.append('sex', data.sex);
            formData.append('email', data.email.trim());
            formData.append('contact_number', data.contact_number.trim());
            formData.append('birthday', data.birthday);
            formData.append('account_type', 'logistics');
            formData.append('applicant_type', 'logistics');
            
            // Company fields
            formData.append('company_name', data.company_name.trim());
            formData.append('trade_name', data.company_name.trim()); // Backend requires this
            formData.append('business_email', data.email.trim());
            formData.append('business_address', businessAddress);
            formData.append('company_contact_number', data.contact_number.trim());
            formData.append('rep_contact_number', data.contact_number.trim());
            formData.append('company_website', '');
            formData.append('sec_registration_no', data.sec_registration_no.trim());
            formData.append('tin', data.tin.trim());
            
            // Contact person details
            formData.append('rep_full_name', repFullName);
            formData.append('contact_first_name', data.contact_first_name.trim());
            formData.append('contact_last_name', data.contact_last_name.trim());
            formData.append('contact_position', data.contact_position.trim());
            
            // Address fields
            formData.append('region', data.region);
            formData.append('province', data.province || 'N/A');
            formData.append('district', data.district || '');
            formData.append('municipality_city', data.municipality_city);
            formData.append('barangay', data.barangay);
            formData.append('street_address', data.street_address.trim());
            formData.append('postal_code', data.postal_code.trim());
            
            // Service coverage - arrays (must append as individual items, not JSON)
            regionsServed.forEach((region, index) => {
                formData.append(`regions_served[${index}]`, region);
            });
            // DON'T send empty arrays - backend will treat missing as empty array
            // provinces_served is optional (nullable in validation)
            // cities_served is REQUIRED but form doesn't collect it - send default
            formData.append('cities_served[0]', 'Metro Manila'); // Default city since form doesn't collect this
            // delivery_services is required
            formData.append('delivery_services[0]', 'standard');
            formData.append('pickup_available', 'no');
            formData.append('estimated_delivery_time', '3-5 business days');
            
            // Documents - files
            if (data.sec_certificate) formData.append('sec_certificate', data.sec_certificate);
            if (data.bir_form_2303) formData.append('bir_2303', data.bir_form_2303);
            if (data.business_permit) formData.append('business_permit', data.business_permit);
            if (data.valid_id) {
                formData.append('valid_id', data.valid_id);
                formData.append('proof_of_address', data.valid_id); // Same file
            }
            
            // Security
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);
            formData.append('privacy_policy_accepted', data.privacy_policy_accepted ? '1' : '0');
            
            // Debug log
            console.log('=== SUBMITTING FORM ===');
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(pair[0], ':', pair[1].name);
                } else {
                    console.log(pair[0], ':', pair[1]);
                }
            }
            
            // Submit using fetch API directly since we need full control over FormData
            fetch('/register', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
                } else {
                    return response.json().then(data => {
                        console.error('Validation errors:', data.errors);
                        const errorMessages = Object.keys(data.errors || {})
                            .map(k => `• ${k}: ${data.errors[k]}`)
                            .join('\n');
                        alert(`Registration failed:\n\n${errorMessages}`);
                    });
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                alert('Network error occurred. Please try again.');
            });
        }
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

    const focusField = (f: FieldName) => document.getElementById(f)?.focus();

    const stepTitles = ['Company', 'Business Address', 'Contact Person & Coverage', 'Documents & Account'];

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
                {/* Brand + badge */}
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

                {/* Hero copy */}
                <div className="relative z-10">
                    <h2 className="text-[1.7rem] leading-tight font-black mb-2.5" style={fontCalibri}>
                        Register your logistics company
                    </h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Join our logistics network. An admin will review your application.
                    </p>
                </div>

                {/* How it works */}
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
                    Your information is only used to verify your company registration.
                </p>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
                <div className="max-w-3xl mx-auto lg:mx-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                        logistics partner registration
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        For sorting centers and courier companies.
                    </p>
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
                                        </button>
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
                            Step {step} Â· {stepTitles[step - 1]}
                        </h3>

                        {/* STEP 1: Company */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <Field label="Company Name" htmlFor="company_name" required error={err('company_name')}>
                                    <input
                                        id="company_name"
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => set('company_name', e.target.value)}
                                        className={inputCls(err('company_name'))}
                                    />
                                </Field>

                                <Field 
                                    label="SEC Registration No." 
                                    htmlFor="sec_registration_no" 
                                    required 
                                    error={err('sec_registration_no')}
                                    hint="2 letters followed by 9 digits, e.g. CS202012345"
                                >
                                    <input
                                        id="sec_registration_no"
                                        type="text"
                                        value={data.sec_registration_no}
                                        onChange={(e) => set('sec_registration_no', e.target.value.toUpperCase())}
                                        placeholder="CS202012345"
                                        maxLength={11}
                                        className={inputCls(err('sec_registration_no'))}
                                    />
                                </Field>

                                <Field 
                                    label="TIN" 
                                    htmlFor="tin" 
                                    required 
                                    error={err('tin')}
                                    hint="9-digit TIN plus 3-digit branch code"
                                >
                                    <input
                                        id="tin"
                                        type="text"
                                        value={data.tin}
                                        onChange={(e) => set('tin', e.target.value)}
                                        placeholder="123456789-000"
                                        maxLength={13}
                                        className={inputCls(err('tin'))}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* STEP 2: Business Address */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <Field label="Region" htmlFor="region" required error={err('region')}>
                                    <select
                                        id="region"
                                        value={data.region}
                                        onChange={(e) => {
                                            set('region', e.target.value);
                                            set('province', '');
                                            set('district', '');
                                            set('municipality_city', '');
                                            set('barangay', '');
                                        }}
                                        className={inputCls(err('region'))}
                                        disabled={loading.regions}
                                    >
                                        <option value="">Select"¦</option>
                                        {regions.map((r) => (
                                            <option key={r.code} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Show District for NCR, Province for others */}
                                {isNCR ? (
                                    <Field label="District" htmlFor="district" required error={err('district')}>
                                        <select
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => {
                                                set('district', e.target.value);
                                                set('municipality_city', '');
                                                set('barangay', '');
                                            }}
                                            className={inputCls(err('district'))}
                                        >
                                            <option value="">Select"¦</option>
                                            {NCR_DISTRICTS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </Field>
                                ) : (
                                    <Field label="Province" htmlFor="province" required error={err('province')}>
                                        <select
                                            id="province"
                                            value={data.province}
                                            onChange={(e) => {
                                                set('province', e.target.value);
                                                set('municipality_city', '');
                                                set('barangay', '');
                                            }}
                                            className={inputCls(err('province'))}
                                            disabled={!data.region || loading.provinces}
                                        >
                                            <option value="">{!data.region ? 'Select region first' : 'Select"¦'}</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                )}

                                <Field label="City / Municipality" htmlFor="municipality_city" required error={err('municipality_city')}>
                                    <select
                                        id="municipality_city"
                                        value={data.municipality_city}
                                        onChange={(e) => {
                                            set('municipality_city', e.target.value);
                                            set('barangay', '');
                                        }}
                                        className={inputCls(err('municipality_city'))}
                                        disabled={(!data.province && !isNCR) || loading.cities}
                                    >
                                        <option value="">
                                            {isNCR 
                                                ? (!data.district ? 'Select district first' : 'Select"¦')
                                                : (!data.province ? 'Select province first' : 'Select"¦')
                                            }
                                        </option>
                                        {cities.map((c) => (
                                            <option key={c.code} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Barangay" htmlFor="barangay" required error={err('barangay')}>
                                    <select
                                        id="barangay"
                                        value={data.barangay}
                                        onChange={(e) => set('barangay', e.target.value)}
                                        className={inputCls(err('barangay'))}
                                        disabled={!data.municipality_city || loading.barangays}
                                    >
                                        <option value="">{!data.municipality_city ? 'Select city first' : 'Select"¦'}</option>
                                        {barangays.map((b) => (
                                            <option key={b.code} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field 
                                    label="Street Address" 
                                    htmlFor="street_address" 
                                    required 
                                    error={err('street_address')}
                                    hint="House, unit or lot number and street"
                                >
                                    <input
                                        id="street_address"
                                        type="text"
                                        value={data.street_address}
                                        onChange={(e) => set('street_address', e.target.value)}
                                        className={inputCls(err('street_address'))}
                                    />
                                </Field>

                                <Field label="Postal Code" htmlFor="postal_code" required error={err('postal_code')}>
                                    <input
                                        id="postal_code"
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => set('postal_code', e.target.value)}
                                        placeholder="e.g. 1100"
                                        maxLength={4}
                                        className={inputCls(err('postal_code'))}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* STEP 3: Contact Person & Coverage */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Contact Person</h4>
                                    <div className="space-y-5">
                                        <Field label="Contact Person First Name" htmlFor="contact_first_name" required error={err('contact_first_name')}>
                                            <input
                                                id="contact_first_name"
                                                type="text"
                                                value={data.contact_first_name}
                                                onChange={(e) => set('contact_first_name', e.target.value)}
                                                className={inputCls(err('contact_first_name'))}
                                            />
                                        </Field>

                                        <Field label="Contact Person Last Name" htmlFor="contact_last_name" required error={err('contact_last_name')}>
                                            <input
                                                id="contact_last_name"
                                                type="text"
                                                value={data.contact_last_name}
                                                onChange={(e) => set('contact_last_name', e.target.value)}
                                                className={inputCls(err('contact_last_name'))}
                                            />
                                        </Field>

                                        <Field 
                                            label="Position" 
                                            htmlFor="contact_position" 
                                            required 
                                            error={err('contact_position')}
                                            hint="Job title of the contact person"
                                        >
                                            <input
                                                id="contact_position"
                                                type="text"
                                                value={data.contact_position}
                                                onChange={(e) => set('contact_position', e.target.value)}
                                                placeholder="e.g. Operations Manager"
                                                className={inputCls(err('contact_position'))}
                                            />
                                        </Field>

                                        <Field label="Email" htmlFor="email" required error={err('email')}>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => set('email', e.target.value)}
                                                className={inputCls(err('email'))}
                                            />
                                        </Field>

                                        <Field label="Mobile Number" htmlFor="contact_number" required error={err('contact_number')}>
                                            <input
                                                id="contact_number"
                                                type="tel"
                                                value={data.contact_number}
                                                onChange={(e) => set('contact_number', e.target.value)}
                                                placeholder="09XXXXXXXXX"
                                                maxLength={11}
                                                className={inputCls(err('contact_number'))}
                                            />
                                        </Field>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                                        Service Areas <span className="text-red-600">*</span>
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-3">Choose at least one region you deliver to.</p>
                                    {err('service_areas') && (
                                        <p className="text-xs text-red-600 mb-2">{err('service_areas')}</p>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {REGIONS.map((region) => {
                                            const isSelected = data.service_areas.includes(region);
                                            return (
                                                <label
                                                    key={region}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                                                        isSelected 
                                                            ? 'border-[#3B1F6B] bg-[#F1EDFB]' 
                                                            : 'border-[#DDD5EE] bg-white hover:border-[#B4A7D6]'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleServiceArea(region)}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#3B1F6B] focus:ring-[#3B1F6B] focus:ring-2"
                                                    />
                                                    <span className={`text-xs font-medium ${
                                                        isSelected ? 'text-[#3B1F6B]' : 'text-gray-700'
                                                    }`}>
                                                        {region}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Documents & Password */}
                        {step === 4 && (
                            <div className="space-y-5">
                                <FileField
                                    id="sec_certificate"
                                    label="SEC Certificate"
                                    hint="JPG, PNG or PDF, up to 5 MB"
                                    file={data.sec_certificate}
                                    error={err('sec_certificate')}
                                    onPick={(f) => set('sec_certificate', f)}
                                    required
                                />

                                <FileField
                                    id="bir_form_2303"
                                    label="BIR Form 2303"
                                    hint="JPG, PNG or PDF, up to 5 MB"
                                    file={data.bir_form_2303}
                                    error={err('bir_form_2303')}
                                    onPick={(f) => set('bir_form_2303', f)}
                                    required
                                />

                                <FileField
                                    id="business_permit"
                                    label="Mayor's / Business Permit"
                                    hint="JPG, PNG or PDF, up to 5 MB"
                                    file={data.business_permit}
                                    error={err('business_permit')}
                                    onPick={(f) => set('business_permit', f)}
                                    required
                                />

                                <FileField
                                    id="valid_id"
                                    label="Valid ID of Authorized Representative"
                                    hint="JPG, PNG or PDF, up to 5 MB"
                                    file={data.valid_id}
                                    error={err('valid_id')}
                                    onPick={(f) => set('valid_id', f)}
                                    required
                                />

                                <Field label="Password" htmlFor="password" required error={err('password')}>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(v) => set('password', v)}
                                        error={err('password')}
                                        autoComplete="new-password"
                                    />
                                </Field>

                                <Field label="Confirm Password" htmlFor="password_confirmation" required error={err('password_confirmation')}>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => set('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        className={inputCls(err('password_confirmation'))}
                                    />
                                </Field>

                                <div className="pt-4 border-t border-[#DDD5EE]">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.privacy_policy_accepted}
                                            onChange={(e) => set('privacy_policy_accepted', e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#3B1F6B] focus:ring-[#3B1F6B]"
                                        />
                                        <span className="text-sm text-gray-700">
                                            I agree to the{' '}
                                            <Link href="/privacy-policy" className="text-[#3B1F6B] hover:underline">
                                                Privacy Policy
                                            </Link>
                                            {' '}and confirm that all information provided is accurate.
                                        </span>
                                    </label>
                                    {err('privacy_policy_accepted') && (
                                        <p className="text-xs text-red-600 mt-1">{err('privacy_policy_accepted')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="px-6 rounded-xl py-3 font-medium border border-[#DDD5EE] bg-white text-gray-800 hover:border-[#9B5DE5] hover:text-[#3B1F6B] transition"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-[#3B1F6B] text-white rounded-xl py-3 font-medium hover:bg-[#2E1854] transition disabled:opacity-60"
                            >
                                {processing ? 'Submitting...' : step === TOTAL_STEPS ? 'Submit Application' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

LogisticsRegistration.layout = (page: ReactNode) => page;
