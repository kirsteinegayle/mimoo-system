import AdminShell from '@/layouts/admin/admin-shell';
import { csrfHeaders, timeAgo } from '@/components/notification-bell';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCheck, CheckSquare, Loader2, RotateCcw, Truck, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Admin team notifications (admin_notifications). The feed endpoint first adds
// any new events (applications, products to approve, reports, escalated returns).

interface Row {
    id: number;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string | null;
}

interface Meta {
    current_page: number;
    last_page: number;
    total: number;
    unread: number;
}

const TYPE: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
    seller_application: { icon: UserCheck, cls: 'bg-violet-100 text-violet-700', label: 'Seller' },
    logistics_application: { icon: Truck, cls: 'bg-sky-100 text-sky-700', label: 'Logistics' },
    product_approval: { icon: CheckSquare, cls: 'bg-amber-100 text-amber-800', label: 'Product' },
    product_report: { icon: AlertTriangle, cls: 'bg-rose-100 text-rose-700', label: 'Report' },
    return_escalated: { icon: RotateCcw, cls: 'bg-orange-100 text-orange-800', label: 'Return' },
};

async function post(url: string) {
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...csrfHeaders() },
    });
    return res.ok;
}

export default function AdminNotifications() {
    const [rows, setRows] = useState<Row[]>([]);
    const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0, unread: 0 });
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/admin/notifications/feed?filter=${filter}&page=${page}`, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.message || 'Could not load notifications.');
            setRows(json.data ?? []);
            setMeta(json.meta ?? { current_page: 1, last_page: 1, total: 0, unread: 0 });
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load notifications.');
        } finally {
            setLoading(false);
        }
    }, [filter, page]);

    useEffect(() => {
        load();
    }, [load]);

    const changed = () => window.dispatchEvent(new Event('admin-notifications-changed'));

    async function open(n: Row) {
        if (!n.read_at) {
            await post(`/admin/notifications/${n.id}/read`);
            changed();
        }
        if (n.link) router.visit(n.link);
        else load();
    }

    async function markOne(n: Row) {
        if (await post(`/admin/notifications/${n.id}/read`)) {
            changed();
            load();
        }
    }

    async function markAll() {
        if (await post('/admin/notifications/read-all')) {
            changed();
            load();
        }
    }

    return (
        <AdminShell active="notifications">
            <Head title="Notifications - Admin" />

            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Applications, products to approve, reports and escalated returns
                        {meta.unread > 0 && <span className="ml-2 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">{meta.unread} unread</span>}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={markAll}
                    disabled={meta.unread === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckCheck className="h-4 w-4" /> Mark all as read
                </button>
            </div>

            <div className="mb-4 flex gap-2">
                {(['all', 'unread'] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => {
                            setFilter(f);
                            setPage(1);
                        }}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                            filter === f ? 'bg-[#3B1F6B] text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {loading ? (
                    <div className="flex justify-center py-16 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="py-16 text-center text-sm text-red-700">
                        {error}{' '}
                        <button type="button" onClick={load} className="font-semibold underline">
                            Try again
                        </button>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-16 text-center">
                        <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-sm font-medium text-gray-700">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                        <p className="mt-1 text-xs text-gray-500">New applications, reports and escalations will appear here.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {rows.map((n) => {
                            const t = TYPE[n.type] ?? { icon: Bell, cls: 'bg-gray-100 text-gray-700', label: 'Update' };
                            const Icon = t.icon;
                            return (
                                <li key={n.id} className={`flex items-start gap-4 px-5 py-4 ${n.read_at ? '' : 'bg-violet-50/60'}`}>
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.cls}`}>
                                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                                    </span>
                                    <button type="button" onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`text-sm ${n.read_at ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>{n.title}</p>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">{t.label}</span>
                                            {!n.read_at && <span className="h-2 w-2 rounded-full bg-purple-600" aria-label="Unread" />}
                                        </div>
                                        {n.body && <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>}
                                        <p className="mt-1 text-xs text-gray-500">{timeAgo(n.created_at)}</p>
                                    </button>
                                    {!n.read_at && (
                                        <button
                                            type="button"
                                            onClick={() => markOne(n)}
                                            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[#3B1F6B] hover:bg-violet-100"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {meta.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">{meta.total} total</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-2 text-sm text-gray-700">
                            Page {page} of {meta.last_page}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= meta.last_page}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
