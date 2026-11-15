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
const PSGC_BASE = 'https://psgc.gitlab.io/api';
const NCR_CODE = '130000000'; // PSGC code ng NCR (i-verify sa /api/regions/)

// CHANGED: validation patterns
// Name: letters (kasama ñ at accented), space, hyphen, apostrophe lang. Dapat may at least 1 letter.
const NAME_RE = /^(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[A-Za-zÀ-ÖØ-öø-ÿ'’ -]+$/;
// TIN: strict 000-000-000-000 (12 digits)
const TIN_RE = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
// Business name length
const BUSINESS_NAME_MIN = 3;
const BUSINESS_NAME_MAX = 30;

// NCR Districts
// Ang laman ng parentheses ang ginagamit pang-filter ng cities
const NCR_DISTRICTS = [
    '1st District (Manila)',
    '2nd District (Mandaluyong, Marikina, Pasig, Quezon City, San Juan)',
    '3rd District (Caloocan, Malabon, Navotas, Valenzuela)',
    '4th District (Las Piñas, Makati, Muntinlupa, Parañaque, Pasay, Pateros, Taguig)',
];

// "City of Las Piñas" / "Las Piñas City" / "Las Piñas" -> "las pinas"
const normCity = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/^city of\s+/, '')
        .replace(/\s+city$/, '')
        .trim();

// Kunin ang mga city keys mula sa parentheses ng district label
const districtCityKeys = (label: string): string[] => {
    const m = label.match(/\(([^)]*)\)/);
    return m ? m[1].split(',').map(normCity) : [];
};

const SIDEBAR_STEPS = [
    'Add your name, contact info and birthday',
    'Set your province, city, and street address',
    'Add your store details, permit and valid ID',
    'Set a password to secure your account',
];

const BUSINESS_CATEGORIES = [
    'Food & Beverage',
    'Fashion & Apparel',
    'Health & Beauty',
    'Home & Living',
    'Electronics & Gadgets',
    'Pet Supplies',
    'Arts & Crafts',
    'Other',
];

// PSGC API Types
interface Region { code: string; name: string; }
interface Province { code: string; name: string; regionCode: string }
interface CityMunicipality { code: string; name: string; provinceCode: string }
interface Barangay { code: string; name: string; cityCode: string }

// NCR check: by code muna, fallback sa pangalan
const isNCRRegion = (r?: Region | null): boolean =>
    !!r && (r.code === NCR_CODE || /\(NCR\)|national capital region/i.test(r.name));

const sortByName = <T extends { name: string }>(list: T[]): T[] =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

type FormShape = {
    first_name: string;
    last_name: string;
    middle_initial: string;
    sex: string;
    email: string;
    contact_number: string;
    birthday: string;
    account_type: string;
    tin: string;
    region: string;
    province: string;
    district: string; // NCR only: 1st-4th District
    municipality_city: string;
    barangay: string;
    postal_code: string;
    street_address: string;
    business_name: string;
    business_type: string; // sole proprietor, partnership, corporation
    line_of_business: string;
    business_permit: File | null;
    dti_registration: File | null;
    bir_2303: File | null;
    sec_certificate: File | null; // required only for corporation
    id_document: File | null;
    privacy_policy_accepted: boolean;
    password: string;
    password_confirmation: string;
};
type FieldName = keyof FormShape;
type Errs = Partial<Record<FieldName, string>>;

const FIELD_STEP: Partial<Record<FieldName, number>> = {
    first_name: 1, last_name: 1, sex: 1, email: 1, contact_number: 1, birthday: 1, tin: 1,
    region: 2, province: 2, district: 2, municipality_city: 2, barangay: 2, postal_code: 2, street_address: 2,
    business_name: 3, business_type: 3, line_of_business: 3, business_permit: 3, dti_registration: 3, bir_2303: 3, sec_certificate: 3, id_document: 3,
    password: 4, password_confirmation: 4, privacy_policy_accepted: 4,
};
const FIELD_LABEL: Partial<Record<FieldName, string>> = {
    first_name: 'First name', last_name: 'Last name', sex: 'Sex', email: 'Email address',
    contact_number: 'Contact number', birthday: 'Birthday', tin: 'TIN (Tax Identification Number)', region: 'Region', province: 'Province',
    district: 'District', municipality_city: 'Municipality / City', barangay: 'Barangay', postal_code: 'Postal Code', street_address: 'Street & house number',
    business_name: 'Business name', business_type: 'Business type', line_of_business: 'Line of business', business_permit: 'Business permit',
    dti_registration: 'DTI Registration', bir_2303: 'BIR Form 2303', sec_certificate: 'SEC Certificate', id_document: 'Valid ID', 
    privacy_policy_accepted: 'Privacy Policy', password: 'Password', password_confirmation: 'Confirm password',
};

