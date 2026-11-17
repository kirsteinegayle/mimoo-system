import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

/** The company's riders: list with workload, add, edit, activate / deactivate. Assignment of deliveries: Courier > Delivery Management. */
interface Rider { id: number; name: string; contact_number: string; status: 'active' | 'inactive'; online: boolean; email: string | null; account_ready: boolean; active_jobs: number; delivered: number; last_seen: string | null }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30';

async function call(method: string, url: string, body?: object) {
    const r = await fetch(url, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, message: (j.message as string) || (r.ok ? 'Saved.' : 'Something went wrong.') };
}

export default function RidersManager() {
    const [rows, setRows] = useState<Rider[]>([]);
    const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
    const [form, setForm] = useState<{ id: number | null; name: string; contact_number: string; email: string } | null>(null);

    const load = useCallback(async () => {
        const r = await fetch('/logistics/riders-data', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        setRows((await r.json()).data ?? []);
    }, []);
    useEffect(() => { load(); }, [load]);

    const run = async (p: Promise<{ ok: boolean; message: string }>) => {
        const res = await p;
        setMsg({ text: res.message, bad: !res.ok });
        if (res.ok) await load();
        return res.ok;
    };

    const save = async () => {
        if (!form) return;
        const ok = form.id
            ? await run(call('PUT', `/logistics/riders/${form.id}`, { name: form.name, contact_number: form.contact_number }))
            : await run(call('POST', '/logistics/riders', { name: form.name, contact_number: form.contact_number, email: form.email || null }));
        if (ok) setForm(null);
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">Riders of your company. New rider applications are reviewed under <Link href="/courier/rider-management" className="font-semibold text-[#4B5EF9] hover:underline">Rider Management</Link>; assign deliveries under <Link href="/courier/delivery-management" className="font-semibold text-[#4B5EF9] hover:underline">Delivery Management</Link>.</p>
                <button onClick={() => setForm({ id: null, name: '', contact_number: '', email: '' })} className="rounded-lg bg-[#2B2249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B]">+ Add rider</button>
            </div>
            {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.bad ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-600">
                        <tr><th className="px-4 py-3">Rider</th><th>Contact</th><th>App account</th><th>Active jobs</th><th>Delivered</th><th>Status</th><th className="pr-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No riders yet.</td></tr>}
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td className="px-4 py-3"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${r.online ? 'bg-green-500' : 'bg-gray-300'}`} title={r.online ? 'Online' : 'Offline'} /><span className="font-semibold">{r.name}</span></td>
                                <td>{r.contact_number}</td>
                                <td>{r.account_ready ? <span className="text-green-700">Ready{r.email ? ` · ${r.email}` : ''}</span> : <span className="text-amber-700">No approved app account</span>}</td>
                                <td>{r.active_jobs}</td>
                                <td>{r.delivered}</td>
                                <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${r.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                                <td className="pr-4 text-right text-xs font-semibold">
                                    <button className="mr-3 text-blue-600 hover:underline" onClick={() => setForm({ id: r.id, name: r.name, contact_number: r.contact_number, email: r.email ?? '' })}>Edit</button>
                                    <button className="text-gray-700 hover:underline" onClick={() => run(call('PUT', `/logistics/riders/${r.id}`, { status: r.status === 'active' ? 'inactive' : 'active' }))}>{r.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {form && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}>
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{form.id ? 'Edit rider' : 'Add rider'}</h3>
                        <div className="space-y-3">
                            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Full name</label><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                            <div><label className="mb-1 block text-xs font-semibold text-gray-600">Contact (09XXXXXXXXX)</label><input className={input} value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} /></div>
                            {!form.id && <div><label className="mb-1 block text-xs font-semibold text-gray-600">Rider app account email (optional)</label><input className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>}
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button onClick={() => setForm(null)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
                            <button onClick={save} className="flex-1 rounded-lg bg-[#2B2249] py-2.5 text-sm font-semibold text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
