import { Head, router } from '@inertiajs/react';
import { FileText, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AdminShell from '@/layouts/admin/admin-shell';

interface Row {
    id: number;
    order_number: string;
    type: string;
    type_label: string;
    status: string;
    buyer: string | null;
    seller: string | null;
    courier: string | null;
    created_at: string | null;
    evidence_count: number;
}
interface Party { id: number; name: string; email: string; phone: string | null }
interface Detail extends Row {
    description: string;
    admin_notes: string | null;
    resolution: string | null;
    resolved_at: string | null;
    order_status: string | null;
    waybill: string | null;
    buyer_party?: never;
    parties?: never;
    evidence: { name: string; is_image: boolean; url: string }[];
}
type FullDetail = Omit<Detail, 'buyer' | 'seller' | 'courier'> & { buyer: Party | null; seller: Party | null; courier: Party | null };

interface Props {
    complaints: Row[];
    filters: { status: string; type: string; q: string };
    counts: Record<string, number>;
    types: { value: string; label: string }[];
    pagination: { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
}

const STATUS_LABEL: Record<string, string> = { open: 'Open', in_review: 'In Review', resolved: 'Resolved', rejected: 'Rejected' };
const STATUS_STYLE: Record<string, string> = {
    open: 'bg-amber-50 text-amber-700',
    in_review: 'bg-sky-50 text-sky-700',
    resolved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-gray-100 text-gray-600',
};
const Badge = ({ status }: { status: string }) => (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status] ?? ''}`}>{STATUS_LABEL[status] ?? status}</span>
);

export default function Complaints({ complaints, filters, counts, types, pagination }: Props) {
    const [f, setF] = useState(filters);
    const [d, setD] = useState<FullDetail | null>(null);
    const [form, setForm] = useState({ status: 'open', admin_notes: '', resolution: '', message: '', notify: ['buyer', 'seller', 'courier'] as string[] });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    const go = (n: typeof f, page = 1) => router.get('/admin/complaints', { ...n, page }, { preserveState: true, preserveScroll: true, replace: true });
    const input = 'h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30';
    const area = (err?: string) => `w-full rounded-lg border px-3 py-2 text-sm ${err ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30`;

    async function open(id: number) {
        try {
            const r = await fetch(`/admin/complaints/${id}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!r.ok) throw new Error();
            const j: FullDetail = await r.json();
            setD(j);
            setErrors({});
            setForm({ status: j.status, admin_notes: j.admin_notes ?? '', resolution: j.resolution ?? '', message: '', notify: ['buyer', 'seller', 'courier'] });
        } catch {
            toast.error('Could not load this complaint.');
        }
    }

    function save() {
        if (!d) return;
        setBusy(true);
        router.post(`/admin/complaints/${d.id}`, form, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`Complaint #${d.id} updated.`); setD(null); },
            onError: (e) => setErrors(e as Record<string, string>),
            onFinish: () => setBusy(false),
        });
    }

    const toggleNotify = (role: string) =>
        setForm((p) => ({ ...p, notify: p.notify.includes(role) ? p.notify.filter((r) => r !== role) : [...p.notify, role] }));

    const party = (label: string, p: Party | null, role: string) =>
        p ? (
            <div className="rounded-lg border border-gray-200 p-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <input type="checkbox" checked={form.notify.includes(role)} onChange={() => toggleNotify(role)} /> notify
                    </label>
                </div>
                <div className="font-semibold text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.email}{p.phone ? ` · ${p.phone}` : ''}</div>
            </div>
        ) : null;

    return (
        <>
            <Head title="Complaints & Disputes" />
            <AdminShell active="complaints">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Complaints &amp; Disputes</h1>
                    <p className="mt-1 text-sm text-gray-500">Review buyer complaints and their evidence, then coordinate with the buyer, seller and courier.</p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Object.keys(STATUS_LABEL).map((s) => (
                        <button key={s} onClick={() => { const n = { ...f, status: f.status === s ? '' : s }; setF(n); go(n); }}
                            className={`rounded-xl border bg-white p-4 text-left ${f.status === s ? 'border-[#3B1F6B]' : 'border-gray-200'}`}>
                            <div className="text-xs font-semibold uppercase text-gray-400">{STATUS_LABEL[s]}</div>
                            <div className="mt-1 text-xl font-bold text-gray-900">{counts[s] ?? 0}</div>
                        </button>
                    ))}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <select className={input} value={f.type} onChange={(e) => { const n = { ...f, type: e.target.value }; setF(n); go(n); }}>
                        <option value="">All types</option>
                        {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <form className="relative" onSubmit={(e) => { e.preventDefault(); go(f); }}>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input className={`${input} w-64 pl-9`} placeholder="Search buyer, seller, order #" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
                    </form>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Parties</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Filed</th><th className="px-4 py-3" /></tr>
                        </thead>
                        <tbody>
                            {complaints.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No complaints found.</td></tr>}
                            {complaints.map((c) => (
                                <tr key={c.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{c.order_number}</td>
                                    <td className="px-4 py-3 text-gray-700">{c.type_label.split(' (')[0]}{c.evidence_count > 0 && <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400"><FileText className="h-3 w-3" />{c.evidence_count}</span>}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        <div>Buyer: <span className="font-medium text-gray-800">{c.buyer ?? '—'}</span></div>
                                        <div>Seller: <span className="font-medium text-gray-800">{c.seller ?? '—'}</span></div>
                                        {c.courier && <div>Courier: <span className="font-medium text-gray-800">{c.courier}</span></div>}
                                    </td>
                                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                                    <td className="px-4 py-3 text-gray-600">{c.created_at}</td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => open(c.id)} className="rounded-md bg-[#3B1F6B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2E1850]">Review</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Showing {pagination.from}–{pagination.to} of {pagination.total}</span>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page <= 1} onClick={() => go(f, pagination.current_page - 1)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
                            <button disabled={pagination.current_page >= pagination.last_page} onClick={() => go(f, pagination.current_page + 1)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}

                {d && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && setD(null)}>
                        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Complaint #{d.id} · {d.order_number}</h3>
                                    <p className="text-sm text-gray-500">{d.type_label} · filed {d.created_at}{d.waybill ? ` · waybill ${d.waybill}` : ''}</p>
                                </div>
                                <Badge status={d.status} />
                            </div>

                            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                                {party('Buyer', d.buyer, 'buyer')}
                                {party('Seller', d.seller, 'seller')}
                                {party('Courier', d.courier, 'courier')}
                            </div>

                            <h4 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-700">Complaint</h4>
                            <p className="mb-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800">{d.description}</p>

                            <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Evidence ({d.evidence.length})</h4>
                            {d.evidence.length === 0 ? (
                                <p className="mb-4 text-sm text-gray-400">The buyer attached no files.</p>
                            ) : (
                                <div className="mb-4 flex flex-wrap gap-3">
                                    {d.evidence.map((e) => (
                                        <a key={e.url} href={e.url} target="_blank" rel="noopener noreferrer" className="block w-32 text-center text-xs text-gray-600">
                                            {e.is_image
                                                ? <img src={e.url} alt={e.name} className="h-24 w-32 rounded-lg border border-gray-200 object-cover" />
                                                : <div className="flex h-24 w-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"><FileText className="h-8 w-8 text-gray-400" /></div>}
                                            <span className="mt-1 block truncate">{e.name}</span>
                                        </a>
                                    ))}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Status</label>
                                    <select className={`${input} w-full`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                    {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Message to the parties (optional)</label>
                                    <input className={`${input} w-full`} maxLength={500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Included in their notification" />
                                    {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Resolution (shown to the parties; required to resolve or reject)</label>
                                    <textarea rows={2} className={area(errors.resolution)} value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} />
                                    {errors.resolution && <p className="mt-1 text-xs text-red-600">{errors.resolution}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-semibold text-gray-600">Internal notes (admin only)</label>
                                    <textarea rows={2} className={area(errors.admin_notes)} value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} />
                                    {errors.admin_notes && <p className="mt-1 text-xs text-red-600">{errors.admin_notes}</p>}
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <button onClick={() => setD(null)} disabled={busy} className="rounded-lg border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">Close</button>
                                <button onClick={save} disabled={busy} className="rounded-lg bg-[#3B1F6B] px-5 py-2.5 font-semibold text-white hover:bg-[#2E1850] disabled:opacity-60">{busy ? 'Saving…' : 'Save & notify'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminShell>
        </>
    );
}
