import { confirmDialog } from '@/components/app-modal';
import { Head, router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import AdminShell from '@/layouts/admin/admin-shell';

interface Applicant {
    id: number;
    name: string;
    contact: string;
    email: string;
    created_at: string;
}

interface Props {
    sellers: Applicant[];
    logistics: Applicant[];
}

type Tab = 'logistics' | 'sellers';

export default function PendingApproval({ sellers, logistics }: Props) {
    const [tab, setTab] = useState<Tab>('logistics');
    const [busy, setBusy] = useState<number | null>(null);

    const rows = tab === 'logistics' ? logistics : sellers;
    const base = tab === 'logistics' ? '/admin/logistics-approval' : '/admin/seller-approval';
    const label = tab === 'logistics' ? 'logistics' : 'seller';

    async function act(id: number, action: 'approve' | 'disapprove') {
        const verb = action === 'approve' ? 'approve' : 'reject';
        if (!(await confirmDialog(`Are you sure you want to ${verb} this ${label} application?`))) return;
        setBusy(id);
        router.post(`${base}/${id}/${action}`, {}, { preserveScroll: true, onFinish: () => setBusy(null) });
    }

    const tabs: { key: Tab; title: string; count: number }[] = [
        { key: 'logistics', title: 'Logistics Approval', count: logistics.length },
        { key: 'sellers', title: 'Seller Approval', count: sellers.length },
    ];

    return (
        <>
            <Head title="Pending Approval" />
            <AdminShell active="dashboard">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Pending Approval</h1>
                    <p className="mt-1 text-sm text-gray-500">Applicants waiting for your review.</p>
                </div>

                <div className="mb-4 flex gap-2 border-b border-gray-200">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                                tab === t.key ? 'border-[#3B1F6B] text-[#3B1F6B]' : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {t.title}
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{t.count}</span>
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">{tab === 'logistics' ? 'Company' : 'Business / Seller'}</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Applied</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                                        No pending {label} applications.
                                    </td>
                                </tr>
                            )}
                            {rows.map((r) => (
                                <tr key={r.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.contact}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                disabled={busy === r.id}
                                                onClick={() => act(r.id, 'approve')}
                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                <Check className="h-3.5 w-3.5" /> Approve
                                            </button>
                                            <button
                                                disabled={busy === r.id}
                                                onClick={() => act(r.id, 'disapprove')}
                                                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                <X className="h-3.5 w-3.5" /> Reject
                                            </button>
                                            <a
                                                href={base}
                                                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                            >
                                                Details
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminShell>
        </>
    );
}
