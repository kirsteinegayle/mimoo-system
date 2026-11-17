import { useEffect, useState } from 'react';

/** Courier company profile: contact, service areas (drive Sort & Assign eligibility), pickup and delivery-time info. */
interface Data {
    company_name: string | null; trade_name: string | null; business_email: string | null; company_contact_number: string | null;
    company_website: string | null; business_address: string | null; service_areas: string[]; cities_served: string[]; provinces_served: string[];
    pickup_available: string | null; estimated_delivery_time: string | null; status: string | null; sec_registration_no: string | null;
}

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30';
const toList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export default function CompanySettingsForm() {
    const [d, setD] = useState<Data | null>(null);
    const [areas, setAreas] = useState('');
    const [cities, setCities] = useState('');
    const [provinces, setProvinces] = useState('');
    const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        fetch('/courier/company-settings', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((j) => {
                setD(j.data);
                setAreas((j.data.service_areas ?? []).join(', '));
                setCities((j.data.cities_served ?? []).join(', '));
                setProvinces((j.data.provinces_served ?? []).join(', '));
            });
    }, []);

    if (!d) return <p className="p-8 text-center text-sm text-gray-500">Loading…</p>;

    const set = (k: keyof Data, v: string) => setD({ ...d, [k]: v });
    const f = (k: keyof Data, label: string, extra: Record<string, unknown> = {}) => (
        <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">{label}</label>
            <input className={input} value={(d[k] as string) ?? ''} onChange={(e) => set(k, e.target.value)} {...extra} />
            {errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>}
        </div>
    );

    const save = async () => {
        setBusy(true);
        setErrors({});
        try {
            const r = await fetch('/courier/company-settings', {
                method: 'POST', credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({
                    trade_name: d.trade_name, business_email: d.business_email, company_contact_number: d.company_contact_number, company_website: d.company_website || null,
                    business_address: d.business_address, pickup_available: d.pickup_available || null, estimated_delivery_time: d.estimated_delivery_time,
                    service_areas: toList(areas), cities_served: toList(cities), provinces_served: toList(provinces),
                }),
            });
            const j = await r.json().catch(() => ({}));
            setMsg({ text: j.message || (r.ok ? 'Saved.' : 'Could not save.'), bad: !r.ok });
            if (!r.ok) setErrors(Object.fromEntries(Object.entries(j.errors ?? {}).map(([k, v]) => [k, String((v as string[])[0])])));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-1 text-lg font-bold text-gray-900">{d.company_name ?? 'Company'}</h2>
                <p className="mb-4 text-xs text-gray-500">Registered company name{d.sec_registration_no ? ` · SEC ${d.sec_registration_no}` : ''}. These can only be changed through registration review. Status: <strong className="capitalize">{d.status}</strong></p>
                <div className="grid gap-4 sm:grid-cols-2">
                    {f('trade_name', 'Trade name')}
                    {f('business_email', 'Business email', { type: 'email' })}
                    {f('company_contact_number', 'Company contact number (09XXXXXXXXX)')}
                    {f('company_website', 'Website', { placeholder: 'https://' })}
                    <div className="sm:col-span-2">{f('business_address', 'Business address')}</div>
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-1 text-lg font-bold text-gray-900">Where you deliver</h2>
                <p className="mb-4 text-xs text-gray-500">Sort &amp; Assign only offers you parcels whose delivery barangay, city or province matches these lists (barangay is the strongest match).</p>
                <div className="space-y-3">
                    <div><label className="mb-1 block text-xs font-semibold text-gray-600">Barangays / areas (comma separated)</label><textarea className={input} rows={2} value={areas} onChange={(e) => setAreas(e.target.value)} /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-600">Cities / municipalities</label><textarea className={input} rows={2} value={cities} onChange={(e) => setCities(e.target.value)} /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-600">Provinces</label><input className={input} value={provinces} onChange={(e) => setProvinces(e.target.value)} /></div>
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Service</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Pickup available</label>
                        <select className={input} value={d.pickup_available ?? ''} onChange={(e) => set('pickup_available', e.target.value)}>
                            <option value="">Not set</option><option value="yes">Yes</option><option value="no">No</option>
                        </select>
                    </div>
                    {f('estimated_delivery_time', 'Estimated delivery time', { placeholder: 'e.g. 2-3 business days' })}
                </div>
            </section>

            {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.bad ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}
            <button onClick={save} disabled={busy} className="rounded-lg bg-[#2B2249] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3B1F6B] disabled:opacity-60">{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
    );
}
