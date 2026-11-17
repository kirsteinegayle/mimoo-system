import { Head, router } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { confirmDialog } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';

interface Announcement {
    id: number;
    title: string;
    body: string;
    audience: string;
    status: 'draft' | 'published' | 'unpublished';
    published_at: string | null;
    created_at: string | null;
}
interface Policy {
    type: string;
    label: string;
    content: string;
    version: number;
    updated_at: string | null;
    updated_by: string | null;
    public_url: string;
    history: { version: number; by: string; at: string }[];
}
interface Props {
    announcements: Announcement[];
    audiences: string[];
    policies: Policy[];
    keywords: string[];
}

type Tab = 'announcements' | 'policies' | 'keywords';

const AUDIENCE_LABEL: Record<string, string> = { all: 'Everyone', buyers: 'Buyers', sellers: 'Sellers', couriers: 'Couriers', riders: 'Riders' };
const STATUS_STYLE: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-emerald-50 text-emerald-700',
    unpublished: 'bg-amber-50 text-amber-700',
};

const field = (err?: string) => `w-full rounded-lg border px-3 py-2 text-sm ${err ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30`;
const primaryBtn = 'rounded-lg bg-[#3B1F6B] px-5 py-2.5 font-semibold text-white transition hover:bg-[#2E1850] disabled:cursor-not-allowed disabled:opacity-60';
const ghostBtn = 'rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100';

function Err({ m }: { m?: string }) {
    return m ? <p className="mt-1 text-xs text-red-600">{m}</p> : null;
}

