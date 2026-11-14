import { useCallback, useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";
import { ReturnStatusBadge, errorText } from "@/components/buyer/returns-reviews";

// ---------------------------------------------------------------------------
// Buyer web: my return / refund requests. Data from GET /buyer/returns (same
// controller and JSON as the mobile GET /api/buyer/returns). The only buyer
// action is "Escalate" (rejected requests, once, within 3 days), as on mobile.
// ---------------------------------------------------------------------------

interface ReturnItem {
  id: number;
  order_id: number;
  order_number: string;
  order_status: string | null;
  order_total: number | null;
  reason: string;
  description: string;
  images: string[];
  status: string;
  seller_response: string | null;
  responded_at: string | null;
  escalated_at: string | null;
  can_escalate: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const peso = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function when(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function timeline(r: ReturnItem): { label: string; at: string | null; done: boolean }[] {
  const decided = ["approved", "rejected", "refunded", "closed"].includes(r.status) || !!r.responded_at;
  const steps = [
    { label: "Return requested", at: r.created_at, done: true },
    {
      label: decided ? "Seller responded" : "Waiting for seller review",
      at: r.responded_at,
      done: decided,
    },
  ];
  if (r.escalated_at || r.status === "escalated") steps.push({ label: "Escalated for review", at: r.escalated_at, done: true });
  if (r.status === "refunded") steps.push({ label: "Refund completed", at: r.updated_at, done: true });
  if (r.status === "closed") steps.push({ label: "Request closed", at: r.updated_at, done: true });
  return steps;
}

export default function BuyerReturns() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  // ?id= highlights one request (links from the order pages).
  const [highlight] = useState<number | null>(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("id");
      return v && /^\d+$/.test(v) ? Number(v) : null;
    } catch {
      return null;
    }
  });

  const [items, setItems] = useState<ReturnItem[]>([]);
  const [refunds, setRefunds] = useState<Record<string, { status: string; amount: number; method: string; reference: string | null; refunded_at: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/buyer/returns", {
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(errorText(res.status, json, "Could not load your return requests."));
      setItems(json.data ?? []);
      setError(null);
      // Refund status (separate web endpoint; the mobile returns payload is unchanged). Best effort.
      fetch("/buyer/refunds", { headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }, credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => j?.data && setRefunds(j.data))
        .catch(() => undefined);
    } catch (e: any) {
      setError(e?.message || "Could not load your return requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && highlight) document.getElementById(`return-${highlight}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading, highlight]);

  async function escalate(r: ReturnItem) {
    if (!confirm("Escalate this request for review? You can only do this once.")) return;
    setBusyId(r.id);
    setNotice(null);
    try {
      const res = await fetch(`/buyer/returns/${r.id}/escalate`, {
        method: "POST",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...csrfHeaders() },
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(errorText(res.status, json, "Could not escalate this request."));
      setItems((prev) => prev.map((x) => (x.id === r.id ? json.data : x)));
      setNotice({ text: json.message || "Your request was escalated for review.", ok: true });
    } catch (e: any) {
      setNotice({ text: e?.message || "Could not escalate this request.", ok: false });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne] text-[#2A1B4D]">
      <Head title="My Returns" />
      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} cartCount={0} />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="mb-5 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>My Returns</h1>
            <p className="text-[0.83rem] text-[#6E6570] mt-1">Return and refund requests for your orders</p>
          </div>
          <Link href="/orders" className="text-sm font-semibold text-[#4B2E7E] hover:underline">Back to My Purchases</Link>
        </div>

        {notice && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${notice.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`} role="status">
            {notice.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-[14px] bg-white p-12 text-sm text-[#6E6570]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your return requests...
          </div>
        ) : error ? (
          <div className="rounded-[14px] bg-white p-8 text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button type="button" onClick={() => { setLoading(true); load(); }} className="text-sm font-semibold text-[#4B2E7E] hover:underline">Try again</button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[14px] bg-white p-12 text-center border border-[rgba(185,166,222,0.18)]">
            <RotateCcw className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
            <p className="text-[0.88rem] text-[#6E6570] mb-4">You have no return requests.</p>
            <Link href="/orders" className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition">
              Go to My Purchases
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((r) => (
              <li
                key={r.id}
                id={`return-${r.id}`}
                className={`scroll-mt-6 rounded-[14px] bg-white p-5 shadow-sm border ${r.id === highlight ? "border-[#4B2E7E] ring-2 ring-[#4B2E7E]/15" : "border-[rgba(185,166,222,0.18)]"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/orders/${r.order_id}`} className="font-bold text-[#2A1B4D] hover:underline">Order {r.order_number}</Link>
                    <p className="text-xs text-[#6E6570] mt-0.5">
                      Requested {when(r.created_at)}
                      {r.order_total !== null && <> · {peso(r.order_total)}</>}
                    </p>
                  </div>
                  <ReturnStatusBadge status={r.status} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6570]">Reason</p>
                    <p className="text-sm font-medium mt-0.5">{r.reason}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6570] mt-3">Details</p>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{r.description}</p>
                    {r.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.images.map((src) => (
                          <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                            <img src={src} alt="Return photo" className="h-16 w-16 rounded-lg object-cover border border-neutral-200" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <ol className="relative border-l-2 border-[#E4DCF3] pl-4 space-y-3">
                    {timeline(r).map((s, i) => (
                      <li key={i} className="relative">
                        <span className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full ${s.done ? "bg-[#4B2E7E]" : "bg-neutral-300"}`} />
                        <p className={`text-sm ${s.done ? "font-semibold" : "text-[#6E6570]"}`}>{s.label}</p>
                        {s.at && <p className="text-xs text-[#6E6570]">{when(s.at)}</p>}
                      </li>
                    ))}
                  </ol>
                </div>

                {refunds[String(r.id)] && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                    <span className="font-semibold">
                      {{ pending: "Refund pending", processing: "Refund processing", refunded: "Refund completed", failed: "Refund delayed" }[refunds[String(r.id)].status] ?? "Refund"}
                    </span>
                    {" · ₱"}{refunds[String(r.id)].amount.toFixed(2)}
                    {refunds[String(r.id)].status === "refunded" && refunds[String(r.id)].reference ? ` · Ref ${refunds[String(r.id)].reference}` : ""}
                    {refunds[String(r.id)].status === "failed" ? <span className="block text-xs text-green-800">We could not complete it yet. We will try again.</span> : null}
                  </div>
                )}
                {r.seller_response && (
                  <div className="mt-4 rounded-lg bg-[#F9F7FC] border-l-4 border-[#4B2E7E] p-3">
                    <p className="text-xs font-semibold text-[#4B2E7E]">Seller response</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{r.seller_response}</p>
                  </div>
                )}

                {r.can_escalate && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 p-3">
                    <p className="flex items-center gap-2 text-sm text-amber-800">
                      <AlertTriangle className="h-4 w-4" /> Not happy with the decision? You can escalate once within 3 days.
                    </p>
                    <button
                      type="button"
                      onClick={() => escalate(r)}
                      disabled={busyId === r.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a2360] disabled:opacity-50"
                    >
                      {busyId === r.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      Escalate
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
