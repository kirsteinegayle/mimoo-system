import { confirmDialog } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';
import { Head, router } from '@inertiajs/react';
import { Check, Eye, Search, Store, Truck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Accounts Approval: one page for every role that needs admin approval.
 * Filter buttons pick the role (Seller Applications / Logistics); status, search, sort and paging are server side.
 * Reject asks for a reason, which the applicant sees when they try to sign in.
 */
type Type = 'seller' | 'logistics';
type Status = 'pending' | 'approved' | 'disapproved';

interface Row { id: number; name: string; contact: string; email: string; status: Status; status_reason: string | null; created_at: string; approved_at: string | null }
interface Stats { total: number; pending: number; approved: number; disapproved: number }
interface Props {
    type: Type;
    rows: Row[];
    filters: { status: string; sort: string; q: string };
    pagination: { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
    counts: Record<Type, Stats>;
}

const BADGE: Record<Status, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    disapproved: 'border-red-200 bg-red-50 text-red-600',
};

const TYPES: { key: Type; label: string; icon: typeof Store }[] = [
    { key: 'seller', label: 'Seller Applications', icon: Store },
    { key: 'logistics', label: 'Logistics', icon: Truck },
];

export default function AccountsApproval({ type, rows, filters, pagination, counts }: Props) {
    const [search, setSearch] = useState(filters.q);
    const [busy, setBusy] = useState<number | null>(null);
    const [reject, setReject] = useState<Row | null>(null);
    const [reason, setReason] = useState('');
    const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
    const first = useRef(true);

    const go = (next: Partial<{ type: Type; status: string; sort: string; q: string; page: number }>) => {
        const m = { type, status: filters.status, sort: filters.sort, q: search, ...next };
        const params: Record<string, string | number> = { type: m.type };
        if (m.status && m.status !== 'all') params.status = m.status;
        if (m.sort && m.sort !== 'newest') params.sort = m.sort;
        if (m.q) params.q = m.q;
        if (next.page && next.page > 1) params.page = next.page;
        router.get('/admin/accounts-approval', params, { preserveState: true, preserveScroll: true, replace: true });
    };

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        if (search === filters.q) return;
        const t = setTimeout(() => go({ q: search, page: 1 }), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const base = `/admin/${type === 'seller' ? 'seller' : 'logistics'}-approval`;
    const stats = counts[type];

    async function approve(r: Row) {
        if (!(await confirmDialog(`Approve ${r.name}? They will be able to sign in right away.`))) return;
        setBusy(r.id);
        router.post(`${base}/${r.id}/approve`, {}, { preserveScroll: true, onFinish: () => setBusy(null) });
    }

    function submitReject() {
        if (!reject) return;
        setBusy(reject.id);
        router.post(`${base}/${reject.id}/disapprove`, { reason: reason.trim() }, {
            preserveScroll: true,
            onSuccess: () => {
                setReject(null);
                setReason('');
            },
            onFinish: () => setBusy(null),
        });
    }

    async function view(r: Row) {
        const res = await fetch(`${base}/${r.id}/details`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (res.ok) setDetail(await res.json());
    }

    const docs = detail ? Object.entries(detail).filter(([k, v]) => k.endsWith('_url') && v) : [];
    const facts = detail
        ? Object.entries(detail).filter(([k, v]) => !k.endsWith('_url') && v !== null && v !== '' && !['id'].includes(k) && typeof v !== 'object')
        : [];

    return (
        <>
            <Head title="Accounts Approval - Admin" />
            <AdminShell active="accounts-approval">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Accounts Approval</h1>
                    <p className="mt-1 text-sm text-gray-500">Review applications from roles that need admin approval. Buyer accounts need none.</p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {TYPES.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => go({ type: key, status: 'all', q: '', page: 1 })}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${type === key ? 'bg-[#3B1F6B] text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            {counts[key].pending > 0 && <span className={`rounded-full px-2 py-0.5 text-xs ${type === key ? 'bg-white/20' : 'bg-amber-100 text-amber-700'}`}>{counts[key].pending}</span>}
                        </button>
                    ))}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="flex gap-1.5">
                        {(['all', 'pending', 'approved', 'disapproved'] as const).map((s) => (
                            <button key={s} onClick={() => go({ status: s, page: 1 })} className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${filters.status === s ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-600'}`}>
                                {s === 'disapproved' ? 'Rejected' : s} {s !== 'all' && <span className="opacity-60">{stats[s]}</span>}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email…" className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                    </div>
                    <select value={filters.sort} onChange={(e) => go({ sort: e.target.value, page: 1 })} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr><th className="px-4 py-3">{type === 'logistics' ? 'Company' : 'Business / Seller'}</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No applications match.</td></tr>}
                            {rows.map((r) => (
                                <tr key={r.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.contact}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.created_at}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE[r.status] ?? 'border-gray-200 bg-gray-100 text-gray-600'}`}>{r.status === 'disapproved' ? 'rejected' : r.status}</span>
                                        {r.status === 'disapproved' && r.status_reason && <p className="mt-1 max-w-[16rem] text-xs text-gray-500">{r.status_reason}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => view(r)} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> Details</button>
                                            {r.status !== 'approved' && <button disabled={busy === r.id} onClick={() => approve(r)} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Approve</button>}
                                            {r.status !== 'disapproved' && <button disabled={busy === r.id} onClick={() => { setReject(r); setReason(''); }} className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"><X className="h-3.5 w-3.5" /> Reject</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Showing {pagination.from}–{pagination.to} of {pagination.total}</span>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page <= 1} onClick={() => go({ page: pagination.current_page - 1 })} className="rounded-lg border border-gray-200 bg-white px-3 py-1 disabled:opacity-50">Previous</button>
                            <button disabled={pagination.current_page >= pagination.last_page} onClick={() => go({ page: pagination.current_page + 1 })} className="rounded-lg border border-gray-200 bg-white px-3 py-1 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}

                {reject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setReject(null)}>
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-gray-900">Reject {reject.name}?</h3>
                            <p className="mt-1 text-sm text-gray-500">The applicant will see this reason when they try to sign in.</p>
                            <textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} rows={4} maxLength={500} placeholder="e.g. The business permit is expired" className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                            <div className="mt-4 flex gap-3">
                                <button onClick={() => setReject(null)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
                                <button onClick={submitReject} disabled={busy === reject.id} className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Reject application</button>
                            </div>
                        </div>
                    </div>
                )}

                {detail && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}>
                        <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Application details</h3>
                                <button onClick={() => setDetail(null)} className="text-xl leading-none text-gray-400" aria-label="Close">×</button>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                                {facts.map(([k, v]) => (
                                    <div key={k}><dt className="text-[11px] font-semibold uppercase text-gray-400">{k.replace(/_/g, ' ')}</dt><dd className="break-words text-sm text-gray-900">{String(v)}</dd></div>
                                ))}
                            </dl>
                            {docs.length > 0 && (
                                <div className="mt-5">
                                    <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">Documents</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {docs.map(([k, v]) => (<a key={k} href={String(v)} target="_blank" rel="noreferrer" className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#3B1F6B] hover:bg-gray-50">{k.replace(/_url$/, '').replace(/_/g, ' ')}</a>))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AdminShell>
        </>
    );
}
