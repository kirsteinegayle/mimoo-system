import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { ChatInbox, type ChatThreadView } from "@/components/chat/chat-inbox";
import { csrfHeaders } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Role-to-role inbox (admin, seller, courier, logistics): ChatInbox (polls every
// 5 s) plus a "new conversation" picker limited to the contacts the server
// allows (GET {base}/contacts). Same JSON for /messaging and /admin/messaging.
// ---------------------------------------------------------------------------

interface Contact {
  role: string;
  id: number;
  name: string;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  seller: "Seller",
  courier: "Courier",
  logistics: "Logistics",
  rider: "Rider",
  buyer: "Buyer",
};

const mapThread = (t: any): ChatThreadView => ({
  id: t.id,
  name: t.counterpart_name || "Conversation",
  photoUrl: null,
  product: null,
  lastMessage: t.last_message
    ? { id: t.last_message.id, thread_id: t.id, is_mine: false, body: t.last_message.body ?? null, image_url: null, read_at: null, created_at: t.last_message.created_at ?? null }
    : null,
  lastMessageAt: t.last_message_at ?? null,
  unread: Number(t.unread_count ?? 0),
});

const threadName = (t: any) => t?.name || "Conversation";

function initialThread(): number | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("thread");
  return v && /^\d+$/.test(v) ? Number(v) : null;
}

export function RoleInbox({
  base,
  accent = "#3B1F6B",
  onUnreadTotal,
  emptyHint = "Messages from the team will appear here",
}: {
  base: string; // "/messaging" or "/admin/messaging"
  accent?: string;
  onUnreadTotal?: (n: number) => void;
  emptyHint?: string;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [choice, setChoice] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<number | null>(initialThread);
  const [version, setVersion] = useState(0);

  const loadContacts = useCallback(async () => {
    try {
      const res = await fetch(`${base}/contacts${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`, {
        credentials: "same-origin",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      const json = await res.json().catch(() => ({}));
      setContacts(res.ok ? json.data ?? [] : []);
    } catch {
      setContacts([]);
    }
  }, [base, search]);

  useEffect(() => {
    const t = setTimeout(loadContacts, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadContacts, search]);

  async function start() {
    const [role, id] = choice.split(":");
    if (!role) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/start`, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
        body: JSON.stringify({ role, id: Number(id) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Could not start the conversation.");
        return;
      }
      setThreadId(json.data.id);
      setVersion((v) => v + 1);
      setChoice("");
    } catch {
      setError("Could not start the conversation. Please check your connection.");
    } finally {
      setBusy(false);
    }
  }

  const messagesUrl = (id: number) => `${base}/threads/${id}/messages`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
        <span className="text-sm font-semibold text-gray-700">New conversation</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="w-44 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[#3B1F6B] focus:outline-none"
        />
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-[#3B1F6B] focus:outline-none"
        >
          <option value="">{contacts.length ? "Choose who to message" : "No one available to message"}</option>
          {contacts.map((c) => (
            <option key={`${c.role}:${c.id}`} value={`${c.role}:${c.id}`}>
              {c.name} ({ROLE_LABEL[c.role] ?? c.role})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={start}
          disabled={!choice || busy}
          style={{ backgroundColor: accent }}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Message
        </button>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </div>

      <ChatInbox
        key={version}
        threadsUrl={`${base}/threads`}
        messagesUrl={messagesUrl}
        sendUrl={messagesUrl}
        mapThread={mapThread}
        threadName={threadName}
        initialThreadId={threadId}
        onUnreadTotal={onUnreadTotal}
        accent={accent}
        emptyTitle="No conversations yet"
        emptyHint={emptyHint}
        maxLength={500}
      />
    </div>
  );
}
