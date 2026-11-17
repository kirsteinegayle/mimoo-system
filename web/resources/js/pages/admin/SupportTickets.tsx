import AdminShell from '@/layouts/admin/admin-shell';
import { AttachmentList, AttachmentPicker, withFiles, type TicketFile } from '@/components/support/attachments';
import { fmtDate, jsonFetch } from '@/lib/json-fetch';
import { Head } from '@inertiajs/react';
import { LifeBuoy, Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
type Filter = Status | 'all';

interface Ticket {
    id: number;
    user_role: string;
    user_name: string;
    user_email: string | null;
    category: string;
    category_label: string;
    subject: string;
    message: string;
    status: Status;
    created_at: string | null;
    updated_at: string | null;
    replies_count?: number;
    attachments?: TicketFile[];
    replies?: { id: number; from: 'user' | 'admin'; body: string; attachments?: TicketFile[]; created_at: string | null }[];
}

const LABEL: Record<Status, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };
const badge = (s: Status) =>
    s === 'open' ? 'bg-amber-50 text-amber-700' : s === 'in_progress' ? 'bg-sky-50 text-sky-700' : s === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700';

function initialTicket(): number | null {
    if (typeof window === 'undefined') return null;
    const v = new URLSearchParams(window.location.search).get('ticket');
    return v && /^\d+$/.test(v) ? Number(v) : null;
}

export default function SupportTicketsPage() {
    const [filter, setFilter] = useState<Filter>(() => (initialTicket() ? 'all' : 'open'));
    const [rows, setRows] = useState<Ticket[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<number | null>(initialTicket);
    const [active, setActive] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const json = await jsonFetch<{ data: Ticket[]; counts: Record<string, number> }>(`/admin/support/feed?status=${filter}`);
            setRows(json.data);
            setCounts(json.counts);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const loadTicket = useCallback(async (id: number) => {
        try {
            const json = await jsonFetch<{ data: Ticket }>(`/admin/support/${id}`);
            setActive(json.data);
        } catch (e: any) {
            setNotice(e.message);
            setActive(null);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);
    useEffect(() => {
        if (activeId) loadTicket(activeId);
        else setActive(null);
    }, [activeId, loadTicket]);

    const sendReply = async () => {
        if (!active || !reply.trim()) return;
        setBusy(true);
        try {
            await jsonFetch(`/admin/support/${active.id}/reply`, 'POST', withFiles({ body: reply.trim() }, replyFiles));
            setReply('');
            setReplyFiles([]);
            setNotice('Reply sent. The user was notified.');
            await Promise.all([loadTicket(active.id), load()]);
        } catch (e: any) {
            setNotice(e.message);
        } finally {
            setBusy(false);
        }
    };

    const changeStatus = async (status: Status) => {
        if (!active) return;
        setBusy(true);
        try {
            const json = await jsonFetch<{ message: string }>(`/admin/support/${active.id}/status`, 'POST', { status });
            setNotice(json.message);
            await Promise.all([loadTicket(active.id), load()]);
        } catch (e: any) {
            setNotice(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminShell active="support">
            <Head title="Help & Support - Admin" />
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Support tickets</h1>
                <p className="mt-0.5 text-sm text-gray-400">Questions and problems from buyers, sellers, riders and couriers.</p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {(['open', 'in_progress', 'resolved', 'closed', 'all'] as Filter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${filter === f ? 'border-[#3B1F6B] bg-[#3B1F6B] text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {f === 'all' ? 'All' : LABEL[f]}
                        {f !== 'all' && <span className="ml-1 opacity-70">{counts[f] ?? 0}</span>}
                    </button>
                ))}
            </div>

            {notice && <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">{notice}</div>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-2">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-sm text-red-600">{error}</div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 p-10 text-sm text-gray-400">
                            <LifeBuoy className="h-8 w-8" strokeWidth={1} />
                            No tickets here.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {rows.map((t) => (
                                <li key={t.id}>
                                    <button
                                        onClick={() => setActiveId(t.id)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${activeId === t.id ? 'bg-violet-50' : ''}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-semibold text-gray-800">{t.subject}</span>
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(t.status)}`}>{LABEL[t.status]}</span>
                                        </div>
                                        <div className="mt-0.5 flex items-center justify-between text-xs text-gray-400">
                                            <span className="truncate">
                                                {t.user_name} · <span className="capitalize">{t.user_role}</span> · {t.category_label}
                                            </span>
                                            <span className="shrink-0">{fmtDate(t.updated_at)}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-3">
                    {!active ? (
                        <div className="flex h-full min-h-60 items-center justify-center p-10 text-sm text-gray-400">Select a ticket to view the thread.</div>
                    ) : (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-gray-900">{active.subject}</p>
                                        <p className="text-xs text-gray-400">
                                            #{active.id} · {active.user_name} ({active.user_role}) · {active.user_email} · {active.category_label}
                                        </p>
                                    </div>
                                    <select
                                        value={active.status}
                                        disabled={busy}
                                        onChange={(e) => changeStatus(e.target.value as Status)}
                                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                                        aria-label="Ticket status"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto px-5 py-4">
                                <Bubble from="user" body={active.message} at={active.created_at} name={active.user_name} files={active.attachments} />
                                {(active.replies ?? []).map((r) => (
                                    <Bubble key={r.id} from={r.from} body={r.body} at={r.created_at} name={r.from === 'admin' ? 'Support team' : active.user_name} files={r.attachments} />
                                ))}
                            </div>
                            <div className="border-t border-gray-100 p-3">
                                <div className="mb-2"><AttachmentPicker files={replyFiles} onChange={setReplyFiles} disabled={busy} /></div>
                                <div className="flex gap-2">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value.slice(0, 2000))}
                                        rows={2}
                                        placeholder="Write a reply to the user…"
                                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#3B1F6B] focus:outline-none"
                                    />
                                    <button
                                        onClick={sendReply}
                                        disabled={busy || !reply.trim()}
                                        className="flex items-center gap-1 self-end rounded-lg bg-[#3B1F6B] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                        <Send className="h-3.5 w-3.5" /> Reply
                                    </button>
                                </div>
                                <p className="mt-1 text-[10px] text-gray-400">Replying moves an open ticket to In progress. The user is notified.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}

function Bubble({ from, body, at, name, files }: { from: 'user' | 'admin'; body: string; at: string | null; name: string; files?: TicketFile[] }) {
    const mine = from === 'admin';
    return (
        <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${mine ? 'bg-[#3B1F6B] text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className={`mb-0.5 text-[10px] font-semibold ${mine ? 'text-white/70' : 'text-gray-500'}`}>
                    {name} · {fmtDate(at)}
                </p>
                <p className="whitespace-pre-wrap">{body}</p>
                <AttachmentList files={files} dark={mine} />
            </div>
        </div>
    );
}
