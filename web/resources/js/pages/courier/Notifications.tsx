import { Head, router } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import CourierLayout from './CourierLayout';
import { csrfHeaders, notificationHref, timeAgo, type BuyerNotificationItem } from '@/components/notification-bell';

interface Meta {
    unread_count: number;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    auth: { user: { id: number; name: string; email: string; account_type: string } };
    company: { name: string; contact_person: string };
    notifications: { data: BuyerNotificationItem[]; meta: Meta };
}

const BASE = '/courier/notifications';

function postJson(url: string) {
    return fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...csrfHeaders() },
        credentials: 'same-origin',
    });
}

export default function Notifications({ auth, company, notifications }: Props) {
    const meta = notifications.meta;
    const [items, setItems] = useState<BuyerNotificationItem[]>(notifications.data);
    const [unread, setUnread] = useState<number>(meta.unread_count);

    useEffect(() => {
        setItems(notifications.data);
        setUnread(notifications.meta.unread_count);
    }, [notifications]);

    async function openItem(n: BuyerNotificationItem) {
        if (!n.is_read) {
            setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
            setUnread((u) => Math.max(0, u - 1));
            try {
                await postJson(`${BASE}/${n.id}/read`);
            } catch {
                // corrected on next load
            }
        }
        const href = notificationHref(n);
        if (href) router.visit(href);
    }

    async function markAll() {
        setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
        setUnread(0);
        try {
            await postJson(`${BASE}/read-all`);
        } catch {
            // ignore
        }
    }

    const goTo = (page: number) => router.get(BASE, { page });

    return (
        <CourierLayout auth={auth} company={company} activeTab="notifications" pageTitle="Notifications">
            <Head title="Notifications" />

            <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        <span className="font-semibold text-[#3B1F6B]">{unread}</span> unread · {meta.total} total
                    </p>
                    <button
                        type="button"
                        onClick={markAll}
                        disabled={unread === 0}
                        className="text-sm font-semibold text-[#3B1F6B] hover:underline disabled:cursor-default disabled:text-gray-400 disabled:no-underline"
                    >
                        Mark all as read
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                        <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                ) : (
                    <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        {items.map((n) => (
                            <li key={n.id} className="border-b border-gray-100 last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => openItem(n)}
                                    className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-gray-50 ${n.is_read ? '' : 'bg-violet-50'}`}
                                >
                                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-violet-600'}`} />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-3">
                                            <span className={`text-sm ${n.is_read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>{n.title}</span>
                                            <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
                                        </span>
                                        <span className="mt-0.5 block break-words text-[13px] text-gray-600">{n.body}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {meta.last_page > 1 && (
                    <nav className="mt-5 flex items-center justify-center gap-3" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => goTo(meta.current_page - 1)}
                            disabled={meta.current_page <= 1}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#3B1F6B] hover:bg-violet-50 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {meta.current_page} of {meta.last_page}
                        </span>
                        <button
                            type="button"
                            onClick={() => goTo(meta.current_page + 1)}
                            disabled={meta.current_page >= meta.last_page}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#3B1F6B] hover:bg-violet-50 disabled:opacity-40"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </nav>
                )}
            </div>
        </CourierLayout>
    );
}

Notifications.layout = (page: ReactNode) => page;
