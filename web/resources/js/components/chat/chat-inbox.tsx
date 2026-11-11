import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, Loader2, MessageSquare, Search, Send, X } from "lucide-react";
import { csrfHeaders, timeAgo } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Shared buyer <-> seller chat inbox (threads list + conversation + composer).
// Polls every 5 s while the tab is visible. Message bodies are plain text and
// are rendered as text only (never as HTML).
// ---------------------------------------------------------------------------

export interface ChatProduct {
  id: number;
  name: string;
  effective_price: number;
  image_url: string | null;
}

export interface ChatMessageItem {
  id: number;
  thread_id: number;
  is_mine: boolean;
  body: string | null;
  image_url: string | null;
  read_at: string | null;
  created_at: string | null;
}

export interface ChatThreadView {
  id: number;
  name: string;
  photoUrl: string | null;
  product: ChatProduct | null;
  lastMessage: ChatMessageItem | null;
  lastMessageAt: string | null;
  unread: number;
}

export interface ChatInboxProps {
  threadsUrl: string;
  messagesUrl: (threadId: number) => string;
  sendUrl: (threadId: number) => string;
  /** Maps one raw thread row of the threads endpoint. */
  mapThread: (raw: any) => ChatThreadView;
  /** Counterpart name from the `thread` object of the messages endpoint. */
  threadName: (raw: any) => string;
  initialThreadId?: number | null;
  /** Optional: get-or-create a thread before the first load (returns its id). */
  start?: () => Promise<number | null>;
  onUnreadTotal?: (total: number) => void;
  accent: string;
  emptyTitle: string;
  emptyHint: string;
  maxLength?: number;
  heightClass?: string;
}

