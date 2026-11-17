import AdminShell from '@/layouts/admin/admin-shell';
import { fmtDate, jsonFetch } from '@/lib/json-fetch';
import { Head } from '@inertiajs/react';
import { Loader2, PackageX, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Row {
    id: number;
    order_id: number;
    order_number: string;
    order_status: string | null;
    waybill: string | null;
    reporter_role: string;
    reporter_name: string;
    reporter_email: string | null;
    reason: string;
    reason_label: string;
    description: string;
    status: 'open' | 'reviewed' | 'resolved';
    admin_note: string | null;
    created_at: string | null;
    reviewed_at: string | null;
    resolved_at: string | null;
    pod?: { photo_url: string | null; recipient: string | null; delivered_at: string | null } | null;
}

type Filter = 'open' | 'reviewed' | 'resolved' | 'all';

const badge = (s: string) =>
    s === 'open' ? 'bg-amber-50 text-amber-700' : s === 'reviewed' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700';

export default function ParcelReportsPage() {
    const [filter, setFilter] = useState<Filter>('open');
    const [rows, setRows] = useState<Row[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Row | null>(null);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const json = await jsonFetch<{ data: Row[]; counts: Record<string, number> }>(`/admin/parcel-reports/feed?status=${filter}`);
            setRows(json.data);
            setCounts(json.counts);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    const open = (r: Row) => {
        setSelected(r);
        setNote(r.admin_note ?? '');
        setNotice(null);
    };

    const decide = async (status: 'reviewed' | 'resolved') => {
        if (!selected) return;
        setBusy(true);
        try {
            const json = await jsonFetch<{ message: string }>(`/admin/parcel-reports/${selected.id}/status`, 'POST', { status, note });
            setNotice(json.message);
            setSelected(null);
            await load();
        } catch (e: any) {
            setNotice(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell active="parcel-reports">
            <Head title="Parcel Reports - Admin" />
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Parcel reports</h1>
                <p className="mt-0.5 text-sm text-gray-400">Damaged, lost, wrong or missing parcels reported by buyers, riders and couriers.</p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {(['open', 'reviewed', 'resolved', 'all'] as Filter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${filter === f ? 'border-[#3B1F6B] bg-[#3B1F6B] text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {f}
                        {f !== 'all' && <span className="ml-1 opacity-70">{counts[f] ?? 0}</span>}
                    </button>
                ))}
            </div>

            {notice && <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">{notice}</div>}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                ) : error ? (
                    <div className="p-10 text-center text-sm text-red-600">{error}</div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 p-10 text-sm text-gray-400">
                        <PackageX className="h-8 w-8" strokeWidth={1} />
                        No {filter === 'all' ? '' : filter} parcel reports.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Problem</th>
                                <th className="px-4 py-3">Reported by</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-800">{r.order_number}</div>
                                        <div className="text-xs text-gray-400">{r.waybill ?? 'No waybill'} · {r.order_status}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-800">{r.reason_label}</div>
                                        <div className="max-w-xs truncate text-xs text-gray-500">{r.description}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-gray-800">{r.reporter_name}</div>
                                        <div className="text-xs capitalize text-gray-400">{r.reporter_role}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(r.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${badge(r.status)}`}>{r.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => open(r)} className="text-xs font-semibold text-[#3B1F6B] hover:underline">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && setSelected(null)}>
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    {selected.reason_label} · {selected.order_number}
                                </p>
                                <p className="text-xs text-gray-400">Reported {fmtDate(selected.created_at)}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4 px-5 py-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-400">Reported by</p>
                                    <p className="text-gray-800">
                                        {selected.reporter_name} <span className="text-xs capitalize text-gray-400">({selected.reporter_role})</span>
                                    </p>
                                    <p className="text-xs text-gray-400">{selected.reporter_email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Order status</p>
                                    <p className="capitalize text-gray-800">{selected.order_status ?? '—'}</p>
                                    <p className="text-xs text-gray-400">{selected.waybill ?? 'No waybill'}</p>
                                </div>
                            </div>
                            {selected.pod && (
                                <div className="rounded-lg border border-gray-100 p-3">
                                    <p className="text-xs text-gray-400">Proof of delivery</p>
                                    <p className="text-gray-800">
                                        Received by {selected.pod.recipient ?? '—'}
                                        {selected.pod.delivered_at ? ` · ${selected.pod.delivered_at}` : ''}
                                    </p>
                                    {selected.pod.photo_url && (
                                        <a href={selected.pod.photo_url} target="_blank" rel="noopener noreferrer">
                                            <img src={selected.pod.photo_url} alt="Proof of delivery" className="mt-2 max-h-56 rounded-lg border border-gray-200" />
                                        </a>
                                    )}
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-400">Description</p>
                                <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-800">{selected.description}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400" htmlFor="pr-note">
                                    Internal note (admins only, never sent to the reporter)
                                </label>
                                <textarea
                                    id="pr-note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value.slice(0, 1000))}
                                    rows={3}
                                    disabled={selected.status === 'resolved'}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#3B1F6B] focus:outline-none disabled:bg-gray-50"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
                            {selected.status === 'resolved' ? (
                                <span className="text-xs text-gray-400">Resolved {fmtDate(selected.resolved_at)}</span>
                            ) : (
                                <>
                                    {selected.status === 'open' && (
                                        <button
                                            disabled={busy}
                                            onClick={() => decide('reviewed')}
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Mark reviewed
                                        </button>
                                    )}
                                    <button
                                        disabled={busy}
                                        onClick={() => decide('resolved')}
                                        className="rounded-lg bg-[#3B1F6B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2c1652] disabled:opacity-50"
                                    >
                                        Mark resolved
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
