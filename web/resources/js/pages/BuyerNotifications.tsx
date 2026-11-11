import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import {
  csrfHeaders,
  notificationHref,
  timeAgo,
  type BuyerNotificationItem,
} from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeedMeta {
  unread_count: number;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PageProps {
  notifications: { data: BuyerNotificationItem[]; meta: FeedMeta };
  auth: { user: any };
  [key: string]: any;
}

function postJson(url: string) {
  return fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
    credentials: "same-origin",
  });
}

// ---------------------------------------------------------------------------
// Buyer Notifications feed page
// ---------------------------------------------------------------------------

export default function BuyerNotifications() {
  const { notifications, auth } = usePage<PageProps>().props;
  const user = auth?.user;
  const meta = notifications.meta;

  const [items, setItems] = useState<BuyerNotificationItem[]>(notifications.data);
  const [unread, setUnread] = useState<number>(meta.unread_count);

  // Inertia reuses this component between pages: resync with new props.
  useEffect(() => {
    setItems(notifications.data);
    setUnread(notifications.meta.unread_count);
  }, [notifications]);

  function handleLogout() {
    router.post("/logout");
  }

  async function openItem(n: BuyerNotificationItem) {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      try {
        const res = await postJson(`/buyer/notifications/${n.id}/read`);
        if (res.ok) {
          const json = await res.json();
          if (typeof json.unread_count === "number") setUnread(json.unread_count);
        }
      } catch {
        // ignore: state is corrected on the next page load
      }
    }
    const href = notificationHref(n);
    if (href) router.visit(href);
  }

  async function markAll() {
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
    try {
      await postJson("/buyer/notifications/read-all");
    } catch {
      // ignore
    }
  }

  const goTo = (page: number) =>
    router.get("/buyer/notifications", { page }, { preserveScroll: false });

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
      <Head title="Notifications" />

      <BuyerHeader user={user} onLogout={handleLogout} cartCount={0} />

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 pb-16">
        {/* Page header */}
        <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              Notifications
            </h1>
            <p className="text-[0.83rem] text-[#6E6570] mt-1">
              <span className="font-bold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {unread}
              </span>{" "}
              unread · {meta.total} total
            </p>
          </div>
          <button
            type="button"
            onClick={markAll}
            disabled={unread === 0}
            className="text-sm font-semibold text-[#4B2E7E] hover:underline disabled:cursor-default disabled:text-neutral-400 disabled:no-underline"
          >
            Mark all as read
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-12 text-center">
            <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-[0.88rem] text-[#6E6570] mb-4">
              {meta.current_page > 1 ? "No notifications on this page" : "No notifications yet"}
            </p>
            <Link
              href={meta.current_page > 1 ? "/buyer/notifications" : "/homepage"}
              className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition"
            >
              {meta.current_page > 1 ? "Back to first page" : "Start Shopping"}
            </Link>
          </div>
        ) : (
          <ul className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] overflow-hidden">
            {items.map((n) => (
              <li key={n.id} className="border-b border-neutral-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-neutral-50 ${
                    n.is_read ? "" : "bg-violet-50"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-violet-600"}`}
                    aria-label={n.is_read ? undefined : "Unread"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span
                        className={`text-[0.9rem] ${n.is_read ? "font-medium text-neutral-700" : "font-semibold text-neutral-900"}`}
                      >
                        {n.title}
                      </span>
                      <span
                        className="shrink-0 text-[11px] text-neutral-400"
                        title={n.created_at ? new Date(n.created_at).toLocaleString() : undefined}
                      >
                        {timeAgo(n.created_at)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[0.82rem] text-neutral-600 break-words">{n.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <nav className="mt-5 flex items-center justify-center gap-3" aria-label="Pagination">
            <button
              type="button"
              onClick={() => goTo(meta.current_page - 1)}
              disabled={meta.current_page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[rgba(185,166,222,0.4)] bg-white px-3 py-1.5 text-sm font-medium text-[#4B2E7E] hover:bg-violet-50 disabled:cursor-default disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-[#6E6570]">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <button
              type="button"
              onClick={() => goTo(meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="inline-flex items-center gap-1 rounded-lg border border-[rgba(185,166,222,0.4)] bg-white px-3 py-1.5 text-sm font-medium text-[#4B2E7E] hover:bg-violet-50 disabled:cursor-default disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
