import { useCallback, useEffect, useState } from 'react';

/** Live parcel monitoring for logistics: status, assigned courier, rider and the tracking timeline. Refreshes every 20 s. */
interface Parcel {
    id: number; order_number: string; waybill: string | null; buyer_city: string | null; status: string;
    tracking_status: string | null; tracking_message: string | null; courier: string | null; rider: string | null; job_status: string | null;
    payment_method: string; items: number; updated_at: string | null; timeline: { at: string; label: string }[];
}
interface Summary { total: number; awaiting_rider: number; out_for_delivery: number; delivered: number; problem: number }

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const JOB: Record<string, string> = {
    assigned: 'bg-blue-50 text-blue-700', out_for_delivery: 'bg-purple-50 text-purple-700', delivered: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700', return_to_sender: 'bg-red-50 text-red-700',
};

export default function DeliveryMonitor() {
    const [rows, setRows] = useState<Parcel[]>([]);
    const [sum, setSum] = useState<Summary>({ total: 0, awaiting_rider: 0, out_for_delivery: 0, delivered: 0, problem: 0 });
    const [filter, setFilter] = useState('all');
    const [q, setQ] = useState('');
    const [open, setOpen] = useState<Parcel | null>(null);
    const [stamp, setStamp] = useState('');

    const load = useCallback(async () => {
        try {
            const r = await fetch('/logistics/monitoring-data', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
            const j = await r.json();
            setRows(j.data ?? []);
            setSum(j.summary ?? sum);
            setStamp(new Date().toLocaleTimeString());
        } catch { /* keep the last data */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        load();
        const t = setInterval(load, 20000);
        return () => clearInterval(t);
    }, [load]);

    const shown = rows.filter((p) => {
        if (filter === 'awaiting' && !(p.job_status === null && ['shipped', 'in_transit'].includes(p.status))) return false;
        if (filter === 'out' && p.job_status !== 'out_for_delivery') return false;
        if (filter === 'delivered' && p.job_status !== 'delivered') return false;
        if (filter === 'problem' && !['failed', 'return_to_sender'].includes(p.job_status ?? '')) return false;
        const s = q.trim().toLowerCase();
        return !s || [p.waybill, p.order_number, p.buyer_city, p.courier, p.rider].some((v) => (v ?? '').toLowerCase().includes(s));
    });

    const card = (key: string, label: string, n: number) => (
        <button key={key} onClick={() => setFilter(key)} className={`rounded-xl border p-4 text-left transition ${filter === key ? 'border-[#2B2249] bg-white shadow' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{n}</p>
        </button>
    );

    return (
        <div className="mx-auto max-w-7xl space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {card('all', 'All parcels', sum.total)}
                {card('awaiting', 'Awaiting rider', sum.awaiting_rider)}
                {card('out', 'Out for delivery', sum.out_for_delivery)}
                {card('delivered', 'Delivered', sum.delivered)}
                {card('problem', 'Failed / returned', sum.problem)}
            </div>

            <div className="flex items-center justify-between gap-3">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search waybill, order, city, courier or rider" className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30" />
                <span className="text-xs text-gray-500">Live · updated {stamp || '…'}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-600">
                        <tr><th className="px-4 py-3">Parcel</th><th>Destination</th><th>Courier</th><th>Rider</th><th>Delivery</th><th>Last update</th><th className="pr-4 text-right" /></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {shown.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No parcels match.</td></tr>}
                        {shown.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="font-semibold">{p.waybill ?? p.order_number}</div><div className="text-xs text-gray-500">{p.order_number} · {p.payment_method}</div></td>
                                <td>{p.buyer_city ?? '—'}</td>
                                <td>{p.courier ?? <span className="text-gray-400">Unassigned</span>}</td>
                                <td>{p.rider ?? <span className="text-gray-400">—</span>}</td>
                                <td>
                                    {p.job_status
                                        ? <span className={`rounded-full px-2 py-1 text-xs font-semibold ${JOB[p.job_status] ?? 'bg-gray-100 text-gray-600'}`}>{p.job_status.replace(/_/g, ' ')}</span>
                                        : <span className="text-xs text-gray-500">{p.tracking_message ?? p.status}</span>}
                                </td>
                                <td className="text-xs text-gray-500">{when(p.updated_at)}</td>
                                <td className="pr-4 text-right"><button onClick={() => setOpen(p)} className="text-xs font-semibold text-[#4B5EF9] hover:underline">Timeline</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
                    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{open.waybill ?? open.order_number}</h3>
                                <p className="text-xs text-gray-500">{open.courier ?? 'No courier yet'}{open.rider ? ` · Rider ${open.rider}` : ''}</p>
                            </div>
                            <button onClick={() => setOpen(null)} className="text-xl leading-none text-gray-400" aria-label="Close">×</button>
                        </div>
                        <ol className="space-y-3 border-l-2 border-gray-200 pl-4">
                            {open.timeline.map((t, i) => (
                                <li key={i} className="relative">
                                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#2B2249]" />
                                    <p className="text-sm font-medium text-gray-900">{t.label}</p>
                                    <p className="text-xs text-gray-500">{when(t.at)}</p>
                                </li>
                            ))}
                        </ol>
                        {open.tracking_message && <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">Latest: {open.tracking_message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
