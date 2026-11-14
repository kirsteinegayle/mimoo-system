import AdminShell from '@/layouts/admin/admin-shell';
import { RoleInbox } from '@/components/chat/role-inbox';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

// Admin team inbox: sellers, buyers, courier companies and logistics staff.
export default function MessagesPage() {
    const [unread, setUnread] = useState(0);

    return (
        <AdminShell active="messages">
            <Head title="Messages - Admin" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Talk to sellers, buyers, courier companies and logistics staff
                    {unread > 0 && <span className="ml-2 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">{unread} unread</span>}
                </p>
            </div>

            <RoleInbox base="/admin/messaging" accent="#7C3AED" onUnreadTotal={setUnread} emptyHint="Choose someone above to start a conversation" />
        </AdminShell>
    );
}
