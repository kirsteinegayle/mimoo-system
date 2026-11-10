"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Search, ShoppingCart, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  id: number;
  name: string;
  seller: string;
  variation: string;
  unitPrice: number;
  qty: number;
  protect: boolean;
}

interface Voucher {
  id: string;
  type: "ship" | "disc";
  code: string;
  title: string;
  chip: string;
  badge: string;
  cap?: number;
  amount?: number;
  min: number;
  valid: string; // dd.mm.yyyy
  qty: number;
  terms: string;
}

type Applied = { ship: string | null; disc: string | null };
type PayMethod = "gcash" | "cod";

interface PlacedOrder {
  orderNo: string;
  units: number;
  shops: number;
  method: PayMethod;
  eta: string;
  name: string;
  total: number;
}

// ---------------------------------------------------------------------------
// Data / constants (swap with real cart + voucher data from props later)
// ---------------------------------------------------------------------------

const INITIAL_ITEMS: OrderItem[] = [
  { id: 1, name: "Handwoven Rattan Basket (Medium)", seller: "Reyes Craft Corner", variation: "Color: Natural", unitPrice: 450, qty: 1, protect: false },
  { id: 2, name: "Organic Virgin Coconut Oil 250ml", seller: "Tolentino Skin Studio", variation: "Size: 250ml", unitPrice: 180, qty: 2, protect: false },
  { id: 3, name: "Dried Mango Strips 500g", seller: "Cabrera Fresh Market", variation: "Pack: 500g", unitPrice: 120, qty: 3, protect: false },
];

const FREE_SHIP_THRESHOLD = 999; // whole order at or above this ships free
const SHIP_FEE = 58; // per shop, when under the threshold
const PROTECT_FEE = 6; // per unit, optional

