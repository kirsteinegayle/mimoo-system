import { useCallback, useEffect, useState } from 'react';

/** COD trail for the logistics account: collected by the courier -> remitted to logistics -> settled to the seller. */
type St = 'collected' | 'remitted_to_logistics' | 'settled_to_seller';
interface Row { id: number; waybill: string | null; order_number: string; courier: string | null; amount: number; shipping_fee: number; commission: number; seller_payout: number; status: St; collected_at: string | null; remitted_at: string | null; settled_at: string | null }
interface Summary { with_courier: number; with_logistics: number; settled: number; riders_awaiting_courier_confirmation: number }

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const LABEL: Record<St, string> = { collected: 'With courier', remitted_to_logistics: 'Received by logistics', settled_to_seller: 'Settled to seller' };
const COLOR: Record<St, string> = { collected: 'bg-amber-50 text-amber-700', remitted_to_logistics: 'bg-blue-50 text-blue-700', settled_to_seller: 'bg-green-50 text-green-700' };
const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';

export default function CodSettlements() {
    const [filter, setFilter] = useState<'' | St>('');
    const [rows, setRows] = useState<Row[]>([]);
    const [sum, setSum] = useState<Summary>({ with_courier: 0, with_logistics: 0, settled: 0, riders_awaiting_courier_confirmation: 0 });
    const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
    const [busy, setBusy] = useState<number | null>(null);

    const load = useCallback(async () => {
        const r = await fetch(`/logistics/cod-data?status=${filter}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        const j = await r.json();
        setRows(j.data ?? []);
        if (j.summary) setSum(j.summary);
    }, [filter]);
    useEffect(() => { load(); }, [load]);

    const act = async (id: number, step: 'received' | 'settled') => {
        setBusy(id);
        try {
            const r = await fetch(`/logistics/cod/${id}/${step}`, { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } });
            const j = await r.json().catch(() => ({}));
            setMsg({ text: j.message || 'Done.', bad: !r.ok });
            if (r.ok) await load();
        } finally {
            setBusy(null);
        }
    };

    const card = (label: string, value: number, hint: string) => (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{peso(value)}</p>
            <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
        </div>
    );

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {card('Riders to courier', sum.riders_awaiting_courier_confirmation, 'Awaiting the courier\'s confirmation')}
                {card('With courier', sum.with_courier, 'Collected, not yet remitted to you')}
                {card('Received by logistics', sum.with_logistics, 'Pay the sellers from this')}
                {card('Settled to sellers', sum.settled, 'Completed')}
            </div>

            {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.bad ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}

            <div className="flex flex-wrap gap-2">
                {([['', 'All'], ['collected', 'With courier'], ['remitted_to_logistics', 'Received'], ['settled_to_seller', 'Settled']] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v as '' | St)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === v ? 'bg-[#2B2249] text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>{l}</button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-600">
                        <tr><th className="px-4 py-3">Parcel</th><th>Courier</th><th>COD collected</th><th>Shipping fee</th><th>Commission</th><th>Seller payout</th><th>Status</th><th className="pr-4 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500">No COD parcels yet. Delivered COD orders routed to you appear here.</td></tr>}
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td className="px-4 py-3"><div className="font-semibold">{r.order_number}</div><div className="text-xs text-gray-500">{r.waybill}</div></td>
                                <td>{r.courier ?? '—'}</td>
                                <td>{peso(r.amount)}</td>
                                <td>{peso(r.shipping_fee)}</td>
                                <td>{peso(r.commission)}</td>
                                <td className="font-semibold">{peso(r.seller_payout)}</td>
                                <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${COLOR[r.status]}`}>{LABEL[r.status]}</span></td>
                                <td className="pr-4 text-right">
                                    {r.status === 'collected' && <button disabled={busy === r.id} onClick={() => act(r.id, 'received')} className="rounded-lg bg-[#2B2249] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Mark received</button>}
                                    {r.status === 'remitted_to_logistics' && <button disabled={busy === r.id} onClick={() => act(r.id, 'settled')} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Settle to seller</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
