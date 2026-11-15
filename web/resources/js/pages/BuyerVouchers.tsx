import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Check, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { BuyerHeader } from "@/components/buyer-header";
import { csrfHeaders } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Voucher wallet (web). Same BuyerVoucherController as the buyer app:
//   GET /buyer/vouchers (claimable), GET /buyer/vouchers/mine, POST /buyer/vouchers/claim {id|code}
// Claimed vouchers are applied at checkout (existing /api/vouchers/validate).
// ---------------------------------------------------------------------------

interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
  min_purchase: number;
  max_discount: number | null;
  valid_until: string;
  is_claimed: boolean;
  is_used: boolean;
}

const peso = (n: number) => "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 2 });

async function api(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(body === undefined ? {} : { "Content-Type": "application/json", ...csrfHeaders() }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

function VoucherCard({ v, onClaim, busy }: { v: Voucher; onClaim?: () => void; busy?: boolean }) {
  const off = v.type === "percentage" ? `${v.value}% OFF` : `${peso(v.value)} OFF`;
  return (
    <div className="flex overflow-hidden rounded-2xl border border-[#E6E0F0] bg-white shadow-sm">
      <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-[#2A1B4D] to-[#6a5a8a] p-3 text-center text-white">
        <Ticket className="mb-1 h-5 w-5 opacity-80" />
        <span className="text-sm font-extrabold leading-tight">{off}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{v.name}</p>
          <p className="text-xs text-gray-500">
            Min. spend {peso(v.min_purchase)}
            {v.max_discount ? ` · Cap ${peso(v.max_discount)}` : ""}
          </p>
          <p className="mt-1 font-mono text-xs text-[#4B2E7E]">{v.code}</p>
          <p className="text-[11px] text-gray-400">Valid until {new Date(v.valid_until).toLocaleDateString()}</p>
        </div>
        {onClaim ? (
          v.is_claimed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <Check className="h-3.5 w-3.5" /> Claimed
            </span>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onClaim}
              className="rounded-full bg-[#4B2E7E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#3B1F6B] disabled:opacity-60"
            >
              {busy ? "…" : "Claim"}
            </button>
          )
        ) : (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${v.is_used ? "bg-gray-100 text-gray-500" : "bg-violet-50 text-[#4B2E7E]"}`}>
            {v.is_used ? "Used" : "Ready to use"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BuyerVouchers() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [available, setAvailable] = useState<Voucher[]>([]);
  const [mine, setMine] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [code, setCode] = useState("");

  const load = useCallback(async () => {
    const [a, m] = await Promise.all([api("/buyer/vouchers"), api("/buyer/vouchers/mine")]);
    if (a.ok) setAvailable(a.json.data ?? []);
    if (m.ok) setMine(m.json.data ?? []);
    if (!a.ok && !m.ok) toast.error(a.json?.message || "Could not load vouchers.");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function claim(body: { id?: number; code?: string }) {
    setBusy(body.id ?? -1);
    const { ok, json } = await api("/buyer/vouchers/claim", body);
    setBusy(null);
    if (!ok) return toast.error(json?.errors?.code?.[0] || json?.message || "Could not claim this voucher.");
    toast.success(json?.message || "Voucher claimed!");
    setCode("");
    load();
  }

  function submitCode(e: FormEvent) {
    e.preventDefault();
    if (code.trim()) claim({ code: code.trim() });
  }

  const list = tab === "available" ? available : mine;

  return (
    <div className="min-h-screen bg-[#f5f4f8]">
      <Head title="My Vouchers" />
      <BuyerHeader user={auth?.user} onLogout={() => router.post("/logout")} />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/homepage" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Shop
        </Link>
        <h1 className="text-xl font-bold text-[#2A1B4D]">Vouchers</h1>
        <p className="mb-4 text-sm text-[#6E6570]">Claim vouchers here, then apply them at checkout.</p>

        <form onSubmit={submitCode} className="mb-5 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 50))}
            placeholder="Have a code? Enter it here"
            aria-label="Voucher code"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder:font-sans placeholder:text-gray-400 focus:border-[#4B2E7E] focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/20"
          />
          <button type="submit" disabled={!code.trim() || busy !== null} className="rounded-lg bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B] disabled:opacity-50">
            Claim
          </button>
        </form>

        <div className="mb-4 flex gap-2">
          {(
            [
              ["available", `Available (${available.length})`],
              ["mine", `My vouchers (${mine.length})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-[#4B2E7E] text-white" : "bg-white text-[#4B2E7E] ring-1 ring-[#D9CFEA]"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9CFEA] bg-white p-10 text-center text-sm text-gray-500">
            <Ticket className="mx-auto mb-2 h-10 w-10 text-gray-300" />
            {tab === "available" ? "No vouchers available right now." : "You haven't claimed any vouchers yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((v) => (
              <VoucherCard key={v.id} v={v} busy={busy === v.id} onClaim={tab === "available" ? () => claim({ id: v.id }) : undefined} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
