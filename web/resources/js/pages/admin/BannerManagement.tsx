import { confirmDialog } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';
import { Head } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Banner Management. Banners shown on the buyer homepage (and the app, GET /api/banners):
 * create / edit with image upload, activate / deactivate, schedule (start / end), order within a slot, delete.
 */
type Position = 'hero' | 'secondary' | 'sidebar';
interface Banner { id: number; title: string; image: string; link_url: string | null; position: Position; status: 'active' | 'inactive'; order: number; starts_at: string | null; ends_at: string | null; live: boolean }

const SLOTS: { key: Position; label: string; hint: string }[] = [
    { key: 'hero', label: 'Hero carousel', hint: 'Large rotating banner at the top of the homepage.' },
    { key: 'secondary', label: 'Secondary (left stack)', hint: 'Two stacked banners under the hero.' },
    { key: 'sidebar', label: 'Sidebar (right)', hint: 'Tall banners beside the secondary ones.' },
];

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const blank = { title: '', link_url: '', position: 'hero' as Position, status: 'active', starts_at: '', ends_at: '' };
const input = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20';

async function call(method: string, url: string, body?: FormData | object) {
    const isForm = body instanceof FormData;
    const r = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest', ...(isForm || !body ? {} : { 'Content-Type': 'application/json' }) },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, message: (j.message as string) || (r.ok ? 'Saved.' : 'Something went wrong.') };
}

export default function BannerManagement() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [editing, setEditing] = useState<Banner | 'new' | null>(null);
    const [form, setForm] = useState({ ...blank });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        const r = await fetch('/admin/banners/data', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (r.ok) setBanners((await r.json()).data ?? []);
    }, []);
    useEffect(() => { load(); }, [load]);

    const act = async (p: Promise<{ ok: boolean; message: string }>) => {
        const res = await p;
        res.ok ? toast.success(res.message) : toast.error(res.message);
        if (res.ok) await load();
    };

    const open = (b: Banner | 'new', position: Position = 'hero') => {
        setError('');
        setFile(null);
        setPreview(b === 'new' ? '' : b.image);
        setForm(b === 'new' ? { ...blank, position } : { title: b.title, link_url: b.link_url ?? '', position: b.position, status: b.status, starts_at: b.starts_at ?? '', ends_at: b.ends_at ?? '' });
        setEditing(b);
    };

    const pick = (f: File | null) => {
        setFile(f);
        if (f) setPreview(URL.createObjectURL(f));
    };

    const save = async () => {
        if (!form.title.trim()) return setError('Give the banner a title.');
        if (editing === 'new' && !file) return setError('Choose an image.');
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, String(v)));
        if (file) fd.append('image', file);
        setBusy(true);
        const res = await call('POST', editing === 'new' ? '/admin/banners' : `/admin/banners/${(editing as Banner).id}`, fd);
        setBusy(false);
        if (!res.ok) return setError(res.message);
        toast.success(res.message);
        setEditing(null);
        load();
    };

    const remove = async (b: Banner) => {
        if (await confirmDialog(`Delete the banner "${b.title}"? This cannot be undone.`)) act(call('DELETE', `/admin/banners/${b.id}`));
    };

    return (
        <>
            <Head title="Banner Management - Admin" />
            <AdminShell active="banners">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Banners appear on the buyer homepage and in the app while they are active and inside their schedule.</p>
                    </div>
                    <button onClick={() => open('new')} className="inline-flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E1850]"><Plus className="h-4 w-4" /> Add banner</button>
                </div>

                {SLOTS.map((slot) => {
                    const list = banners.filter((b) => b.position === slot.key);
                    return (
                        <section key={slot.key} className="mb-8">
                            <div className="mb-2 flex items-center justify-between">
                                <div><h2 className="text-base font-bold text-gray-900">{slot.label} <span className="text-xs font-normal text-gray-400">({list.filter((b) => b.live).length} live / {list.length})</span></h2><p className="text-xs text-gray-500">{slot.hint}</p></div>
                                <button onClick={() => open('new', slot.key)} className="text-xs font-semibold text-[#3B1F6B] hover:underline">+ Add to this slot</button>
                            </div>
                            {list.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">Nothing here. The homepage hides this slot until you add a banner.</p>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {list.map((b, i) => (
                                        <div key={b.id} className={`overflow-hidden rounded-xl border bg-white ${b.live ? 'border-gray-200' : 'border-gray-200 opacity-70'}`}>
                                            <div className="aspect-[16/6] bg-gray-100"><img src={b.image} alt={b.title} className="h-full w-full object-cover" /></div>
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                                                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${b.live ? 'bg-green-100 text-green-700' : b.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>{b.live ? 'Live' : b.status === 'active' ? 'Scheduled' : 'Off'}</span>
                                                </div>
                                                <p className="mt-0.5 truncate text-xs text-gray-500">{b.link_url ?? 'No link'}</p>
                                                {(b.starts_at || b.ends_at) && <p className="mt-0.5 text-[11px] text-gray-400">{b.starts_at?.replace('T', ' ') ?? 'now'} → {b.ends_at?.replace('T', ' ') ?? 'no end'}</p>}
                                                <div className="mt-2 flex items-center gap-1 text-gray-500">
                                                    <button disabled={i === 0} onClick={() => act(call('POST', `/admin/banners/${b.id}/move`, { dir: 'up' }))} className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-30" title="Move earlier"><ArrowUp className="h-4 w-4" /></button>
                                                    <button disabled={i === list.length - 1} onClick={() => act(call('POST', `/admin/banners/${b.id}/move`, { dir: 'down' }))} className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-30" title="Move later"><ArrowDown className="h-4 w-4" /></button>
                                                    <button onClick={() => act(call('POST', `/admin/banners/${b.id}/toggle`))} className="rounded px-2 py-1 text-xs font-semibold hover:bg-gray-100">{b.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                                    <span className="flex-1" />
                                                    <button onClick={() => open(b)} className="rounded p-1.5 hover:bg-gray-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                                                    <button onClick={() => remove(b)} className="rounded p-1.5 text-red-500 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}

                {editing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && setEditing(null)}>
                        <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                            <h3 className="mb-4 text-lg font-bold text-gray-900">{editing === 'new' ? 'Add banner' : 'Edit banner'}</h3>
                            <button type="button" onClick={() => fileRef.current?.click()} className="mb-4 flex aspect-[16/6] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:bg-gray-100">
                                {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> Upload image (JPG, PNG, WEBP · max 4 MB)</span>}
                            </button>
                            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-gray-600">Title</label><input className={input} value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-gray-600">Link (optional, e.g. /category/Pet%20Supplies)</label><input className={input} value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} /></div>
                                <div><label className="mb-1 block text-xs font-semibold text-gray-600">Slot</label><select className={input} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as Position })}>{SLOTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                                <div><label className="mb-1 block text-xs font-semibold text-gray-600">Status</label><select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                                <div><label className="mb-1 block text-xs font-semibold text-gray-600">Show from (optional)</label><input type="datetime-local" className={input} value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
                                <div><label className="mb-1 block text-xs font-semibold text-gray-600">Show until (optional)</label><input type="datetime-local" className={input} value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
                            </div>
                            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                            <div className="mt-5 flex gap-3">
                                <button onClick={() => setEditing(null)} disabled={busy} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
                                <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-[#3B1F6B] py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save banner'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminShell>
        </>
    );
}
