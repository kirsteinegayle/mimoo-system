import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Branches and Facilities: hubs, sorting hubs and branches of the company.
 * These records drive parcel scan validation (a scan is only accepted at an active facility that is a
 * valid checkpoint on the parcel's route). Uses the existing facility endpoints.
 */
export interface Facility {
    id: number;
    facility_name: string;
    facility_code: string;
    facility_type: 'Main Hub' | 'Sorting Hub' | 'Branch';
    parent_facility_id: number | null;
    parent_facility: string | null;
    status: 'Active' | 'Inactive';
    region: string;
    province: string | null;
    city: string;
    address: string;
    manager: string;
    contact: string;
    coverage: string[] | string | null;
}

const TYPES = ['Main Hub', 'Sorting Hub', 'Branch'] as const;
const blank = { facility_name: '', facility_type: 'Branch', parent_facility_id: '', status: 'Active', region: '', province: '', city: '', address: '', manager_name: '', contact_number: '', coverage: '' };

const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30';

export default function FacilityManager({ facilities }: { facilities: Facility[] }) {
    const [editing, setEditing] = useState<Facility | 'new' | null>(null);
    const [form, setForm] = useState<Record<string, string>>(blank);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    const cov = (f: Facility) => (Array.isArray(f.coverage) ? f.coverage : typeof f.coverage === 'string' ? JSON.parse(f.coverage || '[]') : []);

    const openNew = () => {
        setForm(blank);
        setErrors({});
        setEditing('new');
    };
    const openEdit = (f: Facility) => {
        setForm({
            facility_name: f.facility_name, facility_type: f.facility_type, parent_facility_id: f.parent_facility_id ? String(f.parent_facility_id) : '',
            status: f.status, region: f.region, province: f.province ?? '', city: f.city, address: f.address,
            manager_name: f.manager, contact_number: f.contact, coverage: cov(f).join(', '),
        });
        setErrors({});
        setEditing(f);
    };

    const save = () => {
        setBusy(true);
        const payload = {
            ...form,
            parent_facility_id: form.parent_facility_id || null,
            province: form.province || null,
            coverage_cities: form.coverage.split(',').map((c) => c.trim()).filter(Boolean),
        };
        const opts = {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
            onError: (e: Record<string, string>) => setErrors(e),
            onFinish: () => setBusy(false),
        };
        if (editing === 'new') router.post('/courier/branch-facility', payload, opts);
        else if (editing) router.put(`/courier/branch-facility/${editing.id}`, payload, opts);
    };

    const field = (key: string, label: string, props: Record<string, unknown> = {}) => (
        <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">{label}</label>
            <input className={input} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
            {(errors[key] || (key === 'coverage' && errors.coverage_cities)) && <p className="mt-1 text-xs text-red-600">{errors[key] || errors.coverage_cities}</p>}
        </div>
    );

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">Main hubs, sorting hubs and branches. Parcel scans are validated against these facilities.</p>
                <button onClick={openNew} className="rounded-lg bg-[#2B2249] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3B1F6B]">+ Add facility</button>
            </div>

            {facilities.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No facilities yet. Add your Main Hub first.</p>
            ) : (
                <div className="space-y-3">
                    {facilities.map((f) => (
                        <div key={f.id} className={`rounded-lg border p-4 ${f.status === 'Active' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="mb-1 text-xs text-gray-600">{f.facility_code} • {f.facility_type}{f.parent_facility ? ` • under ${f.parent_facility}` : ''}</div>
                                    <h4 className="text-sm font-bold text-gray-900">{f.facility_name}</h4>
                                    <p className="text-xs text-gray-600">{f.city}{f.province ? `, ${f.province}` : ''} · {f.manager} · {f.contact}</p>
                                    <p className="mt-1 text-xs text-gray-500">Covers: {cov(f).join(', ') || '—'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${f.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{f.status}</span>
                                    <button onClick={() => openEdit(f)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && setEditing(null)}>
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{editing === 'new' ? 'Add facility' : 'Edit facility'}</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">{field('facility_name', 'Facility name')}</div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">Type</label>
                                <select className={input} value={form.facility_type} onChange={(e) => setForm({ ...form, facility_type: e.target.value })}>
                                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                                </select>
                                {errors.facility_type && <p className="mt-1 text-xs text-red-600">{errors.facility_type}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">Parent facility</label>
                                <select className={input} value={form.parent_facility_id} onChange={(e) => setForm({ ...form, parent_facility_id: e.target.value })} disabled={form.facility_type === 'Main Hub'}>
                                    <option value="">None</option>
                                    {facilities.filter((f) => editing === 'new' || f.id !== (editing as Facility).id).map((f) => <option key={f.id} value={f.id}>{f.facility_name}</option>)}
                                </select>
                                {errors.parent_facility_id && <p className="mt-1 text-xs text-red-600">{errors.parent_facility_id}</p>}
                            </div>
                            {field('region', 'Region')}
                            {field('province', 'Province')}
                            {field('city', 'City')}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">Status</label>
                                <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">{field('address', 'Address')}</div>
                            {field('manager_name', 'Manager')}
                            {field('contact_number', 'Contact (09XXXXXXXXX)')}
                            <div className="sm:col-span-2">{field('coverage', 'Coverage cities (comma separated)')}</div>
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button onClick={() => setEditing(null)} disabled={busy} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
                            <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-[#2B2249] py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
