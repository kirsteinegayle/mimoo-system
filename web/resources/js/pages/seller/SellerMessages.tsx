import { useState } from 'react';
import { Head } from '@inertiajs/react';
import SellerShell from '@/layouts/seller/seller-shell';
import { ChatInbox, type ChatThreadView } from '@/components/chat/chat-inbox';
import { RoleInbox } from '@/components/chat/role-inbox';

// Seller inbox for buyer <-> seller chat (same threads the buyer sees on web and mobile).

const mapThread = (t: any): ChatThreadView => ({
    id: t.id,
    name: t.buyer_name || 'Buyer',
    photoUrl: null,
    product: t.product ?? null,
    lastMessage: t.last_message ?? null,
    lastMessageAt: t.last_message_at ?? null,
    unread: Number(t.unread_count ?? 0),
});

const threadName = (t: any) => t?.buyer_name || 'Buyer';
const messagesUrl = (id: number) => `/seller/chat/${id}/messages`;

function initialThread(): number | null {
    if (typeof window === 'undefined') return null;
    const v = new URLSearchParams(window.location.search).get('thread');
    return v && /^\d+$/.test(v) ? Number(v) : null;
}

export default function SellerMessages() {
    const [unread, setUnread] = useState(0);
    const [threadId] = useState(initialThread);
    const [tab, setTab] = useState<'customers' | 'team'>(() =>
        typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'team' ? 'team' : 'customers');
    const [teamUnread, setTeamUnread] = useState(0);

    return (
        <>
            <Head title="Messages - Seller Dashboard" />
            <SellerShell active="messages">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Messages
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Communicate with your customers
                            {unread > 0 && (
                                <span className="ml-2 rounded-full bg-[#3B1F6B] px-2 py-0.5 text-xs font-semibold text-white">
                                    {unread} unread
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="mb-4 flex gap-6 border-b border-gray-200">
                        {([['customers', 'Customers', unread], ['team', 'Admin & couriers', teamUnread]] as const).map(([key, label, n]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition ${
                                    tab === key ? 'border-[#3B1F6B] text-[#3B1F6B]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {label}
                                {n > 0 && <span className="ml-1.5 rounded-full bg-[#3B1F6B] px-1.5 py-0.5 text-[10px] text-white">{n}</span>}
                            </button>
                        ))}
                    </div>

                    {tab === 'customers' ? (
                    <ChatInbox
                        threadsUrl="/seller/chat/threads"
                        messagesUrl={messagesUrl}
                        sendUrl={messagesUrl}
                        mapThread={mapThread}
                        threadName={threadName}
                        initialThreadId={threadId}
                        onUnreadTotal={setUnread}
                        accent="#3B1F6B"
                        emptyTitle="No conversations yet"
                        emptyHint="Customer messages will appear here"
                    />
                    ) : (
                        <RoleInbox base="/messaging" onUnreadTotal={setTeamUnread} emptyHint="Messages from the admin team and couriers appear here" />
                    )}
                </div>
            </SellerShell>
        </>
    );
}