function calcAge(birthday: string): number | null {
    if (!birthday) return null;
    const dob = new Date(birthday + 'T00:00:00');
    const today = new Date();
    if (isNaN(dob.getTime()) || dob > today) return null;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

function fileError(f: File | null, emptyMsg: string): string | undefined {
    if (!f) return emptyMsg;
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return 'Use a PDF, JPG or PNG file.';
    if (f.size > MAX_FILE_MB * 1024 * 1024) return `File is too large. Max ${MAX_FILE_MB}MB.`;
    return undefined;
}

function validate(step: number, d: FormShape, isNCR: boolean): Errs {
    const e: Errs = {};
    if (step === 1) {
        // CHANGED: letters, ñ, space, hyphen, apostrophe lang
        if (!d.first_name.trim()) e.first_name = 'Enter your first name.';
        else if (!NAME_RE.test(d.first_name.trim()))
            e.first_name = 'Use letters only. Spaces, hyphens and apostrophes are allowed.';
        if (!d.last_name.trim()) e.last_name = 'Enter your last name.';
        else if (!NAME_RE.test(d.last_name.trim()))
            e.last_name = 'Use letters only. Spaces, hyphens and apostrophes are allowed.';
        if (!d.sex) e.sex = 'Select your sex.';
        if (!EMAIL_RE.test(d.email.trim())) e.email = 'Enter a valid email address.';
        if (!PH_MOBILE_RE.test(d.contact_number.trim())) e.contact_number = 'Enter a valid PH mobile number (09XXXXXXXXX).';
        if (calcAge(d.birthday) === null) e.birthday = 'Enter a valid past date of birth.';
        // CHANGED: TIN strict 000-000-000-000
        if (!d.tin.trim()) e.tin = 'Enter your TIN.';
        else if (!TIN_RE.test(d.tin.trim()))
            e.tin = 'Enter a valid TIN in the format 000-000-000-000 (12 digits).';
    }
    if (step === 2) {
        if (!d.region) e.region = 'Select a region.';
        if (!isNCR && !d.province) e.province = 'Select a province.';
        if (isNCR && !d.district) e.district = 'Select a district.';
        if (!d.municipality_city) e.municipality_city = 'Select a municipality or city.';
        if (!d.barangay) e.barangay = 'Select a barangay.';
        // CHANGED: exactly 4 digits, numbers lang
        if (!d.postal_code.trim()) e.postal_code = 'Enter your postal code.';
        else if (!/^\d{4}$/.test(d.postal_code.trim())) e.postal_code = 'Postal code must be exactly 4 digits.';
        if (!d.street_address.trim()) e.street_address = 'Enter your street and house number.';
    }
    if (step === 3) {
        // CHANGED: business name 3 to 30 characters
        const bizName = d.business_name.trim();
        if (!bizName) e.business_name = 'Enter your business name.';
        else if (bizName.length < BUSINESS_NAME_MIN || bizName.length > BUSINESS_NAME_MAX)
            e.business_name = `Business name must be ${BUSINESS_NAME_MIN} to ${BUSINESS_NAME_MAX} characters.`;
        if (!d.business_type) e.business_type = 'Select your business type.';
        if (!d.line_of_business) e.line_of_business = 'Select the category that best fits your store.';
        const permitErr = fileError(d.business_permit, 'Upload your business permit.');
        if (permitErr) e.business_permit = permitErr;
        const dtiErr = fileError(d.dti_registration, 'Upload your DTI registration.');
        if (dtiErr) e.dti_registration = dtiErr;
        const birErr = fileError(d.bir_2303, 'Upload BIR Form 2303.');
        if (birErr) e.bir_2303 = birErr;
        // SEC certificate required only for corporation
        if (d.business_type === 'corporation') {
            const secErr = fileError(d.sec_certificate, 'Upload SEC certificate (required for Corporation).');
            if (secErr) e.sec_certificate = secErr;
        }
        const idErr = fileError(d.id_document, 'Upload a valid government-issued ID.');
        if (idErr) e.id_document = idErr;
    }
    if (step === 4) {
        // CHANGED: uppercase, lowercase, number, special character
        if (d.password.length < 8) e.password = 'Use at least 8 characters.';
        else if (
            !/[A-Z]/.test(d.password) ||
            !/[a-z]/.test(d.password) ||
            !/\d/.test(d.password) ||
            !/[^A-Za-z0-9]/.test(d.password)
        )
            e.password = 'Include an uppercase letter, a lowercase letter, a number and a special character.';
        if (!d.password_confirmation || d.password_confirmation !== d.password)
            e.password_confirmation = "Passwords don't match.";
        if (!d.privacy_policy_accepted) e.privacy_policy_accepted = 'You must accept the Terms and Privacy Policy to continue.';
    }
    return e;
}

/* ---------- small UI helpers ---------- */
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
    return (
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
                aria-pressed={show}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-[#F1EDFB] hover:text-gray-900"
            >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.7">
                    {show ? (
                        <>
                            <path d="M3 3l18 18" strokeLinecap="round" />
                            <path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C4 8.3 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8" strokeLinecap="round" />
                            <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
                        </>
                    ) : (
                        <>
                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </>
                    )}
                </svg>
            </button>
        </div>
    );
}

function FileField({
    id, label, kind, hint, buttonLabel, file, error, onPick,
}: {
    id: string; label: string; kind: 'id' | 'doc'; hint: string; buttonLabel: string;
    file: File | null; error?: string; onPick: (f: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-800">
                {label} <span className="text-red-600" aria-hidden="true">*</span>
            </span>
            <div className={`flex items-center gap-3 rounded-xl p-4 ${
                file ? 'border border-[#B4A7D6] bg-white' : 'border-2 border-dashed border-[#DDD5EE] bg-[#F8F6FC]'
            }`}>
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[#F1EDFB] text-[#3B1F6B] flex items-center justify-center" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                        {kind === 'id' ? (
                            <>
                                <rect x="3" y="6" width="18" height="12" rx="2" />
                                <circle cx="8.5" cy="12" r="1.6" fill="currentColor" />
                                <path d="M13 10.5h5M13 13.5h5" strokeLinecap="round" />
                            </>
                        ) : (
                            <>
                                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" strokeLinejoin="round" />
                                <path d="M14 3v5h5" strokeLinejoin="round" />
                            </>
                        )}
                    </svg>
                </span>
                <span className="flex-1 min-w-0" aria-live="polite">
                    <span className="block text-sm font-medium text-gray-800 break-words">
                        {file ? file.name : 'No file selected'}
                    </span>
                    <span className="block text-xs text-gray-500">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : hint}
                    </span>
                </span>
                <button
                    id={id}
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    aria-describedby={error ? `${id}-err` : undefined}
                    className="shrink-0 rounded-lg border border-[#DDD5EE] bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 hover:border-[#9B5DE5] hover:text-[#3B1F6B] transition"
                >
                    {file ? 'Change file' : buttonLabel}
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
            {error && (
                <span id={`${id}-err`} className="text-xs font-medium text-red-600" role="alert">{error}</span>
            )}
        </div>
    );
}