const VOUCHERS: Voucher[] = [
  { id: "fs-1500", type: "ship", code: "FREESHIP1500", title: "Shipping Discount up to ₱200 Off", chip: "Free Shipping", badge: "FREE", cap: 200, min: 1500, valid: "27.02.2027", qty: 0, terms: "Covers shipping fees only, up to ₱200. Cannot be combined with another shipping voucher." },
  { id: "fs-249", type: "ship", code: "FREESHIP", title: "Shipping Discount up to ₱200 Off", chip: "Free Shipping", badge: "FREE", cap: 200, min: 249, valid: "30.09.2026", qty: 10, terms: "Covers shipping fees only, up to ₱200. Cannot be combined with another shipping voucher." },
  { id: "off-50", type: "disc", code: "MIMOO50", title: "₱50 Off on Your Order", chip: "₱50 Off", badge: "₱50 OFF", amount: 50, min: 300, valid: "31.12.2026", qty: 0, terms: "Takes ₱50 off the merchandise subtotal. Cannot be combined with another discount voucher." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function parseDMY(s: string) {
  const [d, m, y] = s.split(".").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59);
}

function vState(v: Voucher, merch: number): { ok: boolean; why?: string } {
  if (new Date() > parseDMY(v.valid)) return { ok: false, why: "This voucher has expired." };
  if (merch < v.min) return { ok: false, why: `Spend ${peso(v.min - merch)} more to use this voucher.` };
  return { ok: true };
}

function getShipWindow(): string {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const a = new Date();
  a.setDate(a.getDate() + 3);
  const b = new Date();
  b.setDate(b.getDate() + 5);
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} - ${b.getDate()} ${M[b.getMonth()]}`
    : `${a.getDate()} ${M[a.getMonth()]} - ${b.getDate()} ${M[b.getMonth()]}`;
}

function calc(items: OrderItem[], applied: Applied) {
  const merch = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const freeShip = merch >= FREE_SHIP_THRESHOLD;
  const perShop = freeShip ? 0 : SHIP_FEE;

  const map = new Map<string, { seller: string; items: OrderItem[] }>();
  items.forEach((it) => {
    if (!map.has(it.seller)) map.set(it.seller, { seller: it.seller, items: [] });
    map.get(it.seller)!.items.push(it);
  });
  const groups = [...map.values()].map((g) => {
    const gm = g.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const protection = g.items.reduce((s, i) => s + (i.protect ? PROTECT_FEE * i.qty : 0), 0);
    const qty = g.items.reduce((s, i) => s + i.qty, 0);
    return { ...g, merch: gm, protection, qty, shipping: perShop, total: gm + protection + perShop };
  });

  const shipping = groups.reduce((s, g) => s + g.shipping, 0);
  const protection = groups.reduce((s, g) => s + g.protection, 0);
  const pick = (id: string | null) => {
    const v = VOUCHERS.find((x) => x.id === id);
    return v && vState(v, merch).ok ? v : null;
  };
  const shipV = pick(applied.ship);
  const discV = pick(applied.disc);
  const shippingDiscount = shipV ? Math.min(shipV.cap ?? 0, shipping) : 0;
  const discount = discV ? Math.min(discV.amount ?? 0, merch) : 0;
  const total = Math.max(merch + protection + shipping - shippingDiscount - discount, 0);
  return { groups, merch, protection, shipping, shippingDiscount, discount, shipV, discV, total, freeShip };
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const S = { fill: "none", viewBox: "0 0 24 24" } as const;
const icons: Record<string, ReactNode> = {
  pin: (<svg {...S}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.5" /></svg>),
  box: (<svg {...S}><path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M4 8l8 4 8-4M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>),
  chat: (<svg {...S}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>),
  ticket: (<svg {...S}><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 8.5v7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.6 2" /></svg>),
  card: (<svg {...S}><rect x="3" y="5.5" width="18" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" /></svg>),
  check: (<svg {...S}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  truck: (<svg {...S}><path d="M3 7h11v9H3V7ZM14 10h4l3 3v3h-7v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="7.5" cy="17.5" r="1.8" fill="currentColor" /><circle cx="17" cy="17.5" r="1.8" fill="currentColor" /></svg>),
  tag: (<svg {...S}><path d="M3 12V4h8l10 10-8 8L3 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="8" cy="8.5" r="1.4" fill="currentColor" /></svg>),
  warn: (<svg {...S}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="16.4" r="1.1" fill="currentColor" /></svg>),
  info: (<svg {...S}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="7.8" r="1.1" fill="currentColor" /></svg>),
};

// ---------------------------------------------------------------------------
// Header — same as the homepage
// ---------------------------------------------------------------------------

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Header({
  username = "username",
  avatarUrl = null,
  cartCount = 100,
  onSearch,
  onLogout,
}: {
  username?: string;
  avatarUrl?: string | null;
  /** @deprecated Ignored: the bell now loads the real unread count. */
  notificationCount?: number;
  cartCount?: number;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  
  // Detect if user is logged in based on onLogout being provided
  const isLoggedIn = !!onLogout;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <header
      className="w-full text-white"
      style={{ background: "linear-gradient(90deg, #1c1430 0%, #3a2d5c 45%, #6a5a8a 100%)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-7 items-center justify-end text-[10px] sm:text-[11px]">
          <div className="relative">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-white"
                >
                  <span className="h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    {avatarUrl && <img src={avatarUrl} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="max-w-24 truncate">{username}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                    <Link
                      href="/orders"
                      className="block rounded-t-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowMenu(false)}
                    >
                      My Purchases
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLogout?.();
                      }}
                      className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1 text-[11px] font-medium text-white/90 transition-colors hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pb-3 pt-1 sm:gap-6 sm:pb-4">
          <Link href="/homepage" className="shrink-0 text-xl font-bold lowercase tracking-tight sm:text-2xl">
            mimoo
          </Link>

          <form onSubmit={handleSubmit} role="search" className="relative min-w-0 flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-8 w-full rounded-full bg-neutral-200 pl-4 pr-11 text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-300 sm:h-9"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#2a2340] text-white transition-colors hover:bg-[#3a2d5c] sm:h-7 sm:w-7"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            <NotificationBell isLoggedIn={isLoggedIn} />
            <Link href="/cart" aria-label="Cart" className="relative flex items-center text-white transition-colors hover:text-white/80">
              <ShoppingCart className="h-5 w-5" />
              <CountBadge count={cartCount} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ViewOrder() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const user = auth?.user;

  const [items, setItems] = useState<OrderItem[]>(INITIAL_ITEMS);
  const [applied, setApplied] = useState<Applied>({ ship: null, disc: null });
  const [pending, setPending] = useState<Applied>({ ship: null, disc: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [voucherHelp, setVoucherHelp] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [termsOpen, setTermsOpen] = useState<string[]>([]);

  const [address, setAddress] = useState({ name: "Miguel Angelo Cruz", phone: "0918 552 7734", addr: "3 Purok 5, Apokon, Tagum City, Davao del Norte" });
  const [addrDraft, setAddrDraft] = useState(address);
  const [addrEditing, setAddrEditing] = useState(false);

  const [gcashNumber, setGcashNumber] = useState("0918 552 7734");
  const [gcashDraft, setGcashDraft] = useState(gcashNumber);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("gcash");
  const [payOpen, setPayOpen] = useState(false);
  const [payEditing, setPayEditing] = useState(false);

  const [messages, setMessages] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [toast, setToast] = useState({ msg: "", err: false, show: false });

  const dialogRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const c = calc(items, applied);
  const dates = getShipWindow();

  function showToast(msg: string, err = false) {
    setToast({ msg, err, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }

  // Lock page scroll + Esc / focus trap while the voucher popup is open
  useEffect(() => {
    if (!modalOpen) return;
    
    const handleClose = () => {
      setModalOpen(false);
      setTimeout(() => openBtnRef.current?.focus(), 0);
    };
    
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return handleClose();
      if (e.key === "Tab" && dialogRef.current) {
        const f = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]')];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialogRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ----- voucher actions -----
  function openModal() {
    setPending({ ...applied });
    setVoucherHelp(false);
    setVoucherCode("");
    setTermsOpen([]);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setTimeout(() => openBtnRef.current?.focus(), 0);
  }
  function pickVoucher(v: Voucher) {
    if (!vState(v, c.merch).ok) return;
    setPending((p) => ({ ...p, [v.type]: p[v.type] === v.id ? null : v.id }));
  }
  function applyCode() {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;
    const v = VOUCHERS.find((x) => x.code === code);
    if (!v) return showToast("This voucher code is invalid or expired.", true);
    const st = vState(v, c.merch);
    if (!st.ok) return showToast(st.why!, true);
    setPending((p) => ({ ...p, [v.type]: v.id }));
    setVoucherCode("");
    showToast(`${v.title} selected. Press OK to apply.`);
  }
  function confirmVouchers() {
    const changed = JSON.stringify(applied) !== JSON.stringify(pending);
    setApplied({ ...pending });
    closeModal();
    if (changed) showToast(pending.ship || pending.disc ? "Voucher applied." : "Voucher removed.");
  }

  // ----- order -----
  function placeOrder() {
    if (!items.length) return;
    setPlaced({
      orderNo: "MIM-" + String(Date.now()).slice(-8),
      units: items.reduce((s, i) => s + i.qty, 0),
      shops: c.groups.length,
      method: paymentMethod,
      eta: getShipWindow(),
      name: address.name,
      total: c.total,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() {
    router.post("/logout");
  }

  // ----- render -----
  const chosen = [c.shipV, c.discV].filter(Boolean) as Voucher[];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Syne', sans-serif" }}>
      <Head title={placed ? "Order placed" : "Checkout"} />
      <style>{CSS}</style>

      <Header username={user ? user.name : "Guest"} onLogout={user ? handleLogout : undefined} />

      <main className="vo">
        <div className="page-wrap">
          {placed ? (
            <section className="card done-card">
              <div className="done-icon">{icons.check}</div>
              <h1>Order placed</h1>
              <p className="sub">
                {placed.units} item{placed.units > 1 ? "s" : ""} from {placed.shops} shop{placed.shops > 1 ? "s" : ""}.{" "}
                {placed.method === "gcash" ? "Complete payment in the GCash app." : "Pay in cash upon delivery."}
              </p>
              <div className="done-summary">
                <div className="summary-row"><span>Order number</span><span className="v num">{placed.orderNo}</span></div>
                <div className="summary-row"><span>Payment method</span><span className="v">{placed.method === "gcash" ? "GCash" : "Cash on Delivery"}</span></div>
                <div className="summary-row"><span>Estimated delivery</span><span className="v">{placed.eta}</span></div>
                <div className="summary-row"><span>Deliver to</span><span className="v" style={{ textAlign: "right" }}>{placed.name}</span></div>
                <div className="summary-total"><span className="lbl">Total Payment:</span><span className="v num">{peso(placed.total)}</span></div>
              </div>
              <div className="done-actions">
                <Link href="/homepage" className="place-order-btn">Continue shopping</Link>
              </div>
            </section>
          ) : (
            <div className="stack">
              {/* Delivery address */}
              <section className="card" aria-labelledby="addrTitle">
                <div className="addr-stripe" aria-hidden="true" />
                <div className="addr-body">
                  <h2 className="section-title" id="addrTitle">{icons.pin} Delivery Address</h2>
                  <div className="addr-line">
                    <strong>{address.name} &nbsp;{address.phone}</strong>
                    <span className="addr-text">{address.addr}</span>
                    <span className="tag-default">Default</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => { setAddrDraft(address); setAddrEditing(!addrEditing); }}
                    >
                      {addrEditing ? "Close" : "Change"}
                    </button>
                  </div>
                  {addrEditing && (
                    <div className="edit-form">
                      <div className="frow">
                        <div style={{ flex: 1 }}>
                          <label htmlFor="addrNameInput">Full name</label>
                          <input type="text" id="addrNameInput" value={addrDraft.name} onChange={(e) => setAddrDraft({ ...addrDraft, name: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label htmlFor="addrPhoneInput">Phone number</label>
                          <input type="text" id="addrPhoneInput" value={addrDraft.phone} onChange={(e) => setAddrDraft({ ...addrDraft, phone: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="addrLineInput">Address</label>
                        <input type="text" id="addrLineInput" value={addrDraft.addr} onChange={(e) => setAddrDraft({ ...addrDraft, addr: e.target.value })} />
                      </div>
                      <div className="edit-form-actions">
                        <button type="button" className="edit-cancel" onClick={() => setAddrEditing(false)}>Cancel</button>
                        <button
                          type="button"
                          className="edit-save"
                          onClick={() => {
                            setAddress({
                              name: addrDraft.name.trim() || address.name,
                              phone: addrDraft.phone.trim() || address.phone,
                              addr: addrDraft.addr.trim() || address.addr,
                            });
                            setAddrEditing(false);
                            showToast("Shipping address updated.");
                          }}
                        >
                          Save address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Products ordered */}
              <section className="card" aria-labelledby="prodTitle">
                <div className="cols prod-head">
                  <h2 id="prodTitle">Products Ordered</h2>
                  <span className="cell-r">Unit Price</span>
                  <span className="cell-c">Quantity</span>
                  <span className="cell-r">Item Subtotal</span>
                </div>
                {c.groups.map((g, gi) => (
                  <div className="seller-group" key={g.seller}>
                    <div className="seller-row">
                      <span className="badge">Verified</span>
                      <span className="seller-name">{g.seller}</span>
                      <span className="sep" aria-hidden="true" />
                      <Link href="/messages" className="chat-link">{icons.chat} Chat now</Link>
                    </div>

                    {g.items.map((it) => (
                      <div key={it.id}>
                        <div className="cols order-row">
                          <div className="item-main">
                            <div className="item-thumb">{icons.box}</div>
                            <span className="item-name">{it.name}</span>
                            <span className="item-var">{it.variation}</span>
                          </div>
                          <div className="cell-r num" data-label="Unit Price">{peso(it.unitPrice)}</div>
                          <div className="cell-c num" data-label="Quantity">{it.qty}</div>
                          <div className="cell-r cell-sub num" data-label="Item Subtotal">{peso(it.unitPrice * it.qty)}</div>
                        </div>
                        <div className="cols protect-row">
                          <label className="protect-main">
                            <input
                              type="checkbox"
                              checked={it.protect}
                              onChange={(e) =>
                                setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, protect: e.target.checked } : x)))
                              }
                            />
                            <span>
                              <span className="protect-title">Merchandise Protection</span>
                              <span className="protect-desc">Protect your items from total loss due to accidental damage and liquid damage where the original item is beyond repair.</span>
                            </span>
                          </label>
                          <div className="cell-r num" data-label="Unit Price">{peso(PROTECT_FEE)}</div>
                          <div className="cell-c num" data-label="Quantity">{it.qty}</div>
                          <div className="cell-r num" data-label="Item Subtotal">{peso(PROTECT_FEE * it.qty)}</div>
                        </div>
                      </div>
                    ))}

                    <div className="group-foot">
                      <div className="msg">
                        <label htmlFor={`msg-${gi}`}>Message for Sellers:</label>
                        <input
                          type="text"
                          id={`msg-${gi}`}
                          value={messages[g.seller] || ""}
                          onChange={(e) => setMessages({ ...messages, [g.seller]: e.target.value })}
                          placeholder="Please leave a message…"
                        />
                      </div>
                      <div className="ship">
                        <div className="ship-grid">
                          <strong>Shipping Option:</strong>
                          <div>
                            <strong>{dates}</strong>
                            <div className="ship-sub">Standard Delivery</div>
                            <div className="ship-note">
                              {c.freeShip ? "Free shipping applied — your order is over ₱999.00" : "Free shipping on orders over ₱999.00"}
                            </div>
                          </div>
                        </div>
                        <span className="ship-fee num">{g.shipping === 0 ? "Free" : peso(g.shipping)}</span>
                      </div>
                    </div>
                    <div className="group-total">
                      <span>Order Total ({g.qty} {g.qty === 1 ? "Item" : "Items"}):</span>
                      <span className="v num">{peso(g.total)}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Voucher */}
              <section className="card row-card">
                <div className="row-head">
                  <span className="title">{icons.ticket} Mimoo Voucher</span>
                  <span className="right">
                    {chosen.map((v) => (<span className="v-chip" key={v.id}>{v.chip}</span>))}
                    <button type="button" className="link-btn" ref={openBtnRef} onClick={openModal}>
                      {chosen.length ? "Change" : "Select Voucher"}
                    </button>
                  </span>
                </div>
              </section>

              {/* Payment + totals */}
              <section className="card" aria-labelledby="payTitle">
                <div className="row-card">
                  <div className="row-head">
                    <span className="title" id="payTitle">{icons.card} Payment Method</span>
                    <span className="right">
                      <span className="val">{paymentMethod === "gcash" ? `GCash (${gcashNumber})` : "Cash on Delivery"}</span>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => { setPayOpen(!payOpen); if (payOpen) setPayEditing(false); }}
                      >
                        {payOpen ? "Close" : "Change"}
                      </button>
                    </span>
                  </div>
                  {payOpen && (
                    <div className="pay-list">
                      <label className={`pay-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                        <input type="radio" name="payMethod" checked={paymentMethod === "cod"} onChange={() => { setPaymentMethod("cod"); setPayEditing(false); }} />
                        <span className="icon">COD</span>
                        <div>
                          <div className="lbl">Cash on Delivery</div>
                          <div className="desc">Pay in cash when your order arrives</div>
                        </div>
                      </label>
                      <label className={`pay-option ${paymentMethod === "gcash" ? "selected" : ""}`}>
                        <input type="radio" name="payMethod" checked={paymentMethod === "gcash"} onChange={() => { setPaymentMethod("gcash"); setPayEditing(false); }} />
                        <span className="icon">GCash</span>
                        <div>
                          <div className="lbl">GCash</div>
                          <div className="desc">Pay via e-wallet — confirm in the GCash app after placing your order</div>
                        </div>
                      </label>
                      {paymentMethod === "gcash" && (
                        <>
                          <div className="gcash-number">
                            <span>{gcashNumber}</span>
                            <button type="button" className="link-btn" onClick={() => { setGcashDraft(gcashNumber); setPayEditing(!payEditing); }}>
                              {payEditing ? "Close" : "Edit number"}
                            </button>
                          </div>
                          {payEditing && (
                            <div className="edit-form">
                              <div>
                                <label htmlFor="payNumberInput">GCash-linked mobile number</label>
                                <input type="text" id="payNumberInput" value={gcashDraft} onChange={(e) => setGcashDraft(e.target.value)} />
                              </div>
                              <div className="edit-form-actions">
                                <button type="button" className="edit-cancel" onClick={() => setPayEditing(false)}>Cancel</button>
                                <button
                                  type="button"
                                  className="edit-save"
                                  onClick={() => {
                                    setGcashNumber(gcashDraft.trim() || gcashNumber);
                                    setPayEditing(false);
                                    showToast("GCash number updated.");
                                  }}
                                >
                                  Save number
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="summary">
                  <div className="sum-rows">
                    <div className="summary-row"><span>Merchandise Subtotal</span><span className="v num">{peso(c.merch)}</span></div>
                    <div className="summary-row"><span>Shipping Subtotal</span><span className="v num">{c.shipping === 0 ? "Free" : peso(c.shipping)}</span></div>
                    {c.protection > 0 && <div className="summary-row"><span>Merchandise Protection</span><span className="v num">{peso(c.protection)}</span></div>}
                    {c.shippingDiscount > 0 && <div className="summary-row discount"><span>Shipping Discount</span><span className="v num">−{peso(c.shippingDiscount)}</span></div>}
                    {c.discount > 0 && <div className="summary-row discount"><span>Voucher Discount</span><span className="v num">−{peso(c.discount)}</span></div>}
                    <div className="summary-total"><span className="lbl">Total Payment:</span><span className="v num">{peso(c.total)}</span></div>
                  </div>
                  <div className="place-order-row">
                    <button type="button" className="place-order-btn" disabled={items.length === 0} onClick={placeOrder}>Place Order</button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Voucher picker */}
        {modalOpen && (
          <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <div className="dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="vTitle" tabIndex={-1}>
              <div className="dialog-head">
                <h2 id="vTitle">Select Mimoo Voucher</h2>
                <button type="button" className="help-btn" aria-expanded={voucherHelp} onClick={() => setVoucherHelp(!voucherHelp)}>
                  Voucher Help {icons.info}
                </button>
              </div>
              {voucherHelp && (
                <div className="help-text">You can use one Free Shipping voucher and one Discount voucher per order. Tap a selected voucher again to remove it, then press OK to save.</div>
              )}
              <div className="add-row">
                <span className="lbl">Add Voucher</span>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } }}
                  placeholder="Mimoo voucher code"
                  aria-label="Mimoo voucher code"
                  autoComplete="off"
                />
                <button type="button" className="apply-btn" disabled={!voucherCode.trim()} onClick={applyCode}>APPLY</button>
              </div>
              <div className="dialog-body">
                {([["ship", "Free Shipping"], ["disc", "Discount Vouchers"]] as const).map(([type, heading]) => (
                  <section className="v-section" aria-label={heading} key={type}>
                    <h3>{heading}</h3>
                    <p className="v-hint">1 voucher can be selected</p>
                    <div role="radiogroup" aria-label={heading}>
                      {VOUCHERS.filter((v) => v.type === type).map((v) => {
                        const st = vState(v, c.merch);
                        const sel = pending[v.type] === v.id;
                        return (
                          <div className="v-item" key={v.id}>
                            <div
                              className={`v-card t-${v.type} ${st.ok ? "" : "off"} ${sel ? "sel" : ""}`}
                              role="radio"
                              aria-checked={sel}
                              aria-disabled={!st.ok}
                              tabIndex={st.ok ? 0 : undefined}
                              onClick={() => pickVoucher(v)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickVoucher(v); }
                              }}
                            >
                              <div className="v-stub">
                                <span className="v-ico">{v.type === "ship" ? icons.truck : icons.tag}</span>
                                <span className="v-badge">{v.badge}</span>
                              </div>
                              <div className="v-body">
                                <div className="v-title">{v.title}</div>
                                <div className="v-meta">Min. Spend ₱{v.min.toLocaleString("en-PH")}</div>
                                <div className="v-meta">
                                  Valid Till: {v.valid}
                                  <button
                                    type="button"
                                    className="v-tc"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTermsOpen((t) => (t.includes(v.id) ? t.filter((x) => x !== v.id) : [...t, v.id]));
                                    }}
                                  >
                                    T&amp;C
                                  </button>
                                </div>
                                {termsOpen.includes(v.id) && <div className="v-terms">{v.terms}</div>}
                              </div>
                              {v.qty > 0 && <span className="v-qty">x {v.qty}</span>}
                              <span className={`v-radio ${sel ? "on" : ""}`} aria-hidden="true" />
                            </div>
                            {st.ok ? (
                              v.type === "ship" && c.shipping === 0 && (
                                <div className="v-note">Shipping is already free on this order, so this voucher won't change your total.</div>
                              )
                            ) : (
                              <div className="v-warn">{icons.warn}<span>{st.why}</span></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <div className="dialog-foot">
                <button type="button" className="btn-cancel" onClick={closeModal}>CANCEL</button>
                <button type="button" className="btn-ok" onClick={confirmVouchers}>OK</button>
              </div>
            </div>
          </div>
        )}

        <div className={`toast ${toast.err ? "err" : ""} ${toast.show ? "show" : ""}`} role="status" aria-live="polite">
          {icons.check}
          <span>{toast.msg}</span>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles — scoped under .vo (native CSS nesting) so they don't leak into the
// rest of the app. Palette: "Midnight Meadow".
// ---------------------------------------------------------------------------

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.vo{
  --deep:#2A1B4D; --primary:#4B2E7E; --primary-hover:color-mix(in srgb, var(--primary) 82%, black);
  --tertiary:#B9A6DE; --neutral:#6E6570; --muted:var(--neutral); --ink:var(--deep); --white:#ffffff;
  --lav-50:color-mix(in srgb, var(--tertiary) 12%, white);
  --lav-100:color-mix(in srgb, var(--tertiary) 24%, white);
  --lav-200:color-mix(in srgb, var(--tertiary) 45%, white);
  --panel:color-mix(in srgb, var(--tertiary) 8%, white);
  --ok:#2c7a52; --ok-bg:#e7f5ec; --danger:#b3384f;
  --radius-sm:8px; --radius-md:12px;
  --focus-ring:0 0 0 3px color-mix(in srgb, var(--primary) 28%, transparent);
  --cols:minmax(0,1fr) 120px 100px 130px;

  font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--white); line-height:1.5; overflow-x:hidden;

  *,*::before,*::after{ box-sizing:border-box; }
  h1,h2{ font-family:'Syne',system-ui,sans-serif; margin:0; font-weight:700; }
  h3,p{ margin:0; }
  .num{ font-family:'Poppins',system-ui,sans-serif; }
  img,svg{ display:block; max-width:100%; }
  button{ font-family:inherit; }
  a{ color:inherit; text-decoration:none; }
  :focus-visible{ outline:none; box-shadow:var(--focus-ring); border-radius:6px; }
  input[type="text"]{ font-family:inherit; }

  .page-wrap{ max-width:1220px; margin:0 auto; padding:1.5rem 1.5rem 4rem; }
  .stack > * + *{ margin-top:1rem; }
  .card{ background:var(--white); border:1.5px solid var(--lav-200); border-radius:var(--radius-md); overflow:hidden; }
  .section-title{ display:flex; align-items:center; gap:.55rem; font-size:1.1rem; color:var(--primary); }
  .section-title svg{ width:20px; height:20px; flex:none; }
  .link-btn{ appearance:none; border:none; background:none; cursor:pointer; padding:.2rem .1rem; font-size:.85rem; font-weight:700; color:var(--primary); white-space:nowrap; }
  .link-btn:hover{ text-decoration:underline; }

  .addr-stripe{ height:5px; background:repeating-linear-gradient(115deg, var(--primary) 0 26px, transparent 26px 34px, var(--tertiary) 34px 60px, transparent 60px 68px); }
  .addr-body{ padding:1.3rem 1.5rem 1.5rem; }
  .addr-line{ display:flex; flex-wrap:wrap; align-items:center; gap:.5rem 1.1rem; margin-top:1rem; font-size:.9rem; }
  .addr-line strong{ font-weight:700; }
  .addr-line .addr-text{ color:var(--ink); min-width:0; }
  .tag-default{ font-size:.68rem; font-weight:600; color:var(--primary); border:1px solid var(--primary); border-radius:4px; padding:.05rem .4rem; }
  .addr-line .link-btn{ margin-left:auto; }

  .edit-form{ margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--lav-200); }
  .edit-form .frow{ display:flex; gap:.7rem; margin-bottom:.7rem; }
  .edit-form label{ display:block; font-size:.72rem; font-weight:700; color:var(--muted); margin-bottom:.3rem; }
  .edit-form input{ width:100%; border:1.5px solid var(--lav-200); border-radius:var(--radius-sm); padding:.6rem .75rem; font-size:.83rem; color:var(--ink); }
  .edit-form input:focus{ border-color:var(--primary); outline:none; }
  .edit-form-actions{ display:flex; justify-content:flex-end; gap:.6rem; margin-top:.3rem; }
  .edit-save,.edit-cancel{ appearance:none; border-radius:var(--radius-sm); font-size:.8rem; font-weight:700; padding:.5rem .95rem; cursor:pointer; }
  .edit-save{ border:none; background:var(--primary); color:#fff; }
  .edit-save:hover{ background:var(--primary-hover); }
  .edit-cancel{ border:1.5px solid var(--lav-200); background:var(--white); color:var(--muted); }
  .edit-cancel:hover{ background:var(--lav-50); }

  .cols{ display:grid; grid-template-columns:var(--cols); column-gap:1rem; align-items:center; }
  .cell-r{ text-align:right; }
  .cell-c{ text-align:center; }
  .prod-head{ padding:1.5rem 1.5rem 1.1rem; font-size:.82rem; color:var(--muted); }
  .prod-head h2{ font-size:1.15rem; color:var(--ink); }

  .seller-group{ border-top:1px solid var(--lav-200); }
  .seller-row{ display:flex; align-items:center; gap:.8rem; padding:1.2rem 1.5rem .4rem; font-size:.88rem; }
  .badge{ background:var(--primary); color:#fff; font-size:.7rem; font-weight:700; padding:.15rem .55rem; border-radius:4px; }
  .seller-name{ font-weight:600; }
  .seller-row .sep{ width:1px; height:16px; background:var(--lav-200); }
  .chat-link{ display:inline-flex; align-items:center; gap:.3rem; font-size:.8rem; font-weight:700; color:var(--primary); }
  .chat-link:hover{ text-decoration:underline; }
  .chat-link svg{ width:15px; height:15px; }

  .order-row{ padding:1rem 1.5rem; font-size:.88rem; }
  .item-main{ display:flex; align-items:center; flex-wrap:wrap; gap:.4rem 1.1rem; min-width:0; }
  .item-thumb{ width:56px; height:56px; border-radius:var(--radius-sm); background:var(--lav-50); border:1px solid var(--lav-200); display:flex; align-items:center; justify-content:center; color:var(--tertiary); flex:none; }
  .item-thumb svg{ width:22px; height:22px; }
  .item-name{ font-weight:700; }
  .item-var{ font-size:.8rem; color:var(--muted); }
  .cell-sub{ font-weight:700; }

  .protect-row{ margin:0 1rem 1rem; padding:.9rem .5rem; background:var(--lav-50); border-radius:var(--radius-sm); font-size:.85rem; }
  .protect-main{ display:flex; align-items:flex-start; gap:.8rem; cursor:pointer; min-width:0; }
  .protect-main input{ width:17px; height:17px; margin:.15rem 0 0; accent-color:var(--primary); cursor:pointer; flex:none; }
  .protect-title{ display:block; font-weight:700; color:var(--ink); }
  .protect-desc{ display:block; font-size:.76rem; color:var(--muted); margin-top:.1rem; max-width:52ch; }

  .group-foot{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.5fr); background:var(--panel); border-top:1px dashed var(--lav-200); }
  .msg{ display:flex; align-items:center; gap:1rem; padding:1.3rem 1.5rem; font-size:.85rem; }
  .msg label{ flex:none; }
  .msg input{ flex:1; min-width:0; border:1.5px solid var(--lav-200); border-radius:var(--radius-sm); padding:.7rem .85rem; font-size:.83rem; color:var(--ink); background:var(--white); }
  .msg input:focus{ border-color:var(--primary); outline:none; }
  .ship{ display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding:1.3rem 1.5rem; border-left:1px dashed var(--lav-200); font-size:.85rem; }
  .ship-grid{ display:grid; grid-template-columns:auto 1fr; column-gap:1rem; min-width:0; }
  .ship-grid strong{ font-weight:700; }
  .ship-sub{ font-size:.78rem; margin-top:.2rem; }
  .ship-note{ font-size:.74rem; color:var(--muted); margin-top:.15rem; }
  .ship-fee{ font-weight:700; white-space:nowrap; }
  .group-total{ display:flex; align-items:baseline; justify-content:flex-end; gap:1.4rem; padding:1rem 1.5rem 1.2rem; background:var(--panel); border-top:1px dashed var(--lav-200); font-size:.85rem; color:var(--muted); }
  .group-total .v{ font-size:1.35rem; font-weight:700; color:var(--primary); }

  .row-card{ padding:1.3rem 1.5rem; }
  .row-head{ display:flex; align-items:center; gap:.8rem; }
  .row-head .title{ display:flex; align-items:center; gap:.6rem; font-size:1.02rem; font-weight:700; font-family:'Syne',sans-serif; }
  .row-head .title svg{ width:20px; height:20px; color:var(--primary); flex:none; }
  .row-head .right{ margin-left:auto; display:flex; align-items:center; gap:1rem; font-size:.85rem; flex-wrap:wrap; justify-content:flex-end; }
  .row-head .right .val{ font-weight:600; }
  .v-chip{ font-size:.74rem; font-weight:700; color:var(--primary); background:var(--lav-100); border-radius:999px; padding:.15rem .7rem; white-space:nowrap; }

  .modal-backdrop{ position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:1rem; background:color-mix(in srgb, var(--deep) 55%, transparent); }
  .dialog{ background:var(--white); border-radius:var(--radius-md); width:min(520px,100%); max-height:min(780px, calc(100vh - 2rem)); display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 64px rgba(32,26,51,.4); }
  .dialog:focus{ outline:none; }
  .dialog-head{ display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1.3rem 1.5rem 1.1rem; }
  .dialog-head h2{ font-size:1.15rem; color:var(--deep); }
  .help-btn{ appearance:none; border:none; background:none; cursor:pointer; display:inline-flex; align-items:center; gap:.3rem; font-size:.8rem; color:var(--muted); padding:.2rem; }
  .help-btn:hover{ color:var(--primary); }
  .help-btn svg{ width:14px; height:14px; }
  .help-text{ margin:0 1.5rem .9rem; padding:.7rem .9rem; background:var(--lav-50); border-radius:var(--radius-sm); font-size:.78rem; color:var(--muted); }

  .add-row{ display:flex; align-items:center; gap:.9rem; padding:.55rem 1.5rem; border-top:1px solid var(--lav-200); border-bottom:1px solid var(--lav-200); }
  .add-row .lbl{ font-size:.85rem; font-weight:700; white-space:nowrap; padding-right:.9rem; border-right:1.5px solid var(--lav-200); }
  .add-row input{ flex:1; min-width:0; border:none; background:none; padding:.5rem 0; font-size:.85rem; color:var(--ink); }
  .add-row input::placeholder{ color:var(--tertiary); }
  .add-row input:focus{ outline:none; }
  .apply-btn{ appearance:none; border:none; background:none; cursor:pointer; font-weight:800; font-size:.8rem; letter-spacing:.06em; color:var(--primary); padding:.4rem .2rem; }
  .apply-btn:disabled{ color:var(--lav-200); cursor:not-allowed; }

  .dialog-body{ flex:1; overflow-y:auto; padding:1.1rem 1.5rem 1.3rem; }
  .v-section + .v-section{ margin-top:1.4rem; }
  .v-section h3{ font-family:'Syne',sans-serif; font-size:.95rem; font-weight:700; }
  .v-hint{ font-size:.78rem; color:var(--muted); margin:.2rem 0 .8rem; }
  .v-item + .v-item{ margin-top:.75rem; }

  .v-card{ --vbg:var(--white); position:relative; display:flex; align-items:stretch; min-height:92px; background:var(--vbg); border:1.5px solid var(--lav-200); border-radius:10px; overflow:hidden; cursor:pointer; }
  .v-card:hover{ border-color:var(--tertiary); }
  .v-card.sel{ --vbg:var(--lav-50); border-color:var(--primary); }
  .v-card.off{ cursor:not-allowed; }
  .v-card.off:hover{ border-color:var(--lav-200); }
  .v-card.off .v-stub{ opacity:.5; }
  .v-card.off .v-body{ opacity:.55; }
  .v-stub{ position:relative; width:104px; flex:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.45rem; color:#fff; }
  .v-card.t-ship .v-stub{ background:linear-gradient(135deg, color-mix(in srgb, var(--tertiary) 70%, white), var(--tertiary)); color:var(--deep); }
  .v-card.t-disc .v-stub{ background:linear-gradient(135deg, var(--primary), var(--deep)); }
  .v-stub::after{ content:''; position:absolute; right:-7px; top:50%; width:14px; height:14px; margin-top:-7px; border-radius:50%; background:var(--vbg); }
  .v-ico svg{ width:26px; height:26px; }
  .v-badge{ background:#fff; color:var(--primary); font-size:.68rem; font-weight:800; padding:.12rem .55rem; border-radius:4px; letter-spacing:.02em; }
  .v-body{ flex:1; min-width:0; padding:.9rem 3.4rem .9rem 1.3rem; display:flex; flex-direction:column; justify-content:center; }
  .v-title{ font-size:.9rem; font-weight:700; color:var(--ink); }
  .v-meta{ font-size:.78rem; color:var(--muted); margin-top:.15rem; }
  .v-tc{ appearance:none; border:none; background:none; padding:0 0 0 .2rem; font-size:.78rem; font-weight:700; color:var(--primary); cursor:pointer; }
  .v-tc:hover{ text-decoration:underline; }
  .v-terms{ font-size:.74rem; color:var(--muted); margin-top:.45rem; padding-top:.45rem; border-top:1px dashed var(--lav-200); }
  .v-qty{ position:absolute; top:0; right:0; background:var(--deep); color:#fff; font-size:.68rem; font-weight:700; padding:.15rem .65rem; border-radius:0 0 0 10px; }
  .v-radio{ position:absolute; right:1.1rem; top:50%; transform:translateY(-50%); width:20px; height:20px; border-radius:50%; border:1.5px solid var(--neutral); background:var(--white); }
  .v-radio.on{ border-color:var(--primary); background:var(--primary); box-shadow:inset 0 0 0 4px var(--white); }
  .v-card.off .v-radio{ border-color:var(--lav-200); background:var(--lav-50); }
  .v-warn{ display:flex; align-items:center; gap:.55rem; margin-top:.6rem; padding:.6rem .85rem; background:#fff7e0; border:1px solid #ecd28b; border-radius:8px; font-size:.78rem; color:#7a5b00; }
  .v-warn svg{ width:16px; height:16px; flex:none; }
  .v-note{ font-size:.74rem; color:var(--muted); margin-top:.45rem; padding-left:.2rem; }

  .dialog-foot{ display:flex; gap:.9rem; padding:1rem 1.5rem 1.3rem; border-top:1px solid var(--lav-200); }
  .dialog-foot button{ flex:1; appearance:none; padding:.85rem 1rem; border-radius:var(--radius-sm); font-weight:800; font-size:.85rem; letter-spacing:.06em; cursor:pointer; }
  .btn-cancel{ background:var(--white); border:1.5px solid var(--lav-200); color:var(--deep); }
  .btn-cancel:hover{ background:var(--lav-50); }
  .btn-ok{ border:none; color:#fff; background:linear-gradient(135deg, var(--primary), var(--deep)); }
  .btn-ok:hover{ background:var(--deep); }

  .pay-list{ margin-top:1rem; }
  .pay-option{ display:flex; align-items:center; gap:.85rem; padding:.75rem .8rem; border:1.5px solid var(--lav-200); border-radius:var(--radius-sm); cursor:pointer; margin-bottom:.6rem; }
  .pay-option:hover{ border-color:var(--tertiary); }
  .pay-option.selected{ border-color:var(--primary); background:var(--lav-50); }
  .pay-option input[type="radio"]{ accent-color:var(--primary); width:16px; height:16px; flex:none; cursor:pointer; }
  .pay-option .icon{ width:44px; height:30px; border-radius:6px; background:var(--deep); color:#fff; display:flex; align-items:center; justify-content:center; font-size:.62rem; font-weight:800; letter-spacing:.02em; flex:none; font-family:'Syne',sans-serif; }
  .pay-option .lbl{ font-size:.86rem; font-weight:700; color:var(--ink); }
  .pay-option .desc{ font-size:.75rem; color:var(--muted); margin-top:.1rem; }
  .gcash-number{ display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-top:.9rem; font-size:.8rem; font-weight:700; }

  .summary{ background:var(--panel); border-top:1px solid var(--lav-200); padding:1.5rem; }
  .sum-rows{ width:min(380px,100%); margin-left:auto; }
  .summary-row{ display:flex; align-items:center; justify-content:space-between; font-size:.85rem; color:var(--muted); padding:.45rem 0; }
  .summary-row .v{ color:var(--ink); font-weight:600; }
  .summary-row.discount .v{ color:var(--ok); }
  .summary-total{ display:flex; align-items:center; justify-content:space-between; padding-top:.7rem; margin-top:.4rem; border-top:1px solid var(--lav-200); }
  .summary-total .lbl{ font-size:.88rem; color:var(--muted); }
  .summary-total .v{ font-size:1.9rem; font-weight:800; color:var(--primary); }
  .place-order-row{ display:flex; justify-content:flex-end; margin-top:1.4rem; }
  .place-order-btn{ appearance:none; border:none; background:var(--primary); color:#fff; font-weight:700; font-size:1rem; padding:.9rem 3.2rem; border-radius:var(--radius-sm); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; }
  .place-order-btn:hover{ background:var(--primary-hover); }
  .place-order-btn:disabled{ background:var(--lav-200); color:var(--muted); cursor:not-allowed; }

  .done-card{ padding:2.6rem 1.5rem; text-align:center; }
  .done-icon{ width:56px; height:56px; border-radius:50%; background:var(--ok-bg); color:var(--ok); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; }
  .done-icon svg{ width:26px; height:26px; }
  .done-card h1{ font-size:1.5rem; }
  .done-card .sub{ color:var(--muted); font-size:.9rem; margin-top:.4rem; }
  .done-summary{ width:min(420px,100%); margin:1.6rem auto 0; text-align:left; }
  .done-actions{ margin-top:1.6rem; }
  .done-actions .place-order-btn{ padding:.8rem 2.2rem; font-size:.9rem; }

  .toast{ position:fixed; bottom:1.5rem; right:1.5rem; background:var(--deep); color:#fff; padding:.85rem 1.2rem; border-radius:var(--radius-sm); font-size:.84rem; font-weight:600; display:flex; align-items:center; gap:.6rem; box-shadow:0 10px 30px rgba(32,26,51,.35); transform:translateY(20px); opacity:0; pointer-events:none; transition:transform .25s, opacity .25s; z-index:60; max-width:340px; }
  .toast.show{ transform:translateY(0); opacity:1; }
  .toast svg{ width:16px; height:16px; flex:none; color:#8fd7ac; }
  .toast.err svg{ color:#f0a0ad; }
  @media (prefers-reduced-motion:reduce){ .toast{ transition:none; } }

  @media (max-width:760px){
    .page-wrap{ padding:1rem 1rem 3rem; }
    .prod-head{ grid-template-columns:1fr; }
    .prod-head > span{ display:none; }
    .cols{ grid-template-columns:repeat(3,minmax(0,1fr)); row-gap:.7rem; }
    .cols > :first-child{ grid-column:1 / -1; }
    .cols > [data-label]::before{ content:attr(data-label); display:block; font-size:.68rem; font-weight:500; color:var(--muted); }
    .order-row{ padding:1rem; }
    .seller-row{ padding:1rem 1rem .3rem; flex-wrap:wrap; }
    .protect-row{ margin:0 .6rem 1rem; }
    .group-foot{ grid-template-columns:1fr; }
    .ship{ border-left:none; border-top:1px dashed var(--lav-200); }
    .msg,.ship,.group-total{ padding-left:1rem; padding-right:1rem; }
    .msg{ flex-direction:column; align-items:stretch; gap:.5rem; }
    .seller-row .sep{ display:none; }
    .row-head{ flex-wrap:wrap; }
    .row-card,.addr-body,.summary{ padding-left:1rem; padding-right:1rem; }
    .addr-line .link-btn{ margin-left:0; }
    .edit-form .frow{ flex-direction:column; }
    .place-order-btn{ width:100%; }
    .dialog-head,.add-row,.dialog-body,.dialog-foot{ padding-left:1rem; padding-right:1rem; }
    .help-text{ margin-left:1rem; margin-right:1rem; }
    .help-btn{ white-space:nowrap; }
    .v-stub{ width:80px; }
    .v-body{ padding:.8rem 2.8rem .8rem 1rem; }
    .v-radio{ right:.8rem; }
  }
}
`;