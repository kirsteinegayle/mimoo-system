import { Link, router } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import StepProgress from '../../components/registration/StepProgress';
import MultiSelectChips from '../../components/registration/MultiSelectChips';
import ServiceChips from '../../components/registration/ServiceChips';
import RadioCards from '../../components/registration/RadioCards';
import * as psgcApi from '../../services/psgcApi';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

const TOTAL_STEPS = 4;
const MAX_FILE_MB = 5;
const PH_MOBILE_RE = /^(09|\+639)\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIDEBAR_STEPS = [
    'Company information and contact details',
    'Authorized representative information',
    'Business verification documents',
    'Service coverage and operations',
];

// PSGC API Types
interface Region { code: string; name: string; }
interface Province { code: string; name: string; regionCode: string }
interface CityMunicipality { code: string; name: string; provinceCode: string }

type FormShape = {
    // Step 1: Company Information
    company_name: string;
    trade_name: string;
    business_registration_number: string;
    business_address: string;
    business_email: string;
    company_contact_number: string;
    company_website: string;
    company_logo: File | null;
    
    // Step 2: Authorized Representative
    rep_full_name: string;
    rep_position: string;
    rep_email: string;
    rep_contact_number: string;
    username: string;
    password: string;
    password_confirmation: string;
    
    // Step 3: Business Documents
    dti_sec_certificate: File | null;
    mayors_permit: File | null;
    operating_permits: File | null;
    rep_valid_id: File | null;
    proof_of_address: File | null;
    
    // Step 4: Service Coverage (now arrays internally)
    regions_served: string[];
    provinces_served: string[];
    cities_served: string[];
    delivery_services: string[];
    pickup_available: string;
    estimated_delivery_time: string;
    
    privacy_policy_accepted: boolean;
    account_type: string;
};

type FieldName = keyof FormShape;
type Errs = Partial<Record<FieldName, string>>;

const FIELD_STEP: Partial<Record<FieldName, number>> = {
    company_name: 1, trade_name: 1, business_registration_number: 1, business_address: 1,
    business_email: 1, company_contact_number: 1, company_website: 1, company_logo: 1,
    rep_full_name: 2, rep_position: 2, rep_email: 2, rep_contact_number: 2,
    username: 2, password: 2, password_confirmation: 2,
    dti_sec_certificate: 3, mayors_permit: 3, operating_permits: 3, rep_valid_id: 3, proof_of_address: 3,
    regions_served: 4, provinces_served: 4, cities_served: 4, delivery_services: 4,
    pickup_available: 4, estimated_delivery_time: 4,
};

