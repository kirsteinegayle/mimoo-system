import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Bike, Loader2, Lock, Send, X } from "lucide-react";
import { csrfHeaders } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Buyer <-> rider delivery chat (web). Same DeliveryChatController and JSON as
// the buyer app (/api/buyer/orders/{id}/chat) through the session routes
// /buyer/orders/{id}/rider-chat. Polls every 5 s while the tab is visible.
// Bodies are plain text and rendered as text only.
// ---------------------------------------------------------------------------

export interface RiderChatMessage {
  id: number;
  sender_role: "rider" | "buyer";
  mine: boolean;
  body: string;
  read_at: string | null;
  created_at: string | null;
}

interface Meta {
  delivery_job_id: number;
  order_id: number;
  job_status: string;
  can_send: boolean;
  counterpart_name: string;
}

const POLL_MS = 5000;
const MAX_LEN = 500;

const JOB_STATUS: Record<string, string> = {
  assigned: "Rider assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Delivery failed",
  return_to_sender: "Returning to sender",
};

function clock(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date().toDateString() === d.toDateString()
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

async function call(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(body === undefined ? {} : { "Content-Type": "application/json", ...csrfHeaders() }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`);
  return json;
}

/** Conversation with the order's rider. Fills its parent's height. */
export function RiderChatPanel({ orderId, onRead }: { orderId: number; onRead?: () => void }) {
  const [messages, setMessages] = useState<RiderChatMessage[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const onReadRef = useRef(onRead);
  onReadRef.current = onRead;

  const base = `/buyer/orders/${orderId}/rider-chat`;

  const merge = useCallback((incoming: RiderChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev, ...incoming.filter((m) => !seen.has(m.id))].sort((a, b) => a.id - b.id);
      lastId.current = next.length ? next[next.length - 1].id : 0;
      return next;
    });
  }, []);

  const markRead = useCallback(async () => {
    try {
      await call(`${base}/read`, {});
      onReadRef.current?.();
    } catch {
      /* read receipts are best-effort */
    }
  }, [base]);

  const load = useCallback(
    async (initial: boolean) => {
      try {
        const json = await call(initial || !lastId.current ? base : `${base}?after_id=${lastId.current}`);
        setMeta(json.meta ?? null);
        const rows: RiderChatMessage[] = json.data ?? [];
        merge(rows);
        setError(null);
        if (initial || rows.some((m) => !m.mine)) markRead();
      } catch (e: any) {
        if (initial) setError(e?.message || "Could not load the chat.");
      } finally {
        if (initial) setLoading(false);
      }
    },
    [base, merge, markRead],
  );

  useEffect(() => {
    setMessages([]);
    lastId.current = 0;
    setLoading(true);
    load(true);
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") load(false);
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const json = await call(base, { body });
      if (json.data) merge([json.data]);
      if (json.meta) setMeta(json.meta);
      setDraft("");
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Message not sent.");
    } finally {
      setSending(false);
    }
  }

  const canSend = meta?.can_send ?? false;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4B2E7E] text-white">
          <Bike className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{meta?.counterpart_name ?? "Your rider"}</p>
          <p className="text-xs text-gray-500">{meta ? JOB_STATUS[meta.job_status] ?? meta.job_status : "Delivery rider"}</p>
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#f7f5fb] px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
            <Bike className="mb-2 h-8 w-8 text-gray-300" />
            {error ?? "No messages yet. Say hi to your rider, or share delivery instructions."}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  m.mine ? "rounded-br-sm bg-[#4B2E7E] text-white" : "rounded-bl-sm bg-white text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-0.5 text-right text-[10px] ${m.mine ? "text-white/70" : "text-gray-400"}`}>
                  {clock(m.created_at)}
                  {m.mine && m.read_at ? " · Seen" : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {canSend ? (
        <form onSubmit={send} className="border-t border-gray-100 p-3">
          {error && messages.length > 0 && <p className="mb-2 text-xs text-red-600">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) send(e as unknown as FormEvent);
              }}
              rows={1}
              placeholder="Message your rider…"
              aria-label="Message your rider"
              className="max-h-28 min-h-[40px] flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4B2E7E] focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/20"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B2E7E] text-white transition hover:bg-[#3B1F6B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-right text-[10px] text-gray-400">
            {draft.length}/{MAX_LEN}
          </p>
        </form>
      ) : (
        !loading && (
          <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <Lock className="h-3.5 w-3.5" /> This chat is closed because the delivery is no longer active.
          </div>
        )
      )}
    </div>
  );
}

/** Modal wrapper used by the order page's "Message Rider" button. */
export function RiderChatModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat with your rider"
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[600px] sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
        <RiderChatPanel orderId={orderId} />
      </div>
    </div>
  );
}
