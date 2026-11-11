import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";
import { ChatInbox, type ChatThreadView } from "@/components/chat/chat-inbox";

// ---------------------------------------------------------------------------
// Buyer <-> seller chat (web). Same threads and messages as the mobile app:
// session routes /buyer/chat/* call the same BuyerChatController.
// ---------------------------------------------------------------------------

interface PageProps {
  auth: { user: any };
  initialThreadId: number | null;
  startSellerId: number | null;
  startProductId: number | null;
  [key: string]: any;
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

export default function BuyerMessages() {
  const { auth, initialThreadId, startSellerId, startProductId } = usePage<PageProps>().props;
  const [unread, setUnread] = useState(0);

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

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
      <Head title="Messages" />

      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} cartCount={0} />

      <main className="mx-auto max-w-[1200px] px-4 py-6 pb-10 sm:px-6">
        <div className="mb-4">
          <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            Messages
          </h1>
          <p className="mt-1 text-[0.83rem] text-[#6E6570]">
            Chat with sellers ·{" "}
            <span className="font-bold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {unread}
            </span>{" "}
            unread
          </p>
        </div>

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
      </main>
    </div>
  );
}
