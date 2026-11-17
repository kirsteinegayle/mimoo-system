import { useCallback, useEffect, useState } from 'react';

/** Sorting & Transfers: parcels sitting at each facility, and moving them to the next checkpoint. */
interface Facility { id: number; facility_name: string; facility_type: string; status: string; city: string }
interface Parcel { order_id: number; waybill: string | null; facility_id: number; destination: string | null; status: string; since: string | null }
interface Recent { waybill: string; to: string | null; by: string | null; notes: string | null; at: string | null }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const input = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30';

export default function TransfersManager() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [recent, setRecent] = useState<Recent[]>([]);
    const [at, setAt] = useState('');
    const [target, setTarget] = useState<Record<string, string>>({});
    const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        const r = await fetch(`/courier/transfers-data${at ? `?facility_id=${at}` : ''}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        const j = await r.json();
        setFacilities(j.facilities ?? []);
        setParcels(j.parcels ?? []);
        setRecent(j.recent ?? []);
    }, [at]);
    useEffect(() => { load(); }, [load]);

    const name = (id: number) => facilities.find((f) => f.id === id)?.facility_name ?? `#${id}`;

    const transfer = async (p: Parcel) => {
        const to = target[p.waybill ?? ''];
        if (!p.waybill || !to) return setMsg({ text: 'Choose the facility to transfer to.', bad: true });
        setBusy(p.waybill);
        try {
            const r = await fetch('/courier/transfers', {
                method: 'POST', credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ waybill_number: p.waybill, to_facility_id: Number(to) }),
            });
            const j = await r.json().catch(() => ({}));
            setMsg({ text: j.message || (r.ok ? 'Transferred.' : 'Could not transfer.'), bad: !r.ok });
            if (r.ok) await load();
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-600">Facility
                    <select className={`${input} ml-2`} value={at} onChange={(e) => setAt(e.target.value)}>
                        <option value="">All facilities</option>
                        {facilities.map((f) => <option key={f.id} value={f.id}>{f.facility_name} ({f.facility_type})</option>)}
                    </select>
                </label>
                <span className="text-xs text-gray-500">Parcels appear here once they are scanned in at a facility.</span>
            </div>
            {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.bad ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-600">
                        <tr><th className="px-4 py-3">Waybill</th><th>Now at</th><th>Destination</th><th>Last update</th><th>Transfer to</th><th className="pr-4" /></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {parcels.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No parcels are waiting at a facility.</td></tr>}
                        {parcels.map((p) => (
                            <tr key={p.order_id}>
                                <td className="px-4 py-3 font-semibold">{p.waybill}</td>
                                <td>{name(p.facility_id)}</td>
                                <td>{p.destination ?? '—'}</td>
                                <td className="text-xs text-gray-500">{p.status}<div>{when(p.since)}</div></td>
                                <td>
                                    <select className={input} value={target[p.waybill ?? ''] ?? ''} onChange={(e) => setTarget({ ...target, [p.waybill ?? '']: e.target.value })}>
                                        <option value="">Select…</option>
                                        {facilities.filter((f) => f.id !== p.facility_id && f.status === 'Active').map((f) => <option key={f.id} value={f.id}>{f.facility_name}</option>)}
                                    </select>
                                </td>
                                <td className="pr-4 text-right"><button disabled={busy === p.waybill} onClick={() => transfer(p)} className="rounded-lg bg-[#2B2249] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Transfer</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h3 className="mb-2 text-sm font-bold text-gray-900">Recent transfers</h3>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white text-sm">
                    {recent.length === 0 && <li className="p-4 text-gray-500">No transfers yet.</li>}
                    {recent.map((r, i) => <li key={i} className="flex justify-between gap-3 p-3"><span><strong>{r.waybill}</strong> → {r.to} <span className="text-xs text-gray-500">({r.notes})</span></span><span className="text-xs text-gray-500">{r.by} · {when(r.at)}</span></li>)}
                </ul>
            </div>
        </div>
    );
}
