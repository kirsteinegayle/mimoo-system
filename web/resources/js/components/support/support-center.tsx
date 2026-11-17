import { AttachmentList, AttachmentPicker, withFiles, type TicketFile } from '@/components/support/attachments';
import { fmtDate, jsonFetch } from '@/lib/json-fetch';
import { CheckCircle2, LifeBuoy, Loader2, Plus, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Submitter side of support tickets (buyer + seller web). Same JSON the apps use:
 * /support/tickets (list, create), /support/tickets/{id} (thread), /replies.
 */

type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Ticket {
    id: number;
    category: string;
    category_label: string;
    subject: string;
    message: string;
    status: Status;
    created_at: string | null;
    updated_at: string | null;
    attachments?: TicketFile[];
    replies?: { id: number; from: 'me' | 'support'; body: string; attachments?: TicketFile[]; created_at: string | null }[];
}

const LABEL: Record<Status, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };
const badge = (s: Status) =>
    s === 'open' ? 'bg-amber-50 text-amber-700' : s === 'in_progress' ? 'bg-sky-50 text-sky-700' : s === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700';

function initialTicket(): number | null {
    if (typeof window === 'undefined') return null;
    const v = new URLSearchParams(window.location.search).get('ticket');
    return v && /^\d+$/.test(v) ? Number(v) : null;
}

