import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle, BadgeCheck, Bell, Eye, EyeOff, FileText, HelpCircle, Lock, Mail,
    MessageSquare, Pencil, Plus, Search, ShieldCheck, Smartphone, Store, Trash2, Upload, UserCog,
    Wallet, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';

/* =====================================================================
 * Seller Account Management — standalone fullscreen page.
 * Route: /seller/account
 * Active section is kept in the URL: /seller/account?section=payout
 * ===================================================================== */

// Props interface for data from backend
interface SellerAccountProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
        };
    };
    seller?: {
        store_name?: string;
        store_description?: string;
        store_category?: string;
        store_logo?: string;
        phone?: string;
        address_line1?: string;
        barangay?: string;
        city?: string;
        province?: string;
        postal_code?: string;
    };
}

const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSyne = { fontFamily: "'Syne', sans-serif" };

const BORDER = 'border-[color-mix(in_srgb,#B9A6DE_44%,white)]';
const LAV50 = 'bg-[color-mix(in_srgb,#B9A6DE_12%,white)]';
const LAV100 = 'bg-[color-mix(in_srgb,#B9A6DE_24%,white)]';
const LAV100_HOVER = 'hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)]';

const btnBase = 'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold px-5 py-2.5 transition disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap';
const btnPrimary = `${btnBase} bg-[#4B2E7E] text-white hover:bg-[color-mix(in_srgb,#4B2E7E_82%,black)]`;
const btnGhost = `${btnBase} ${LAV100} text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_44%,white)]`;
const btnOutline = `${btnBase} bg-white border-[1.5px] ${BORDER} text-[#2A1B4D] hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)]`;
const btnDanger = `${btnBase} bg-[#b3384f] text-white hover:bg-[color-mix(in_srgb,#b3384f_85%,black)]`;
const btnWarn = `${btnBase} bg-white border-[1.5px] border-[#a9752b] text-[#a9752b] hover:bg-[#f7ecd6]`;
const btnSm = '!px-3.5 !py-2 !text-xs';

const inputCls = (err?: string) =>
    `w-full rounded-lg border-[1.5px] px-3.5 py-2.5 text-sm text-[#2A1B4D] bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/25 focus:border-[#4B2E7E] transition disabled:bg-[color-mix(in_srgb,#B9A6DE_12%,white)] disabled:border-[color-mix(in_srgb,#B9A6DE_24%,white)] disabled:cursor-default disabled:opacity-100 ${
        err ? 'border-red-400 bg-red-50' : BORDER
    }`;

const CATEGORIES = [
    'Pet Supplies', 'Electronics and Gadgets', "Women's Apparel", "Men's Apparel", 'Kids and Baby',
    'Home and Garden', 'Sports and Outdoors', 'Health and Beauty', 'Books and Media',
    'Food and Gourmet', 'Furniture and Decor', 'Jewelry and Watches',
];

/* ---------------- shared helpers ---------------- */
type Errs = Record<string, string | undefined>;
type Toaster = (msg: string, bad?: boolean) => void;
const ToastCtx = createContext<Toaster>(() => {});

const initials = (n: string) =>
    n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'ST';
const fmtSize = (b: number) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const maskNo = (v: string) => (v ? '•'.repeat(Math.max(0, v.length - 4)) + v.slice(-4) : '');

/* Confirmation / form dialogs stay as modals (small, focused interruptions). */
function SubModal({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[#201A33]/55 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`relative w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-[0_24px_70px_rgba(32,26,51,0.35)]`}
                style={fontPoppins}
            >
                {children}
            </div>
        </div>
    );
}

const MTitle = ({ children, danger }: { children: ReactNode; danger?: boolean }) => (
    <h3 className={`text-lg font-semibold mb-1.5 ${danger ? 'text-[#b3384f]' : ''}`} style={fontSyne}>{children}</h3>
);
const MSub = ({ children }: { children: ReactNode }) => (
    <p className="text-sm text-[#6E6570] leading-relaxed mb-4">{children}</p>
);
const MActions = ({ children }: { children: ReactNode }) => (
    <div className="flex justify-end gap-2.5 mt-6 flex-wrap">{children}</div>
);

function Field({
    label, htmlFor, error, hint, className = '', children,
}: { label: string; htmlFor: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
    return (
        <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
            <label htmlFor={htmlFor} className="text-xs font-bold text-[#2A1B4D]">{label}</label>
            {children}
            {hint && !error && <span className="text-xs text-[#6E6570]">{hint}</span>}
            {error && <span className="text-xs font-semibold text-red-600" role="alert">{error}</span>}
        </div>
    );
}

function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative shrink-0 w-11 h-6 rounded-full transition disabled:cursor-default disabled:opacity-70 ${
                checked ? 'bg-[#4B2E7E]' : 'bg-[color-mix(in_srgb,#B9A6DE_44%,white)]'
            }`}
        >
            <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
    );
}

function ToggleRow({ title, desc, checked, onChange, disabled }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <div className="flex items-center gap-4 py-4 border-t first:border-t-0 first:pt-0 last:pb-0 border-[color-mix(in_srgb,#B9A6DE_24%,white)]">
            <div className="flex-1 min-w-0">
                <b className="block text-sm font-semibold">{title}</b>
                <span className="text-xs text-[#6E6570]">{desc}</span>
            </div>
            <Switch checked={checked} onChange={onChange} disabled={disabled} label={title} />
        </div>
    );
}

const SubHead = ({ children }: { children: ReactNode }) => (
    <p className="text-xs font-bold uppercase tracking-wider text-[#6E6570] mb-3.5">{children}</p>
);
const Divider = () => <hr className={`my-6 border-0 border-t ${BORDER}`} />;

type Tone = 'gold' | 'ok' | 'bad' | 'info';
const TONES: Record<Tone, string> = {
    gold: 'bg-[#f7ecd6] text-[#a9752b]',
    ok: 'bg-[#e7f5ec] text-[#2c7a52]',
    bad: 'bg-[#fbeced] text-[#b3384f]',
    info: 'bg-[#e4eef3] text-[#2f6f8f]',
};
const Pill = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
    <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${TONES[tone]}`}>{children}</span>
);
const NoteBox = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
    <div className={`flex gap-3 p-3.5 rounded-lg text-sm leading-relaxed mb-4 ${TONES[tone]}`}>
        <AlertTriangle className="w-[18px] h-[18px] shrink-0 mt-0.5" />
        <div>{children}</div>
    </div>
);