export default function PlatformSettings({ announcements, audiences, policies, keywords }: Props) {
    const [tab, setTab] = useState<Tab>('announcements');

    return (
        <>
            <Head title="Platform Settings" />
            <AdminShell active="platform-settings">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Post announcements, update platform policies and manage the prohibited-keywords list used by Seller Compliance.</p>
                </div>

                <div className="mb-5 flex gap-2 border-b border-gray-200">
                    {([['announcements', 'Announcements'], ['policies', 'Platform Policies'], ['keywords', 'Prohibited Keywords']] as const).map(([k, label]) => (
                        <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${tab === k ? 'border-[#3B1F6B] text-[#3B1F6B]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'announcements' && <Announcements items={announcements} audiences={audiences} />}
                {tab === 'policies' && <Policies policies={policies} />}
                {tab === 'keywords' && <Keywords keywords={keywords} />}
            </AdminShell>
        </>
    );
}

// ── Announcements ────────────────────────────────────────────────────────────

function Announcements({ items, audiences }: { items: Announcement[]; audiences: string[] }) {
    const empty = { title: '', body: '', audience: 'all' };
    const [editing, setEditing] = useState<number | null>(null);
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    function save() {
        setBusy(true);
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(editing ? 'Announcement updated.' : 'Announcement saved as a draft.'); setForm(empty); setEditing(null); setErrors({}); },
            onError: (e: Record<string, string>) => setErrors(e),
            onFinish: () => setBusy(false),
        };
        if (editing) router.put(`/admin/platform-settings/announcements/${editing}`, form, opts);
        else router.post('/admin/platform-settings/announcements', form, opts);
    }

    async function act(a: Announcement, what: 'publish' | 'unpublish' | 'delete') {
        if (what === 'publish' && !(await confirmDialog({ title: 'Publish announcement?', message: `It will show on the ${AUDIENCE_LABEL[a.audience].toLowerCase()} dashboards and be sent as a notification.`, confirmLabel: 'Publish' }))) return;
        if (what === 'delete' && !(await confirmDialog({ title: 'Delete announcement?', message: `Delete "${a.title}"? This cannot be undone.`, confirmLabel: 'Delete', tone: 'danger' }))) return;
        const opts = { preserveScroll: true, onError: (e: Record<string, string>) => toast.error(Object.values(e)[0] ?? 'Something went wrong.'), onSuccess: () => toast.success(what === 'publish' ? 'Published.' : what === 'unpublish' ? 'Unpublished.' : 'Deleted.') };
        if (what === 'delete') router.delete(`/admin/platform-settings/announcements/${a.id}`, opts);
        else router.post(`/admin/platform-settings/announcements/${a.id}/${what}`, {}, opts);
    }

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">{editing ? `Edit announcement #${editing}` : 'New announcement'}</h3>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Title *</label>
                        <input className={field(errors.title)} maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        <Err m={errors.title} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Message *</label>
                        <textarea rows={5} className={field(errors.body)} maxLength={2000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                        <Err m={errors.body} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Audience *</label>
                        <select className={field(errors.audience)} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                            {audiences.map((a) => <option key={a} value={a}>{AUDIENCE_LABEL[a] ?? a}</option>)}
                        </select>
                        <Err m={errors.audience} />
                    </div>
                    <div className="flex gap-2">
                        <button className={primaryBtn} disabled={busy} onClick={save}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Save draft'}</button>
                        {editing && <button className={ghostBtn} onClick={() => { setEditing(null); setForm(empty); setErrors({}); }}>Cancel</button>}
                    </div>
                    <Err m={errors.announcement} />
                </div>
            </div>

            <div className="space-y-3 lg:col-span-3">
                {items.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">No announcements yet.</div>}
                {items.map((a) => (
                    <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="font-semibold text-gray-900">{a.title}</div>
                                <div className="mt-0.5 text-xs text-gray-500">To {AUDIENCE_LABEL[a.audience]} · {a.status === 'published' ? `published ${a.published_at}` : `created ${a.created_at}`}</div>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                        </div>
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-gray-600">{a.body}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {a.status !== 'published'
                                ? <button onClick={() => act(a, 'publish')} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Publish</button>
                                : <button onClick={() => act(a, 'unpublish')} className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">Unpublish</button>}
                            <button onClick={() => { setEditing(a.id); setForm({ title: a.title, body: a.body, audience: a.audience }); setErrors({}); }} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                            <button onClick={() => act(a, 'delete')} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Policies (versioned) ─────────────────────────────────────────────────────

function Policies({ policies }: { policies: Policy[] }) {
    const [type, setType] = useState(policies[0]?.type ?? 'terms');
    const current = policies.find((p) => p.type === type)!;
    const [text, setText] = useState<Record<string, string>>(() => Object.fromEntries(policies.map((p) => [p.type, p.content])));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    function save() {
        setBusy(true);
        router.post('/admin/platform-settings/policies', { type, content: text[type] ?? '' }, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`${current.label} saved.`); setErrors({}); },
            onError: (e) => setErrors(e as Record<string, string>),
            onFinish: () => setBusy(false),
        });
    }

    return (
        <div className="grid gap-6 lg:grid-cols-4">
            <div className="space-y-2">
                {policies.map((p) => (
                    <button key={p.type} onClick={() => { setType(p.type); setErrors({}); }} className={`w-full rounded-xl border bg-white p-3 text-left ${type === p.type ? 'border-[#3B1F6B]' : 'border-gray-200'}`}>
                        <div className="text-sm font-semibold text-gray-900">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.version ? `Version ${p.version} · ${p.updated_at}` : 'Not written yet'}</div>
                    </button>
                ))}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-3">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{current.label}</h3>
                    <a href={current.public_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B1F6B] hover:underline">
                        Public page <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
                <textarea rows={16} className={field(errors.content)} value={text[type] ?? ''} onChange={(e) => setText({ ...text, [type]: e.target.value })} placeholder="Write the policy text. Saving creates a new version." />
                <Err m={errors.content || errors.type} />
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{current.version ? `Current: version ${current.version}, updated ${current.updated_at} by ${current.updated_by}` : 'No version saved yet.'}</span>
                    <button className={primaryBtn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save new version'}</button>
                </div>
                {current.history.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                        <div className="mb-1 font-semibold text-gray-600">Version history</div>
                        {current.history.map((h) => <div key={h.version}>v{h.version} · {h.at} · {h.by}</div>)}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Prohibited keywords ──────────────────────────────────────────────────────

function Keywords({ keywords }: { keywords: string[] }) {
    const [text, setText] = useState(keywords.join('\n'));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    function save() {
        setBusy(true);
        router.post('/admin/platform-settings/keywords', { keywords: text }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Prohibited keywords saved.'); setErrors({}); },
            onError: (e) => setErrors(e as Record<string, string>),
            onFinish: () => setBusy(false),
        });
    }

    return (
        <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-700">Prohibited keywords</h3>
            <p className="mb-3 text-sm text-gray-500">One keyword or phrase per line (or comma-separated). Products whose name or description contains one are flagged in Seller Compliance.</p>
            <textarea rows={10} className={field(errors.keywords)} value={text} onChange={(e) => setText(e.target.value)} placeholder={'e.g.\nfirearm\ncounterfeit\nprescription drug'} />
            <Err m={errors.keywords} />
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">{keywords.length} saved</span>
                <button className={primaryBtn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save keywords'}</button>
            </div>
        </div>
    );
}
