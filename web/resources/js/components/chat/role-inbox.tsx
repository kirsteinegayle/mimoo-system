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

// Order + plural headings for the grouped picker (server decides WHO is allowed).
const ROLE_ORDER = ["admin", "logistics", "courier", "seller", "rider", "buyer"];
const ROLE_GROUP: Record<string, string> = {
  admin: "Admin team",
  logistics: "Logistics",
  courier: "Couriers",
  seller: "Sellers",
  rider: "Riders",
  buyer: "Buyers",
};

const mapThread = (t: any): ChatThreadView => ({
  id: t.id,
  badge: t.counterpart_role ? ROLE_LABEL[t.counterpart_role] ?? t.counterpart_role : null,
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
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
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

  // Roles present in the allowed contacts, in a fixed order.
  const roles = ROLE_ORDER.filter((r) => contacts.some((c) => c.role === r)).concat(
    [...new Set(contacts.map((c) => c.role))].filter((r) => !ROLE_ORDER.includes(r)),
  );
  const shown = roleFilter ? contacts.filter((c) => c.role === roleFilter) : contacts;
  const groups = roles
    .filter((r) => !roleFilter || r === roleFilter)
    .map((r) => ({ role: r, items: shown.filter((c) => c.role === r) }))
    .filter((g) => g.items.length > 0);

  // Explicit colours + light scheme: these controls sat on a white card but
  // inherited near-white text when the OS was in dark mode (the dropdown bug).
  const field =
    "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2";
  const ring = { ["--tw-ring-color" as any]: `${accent}33` };

  return (
    <div className="text-gray-900 [color-scheme:light]">
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">New conversation</span>
          {roles.length > 1 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by role">
              {[null, ...roles].map((r) => {
                const sel = roleFilter === r;
                const count = r ? contacts.filter((c) => c.role === r).length : contacts.length;
                return (
                  <button
                    key={r ?? "all"}
                    type="button"
                    aria-pressed={sel}
                    onClick={() => {
                      setRoleFilter(r);
                      setChoice("");
                    }}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                      sel ? "border-transparent text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    style={sel ? { background: accent } : undefined}
                  >
                    {r ? ROLE_GROUP[r] ?? ROLE_LABEL[r] ?? r : "All"} · {count}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search contacts"
            className={`w-44 ${field}`}
            style={ring}
          />
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            aria-label="Choose who to message"
            className={`min-w-[220px] flex-1 ${field}`}
            style={ring}
          >
            <option value="">{shown.length ? "Choose who to message" : "No one available to message"}</option>
            {groups.map((g) => (
              <optgroup key={g.role} label={ROLE_GROUP[g.role] ?? ROLE_LABEL[g.role] ?? g.role}>
                {g.items.map((c) => (
                  <option key={`${c.role}:${c.id}`} value={`${c.role}:${c.id}`}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
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
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
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
