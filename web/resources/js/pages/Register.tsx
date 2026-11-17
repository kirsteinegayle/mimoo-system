import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import StepProgress from '../components/registration/StepProgress';
import { 
    validateName, 
    validatePassword, 
    validateMobile, 
    normalizeMobile,
    validateAndTrimEmail,
    validateAge,
    calculateAge
} from '../utils/validators';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

const TOTAL_STEPS = 4;
const MAX_FILE_MB = 5;
const PSGC_BASE = 'https://psgc.gitlab.io/api';
const NCR_CODE = '130000000'; // PSGC code ng NCR (i-verify sa /api/regions/)

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
    'Upload a valid ID for verification',
    'Set a password to secure your account',
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
    region: string;
    province: string;
    district: string; // NCR only: 1st-4th District
    municipality_city: string;
    barangay: string;
    street_address: string;
    id_document: File | null;
    password: string;
    password_confirmation: string;
    terms_accepted: boolean;
};
type FieldName = keyof FormShape;
type Errs = Partial<Record<FieldName, string>>;

const FIELD_STEP: Partial<Record<FieldName, number>> = {
    first_name: 1, last_name: 1, sex: 1, email: 1, contact_number: 1, birthday: 1,
    region: 2, province: 2, district: 2, municipality_city: 2, barangay: 2, street_address: 2,
    id_document: 3,
    password: 4, password_confirmation: 4, terms_accepted: 4,
};
const FIELD_LABEL: Partial<Record<FieldName, string>> = {
    first_name: 'First name', last_name: 'Last name', sex: 'Sex', email: 'Email address',
    contact_number: 'Contact number', birthday: 'Birthday', region: 'Region', province: 'Province',
    district: 'District', municipality_city: 'Municipality / City', barangay: 'Barangay', street_address: 'Street & house number',
    id_document: 'Valid ID', password: 'Password', password_confirmation: 'Confirm password',
    terms_accepted: 'Terms and Privacy Policy',
};

function calcAge(birthday: string): number | null {
    return calculateAge(birthday);
}

