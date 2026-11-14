import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Star, X } from "lucide-react";
import SellerShell from "@/layouts/seller/seller-shell";
import { csrfHeaders } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReturnRow {
  id: number;
  order_id: number;
  order_number: string;
  buyer_name: string | null;
  reason: string;
  description: string;
  images: string[];
  items: { name: string; quantity: number; unit_price: number }[];
  items_total: number;
  status: string;
  seller_response: string | null;
  responded_at: string | null;
  escalated_at: string | null;
  can_decide: boolean;
  created_at: string;
}

interface ReviewRow {
  id: number;
  product_name: string;
  buyer_name: string;
  rating: number;
  comment: string | null;
  seller_reply: string | null;
  created_at: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

const NOTE_MAX = 500;
const REPLY_MAX = 500;
const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  escalated: "bg-violet-50 text-violet-700",
  refunded: "bg-blue-50 text-blue-700",
  closed: "bg-gray-100 text-gray-600",
};

function api(url: string, body?: unknown) {
  return fetch(url, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(body === undefined ? {} : { "Content-Type": "application/json", ...csrfHeaders() }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Returns tab
// ---------------------------------------------------------------------------

function ReturnsTab() {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReturnRow | null>(null);
  const [mode, setMode] = useState<"view" | "approve" | "reject">("view");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page: String(page) });
      if (search.trim()) params.set("search", search.trim());
      const res = await api(`/seller/returns/feed?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setRows(json.data ?? []);
      setCounts(json.counts ?? {});
      setMeta(json.meta ?? { current_page: 1, last_page: 1, total: 0 });
    } catch {
      setRows([]);
      toast.error("Could not load return requests.");
    } finally {
      setLoading(false);
    }
  }, [status, page, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const open = (r: ReturnRow) => {
    setSelected(r);
    setMode("view");
    setNote("");
    setError(null);
  };

  async function decide(action: "approve" | "reject") {
    if (!selected) return;
    if (action === "reject" && !note.trim()) {
      setError("A note is required when rejecting.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api(`/seller/returns/${selected.id}/decision`, { action, note });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message || "Could not save your decision.");
        if (res.status === 422 || res.status === 404) load();
        return;
      }
      toast.success(json.message || "Saved.");
      setSelected(null);
      load();
    } catch {
      setError("Could not save your decision. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const filters = ["pending", "approved", "rejected", "escalated", "all"];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              status === f ? "bg-[#3B1F6B] text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f}
            {f !== "all" && counts[f] ? <span className="ml-1.5 text-xs opacity-80">({counts[f]})</span> : null}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search order number or reason"
          className="ml-auto w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F6B] focus:outline-none sm:w-64"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-[#3B1F6B]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            <RotateCcw className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            No return requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Order", "Items", "Reason", "Status", "Requested", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{r.order_number}</p>
                      <p className="text-xs text-gray-500">{r.buyer_name ?? "Buyer"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.items.map((i) => `${i.name} × ${i.quantity}`).join(", ") || "—"}
                      <p className="text-xs text-gray-500">{peso(r.items_total)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLE[r.status] ?? STATUS_STYLE.closed}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => open(r)}
                        className="rounded-lg bg-violet-50 px-3 py-1 text-sm font-medium text-[#3B1F6B] hover:bg-violet-100"
                      >
                        {r.can_decide ? "Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pager meta={meta} page={page} setPage={setPage} />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Return request #{selected.id}</h2>
                <p className="text-sm text-gray-500">
                  Order {selected.order_number} · {selected.buyer_name ?? "Buyer"}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[selected.status] ?? STATUS_STYLE.closed}`}>
                  {selected.status}
                </span>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Your items in this order</h3>
                <ul className="space-y-1 text-sm text-gray-800">
                  {selected.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-3">
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span>{peso(i.unit_price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase text-red-900">Reason</p>
                <p className="mb-3 text-sm font-semibold text-gray-900">{selected.reason}</p>
                <p className="text-xs font-semibold uppercase text-red-900">Description</p>
                <p className="whitespace-pre-wrap break-words text-sm text-gray-900">{selected.description}</p>
                {selected.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="Return evidence" className="h-24 w-24 rounded-lg border border-gray-200 object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {selected.seller_response && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Response</p>
                  <p className="whitespace-pre-wrap break-words text-sm text-gray-900">{selected.seller_response}</p>
                </div>
              )}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              {selected.can_decide && mode === "view" && (
                <div className="flex gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setMode("approve")}
                    className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("reject")}
                    className="flex-1 rounded-lg border-2 border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selected.can_decide && mode !== "view" && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-1 font-bold text-gray-900">{mode === "approve" ? "Approve return" : "Reject return"}</h4>
                  <p className="mb-3 text-sm text-gray-600">
                    {mode === "approve"
                      ? "The buyer is notified. This decision cannot be changed afterwards."
                      : "A note is required so the buyer knows why. The buyer can escalate a rejection to admin review."}
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                    rows={3}
                    placeholder={mode === "reject" ? "Note (required)" : "Note (optional)"}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3B1F6B] focus:outline-none"
                  />
                  <p className="mb-3 text-right text-xs text-gray-400">
                    {note.length}/{NOTE_MAX}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => decide(mode)}
                      disabled={busy || (mode === "reject" && !note.trim())}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                        mode === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"
                      }`}
                    >
                      {busy ? "Saving..." : mode === "approve" ? "Confirm approval" : "Confirm rejection"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("view");
                        setNote("");
                        setError(null);
                      }}
                      disabled={busy}
                      className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Reviews tab
// ---------------------------------------------------------------------------

function ReviewsTab() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [filter, setFilter] = useState("unreplied");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(`/seller/reviews/feed?filter=${filter}&page=${page}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setRows(json.data ?? []);
      setMeta(json.meta ?? { current_page: 1, last_page: 1, total: 0 });
    } catch {
      setRows([]);
      toast.error("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(r: ReviewRow) {
    const text = (drafts[r.id] ?? "").trim();
    if (!text) {
      setErrors((e) => ({ ...e, [r.id]: "Please write a reply." }));
      return;
    }
    setBusyId(r.id);
    setErrors((e) => ({ ...e, [r.id]: "" }));
    try {
      const res = await api(`/seller/reviews/${r.id}/reply`, { reply: text });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors((e) => ({ ...e, [r.id]: json.errors?.reply?.[0] || json.message || "Could not save the reply." }));
        return;
      }
      toast.success("Reply saved.");
      setEditing(null);
      load();
    } catch {
      setErrors((e) => ({ ...e, [r.id]: "Could not save the reply." }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex gap-2">
        {["unreplied", "replied", "all"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              filter === f ? "bg-[#3B1F6B] text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-[#3B1F6B]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          <Star className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          No reviews found
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const isEditing = editing === r.id || !r.seller_reply;
            const draft = drafts[r.id] ?? (editing === r.id ? r.seller_reply ?? "" : "");
            return (
              <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{r.product_name}</p>
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-amber-500">{"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span></span>
                  <span>{r.buyer_name}</span>
                </div>
                {r.comment && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-800">{r.comment}</p>}

                {!isEditing && r.seller_reply ? (
                  <div className="mt-3 rounded-lg bg-violet-50 p-3">
                    <p className="text-xs font-semibold text-[#3B1F6B]">Your reply</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">{r.seller_reply}</p>
                    <button
                      type="button"
                      onClick={() => setEditing(r.id)}
                      className="mt-2 text-xs font-semibold text-[#3B1F6B] hover:underline"
                    >
                      Edit reply
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <textarea
                      value={draft}
                      onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value.slice(0, REPLY_MAX) }))}
                      rows={3}
                      placeholder="Write a public reply to this review"
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3B1F6B] focus:outline-none"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-red-600">{errors[r.id]}</span>
                      <span className="text-xs text-gray-400">
                        {draft.length}/{REPLY_MAX}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => send(r)}
                        disabled={busyId === r.id || !draft.trim()}
                        className="rounded-lg bg-[#3B1F6B] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2B2249] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyId === r.id ? "Saving..." : "Post reply"}
                      </button>
                      {r.seller_reply && (
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Pager meta={meta} page={page} setPage={setPage} />
    </>
  );
}

function Pager({ meta, page, setPage }: { meta: Meta; page: number; setPage: (p: number) => void }) {
  if (meta.last_page <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-500">{meta.total} total</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-2 text-sm text-gray-700">
          Page {page} of {meta.last_page}
        </span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= meta.last_page}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SellerReturns() {
  const [tab, setTab] = useState<"returns" | "reviews">("returns");

  return (
    <SellerShell active="returns">
      <Head title="Returns & Reviews" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Returns &amp; Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Handle return requests for your items and reply to customer reviews of your products.
          </p>
        </div>

        <div className="mb-5 flex gap-6 border-b border-gray-200">
          {(
            [
              ["returns", "Return requests"],
              ["reviews", "Reviews"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition ${
                tab === key ? "border-[#3B1F6B] text-[#3B1F6B]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "returns" ? <ReturnsTab /> : <ReviewsTab />}
      </div>
    </SellerShell>
  );
}