const POLL_MS = 5000;

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
    credentials: "same-origin",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`);
  return json;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function clock(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function preview(m: ChatMessageItem | null) {
  if (!m) return "No messages yet";
  const text = m.body?.trim() ? m.body : "Photo";
  return (m.is_mine ? "You: " : "") + text;
}

const peso = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ChatInbox({
  threadsUrl,
  messagesUrl,
  sendUrl,
  mapThread,
  threadName,
  initialThreadId = null,
  start,
  onUnreadTotal,
  accent,
  emptyTitle,
  emptyHint,
  maxLength = 1000,
  heightClass = "h-[calc(100vh-220px)] min-h-[480px]",
}: ChatInboxProps) {
  const [threads, setThreads] = useState<ChatThreadView[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(initialThreadId);
  const [activeName, setActiveName] = useState("");
  const [activeProduct, setActiveProduct] = useState<ChatProduct | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [convError, setConvError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const activeRef = useRef<number | null>(activeId);
  const lastIdRef = useRef(0);
  const loadedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);
  const unreadCb = useRef(onUnreadTotal);
  unreadCb.current = onUnreadTotal;

  // ── Threads ──────────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const json = await getJson(threadsUrl);
      const list: ChatThreadView[] = (json.data ?? []).map(mapThread);
      setThreads(list);
      setThreadsError(null);
      unreadCb.current?.(Number(json.meta?.unread_total ?? list.reduce((s, t) => s + t.unread, 0)));
    } catch (e: any) {
      setThreadsError(e?.message || "Could not load conversations.");
    } finally {
      setLoadingThreads(false);
    }
  }, [threadsUrl, mapThread]);

  // ── Messages ─────────────────────────────────────────────────────────────
  const mergeMessages = useCallback((incoming: ChatMessageItem[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...prev, ...incoming.filter((m) => !seen.has(m.id))].sort((a, b) => a.id - b.id);
      lastIdRef.current = merged.length ? merged[merged.length - 1].id : 0;
      return merged;
    });
  }, []);

  const openThread = useCallback(
    async (id: number) => {
      activeRef.current = id;
      lastIdRef.current = 0;
      loadedRef.current = false;
      stickToBottom.current = true;
      setActiveId(id);
      setMessages([]);
      setConvError(null);
      setSendError(null);
      setLoadingMessages(true);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("thread", String(id));
        url.searchParams.delete("seller_id");
        url.searchParams.delete("product_id");
        window.history.replaceState(window.history.state, "", url.toString());
      } catch {
        // ignore
      }
      try {
        const json = await getJson(messagesUrl(id));
        if (activeRef.current !== id) return;
        const list: ChatMessageItem[] = json.data ?? [];
        setMessages(list);
        lastIdRef.current = list.length ? list[list.length - 1].id : 0;
        loadedRef.current = true;
        setActiveName(threadName(json.thread ?? {}));
        setActiveProduct(json.thread?.product ?? null);
        setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
        loadThreads();
      } catch (e: any) {
        if (activeRef.current === id) setConvError(e?.message || "Could not load this conversation.");
      } finally {
        if (activeRef.current === id) setLoadingMessages(false);
      }
    },
    [messagesUrl, threadName, loadThreads],
  );

  const pollMessages = useCallback(async () => {
    const id = activeRef.current;
    if (!id || !loadedRef.current) return;
    try {
      const after = lastIdRef.current;
      const base = messagesUrl(id);
      const sep = base.includes("?") ? "&" : "?";
      const json = await getJson(after > 0 ? `${base}${sep}after_id=${after}` : base);
      if (activeRef.current !== id) return;
      mergeMessages(json.data ?? []);
    } catch {
      // transient: next poll retries
    }
  }, [messagesUrl, mergeMessages]);

  // ── Initial load (+ optional start) ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let first = initialThreadId;
      if (start) {
        try {
          first = (await start()) ?? first;
        } catch (e: any) {
          if (!cancelled) setThreadsError(e?.message || "Could not start the conversation.");
        }
      }
      if (cancelled) return;
      await loadThreads();
      if (!cancelled && first) openThread(first);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Polling every 5 s while visible ──────────────────────────────────────
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      loadThreads();
      pollMessages();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [loadThreads, pollMessages]);

  // ── Auto-scroll to newest ────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function onScroll() {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  async function send(e: FormEvent) {
    e.preventDefault();
    const id = activeRef.current;
    const body = draft.trim();
    if (!id || sending || (!body && !image)) return;
    if (body.length > maxLength) {
      setSendError(`Message must not exceed ${maxLength} characters.`);
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const form = new FormData();
      if (body) form.append("body", body);
      if (image) form.append("image", image);
      const res = await fetch(sendUrl(id), {
        method: "POST",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
        credentials: "same-origin",
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Message not sent. Please try again.");
      setDraft("");
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
      stickToBottom.current = true;
      if (activeRef.current === id && json.data) mergeMessages([json.data]);
      loadThreads();
    } catch (err: any) {
      setSendError(err?.message || "Message not sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const filtered = search.trim()
    ? threads.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
    : threads;
  const active = threads.find((t) => t.id === activeId);
  const title = activeName || active?.name || "";
  const product = activeProduct ?? active?.product ?? null;

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-3 ${heightClass}`}>
      {/* Conversation list */}
      <aside
        className={`${activeId ? "hidden lg:flex" : "flex"} min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white`}
      >
        <div className="border-b border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
              style={{ ["--tw-ring-color" as any]: `${accent}33` }}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex h-full items-center justify-center p-6 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversations...
            </div>
          ) : threadsError && threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-red-600">{threadsError}</div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
              <p className="mt-2 text-sm font-medium text-gray-500">
                {search.trim() ? "No matching conversations" : emptyTitle}
              </p>
              {!search.trim() && <p className="text-xs text-gray-400">{emptyHint}</p>}
            </div>
          ) : (
            <ul>
              {filtered.map((t) => {
                const isActive = t.id === activeId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openThread(t.id)}
                      className={`flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left transition hover:bg-gray-50 ${
                        isActive ? "bg-gray-50" : ""
                      }`}
                    >
                      {t.photoUrl ? (
                        <img src={t.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: accent }}
                        >
                          {initials(t.name)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${t.unread ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                            {t.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(t.lastMessageAt)}</span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={`truncate text-xs ${t.unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                            {preview(t.lastMessage)}
                          </span>
                          {t.unread > 0 && (
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                              style={{ background: accent }}
                              aria-label={`${t.unread} unread`}
                            >
                              {t.unread > 99 ? "99+" : t.unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Conversation */}
      <section
        className={`${activeId ? "flex" : "hidden lg:flex"} min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white lg:col-span-2`}
      >
        {!activeId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <MessageSquare className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-900">No conversation selected</p>
              <p className="mt-1 text-sm text-gray-500">Select a conversation from the list to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-gray-200 p-3">
              <button
                type="button"
                onClick={() => {
                  activeRef.current = null;
                  setActiveId(null);
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100 lg:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: accent }}
              >
                {initials(title || "?")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{title || "Conversation"}</p>
                {product && (
                  <p className="truncate text-xs text-gray-500">
                    About: {product.name} · {peso(product.effective_price)}
                  </p>
                )}
              </div>
              {product?.image_url && (
                <img src={product.image_url} alt="" className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover" />
              )}
            </header>

            <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gray-50 p-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...
                </div>
              ) : convError ? (
                <div className="p-6 text-center text-sm text-red-600">{convError}</div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        m.is_mine ? "rounded-br-sm text-white" : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                      }`}
                      style={m.is_mine ? { background: accent } : undefined}
                    >
                      {m.image_url && (
                        <a href={m.image_url} target="_blank" rel="noopener noreferrer">
                          <img src={m.image_url} alt="Attachment" className="mb-1 max-h-60 rounded-lg object-cover" />
                        </a>
                      )}
                      {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                      <p className={`mt-1 text-right text-[10px] ${m.is_mine ? "text-white/70" : "text-gray-400"}`}>
                        {clock(m.created_at)}
                        {m.is_mine && (m.read_at ? " · Seen" : " · Sent")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={send} className="border-t border-gray-200 p-3">
              {image && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
                  <ImagePlus className="h-4 w-4" />
                  <span className="truncate">{image.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ml-auto rounded p-0.5 hover:bg-gray-200"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
              <div className="flex items-end gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg p-2 transition hover:bg-gray-100"
                  aria-label="Attach a photo (JPG or PNG, max 5 MB)"
                  title="Attach a photo (JPG or PNG, max 5 MB)"
                >
                  <ImagePlus className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
                </button>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                    }
                  }}
                  rows={1}
                  maxLength={maxLength}
                  placeholder="Type a message..."
                  aria-label="Message"
                  className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ ["--tw-ring-color" as any]: `${accent}33` }}
                />
                <button
                  type="submit"
                  disabled={sending || (!draft.trim() && !image)}
                  className="rounded-lg p-2.5 text-white transition disabled:opacity-50"
                  style={{ background: accent }}
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" strokeWidth={1.5} />}
                </button>
              </div>
              {draft.length > maxLength - 100 && (
                <p className="mt-1 text-right text-[10px] text-gray-400">
                  {draft.length}/{maxLength}
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </div>
  );
}
