import { useCallback, useEffect, useState } from 'react';

/** Zones (cities / provinces covered) and weight-bracket rates of the logistics company. Used by the checkout shipping fee. */
interface Rate { id: number; min_weight: number; max_weight: number | null; fee: number }
interface Zone { id: number; name: string; cities: string[]; provinces: string[]; is_default: boolean; status: 'active' | 'inactive'; rates: Rate[] }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30';
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

async function call(method: string, url: string, body?: object): Promise<{ ok: boolean; message: string }> {
    const r = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, message: j.message || (r.ok ? 'Saved.' : 'Something went wrong.') };
}

export default function ZonesRatesManager() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [fallback, setFallback] = useState(0);
    const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
    const [zf, setZf] = useState({ name: '', cities: '', provinces: '', is_default: false });
    const [rf, setRf] = useState<Record<number, { min: string; max: string; fee: string }>>({});

    const load = useCallback(async () => {
        const r = await fetch('/logistics/zones-data', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        const j = await r.json();
        setZones(j.zones ?? []);
        setFallback(j.fallback_fee ?? 0);
    }, []);
    useEffect(() => { load(); }, [load]);

    const run = async (p: Promise<{ ok: boolean; message: string }>) => {
        const res = await p;
        setMsg({ text: res.message, bad: !res.ok });
        if (res.ok) await load();
        return res.ok;
    };

    const addZone = async () => {
        if (await run(call('POST', '/logistics/zones', { name: zf.name, cities: list(zf.cities), provinces: list(zf.provinces), is_default: zf.is_default, status: 'active' }))) {
            setZf({ name: '', cities: '', provinces: '', is_default: false });
        }
    };

    const addRate = async (z: Zone) => {
        const f = rf[z.id] ?? { min: '', max: '', fee: '' };
        if (await run(call('POST', `/logistics/zones/${z.id}/rates`, { min_weight: f.min, max_weight: f.max === '' ? null : f.max, fee: f.fee }))) {
            setRf({ ...rf, [z.id]: { min: '', max: '', fee: '' } });
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Buyers are charged by <strong>zone</strong> (their city / province) and <strong>parcel weight bracket</strong>. If no zone or bracket matches, the
                platform standard rate of <strong>₱{fallback.toFixed(2)}</strong> applies (never free). With several logistics companies, the one covering the buyer's area at the lowest rate gets the parcel.
            </div>

            {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.bad ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}

            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Add a zone</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                    <input className={input} placeholder="Zone name (e.g. Cavite)" value={zf.name} onChange={(e) => setZf({ ...zf, name: e.target.value })} />
                    <input className={input} placeholder="Cities, comma separated" value={zf.cities} onChange={(e) => setZf({ ...zf, cities: e.target.value })} />
                    <input className={input} placeholder="Provinces, comma separated" value={zf.provinces} onChange={(e) => setZf({ ...zf, provinces: e.target.value })} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" checked={zf.is_default} onChange={(e) => setZf({ ...zf, is_default: e.target.checked })} />
                        Preferred zone when rates tie
                    </label>
                    <button onClick={addZone} className="rounded-lg bg-[#2B2249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B]">Add zone</button>
                </div>
            </div>

            {zones.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No zones yet. Parcels will use the standard rate until you add one.</p>}

            {zones.map((z) => {
                const f = rf[z.id] ?? { min: '', max: '', fee: '' };
                const set = (patch: Partial<typeof f>) => setRf({ ...rf, [z.id]: { ...f, ...patch } });
                return (
                    <div key={z.id} className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {z.name} {z.is_default && <span className="ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-700">Preferred</span>}
                                    {z.status === 'inactive' && <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-600">Inactive</span>}
                                </h3>
                                <p className="text-xs text-gray-500">Cities: {z.cities.join(', ') || '—'} · Provinces: {z.provinces.join(', ') || '—'}</p>
                            </div>
                            <div className="flex gap-3 text-xs font-semibold">
                                <button className="text-blue-600 hover:underline" onClick={() => run(call('PUT', `/logistics/zones/${z.id}`, { ...z, status: z.status === 'active' ? 'inactive' : 'active' }))}>
                                    {z.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button className="text-red-600 hover:underline" onClick={() => confirm(`Delete zone "${z.name}" and its rates?`) && run(call('DELETE', `/logistics/zones/${z.id}`))}>Delete</button>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="text-left text-xs uppercase text-gray-500">
                                <tr><th className="py-1">From (kg)</th><th>To (kg)</th><th>Fee (₱)</th><th /></tr>
                            </thead>
                            <tbody>
                                {z.rates.map((r) => (
                                    <tr key={r.id} className="border-t border-gray-100">
                                        <td className="py-1.5">{r.min_weight}</td>
                                        <td>{r.max_weight ?? 'and above'}</td>
                                        <td>₱{r.fee.toFixed(2)}</td>
                                        <td className="text-right"><button className="text-xs font-semibold text-red-600 hover:underline" onClick={() => run(call('DELETE', `/logistics/rates/${r.id}`))}>Remove</button></td>
                                    </tr>
                                ))}
                                {z.rates.length === 0 && <tr><td colSpan={4} className="py-2 text-xs text-gray-500">No brackets: the standard rate applies to this zone.</td></tr>}
                            </tbody>
                        </table>

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <input className={input} type="number" min="0" step="0.01" placeholder="From kg" value={f.min} onChange={(e) => set({ min: e.target.value })} />
                            <input className={input} type="number" min="0" step="0.01" placeholder="To kg (blank = no limit)" value={f.max} onChange={(e) => set({ max: e.target.value })} />
                            <input className={input} type="number" min="0" step="0.01" placeholder="Fee ₱" value={f.fee} onChange={(e) => set({ fee: e.target.value })} />
                            <button onClick={() => addRate(z)} className="rounded-lg border border-[#2B2249] px-3 py-2 text-sm font-semibold text-[#2B2249] hover:bg-gray-50">Add bracket</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