export function SupportCenter({ categories, accent = '#3B1F6B' }: { categories: Record<string, string>; accent?: string }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<number | null>(initialTicket);
    const [active, setActive] = useState<Ticket | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ category: Object.keys(categories)[0] ?? 'other', subject: '', message: '' });
    const [formError, setFormError] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const json = await jsonFetch<{ data: Ticket[] }>('/support/tickets');
            setTickets(json.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!activeId) {
            setActive(null);
            return;
        }
        jsonFetch<{ data: Ticket }>(`/support/tickets/${activeId}`)
            .then((j) => setActive(j.data))
            .catch((e) => {
                setNotice(e.message);
                setActive(null);
            });
    }, [activeId]);

    const submit = async () => {
        setFormError(null);
        setBusy(true);
        try {
            const json = await jsonFetch<{ message: string; data: Ticket }>('/support/tickets', 'POST', withFiles(form, files));
            setNotice(json.message);
            setCreating(false);
            setForm({ category: form.category, subject: '', message: '' });
            setFiles([]);
            await load();
            setActiveId(json.data.id);
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const sendReply = async () => {
        if (!active || !reply.trim()) return;
        setBusy(true);
        try {
            const json = await jsonFetch<{ data: Ticket }>(`/support/tickets/${active.id}/replies`, 'POST', withFiles({ body: reply.trim() }, replyFiles));
            setActive(json.data);
            setReply('');
            setReplyFiles([]);
            await load();
        } catch (e: any) {
            setNotice(e.message);
        } finally {
            setBusy(false);
        }
    };

    const input = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200';

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Help &amp; support</h1>
                    <p className="text-sm text-gray-500">Send a ticket to the mimoo support team. We reply here and notify you.</p>
                </div>
                <button
                    onClick={() => {
                        setCreating(true);
                        setActiveId(null);
                        setFormError(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                    style={{ background: accent }}
                >
                    <Plus className="h-4 w-4" /> New ticket
                </button>
            </div>

            {notice && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {notice}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white lg:col-span-2">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-sm text-red-600">{error}</div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-gray-400">
                            <LifeBuoy className="h-8 w-8" strokeWidth={1} />
                            No tickets yet. Need help? Create a new ticket.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {tickets.map((t) => (
                                <li key={t.id}>
                                    <button
                                        onClick={() => {
                                            setCreating(false);
                                            setActiveId(t.id);
                                        }}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${activeId === t.id ? 'bg-violet-50' : ''}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-semibold text-gray-800">{t.subject}</span>
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(t.status)}`}>{LABEL[t.status]}</span>
                                        </div>
                                        <div className="mt-0.5 flex justify-between text-xs text-gray-400">
                                            <span>{t.category_label}</span>
                                            <span>{fmtDate(t.updated_at)}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white lg:col-span-3">
                    {creating ? (
                        <div className="space-y-3 p-5">
                            <p className="text-sm font-bold text-gray-900">New support ticket</p>
                            <label className="block text-xs font-medium text-gray-600">
                                Category
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${input} mt-1`}>
                                    {Object.entries(categories).map(([k, v]) => (
                                        <option key={k} value={k}>
                                            {v}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-xs font-medium text-gray-600">
                                Subject
                                <input
                                    value={form.subject}
                                    maxLength={120}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    className={`${input} mt-1`}
                                    placeholder="Short summary"
                                />
                            </label>
                            <label className="block text-xs font-medium text-gray-600">
                                Message
                                <textarea
                                    value={form.message}
                                    maxLength={2000}
                                    rows={6}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className={`${input} mt-1`}
                                    placeholder="Describe the problem (order number, what happened, when)…"
                                />
                                <span className="mt-0.5 block text-right text-[10px] text-gray-400">{form.message.length}/2000</span>
                            </label>
                            <AttachmentPicker files={files} onChange={setFiles} disabled={busy} />
                            {formError && <p className="text-sm text-red-600">{formError}</p>}
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setCreating(false)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={busy || form.subject.trim().length < 3 || form.message.trim().length < 10}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                    style={{ background: accent }}
                                >
                                    {busy ? 'Sending…' : 'Send ticket'}
                                </button>
                            </div>
                        </div>
                    ) : !active ? (
                        <div className="flex min-h-60 items-center justify-center p-10 text-sm text-gray-400">Select a ticket, or create a new one.</div>
                    ) : (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold text-gray-900">{active.subject}</p>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(active.status)}`}>{LABEL[active.status]}</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    #{active.id} · {active.category_label} · {fmtDate(active.created_at)}
                                </p>
                            </div>
                            <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto px-5 py-4">
                                <Bubble mine body={active.message} at={active.created_at} accent={accent} files={active.attachments} />
                                {(active.replies ?? []).map((r) => (
                                    <Bubble key={r.id} mine={r.from === 'me'} body={r.body} at={r.created_at} accent={accent} files={r.attachments} />
                                ))}
                            </div>
                            {active.status === 'resolved' || active.status === 'closed' ? (
                                <p className="border-t border-gray-100 p-3 text-center text-xs text-gray-500">This ticket is resolved. Create a new ticket if you need more help.</p>
                            ) : (
                                <div className="border-t border-gray-100 p-3">
                                <div className="mb-2"><AttachmentPicker files={replyFiles} onChange={setReplyFiles} disabled={busy} /></div>
                                <div className="flex gap-2">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value.slice(0, 2000))}
                                        rows={2}
                                        placeholder="Add a reply…"
                                        className={`${input} flex-1`}
                                    />
                                    <button
                                        onClick={sendReply}
                                        disabled={busy || !reply.trim()}
                                        className="flex items-center gap-1 self-end rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                        style={{ background: accent }}
                                    >
                                        <Send className="h-4 w-4" /> Send
                                    </button>
                                </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Bubble({ mine, body, at, accent, files }: { mine: boolean; body: string; at: string | null; accent: string; files?: TicketFile[] }) {
    return (
        <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${mine ? 'text-white' : 'bg-gray-100 text-gray-800'}`} style={mine ? { background: accent } : undefined}>
                <p className={`mb-0.5 text-[10px] font-semibold ${mine ? 'text-white/70' : 'text-gray-500'}`}>
                    {mine ? 'You' : 'mimoo Support'} · {fmtDate(at)}
                </p>
                <p className="whitespace-pre-wrap">{body}</p>
                <AttachmentList files={files} dark={mine} />
            </div>
        </div>
    );
}