const FIELD_LABEL: Partial<Record<FieldName, string>> = {
    company_name: 'Company Name',
    trade_name: 'Trade Name',
    business_registration_number: 'Registration Number',
    business_address: 'Business Address',
    business_email: 'Business Email',
    company_contact_number: 'Company Contact Number',
    company_website: 'Website',
    company_logo: 'Company Logo',
    rep_full_name: 'Full Name',
    rep_position: 'Position',
    rep_email: 'Email Address',
    rep_contact_number: 'Representative Contact Number',
    username: 'Username',
    password: 'Password',
    password_confirmation: 'Confirm Password',
    dti_sec_certificate: 'DTI/SEC Certificate',
    mayors_permit: "Mayor's Permit",
    operating_permits: 'Operating Permits',
    rep_valid_id: 'Valid ID',
    proof_of_address: 'Proof of Address',
    regions_served: 'Regions Served',
    provinces_served: 'Provinces Served',
    cities_served: 'Cities Served',
    delivery_services: 'Delivery Services',
    pickup_available: 'Pickup Available',
    estimated_delivery_time: 'Estimated Delivery Time',
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
        if (!d.company_name.trim()) {
            e.company_name = 'Enter your courier company name.';
        }
        
        if (!d.trade_name.trim()) {
            e.trade_name = 'Enter your business or trade name.';
        }
        
        if (!d.business_registration_number.trim()) {
            e.business_registration_number = 'Enter your DTI/SEC registration number.';
        }
        
        const address = d.business_address.trim();
        if (!address) {
            e.business_address = 'Enter your complete business address.';
        } else if (address.length < 10) {
            e.business_address = 'Enter a complete address (at least 10 characters).';
        }
        
        const bizEmail = d.business_email.trim();
        if (!bizEmail) {
            e.business_email = 'Enter your business email address.';
        } else if (!EMAIL_RE.test(bizEmail)) {
            e.business_email = 'Enter a valid email address, like company@example.com';
        }
        
        const contactNum = d.company_contact_number.trim();
        if (!contactNum) {
            e.company_contact_number = 'Enter your company contact number.';
        } else if (!PH_MOBILE_RE.test(contactNum.replace(/[\s\-]/g, ''))) {
            e.company_contact_number = 'Enter a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX)';
        }
        
        const website = d.company_website.trim();
        if (website && !website.match(/^https?:\/\/.+\..+/i)) {
            e.company_website = 'Enter a valid website URL starting with http:// or https://';
        }
        
        const logoErr = optionalFileError(d.company_logo);
        if (logoErr) e.company_logo = logoErr;
    }
    
    if (step === 2) {
        const fullName = d.rep_full_name.trim();
        if (!fullName) {
            e.rep_full_name = 'Enter the representative\'s full name.';
        } else if (!/^[a-zA-Z\s\-'.]+$/.test(fullName)) {
            e.rep_full_name = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods.';
        } else if (fullName.length < 3) {
            e.rep_full_name = 'Enter a valid full name (at least 3 characters).';
        }
        
        if (!d.rep_position.trim()) {
            e.rep_position = 'Enter the representative\'s position or designation.';
        }
        
        const repEmail = d.rep_email.trim();
        if (!repEmail) {
            e.rep_email = 'Enter the representative\'s email address.';
        } else if (!EMAIL_RE.test(repEmail)) {
            e.rep_email = 'Enter a valid email address, like name@example.com';
        }
        
        const repContact = d.rep_contact_number.trim();
        if (!repContact) {
            e.rep_contact_number = 'Enter the representative\'s contact number.';
        } else if (!PH_MOBILE_RE.test(repContact.replace(/[\s\-]/g, ''))) {
            e.rep_contact_number = 'Enter a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX)';
        }
        
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
            const hasSpecial = /[^A-Za-z0-9]/.test(d.password);
            if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
                e.password = 'Password must include uppercase, lowercase, number, and special character.';
            }
        }
        
        if (!d.password_confirmation) {
            e.password_confirmation = 'Confirm your password.';
        } else if (d.password_confirmation !== d.password) {
            e.password_confirmation = 'Passwords don\'t match. Please re-enter.';
        }
    }
    
    if (step === 3) {
        const dtiErr = requiredFileError(d.dti_sec_certificate);
        if (dtiErr) e.dti_sec_certificate = dtiErr;
        
        const mayorErr = requiredFileError(d.mayors_permit);
        if (mayorErr) e.mayors_permit = mayorErr;
        
        const operatingErr = optionalFileError(d.operating_permits);
        if (operatingErr) e.operating_permits = operatingErr;
        
        const idErr = requiredFileError(d.rep_valid_id);
        if (idErr) e.rep_valid_id = idErr;
        
        const proofErr = requiredFileError(d.proof_of_address);
        if (proofErr) e.proof_of_address = proofErr;
    }
    
    if (step === 4) {
        if (d.regions_served.length === 0) {
            e.regions_served = 'Select at least one region you serve.';
        }
        
        // provinces_served is optional (NCR has no provinces)
        
        if (d.cities_served.length === 0) {
            e.cities_served = 'Select at least one city or municipality you serve.';
        }
        
        if (d.delivery_services.length === 0) {
            e.delivery_services = 'Select at least one delivery service you offer.';
        }
        
        if (!d.pickup_available) {
            e.pickup_available = 'Select whether you offer pickup service.';
        }
        
        if (!d.privacy_policy_accepted) {
            e.privacy_policy_accepted = 'You must accept the Privacy Policy to continue.';
        }
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

export default function CourierRegistration() {
    const [step, setStep] = useState(1);
    const [clientErrors, setClientErrors] = useState<Errs>({});
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const [data, setDataRaw] = useState<FormShape>({
        company_name: '',
        trade_name: '',
        business_registration_number: '',
        business_address: '',
        business_email: '',
        company_contact_number: '',
        company_website: '',
        company_logo: null,
        rep_full_name: '',
        rep_position: '',
        rep_email: '',
        rep_contact_number: '',
        username: '',
        password: '',
        password_confirmation: '',
        dti_sec_certificate: null,
        mayors_permit: null,
        operating_permits: null,
        rep_valid_id: null,
        proof_of_address: null,
        regions_served: [],
        provinces_served: [],
        cities_served: [],
        delivery_services: [],
        pickup_available: '',
        estimated_delivery_time: '',
        privacy_policy_accepted: false,
        account_type: 'logistics',
    });

    const allErrors: Errs = { ...clientErrors };
    // Merge server errors (take first message)
    Object.keys(serverErrors).forEach((key) => {
        if (serverErrors[key] && serverErrors[key].length > 0) {
            allErrors[key as FieldName] = serverErrors[key][0];
        }
    });

    const err = (f: FieldName) => allErrors[f];
    const summary = (Object.keys(allErrors) as FieldName[]).filter((f) => allErrors[f]);

    // PSGC API State
    const [psgcRegions, setPsgcRegions] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcProvinces, setPsgcProvinces] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcCities, setPsgcCities] = useState<Array<{ name: string; code: string }>>([]);
    const [regionsLoading, setRegionsLoading] = useState(false);
    const [provincesLoading, setProvincesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [regionsError, setRegionsError] = useState<string>();
    const [provincesError, setProvincesError] = useState<string>();
    const [citiesError, setCitiesError] = useState<string>();

    const regionNameToCodeMap = useRef(new Map<string, string>());
    const provinceNameToCodeMap = useRef(new Map<string, string>());

    // Load regions when Step 4 opens
    useEffect(() => {
        if (step === 4 && psgcRegions.length === 0 && !regionsLoading) {
            setRegionsLoading(true);
            psgcApi.fetchRegions().then(({ data: apiData, error }) => {
                setPsgcRegions(apiData);
                setRegionsError(error);
                apiData.forEach(r => regionNameToCodeMap.current.set(r.name, r.code));
                setRegionsLoading(false);
            });
        }
    }, [step]);

    // Load provinces when regions are selected
    useEffect(() => {
        if (step === 4 && data.regions_served.length > 0) {
            const selectedRegionCodes = data.regions_served
                .map(name => regionNameToCodeMap.current.get(name))
                .filter((code): code is string => !!code);

            if (selectedRegionCodes.length > 0) {
                setProvincesLoading(true);
                setPsgcProvinces([]);
                setProvincesError(undefined);

                Promise.all([
                    psgcApi.fetchProvinces(selectedRegionCodes),
                    psgcApi.fetchCitiesByRegion(selectedRegionCodes)
                ]).then(([provincesResult, citiesResult]) => {
                    setPsgcProvinces(provincesResult.data);
                    setProvincesError(provincesResult.error);
                    provincesResult.data.forEach(p => provinceNameToCodeMap.current.set(p.name, p.code));
                    setProvincesLoading(false);
                });
            } else {
                setPsgcProvinces([]);
                setProvincesError(undefined);
            }
        }
    }, [step, data.regions_served]);

    // Load cities when provinces or regions are selected
    useEffect(() => {
        if (step === 4) {
            const selectedRegionCodes = data.regions_served
                .map(name => regionNameToCodeMap.current.get(name))
                .filter((code): code is string => !!code);
            
            const selectedProvinceCodes = data.provinces_served
                .map(name => provinceNameToCodeMap.current.get(name))
                .filter((code): code is string => !!code);

            if (selectedProvinceCodes.length > 0 || selectedRegionCodes.length > 0) {
                setCitiesLoading(true);
                setPsgcCities([]);
                setCitiesError(undefined);

                const promises = [];
                if (selectedProvinceCodes.length > 0) {
                    promises.push(psgcApi.fetchCitiesByProvince(selectedProvinceCodes));
                }
                if (selectedRegionCodes.length > 0) {
                    promises.push(psgcApi.fetchCitiesByRegion(selectedRegionCodes));
                }

                Promise.all(promises).then((results) => {
                    const allCities = results.flatMap(r => r.data);
                    const errors = results.map(r => r.error).filter(Boolean);
                    const uniqueCities = Array.from(
                        new Map(allCities.map(city => [city.code, city])).values()
                    );
                    setPsgcCities(uniqueCities);
                    setCitiesError(errors.length > 0 ? errors.join('; ') : undefined);
                    setCitiesLoading(false);
                });
            } else {
                setPsgcCities([]);
                setCitiesError(undefined);
            }
        }
    }, [step, data.regions_served, data.provinces_served]);

    // Return to step with first error when server errors arrive
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

        const formData = new FormData();

        // Step 1 fields
        formData.append('company_name', data.company_name.trim());
        formData.append('trade_name', data.trade_name.trim());
        formData.append('sec_registration_no', data.business_registration_number.trim());
        formData.append('business_address', data.business_address.trim());
        formData.append('business_email', data.business_email.trim());
        formData.append('company_contact_number', data.company_contact_number.trim());
        if (data.company_website.trim()) {
            formData.append('company_website', data.company_website.trim());
        }
        if (data.company_logo) {
            formData.append('company_logo', data.company_logo);
        }

        // Step 2 fields
        formData.append('rep_full_name', data.rep_full_name.trim());
        // Split for compatibility only (no fake fallbacks)
        const nameParts = data.rep_full_name.trim().split(' ', 2);
        formData.append('first_name', nameParts[0] || '');
        if (nameParts[1]) {
            formData.append('last_name', nameParts[1]);
        }
        formData.append('contact_position', data.rep_position.trim());
        formData.append('email', data.rep_email.trim());
        formData.append('rep_contact_number', data.rep_contact_number.trim());
        if (data.username.trim()) {
            formData.append('username', data.username.trim());
        }
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
        formData.append('account_type', 'logistics');
        formData.append('applicant_type', 'courier');

        // Normalized contact_number for system use (backend will normalize)
        formData.append('contact_number', data.rep_contact_number.trim());

        // Step 3 files
        if (data.dti_sec_certificate) {
            formData.append('sec_certificate', data.dti_sec_certificate);
        }
        if (data.mayors_permit) {
            formData.append('business_permit', data.mayors_permit);
        }
        if (data.operating_permits) {
            formData.append('operating_permits', data.operating_permits);
        }
        if (data.rep_valid_id) {
            formData.append('valid_id', data.rep_valid_id);
        }
        if (data.proof_of_address) {
            formData.append('proof_of_address', data.proof_of_address);
        }

        // Step 4 arrays
        data.regions_served.forEach((region, index) => {
            formData.append(`regions_served[${index}]`, region);
        });
        data.provinces_served.forEach((province, index) => {
            formData.append(`provinces_served[${index}]`, province);
        });
        data.cities_served.forEach((city, index) => {
            formData.append(`cities_served[${index}]`, city);
        });
        data.delivery_services.forEach((service, index) => {
            formData.append(`delivery_services[${index}]`, service);
        });
        formData.append('pickup_available', data.pickup_available);
        if (data.estimated_delivery_time.trim()) {
            formData.append('estimated_delivery_time', data.estimated_delivery_time.trim());
        }
        formData.append('privacy_policy_accepted', data.privacy_policy_accepted ? '1' : '0');

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'same-origin',
            });

            if (response.ok) {
                // Success - redirect to pending page
                window.location.href = '/register/pending';
            } else if (response.status === 422) {
                // Validation errors
                const json = await response.json();
                if (json.errors) {
                    setServerErrors(json.errors);
                    setSubmitting(false);
                }
            } else {
                // Other error
                const text = await response.text();
                alert(`Registration failed: ${response.status} ${response.statusText}`);
                setSubmitting(false);
            }
        } catch (error) {
            alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setSubmitting(false);
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

    const focusField = (f: FieldName) => document.getElementById(f as string)?.focus();

    const stepTitles = ['Company Information', 'Authorized Representative', 'Business Documents', 'Service Coverage'];

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
                        Register as Courier Company
                    </h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Register your courier company. Your application will be reviewed by the admin.
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
                    After submitting, wait for admin approval, which will be sent to your email.
                </p>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
                <div className="max-w-3xl mx-auto lg:mx-0">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            courier company registration
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            Register your courier/logistics company.
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

                        {/* STEP 1: Company Information */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <Field label="Courier Company Name" htmlFor="company_name" required error={err('company_name')}>
                                    <input
                                        id="company_name"
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        autoComplete="organization"
                                        placeholder="e.g., ABC Logistics Inc."
                                        aria-invalid={!!err('company_name')}
                                        className={inputCls(err('company_name'))}
                                    />
                                </Field>

                                <Field label="Business / Trade Name" htmlFor="trade_name" required error={err('trade_name')}>
                                    <input
                                        id="trade_name"
                                        type="text"
                                        value={data.trade_name}
                                        onChange={(e) => setData('trade_name', e.target.value)}
                                        placeholder="e.g., ABC Express"
                                        aria-invalid={!!err('trade_name')}
                                        className={inputCls(err('trade_name'))}
                                    />
                                </Field>

                                <FileField
                                    id="company_logo"
                                    label="Company Logo"
                                    hint="PDF, JPG, or PNG (Max 5MB) - Optional"
                                    file={data.company_logo}
                                    error={err('company_logo')}
                                    onPick={(f) => setData('company_logo', f)}
                                />

                                <Field label="Business Registration Number" htmlFor="business_registration_number" required error={err('business_registration_number')}>
                                    <input
                                        id="business_registration_number"
                                        type="text"
                                        value={data.business_registration_number}
                                        onChange={(e) => setData('business_registration_number', e.target.value)}
                                        placeholder="e.g., SEC-2024-0000123 or DTI-12345678"
                                        aria-invalid={!!err('business_registration_number')}
                                        className={inputCls(err('business_registration_number'))}
                                    />
                                </Field>

                                <Field label="Business Address" htmlFor="business_address" required error={err('business_address')} hint="Complete business address including barangay, city, and province">
                                    <textarea
                                        id="business_address"
                                        rows={3}
                                        value={data.business_address}
                                        onChange={(e) => setData('business_address', e.target.value)}
                                        placeholder="e.g., 123 Main Street, Barangay Centro, Makati City, Metro Manila"
                                        aria-invalid={!!err('business_address')}
                                        className={inputCls(err('business_address'))}
                                    />
                                </Field>

                                <Field label="Business Email Address" htmlFor="business_email" required error={err('business_email')}>
                                    <input
                                        id="business_email"
                                        type="email"
                                        value={data.business_email}
                                        onChange={(e) => setData('business_email', e.target.value)}
                                        autoComplete="email"
                                        placeholder="info@yourcompany.ph"
                                        aria-invalid={!!err('business_email')}
                                        className={inputCls(err('business_email'))}
                                    />
                                </Field>

                                <Field label="Official Contact Number" htmlFor="company_contact_number" required error={err('company_contact_number')} hint="09XXXXXXXXX or +639XXXXXXXXX">
                                    <input
                                        id="company_contact_number"
                                        type="tel"
                                        inputMode="numeric"
                                        value={data.company_contact_number}
                                        onChange={(e) => setData('company_contact_number', e.target.value.replace(/[^\d+]/g, ''))}
                                        autoComplete="tel"
                                        placeholder="09XXXXXXXXX"
                                        aria-invalid={!!err('company_contact_number')}
                                        className={inputCls(err('company_contact_number'))}
                                    />
                                </Field>

                                <Field label="Company Website" htmlFor="company_website" hint="Optional">
                                    <input
                                        id="company_website"
                                        type="url"
                                        value={data.company_website}
                                        onChange={(e) => setData('company_website', e.target.value)}
                                        placeholder="https://www.yourcompany.ph"
                                        aria-invalid={!!err('company_website')}
                                        className={inputCls(err('company_website'))}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* STEP 2: Authorized Representative */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
                                    <p className="font-semibold mb-1">ℹ️ Important Note:</p>
                                    <p>This person will be responsible for the courier account. Each authorized representative should have their own login credentials.</p>
                                </div>

                                <Field label="Full Name" htmlFor="rep_full_name" required error={err('rep_full_name')}>
                                    <input
                                        id="rep_full_name"
                                        type="text"
                                        value={data.rep_full_name}
                                        onChange={(e) => setData('rep_full_name', e.target.value)}
                                        autoComplete="name"
                                        placeholder="e.g., Juan Dela Cruz"
                                        aria-invalid={!!err('rep_full_name')}
                                        className={inputCls(err('rep_full_name'))}
                                    />
                                </Field>

                                <Field label="Position / Designation" htmlFor="rep_position" required error={err('rep_position')}>
                                    <input
                                        id="rep_position"
                                        type="text"
                                        value={data.rep_position}
                                        onChange={(e) => setData('rep_position', e.target.value)}
                                        placeholder="e.g., Operations Manager, CEO"
                                        aria-invalid={!!err('rep_position')}
                                        className={inputCls(err('rep_position'))}
                                    />
                                </Field>

                                <Field label="Email Address" htmlFor="rep_email" required error={err('rep_email')}>
                                    <input
                                        id="rep_email"
                                        type="email"
                                        value={data.rep_email}
                                        onChange={(e) => setData('rep_email', e.target.value)}
                                        autoComplete="email"
                                        placeholder="representative@yourcompany.ph"
                                        aria-invalid={!!err('rep_email')}
                                        className={inputCls(err('rep_email'))}
                                    />
                                </Field>

                                <Field label="Contact Number" htmlFor="rep_contact_number" required error={err('rep_contact_number')} hint="09XXXXXXXXX or +639XXXXXXXXX">
                                    <input
                                        id="rep_contact_number"
                                        type="tel"
                                        inputMode="numeric"
                                        value={data.rep_contact_number}
                                        onChange={(e) => setData('rep_contact_number', e.target.value.replace(/[^\d+]/g, ''))}
                                        autoComplete="tel"
                                        placeholder="09XXXXXXXXX"
                                        aria-invalid={!!err('rep_contact_number')}
                                        className={inputCls(err('rep_contact_number'))}
                                    />
                                </Field>

                                <Field label="Username" htmlFor="username" required error={err('username')} hint="For identification purposes">
                                    <input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        autoComplete="username"
                                        placeholder="e.g., jdelacruz_mimoo"
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

                        {/* STEP 3: Business Documents */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <FileField
                                    id="dti_sec_certificate"
                                    label="DTI/SEC Certificate"
                                    hint="PDF, JPG, or PNG (Max 5MB)"
                                    file={data.dti_sec_certificate}
                                    error={err('dti_sec_certificate')}
                                    onPick={(f) => setData('dti_sec_certificate', f)}
                                    required
                                />

                                <FileField
                                    id="mayors_permit"
                                    label="Mayor's Permit / Business Permit"
                                    hint="PDF, JPG, or PNG (Max 5MB)"
                                    file={data.mayors_permit}
                                    error={err('mayors_permit')}
                                    onPick={(f) => setData('mayors_permit', f)}
                                    required
                                />

                                <FileField
                                    id="operating_permits"
                                    label="Operating Permits"
                                    hint="PDF, JPG, or PNG (Max 5MB) - Optional"
                                    file={data.operating_permits}
                                    error={err('operating_permits')}
                                    onPick={(f) => setData('operating_permits', f)}
                                />

                                <FileField
                                    id="rep_valid_id"
                                    label="Representative's Valid ID"
                                    hint="PDF, JPG, or PNG (Max 5MB)"
                                    file={data.rep_valid_id}
                                    error={err('rep_valid_id')}
                                    onPick={(f) => setData('rep_valid_id', f)}
                                    required
                                />

                                <FileField
                                    id="proof_of_address"
                                    label="Proof of Address"
                                    hint="PDF, JPG, or PNG (Max 5MB)"
                                    file={data.proof_of_address}
                                    error={err('proof_of_address')}
                                    onPick={(f) => setData('proof_of_address', f)}
                                    required
                                />
                            </div>
                        )}

                        {/* STEP 4: Service Coverage - USING MULTI-SELECT COMPONENTS */}
                        {step === 4 && (
                            <div className="space-y-5">
                                <div>
                                    <MultiSelectChips
                                        label="Regions Served"
                                        required={true}
                                        options={psgcRegions.map(r => r.name)}
                                        selected={data.regions_served}
                                        onChange={(regions) => setData('regions_served', regions)}
                                        placeholder="Select regions"
                                        loading={regionsLoading}
                                        errorMessage={regionsError}
                                        error={err('regions_served')}
                                    />
                                </div>

                                <div>
                                    <MultiSelectChips
                                        label="Provinces Served"
                                        helperText="Optional for NCR"
                                        options={psgcProvinces.map(p => p.name)}
                                        selected={data.provinces_served}
                                        onChange={(provinces) => setData('provinces_served', provinces)}
                                        placeholder="Select provinces or add custom"
                                        allowCustom={true}
                                        loading={provincesLoading}
                                        errorMessage={provincesError}
                                        error={err('provinces_served')}
                                    />
                                </div>

                                <div>
                                    <MultiSelectChips
                                        label="Cities / Municipalities Served"
                                        required={true}
                                        options={psgcCities.map(c => c.name)}
                                        selected={data.cities_served}
                                        onChange={(cities) => setData('cities_served', cities)}
                                        placeholder="Select cities or add custom"
                                        allowCustom={true}
                                        loading={citiesLoading}
                                        errorMessage={citiesError}
                                        error={err('cities_served')}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-800 mb-1.5 block">
                                        Delivery Services Offered <span className="text-red-600">*</span>
                                    </label>
                                    <ServiceChips
                                        label=""
                                        options={['Standard Delivery', 'Express Delivery', 'Same-Day Delivery', 'Next-Day Delivery', 'International Shipping', 'Cash on Delivery (COD)']}
                                        selected={data.delivery_services}
                                        onChange={(services) => setData('delivery_services', services)}
                                        allowCustom={true}
                                    />
                                    {err('delivery_services') && (
                                        <span className="text-xs font-medium text-red-600 mt-1 block">{err('delivery_services')}</span>
                                    )}
                                </div>

                                <div>
                                    <RadioCards
                                        label="Pickup Service Available?"
                                        required={true}
                                        options={[
                                            { value: 'yes', label: 'Yes, we offer pickup service' },
                                            { value: 'no', label: 'No pickup service' },
                                        ]}
                                        selected={data.pickup_available}
                                        onChange={(value) => setData('pickup_available', value)}
                                        error={err('pickup_available')}
                                    />
                                </div>

                                <Field label="Estimated Delivery Time" htmlFor="estimated_delivery_time" hint="e.g., 1-3 business days">
                                    <input
                                        id="estimated_delivery_time"
                                        type="text"
                                        value={data.estimated_delivery_time}
                                        onChange={(e) => setData('estimated_delivery_time', e.target.value)}
                                        placeholder="e.g., Same day (Express), 1-3 days (Standard)"
                                        aria-invalid={!!err('estimated_delivery_time')}
                                        className={inputCls(err('estimated_delivery_time'))}
                                    />
                                </Field>

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
