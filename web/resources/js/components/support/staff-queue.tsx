import { AttachmentList, AttachmentPicker, withFiles, type TicketFile } from '@/components/support/attachments';
import { useCallback, useEffect, useState } from 'react';

/**
 * Support queue for logistics / courier staff (tickets routed to them by category).
 * Backed by /staff-support/* (StaffSupportController): list, thread, reply, status flow.
 */

type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Row {
    id: number;
    user_role: string;
    user_name: string;
    user_email: string | null;
    category_label: string;
    order_number: string | null;
    subject: string;
    message: string;
    status: Status;
    updated_at: string | null;
}

interface Detail extends Row {
    attachments?: TicketFile[];
    replies: { id: number; from: string; body: string; attachments?: TicketFile[]; created_at: string | null }[];
}

const LABEL: Record<Status, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };
const COLOR: Record<Status, string> = {
    open: 'bg-amber-50 text-amber-700',
    in_progress: 'bg-blue-50 text-blue-700',
    resolved: 'bg-green-50 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
};

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

export default function StaffSupportQueue() {
    const [filter, setFilter] = useState<'all' | Status>('open');
    const [rows, setRows] = useState<Row[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<Detail | null>(null);
    const [reply, setReply] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/staff-support/feed?status=${filter}`, { headers, credentials: 'same-origin' });
            const j = await r.json();
            setRows(j.data ?? []);
            setCounts(j.counts ?? {});
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    const openTicket = async (id: number) => {
        setError('');
        const r = await fetch(`/staff-support/${id}`, { headers, credentials: 'same-origin' });
        if (r.ok) setOpen((await r.json()).data);
    };

    const post = async (url: string, body: object | FormData) => {
        setBusy(true);
        setError('');
        try {
            const r = await fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { ...headers, ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), 'X-CSRF-TOKEN': csrf() },
                body: body instanceof FormData ? body : JSON.stringify(body),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) {
                setError(j.message || 'Something went wrong.');
                return false;
            }
            return true;
        } finally {
            setBusy(false);
        }
    };

    const send = async () => {
        if (!open || !reply.trim()) return;
        if (await post(`/staff-support/${open.id}/reply`, withFiles({ body: reply }, files))) {
            setReply('');
            setFiles([]);
            await openTicket(open.id);
            load();
        }
    };

    const setStatus = async (status: Status) => {
        if (!open) return;
        if (await post(`/staff-support/${open.id}/status`, { status })) {
            await openTicket(open.id);
            load();
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex flex-wrap gap-2">
                {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${filter === s ? 'bg-[#2B2249] text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        {s === 'all' ? 'All' : LABEL[s]}
                        {s !== 'all' && <span className="ml-1.5 opacity-70">{counts[s] ?? 0}</span>}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {loading ? (
                    <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
                ) : rows.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-500">No tickets in this queue.</p>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            <tr>
                                <th className="px-5 py-3">Ticket</th>
                                <th className="px-5 py-3">From</th>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 text-sm">
                                        <div className="font-semibold text-gray-900">#{t.id} · {t.subject}</div>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-700">
                                        {t.user_name} <span className="text-xs capitalize text-gray-400">({t.user_role})</span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-700">{t.category_label}</td>
                                    <td className="px-5 py-3 text-sm text-gray-700">{t.order_number ?? '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${COLOR[t.status]}`}>{LABEL[t.status]}</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button onClick={() => openTicket(t.id)} className="text-sm font-semibold text-[#4B5EF9] hover:underline">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-gray-200 p-5">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">#{open.id} · {open.subject}</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    {open.user_name} ({open.user_role}) · {open.category_label}
                                    {open.order_number ? ` · ${open.order_number}` : ''}
                                </p>
                            </div>
                            <button onClick={() => setOpen(null)} className="text-xl leading-none text-gray-400 hover:text-gray-600" aria-label="Close">×</button>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto p-5">
                            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">{open.message}<AttachmentList files={open.attachments} /></div>
                            {open.replies.map((r) => (
                                <div key={r.id} className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${r.from === 'user' ? 'bg-gray-100 text-gray-800' : 'ml-auto bg-[#2B2249] text-white'}`}>
                                    {r.body}
                                    <AttachmentList files={r.attachments} dark={r.from !== 'user'} />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t border-gray-200 p-5">
                            {error && <p className="text-xs text-red-600">{error}</p>}
                            {open.status === 'resolved' || open.status === 'closed' ? (
                                <p className="text-sm text-gray-500">This ticket is {LABEL[open.status].toLowerCase()}. Reopen it to reply.</p>
                            ) : (
                                <div className="space-y-2">
                                <AttachmentPicker files={files} onChange={setFiles} disabled={busy} />
                                <div className="flex gap-2">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        rows={2}
                                        maxLength={2000}
                                        placeholder="Write a reply…"
                                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]/30"
                                    />
                                    <button onClick={send} disabled={busy || !reply.trim()} className="rounded-lg bg-[#2B2249] px-4 text-sm font-semibold text-white disabled:opacity-50">
                                        Send
                                    </button>
                                </div>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {(['open', 'in_progress', 'resolved', 'closed'] as const)
                                    .filter((s) => s !== open.status)
                                    .map((s) => (
                                        <button key={s} onClick={() => setStatus(s)} disabled={busy} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                            Mark {LABEL[s].toLowerCase()}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
