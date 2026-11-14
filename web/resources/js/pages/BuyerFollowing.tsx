import { useCallback, useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Loader2, MessageCircle, Store, Users } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";
import { errorText } from "@/components/buyer/returns-reviews";

// ---------------------------------------------------------------------------
// Buyer web: stores I follow. Data from GET /buyer/following (same controller
// and JSON as the mobile GET /api/buyer/following). Unfollow uses
// DELETE /buyer/sellers/{id}/follow, as on mobile.
// ---------------------------------------------------------------------------

interface FollowedSeller {
  seller_id: number;
  display_name: string;
  profile_photo_url: string | null;
  followers_count: number;
  followed_at: string | null;
}

export default function BuyerFollowing() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const [items, setItems] = useState<FollowedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/buyer/following", { credentials: "same-origin", headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(errorText(res.status, json, "Could not load the stores you follow."));
      setItems(json.data ?? []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Could not load the stores you follow.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function unfollow(s: FollowedSeller) {
    if (busyId) return;
    setBusyId(s.seller_id);
    setNotice(null);
    try {
      const res = await fetch(`/buyer/sellers/${s.seller_id}/follow`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(errorText(res.status, json, "Could not unfollow. Please try again."));
        return;
      }
      setItems((prev) => prev.filter((x) => x.seller_id !== s.seller_id));
    } catch {
      setNotice("Could not unfollow. Please check your connection.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3F8] text-[#2A2330]">
      <Head title="Following - mimoo" />
      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} cartCount={0} />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="mb-5">
          <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Following</h1>
          <p className="text-[0.83rem] text-[#6E6570] mt-1">Stores you follow</p>
        </div>

        {notice && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{notice}</p>}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#4B2E7E]" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
            <button type="button" onClick={() => { setLoading(true); load(); }} className="ml-3 font-semibold underline">Try again</button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <Store className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <p className="text-sm text-neutral-500">You are not following any stores yet.</p>
            <Link href="/homepage" className="mt-3 inline-block text-sm font-semibold text-[#4B2E7E] hover:underline">Browse products</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((s) => (
              <li key={s.seller_id} className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
                {s.profile_photo_url ? (
                  <img src={s.profile_photo_url} alt={s.display_name} className="h-14 w-14 shrink-0 rounded-full border border-violet-100 object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-900 text-lg font-bold text-white">
                    {(s.display_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">{s.display_name}</p>
                  <p className="flex items-center gap-1 text-xs text-neutral-500">
                    <Users className="h-3.5 w-3.5" /> {s.followers_count} follower{s.followers_count === 1 ? "" : "s"}
                    {s.followed_at && <span> · Followed {new Date(s.followed_at).toLocaleDateString()}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/seller/${s.seller_id}`} className="rounded-lg border-2 border-violet-900 px-3 py-1.5 text-sm font-semibold text-violet-900 hover:bg-violet-50">
                    View store
                  </Link>
                  <Link href={`/messages?seller_id=${s.seller_id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-800">
                    <MessageCircle className="h-4 w-4" /> Chat
                  </Link>
                  <button
                    type="button"
                    onClick={() => unfollow(s)}
                    disabled={busyId === s.seller_id}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    {busyId === s.seller_id ? "Unfollowing..." : "Unfollow"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
