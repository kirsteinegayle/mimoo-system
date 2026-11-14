import AdminShell from '@/layouts/admin/admin-shell';
import { csrfHeaders } from '@/components/notification-bell';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Eye, RotateCcw, XCircle } from 'lucide-react';

interface ReturnRow {
    id: number;
    order_id: number;
    order_number: string;
    buyer_name: string | null;
    seller_names: string[];
    reason: string;
    description: string;
    images: string[];
    items: { name: string; quantity: number; unit_price: number }[];
    order_total: number | null;
    status: string;
    seller_response: string | null;
    admin_response: string | null;
    responded_at: string | null;
    escalated_at: string | null;
    can_decide: boolean;
    can_refund: boolean;
    payment_method: string | null;
    refund: { status: string; amount: number; method: string; reference: string | null; failure_reason: string | null; refunded_at: string | null } | null;
    created_at: string;
}

interface Meta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type Filter = 'escalated' | 'approved' | 'rejected' | 'refund' | 'all';

const NOTE_MAX = 500;

const statusClass = (s: string) =>
    s === 'escalated'
        ? 'bg-yellow-50 text-yellow-700'
        : s === 'approved' || s === 'refunded'
        ? 'bg-green-50 text-green-700'
        : 'bg-red-50 text-red-700';

export default function ReturnsPage() {
    const [rows, setRows] = useState<ReturnRow[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<Filter>('escalated');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ReturnRow | null>(null);
    const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundRef, setRefundRef] = useState('');
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: filter, page: String(page) });
            if (search.trim()) params.set('search', search.trim());
            const res = await fetch(`/admin/returns/feed?${params}`, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.status === 403) {
                alert('Session expired. Please refresh the page.');
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setRows(json.data ?? []);
            setCounts(json.counts ?? {});
            setMeta(json.meta ?? meta);
        } catch (e) {
            console.error('Failed to load returns:', e);
            setRows([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, page, search]);

    useEffect(() => {
        const t = setTimeout(load, search ? 300 : 0);
        return () => clearTimeout(t);
    }, [load, search]);

    const openModal = (r: ReturnRow) => {
        setRefundAmount(r.refund?.amount ? String(r.refund.amount) : r.order_total != null ? String(r.order_total) : '');
        setRefundRef('');
        setSelected(r);
        setMode('view');
        setNote('');
        setError(null);
    };

    const decide = async (action: 'approve' | 'reject') => {
        if (!selected) return;
        if (action === 'reject' && !note.trim()) {
            setError('A note is required when rejecting.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/admin/returns/${selected.id}/decision`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...csrfHeaders(),
                },
                body: JSON.stringify({ action, note }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.message || json.error || 'Could not save the decision.');
                if (res.status === 422) load();
                return;
            }
            setSelected(null);
            load();
        } catch {
            setError('Could not save the decision. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const markRefund = async () => {
        if (!selected) return;
        if (!refundRef.trim()) {
            setError('Enter the reference (receipt or transfer number).');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/admin/returns/${selected.id}/refund`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...csrfHeaders(),
                },
                body: JSON.stringify({ amount: refundAmount, reference: refundRef, idempotency_key: `return-${selected.id}` }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.message || json.error || 'Could not record the refund.');
                load();
                return;
            }
            setSelected(null);
            load();
        } catch {
            setError('Could not record the refund. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const filters: { key: Filter; label: string }[] = [
        { key: 'escalated', label: 'Escalated' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
        { key: 'refund', label: 'Refunds' },
        { key: 'all', label: 'All' },
    ];

    return (
        <AdminShell active="returns">
            <Head title="Escalated Returns - Admin" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Escalated Returns</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Return requests the buyer escalated after the seller rejected them. Approving marks the request as
                    approved (status only; no payment is sent from here).
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Awaiting Decision', value: counts.escalated ?? 0, icon: AlertTriangle, bg: 'bg-orange-50', fg: 'text-orange-600' },
                    { label: 'Approved', value: counts.approved ?? 0, icon: CheckCircle, bg: 'bg-green-50', fg: 'text-green-600' },
                    { label: 'Rejected', value: counts.rejected ?? 0, icon: XCircle, bg: 'bg-red-50', fg: 'text-red-600' },
                ].map(({ label, value, icon: Icon, bg, fg }) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                                <Icon className={`h-5 w-5 ${fg}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{value}</p>
                                <p className="text-xs text-gray-500">{label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
                {filters.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => {
                            setFilter(key);
                            setPage(1);
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filter === key
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        {label}
                    </button>
                ))}
                <input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search order number or reason"
                    className="ml-auto w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 sm:w-64"
                />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <RotateCcw className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No return requests found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Order', 'Reason', 'Buyer / Seller', 'Status', 'Escalated', ''].map((h, i) => (
                                        <th
                                            key={i}
                                            className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                                        >
                                            {h || 'Actions'}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rows.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{r.order_number}</p>
                                            <p className="text-xs text-gray-500">Request #{r.id}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                                <AlertTriangle className="h-3 w-3" />
                                                {r.reason}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900">{r.buyer_name ?? 'Buyer'}</p>
                                            <p className="text-xs text-gray-500">{r.seller_names.join(', ') || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {r.escalated_at ? new Date(r.escalated_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openModal(r)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {meta.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {rows.length} of {meta.total} requests
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="flex items-center px-3 text-sm text-gray-700">
                            Page {page} of {meta.last_page}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === meta.last_page}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <RotateCcw className="h-6 w-6 text-purple-600" />
                                        <h2 className="text-xl font-bold text-gray-900">Return Request #{selected.id}</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Order {selected.order_number}</p>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="rounded-lg bg-gray-50 p-4 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClass(selected.status)}`}>
                                    {selected.status}
                                </span>
                            </div>

                            <div className="rounded-lg border-2 border-purple-100 bg-purple-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-purple-900 uppercase tracking-wide">Order Items</h3>
                                <ul className="space-y-1 text-sm text-gray-800">
                                    {selected.items.map((i, idx) => (
                                        <li key={idx} className="flex justify-between gap-3">
                                            <span>{i.name} × {i.quantity}</span>
                                            <span>₱{(i.unit_price * i.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-3 pt-3 border-t border-purple-200 text-sm text-gray-700">
                                    <span className="font-medium">Buyer:</span> {selected.buyer_name ?? 'Buyer'} ·{' '}
                                    <span className="font-medium">Seller:</span> {selected.seller_names.join(', ') || '—'}
                                </p>
                            </div>

                            <div className="rounded-lg border-2 border-red-100 bg-red-50 p-4 space-y-3">
                                <h3 className="text-sm font-semibold text-red-900 uppercase tracking-wide">Buyer's Request</h3>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase mb-1">Reason</p>
                                    <p className="text-sm font-semibold text-gray-900">{selected.reason}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase mb-1">Description</p>
                                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                                </div>
                                {selected.images.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Photos</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selected.images.map((src) => (
                                                <a key={src} href={src} target="_blank" rel="noreferrer">
                                                    <img src={src} alt="Return evidence" className="h-24 w-24 rounded-lg object-cover border border-gray-200" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selected.seller_response && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-600 uppercase mb-1">Seller Note</p>
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selected.seller_response}</p>
                                </div>
                            )}
                            {selected.admin_response && (
                                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                                    <p className="text-xs font-medium text-purple-800 uppercase mb-1">Admin Note</p>
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selected.admin_response}</p>
                                </div>
                            )}

                            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                            {(selected.refund || selected.can_refund) && (
                                <div className="rounded-lg border-2 border-green-100 bg-green-50 p-4">
                                    <h3 className="mb-2 text-sm font-semibold text-green-900 uppercase tracking-wide">Refund</h3>
                                    {selected.refund && (
                                        <p className="mb-3 text-sm text-gray-800">
                                            Status: <span className="font-semibold">{selected.refund.status}</span> · ₱{selected.refund.amount.toFixed(2)} via {selected.refund.method}
                                            {selected.refund.reference ? ` · Ref ${selected.refund.reference}` : ''}
                                            {selected.refund.failure_reason ? <span className="block text-red-700">Last attempt failed: {selected.refund.failure_reason}</span> : null}
                                        </p>
                                    )}
                                    {selected.can_refund ? (
                                        <div className="space-y-3">
                                            <p className="text-xs text-gray-600">
                                                Send the money yourself ({selected.payment_method ?? 'cod'}), then record it here. Nothing is charged or sent from this page.
                                            </p>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={refundAmount}
                                                    onChange={(e) => setRefundAmount(e.target.value)}
                                                    placeholder="Amount"
                                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                                <input
                                                    value={refundRef}
                                                    onChange={(e) => setRefundRef(e.target.value.slice(0, 100))}
                                                    placeholder="Reference (receipt / transfer no.)"
                                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                            </div>
                                            <button
                                                onClick={markRefund}
                                                disabled={busy || !refundRef.trim() || !refundAmount}
                                                className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {busy ? 'Saving...' : selected.refund?.status === 'failed' ? 'Retry: mark refund processed' : 'Mark refund processed'}
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {selected.can_decide && mode === 'view' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setMode('approve')}
                                        className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                                    >
                                        Approve Return
                                    </button>
                                    <button
                                        onClick={() => setMode('reject')}
                                        className="flex-1 rounded-lg border-2 border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Reject Return
                                    </button>
                                </div>
                            )}

                            {selected.can_decide && mode !== 'view' && (
                                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                                    <h4 className="font-bold text-gray-900 mb-2">
                                        {mode === 'approve' ? 'Approve Return' : 'Reject Return'}
                                    </h4>
                                    <p className="text-sm text-gray-700 mb-3">
                                        {mode === 'approve'
                                            ? 'The request will be marked approved and the buyer will be notified. This decision is final and cannot be changed.'
                                            : 'The request will be marked rejected and the buyer will be notified. A note is required. This decision is final.'}
                                    </p>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                                        placeholder={mode === 'reject' ? 'Note (required)' : 'Note (optional)'}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none mb-1"
                                    />
                                    <p className="mb-3 text-right text-xs text-gray-400">{note.length}/{NOTE_MAX}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => decide(mode)}
                                            disabled={busy || (mode === 'reject' && !note.trim())}
                                            className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                mode === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                                            }`}
                                        >
                                            {busy ? 'Saving...' : mode === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setMode('view');
                                                setNote('');
                                                setError(null);
                                            }}
                                            disabled={busy}
                                            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
