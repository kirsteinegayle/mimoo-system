import { useCallback, useEffect, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Bike, Loader2, Store } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";
import { ChatInbox, type ChatThreadView } from "@/components/chat/chat-inbox";
import { RiderChatPanel } from "@/components/buyer/rider-chat";

// ---------------------------------------------------------------------------
// Buyer inbox (web).
//  · Sellers: buyer <-> seller chat. Same threads and messages as the mobile
//    app: session routes /buyer/chat/* call the same BuyerChatController.
//  · Riders: buyer <-> rider delivery chat per order (/buyer/rider-chats,
//    /buyer/orders/{id}/rider-chat) — same DeliveryChatController as the app.
// ---------------------------------------------------------------------------

interface PageProps {
  auth: { user: any };
  initialThreadId: number | null;
  startSellerId: number | null;
  startProductId: number | null;
  initialTab?: "sellers" | "riders";
  riderOrderId?: number | null;
  [key: string]: any;
}

interface RiderThread {
  order_id: number;
  order_number: string;
  rider_name: string;
  job_status: string;
  can_send: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

const mapThread = (t: any): ChatThreadView => ({
  id: t.id,
  name: t.seller_name || "Seller",
  photoUrl: t.seller_photo_url ?? null,
  product: t.product ?? null,
  lastMessage: t.last_message ?? null,
  lastMessageAt: t.last_message_at ?? null,
  unread: Number(t.unread_count ?? 0),
});

const threadName = (t: any) => t?.seller_name || "Seller";
const messagesUrl = (id: number) => `/buyer/chat/${id}/messages`;

function when(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date().toDateString() === d.toDateString()
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Rider conversations: list (left) + conversation (right); stacked on phones. */
function RiderInbox({ initialOrderId, onUnreadTotal }: { initialOrderId: number | null; onUnreadTotal: (n: number) => void }) {
  const [threads, setThreads] = useState<RiderThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(initialOrderId);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/buyer/rider-chats", {
        credentials: "same-origin",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Could not load rider chats.");
      const rows: RiderThread[] = json.data ?? [];
      setThreads(rows);
      onUnreadTotal(rows.reduce((n, r) => n + (r.unread_count || 0), 0));
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Could not load rider chats.");
    } finally {
      setLoading(false);
    }
  }, [onUnreadTotal]);

  useEffect(() => {
    load();
    const t = window.setInterval(() => document.visibilityState === "visible" && load(), 10000);
    return () => window.clearInterval(t);
  }, [load]);

  return (
    <div className="grid h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-[#E6E0F0] bg-white shadow-sm md:grid-cols-[320px_1fr]">
      <aside className={`min-h-0 overflow-y-auto border-r border-[#EEE9F5] ${active ? "hidden md:block" : ""}`}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-gray-500">
            <Bike className="mb-2 h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-700">{error ?? "No rider chats yet"}</p>
            <p className="mt-1">Once a rider is assigned to your order, tap “Message Rider” on the order page.</p>
          </div>
        ) : (
          <ul>
            {threads.map((t) => (
              <li key={t.order_id}>
                <button
                  type="button"
                  onClick={() => setActive(t.order_id)}
                  className={`flex w-full items-start gap-3 border-b border-[#F3F0F8] px-4 py-3 text-left transition hover:bg-[#F9F7FC] ${
                    active === t.order_id ? "bg-[#F4F0FA]" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4B2E7E] text-white">
                    <Bike className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">{t.rider_name}</span>
                      <span className="shrink-0 text-[11px] text-gray-400">{when(t.last_message_at)}</span>
                    </span>
                    <span className="block truncate text-xs text-[#6E6570]">Order {t.order_number}</span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-gray-500">{t.last_message ?? (t.can_send ? "Start the conversation" : "Chat closed")}</span>
                      {t.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4B2E7E] px-1.5 text-[10px] font-bold text-white">
                          {t.unread_count}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className={`min-h-0 flex-col ${active ? "flex" : "hidden md:flex"}`}>
        {active ? (
          <>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="flex items-center gap-1 border-b border-gray-100 px-4 py-2 text-xs font-semibold text-[#4B2E7E] md:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All rider chats
            </button>
            <div className="min-h-0 flex-1">
              <RiderChatPanel key={active} orderId={active} onRead={load} />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500">
            <Bike className="mb-2 h-10 w-10 text-gray-300" />
            Select a rider conversation
          </div>
        )}
      </section>
    </div>
  );
}

export default function BuyerMessages() {
  const { auth, initialThreadId, startSellerId, startProductId, initialTab, riderOrderId } = usePage<PageProps>().props;
  const [tab, setTab] = useState<"sellers" | "riders">(initialTab === "riders" || riderOrderId ? "riders" : "sellers");
  const [unread, setUnread] = useState(0);
  const [riderUnread, setRiderUnread] = useState(0);

  // "Chat now" / ?seller_id=: get-or-create the thread with that seller first.
  // The thread is unique per buyer+seller, so repeating this never duplicates it.
  const startOnce = async (productId: number | null) => {
    const res = await fetch("/buyer/chat/start", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...csrfHeaders(),
      },
      credentials: "same-origin",
      body: JSON.stringify({ seller_id: startSellerId, ...(productId ? { product_id: productId } : {}) }),
    });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  };

  const start = startSellerId
    ? async () => {
        let { res, json } = await startOnce(startProductId);
        // Product removed / not this seller's: still open the chat, without the product card.
        if (res.status === 422 && startProductId) ({ res, json } = await startOnce(null));
        if (!res.ok) throw new Error(json?.message || "Could not start the conversation.");
        return (json?.data?.id as number) ?? null;
      }
    : undefined;

  const tabBtn = (key: "sellers" | "riders", label: string, Icon: typeof Store, count: number) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        tab === key ? "bg-[#4B2E7E] text-white shadow-sm" : "bg-white text-[#4B2E7E] ring-1 ring-[#D9CFEA] hover:bg-[#F4F0FA]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count > 0 && (
        <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === key ? "bg-white text-[#4B2E7E]" : "bg-[#4B2E7E] text-white"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
      <Head title="Messages" />

      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} cartCount={0} />

      <main className="mx-auto max-w-[1200px] px-4 py-6 pb-10 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              Messages
            </h1>
            <p className="mt-1 text-[0.83rem] text-[#6E6570]">
              Chat with sellers and your delivery riders ·{" "}
              <span className="font-bold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {unread + riderUnread}
              </span>{" "}
              unread
            </p>
          </div>
          <div className="flex gap-2">
            {tabBtn("sellers", "Sellers", Store, unread)}
            {tabBtn("riders", "Riders", Bike, riderUnread)}
          </div>
        </div>

        {/* Both stay mounted so unread counts keep updating; only one is visible. */}
        <div className={tab === "sellers" ? "" : "hidden"}>
          <ChatInbox
            threadsUrl="/buyer/chat/threads"
            messagesUrl={messagesUrl}
            sendUrl={messagesUrl}
            mapThread={mapThread}
            threadName={threadName}
            initialThreadId={initialThreadId}
            start={start}
            onUnreadTotal={setUnread}
            accent="#4B2E7E"
            emptyTitle="No conversations yet"
            emptyHint="Tap “Chat now” on a product or order to message a seller."
          />
        </div>
        <div className={tab === "riders" ? "" : "hidden"}>
          <RiderInbox initialOrderId={riderOrderId ?? null} onUnreadTotal={setRiderUnread} />
        </div>
      </main>
    </div>
  );
}
