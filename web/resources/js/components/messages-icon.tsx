import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { MessageCircle } from "lucide-react";

/**
 * Header "Messages" icon for buyers. Links to /messages (seller + rider chats)
 * and shows the combined unread count. Guests get `onGuestClick` instead.
 */
export function MessagesIcon({
  isLoggedIn,
  onGuestClick,
  className = "relative flex items-center text-white transition-colors hover:text-white/80",
}: {
  isLoggedIn: boolean;
  onGuestClick?: () => void;
  className?: string;
}) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;
    const get = (url: string) =>
      fetch(url, { credentials: "same-origin", headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } })
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((j) => (Array.isArray(j?.data) ? j.data : []))
        .catch(() => []);
    const load = async () => {
      const [sellers, riders] = await Promise.all([get("/buyer/chat/threads"), get("/buyer/rider-chats")]);
      const sum = (rows: any[]) => rows.reduce((n, r) => n + Number(r?.unread_count ?? 0), 0);
      if (alive) setUnread(sum(sellers) + sum(riders));
    };
    load();
    const t = window.setInterval(() => document.visibilityState === "visible" && load(), 60000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [isLoggedIn]);

  const badge =
    unread > 0 ? (
      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
        {unread > 99 ? "99+" : unread}
      </span>
    ) : null;

  if (!isLoggedIn) {
    return (
      <button type="button" onClick={onGuestClick} aria-label="Messages" className={className}>
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Link href="/messages" aria-label="Messages" className={className}>
      <MessageCircle className="h-5 w-5" />
      {badge}
    </Link>
  );
}
