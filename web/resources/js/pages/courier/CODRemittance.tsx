import { Head } from '@inertiajs/react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import CourierLayout from './CourierLayout';
import { csrfHeaders } from '@/components/notification-bell';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
        };
    };
    company: {
        name: string;
        contact_person: string;
    };
}

interface Remittance {
    id: number;
    reference: string;
    rider_name: string | null;
    amount: number;
    parcels_count: number;
    status: string;
    remitted_at: string | null;
    confirmed_at: string | null;
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CODRemittance({ auth, company }: Props) {
    const [rows, setRows] = useState<Remittance[]>([]);
    const [awaiting, setAwaiting] = useState({ amount: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/courier/cod-remittances', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.message || 'Could not load remittances.');
            setRows(json.data ?? []);
            setAwaiting({ amount: json.meta?.awaiting_amount ?? 0, count: json.meta?.awaiting_count ?? 0 });
        } catch (e: any) {
            setMsg({ text: e?.message || 'Could not load remittances.', ok: false });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function confirm(r: Remittance) {
        if (!window.confirm(`Confirm that you received ${peso(r.amount)} (${r.reference})?`)) return;
        setBusyId(r.id);
        setMsg(null);
        try {
            const res = await fetch(`/courier/cod-remittances/${r.id}/confirm`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...csrfHeaders() },
            });
            const json = await res.json().catch(() => ({}));
            setMsg({ text: json.message || (res.ok ? 'Confirmed.' : 'Could not confirm.'), ok: res.ok });
            load();
        } catch {
            setMsg({ text: 'Could not confirm. Please try again.', ok: false });
        } finally {
            setBusyId(null);
        }
    }

    return (
        <CourierLayout auth={auth} company={company} activeTab="cod-remittance" pageTitle="COD & Remittance">
            <Head title="COD & Remittance" />

            <div className="max-w-5xl mx-auto space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Awaiting confirmation</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{peso(awaiting.amount)}</p>
                        <p className="text-xs text-gray-500">{awaiting.count} remittance{awaiting.count === 1 ? '' : 's'} from riders</p>
                    </div>
                </div>

                {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {loading ? (
                        <p className="p-10 text-center text-sm text-gray-500">Loading...</p>
                    ) : rows.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500">No COD remittances yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3">Rider</th>
                                    <th className="px-4 py-3">Parcels</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{r.reference}</td>
                                        <td className="px-4 py-3 text-gray-700">{r.rider_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-700">{r.parcels_count}</td>
                                        <td className="px-4 py-3 text-gray-900">{peso(r.amount)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${r.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {r.status === 'confirmed' ? 'Confirmed' : 'Awaiting confirmation'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {r.status === 'submitted' && (
                                                <button
                                                    type="button"
                                                    onClick={() => confirm(r)}
                                                    disabled={busyId === r.id}
                                                    className="rounded-lg bg-[#3B1F6B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2B2249] disabled:opacity-50"
                                                >
                                                    {busyId === r.id ? 'Confirming...' : 'Confirm received'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </CourierLayout>
    );
}

CODRemittance.layout = (page: ReactNode) => page;
