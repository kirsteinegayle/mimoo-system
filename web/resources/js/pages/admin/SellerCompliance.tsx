import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, EyeOff, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppModal } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';
import { StatusBadge } from './UserAccounts';

interface Row {
    id: number;
    name: string;
    category: string | null;
    price: number;
    status: string;
    hidden: boolean;
    hidden_note: string | null;
    seller_id: number;
    seller: string;
    seller_status: string | null;
    registered_category: string | null;
    warnings: number;
    category_mismatch: boolean;
    keywords: string[];
}

interface Props {
    products: Row[];
    filters: { flag: string; seller_id: string | number; q: string };
    counts: { all: number; category: number; keyword: number; hidden: number };
    pagination: { current_page: number; last_page: number; total: number };
    sellers: { id: number; name: string }[];
    keywordCount: number;
}

type Act = { kind: 'warn' | 'hide' | 'remove' | 'suspend'; row: Row };

const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SellerCompliance({ products, filters, counts, pagination, sellers, keywordCount }: Props) {
    const [f, setF] = useState({ ...filters, seller_id: String(filters.seller_id ?? '') });
    const [act, setAct] = useState<Act | null>(null);
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    const go = (n: typeof f, page = 1) => router.get('/admin/seller-compliance', { ...n, page }, { preserveState: true, preserveScroll: true, replace: true });
    const input = 'h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30';

    function open(kind: Act['kind'], row: Row) {
        setReason('');
        setErrors({});
        setAct({ kind, row });
    }

    function submit() {
        if (!act) return;
        const { kind, row } = act;
        const done = {
            onSuccess: () => { toast.success(kind === 'warn' ? 'Warning issued.' : kind === 'hide' ? 'Product hidden.' : kind === 'remove' ? 'Product removed.' : 'Seller suspended.'); setAct(null); },
            onError: (e: Record<string, string>) => setErrors(e),
            onFinish: () => setBusy(false),
            preserveScroll: true,
        };
        setBusy(true);
        if (kind === 'warn') router.post(`/admin/seller-compliance/sellers/${row.seller_id}/warn`, { reason: reason.trim(), product_id: row.id }, done);
        else if (kind === 'hide') router.post(`/admin/seller-compliance/products/${row.id}/hide`, { reason: reason.trim() }, done);
        else if (kind === 'remove') router.delete(`/admin/seller-compliance/products/${row.id}`, { data: { reason: reason.trim() }, ...done });
        // Suspend reuses the one suspend function in User Accounts.
        else router.post(`/admin/user-accounts/${row.seller_id}/status`, { action: 'suspend', reason: reason.trim() }, done);
    }

    const unhide = (row: Row) =>
        router.post(`/admin/seller-compliance/products/${row.id}/unhide`, {}, { preserveScroll: true, onSuccess: () => toast.success('Product is visible again.') });

    const titles: Record<Act['kind'], [string, string, 'primary' | 'danger']> = {
        warn: ['Issue a warning', 'Warn', 'primary'],
        hide: ['Hide this product', 'Hide', 'primary'],
        remove: ['Remove this product', 'Remove', 'danger'],
        suspend: ['Suspend this seller', 'Suspend', 'danger'],
    };

    return (
        <>
            <Head title="Seller Compliance" />
            <AdminShell active="seller-compliance">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Seller Compliance</h1>
                        <p className="mt-1 text-sm text-gray-500">Products are flagged when their category does not match the seller's registered category, or when they contain a prohibited keyword.</p>
                    </div>
                    <Link href="/admin/platform-settings" className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        Prohibited keywords ({keywordCount})
                    </Link>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        ['Products checked', counts.all],
                        ['Category mismatch', counts.category],
                        ['Prohibited keyword', counts.keyword],
                        ['Hidden by admin', counts.hidden],
                    ].map(([label, value]) => (
                        <div key={label as string} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
                            <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <select className={input} value={f.flag} onChange={(e) => { const n = { ...f, flag: e.target.value }; setF(n); go(n); }}>
                        <option value="flagged">Flagged only</option>
                        <option value="category">Category mismatch</option>
                        <option value="keyword">Prohibited keyword</option>
                        <option value="hidden">Hidden by admin</option>
                        <option value="all">All products</option>
                    </select>
                    <select className={input} value={f.seller_id} onChange={(e) => { const n = { ...f, seller_id: e.target.value }; setF(n); go(n); }}>
                        <option value="">All sellers</option>
                        {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <form className="relative" onSubmit={(e) => { e.preventDefault(); go(f); }}>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input className={`${input} w-64 pl-9`} placeholder="Search product or category" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
                    </form>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Seller</th>
                                <th className="px-4 py-3">Categories</th>
                                <th className="px-4 py-3">Flags</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Nothing to review with these filters.</td></tr>}
                            {products.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100 align-top">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">{p.name}</div>
                                        <div className="text-xs text-gray-500">{peso(p.price)}{p.hidden && <span className="ml-2 inline-flex items-center gap-1 text-amber-600"><EyeOff className="h-3 w-3" /> hidden</span>}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-gray-800">{p.seller}</div>
                                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                                            {p.seller_status && <StatusBadge status={p.seller_status === 'approved' ? 'active' : p.seller_status} />}
                                            {p.warnings > 0 && <span className="text-amber-600">{p.warnings} warning{p.warnings > 1 ? 's' : ''}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        <div>Product: <span className="font-medium text-gray-800">{p.category ?? '—'}</span></div>
                                        <div>Registered: <span className="font-medium text-gray-800">{p.registered_category ?? '—'}</span></div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {p.category_mismatch && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"><AlertTriangle className="h-3 w-3" /> Category mismatch</span>}
                                            {p.keywords.map((k) => <span key={k} className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">“{k}”</span>)}
                                            {!p.category_mismatch && p.keywords.length === 0 && <span className="text-xs text-gray-400">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap justify-end gap-1.5">
                                            {p.hidden
                                                ? <button onClick={() => unhide(p)} className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Unhide</button>
                                                : <button onClick={() => open('hide', p)} className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Hide</button>}
                                            <button onClick={() => open('remove', p)} className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Remove</button>
                                            <button onClick={() => open('warn', p)} className="rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">Warn seller</button>
                                            {p.seller_status === 'approved' && <button onClick={() => open('suspend', p)} className="rounded-md bg-[#3B1F6B] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2E1850]">Suspend seller</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Page {pagination.current_page} of {pagination.last_page} · {pagination.total} products</span>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page <= 1} onClick={() => go(f, pagination.current_page - 1)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
                            <button disabled={pagination.current_page >= pagination.last_page} onClick={() => go(f, pagination.current_page + 1)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}

                <AppModal
                    open={!!act}
                    tone={act ? titles[act.kind][2] : 'primary'}
                    title={act ? `${titles[act.kind][0]}?` : ''}
                    confirmLabel={act ? titles[act.kind][1] : 'Confirm'}
                    busy={busy}
                    onConfirm={submit}
                    onCancel={() => !busy && setAct(null)}
                >
                    {act && <span className="font-semibold">{act.kind === 'suspend' || act.kind === 'warn' ? act.row.seller : act.row.name}</span>}
                    <div className="mt-3 text-left">
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Reason (the seller is notified) *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.reason || errors.action ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30`}
                        />
                        {(errors.reason || errors.action) && <p className="mt-1 text-xs text-red-600">{errors.reason || errors.action}</p>}
                    </div>
                </AppModal>
            </AdminShell>
        </>
    );
}
