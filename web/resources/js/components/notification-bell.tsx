import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { Bell } from "lucide-react";

/**
 * Shared buyer notification bell (web).
 *
 * Reads the same rows as the buyer app (buyer_notifications) through the
 * session routes /buyer/notifications/* (same JSON shape as
 * /api/buyer/notifications). Polls the unread count every 30 s while logged
 * in. Guests never fetch: clicking calls onGuestClick (existing guest flow).
 */

interface BuyerNotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  data: { order_id?: number; [k: string]: unknown };
  is_read: boolean;
  created_at: string | null;
}

interface NotificationBellProps {
  isLoggedIn: boolean;
  onGuestClick?: () => void;
  buttonClassName?: string;
}

const POLL_MS = 30_000;

function csrfHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  // XSRF-TOKEN cookie is refreshed on every response (survives login without a reload).
  const cookie = document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN="));
  if (cookie) {
    headers["X-XSRF-TOKEN"] = decodeURIComponent(cookie.slice("XSRF-TOKEN=".length));
  } else {
    const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    if (meta) headers["X-CSRF-TOKEN"] = meta;
  }
  return headers;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell({
  isLoggedIn,
  onGuestClick,
  buttonClassName = "relative flex items-center text-white transition-colors hover:text-white/80",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<BuyerNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/buyer/notifications/feed", {
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "same-origin",
      });
      if (!res.ok) return; // 401/403 (not a buyer) → keep badge hidden
      const json = await res.json();
      setItems(Array.isArray(json.data) ? json.data : []);
      setUnread(Number(json.meta?.unread_count ?? 0));
    } catch {
      // network error: keep the last known state
    }
  }, []);

  // Initial load + 30 s refresh while logged in.
  useEffect(() => {
    if (!isLoggedIn) {
      setUnread(0);
      setItems([]);
      return;
    }
    load();
    const t = window.setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [isLoggedIn, load]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const post = (url: string) =>
    fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
      credentials: "same-origin",
    });

  const toggle = async () => {
    if (!isLoggedIn) {
      onGuestClick?.();
      return;
    }
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await load();
      setLoading(false);
    }
  };

  const openItem = async (n: BuyerNotificationItem) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      try {
        const res = await post(`/buyer/notifications/${n.id}/read`);
        if (res.ok) {
          const json = await res.json();
          if (typeof json.unread_count === "number") setUnread(json.unread_count);
        }
      } catch {
        // ignore: next poll corrects the count
      }
    }
    setOpen(false);
    if (n.data?.order_id) router.visit(`/orders/${n.data.order_id}`);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
    try {
      await post("/buyer/notifications/read-all");
    } catch {
      // ignore: next poll corrects the count
    }
  };

  return (
    <div className="relative flex items-center" ref={wrapRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup={isLoggedIn ? "menu" : undefined}
        aria-expanded={isLoggedIn ? open : undefined}
        onClick={toggle}
        className={buttonClassName}
      >
        <Bell className="h-5 w-5" />
        {isLoggedIn && unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {isLoggedIn && open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg bg-white text-neutral-800 shadow-lg ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0}
              className="text-xs font-medium text-violet-700 hover:underline disabled:cursor-default disabled:text-neutral-400 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">No notifications yet</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-2 border-b border-neutral-100 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50 ${
                    n.is_read ? "" : "bg-violet-50"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-violet-600"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.is_read ? "font-medium text-neutral-700" : "font-semibold text-neutral-900"}`}>
                      {n.title}
                    </span>
                    <span className="block text-xs text-neutral-600">{n.body}</span>
                    <span className="mt-0.5 block text-[11px] text-neutral-400">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
