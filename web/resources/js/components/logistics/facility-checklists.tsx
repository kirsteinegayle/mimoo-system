import { useCallback, useEffect, useState } from 'react';

/** Operational checklists per facility: inbound / outbound lists that staff create, edit, tick off, delete and reset. */
interface Facility { id: number; facility_name: string; facility_type: string; status: string }
interface Item { id: number; type: 'inbound' | 'outbound'; title: string; note: string | null; is_done: boolean; done_at: string | null; done_by: string | null }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30';

async function call(method: string, url: string, body?: object) {
    const r = await fetch(url, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, message: (j.message as string) || (r.ok ? 'Saved.' : 'Something went wrong.') };
}

export default function FacilityChecklists({ facilities }: { facilities: Facility[] }) {
    const [facilityId, setFacilityId] = useState<number | null>(facilities[0]?.id ?? null);
    const [type, setType] = useState<'inbound' | 'outbound'>('inbound');
    const [items, setItems] = useState<Item[]>([]);
    const [title, setTitle] = useState('');
    const [editing, setEditing] = useState<{ id: number; title: string } | null>(null);
    const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);

    useEffect(() => {
        if (facilityId === null && facilities.length) setFacilityId(facilities[0].id);
    }, [facilities, facilityId]);

    const load = useCallback(async () => {
        if (facilityId === null) return setItems([]);
        const r = await fetch(`/logistics/facilities/${facilityId}/checklist`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (r.ok) setItems((await r.json()).data ?? []);
    }, [facilityId]);
    useEffect(() => { load(); }, [load]);

    const run = async (p: Promise<{ ok: boolean; message: string }>) => {
        const res = await p;
        setMsg({ text: res.message, bad: !res.ok });
        if (res.ok) await load();
        return res.ok;
    };

    if (facilities.length === 0) {
        return <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">Add a facility first. Each facility has its own checklists.</p>;
    }

    const list = items.filter((i) => i.type === type);
    const done = list.filter((i) => i.is_done).length;

    const add = async () => {
        if (facilityId === null) return;
        if (await run(call('POST', `/logistics/facilities/${facilityId}/checklist`, { type, title }))) setTitle('');
    };
    const rename = async () => {
        if (!editing) return;
        if (await run(call('PUT', `/logistics/checklist-items/${editing.id}`, { title: editing.title }))) setEditing(null);
    };

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
                <select className={`${input} max-w-xs`} value={facilityId ?? ''} onChange={(e) => setFacilityId(Number(e.target.value))}>
                    {facilities.map((f) => <option key={f.id} value={f.id}>{f.facility_name} ({f.facility_type})</option>)}
                </select>
                <div className="flex gap-2">
                    {(['inbound', 'outbound'] as const).map((t) => (
                        <button key={t} onClick={() => setType(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${type === t ? 'bg-[#2B2249] text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>{t}</button>
                    ))}
                </div>
            </div>

            {msg && <p className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.bad ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}

            <div className="mb-3 flex items-center justify-between text-xs text-gray-600">
                <span>{done} of {list.length} done</span>
                {done > 0 && <button onClick={() => run(call('POST', `/logistics/facilities/${facilityId}/checklist/reset`, { type }))} className="font-semibold text-blue-600 hover:underline">Reset ticks (new shift)</button>}
            </div>
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-green-500 transition-all" style={{ width: list.length ? `${(done / list.length) * 100}%` : '0%' }} /></div>

            <ul className="space-y-2">
                {list.length === 0 && <li className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">No {type} checklist items yet. Add the first step below.</li>}
                {list.map((i) => (
                    <li key={i.id} className={`flex items-start gap-3 rounded-lg border p-3 ${i.is_done ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                        <input type="checkbox" className="mt-1 h-5 w-5" checked={i.is_done} onChange={(e) => run(call('PUT', `/logistics/checklist-items/${i.id}`, { is_done: e.target.checked }))} aria-label={`Mark "${i.title}" done`} />
                        <div className="min-w-0 flex-1">
                            {editing?.id === i.id ? (
                                <div className="flex gap-2">
                                    <input className={input} value={editing.title} onChange={(e) => setEditing({ id: i.id, title: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && rename()} autoFocus />
                                    <button onClick={rename} className="rounded-lg bg-[#2B2249] px-3 text-xs font-semibold text-white">Save</button>
                                    <button onClick={() => setEditing(null)} className="text-xs text-gray-500">Cancel</button>
                                </div>
                            ) : (
                                <p className={`text-sm ${i.is_done ? 'text-gray-500 line-through' : 'font-medium text-gray-900'}`}>{i.title}</p>
                            )}
                            {i.is_done && i.done_at && <p className="mt-0.5 text-[11px] text-gray-500">Done by {i.done_by ?? 'staff'} · {new Date(i.done_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                        </div>
                        <div className="flex shrink-0 gap-3 text-xs font-semibold">
                            <button className="text-blue-600 hover:underline" onClick={() => setEditing({ id: i.id, title: i.title })}>Edit</button>
                            <button className="text-red-600 hover:underline" onClick={() => confirm(`Delete "${i.title}"?`) && run(call('DELETE', `/logistics/checklist-items/${i.id}`))}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex gap-2">
                <input className={input} value={title} maxLength={160} placeholder={`Add a ${type} step, e.g. "Verify seal and weight"`} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && title.trim().length >= 2 && add()} />
                <button onClick={add} disabled={title.trim().length < 2} className="rounded-lg bg-[#2B2249] px-4 text-sm font-semibold text-white disabled:opacity-50">Add</button>
            </div>
        </div>
    );
}