function validate(step: number, d: FormShape, isNCR: boolean): Errs {
    const e: Errs = {};
    if (step === 1) {
        const firstNameValidation = validateName(d.first_name, 'First name');
        if (!firstNameValidation.valid) e.first_name = firstNameValidation.error;
        
        const lastNameValidation = validateName(d.last_name, 'Last name');
        if (!lastNameValidation.valid) e.last_name = lastNameValidation.error;
        
        if (!d.sex) e.sex = 'Select your sex.';
        
        const emailValidation = validateAndTrimEmail(d.email);
        if (!emailValidation.valid) e.email = emailValidation.error;
        
        const mobileValidation = validateMobile(d.contact_number);
        if (!mobileValidation.valid) e.contact_number = mobileValidation.error;
        
        const ageValidation = validateAge(d.birthday);
        if (!ageValidation.valid) e.birthday = ageValidation.error;
    }
    if (step === 2) {
        if (!d.region) e.region = 'Select a region.';
        if (!isNCR && !d.province) e.province = 'Select a province.';
        if (isNCR && !d.district) e.district = 'Select a district.';
        if (!d.municipality_city) e.municipality_city = 'Select a municipality or city.';
        if (!d.barangay) e.barangay = 'Select a barangay.';
        if (!d.street_address.trim()) e.street_address = 'Enter your street and house number.';
    }
    if (step === 3) {
        const f = d.id_document;
        if (!f) e.id_document = 'Upload a valid government-issued ID.';
        else if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) e.id_document = 'Use a PDF, JPG or PNG file.';
        else if (f.size > MAX_FILE_MB * 1024 * 1024) e.id_document = `File is too large. Max ${MAX_FILE_MB}MB.`;
    }
    if (step === 4) {
        const passwordValidation = validatePassword(d.password);
        if (!passwordValidation.valid) e.password = passwordValidation.error;
        
        if (!d.password_confirmation || d.password_confirmation !== d.password)
            e.password_confirmation = "Passwords don't match.";
        
        if (!d.terms_accepted) e.terms_accepted = 'You must accept the Terms and Privacy Policy.';
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
    id, value, onChange, onBlur, error, autoComplete,
}: { id: string; value: string; onChange: (v: string) => void; onBlur?: () => void; error?: string; autoComplete: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
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

export default function Registration() {
    const [step, setStep] = useState(1);
    const [clientErrors, setClientErrors] = useState<Errs>({});
    const headingRef = useRef<HTMLHeadingElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // PSGC API states
    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<CityMunicipality[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [loading, setLoading] = useState({ regions: false, provinces: false, cities: false, barangays: false });

    const submittingRef = useRef(false);
    const submittedOkRef = useRef(false);
    const { data, setData, post, processing, errors, transform } = useForm<FormShape>({
        first_name: '',
        last_name: '',
        middle_initial: '',
        sex: '',
        email: '',
        contact_number: '',
        birthday: '',
        account_type: 'buyer',
        region: '',
        province: '',
        district: '',
        municipality_city: '',
        barangay: '',
        street_address: '',
        id_document: null,
        password: '',
        password_confirmation: '',
        terms_accepted: false,
    });

    // Normalize bago i-submit (mas maaasahan kaysa setData + post agad)
    transform((d) => ({
        ...d,
        contact_number: normalizeMobile(d.contact_number),
        email: d.email.trim(),
        // Always include an accepted flag — FormData needs '1' for true, '0' for false
        terms_accepted: d.terms_accepted ? '1' : '0',
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

    // Inline validation handlers
    const handleBlur = (field: FieldName) => {
        const e: Errs = {};
        
        switch (field) {
            case 'first_name': {
                const v = validateName(data.first_name, 'First name');
                if (!v.valid) e.first_name = v.error;
                break;
            }
            case 'last_name': {
                const v = validateName(data.last_name, 'Last name');
                if (!v.valid) e.last_name = v.error;
                break;
            }
            case 'email': {
                const v = validateAndTrimEmail(data.email);
                if (!v.valid) e.email = v.error;
                else setData('email', v.value);
                break;
            }
            case 'contact_number': {
                const v = validateMobile(data.contact_number);
                if (!v.valid) e.contact_number = v.error;
                break;
            }
            case 'birthday': {
                const v = validateAge(data.birthday);
                if (!v.valid) e.birthday = v.error;
                break;
            }
            case 'password': {
                const v = validatePassword(data.password);
                if (!v.valid) e.password = v.error;
                break;
            }
            case 'password_confirmation':
                if (!data.password_confirmation || data.password_confirmation !== data.password)
                    e.password_confirmation = "Passwords don't match.";
                break;
        }
        
        setClientErrors((prev) => ({ ...prev, ...e }));
    };

    const goTo = (n: number) => {
        setStep(n);
        setTimeout(() => headingRef.current?.focus(), 0);
    };

    const goNext = () => {
        const e = validate(step, data, isNCR);
        if (Object.keys(e).length) {
            setClientErrors(e);
            return;
        }
        setClientErrors({});
        if (step < TOTAL_STEPS) goTo(step + 1);
        else {
            // Block double submit (double-click / Enter twice) before React re-renders `processing`.
            if (submittingRef.current || processing) return;
            submittingRef.current = true;
            const email = data.email.trim();
            console.log('Submitting buyer registration for:', email);
            // Na-normalized na ng transform() sa taas
            post('/register', {
                forceFormData: true,
                onSuccess: (response) => {
                    submittedOkRef.current = true; // keep the button locked while we leave the page
                    console.log('Buyer registration success, redirecting to OTP...', response);
                    // Force redirect to OTP page
                    window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
                },
                onError: (errs) => {
                    console.error('Buyer registration failed with errors:', JSON.stringify(errs, null, 2));
                    // Also log each individual error
                    Object.keys(errs).forEach(key => {
                        console.error(`Error in ${key}:`, errs[key]);
                    });
                },
                onFinish: () => {
                    if (!submittedOkRef.current) submittingRef.current = false; // failed: allow a retry
                    console.log('Buyer registration request finished');
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

    const stepTitles = ['Your details', 'Address', 'Identity verification', 'Secure your account'];

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
                    <h2 className="text-[1.7rem] leading-tight font-black tracking-wide mb-2.5" style={fontCalibri}>Create your buyer account.</h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Browse products, chat with sellers, and check out in minutes.
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
                        create your account
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">It only takes a few minutes.</p>
                    <p className="text-gray-500 mt-1 text-xs">
                        Fields marked <span className="text-red-600">*</span> are required.
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
                                    <input 
                                        id="first_name" 
                                        value={data.first_name} 
                                        onChange={(e) => set('first_name', e.target.value)}
                                        onBlur={() => handleBlur('first_name')}
                                        autoComplete="given-name" 
                                        aria-invalid={!!err('first_name')} 
                                        className={inputCls(err('first_name'))} 
                                    />
                                </Field>
                                <Field label="Last name" htmlFor="last_name" required error={err('last_name')}>
                                    <input 
                                        id="last_name" 
                                        value={data.last_name} 
                                        onChange={(e) => set('last_name', e.target.value)}
                                        onBlur={() => handleBlur('last_name')}
                                        autoComplete="family-name" 
                                        aria-invalid={!!err('last_name')} 
                                        className={inputCls(err('last_name'))} 
                                    />
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
                                    <input 
                                        id="email" 
                                        type="email" 
                                        placeholder="you@example.com" 
                                        value={data.email}
                                        onChange={(e) => set('email', e.target.value)} 
                                        onBlur={() => handleBlur('email')}
                                        autoComplete="email"
                                        aria-invalid={!!err('email')} 
                                        className={inputCls(err('email'))} 
                                    />
                                </Field>
                                <Field label="Contact number" htmlFor="contact_number" required error={err('contact_number')}
                                    hint="09XXXXXXXXX or +639XXXXXXXXX">
                                    <input 
                                        id="contact_number" 
                                        type="tel" 
                                        inputMode="numeric" 
                                        placeholder="09XXXXXXXXX" 
                                        maxLength={13}
                                        value={data.contact_number} 
                                        onChange={(e) => set('contact_number', e.target.value.replace(/[^\d+]/g, ''))}
                                        onBlur={() => handleBlur('contact_number')}
                                        autoComplete="tel" 
                                        aria-invalid={!!err('contact_number')} 
                                        className={inputCls(err('contact_number'))} 
                                    />
                                </Field>
                                <Field label="Birthday" htmlFor="birthday" required error={err('birthday')}>
                                    <input 
                                        id="birthday" 
                                        type="date" 
                                        max={new Date().toISOString().split('T')[0]} 
                                        value={data.birthday}
                                        onChange={(e) => set('birthday', e.target.value)} 
                                        onBlur={() => handleBlur('birthday')}
                                        autoComplete="bday"
                                        aria-invalid={!!err('birthday')} 
                                        className={inputCls(err('birthday'))} 
                                    />
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
                                            const value = e.target.value;
                                            const picked = regions.find((r) => r.name === value);
                                            setData({
                                                ...data,
                                                region: value,
                                                // NCR walang province, kaya "N/A" ang laman
                                                province: isNCRRegion(picked) ? 'N/A' : '',
                                                district: '',
                                                municipality_city: '',
                                                barangay: '',
                                            });
                                            setCities([]); // iwas stale na listahan galing sa ibang region
                                            setBarangays([]);
                                            setClientErrors((c) => ({ ...c, region: undefined, province: undefined, district: undefined }));
                                        }}
                                    >
                                        <option value="">{loading.regions ? 'Loading regions...' : 'Select region'}</option>
                                        {regions.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="Province" htmlFor="province" required={!isNCR} error={err('province')}>
                                    <select
                                        id="province"
                                        value={data.province}
                                        disabled={!data.region || loading.provinces || isNCR}
                                        aria-invalid={!!err('province')}
                                        className={`${inputCls(err('province'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                        onChange={(e) => {
                                            setData({ ...data, province: e.target.value, municipality_city: '', barangay: '' });
                                            setClientErrors((c) => ({ ...c, province: undefined }));
                                        }}
                                    >
                                        {isNCR ? (
                                            <option value="N/A">N/A</option>
                                        ) : (
                                            <>
                                                <option value="">
                                                    {!data.region ? 'Select region first' : loading.provinces ? 'Loading provinces...' : 'Select province'}
                                                </option>
                                                {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
                                            </>
                                        )}
                                    </select>
                                </Field>
                                {isNCR && (
                                    <Field label="District" htmlFor="district" required error={err('district')}>
                                        <select
                                            id="district"
                                            value={data.district}
                                            disabled={!data.region}
                                            aria-invalid={!!err('district')}
                                            className={`${inputCls(err('district'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                            onChange={(e) => {
                                                setData({ ...data, district: e.target.value, municipality_city: '', barangay: '' });
                                                setClientErrors((c) => ({ ...c, district: undefined }));
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
                                            setData({ ...data, municipality_city: e.target.value, barangay: '' });
                                            setClientErrors((c) => ({ ...c, municipality_city: undefined }));
                                        }}
                                    >
                                        <option value="">
                                            {loading.cities
                                                ? 'Loading cities...'
                                                : isNCR
                                                    ? (!data.district ? 'Select district first' : 'Select municipality or city')
                                                    : (!data.province ? 'Select province first' : 'Select municipality or city')}
                                        </option>
                                        {visibleCities.map((m) => <option key={m.code} value={m.name}>{m.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="Barangay" htmlFor="barangay" required error={err('barangay')}>
                                    <select
                                        id="barangay"
                                        value={data.barangay}
                                        disabled={!data.municipality_city || loading.barangays}
                                        aria-invalid={!!err('barangay')}
                                        className={`${inputCls(err('barangay'))} disabled:bg-[#F1EDFB] disabled:text-gray-400`}
                                        onChange={(e) => set('barangay', e.target.value)}
                                    >
                                        <option value="">
                                            {!data.municipality_city ? 'Select municipality first' : loading.barangays ? 'Loading barangays...' : 'Select barangay'}
                                        </option>
                                        {barangays.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="Street & house number" htmlFor="street_address" required error={err('street_address')} className="sm:col-span-2">
                                    <input id="street_address" placeholder="e.g. 123 Mabini St." value={data.street_address}
                                        onChange={(e) => set('street_address', e.target.value)} autoComplete="street-address"
                                        aria-invalid={!!err('street_address')} className={inputCls(err('street_address'))} />
                                </Field>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-gray-800">
                                    Upload a valid ID <span className="text-red-600" aria-hidden="true">*</span>
                                </span>
                                <div className={`flex items-center gap-3 rounded-xl p-4 ${
                                    data.id_document ? 'border border-[#B4A7D6] bg-white' : 'border-2 border-dashed border-[#DDD5EE] bg-[#F8F6FC]'
                                }`}>
                                    <span className="shrink-0 w-10 h-10 rounded-lg bg-[#F1EDFB] text-[#3B1F6B] flex items-center justify-center" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                            <rect x="3" y="6" width="18" height="12" rx="2" />
                                            <circle cx="8.5" cy="12" r="1.6" fill="currentColor" />
                                            <path d="M13 10.5h5M13 13.5h5" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <span className="flex-1 min-w-0" aria-live="polite">
                                        <span className="block text-sm font-medium text-gray-800 break-words">
                                            {data.id_document ? data.id_document.name : 'No file selected'}
                                        </span>
                                        <span className="block text-xs text-gray-500">
                                            {data.id_document
                                                ? `${(data.id_document.size / 1024 / 1024).toFixed(2)} MB`
                                                : `Government-issued ID · PDF, JPG or PNG · up to ${MAX_FILE_MB}MB`}
                                        </span>
                                    </span>
                                    <button id="id_document" type="button" onClick={() => fileRef.current?.click()}
                                        aria-describedby={err('id_document') ? 'id_document-err' : undefined}
                                        className="shrink-0 rounded-lg border border-[#DDD5EE] bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 hover:border-[#9B5DE5] hover:text-[#3B1F6B] transition">
                                        {data.id_document ? 'Change file' : 'Choose ID file'}
                                    </button>
                                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" tabIndex={-1} className="sr-only"
                                        onChange={(e) => set('id_document', e.target.files?.[0] ?? null)} />
                                </div>
                                {err('id_document') && (
                                    <span id="id_document-err" className="text-xs font-medium text-red-600" role="alert">{err('id_document')}</span>
                                )}
                            </div>
                        )}

                        {/* STEP 4 */}
                        {step === 4 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Password" htmlFor="password" required error={err('password')} 
                                        hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character">
                                        <PasswordInput 
                                            id="password" 
                                            value={data.password} 
                                            onChange={(v) => set('password', v)}
                                            onBlur={() => handleBlur('password')}
                                            error={err('password')} 
                                            autoComplete="new-password" 
                                        />
                                    </Field>
                                    <Field label="Confirm password" htmlFor="password_confirmation" required error={err('password_confirmation')}>
                                        <PasswordInput 
                                            id="password_confirmation" 
                                            value={data.password_confirmation}
                                            onChange={(v) => set('password_confirmation', v)} 
                                            onBlur={() => handleBlur('password_confirmation')}
                                            error={err('password_confirmation')}
                                            autoComplete="new-password" 
                                        />
                                    </Field>
                                </div>
                                
                                {/* Terms and Privacy Policy Checkbox */}
                                <div className="mt-5">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.terms_accepted}
                                            onChange={(e) => set('terms_accepted', e.target.checked)}
                                            className={`mt-0.5 rounded border-gray-300 text-[#3B1F6B] focus:ring-[#D9CCF2] ${
                                                err('terms_accepted') ? 'border-red-400' : ''
                                            }`}
                                        />
                                        <span className="text-sm text-gray-700">
                                            I agree to the{' '}
                                            <Link 
                                                href="/terms" 
                                                target="_blank"
                                                className="text-[#3B1F6B] font-medium hover:underline"
                                            >
                                                Terms of Service
                                            </Link>
                                            {' '}and{' '}
                                            <Link 
                                                href="/privacy-policy" 
                                                target="_blank"
                                                className="text-[#3B1F6B] font-medium hover:underline"
                                            >
                                                Privacy Policy
                                            </Link>
                                            <span className="text-red-600 ml-1">*</span>
                                        </span>
                                    </label>
                                    {err('terms_accepted') && (
                                        <span className="text-xs font-medium text-red-600 mt-1 block ml-7" role="alert">
                                            {err('terms_accepted')}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mt-6 flex gap-3 rounded-xl bg-[#F1EDFB] p-4 text-sm text-gray-800">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0 text-[#7A63AC] mt-0.5" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                        <path d="M3 7l9 6 9-6" strokeLinejoin="round" />
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                    </svg>
                                    <p>After submitting, check your email for a verification code to complete your registration.</p>
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

Registration.layout = (page: ReactNode) => page;