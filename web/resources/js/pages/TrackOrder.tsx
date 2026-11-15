import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { BuyerHeader } from "@/components/buyer-header";
import { Bike, CheckCircle2, Circle, MapPin, MessageCircle, Package, RefreshCw, Star, Truck, XCircle } from "lucide-react";
import { RiderChatModal } from "@/components/buyer/rider-chat";

// Track Order: the parcel's transit log, oldest → newest on the server,
// shown newest-first like a courier tracking page. Same JSON as the buyer app
// (GET /api/orders/{id}/tracking ⇔ /api/buyer/orders/{id}/tracking).

export interface TrackingEvent {
  key: string;
  title: string;
  description: string | null;
  location: string | null;
  handler: string | null;
  at: string; // ISO 8601
}

export interface Tracking {
  order_id: number;
  order_number: string;
  waybill_number: string | null;
  status: string;
  tracking: { status: string | null; label: string | null; message: string | null; updated_at: string | null };
  courier_name: string | null;
  current_location: string | null;
  destination: string;
  events: TrackingEvent[];
}

const BAD_KEYS = new Set(["delivery_failed", "cancelled", "returned", "scan_return_received"]);
const DONE_KEYS = new Set(["delivered", "completed"]);

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

interface RiderInfo { name: string; job_status: string; can_chat: boolean; unread: number }

interface ReviewSummary { can_write: boolean; reviewed: boolean; can_edit: boolean }

export default function TrackOrder({ tracking: initial, rider, review }: { tracking: Tracking; rider?: RiderInfo | null; review?: ReviewSummary | null }) {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const [t, setT] = useState<Tracking>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${t.order_id}/tracking`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
      if (res.ok) setT((await res.json()).data);
    } finally {
      setRefreshing(false);
    }
  };

  // Light auto-refresh while the parcel is still moving.
  useEffect(() => {
    if (["completed", "cancelled", "failed"].includes(t.status)) return;
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.order_id, t.status]);

  const events = [...t.events].reverse(); // newest first
  const latest = events[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title={`Track ${t.order_number}`} />
      <BuyerHeader user={auth?.user} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/orders/${t.order_id}`} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to order
          </Link>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-bold text-gray-900">Track Order</h1>
          <p className="text-sm text-gray-500">{t.order_number}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info icon={<Package className="h-4 w-4" />} label="Waybill" value={t.waybill_number ?? "Not yet generated"} mono />
            <Info icon={<Truck className="h-4 w-4" />} label="Courier" value={t.courier_name ?? "Not yet assigned"} />
            <Info icon={<MapPin className="h-4 w-4" />} label="Current location" value={t.current_location ?? "—"} />
            <Info icon={<MapPin className="h-4 w-4" />} label="Destination" value={t.destination} />
          </div>

          {latest && (
            <div className="mt-4 rounded-md bg-purple-50 px-4 py-3 text-sm text-purple-900">
              <span className="font-semibold">{t.tracking.label ?? latest.title}</span>
              {t.tracking.message ? ` · ${t.tracking.message}` : ""}
            </div>
          )}

          {/* Message Rider: only once a rider is assigned to this order */}
          {rider && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Bike className="h-4 w-4 text-purple-700" />
                Rider: <span className="font-semibold text-gray-900">{rider.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B]"
              >
                <MessageCircle className="h-4 w-4" />
                {rider.can_chat ? "Message Rider" : "View rider chat"}
                {rider.unread > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold">{rider.unread}</span>}
              </button>
            </div>
          )}

          {/* Review entry point: completed (delivered) orders only; null for every other status. */}
          {review && (review.can_write || review.reviewed) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-700">{review.can_write ? "Your order was delivered. How was it?" : "Thanks for reviewing this order."}</p>
              <Link
                href={`/orders/${t.order_id}#reviews`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B]"
              >
                <Star className="h-4 w-4" />
                {review.can_write ? "Write a Review" : review.can_edit ? "Edit Review" : "View Review"}
              </Link>
            </div>
          )}
        </section>
        {chatOpen && <RiderChatModal orderId={t.order_id} onClose={() => setChatOpen(false)} />}

        {/* Timeline */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Transit history</h2>
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No tracking updates yet.</p>
          ) : (
            <ol className="relative">
              {events.map((e, i) => {
                const first = i === 0;
                const last = i === events.length - 1;
                const bad = BAD_KEYS.has(e.key);
                const done = DONE_KEYS.has(e.key);
                const Icon = bad ? XCircle : first || done ? CheckCircle2 : Circle;
                const color = bad ? "text-red-600" : first ? "text-purple-700" : "text-gray-400";
                return (
                  <li key={`${e.key}-${e.at}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && <span className="absolute left-[9px] top-6 h-full w-0.5 bg-gray-200" aria-hidden />}
                    <Icon className={`relative z-10 h-5 w-5 shrink-0 bg-white ${color}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <p className={`text-sm ${first ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{e.title}</p>
                        <time dateTime={e.at} className="text-xs text-gray-500">
                          {fmtDate(e.at)} · {fmtTime(e.at)}
                        </time>
                      </div>
                      {e.description && <p className="mt-0.5 text-sm text-gray-600">{e.description}</p>}
                      {(e.location || e.handler) && (
                        <p className="mt-1 text-xs text-gray-500">
                          {[e.location, e.handler].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}

function Info({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2">
      <span className="mt-0.5 text-gray-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`truncate text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