export default function SellerRegistration() {
    const [step, setStep] = useState(1);
    const [clientErrors, setClientErrors] = useState<Errs>({});
    const headingRef = useRef<HTMLHeadingElement>(null);

    // PSGC API states
    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<CityMunicipality[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [loading, setLoading] = useState({ regions: false, provinces: false, cities: false, barangays: false });

    const { data, setData, post, processing, errors, transform } = useForm<FormShape>({
        first_name: '',
        last_name: '',
        middle_initial: '',
        sex: '',
        email: '',
        contact_number: '',
        birthday: '',
        account_type: 'seller',
        tin: '',
        region: '',
        province: '',
        district: '',
        municipality_city: '',
        barangay: '',
        postal_code: '',
        street_address: '',
        business_name: '',
        business_type: '',
        line_of_business: '',
        business_permit: null,
        dti_registration: null,
        bir_2303: null,
        sec_certificate: null,
        id_document: null,
        privacy_policy_accepted: false,
        password: '',
        password_confirmation: '',
    });

    transform((d) => ({
        ...d,
        email: d.email.trim(),
        // Always include an accepted flag — FormData needs '1' for true, '0' for false
        privacy_policy_accepted: d.privacy_policy_accepted ? '1' : '0',
        terms_accepted: d.privacy_policy_accepted ? '1' : '0', // Also send as terms_accepted for backend compatibility
    }));

    const age = calcAge(data.birthday);
    const allErrors: Errs = { ...(errors as Errs), ...clientErrors };
    const err = (f: FieldName) => allErrors[f];
    const summary = (Object.keys(clientErrors) as FieldName[]).filter((f) => clientErrors[f]);

    // Selected region at NCR check (by code, hindi by exact name)
    const selectedRegion = regions.find((r) => r.name === data.region);
    const isNCR = isNCRRegion(selectedRegion);

    // Cities na ipapakita: sa NCR, ayon lang sa napiling district
    const visibleCities = (() => {
        if (!isNCR) return cities;
        if (!data.district) return [];
        const keys = districtCityKeys(data.district);
        const matched = cities.filter((c) => keys.includes(normCity(c.name)));
        // Kung walang tumugma (iba ang pangalan sa API), ipakita lahat para hindi ma-stuck
        return matched.length ? matched : cities;
    })();

    // Load regions on mount
    useEffect(() => {
        let cancelled = false;
        setLoading((p) => ({ ...p, regions: true }));
        fetch(`${PSGC_BASE}/regions/`)
            .then((res) => res.json())
            .then((list: Region[]) => { if (!cancelled) setRegions(sortByName(list)); })
            .catch(() => { if (!cancelled) setRegions([]); })
            .finally(() => { if (!cancelled) setLoading((p) => ({ ...p, regions: false })); });
        return () => { cancelled = true; };
    }, []);

    // Region -> provinces (non-NCR) O cities diretso (NCR)
    useEffect(() => {
        if (!selectedRegion) {
            setProvinces([]);
            return;
        }
        let cancelled = false;
        const base = `${PSGC_BASE}/regions/${selectedRegion.code}`;

        if (!isNCR) {
            setLoading((p) => ({ ...p, provinces: true }));
            fetch(`${base}/provinces/`)
                .then((res) => res.json())
                .then((list: Province[]) => { if (!cancelled) setProvinces(sortByName(list)); })
                .catch(() => { if (!cancelled) setProvinces([]); })
                .finally(() => { if (!cancelled) setLoading((p) => ({ ...p, provinces: false })); });
            return () => { cancelled = true; };
        }

        // NCR: walang province, diretso cities
        setProvinces([]);
        setLoading((p) => ({ ...p, cities: true }));
        fetch(`${base}/cities-municipalities/`)
            .then((res) => res.json())
            .then(async (list: CityMunicipality[]) => {
                if (Array.isArray(list) && list.length) return list;
                // Fallback: kunin per district kapag walang laman ang region endpoint
                const districts: { code: string }[] = await fetch(`${base}/districts/`).then((r) => r.json());
                const perDistrict = await Promise.all(
                    districts.map((d) =>
                        fetch(`${PSGC_BASE}/districts/${d.code}/cities-municipalities/`).then((r) => r.json())
                    )
                );
                return perDistrict.flat() as CityMunicipality[];
            })
            .then((list) => {
                if (cancelled) return;
                const unique = Array.from(new Map(list.map((c) => [c.code, c])).values());
                setCities(sortByName(unique));
            })
            .catch(() => { if (!cancelled) setCities([]); })
            .finally(() => { if (!cancelled) setLoading((p) => ({ ...p, cities: false })); });

        return () => { cancelled = true; };
    }, [selectedRegion?.code, isNCR]);

    // Province -> cities (non-NCR lang)
    useEffect(() => {
        if (isNCR) return; // NCR cities galing na sa region effect
        const selected = provinces.find((p) => p.name === data.province);
        if (!data.province || !selected) {
            setCities([]);
            return;
        }
        let cancelled = false;
        setLoading((p) => ({ ...p, cities: true }));
        fetch(`${PSGC_BASE}/provinces/${selected.code}/cities-municipalities/`)
            .then((res) => res.json())
            .then((list: CityMunicipality[]) => { if (!cancelled) setCities(sortByName(list)); })
            .catch(() => { if (!cancelled) setCities([]); })
            .finally(() => { if (!cancelled) setLoading((p) => ({ ...p, cities: false })); });
        return () => { cancelled = true; };
    }, [data.province, provinces, isNCR]);

    // City/municipality -> barangays
    useEffect(() => {
        const selected = cities.find((c) => c.name === data.municipality_city);
        if (!data.municipality_city || !selected) {
            setBarangays([]);
            return;
        }
        let cancelled = false;
        setLoading((p) => ({ ...p, barangays: true }));
        fetch(`${PSGC_BASE}/cities-municipalities/${selected.code}/barangays/`)
            .then((res) => res.json())
            .then((list: Barangay[]) => { if (!cancelled) setBarangays(sortByName(list)); })
            .catch(() => { if (!cancelled) setBarangays([]); })
            .finally(() => { if (!cancelled) setLoading((p) => ({ ...p, barangays: false })); });
        return () => { cancelled = true; };
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

    const goTo = (n: number) => {
        setStep(n);
        setTimeout(() => headingRef.current?.focus(), 0);
    };

    const goNext = () => {
        // Trim email first
        if (step === TOTAL_STEPS && data.email) {
            data.email = data.email.trim();
        }
        
        const e = validate(step, data, isNCR);
        if (Object.keys(e).length) {
            setClientErrors(e);
            return;
        }
        setClientErrors({});
        if (step < TOTAL_STEPS) goTo(step + 1);
        else {
            const email = data.email.trim();
            console.log('Submitting registration for:', email);
            post('/register', {
                forceFormData: true,
                onSuccess: (response) => {
                    console.log('Registration success, redirecting to OTP...', response);
                    // Force redirect to OTP page
                    window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
                },
                onError: (errors) => {
                    console.error('Registration failed with errors:', JSON.stringify(errors, null, 2));
                    // Also log each individual error
                    Object.keys(errors).forEach(key => {
                        console.error(`Error in ${key}:`, errors[key]);
                    });
                },
                onFinish: () => {
                    console.log('Registration request finished');
                },
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

    const stepTitles = ['Your details', 'Address', 'Store & identity verification', 'Secure your account'];

    const btnPrimary =
        'flex-1 bg-[#3B1F6B] text-white rounded-xl py-3 font-medium hover:bg-[#2E1854] transition disabled:opacity-60';
    const btnSecondary =
        'px-6 rounded-xl py-3 font-medium border border-[#DDD5EE] bg-white text-gray-800 hover:border-[#9B5DE5] hover:text-[#3B1F6B] transition';

    return (
        <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden" style={fontPoppins}>
            <style>{`
                @keyframes badgePop {
                    0%   { opacity: 0; transform: scale(0.7) translateY(-4px); }
                    60%  { opacity: 1; transform: scale(1.08); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .badge-pop { animation: badgePop 0.35s ease-out; }
                @keyframes waterFill {
                    0%   { clip-path: inset(0 0 100% 0); }
                    100% { clip-path: inset(0 0 0 0); }
                }
                .water-fill-text, .water-fill-dot { animation: waterFill 0.5s ease-out forwards; }
                @media (prefers-reduced-motion: reduce) {
                    .badge-pop, .water-fill-text, .water-fill-dot { animation: none; }
                }
            `}</style>

            {/* Mobile header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B1F6B]" />
                    <h1 className="text-base font-bold tracking-widest text-gray-900" style={fontSyncopate}>mimoo</h1>
                </Link>
                <span className="text-xs bg-[#F1EDFB] text-[#3B1F6B] px-3 py-1 rounded-full tracking-wide font-medium" style={fontSFCompact}>
                    STEP {step} OF {TOTAL_STEPS}
                </span>
            </div>

            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex lg:w-80 lg:h-screen lg:sticky lg:top-0 shrink-0 min-w-0 relative flex-col gap-9 px-8 pt-10 pb-10 text-[#F1EEFB]"
                style={{ background: 'radial-gradient(120% 140% at 15% 0%, #2B2249 0%, #201A33 60%)' }}
            >
                {/* soft glow, bottom right */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    <div
                        className="absolute -bottom-[35%] -right-[30%] w-[420px] h-[420px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(122,99,172,0.35), transparent 70%)' }}
                    />
                </div>

                {/* Brand + badge */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#9B5DE5]" />
                        <h1 className="text-lg font-bold tracking-widest" style={fontSyncopate}>mimoo</h1>
                    </Link>
                    <div className="mt-6">
                        <span
                            key={step}
                            className="badge-pop text-xs bg-white/10 px-3 py-1 rounded-full inline-block tracking-wide"
                            style={fontSFCompact}
                        >
                            STEP {step} OF {TOTAL_STEPS}
                        </span>
                    </div>
                </div>

                {/* Hero copy */}
                <div className="relative z-10">
                    <h2 className="text-[1.7rem] leading-tight font-black tracking-wide mb-2.5" style={fontCalibri}>Start selling on mimoo.</h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Selling means a quick review of your business details and ID before you go live.
                    </p>
                </div>

                {/* Illustration (hidden on short screens) */}
                <div className="relative z-10 [@media(max-height:780px)]:hidden" aria-hidden="true">
                    <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="110" cy="132" rx="88" ry="10" fill="#2B2249" />
                        <rect x="40" y="46" width="140" height="70" rx="14" fill="#352A5C" stroke="#7A63AC" strokeWidth="1.5" />
                        <path d="M40 60 L110 30 L180 60" stroke="#B4A7D6" strokeWidth="2" fill="none" strokeLinejoin="round" />
                        <rect x="60" y="76" width="34" height="34" rx="6" fill="#4D3B82" />
                        <rect x="102" y="76" width="58" height="14" rx="4" fill="#7A63AC" />
                        <rect x="102" y="96" width="40" height="10" rx="4" fill="#5A4890" />
                        <circle cx="150" cy="46" r="15" fill="#B4A7D6" opacity="0.9" />
                        <path d="M144 46l4 4 8-8" stroke="#201A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* How it works */}
                <div className="relative z-10 mt-auto flex flex-col gap-4">
                    <p className="uppercase tracking-[0.08em] text-[0.7rem] font-bold text-[#B4A7D6]" style={fontSFCompact}>
                        How it works
                    </p>
                    <ol className="flex flex-col gap-3.5">
                        {SIDEBAR_STEPS.map((label, i) => {
                            const isDone = i + 1 <= step;
                            return (
                                <li key={label} className="flex items-start gap-3 text-[0.85rem]">
                                    <span className="relative mt-0.5 w-5 h-5 shrink-0 rounded-full border-[1.5px] border-[#B4A7D6] overflow-hidden flex items-center justify-center">
                                        {isDone && (
                                            <>
                                                <span key={`dot-${label}`} className="water-fill-dot absolute inset-0 rounded-full bg-[#B4A7D6]" />
                                                <span className="relative w-1.5 h-1.5 rounded-full bg-[#201A33]" />
                                            </>
                                        )}
                                    </span>
                                    <span className="relative inline-block">
                                        <span className="text-white/60">{label}</span>
                                        {isDone && (
                                            <span key={`text-${label}`} className="water-fill-text absolute inset-0 text-white">
                                                {label}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <p className="relative z-10 border-t border-white/10 pt-4 text-[0.78rem] text-[#B4A7D6]">
                    Your information is only used to verify and set up your account.
                </p>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-24">
                <div className="max-w-full lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto lg:mx-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                        create your seller account
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Tell us about yourself and your business. It only takes a few minutes.
                    </p>
                    <p className="text-gray-500 mt-1 text-xs">
                        Fields marked <span className="text-red-600">*</span> are required.
                    </p>
                    <p className="text-gray-500 mt-2 text-xs sm:text-sm">
                        Just want to shop?{' '}
                        <Link href="/register" className="text-[#3B1F6B] font-semibold hover:underline">
                            Register a buyer account
                        </Link>
                    </p>

                    <StepProgress currentStep={step} />

                    {/* Error summary */}
                    {summary.length > 0 && (
                        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                            <h3 className="text-sm font-semibold mb-1">Please fix the following before continuing:</h3>
                            <ul className="list-disc pl-5 text-sm">
                                {summary.map((f) => (
                                    <li key={f}>
                                        <button type="button" onClick={() => focusField(f)} className="underline text-left">
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
                            Step {step} of {TOTAL_STEPS} · {stepTitles[step - 1]}
                        </h3>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="First name" htmlFor="first_name" required error={err('first_name')}>
                                    <input id="first_name" value={data.first_name} onChange={(e) => set('first_name', e.target.value)}
                                        autoComplete="given-name" aria-invalid={!!err('first_name')} className={inputCls(err('first_name'))} />
                                </Field>
                                <Field label="Last name" htmlFor="last_name" required error={err('last_name')}>
                                    <input id="last_name" value={data.last_name} onChange={(e) => set('last_name', e.target.value)}
                                        autoComplete="family-name" aria-invalid={!!err('last_name')} className={inputCls(err('last_name'))} />
                                </Field>
                                <Field label="Middle initial" htmlFor="middle_initial">
                                    <input id="middle_initial" maxLength={2} placeholder="e.g. D" value={data.middle_initial}
                                        onChange={(e) => set('middle_initial', e.target.value)} className={inputCls()} />
                                </Field>
                                <div className="flex flex-col gap-1.5">
                                    <span id="sex-label" className="text-sm font-medium text-gray-800">
                                        Sex <span className="text-red-600" aria-hidden="true">*</span>
                                    </span>
                                    <div role="radiogroup" aria-labelledby="sex-label" className="flex gap-5 py-2.5">
                                        {['male', 'female'].map((v, i) => (
                                            <label key={v} className="flex items-center gap-2 text-sm capitalize text-gray-800 cursor-pointer">
                                                <input type="radio" id={i === 0 ? 'sex' : undefined} name="sex" value={v}
                                                    checked={data.sex === v} onChange={() => set('sex', v)}
                                                    className="w-4 h-4 accent-[#3B1F6B] cursor-pointer" />
                                                {v}
                                            </label>
                                        ))}
                                    </div>
                                    {err('sex') && <span className="text-xs font-medium text-red-600" role="alert">{err('sex')}</span>}
                                </div>
                                <Field label="Email address" htmlFor="email" required error={err('email')} className="sm:col-span-2">
                                    <input id="email" type="email" placeholder="you@example.com" value={data.email}
                                        onChange={(e) => set('email', e.target.value)} autoComplete="email"
                                        aria-invalid={!!err('email')} className={inputCls(err('email'))} />
                                </Field>
                                <Field label="Contact number" htmlFor="contact_number" required error={err('contact_number')}
                                    hint="11-digit mobile number, e.g. 09171234567">
                                    <input id="contact_number" type="tel" inputMode="numeric" placeholder="09XXXXXXXXX" maxLength={11}
                                        value={data.contact_number} onChange={(e) => set('contact_number', e.target.value.replace(/\D/g, ''))}
                                        autoComplete="tel" aria-invalid={!!err('contact_number')} className={inputCls(err('contact_number'))} />
                                </Field>
                                {/* CHANGED: hint para sa strict TIN format */}
                                <Field label="TIN (Tax Identification Number)" htmlFor="tin" required error={err('tin')}
                                    hint="Format: 000-000-000-000 (12 digits)">
                                    <input id="tin" type="text" placeholder="123-456-789-000" value={data.tin}
                                        onChange={(e) => set('tin', e.target.value)} autoComplete="off"
                                        aria-invalid={!!err('tin')} className={inputCls(err('tin'))} />
                                </Field>
                                <Field label="Birthday" htmlFor="birthday" required error={err('birthday')}>
                                    <input id="birthday" type="date" max={new Date().toISOString().split('T')[0]} value={data.birthday}
                                        onChange={(e) => set('birthday', e.target.value)} autoComplete="bday"
                                        aria-invalid={!!err('birthday')} className={inputCls(err('birthday'))} />
                                </Field>
                                <Field label="Age" htmlFor="age" hint="Calculated from your birthday">
                                    <input id="age" readOnly placeholder="Auto-filled" value={age !== null ? `${age} years old` : ''}
                                        className={`${inputCls()} bg-[#F1EDFB] text-gray-500`} />
                                </Field>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Region" htmlFor="region" required error={err('region')}>
                                    <select
                                        id="region"
                                        value={data.region}
                                        disabled={loading.regions}
                                        aria-invalid={!!err('region')}
                                        className={`${inputCls(err('region'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                        onChange={(e) => {
                                            set('region', e.target.value);
                                            setData((prev) => ({
                                                ...prev,
                                                region: e.target.value,
                                                province: '',
                                                district: '',
                                                municipality_city: '',
                                                barangay: ''
                                            }));
                                            setClientErrors((c) => ({ 
                                                ...c, 
                                                region: undefined, 
                                                province: undefined, 
                                                district: undefined,
                                                municipality_city: undefined,
                                                barangay: undefined
                                            }));
                                        }}
                                    >
                                        <option value="">{loading.regions ? 'Loading regions...' : 'Select region'}</option>
                                        {regions.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
                                    </select>
                                </Field>
                                
                                {!isNCR && (
                                    <Field label="Province" htmlFor="province" required error={err('province')}>
                                        <select
                                            id="province"
                                            value={data.province}
                                            disabled={!data.region || loading.provinces}
                                            aria-invalid={!!err('province')}
                                            className={`${inputCls(err('province'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                            onChange={(e) => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    province: e.target.value,
                                                    municipality_city: '',
                                                    barangay: ''
                                                }));
                                                setClientErrors((c) => ({ 
                                                    ...c, 
                                                    province: undefined,
                                                    municipality_city: undefined,
                                                    barangay: undefined
                                                }));
                                            }}
                                        >
                                            <option value="">
                                                {!data.region ? 'Select region first' : loading.provinces ? 'Loading provinces...' : 'Select province'}
                                            </option>
                                            {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </Field>
                                )}
                                
                                {isNCR && (
                                    <Field label="District" htmlFor="district" required error={err('district')}>
                                        <select
                                            id="district"
                                            value={data.district}
                                            disabled={!data.region}
                                            aria-invalid={!!err('district')}
                                            className={`${inputCls(err('district'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                            onChange={(e) => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    district: e.target.value,
                                                    municipality_city: '',
                                                    barangay: ''
                                                }));
                                                setClientErrors((c) => ({ 
                                                    ...c, 
                                                    district: undefined,
                                                    municipality_city: undefined,
                                                    barangay: undefined
                                                }));
                                            }}
                                        >
                                            <option value="">{!data.region ? 'Select region first' : 'Select district'}</option>
                                            {NCR_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                )}
                                
                                <Field label="Municipality / City" htmlFor="municipality_city" required error={err('municipality_city')}>
                                    <select
                                        id="municipality_city"
                                        value={data.municipality_city}
                                        disabled={isNCR ? (!data.district || loading.cities) : (!data.province || loading.cities)}
                                        aria-invalid={!!err('municipality_city')}
                                        className={`${inputCls(err('municipality_city'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                        onChange={(e) => {
                                            setData((prev) => ({
                                                ...prev,
                                                municipality_city: e.target.value,
                                                barangay: ''
                                            }));
                                            setClientErrors((c) => ({ 
                                                ...c, 
                                                municipality_city: undefined,
                                                barangay: undefined
                                            }));
                                        }}
                                    >
                                        <option value="">
                                            {loading.cities 
                                                ? 'Loading cities...' 
                                                : isNCR 
                                                    ? (!data.district ? 'Select district first' : 'Select municipality or city')
                                                    : (!data.province ? 'Select province first' : 'Select municipality or city')}
                                        </option>
                                        {visibleCities.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                                    </select>
                                </Field>
                                
                                <Field label="Barangay" htmlFor="barangay" required error={err('barangay')}>
                                    <select
                                        id="barangay"
                                        value={data.barangay}
                                        disabled={!data.municipality_city || loading.barangays}
                                        aria-invalid={!!err('barangay')}
                                        className={`${inputCls(err('barangay'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                        onChange={(e) => {
                                            set('barangay', e.target.value);
                                            setClientErrors((c) => ({ ...c, barangay: undefined }));
                                        }}
                                    >
                                        <option value="">
                                            {!data.municipality_city ? 'Select municipality/city first' : loading.barangays ? 'Loading barangays...' : 'Select barangay'}
                                        </option>
                                        {barangays.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
                                    </select>
                                </Field>
                                
                                {/* CHANGED: tinanggal ang maxLength para ma-reject (hindi ma-truncate) ang 5+ digits */}
                                <Field label="Postal Code" htmlFor="postal_code" required error={err('postal_code')}
                                    hint="Exactly 4 digits">
                                    <input
                                        id="postal_code"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="1234"
                                        value={data.postal_code}
                                        onChange={(e) => set('postal_code', e.target.value.replace(/\D/g, ''))}
                                        aria-invalid={!!err('postal_code')}
                                        className={inputCls(err('postal_code'))}
                                    />
                                </Field>
                                
                                <Field label="Street & house number" htmlFor="street_address" required error={err('street_address')} className="sm:col-span-2">
                                    <input
                                        id="street_address"
                                        type="text"
                                        placeholder="e.g. 123 Rizal Street, Bldg 5, Unit 12"
                                        value={data.street_address}
                                        onChange={(e) => set('street_address', e.target.value)}
                                        aria-invalid={!!err('street_address')}
                                        className={inputCls(err('street_address'))}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="flex flex-col gap-8">
                                <section aria-labelledby="store-details-label">
                                    <p id="store-details-label" className="text-xs font-semibold uppercase tracking-wide text-[#7A63AC] mb-3" style={fontSFCompact}>
                                        Store details
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        {/* CHANGED: hint para sa 3 to 30 characters */}
                                        <Field label="Business name" htmlFor="business_name" required error={err('business_name')}
                                            hint={`${BUSINESS_NAME_MIN} to ${BUSINESS_NAME_MAX} characters`}>
                                            <input id="business_name" placeholder="e.g. Hoppers Pet Supply" value={data.business_name}
                                                onChange={(e) => set('business_name', e.target.value)}
                                                aria-invalid={!!err('business_name')} className={inputCls(err('business_name'))} />
                                        </Field>
                                        <Field label="Business type" htmlFor="business_type" required error={err('business_type')}>
                                            <select id="business_type" value={data.business_type}
                                                onChange={(e) => set('business_type', e.target.value)}
                                                aria-invalid={!!err('business_type')} className={inputCls(err('business_type'))}>
                                                <option value="">Select business type</option>
                                                <option value="sole_proprietor">Sole Proprietor</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="corporation">Corporation</option>
                                            </select>
                                        </Field>
                                        <Field label="Line of business" htmlFor="line_of_business" required error={err('line_of_business')}>
                                            <select id="line_of_business" value={data.line_of_business}
                                                onChange={(e) => set('line_of_business', e.target.value)}
                                                aria-invalid={!!err('line_of_business')} className={inputCls(err('line_of_business'))}>
                                                <option value="">Select a category</option>
                                                {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </Field>
                                    </div>
                                </section>

                                <section aria-labelledby="documents-label" className="border-t border-[#DDD5EE] pt-8">
                                    <p id="documents-label" className="text-xs font-semibold uppercase tracking-wide text-[#7A63AC] mb-3" style={fontSFCompact}>
                                        Business documents
                                    </p>
                                    <div className="flex flex-col gap-5">
                                        <FileField
                                            id="business_permit"
                                            label="Business permit"
                                            kind="doc"
                                            hint={`PDF, JPG or PNG · up to ${MAX_FILE_MB}MB`}
                                            buttonLabel="Choose permit file"
                                            file={data.business_permit}
                                            error={err('business_permit')}
                                            onPick={(f) => set('business_permit', f)}
                                        />
                                        <FileField
                                            id="dti_registration"
                                            label="DTI Registration"
                                            kind="doc"
                                            hint={`PDF, JPG or PNG · up to ${MAX_FILE_MB}MB`}
                                            buttonLabel="Choose DTI file"
                                            file={data.dti_registration}
                                            error={err('dti_registration')}
                                            onPick={(f) => set('dti_registration', f)}
                                        />
                                        <FileField
                                            id="bir_2303"
                                            label="BIR Form 2303 (Certificate of Registration)"
                                            kind="doc"
                                            hint={`PDF, JPG or PNG · up to ${MAX_FILE_MB}MB`}
                                            buttonLabel="Choose BIR 2303 file"
                                            file={data.bir_2303}
                                            error={err('bir_2303')}
                                            onPick={(f) => set('bir_2303', f)}
                                        />
                                        {data.business_type === 'corporation' && (
                                            <FileField
                                                id="sec_certificate"
                                                label="SEC Certificate (Required for Corporation)"
                                                kind="doc"
                                                hint={`PDF, JPG or PNG · up to ${MAX_FILE_MB}MB`}
                                                buttonLabel="Choose SEC certificate"
                                                file={data.sec_certificate}
                                                error={err('sec_certificate')}
                                                onPick={(f) => set('sec_certificate', f)}
                                            />
                                        )}
                                    </div>
                                </section>

                                <section aria-labelledby="identity-label" className="border-t border-[#DDD5EE] pt-8">
                                    <p id="identity-label" className="text-xs font-semibold uppercase tracking-wide text-[#7A63AC] mb-3" style={fontSFCompact}>
                                        Identity verification
                                    </p>
                                    <FileField
                                        id="id_document"
                                        label="Upload a valid government-issued ID"
                                        kind="id"
                                        hint={`PDF, JPG or PNG · up to ${MAX_FILE_MB}MB`}
                                        buttonLabel="Choose ID file"
                                        file={data.id_document}
                                        error={err('id_document')}
                                        onPick={(f) => set('id_document', f)}
                                    />
                                </section>
                            </div>
                        )}

                        {/* STEP 4 */}
                        {step === 4 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* CHANGED: hint para sa password rules */}
                                    <Field label="Password" htmlFor="password" required error={err('password')}
                                        hint="At least 8 characters with uppercase, lowercase, number and special character">
                                        <PasswordInput id="password" value={data.password} onChange={(v) => set('password', v)}
                                            error={err('password')} autoComplete="new-password" />
                                    </Field>
                                    <Field label="Confirm password" htmlFor="password_confirmation" required error={err('password_confirmation')}>
                                        <PasswordInput id="password_confirmation" value={data.password_confirmation}
                                            onChange={(v) => set('password_confirmation', v)} error={err('password_confirmation')}
                                            autoComplete="new-password" />
                                    </Field>
                                </div>
                                
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className={`flex flex-col gap-1.5 ${err('privacy_policy_accepted') ? 'text-red-600' : ''}`}>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                id="privacy_policy_accepted"
                                                type="checkbox"
                                                checked={data.privacy_policy_accepted}
                                                onChange={(e) => set('privacy_policy_accepted', e.target.checked)}
                                                aria-invalid={!!err('privacy_policy_accepted')}
                                                aria-describedby={err('privacy_policy_accepted') ? 'privacy-policy-err' : undefined}
                                                className="mt-0.5 w-4 h-4 accent-[#3B1F6B] cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-800 flex-1">
                                                I have read and agree to the{' '}
                                                <a 
                                                    href="/privacy-policy" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[#3B1F6B] font-semibold hover:underline"
                                                >
                                                    Privacy Policy
                                                </a>
                                                {' '}<span className="text-red-600" aria-hidden="true">*</span>
                                            </span>
                                        </label>
                                        {err('privacy_policy_accepted') && (
                                            <span id="privacy-policy-err" className="text-xs font-medium text-red-600 ml-7" role="alert">
                                                {err('privacy_policy_accepted')}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-3 rounded-xl bg-[#F1EDFB] p-4 text-sm text-gray-800">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0 text-[#7A63AC] mt-0.5" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                            <path d="M3 7l9 6 9-6" strokeLinejoin="round" />
                                            <rect x="3" y="5" width="18" height="14" rx="2" />
                                        </svg>
                                        <p>
                                            After submitting, you'll receive an <strong>OTP verification code</strong> via email. Once verified, an administrator will review your business details and ID. We'll email you once your store is approved.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigation */}
                        <div className="mt-8 flex gap-3">
                            {step > 1 && (
                                <button type="button" onClick={goBack} className={btnSecondary} style={fontSFCompact}>
                                    Back
                                </button>
                            )}
                            <button type="submit" disabled={processing} className={btnPrimary} style={fontSFCompact}>
                                {step < TOTAL_STEPS ? 'Continue' : processing ? 'Creating account…' : 'Create account'}
                            </button>
                        </div>

                        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-purple-800 font-medium">Log in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

SellerRegistration.layout = (page: ReactNode) => page;