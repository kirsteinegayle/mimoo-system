import { useCallback, useEffect, useState } from 'react';

/** Logistics reports: parcels, refund logs, rider / delivery incidents reported by buyers in the app, rejected scans, COD. */
interface Data {
    range: { from: string; to: string };
    summary: Record<string, number>;
    refunds: { order: string; amount: number; method: string; status: string; at: string | null }[];
    incidents: { source: string; order: string; type: string; detail: string; by: string | null; status: string; at: string | null }[];
    rejected_scans: { waybill: string | null; scan_type: string; reason: string; at: string }[];
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const d = (s: string | null) => (s ? new Date(s).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const input = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm';

export default function LogisticsReports() {
    const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
    const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [data, setData] = useState<Data | null>(null);
    const [tab, setTab] = useState<'incidents' | 'refunds' | 'scans'>('incidents');

    const load = useCallback(async () => {
        const r = await fetch(`/logistics/reports-data?from=${from}&to=${to}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (r.ok) setData(await r.json());
    }, [from, to]);
    useEffect(() => { load(); }, [load]);

    const s = data?.summary ?? {};
    const card = (label: string, v: string | number) => (
        <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-1 text-xl font-bold text-gray-900">{v}</p></div>
    );

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-600">From <input type="date" className={input} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
                <label className="text-sm text-gray-600">To <input type="date" className={input} value={to} onChange={(e) => setTo(e.target.value)} /></label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {card('Parcels', s.parcels ?? 0)}
                {card('Delivered', s.delivered ?? 0)}
                {card('Failed / returned', s.failed_or_returned ?? 0)}
                {card('COD collected', peso(s.cod_collected ?? 0))}
                {card('Refunds', s.refunds ?? 0)}
                {card('Refunded amount', peso(s.refunded_amount ?? 0))}
                {card('Incidents reported', s.incidents ?? 0)}
                {card('Rejected scans', s.rejected_scans ?? 0)}
            </div>

            <div className="flex gap-2">
                {([['incidents', 'Rider & delivery incidents'], ['refunds', 'Refund logs'], ['scans', 'Rejected scans']] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === k ? 'bg-[#2B2249] text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>{l}</button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                {tab === 'incidents' && (
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Source</th><th>Order</th><th>Type</th><th>Details</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {(data?.incidents ?? []).length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No incidents in this period.</td></tr>}
                            {data?.incidents.map((i, n) => (
                                <tr key={n}><td className="px-4 py-3">{i.source}{i.by ? <div className="text-xs text-gray-500">{i.by}</div> : null}</td><td>{i.order}</td><td>{i.type}</td><td className="max-w-xs text-gray-600">{i.detail}</td><td className="capitalize">{i.status.replace(/_/g, ' ')}</td><td>{d(i.at)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {tab === 'refunds' && (
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Order</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {(data?.refunds ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No refunds in this period.</td></tr>}
                            {data?.refunds.map((r, n) => (<tr key={n}><td className="px-4 py-3">{r.order}</td><td>{peso(r.amount)}</td><td className="uppercase">{r.method}</td><td className="capitalize">{r.status}</td><td>{d(r.at)}</td></tr>))}
                        </tbody>
                    </table>
                )}
                {tab === 'scans' && (
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Waybill</th><th>Scan type</th><th>Reason</th><th>Date</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {(data?.rejected_scans ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No rejected scans in this period.</td></tr>}
                            {data?.rejected_scans.map((r, n) => (<tr key={n}><td className="px-4 py-3">{r.waybill ?? '—'}</td><td>{r.scan_type.replace(/_/g, ' ')}</td><td className="text-gray-600">{r.reason}</td><td>{d(r.at)}</td></tr>))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
