import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Check, Loader2, Plus } from "lucide-react";
import { csrfHeaders } from "@/components/notification-bell";
import { errorText } from "@/components/buyer/returns-reviews";

interface Props {
  sellerId: number;
  user?: { id: number | string; account_type?: string } | null;
  /** Called with the new follower count after a follow / unfollow. */
  onCountChange?: (count: number) => void;
  className?: string;
}

/**
 * Follow / Unfollow a store (buyer web). Same endpoints and JSON as the mobile
 * app (POST/DELETE /buyer/sellers/{id}/follow, GET /buyer/following).
 * Hidden for the seller themself and for non-buyer accounts; guests are sent to login.
 */
export function FollowButton({ sellerId, user, onCountChange, className = "" }: Props) {
  const isGuest = !user;
  const isBuyer = !!user && user.account_type === "buyer";
  const isSelf = !!user && Number(user.id) === Number(sellerId);

  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isBuyer || isSelf) return;
    let alive = true;
    fetch("/buyer/following", { credentials: "same-origin", headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j?.data) setFollowing(j.data.some((f: { seller_id: number }) => Number(f.seller_id) === Number(sellerId)));
      })
      .catch(() => {
        if (alive) setFollowing(false);
      });
    return () => {
      alive = false;
    };
  }, [isBuyer, isSelf, sellerId]);

  if (!sellerId || isSelf || (!isGuest && !isBuyer)) return null;

  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-semibold transition disabled:opacity-60";

  if (isGuest) {
    return (
      <button type="button" onClick={() => router.visit("/login")} className={`${base} bg-violet-600 text-white hover:bg-violet-700 ${className}`}>
        <Plus className="h-4 w-4" /> Follow
      </button>
    );
  }

  async function toggle() {
    if (busy || following === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/buyer/sellers/${sellerId}/follow`, {
        method: following ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(errorText(res.status, json, "Could not update. Please try again."));
        return;
      }
      setFollowing(!!json.is_following);
      if (typeof json.followers_count === "number") onCountChange?.(json.followers_count);
    } catch {
      setError("Could not update. Please check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={toggle}
        disabled={busy || following === null}
        className={`${base} ${
          following ? "border border-violet-600 bg-white text-violet-700 hover:bg-violet-50" : "bg-violet-600 text-white hover:bg-violet-700"
        } ${className}`}
      >
        {busy || following === null ? <Loader2 className="h-4 w-4 animate-spin" /> : following ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {following ? "Following" : "Follow"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