/* ---------------- card + edit pattern ---------------- */
function Card({ icon: Icon, title, desc, right, children, footer }: {
    icon?: LucideIcon; title: string; desc: string; right?: ReactNode; children: ReactNode; footer?: ReactNode;
}) {
    return (
        <section className={`bg-white rounded-xl border-2 ${BORDER} mb-5`}>
            <div className="flex items-start gap-3.5 px-6 pt-5 pb-4 border-b border-[color-mix(in_srgb,#B9A6DE_24%,white)]">
                {Icon && (
                    <span className={`shrink-0 w-10 h-10 rounded-[11px] ${LAV100} text-[#4B2E7E] flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                    </span>
                )}
                <div className="min-w-0">
                    <h2 className="text-base font-semibold" style={fontSyne}>{title}</h2>
                    <p className="text-xs text-[#6E6570] mt-0.5">{desc}</p>
                </div>
                {right && <div className="ml-auto shrink-0 flex items-center gap-3">{right}</div>}
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer}
        </section>
    );
}

function useEdit<T extends object>(initial: T, validate: (d: T) => Errs, onCommit?: (next: T, prev: T) => void) {
    const [saved, setSaved] = useState<T>(initial);
    const [draft, setDraft] = useState<T>(initial);
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState<Errs>({});
    const [confirm, setConfirm] = useState<null | 'save' | 'discard'>(null);
    const [justSaved, setJustSaved] = useState(false);
    const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

    const set = <K extends keyof T>(k: K, v: T[K]) => {
        setDraft((d) => ({ ...d, [k]: v }));
        setErrors((e) => ({ ...e, [k as string]: undefined }));
    };
    const start = () => { setDraft(saved); setErrors({}); setEditing(true); setJustSaved(false); };
    const cancel = () => { setDraft(saved); setErrors({}); setEditing(false); setConfirm(null); };
    const requestCancel = () => (dirty ? setConfirm('discard') : cancel());
    const requestSave = () => {
        const e = validate(draft);
        setErrors(e);
        if (Object.values(e).some(Boolean)) return false;
        setConfirm('save');
        return true;
    };
    const commit = () => { onCommit?.(draft, saved); setSaved(draft); setEditing(false); setConfirm(null); setJustSaved(true); };
    const v = editing ? draft : saved;
    return { saved, draft, v, editing, errors, confirm, setConfirm, dirty, justSaved, set, start, cancel, requestCancel, requestSave, commit };
}
type Edit<T extends object> = ReturnType<typeof useEdit<T>>;

function EditShell<T extends object>({ icon, title, desc, edit, saveMsg, children }: {
    icon: LucideIcon; title: string; desc: string; edit: Edit<T>; saveMsg: string; children: ReactNode;
}) {
    const toast = useContext(ToastCtx);
    return (
        <>
            <Card
                icon={icon}
                title={title}
                desc={desc}
                right={
                    <>
                        {edit.justSaved && !edit.editing && <span className="text-xs text-[#6E6570]">Saved just now</span>}
                        {!edit.editing && (
                            <button type="button" onClick={edit.start} className={`${btnOutline} ${btnSm}`}>
                                <Pencil className="w-3.5 h-3.5" />Edit
                            </button>
                        )}
                    </>
                }
                footer={
                    edit.editing ? (
                        <div className={`flex items-center justify-end gap-2.5 flex-wrap px-6 py-4 border-t ${BORDER} ${LAV50} rounded-b-xl`}>
                            <span className="mr-auto text-xs text-[#6E6570]">Review your changes, then save. You will be asked to confirm.</span>
                            <button type="button" onClick={edit.requestCancel} className={btnGhost}>Cancel</button>
                            <button
                                type="button"
                                onClick={() => { if (!edit.requestSave()) toast('Please fix the highlighted fields.', true); }}
                                className={btnPrimary}
                            >
                                Save changes
                            </button>
                        </div>
                    ) : undefined
                }
            >
                {children}
            </Card>

            {edit.confirm === 'save' && (
                <SubModal onClose={() => edit.setConfirm(null)}>
                    <MTitle>Save changes to {title}?</MTitle>
                    <MSub>{saveMsg}</MSub>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={() => edit.setConfirm(null)}>Review again</button>
                        <button type="button" className={btnPrimary} onClick={() => { edit.commit(); toast(`${title} saved.`); }}>Yes, save changes</button>
                    </MActions>
                </SubModal>
            )}
            {edit.confirm === 'discard' && (
                <SubModal onClose={() => edit.setConfirm(null)}>
                    <MTitle>Discard your changes?</MTitle>
                    <MSub>Your edits to {title} have not been saved and will be lost.</MSub>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={() => edit.setConfirm(null)}>Keep editing</button>
                        <button type="button" className={btnDanger} onClick={() => { edit.cancel(); toast('Changes discarded.'); }}>Discard changes</button>
                    </MActions>
                </SubModal>
            )}
        </>
    );
}

/* ===================== 1. STORE PROFILE ===================== */
interface ProfileData {
    storeName: string; storeDesc: string; storeCat: string; pickPhone: string;
    addr1: string; brgy: string; city: string; prov: string; zip: string; logo: string;
}
const validateProfile = (d: ProfileData): Errs => {
    const e: Errs = {};
    if (!d.storeName.trim()) e.storeName = 'Store name is required.';
    if (!d.storeDesc.trim()) e.storeDesc = 'Please add a short description.';
    if (!d.addr1.trim()) e.addr1 = 'Street address is required.';
    if (!/^\d{4}$/.test(d.zip.trim())) e.zip = 'Enter a 4-digit postal code.';
    return e;
};

function ProfileSection({ edit }: { edit: Edit<ProfileData> }) {
    const { v, editing, errors, set } = edit;
    const [logoErr, setLogoErr] = useState('');
    const toast = useContext(ToastCtx);

    const pickLogo = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        setLogoErr('');
        if (!f) return;
        if (!/^image\/(png|jpeg)$/.test(f.type)) return setLogoErr('Please choose a JPG or PNG image.');
        if (f.size > 2 * 1048576) return setLogoErr('Image is larger than 2 MB.');
        const r = new FileReader();
        r.onload = () => { set('logo', String(r.result)); toast('Logo selected. Save changes to apply it.'); };
        r.readAsDataURL(f);
    };

    return (
        <EditShell
            icon={Store}
            title="Store Profile"
            desc="This information is shown to buyers on your store page."
            edit={edit}
            saveMsg="Your store name, logo, description, category, and pickup address will be updated and shown to buyers."
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <span className="block text-xs font-bold mb-2">Store logo</span>
                    <div className="flex items-center gap-4">
                        <span className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-semibold text-[#4B2E7E] ${v.logo ? 'border-2 border-solid' : 'border-2 border-dashed'} ${BORDER} ${LAV50}`} style={fontSyne}>
                            {v.logo ? <img src={v.logo} alt="Store logo" className="w-full h-full object-cover" /> : initials(v.storeName)}
                        </span>
                        {editing && (
                            <div>
                                <div className="flex gap-2 flex-wrap mb-1.5">
                                    <label className={`${btnOutline} ${btnSm} cursor-pointer`}>
                                        <Upload className="w-3.5 h-3.5" />Upload logo
                                        <input type="file" accept="image/png,image/jpeg" hidden onChange={pickLogo} />
                                    </label>
                                    {v.logo && <button type="button" className={`${btnGhost} ${btnSm}`} onClick={() => set('logo', '')}>Remove</button>}
                                </div>
                                <p className="text-xs text-[#6E6570]">Square image, JPG or PNG, up to 2 MB.</p>
                                {logoErr && <p className="text-xs font-semibold text-red-600 mt-1">{logoErr}</p>}
                            </div>
                        )}
                    </div>
                </div>

                <Field label="Store name" htmlFor="am-storeName" error={errors.storeName} className="sm:col-span-2">
                    <input id="am-storeName" disabled={!editing} maxLength={60} value={v.storeName} onChange={(e) => set('storeName', e.target.value)} className={inputCls(errors.storeName)} />
                </Field>
                <Field label="Store description" htmlFor="am-storeDesc" error={errors.storeDesc} className="sm:col-span-2">
                    <textarea id="am-storeDesc" disabled={!editing} rows={3} maxLength={300} value={v.storeDesc} onChange={(e) => set('storeDesc', e.target.value)} className={`${inputCls(errors.storeDesc)} resize-none`} />
                    {editing && <span className="text-xs text-[#6E6570] text-right">{v.storeDesc.length}/300</span>}
                </Field>
                <Field label="Store category" htmlFor="am-storeCat">
                    <select id="am-storeCat" disabled={!editing} value={v.storeCat} onChange={(e) => set('storeCat', e.target.value)} className={inputCls()}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Pickup contact number" htmlFor="am-pickPhone">
                    <input id="am-pickPhone" type="tel" disabled={!editing} value={v.pickPhone} onChange={(e) => set('pickPhone', e.target.value)} className={inputCls()} />
                </Field>
            </div>

            <Divider />
            <SubHead>Pickup address</SubHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Street / building / house no." htmlFor="am-addr1" error={errors.addr1} className="sm:col-span-2">
                    <input id="am-addr1" disabled={!editing} value={v.addr1} onChange={(e) => set('addr1', e.target.value)} className={inputCls(errors.addr1)} />
                </Field>
                <Field label="Barangay" htmlFor="am-brgy">
                    <input id="am-brgy" disabled={!editing} value={v.brgy} onChange={(e) => set('brgy', e.target.value)} className={inputCls()} />
                </Field>
                <Field label="City / municipality" htmlFor="am-city">
                    <input id="am-city" disabled={!editing} value={v.city} onChange={(e) => set('city', e.target.value)} className={inputCls()} />
                </Field>
                <Field label="Province" htmlFor="am-prov">
                    <input id="am-prov" disabled={!editing} value={v.prov} onChange={(e) => set('prov', e.target.value)} className={inputCls()} />
                </Field>
                <Field label="Postal code" htmlFor="am-zip" error={errors.zip}>
                    <input id="am-zip" inputMode="numeric" maxLength={4} disabled={!editing} value={v.zip} onChange={(e) => set('zip', e.target.value.replace(/\D/g, ''))} className={inputCls(errors.zip)} />
                </Field>
            </div>
        </EditShell>
    );
}

/* ===================== 2. BUSINESS VERIFICATION ===================== */
interface Doc { name: string; size: number }

function DropZone({ label, hint, doc, error, onFile, onRemove }: {
    label: string; hint: string; doc: Doc | null; error?: string; onFile: (f: File | undefined) => void; onRemove: () => void;
}) {
    const [over, setOver] = useState(false);
    return (
        <div>
            <span className="block text-xs font-bold mb-2">{label}</span>
            {doc ? (
                <DocChip doc={doc} onRemove={onRemove} />
            ) : (
                <label
                    onDragOver={(e: DragEvent) => { e.preventDefault(); setOver(true); }}
                    onDragLeave={() => setOver(false)}
                    onDrop={(e: DragEvent) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]); }}
                    className={`flex flex-col items-center justify-center gap-1 text-center px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
                        over ? `border-[#B9A6DE] ${LAV100}` : `${BORDER} ${LAV50} hover:border-[#B9A6DE]`
                    }`}
                >
                    <Upload className="w-6 h-6 text-[#4B2E7E]" />
                    <b className="text-sm">Click to upload or drag a file here</b>
                    <span className="text-xs text-[#6E6570]">{hint}</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
            )}
            {error && <p className="text-xs font-semibold text-red-600 mt-1.5">{error}</p>}
        </div>
    );
}

function DocChip({ doc, onRemove }: { doc: Doc; onRemove?: () => void }) {
    return (
        <div className={`flex items-center gap-3 px-3.5 py-3 border-[1.5px] ${BORDER} rounded-xl bg-white`}>
            <span className={`shrink-0 w-9 h-9 rounded-lg ${LAV100} text-[#4B2E7E] flex items-center justify-center`}><FileText className="w-[18px] h-[18px]" /></span>
            <div className="min-w-0">
                <div className="text-sm font-bold truncate">{doc.name}</div>
                <div className="text-xs text-[#6E6570]">{fmtSize(doc.size)}</div>
            </div>
            {onRemove && (
                <button type="button" onClick={onRemove} aria-label="Remove file" className={`ml-auto w-7 h-7 rounded-md text-[#6E6570] hover:text-[#b3384f] ${LAV100_HOVER} flex items-center justify-center`}>
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function VerificationSection() {
    const toast = useContext(ToastCtx);
    // status is set by the Mimoo admin (backend). Sellers can only submit documents.
    const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
    const [docs, setDocs] = useState<{ permit: Doc; id: Doc }>({
        permit: { name: 'business-permit-2026.pdf', size: 482000 },
        id: { name: 'drivers-license.jpg', size: 1260000 },
    });
    const [draft, setDraft] = useState<{ permit: Doc | null; id: Doc | null }>({ permit: null, id: null });
    const [errs, setErrs] = useState<{ permit?: string; id?: string }>({});
    const [editing, setEditing] = useState(false);
    const reason = 'The business permit image was blurry and the expiry date could not be read. Please upload a clear, full-page copy.';
    const showForm = status === 'rejected' || editing;

    const take = (key: 'permit' | 'id', f?: File) => {
        if (!f) return;
        const okType = /\.(jpe?g|png|pdf)$/i.test(f.name);
        if (!okType || f.size > 5 * 1048576) {
            setErrs((e) => ({ ...e, [key]: !okType ? 'Use a JPG, PNG or PDF file.' : 'File is larger than 5 MB.' }));
            return;
        }
        setErrs((e) => ({ ...e, [key]: undefined }));
        setDraft((d) => ({ ...d, [key]: { name: f.name, size: f.size } }));
    };

    const submit = () => {
        if (!draft.permit || !draft.id) return;
        setDocs({ permit: draft.permit, id: draft.id });
        setDraft({ permit: null, id: null });
        setEditing(false);
        setStatus('pending');
        toast('Documents submitted for review.');
    };

    return (
        <Card
            icon={ShieldCheck}
            title="Business Verification"
            desc="Verify your business to unlock payouts and the verified seller badge."
            right={
                status === 'verified' ? <BadgeCheck className="w-7 h-7 text-[#2c7a52]" aria-label="Verified" /> :
                status === 'pending' ? <Pill tone="gold">Pending review</Pill> : <Pill tone="bad">Rejected</Pill>
            }
        >
            {status === 'rejected' && <NoteBox tone="bad"><b>Verification was rejected.</b> {reason} Upload new documents and submit again.</NoteBox>}
            {status === 'pending' && !editing && <NoteBox tone="gold">Your documents are being reviewed by the Mimoo team. This usually takes 1 to 3 business days.</NoteBox>}

            {showForm ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DropZone label="Business permit" hint="JPG, PNG or PDF, up to 5 MB" doc={draft.permit} error={errs.permit} onFile={(f) => take('permit', f)} onRemove={() => setDraft((d) => ({ ...d, permit: null }))} />
                        <DropZone label="Valid ID" hint="Government-issued ID. JPG, PNG or PDF, up to 5 MB" doc={draft.id} error={errs.id} onFile={(f) => take('id', f)} onRemove={() => setDraft((d) => ({ ...d, id: null }))} />
                    </div>
                    <div className="flex gap-2.5 flex-wrap mt-5">
                        <button type="button" className={btnPrimary} disabled={!draft.permit || !draft.id} onClick={submit}>Submit for verification</button>
                        {editing && <button type="button" className={btnGhost} onClick={() => { setEditing(false); setDraft({ permit: null, id: null }); }}>Cancel</button>}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><span className="block text-xs font-bold mb-2">Business permit</span><DocChip doc={docs.permit} /></div>
                        <div><span className="block text-xs font-bold mb-2">Valid ID</span><DocChip doc={docs.id} /></div>
                    </div>
                    {status === 'verified' && (
                        <button type="button" className={`${btnOutline} mt-5`} onClick={() => setEditing(true)}>Replace documents</button>
                    )}
                </>
            )}

            {/* demo-only controls so you can preview each state; remove once the backend sets this */}
            <div className={`mt-6 pt-4 border-t border-dashed ${BORDER} flex items-center gap-2 flex-wrap text-xs text-[#6E6570]`}>
                <span>Preview status (demo only):</span>
                {(['pending', 'verified', 'rejected'] as const).map((s) => (
                    <button key={s} type="button" onClick={() => { setStatus(s); setEditing(false); }} className={`px-2.5 py-1 rounded-full font-bold ${status === s ? 'bg-[#4B2E7E] text-white' : `${LAV100} text-[#6E6570]`}`}>{s}</button>
                ))}
            </div>
        </Card>
    );
}

/* ===================== 3. ACCOUNT SECURITY ===================== */
function PasswordInput({ id, value, onChange, error, autoComplete }: { id: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input id={id} type={show ? 'text' : 'password'} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className={`${inputCls(error)} pr-11`} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-[#6E6570] hover:text-[#2A1B4D]">
                {show ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
            </button>
        </div>
    );
}

const strength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
    return s;
};
const METER = ['', 'bg-[#b3384f]', 'bg-[#a9752b]', 'bg-[#7aa455]', 'bg-[#2c7a52]'];

function ContactDialog({ kind, onClose, onDone }: { kind: 'email' | 'phone'; onClose: () => void; onDone: (v: string) => void }) {
    const isEmail = kind === 'email';
    const noun = isEmail ? 'email address' : 'mobile number';
    const [step, setStep] = useState<1 | 2>(1);
    const [val, setVal] = useState('');
    const [code, setCode] = useState('');
    const [err, setErr] = useState('');

    const send = () => {
        const v = val.trim();
        const ok = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : /^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g, ''));
        if (!ok) return setErr(isEmail ? 'Enter a valid email address.' : 'Enter a valid PH mobile number.');
        setErr('');
        setStep(2);
    };
    const verify = () => {
        if (!/^\d{6}$/.test(code)) return setErr('Enter the 6-digit code.');
        onDone(val.trim());
    };

    return (
        <SubModal onClose={onClose}>
            {step === 1 ? (
                <>
                    <MTitle>Change {noun}</MTitle>
                    <MSub>We will send a 6-digit code to the new {noun} to confirm it is yours.</MSub>
                    <Field label={`New ${noun}`} htmlFor="am-newContact" error={err}>
                        <input id="am-newContact" autoFocus type={isEmail ? 'email' : 'tel'} value={val} onChange={(e) => { setVal(e.target.value); setErr(''); }} placeholder={isEmail ? 'name@example.com' : '09XX XXX XXXX'} className={inputCls(err)} />
                    </Field>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
                        <button type="button" className={btnPrimary} onClick={send}>Send code</button>
                    </MActions>
                </>
            ) : (
                <>
                    <MTitle>Enter verification code</MTitle>
                    <MSub>We sent a 6-digit code to <b className="text-[#2A1B4D]">{val.trim()}</b>. <span className="block mt-1">Demo: enter any 6 digits.</span></MSub>
                    <Field label="6-digit code" htmlFor="am-code" error={err}>
                        <input id="am-code" autoFocus inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setErr(''); }} className={`${inputCls(err)} text-center text-xl font-semibold tracking-[0.5em]`} />
                    </Field>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
                        <button type="button" className={btnPrimary} onClick={verify}>Verify and update</button>
                    </MActions>
                </>
            )}
        </SubModal>
    );
}

function ContactRow({ icon: Icon, label, value, action, onClick }: { icon: LucideIcon; label: string; value: string; action: string; onClick: () => void }) {
    return (
        <div className="flex items-center gap-4 py-4 border-t first:border-t-0 border-[color-mix(in_srgb,#B9A6DE_24%,white)] flex-wrap">
            <span className={`shrink-0 w-10 h-10 rounded-[10px] ${LAV100} text-[#4B2E7E] flex items-center justify-center`}><Icon className="w-[18px] h-[18px]" /></span>
            <div className="flex-1 min-w-[180px]"><b className="block text-xs text-[#6E6570]">{label}</b><span className="text-sm font-semibold">{value}</span></div>
            <BadgeCheck className="w-7 h-7 text-[#2c7a52] shrink-0" aria-label="Verified" />
            <button type="button" className={`${btnOutline} ${btnSm}`} onClick={onClick}>{action}</button>
        </div>
    );
}

function SecuritySection({ contact, setContact }: { contact: { email: string; phone: string }; setContact: (c: { email: string; phone: string }) => void }) {
    const toast = useContext(ToastCtx);
    const [pw, setPw] = useState({ cur: '', nw: '', conf: '' });
    const [errs, setErrs] = useState<Errs>({});
    const [confirmPw, setConfirmPw] = useState(false);
    const [dialog, setDialog] = useState<null | 'email' | 'phone'>(null);
    const s = strength(pw.nw);
    const digits = contact.phone.replace(/\D/g, '');
    const phoneMasked = `+63 ${digits.slice(-10, -7)} *** ${digits.slice(-4)}`;

    const submit = () => {
        const e: Errs = {};
        if (!pw.cur) e.cur = 'Enter your current password.';
        if (pw.nw.length < 8 || !/[a-z]/.test(pw.nw) || !/[A-Z]/.test(pw.nw) || !/\d/.test(pw.nw))
            e.nw = 'Use at least 8 characters with upper and lower case letters and a number.';
        if (!pw.conf || pw.conf !== pw.nw) e.conf = 'Passwords do not match.';
        setErrs(e);
        if (Object.values(e).some(Boolean)) return toast('Please fix the highlighted fields.', true);
        setConfirmPw(true);
    };

    return (
        <Card icon={Lock} title="Account Security" desc="Keep your account protected with a strong password and verified contact details.">
            <SubHead>Change password</SubHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Current password" htmlFor="am-pwCur" error={errs.cur} className="sm:col-span-2">
                    <PasswordInput id="am-pwCur" value={pw.cur} onChange={(v) => setPw((p) => ({ ...p, cur: v }))} error={errs.cur} autoComplete="current-password" />
                </Field>
                <Field label="New password" htmlFor="am-pwNew" error={errs.nw}>
                    <PasswordInput id="am-pwNew" value={pw.nw} onChange={(v) => setPw((p) => ({ ...p, nw: v }))} error={errs.nw} autoComplete="new-password" />
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4].map((i) => <i key={i} className={`flex-1 h-1.5 rounded-full ${i <= s ? METER[s] : LAV100}`} />)}
                    </div>
                    <span className="text-xs text-[#6E6570]">
                        {pw.nw ? ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][s] : 'Use 8+ characters with upper and lower case letters and a number.'}
                    </span>
                </Field>
                <Field label="Confirm new password" htmlFor="am-pwConf" error={errs.conf}>
                    <PasswordInput id="am-pwConf" value={pw.conf} onChange={(v) => setPw((p) => ({ ...p, conf: v }))} error={errs.conf} autoComplete="new-password" />
                </Field>
            </div>
            <button type="button" className={`${btnPrimary} mt-5`} onClick={submit}>Update password</button>

            <Divider />
            <SubHead>Verified contact details</SubHead>
            <ContactRow icon={Mail} label="Email address" value={contact.email} action="Change email" onClick={() => setDialog('email')} />
            <ContactRow icon={Smartphone} label="Mobile number" value={phoneMasked} action="Change number" onClick={() => setDialog('phone')} />

            {confirmPw && (
                <SubModal onClose={() => setConfirmPw(false)}>
                    <MTitle>Update your password?</MTitle>
                    <MSub>You will use the new password the next time you log in.</MSub>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={() => setConfirmPw(false)}>Cancel</button>
                        <button type="button" className={btnPrimary} onClick={() => { setConfirmPw(false); setPw({ cur: '', nw: '', conf: '' }); setErrs({}); toast('Password updated.'); }}>Yes, update password</button>
                    </MActions>
                </SubModal>
            )}
            {dialog && (
                <ContactDialog
                    kind={dialog}
                    onClose={() => setDialog(null)}
                    onDone={(v) => {
                        setContact(dialog === 'email' ? { ...contact, email: v } : { ...contact, phone: v });
                        setDialog(null);
                        toast(`Your ${dialog === 'email' ? 'email address' : 'mobile number'} was updated and verified.`);
                    }}
                />
            )}
        </Card>
    );
}

/* ===================== 4. PAYOUT ===================== */
interface PayoutData {
    method: 'bank' | 'ewallet';
    bankName: string; bankAcctName: string; bankNo: string;
    ewProv: string; ewName: string; ewNo: string;
}
const payoutInitial: PayoutData = {
    method: 'bank', bankName: 'BDO Unibank', bankAcctName: 'Precious Tolentino', bankNo: '001234567890',
    ewProv: '', ewName: '', ewNo: '',
};
const validatePayout = (d: PayoutData): Errs => {
    const e: Errs = {};
    if (d.method === 'bank') {
        if (!d.bankName) e.bankName = 'Select your bank.';
        if (!d.bankAcctName.trim()) e.bankAcctName = 'Account name is required.';
        if (!/^\d{10,16}$/.test(d.bankNo.replace(/\s/g, ''))) e.bankNo = 'Enter 10 to 16 digits.';
    } else {
        if (!d.ewProv) e.ewProv = 'Select a provider.';
        if (!d.ewName.trim()) e.ewName = 'Account name is required.';
        if (!/^09\d{9}$/.test(d.ewNo.replace(/[\s-]/g, ''))) e.ewNo = 'Enter an 11-digit mobile number starting with 09.';
    }
    return e;
};

const HIST = [
    { d: 'Oct 2, 2026', ref: 'PO-2026-0931', to: 'BDO Unibank ••7890', st: 'processing', amt: 18420.5 },
    { d: 'Sep 25, 2026', ref: 'PO-2026-0902', to: 'BDO Unibank ••7890', st: 'paid', amt: 24310 },
    { d: 'Sep 18, 2026', ref: 'PO-2026-0874', to: 'BDO Unibank ••7890', st: 'paid', amt: 21875.25 },
    { d: 'Sep 11, 2026', ref: 'PO-2026-0841', to: 'BDO Unibank ••7890', st: 'failed', amt: 19240 },
    { d: 'Sep 4, 2026', ref: 'PO-2026-0809', to: 'BDO Unibank ••7890', st: 'paid', amt: 17960.75 },
    { d: 'Aug 28, 2026', ref: 'PO-2026-0776', to: 'BDO Unibank ••7890', st: 'paid', amt: 22105 },
] as const;
const ST_TONE: Record<string, Tone> = { paid: 'ok', processing: 'info', failed: 'bad' };
const ST_LABEL: Record<string, string> = { paid: 'Paid', processing: 'Processing', failed: 'Failed' };
const TH = `text-left text-[0.68rem] font-semibold uppercase tracking-wide text-[#6E6570] px-3 py-2.5 border-b ${BORDER} whitespace-nowrap`;

function PayoutSection() {
    const edit = useEdit<PayoutData>(payoutInitial, validatePayout);
    const { v, editing, errors, set, saved } = edit;
    const [tab, setTab] = useState<'bank' | 'ewallet'>(saved.method);
    const [filter, setFilter] = useState('all');

    useEffect(() => { if (!editing) setTab(saved.method); }, [editing, saved.method]);

    const pick = (m: 'bank' | 'ewallet') => { setTab(m); if (editing) set('method', m); };
    const ewLinked = !!saved.ewNo;
    const show = (real: string) => (editing ? real : maskNo(real.replace(/\s/g, '')));

    const rows = HIST.filter((r) => filter === 'all' || r.st === filter);
    const paid = HIST.filter((r) => r.st === 'paid').reduce((s, r) => s + r.amt, 0);
    const pending = HIST.filter((r) => r.st === 'processing').reduce((s, r) => s + r.amt, 0);

    return (
        <EditShell icon={Wallet} title="Payout Information" desc="Choose where your earnings are sent." edit={edit} saveMsg="Your payout details will be updated. Future payouts will be sent to this account.">
            <div className={`inline-flex gap-1 p-1 ${LAV50} border-[1.5px] ${BORDER} rounded-xl mb-4`} role="tablist" aria-label="Payout method">
                {([['bank', 'Bank account'], ['ewallet', 'E-wallet']] as const).map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => pick(k)} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg ${tab === k ? 'bg-[#4B2E7E] text-white' : 'text-[#6E6570]'}`}>
                        {l}
                        {saved.method === k && <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded-full ${tab === k ? 'bg-white/25 text-white' : `${LAV100} text-[#4B2E7E]`}`}>In use</span>}
                    </button>
                ))}
            </div>

            {tab === 'bank' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Bank name" htmlFor="am-bankName" error={errors.bankName}>
                        <select id="am-bankName" disabled={!editing} value={v.bankName} onChange={(e) => set('bankName', e.target.value)} className={inputCls(errors.bankName)}>
                            <option value="">Select a bank</option>
                            {['BDO Unibank', 'BPI', 'Metrobank', 'UnionBank', 'Landbank', 'Security Bank', 'PNB', 'RCBC'].map((b) => <option key={b}>{b}</option>)}
                        </select>
                    </Field>
                    <Field label="Account name" htmlFor="am-bankAcctName" error={errors.bankAcctName}>
                        <input id="am-bankAcctName" disabled={!editing} value={v.bankAcctName} onChange={(e) => set('bankAcctName', e.target.value)} className={inputCls(errors.bankAcctName)} />
                    </Field>
                    <Field label="Account number" htmlFor="am-bankNo" error={errors.bankNo} hint="Account name must match the name on your verified ID." className="sm:col-span-2">
                        <input id="am-bankNo" inputMode="numeric" disabled={!editing} value={show(v.bankNo)} onChange={(e) => set('bankNo', e.target.value.replace(/[^\d\s]/g, ''))} className={inputCls(errors.bankNo)} />
                    </Field>
                </div>
            )}

            {tab === 'ewallet' && !editing && !ewLinked && (
                <div className={`p-4 border-[1.5px] border-dashed ${BORDER} ${LAV50} rounded-xl text-sm text-[#6E6570]`}>
                    No e-wallet linked yet. Select <b>Edit</b> to add your GCash or Maya account.
                </div>
            )}
            {tab === 'ewallet' && (editing || ewLinked) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="E-wallet provider" htmlFor="am-ewProv" error={errors.ewProv}>
                        <select id="am-ewProv" disabled={!editing} value={v.ewProv} onChange={(e) => set('ewProv', e.target.value)} className={inputCls(errors.ewProv)}>
                            <option value="">Select a provider</option><option>GCash</option><option>Maya</option>
                        </select>
                    </Field>
                    <Field label="Account name" htmlFor="am-ewName" error={errors.ewName}>
                        <input id="am-ewName" disabled={!editing} value={v.ewName} onChange={(e) => set('ewName', e.target.value)} className={inputCls(errors.ewName)} />
                    </Field>
                    <Field label="Mobile number" htmlFor="am-ewNo" error={errors.ewNo} hint="Use the mobile number registered to your GCash or Maya account." className="sm:col-span-2">
                        <input id="am-ewNo" type="tel" inputMode="numeric" placeholder="09XX XXX XXXX" disabled={!editing} value={show(v.ewNo)} onChange={(e) => set('ewNo', e.target.value.replace(/[^\d\s]/g, '').slice(0, 13))} className={inputCls(errors.ewNo)} />
                    </Field>
                </div>
            )}

            <Divider />
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h3 className="text-sm font-semibold" style={fontSyne}>Payout history</h3>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter payouts" className={`${inputCls()} !w-auto !py-1.5 !text-xs`}>
                    <option value="all">All statuses</option><option value="paid">Paid</option><option value="processing">Processing</option><option value="failed">Failed</option>
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[['Total paid out', peso(paid)], ['Processing', peso(pending)], ['Payouts', String(HIST.length)]].map(([l, val]) => (
                    <div key={l} className={`border-[1.5px] ${BORDER} rounded-xl px-4 py-3`}>
                        <small className="block text-[0.68rem] font-bold uppercase tracking-wide text-[#6E6570]">{l}</small>
                        <b className="text-lg">{val}</b>
                    </div>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                    <thead><tr><th className={TH}>Date</th><th className={TH}>Reference</th><th className={TH}>Sent to</th><th className={TH}>Status</th><th className={`${TH} text-right`}>Amount</th></tr></thead>
                    <tbody>
                        {rows.length ? rows.map((r) => (
                            <tr key={r.ref}>
                                {[r.d, r.ref, r.to].map((c, i) => <td key={i} className="px-3 py-3 text-sm border-b border-[color-mix(in_srgb,#B9A6DE_24%,white)]">{c}</td>)}
                                <td className="px-3 py-3 border-b border-[color-mix(in_srgb,#B9A6DE_24%,white)]"><Pill tone={ST_TONE[r.st]}>{ST_LABEL[r.st]}</Pill></td>
                                <td className="px-3 py-3 text-sm text-right font-bold border-b border-[color-mix(in_srgb,#B9A6DE_24%,white)]">{peso(r.amt)}</td>
                            </tr>
                        )) : <tr><td colSpan={5} className="text-center text-sm text-[#6E6570] py-8">No payouts match this filter.</td></tr>}
                    </tbody>
                </table>
            </div>
        </EditShell>
    );
}

/* ===================== 5. STORE POLICIES ===================== */
interface PolicyData { retWin: string; procTime: string; retPol: string; ship: 'free' | 'flat' | 'buyer' | 'threshold'; shipAmt: string }
const policyInitial: PolicyData = {
    retWin: '7', procTime: '1', ship: 'flat', shipAmt: '50',
    retPol: 'Returns are accepted for damaged, defective, or wrong items. Please send photos or a short video of the item within the return window. Refunds are issued to the original payment method once the returned item is received and checked. Opened skincare products are not returnable unless damaged on arrival.',
};
const validatePolicy = (d: PolicyData): Errs => {
    const e: Errs = {};
    if (!d.retPol.trim()) e.retPol = 'Please enter your return and refund policy.';
    if ((d.ship === 'flat' || d.ship === 'threshold') && !(parseFloat(d.shipAmt) >= 0)) e.shipAmt = 'Enter an amount of 0 or more.';
    return e;
};
const SHIP_OPTS: { v: PolicyData['ship']; t: string; s: string }[] = [
    { v: 'free', t: 'Free shipping', s: 'You cover the courier fee on every order.' },
    { v: 'flat', t: 'Flat rate', s: 'Charge one fixed fee per order.' },
    { v: 'buyer', t: 'Courier rate', s: 'Buyer pays the actual courier fee.' },
    { v: 'threshold', t: 'Free over a minimum spend', s: 'Free shipping once the order reaches an amount.' },
];

function PoliciesSection() {
    const edit = useEdit<PolicyData>(policyInitial, validatePolicy);
    const { v, editing, errors, set } = edit;
    return (
        <EditShell icon={FileText} title="Store Policies" desc="Set clear expectations for returns, shipping, and order processing." edit={edit} saveMsg="Your return, shipping, and processing settings will be updated on your store page and listings.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Return window" htmlFor="am-retWin">
                    <select id="am-retWin" disabled={!editing} value={v.retWin} onChange={(e) => set('retWin', e.target.value)} className={inputCls()}>
                        <option value="0">No returns</option><option value="3">3 days after delivery</option><option value="7">7 days after delivery</option><option value="14">14 days after delivery</option><option value="30">30 days after delivery</option>
                    </select>
                </Field>
                <Field label="Processing time" htmlFor="am-procTime" hint="How long you need to pack and hand over an order.">
                    <select id="am-procTime" disabled={!editing} value={v.procTime} onChange={(e) => set('procTime', e.target.value)} className={inputCls()}>
                        <option value="0">Same day</option><option value="1">1 business day</option><option value="2">2 business days</option><option value="3">3 business days</option><option value="5">5 business days</option>
                    </select>
                </Field>
                <Field label="Return / refund policy" htmlFor="am-retPol" error={errors.retPol} className="sm:col-span-2">
                    <textarea id="am-retPol" rows={5} maxLength={800} disabled={!editing} value={v.retPol} onChange={(e) => set('retPol', e.target.value)} className={`${inputCls(errors.retPol)} resize-none`} />
                    {editing && <span className="text-xs text-[#6E6570] text-right">{v.retPol.length}/800</span>}
                </Field>
            </div>

            <Divider />
            <SubHead>Shipping fee setting</SubHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Shipping fee setting">
                {SHIP_OPTS.map((o) => (
                    <label key={o.v} className={`flex gap-3 items-start p-3.5 border-[1.5px] rounded-xl ${editing ? 'cursor-pointer' : 'pointer-events-none'} ${v.ship === o.v ? `border-[#4B2E7E] ${LAV50}` : `${BORDER} ${editing ? 'hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)]' : 'opacity-50'}`}`}>
                        <input type="radio" name="am-ship" disabled={!editing} checked={v.ship === o.v} onChange={() => { set('ship', o.v); if (o.v === 'flat') set('shipAmt', '50'); if (o.v === 'threshold') set('shipAmt', '999'); }} className="mt-1 accent-[#4B2E7E]" />
                        <div><b className="block text-sm">{o.t}</b><span className="text-xs text-[#6E6570]">{o.s}</span></div>
                    </label>
                ))}
            </div>
            {(v.ship === 'flat' || v.ship === 'threshold') && (
                <Field label={v.ship === 'flat' ? 'Flat shipping fee' : 'Minimum spend for free shipping'} htmlFor="am-shipAmt" error={errors.shipAmt} className="max-w-[260px] mt-4">
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6E6570]">₱</span>
                        <input id="am-shipAmt" type="number" min="0" step="1" disabled={!editing} value={v.shipAmt} onChange={(e) => set('shipAmt', e.target.value)} className={`${inputCls(errors.shipAmt)} !pl-8`} />
                    </div>
                </Field>
            )}
        </EditShell>
    );
}

/* ===================== 6. NOTIFICATIONS (auto-save) ===================== */
function NotificationsSection() {
    const toast = useContext(ToastCtx);
    const [items, setItems] = useState([
        { k: 'orders', t: 'New order alerts', s: 'Get notified when a buyer places an order.', on: true },
        { k: 'msgs', t: 'Message notifications', s: 'Know when buyers or admin support send you a message.', on: true },
        { k: 'stock', t: 'Low stock alerts', s: 'Be warned when a product falls below its reorder point.', on: true },
        { k: 'news', t: 'Platform announcements', s: 'Updates, policy changes, and campaigns from Mimoo.', on: false },
    ]);
    return (
        <Card icon={Bell} title="Notifications" desc="Choose which alerts you want to receive. Changes save automatically.">
            {items.map((n) => (
                <ToggleRow key={n.k} title={n.t} desc={n.s} checked={n.on} onChange={(on) => {
                    setItems((l) => l.map((x) => (x.k === n.k ? { ...x, on } : x)));
                    toast(`${n.t} turned ${on ? 'on' : 'off'}.`);
                }} />
            ))}
        </Card>
    );
}

/* ===================== 7. MESSAGE SETTINGS ===================== */
interface MsgData { inquiries: boolean; orders: boolean; admin: boolean; arOn: boolean; arMsg: string }
interface QR { id: number; name: string; text: string }
const QR_MAX = 10;

function MessagesSection({ storeName }: { storeName: string }) {
    const toast = useContext(ToastCtx);
    const edit = useEdit<MsgData>(
        {
            inquiries: true, orders: true, admin: true, arOn: false,
            arMsg: `Hi! Thanks for messaging ${storeName}. We have received your message and will reply within 24 hours. For urgent order concerns, please include your order number.`,
        },
        (d) => (d.arOn && !d.arMsg.trim() ? { arMsg: 'Enter an auto-reply message or turn auto-reply off.' } : {}),
    );
    const { v, editing, errors, set } = edit;

    const [qrs, setQrs] = useState<QR[]>([
        { id: 1, name: 'Order shipped', text: 'Good news! Your order has been shipped. You can track it from your order page. Thank you for shopping with us.' },
        { id: 2, name: 'Back in stock', text: 'Thanks for asking! This item is available again. You can place your order anytime and we will pack it right away.' },
        { id: 3, name: 'Return instructions', text: 'Sorry about the issue. Please send a photo or short video of the item and your order number, and we will guide you through the return.' },
        { id: 4, name: 'Thank you', text: 'Thank you for your order! If you enjoy your purchase, we would really appreciate a review.' },
    ]);
    const [qrForm, setQrForm] = useState<null | { id: number | null; name: string; text: string }>(null);
    const [qrErr, setQrErr] = useState<Errs>({});
    const [qrDel, setQrDel] = useState<QR | null>(null);
    const seq = useRef(5);

    const saveQr = () => {
        if (!qrForm) return;
        const e: Errs = {};
        if (!qrForm.name.trim()) e.name = 'Enter a template name.';
        if (!qrForm.text.trim()) e.text = 'Enter the message.';
        setQrErr(e);
        if (Object.values(e).some(Boolean)) return;
        if (qrForm.id) setQrs((l) => l.map((q) => (q.id === qrForm.id ? { ...q, name: qrForm.name.trim(), text: qrForm.text.trim() } : q)));
        else setQrs((l) => [...l, { id: seq.current++, name: qrForm.name.trim(), text: qrForm.text.trim() }]);
        toast(qrForm.id ? 'Quick reply updated.' : 'Quick reply added.');
        setQrForm(null);
    };

    return (
        <>
            <EditShell icon={MessageSquare} title="Message Settings" desc="Control message alerts, auto-replies, and saved responses for your inbox." edit={edit} saveMsg="Your message notification preferences and auto-reply will be updated.">
                <SubHead>Message notifications</SubHead>
                <ToggleRow title="New buyer inquiries" desc="Get notified when a buyer sends a question about your products." checked={v.inquiries} disabled={!editing} onChange={(x) => set('inquiries', x)} />
                <ToggleRow title="Order-related messages" desc="Messages from buyers about their orders, such as shipping, returns, and cancellations." checked={v.orders} disabled={!editing} onChange={(x) => set('orders', x)} />
                <ToggleRow title="Admin and compliance messages" desc="Notices from Mimoo about verification, policy updates, and your account standing." checked={v.admin} disabled={!editing} onChange={(x) => set('admin', x)} />

                <Divider />
                <SubHead>Auto-reply</SubHead>
                <ToggleRow title="Enable auto-reply" desc="Automatically respond to new buyer messages while you are away or busy." checked={v.arOn} disabled={!editing} onChange={(x) => set('arOn', x)} />
                <Field label="Auto-reply message" htmlFor="am-arMsg" error={errors.arMsg} hint={v.arOn ? 'Sent once to each new buyer conversation.' : 'Auto-reply is off. This message is saved but not sent.'} className="mt-4">
                    <textarea id="am-arMsg" rows={3} maxLength={300} disabled={!editing} value={v.arMsg} onChange={(e) => set('arMsg', e.target.value)} className={`${inputCls(errors.arMsg)} resize-none ${!v.arOn ? 'opacity-70' : ''}`} />
                    {editing && <span className="text-xs text-[#6E6570] text-right">{v.arMsg.length}/300</span>}
                </Field>
            </EditShell>

            <Card icon={MessageSquare} title="Quick replies" desc={`${qrs.length} of ${QR_MAX} templates. Insert them in one click from your inbox.`}
                right={<button type="button" disabled={qrs.length >= QR_MAX} onClick={() => { setQrErr({}); setQrForm({ id: null, name: '', text: '' }); }} className={`${btnOutline} ${btnSm}`}><Plus className="w-3.5 h-3.5" />Add template</button>}>
                {qrs.length ? qrs.map((t) => (
                    <div key={t.id} className={`flex items-start gap-4 p-4 border-[1.5px] ${BORDER} rounded-xl mb-2.5 last:mb-0`}>
                        <div className="flex-1 min-w-0"><b className="block text-sm mb-1">{t.name}</b><span className="block text-xs text-[#6E6570] leading-relaxed line-clamp-2">{t.text}</span></div>
                        <div className="flex gap-1 shrink-0">
                            <button type="button" aria-label={`Edit ${t.name}`} onClick={() => { setQrErr({}); setQrForm({ id: t.id, name: t.name, text: t.text }); }} className={`w-8 h-8 rounded-lg text-[#6E6570] hover:text-[#4B2E7E] ${LAV100_HOVER} flex items-center justify-center`}><Pencil className="w-4 h-4" /></button>
                            <button type="button" aria-label={`Delete ${t.name}`} onClick={() => setQrDel(t)} className="w-8 h-8 rounded-lg text-[#6E6570] hover:text-[#b3384f] hover:bg-[#fbeced] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                )) : <div className={`text-center text-sm text-[#6E6570] py-6 border-[1.5px] border-dashed ${BORDER} rounded-xl`}>No quick replies yet. Add a template to answer common questions faster.</div>}
            </Card>

            {qrForm && (
                <SubModal onClose={() => setQrForm(null)} wide>
                    <MTitle>{qrForm.id ? 'Edit quick reply' : 'Add quick reply'}</MTitle>
                    <MSub>Save a response you send often so you can insert it in one click from your inbox.</MSub>
                    <div className="flex flex-col gap-4">
                        <Field label="Template name" htmlFor="am-qrName" error={qrErr.name}>
                            <input id="am-qrName" autoFocus maxLength={40} value={qrForm.name} onChange={(e) => setQrForm({ ...qrForm, name: e.target.value })} placeholder="e.g. Shipping update" className={inputCls(qrErr.name)} />
                        </Field>
                        <Field label="Message" htmlFor="am-qrText" error={qrErr.text}>
                            <textarea id="am-qrText" rows={4} maxLength={300} value={qrForm.text} onChange={(e) => setQrForm({ ...qrForm, text: e.target.value })} placeholder="Write the message buyers will receive" className={`${inputCls(qrErr.text)} resize-none`} />
                            <span className="text-xs text-[#6E6570] text-right">{qrForm.text.length}/300</span>
                        </Field>
                    </div>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={() => setQrForm(null)}>Cancel</button>
                        <button type="button" className={btnPrimary} onClick={saveQr}>{qrForm.id ? 'Save template' : 'Add template'}</button>
                    </MActions>
                </SubModal>
            )}
            {qrDel && (
                <SubModal onClose={() => setQrDel(null)}>
                    <MTitle>Delete this quick reply?</MTitle>
                    <MSub><b className="text-[#2A1B4D]">{qrDel.name}</b> will be removed from your saved templates. This cannot be undone.</MSub>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={() => setQrDel(null)}>Cancel</button>
                        <button type="button" className={btnDanger} onClick={() => { setQrs((l) => l.filter((q) => q.id !== qrDel.id)); setQrDel(null); toast('Quick reply deleted.'); }}>Delete template</button>
                    </MActions>
                </SubModal>
            )}
        </>
    );
}

/* ===================== 8. HELP CENTER ===================== */
const TOPICS = ['Getting started', 'Verification', 'Payouts', 'Store policies', 'Messages', 'Account'];
const FAQ = [
    { t: 'Getting started', q: 'How do I update my store logo and details?', a: 'Open Store Profile under My Store and select Edit. You can change your store name, logo, description, category, and pickup address. Your changes appear on your store page after you confirm and save.' },
    { t: 'Verification', q: 'How do I verify my business?', a: 'Open Business Verification under My Store, upload your business permit and a valid government ID (JPG, PNG, or PDF, up to 5 MB each), then submit. Reviews usually take 1 to 3 business days, and you will be notified once it is complete.' },
    { t: 'Verification', q: 'Why was my verification rejected?', a: 'The reason is shown on the Business Verification card. Common causes are blurry or cropped images and expired documents. Upload clear, full-page copies and submit again. Only Mimoo admin can change your verification status.' },
    { t: 'Payouts', q: 'How do I set up where I get paid?', a: 'Go to Payout Information, select Edit, and choose a bank account or an e-wallet. The account name must match the name on your verified ID. Your account number is masked after you save.' },
    { t: 'Payouts', q: 'Why does my payout show Processing or Failed?', a: 'Processing means the payout is being sent to your saved account. If a payout shows Failed, check that your bank or e-wallet details are correct, update them in Payout Information, and contact support from this page if it keeps happening.' },
    { t: 'Store policies', q: 'How do I change shipping fees or processing time?', a: 'Open Store Policies and select Edit. Choose free shipping, a flat rate, the courier rate, or free shipping over a minimum spend, then set your processing time and save. Your return and refund policy is edited in the same card.' },
    { t: 'Messages', q: 'How do I set up auto-reply and quick replies?', a: 'In Message Settings, turn on auto-reply, write your message, and save. Quick replies are saved templates. You can add, edit, or delete them at any time and use them when you answer buyers from your inbox.' },
    { t: 'Account', q: 'How do I change my email or mobile number?', a: 'In Account Security, under Verified contact details, choose Change email or Change number. We send a 6-digit code to the new email or number, and it is updated once you enter the code.' },
    { t: 'Account', q: 'What is the difference between deactivating and deleting?', a: 'Deactivating hides your store and products from buyers and can be undone any time by reactivating. Pending orders must still be fulfilled. Deleting permanently removes your store, products, order history, and payout records, and it cannot be undone.' },
];

function HelpSection() {
    const toast = useContext(ToastCtx);
    const [q, setQ] = useState('');
    const [topic, setTopic] = useState('All');
    const [contact, setContact] = useState(false);
    const [f, setF] = useState({ topic: TOPICS[0], sub: '', msg: '' });
    const [errs, setErrs] = useState<Errs>({});
    const needle = q.trim().toLowerCase();
    const rows = FAQ.filter((x) => (topic === 'All' || x.t === topic) && (!needle || `${x.q} ${x.a} ${x.t}`.toLowerCase().includes(needle)));

    const send = () => {
        const e: Errs = {};
        if (!f.sub.trim()) e.sub = 'Enter a subject.';
        if (f.msg.trim().length < 10) e.msg = 'Please add at least 10 characters.';
        setErrs(e);
        if (Object.values(e).some(Boolean)) return;
        setContact(false);
        setF({ topic: TOPICS[0], sub: '', msg: '' });
        toast('Support request sent. Replies will appear in your inbox.');
    };

    return (
        <Card icon={HelpCircle} title="Help Center" desc="Find answers, guides, and ways to reach Mimoo seller support.">
            <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6570]" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search help articles" aria-label="Search help articles" className={`${inputCls()} !rounded-full !pl-10`} />
            </div>
            <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Help topics">
                {['All', ...TOPICS].map((t) => (
                    <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={`text-xs font-bold px-3.5 py-1.5 rounded-full border-[1.5px] ${topic === t ? 'bg-[#4B2E7E] border-[#4B2E7E] text-white' : `bg-white ${BORDER} text-[#6E6570] hover:bg-[color-mix(in_srgb,#B9A6DE_12%,white)]`}`}>{t}</button>
                ))}
            </div>
            <p className="text-xs text-[#6E6570] mb-3" aria-live="polite">{rows.length} article{rows.length === 1 ? '' : 's'}</p>
            {rows.length ? rows.map((x) => (
                <details key={x.q} className={`group border-[1.5px] ${BORDER} rounded-xl mb-2.5 bg-white open:bg-[color-mix(in_srgb,#B9A6DE_12%,white)] open:border-[#B9A6DE]`}>
                    <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
                        <span>{x.q}</span>
                        <span className={`ml-auto shrink-0 text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${LAV100} text-[#4B2E7E]`}>{x.t}</span>
                        <span className={`shrink-0 w-[22px] h-[22px] rounded-full ${LAV100} text-[#4B2E7E] flex items-center justify-center font-bold group-open:hidden`}>+</span>
                        <span className={`shrink-0 w-[22px] h-[22px] rounded-full ${LAV100} text-[#4B2E7E] hidden items-center justify-center font-bold group-open:flex`}>–</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-[#6E6570] leading-relaxed">{x.a}</div>
                </details>
            )) : <div className={`text-center text-sm text-[#6E6570] py-6 border-[1.5px] border-dashed ${BORDER} rounded-xl`}>No articles match your search. Try different words, or contact support below.</div>}

            <div className={`flex items-center justify-between gap-4 flex-wrap mt-5 p-4 rounded-xl ${LAV50} border-[1.5px] ${BORDER}`}>
                <div><b className="block text-sm">Still need help?</b><span className="block text-xs text-[#6E6570] mt-0.5 max-w-md">Send a request to Mimoo seller support. Replies appear in your inbox under admin support.</span></div>
                <button type="button" className={btnPrimary} onClick={() => { setErrs({}); setContact(true); }}><MessageSquare className="w-4 h-4" />Contact support</button>
            </div>

            {contact && (
                <SubModal onClose={() => setContact(false)} wide>
                    <MTitle>Contact support</MTitle>
                    <MSub>Tell us what you need help with. Replies appear in your inbox under admin support.</MSub>
                    <div className="flex flex-col gap-4">
                        <Field label="Topic" htmlFor="am-hcTopic">
                            <select id="am-hcTopic" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} className={inputCls()}>{[...TOPICS, 'Other'].map((t) => <option key={t}>{t}</option>)}</select>
                        </Field>
                        <Field label="Subject" htmlFor="am-hcSub" error={errs.sub}>
                            <input id="am-hcSub" autoFocus maxLength={80} value={f.sub} onChange={(e) => setF({ ...f, sub: e.target.value })} placeholder="Short summary of your issue" className={inputCls(errs.sub)} />
                        </Field>
                        <Field label="Details" htmlFor="am-hcMsg" error={errs.msg}>
                            <textarea id="am-hcMsg" rows={4} maxLength={600} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} placeholder="Describe the issue and include any order numbers" className={`${inputCls(errs.msg)} resize-none`} />
                            <span className="text-xs text-[#6E6570] text-right">{f.msg.length}/600</span>
                        </Field>
                    </div>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={() => setContact(false)}>Cancel</button>
                        <button type="button" className={btnPrimary} onClick={send}>Send request</button>
                    </MActions>
                </SubModal>
            )}
        </Card>
    );
}

/* ===================== 9. ACCOUNT ACTIONS ===================== */
function ActionRow({ title, desc, btn, onClick, danger }: { title: string; desc: string; btn: string; onClick: () => void; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-6 flex-wrap py-5 border-b last:border-b-0 border-[color-mix(in_srgb,#B9A6DE_24%,white)]">
            <div className="flex-1 min-w-[240px] max-w-xl">
                <b className={`block text-sm mb-1 ${danger ? 'text-[#b3384f]' : ''}`}>{title}</b>
                <span className={`block text-sm leading-relaxed ${danger ? 'text-[#b3384f]' : 'text-[#6E6570]'}`}>{desc}</span>
            </div>
            <button type="button" onClick={onClick} className={`${danger ? `${btnBase} bg-white border-[1.5px] border-[#b3384f] text-[#b3384f] hover:bg-[#fbeced]` : btnOutline} min-w-[120px]`}>{btn}</button>
        </div>
    );
}

function ActionsSection({ deactivated, setDeactivated }: { deactivated: boolean; setDeactivated: (v: boolean) => void }) {
    const toast = useContext(ToastCtx);
    const [dialog, setDialog] = useState<null | 'logout' | 'deactivate' | 'delete'>(null);
    const [chk, setChk] = useState(false);
    const [typed, setTyped] = useState('');
    const close = () => { setDialog(null); setChk(false); setTyped(''); };

    return (
        <Card icon={UserCog} title="Account Actions" desc="Sign out or change the status of your store.">
            <ActionRow title="Log out" desc="Sign out of this device." btn="Log Out" onClick={() => setDialog('logout')} />
            {deactivated
                ? <ActionRow title="Store deactivated" desc="Your store and products are hidden from buyers. Reactivate any time to start selling again." btn="Reactivate" onClick={() => { setDeactivated(false); toast('Store reactivated. Your listings are visible again.'); }} />
                : <ActionRow title="Deactivate store" desc="Hides your store and products from buyers. Pending orders must still be fulfilled. You can reactivate any time." btn="Deactivate" onClick={() => setDialog('deactivate')} />}
            <ActionRow danger title="Delete account" desc="This permanently deletes your store, products, order history, and payout records. It cannot be undone. Any unpaid balance must be withdrawn first." btn="Delete Account" onClick={() => setDialog('delete')} />

            {dialog === 'logout' && (
                <SubModal onClose={close}>
                    <MTitle>Log out?</MTitle>
                    <MSub>You will be signed out of Mimoo Seller on this device.</MSub>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={close}>Stay signed in</button>
                        <button type="button" className={btnPrimary} onClick={() => router.post('/logout')}>Log out</button>
                    </MActions>
                </SubModal>
            )}
            {dialog === 'deactivate' && (
                <SubModal onClose={close}>
                    <MTitle>Deactivate your store?</MTitle>
                    <MSub>Buyers will no longer see your store or products while it is deactivated. Pending orders still need to be shipped, and you can reactivate at any time.</MSub>
                    <label className="flex gap-2.5 items-start text-sm leading-snug cursor-pointer">
                        <input type="checkbox" checked={chk} onChange={(e) => setChk(e.target.checked)} className="mt-0.5 accent-[#4B2E7E]" />
                        I understand my listings will be hidden until I reactivate.
                    </label>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={close}>Cancel</button>
                        <button type="button" className={btnWarn} disabled={!chk} onClick={() => { setDeactivated(true); close(); toast('Store deactivated.'); }}>Deactivate store</button>
                    </MActions>
                </SubModal>
            )}
            {dialog === 'delete' && (
                <SubModal onClose={close}>
                    <MTitle danger>Delete your account permanently?</MTitle>
                    <MSub>This cannot be undone. Your store, listings, reviews, and order history will be erased, and any pending payout you have not withdrawn will be forfeited.</MSub>
                    <Field label="Type DELETE to confirm" htmlFor="am-delIn">
                        <input id="am-delIn" autoFocus autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} className={inputCls()} />
                    </Field>
                    <MActions>
                        <button type="button" className={btnGhost} onClick={close}>Keep my account</button>
                        <button type="button" className={btnDanger} disabled={typed.trim() !== 'DELETE'} onClick={() => { close(); toast('Account deletion requested. We will email you to confirm.'); }}>Delete account</button>
                    </MActions>
                </SubModal>
            )}
        </Card>
    );
}

/* ===================== ROOT (standalone page) ===================== */
type SectionId = 'profile' | 'verification' | 'security' | 'payout' | 'policies' | 'notifications' | 'messages' | 'help' | 'actions';
const NAV: { group: string; items: { id: SectionId; label: string; icon: LucideIcon }[] }[] = [
    { group: 'My store', items: [
        { id: 'profile', label: 'Store Profile', icon: Store },
        { id: 'verification', label: 'Business Verification', icon: ShieldCheck },
        { id: 'security', label: 'Account Security', icon: Lock },
        { id: 'payout', label: 'Payout Information', icon: Wallet },
        { id: 'policies', label: 'Store Policies', icon: FileText },
    ] },
    { group: 'Preferences', items: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'messages', label: 'Message Settings', icon: MessageSquare },
    ] },
    { group: 'Support', items: [{ id: 'help', label: 'Help Center', icon: HelpCircle }] },
    { group: 'Account', items: [{ id: 'actions', label: 'Account Actions', icon: UserCog }] },
];
const ALL_ITEMS = NAV.flatMap((g) => g.items);
const isSection = (s: string | null): s is SectionId => ALL_ITEMS.some((i) => i.id === s);

// Defined OUTSIDE the page component so it isn't re-created (and remounted) on every render.
// Inactive panels stay mounted but hidden, so unsaved edits are kept when switching sections.
function Panel({ active, children }: { active: boolean; children: ReactNode }) {
    return <div className={active ? '' : 'hidden'}>{children}</div>;
}

export default function SellerAccountManagementPage({ auth, seller }: SellerAccountProps) {
    const [section, setSection] = useState<SectionId>(() => {
        if (typeof window === 'undefined') return 'profile';
        const s = new URLSearchParams(window.location.search).get('section');
        return isSection(s) ? s : 'profile';
    });
    const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Use actual user data from backend
    const [contact, setContact] = useState({ 
        email: auth.user.email, 
        phone: seller?.phone || '' 
    });
    const [deactivated, setDeactivated] = useState(false);
    
    // Initialize profile with actual seller data
    const profileInitial: ProfileData = {
        storeName: seller?.store_name || auth.user.name || 'My Store',
        storeDesc: seller?.store_description || '',
        storeCat: seller?.store_category || 'Health and Beauty',
        pickPhone: seller?.phone || '',
        addr1: seller?.address_line1 || '',
        brgy: seller?.barangay || '',
        city: seller?.city || '',
        prov: seller?.province || '',
        zip: seller?.postal_code || '',
        logo: seller?.store_logo || '',
    };
    
    // The store (brand) name is the only profile field with a server column; save it
    // to users.business_name so the admin seller list shows the current name.
    const profile = useEdit<ProfileData>(profileInitial, validateProfile, (next, prev) => {
        if (next.storeName.trim() !== prev.storeName.trim()) {
            router.put('/seller/store-name', { store_name: next.storeName.trim() }, { preserveScroll: true, preserveState: true });
        }
    });
    const savedProfile = profile.saved;

    const showToast: Toaster = (msg, bad) => {
        setToast({ msg, bad });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3200);
    };
    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    // keep the active section in the URL (?section=payout) so refresh / sharing works
    const go = (id: SectionId) => {
        setSection(id);
        window.history.replaceState(null, '', `?section=${id}`);
        scrollRef.current?.scrollTo({ top: 0 }); // scroll the content area, not the window
    };

    // warn if leaving the page while the profile form has unsaved edits
    useEffect(() => {
        if (!profile.editing || !profile.dirty) return;
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [profile.editing, profile.dirty]);

    return (
        <ToastCtx.Provider value={showToast}>
            <Head title="Account Management" />
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

            {/* Root is locked to the viewport: only the content area scrolls */}
            <div className="flex flex-col h-screen overflow-hidden bg-[color-mix(in_srgb,#B9A6DE_12%,white)] text-[#2A1B4D]" style={fontPoppins}>
                {/* Main Mimoo Navbar */}
                <header className="shrink-0 bg-[#1E1B2E] text-white px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-[#9B5DE5]" />
                            <span className="text-lg font-extrabold uppercase tracking-widest" style={{ fontFamily: "'Syncopate', ui-sans-serif, system-ui, sans-serif" }}>
                                MIMOO.
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2 w-96">
                            <Search className="w-4 h-4 text-white/60" />
                            <input
                                type="text"
                                placeholder="Search products, orders, customers..."
                                aria-label="Search"
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/60 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button type="button" aria-label="Messages" className="text-white/70 hover:text-white transition">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button type="button" aria-label="Notifications" className="text-white/70 hover:text-white transition">
                            <Bell className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9B5DE5] text-[10px] font-bold">
                                {initials(savedProfile.storeName)}
                            </span>
                            <span className="text-sm font-semibold">My Account</span>
                        </div>
                    </div>
                </header>

                {/* Body: takes the remaining height under the navbar */}
                <div className="flex flex-1 min-h-0">
                    {/* Sidebar: full height of the body, never moves with the content */}
                    <aside className="hidden lg:flex flex-col w-72 shrink-0 h-full bg-white border-r border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                        <nav className="px-4 py-6" aria-label="Account navigation">
                            {NAV.map((g) => (
                                <div key={g.group} className="mb-6">
                                    <p className="px-3 mb-2 text-[0.68rem] font-bold uppercase tracking-wider text-[#6E6570]">{g.group}</p>
                                    {g.items.map((it) => {
                                        const on = section === it.id;
                                        return (
                                            <button key={it.id} type="button" onClick={() => go(it.id)} aria-current={on ? 'page' : undefined}
                                                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold mb-0.5 border-l-2 transition ${
                                                    on ? `${LAV100} text-[#4B2E7E] border-[#4B2E7E]` : 'text-[#6E6570] border-transparent hover:bg-[color-mix(in_srgb,#B9A6DE_24%,white)] hover:text-[#2A1B4D]'
                                                }`}>
                                                <it.icon className="w-4 h-4 shrink-0" />{it.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Content column */}
                    <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                        {/* Mobile section tabs (stay pinned above the scroll area) */}
                        <div className={`lg:hidden shrink-0 flex gap-2 overflow-x-auto px-4 py-3 border-b ${BORDER} bg-white`}>
                            {ALL_ITEMS.map((it) => (
                                <button key={it.id} type="button" onClick={() => go(it.id)} aria-current={section === it.id ? 'page' : undefined} className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full ${section === it.id ? 'bg-[#4B2E7E] text-white' : `${LAV100} text-[#6E6570]`}`}>{it.label}</button>
                            ))}
                        </div>

                        {/* The ONLY scrolling area */}
                        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8">
                            <div className="max-w-3xl mx-auto">
                                <Panel active={section === 'profile'}><ProfileSection edit={profile} /></Panel>
                                <Panel active={section === 'verification'}><VerificationSection /></Panel>
                                <Panel active={section === 'security'}><SecuritySection contact={contact} setContact={setContact} /></Panel>
                                <Panel active={section === 'payout'}><PayoutSection /></Panel>
                                <Panel active={section === 'policies'}><PoliciesSection /></Panel>
                                <Panel active={section === 'notifications'}><NotificationsSection /></Panel>
                                <Panel active={section === 'messages'}><MessagesSection storeName={savedProfile.storeName} /></Panel>
                                <Panel active={section === 'help'}><HelpSection /></Panel>
                                <Panel active={section === 'actions'}><ActionsSection deactivated={deactivated} setDeactivated={setDeactivated} /></Panel>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <div role="status" className={`fixed bottom-6 right-6 z-[150] max-w-[calc(100vw-3rem)] px-5 py-3.5 rounded-lg text-sm font-semibold text-white shadow-lg ${toast.bad ? 'bg-[#b3384f]' : 'bg-[#2A1B4D]'}`}>
                    {toast.msg}
                </div>
            )}
        </ToastCtx.Provider>
    );
}