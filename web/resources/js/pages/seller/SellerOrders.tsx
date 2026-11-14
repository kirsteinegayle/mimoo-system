import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import SellerShell from "@/layouts/seller/seller-shell";
import TrackingLine from "@/components/tracking-line";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Stage = "new" | "to_prepare" | "awaiting_pickup" | "in_transit" | "delivered" | "cancelled";
type TabKey = "all" | Stage;

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  stock_left?: number; // remaining stock AFTER checkout deduction (info only)
  variant_id?: string | null;
  variant_snapshot?: {
    id: string;
    combination: Record<string, string>;
    sku: string;
    price: number;
    stock: number;
  } | null;
}

interface Tracking {
  carrier: string;
  tracking_no: string;
  last_update: string;
  last_location: string;
  last_time: string;
}

interface SellerOrder {
  id: number;
  order_number: string; // e.g. "#12512"
  buyer: string;
  phone: string;
  address: string;
  stage: Stage;
  date: string; // display, e.g. "Sep 17, 2026"
  created_at: string; // ISO, used for sorting
  payment: string; // "Cash on Delivery" | "GCash" | ...
  shipping: number;
  note?: string | null;
  items: OrderItem[];
  weight?: number | null;
  waybill_no?: string | null;
  waybill_printed?: boolean;
  tracking?: Tracking | null;
  delivered_on?: string | null;
  is_new?: boolean;
  total?: number; // Total from backend (includes items + shipping)
  // Delivery tracking from orders.tracking_* (display only)
  tracking_status?: string | null;
  tracking_message?: string | null;
  tracking_updated_at?: string | null;
}

interface PageProps {
  orders: SellerOrder[];
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

const STAGES: Stage[] = ["new", "to_prepare", "awaiting_pickup", "in_transit", "delivered", "cancelled"];
const LABEL: Record<Stage, string> = {
  new: "New",
  to_prepare: "To Prepare",
  awaiting_pickup: "Awaiting Pickup",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const PILL: Record<Stage, string> = { new: "gold", to_prepare: "gold", awaiting_pickup: "logi", in_transit: "accent", delivered: "ok", cancelled: "bad" };
const NEXT: Record<string, Stage | undefined> = { accept: "to_prepare", pack: "awaiting_pickup" };
const DONE_MSG: Record<string, string> = {
  accept: "Order accepted. Now preparing.",
  pack: "Order packed and shipped. Now in transit to buyer.",
};

const peso = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const subtotal = (o: SellerOrder) => o.items.reduce((s, i) => s + i.qty * i.price, 0);
const orderTotal = (o: SellerOrder) => o.total ?? (subtotal(o) + (o.shipping ?? 0)); // Use backend total if available
const waybillNo = (o: SellerOrder) => {
  const waybill = o.waybill_no || "MMO-" + o.order_number.replace("#", "");
  console.log('waybillNo function called:', {
    order_id: o.id,
    order_number: o.order_number,
    waybill_no_from_object: o.waybill_no,
    computed_result: waybill,
  });
  return waybill;
};
const defaultWeight = (o: SellerOrder) => o.weight ?? Math.round(o.items.reduce((s, i) => s + i.qty * 0.3, 0) * 10) / 10;

const S = { fill: "none", viewBox: "0 0 24 24" } as const;
const IBox = () => (<svg {...S}><path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M4 8l8 4 8-4M12 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>);
const ICheck = () => (<svg {...S}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IWarn = () => (<svg {...S}><path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12 10v5M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
const IPrint = () => (<svg {...S}><path d="M6 9V4h12v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M6 14h12v6H6v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>);
const IClose = () => (<svg {...S}><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>);
const IWaybill = () => (<svg {...S}><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 4v16M16 9H8M16 12H8M16 15H8" stroke="currentColor" strokeWidth="1.6" /></svg>);

const TAB_ICON: Record<TabKey, ReactNode> = {
  all: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
  new: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" strokeLinejoin="round" /><path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" /></svg>),
  to_prepare: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" strokeLinejoin="round" /><path d="M4 8l8 4 8-4M12 12v8" strokeLinejoin="round" /></svg>),
  awaiting_pickup: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><path d="M3 6h11v9H3V6Z" strokeLinejoin="round" /><path d="M14 10h4l3 3v2h-7v-5Z" strokeLinejoin="round" /><circle cx="7" cy="17" r="1.6" /><circle cx="17.5" cy="17" r="1.6" /></svg>),
  in_transit: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" strokeLinejoin="round" /><circle cx="12" cy="9.5" r="2.2" /></svg>),
  delivered: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.3 2.3L16 10" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  cancelled: (<svg {...S} stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M8 8l8 8M16 8l-8 8" strokeLinecap="round" /></svg>),
};

const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

// ---------------------------------------------------------------------------
// Waybill (Code 39 barcode + label). Rendered with React so buyer text is
// escaped automatically, and reused as static markup for printing.
// ---------------------------------------------------------------------------

const C39: Record<string, string> = { "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn", "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw", "8": "wnnwnnwnn", "9": "nnwwnnwnn", A: "wnnnnwnnw", B: "nnwnnwnnw", C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn", F: "nnwnwwnnn", G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn", K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww", O: "wnnnwnnwn", P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn", S: "nnwnnnwwn", T: "nnnnwnwwn", U: "wwnnnnnnw", V: "nwwnnnnnw", W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn", Z: "nwwnwnnnn", "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn" };

function Barcode({ text }: { text: string }) {
  const data = "*" + text.toUpperCase() + "*";
  let x = 0;
  const bars: ReactNode[] = [];
  for (const ch of data) {
    const pat = C39[ch];
    if (!pat) continue;
    for (let i = 0; i < 9; i++) {
      const w = pat[i] === "w" ? 3 : 1;
      if (i % 2 === 0) bars.push(<rect key={`${x}-${i}`} x={x} y={0} width={w} height={60} fill="#111" />);
      x += w;
    }
    x += 1;
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${x} 60`} preserveAspectRatio="none" style={{ width: "100%", height: 64, display: "block" }}>
      {bars}
    </svg>
  );
}

function Waybill({ o, weight }: { o: SellerOrder; weight: number }) {
  const cod = /cash|cod/i.test(o.payment);
  const no = waybillNo(o);
  
  console.log('Waybill component rendering:', {
    order_id: o.id,
    order_number: o.order_number,
    waybill_no_from_object: o.waybill_no,
    computed_waybill_no: no,
  });
  
  // Additional log RIGHT before QR code generation
  console.log(`🔷 QR CODE VALUE FOR ORDER ${o.id}: "${no}"`);
  
  return (
    <div className="wb">
      <div className="wb-top"><span className="wb-brand">MIMOO.</span><span className="wb-tag">Shipping label · Standard</span></div>
      <div className="wb-code">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Barcode text={no} />
            <div className="no">{no}</div>
          </div>
          <div style={{ width: '80px', height: '80px', border: '2px solid #ddd', padding: '4px', background: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QRCodeSVG value={no} size={72} level="M" />
          </div>
        </div>
      </div>
      <div className="wb-row wb-to"><div className="lbl">Ship to</div><div className="nm">{o.buyer}</div><div>{o.phone}</div><div>{o.address}</div></div>
      <div className="wb-grid">
        <div><div className="lbl">Order</div><b>{o.order_number}</b><br />{o.date}</div>
        <div><div className="lbl">Weight</div><b>{weight} kg</b></div>
      </div>
      <div className="wb-row"><div className="lbl">Contents</div>{o.items.map((i, k) => (<div key={k}>{i.name} ×{i.qty}</div>))}</div>
      <div className={`wb-cod ${cod ? "" : "paid"}`}>{cod ? "COLLECT " + peso(orderTotal(o)) : "PAID · " + o.payment.toUpperCase()}</div>
    </div>
  );
}

function printWaybill(o: SellerOrder, weight: number) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Waybill ${waybillNo(o)}</title><style>@page{size:A6;margin:6mm}body{margin:0}${WB_CSS}</style></head><body>${renderToStaticMarkup(<Waybill o={o} weight={weight} />)}</body></html>`;
  const fr = document.createElement("iframe");
  fr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(fr);
  fr.contentDocument?.open();
  fr.contentDocument?.write(html);
  fr.contentDocument?.close();
  setTimeout(() => {
    fr.contentWindow?.focus();
    fr.contentWindow?.print();
    setTimeout(() => fr.remove(), 1500);
  }, 250);
}

// ---------------------------------------------------------------------------
// Order modal (the "eye" icon)
// ---------------------------------------------------------------------------

function OrderModal({
  order,
  busy,
  onClose,
  onAct,
  onOpenWaybill,
}: {
  order: SellerOrder;
  busy: boolean;
  onClose: () => void;
  onAct: (action: string, payload?: Record<string, unknown>) => void;
  onOpenWaybill: (weight: number) => void;
}) {
  const [packed, setPacked] = useState<boolean[]>(() => order.items.map(() => false));
  const [weight, setWeight] = useState<string>(String(defaultWeight(order)));

  const packedCount = packed.filter(Boolean).length;
  const w = parseFloat(weight) > 0 ? parseFloat(weight) : defaultWeight(order);

  function markPacked() {
    if (!packed.every(Boolean)) return toast.error("Check off every item before marking as packed.");
    if (!order.waybill_printed) return toast.error("Print the waybill / shipping label first.");
    onAct("pack", { weight: w });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="omTitle">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><IClose /></button>

        <div className="modal-head">
          <div>
            <h3 id="omTitle">Order {order.order_number}</h3>
            <div className="sub">Placed {order.date}</div>
          </div>
        </div>

        {order.stage === "new" && (
          <div className="stage-note gold"><IWarn /><span>New order. Review the details, then accept it to start preparing.</span></div>
        )}
        {order.stage === "to_prepare" && (
          <div className="stage-note gold"><IBox /><span>Pack every item, confirm the parcel weight, then print the waybill. Once packed, mark as shipped.</span></div>
        )}
        {order.stage === "in_transit" && (
          <div className="stage-note accent">{TAB_ICON.in_transit}<span>In transit. You'll be notified once the buyer receives this order.</span></div>
        )}
        {order.stage === "delivered" && (
          <div className="stage-note ok"><ICheck /><span>Delivered {order.delivered_on}. Confirmed once the buyer received the order.</span></div>
        )}
        {order.stage === "cancelled" && (
          <div className="stage-note bad"><svg {...S}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg><span>This order was cancelled and will not be processed.</span></div>
        )}

        {/* Delivery tracking (renders nothing when the order has no tracking yet) */}
        <TrackingLine tracking={order} className="mb-3" />

        <div className="detail-section">
          <h4>Order items</h4>
          {order.items.map((it, i) => (
            <div className="order-item-row" key={i}>
              <div className="oi-thumb"><IBox /></div>
              <div>
                <div className="oi-name">{it.name}</div>
                {it.variant_snapshot && it.variant_snapshot.combination && (
                  <div className="oi-sub" style={{ marginBottom: '0.25rem' }}>
                    {Object.entries(it.variant_snapshot.combination).map(([key, val], idx) => (
                      <span key={key}>
                        {idx > 0 && ', '}
                        <strong>{key}:</strong> {val}
                      </span>
                    ))}
                  </div>
                )}
                <div className="oi-sub">Qty {it.qty} · {peso(it.price)} each</div>
              </div>
              <div className="oi-total">{peso(it.qty * it.price)}</div>
            </div>
          ))}
          <div style={{ paddingTop: ".5rem" }}>
            <div className="sum-row"><span>Subtotal</span><span className="num">{peso(subtotal(order))}</span></div>
            <div className="sum-row"><span>Shipping fee</span><span className="num">{peso(order.shipping)}</span></div>
            <div className="sum-row"><span>Payment</span><span>{order.payment}</span></div>
            <div className="sum-row total"><span>Order total</span><span className="num">{peso(orderTotal(order))}</span></div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Shipping to</h4>
          <div className="detail-item">
            <div className="v"><strong>{order.buyer}</strong> · <span className="num">{order.phone}</span></div>
            <div className="v" style={{ fontWeight: 500 }}>{order.address}</div>
          </div>
        </div>

        {/* ---------- stage specific ---------- */}
        {order.stage === "new" && (
          <>
            {order.items.some((i) => i.stock_left !== undefined) && (
              <div className="detail-section">
                <h4>Stock after this order</h4>
                {order.items.map((it, i) =>
                  it.stock_left === undefined ? null : (
                    <div key={i} className={`stock-line ${it.stock_left > 0 ? "stock-ok" : "stock-bad"}`}>
                      {it.stock_left > 0 ? <ICheck /> : <IWarn />}
                      <span>{it.name}: {it.stock_left > 0 ? `${it.stock_left} left` : "now out of stock"}</span>
                    </div>
                  )
                )}
                <p className="oi-sub" style={{ marginTop: ".4rem" }}>Stock was already reserved when the buyer checked out.</p>
              </div>
            )}
            {order.note && (
              <div className="detail-section"><h4>Buyer note</h4><div className="note-box">{order.note}</div></div>
            )}
          </>
        )}

        {order.stage === "to_prepare" && (
          <>
            <div className="detail-section">
              <h4>Pack items <span className="pack-progress">{packedCount} of {order.items.length} packed</span></h4>
              <div className="pack-bar"><i style={{ width: `${(packedCount / order.items.length) * 100}%` }} /></div>
              {order.items.map((it, i) => (
                <label className="pack-check" key={i}>
                  <input type="checkbox" checked={packed[i]} onChange={(e) => setPacked((p) => p.map((v, k) => (k === i ? e.target.checked : v)))} />
                  <span>{it.name} <b className="num">×{it.qty}</b></span>
                </label>
              ))}
              <button type="button" className="tlink" style={{ marginTop: ".4rem" }} onClick={() => setPacked(order.items.map(() => true))}>Mark all as packed</button>
            </div>
            <div className="detail-section">
              <h4>Shipping label</h4>
              <div className="pickup-form">
                <div className="field">
                  <label htmlFor="pw">Parcel weight (kg)</label>
                  <input id="pw" type="number" step="0.1" min="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="field">
                  <div className={`wb-state ${order.waybill_printed ? "done" : "todo"}`}>
                    {order.waybill_printed ? (<><ICheck />Waybill {waybillNo(order)} printed</>) : "Waybill not printed yet"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {order.stage === "in_transit" && order.tracking && (
          <div className="detail-section">
            <h4>Shipment status</h4>
            <div className="detail-grid">
              <div className="detail-item"><div className="k">Courier</div><div className="v">{order.tracking.carrier}</div></div>
              <div className="detail-item"><div className="k">Tracking no.</div><div className="v num">{order.tracking.tracking_no}</div></div>
              <div className="detail-item full"><div className="k">Last update</div><div className="v">{order.tracking.last_update}, {order.tracking.last_location}</div></div>
              <div className="detail-item full"><div className="k">Updated</div><div className="v">{order.tracking.last_time}</div></div>
            </div>
          </div>
        )}

        {/* ---------- actions ---------- */}
        <div className="modal-actions">
          {order.stage === "new" && (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onAct("accept")}><ICheck />Accept &amp; start preparing</button>
          )}
          {order.stage === "to_prepare" && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => onOpenWaybill(w)}><IPrint />{order.waybill_printed ? "View / reprint waybill" : "Print waybill"}</button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={markPacked}><ICheck />Mark as packed & ship</button>
            </>
          )}
          {(order.stage === "in_transit" || order.stage === "delivered" || order.stage === "cancelled") && (
            <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SellerOrders({ orders: initial }: PageProps) {
  const [orders, setOrders] = useState<SellerOrder[]>(initial ?? []);
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [openId, setOpenId] = useState<number | null>(null);
  const [wb, setWb] = useState<{ id: number; weight: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch latest orders from API on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/orders', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      // Map API data to SellerOrder format
      const mappedOrders = (data.orders || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        buyer: order.buyer_name,
        phone: order.buyer_phone || 'N/A',
        address: order.buyer_address || 'N/A',
        stage: mapStatusToStage(order.status),
        date: order.created_at,
        created_at: order.created_at,
        payment: order.payment_method || 'Cash on Delivery',
        shipping: 0, // Not used - total from backend already includes shipping
        note: order.note || null,
        items: order.items || [],
        weight: null,
        waybill_no: order.waybill_number || null,
        waybill_printed: !!order.waybill_printed_at,
        tracking: null,
        delivered_on: null,
        is_new: false,
        total: order.total, // Add total from backend
        tracking_status: order.tracking_status ?? null,
        tracking_message: order.tracking_message ?? null,
        tracking_updated_at: order.tracking_updated_at ?? null,
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  function mapStatusToStage(status: string): Stage {
    switch (status) {
      case 'pending':
        return 'new';
      case 'paid':
        return 'to_prepare';
      case 'packed':
        return 'awaiting_pickup';
      case 'shipped':
      case 'in_transit': // assigned to a courier company
        return 'in_transit';
      case 'completed':
        return 'delivered';
      case 'cancelled':
      case 'failed':
        return 'cancelled';
      default:
        return 'new';
    }
  }

  const openOrder = orders.find((o) => o.id === openId) ?? null;
  const wbOrder = wb ? orders.find((o) => o.id === wb.id) ?? null : null;

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: orders.length, new: 0, to_prepare: 0, awaiting_pickup: 0, in_transit: 0, delivered: 0 };
    orders.forEach((o) => (c[o.stage] += 1));
    return c;
  }, [orders]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => (tab === "all" || o.stage === tab) && (!q || o.order_number.toLowerCase().includes(q) || o.buyer.toLowerCase().includes(q)))
      .sort((a, b) => {
        const d = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sort === "oldest" ? -d : d;
      });
  }, [orders, tab, search, sort]);

  // Esc closes the top-most modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (wb) setWb(null);
      else setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [wb]);

  function openModal(o: SellerOrder) {
    setOpenId(o.id);
    if (o.is_new) setOrders((p) => p.map((x) => (x.id === o.id ? { ...x, is_new: false } : x)));
  }

  async function act(o: SellerOrder, action: string, payload: Record<string, unknown> = {}) {
    setBusy(true);
    try {
      const res = await fetch(`/api/seller/orders/${o.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": csrf() },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not update the order.");
        return false;
      }
      const stage = NEXT[action];
      setOrders((prev) =>
        prev.map((x) =>
          x.id === o.id
            ? { 
                ...x, 
                ...(action === "waybill_printed" ? { waybill_printed: true } : {}), 
                ...(stage ? { stage } : {}), 
                ...(data.order ?? {}),
                // Map backend field names to frontend
                ...(data.order?.waybill_number ? { waybill_no: data.order.waybill_number } : {}),
              }
            : x
        )
      );
      if (DONE_MSG[action]) toast.success(data.message || `${o.order_number}: ${DONE_MSG[action]}`);
      if (stage) setOpenId(null);
      return true;
    } catch {
      toast.error("Network error. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <SellerShell active="orders">
      <Head title="Order Management" />
      <div className="so">
        <style>{CSS}</style>

        <div className="topbar">
          <h1>Order Management</h1>
          <p className="sub">Review new orders, prepare and hand them to the courier, and track them until they are delivered.</p>
        </div>

        {/* Status tabs */}
        <div className="status-tabs-wrap">
          <div className="status-tabs" role="tablist" aria-label="Order status">
            {(["all", ...STAGES] as TabKey[]).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={`status-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {TAB_ICON[t]}
                {t === "all" ? "All orders" : LABEL[t]}
                <span className="count">{counts[t]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="order-toolbar">
          <label className="table-search">
            <svg {...S}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m21 21-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or buyer…" aria-label="Search orders" />
          </label>
          <div className="sort-wrap">
            <label htmlFor="osort">Sort:</label>
            <select id="osort" className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Order</th><th>Buyer</th><th>Item</th><th>Total</th><th>Status</th><th>Date</th><th /></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="empty-row"><td colSpan={7}>No orders in this status.</td></tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id}>
                    <td className="cell-strong num">{o.is_new && <span className="new-dot" title="New order" />}{o.order_number}</td>
                    <td className="cell-muted">{o.buyer}</td>
                    <td className="cell-muted">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                    <td className="num">{peso(orderTotal(o))}</td>
                    <td><span className={`mini-pill ${PILL[o.stage]}`}>{LABEL[o.stage]}</span></td>
                    <td className="cell-muted num">{o.date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        {/* Waybill button - only show for packed, shipped, in_transit, delivered */}
                        {['awaiting_pickup', 'in_transit', 'delivered'].includes(o.stage) && o.waybill_no && (
                          <button 
                            type="button" 
                            className="icon-btn waybill-btn" 
                            onClick={() => setWb({ id: o.id, weight: defaultWeight(o) })}
                            aria-label={`View waybill ${o.order_number}`}
                            title="View waybill"
                          >
                            <IWaybill />
                          </button>
                        )}
                        {/* Eye button - view order details */}
                        <button type="button" className="icon-btn" onClick={() => openModal(o)} aria-label={`Open order ${o.order_number}`}>
                          <svg {...S}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Eye-icon modal */}
        {openOrder && (
          <OrderModal
            key={openOrder.id + openOrder.stage}
            order={openOrder}
            busy={busy}
            onClose={() => setOpenId(null)}
            onAct={(action, payload) => act(openOrder, action, payload)}
            onOpenWaybill={(weight) => {
              console.log('Opening waybill - Order data:', {
                id: openOrder.id,
                order_number: openOrder.order_number,
                waybill_no: openOrder.waybill_no,
                waybill_printed: openOrder.waybill_printed,
                computed: waybillNo(openOrder),
              });
              setWb({ id: openOrder.id, weight });
            }}
          />
        )}

        {/* Waybill modal */}
        {wbOrder && wb && (
          <div className="modal-overlay" style={{ zIndex: 62 }} onClick={(e) => e.target === e.currentTarget && setWb(null)}>
            <div className="modal" style={{ maxWidth: 520 }} role="dialog" aria-modal="true" aria-label="Waybill">
              <button type="button" className="modal-close" onClick={() => setWb(null)} aria-label="Close"><IClose /></button>
              <h3 style={{ marginBottom: "1rem" }}>Waybill / shipping label</h3>
              <div className="wb-preview"><Waybill o={wbOrder} weight={wb.weight} /></div>
              <div className="modal-actions">
                <button type="button" className="tlink" onClick={() => setWb(null)}>Close</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    printWaybill(wbOrder, wb.weight);
                    setWb(null);
                    const ok = await act(wbOrder, "waybill_printed", { weight: wb.weight });
                    if (ok) toast.success(`Waybill ${waybillNo(wbOrder)} sent to printer.`);
                  }}
                >
                  <IPrint />Print label
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerShell>
  );
}

SellerOrders.layout = (page: ReactNode) => page;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const WB_CSS = `.wb{font-family:Inter,Arial,sans-serif;color:#111;border:2px solid #111;max-width:420px;margin:0 auto;background:#fff}
.wb-top{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:2px solid #111}
.wb-brand{font-weight:800;font-size:20px;letter-spacing:.04em}.wb-tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.wb-code{text-align:center;padding:12px 14px;border-bottom:2px solid #111}
.wb-code .no{font-family:monospace;font-size:13px;font-weight:700;letter-spacing:.12em;margin-top:5px}
.wb-row{padding:10px 14px;border-bottom:1px solid #111;font-size:12px;line-height:1.45}
.wb-row .lbl{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#555;margin-bottom:2px}
.wb-to .nm{font-size:16px;font-weight:800}
.wb-grid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #111}
.wb-grid>div{padding:10px 14px;font-size:12px}.wb-grid>div+div{border-left:1px solid #111}
.wb-grid .lbl{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#555;margin-bottom:2px}
.wb-cod{padding:10px 14px;text-align:center;font-weight:800;font-size:18px;background:#111;color:#fff}
.wb-cod.paid{background:#fff;color:#111;font-size:15px}`;

const CSS = `
.so{
  --deep:#2A1B4D; --primary:#4B2E7E; --primary-hover:color-mix(in srgb, var(--primary) 82%, black);
  --accent:color-mix(in srgb, var(--primary) 55%, #B9A6DE 45%); --accent-soft:#B9A6DE; --muted:#6E6570; --ink:var(--deep);
  --lav-50:color-mix(in srgb, var(--accent-soft) 12%, white);
  --lav-100:color-mix(in srgb, var(--accent-soft) 24%, white);
  --lav-200:color-mix(in srgb, var(--accent-soft) 44%, white);
  --gold:#a9752b; --gold-bg:#f7ecd6; --ok:#2c7a52; --ok-bg:#e7f5ec; --danger:#b3384f; --logi:#2f6f8f; --logi-bg:#e4eef3;
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px;
  color:var(--ink); font-family:'Inter',system-ui,sans-serif;

  *,*::before,*::after{ box-sizing:border-box; }
  h1,h3{ font-family:'Syne',system-ui,sans-serif; margin:0; font-weight:700; }
  p{ margin:0; }
  .num{ font-family:'Poppins',system-ui,sans-serif; }
  button{ font-family:inherit; }

  .topbar{ margin-bottom:1.25rem; }
  .topbar h1{ font-size:1.4rem; letter-spacing:.01em; }
  .topbar .sub{ font-size:.82rem; color:var(--muted); margin-top:.35rem; max-width:66ch; }
  .card{ background:#fff; border:1.5px solid var(--lav-200); border-radius:var(--radius-md); padding:1.4rem; min-width:0; overflow-x:auto; }

  .btn{ appearance:none; border:none; cursor:pointer; font-weight:700; font-size:.84rem; padding:.62rem 1.15rem; border-radius:var(--radius-sm); display:inline-flex; align-items:center; gap:.45rem; }
  .btn svg{ width:15px; height:15px; }
  .btn:disabled{ opacity:.55; cursor:not-allowed; }
  .btn-primary{ background:var(--primary); color:#fff; }
  .btn-primary:hover:not(:disabled){ background:var(--primary-hover); }
  .btn-ghost{ background:var(--lav-100); color:var(--ink); }
  .btn-ghost:hover{ background:var(--lav-200); }
  .tlink{ appearance:none; border:none; background:none; padding:0; font-size:.8rem; font-weight:700; color:var(--primary); cursor:pointer; }
  .tlink:hover{ text-decoration:underline; }

  .status-tabs-wrap{ border-bottom:1.5px solid var(--lav-200); margin-bottom:1rem; overflow-x:auto; scrollbar-width:none; }
  .status-tabs-wrap::-webkit-scrollbar{ display:none; }
  .status-tabs{ display:flex; }
  .status-tab{ display:flex; align-items:center; gap:.45rem; background:none; border:none; padding:.6rem .9rem; font-size:.82rem; font-weight:600; color:var(--muted); white-space:nowrap; border-bottom:2px solid transparent; margin-bottom:-1.5px; cursor:pointer; }
  .status-tab svg{ width:14px; height:14px; flex:none; opacity:.7; }
  .status-tab .count{ font-family:'Poppins',sans-serif; font-weight:700; font-size:.64rem; color:var(--muted); background:var(--lav-100); min-width:18px; height:18px; padding:0 5px; border-radius:99px; display:inline-flex; align-items:center; justify-content:center; }
  .status-tab:hover{ color:var(--ink); }
  .status-tab.active{ color:var(--primary); border-bottom-color:var(--primary); font-weight:700; }
  .status-tab.active svg{ opacity:1; }
  .status-tab.active .count{ background:var(--primary); color:#fff; }

  .order-toolbar{ display:flex; align-items:center; gap:.7rem; margin-bottom:.9rem; flex-wrap:wrap; }
  .table-search{ display:flex; align-items:center; gap:.5rem; background:#fff; border:1.5px solid var(--lav-200); border-radius:var(--radius-sm); padding:.52rem .8rem; flex:1; min-width:200px; max-width:340px; }
  .table-search svg{ width:15px; height:15px; color:var(--muted); flex:none; }
  .table-search input{ border:none; outline:none; background:transparent; font-size:.82rem; width:100%; color:var(--ink); caret-color:var(--primary); }
  .sort-wrap{ display:flex; align-items:center; gap:.45rem; margin-left:auto; }
  .sort-wrap label{ font-size:.76rem; font-weight:600; color:var(--muted); }
  .sort-select{ border:1.5px solid var(--lav-200); border-radius:var(--radius-sm); padding:.5rem .75rem; font-size:.8rem; font-weight:600; color:var(--ink); background:#fff; cursor:pointer; }

  .data-table{ width:100%; border-collapse:collapse; min-width:760px; }
  .data-table thead th{ text-align:left; font-size:.7rem; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); padding:.65rem .5rem; border-bottom:1px solid var(--lav-200); }
  .data-table tbody td{ padding:.8rem .5rem; border-bottom:1px solid var(--lav-200); font-size:.84rem; vertical-align:middle; }
  .data-table tbody tr:last-child td{ border-bottom:none; }
  .cell-strong{ font-weight:700; }
  .cell-muted{ color:var(--muted); font-size:.78rem; }
  .mini-pill{ font-size:.76rem; font-weight:800; text-transform:uppercase; letter-spacing:.02em; white-space:nowrap; }
  .mini-pill.gold{ color:var(--gold); } .mini-pill.accent{ color:var(--primary); } .mini-pill.ok{ color:var(--ok); } .mini-pill.logi{ color:var(--logi); } .mini-pill.bad{ color:#DC2626; }
  .icon-btn{ appearance:none; border:1.5px solid var(--lav-200); background:#fff; cursor:pointer; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--muted); transition:all .15s ease; }
  .icon-btn:hover{ background:var(--lav-100); color:var(--primary); }
  .icon-btn.waybill-btn:hover{ background:color-mix(in srgb, var(--logi) 12%, white); color:var(--logi); border-color:var(--logi); }
  .icon-btn svg{ width:15px; height:15px; }
  .empty-row td{ text-align:center; padding:2.2rem .5rem; color:var(--muted); font-size:.85rem; }
  .new-dot{ display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--primary); margin-right:.45rem; }

  .modal-overlay{ position:fixed; inset:0; background:rgba(32,26,51,.55); display:flex; align-items:center; justify-content:center; padding:1.5rem; z-index:50; }
  .modal{ background:#fff; border-radius:var(--radius-lg); width:100%; max-width:640px; max-height:88vh; overflow-y:auto; padding:1.6rem; position:relative; }
  .modal-close{ position:absolute; top:1.2rem; right:1.2rem; width:32px; height:32px; border-radius:8px; border:1.5px solid var(--lav-200); background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--muted); }
  .modal-close:hover{ background:var(--lav-100); color:var(--primary); }
  .modal-close svg{ width:16px; height:16px; }
  .modal-head{ margin-bottom:1.1rem; padding-right:2rem; }
  .modal-head h3{ font-size:1.05rem; }
  .modal-head .sub{ font-size:.8rem; color:var(--muted); margin-top:.25rem; }
  .stage-note{ display:flex; align-items:center; gap:.6rem; padding:.75rem .9rem; border-radius:var(--radius-sm); font-size:.82rem; font-weight:600; margin-bottom:1.2rem; }
  .stage-note svg{ width:16px; height:16px; flex:none; }
  .stage-note.gold{ background:var(--gold-bg); color:var(--gold); }
  .stage-note.accent{ background:color-mix(in srgb, var(--primary) 14%, white); color:var(--primary); }
  .stage-note.logi{ background:var(--logi-bg); color:var(--logi); }
  .stage-note.ok{ background:var(--ok-bg); color:var(--ok); }
  .stage-note.bad{ background:#FEE2E2; color:#DC2626; }

  .detail-section{ margin-bottom:1.2rem; }
  .detail-section h4{ font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:0 0 .7rem; }
  .detail-grid{ display:grid; grid-template-columns:1fr 1fr; gap:.8rem 1.2rem; }
  .detail-item .k{ font-size:.72rem; color:var(--muted); margin-bottom:.15rem; }
  .detail-item .v{ font-size:.85rem; font-weight:700; }
  .detail-item.full{ grid-column:1 / -1; }
  .order-item-row{ display:flex; align-items:center; gap:.9rem; padding:.7rem 0; border-bottom:1px solid var(--lav-200); }
  .order-item-row:last-of-type{ border-bottom:none; }
  .oi-thumb{ width:46px; height:46px; border-radius:var(--radius-sm); background:var(--lav-50); border:1px solid var(--lav-200); display:flex; align-items:center; justify-content:center; color:var(--accent-soft); flex:none; }
  .oi-thumb svg{ width:20px; height:20px; }
  .oi-name{ font-size:.85rem; font-weight:700; }
  .oi-sub{ font-size:.76rem; color:var(--muted); margin-top:.1rem; }
  .oi-total{ font-size:.85rem; font-weight:700; margin-left:auto; }
  .sum-row{ display:flex; justify-content:space-between; font-size:.82rem; padding:.22rem 0; color:var(--muted); }
  .sum-row.total{ color:var(--ink); font-weight:800; border-top:1px solid var(--lav-200); margin-top:.35rem; padding-top:.6rem; font-size:.92rem; }
  .stock-line{ display:flex; align-items:center; gap:.5rem; font-size:.83rem; padding:.25rem 0; }
  .stock-line svg{ width:16px; height:16px; flex:none; }
  .stock-ok{ color:var(--ok); } .stock-bad{ color:var(--danger); font-weight:600; }
  .note-box{ background:var(--gold-bg); color:var(--gold); border-radius:var(--radius-sm); padding:.65rem .85rem; font-size:.82rem; font-weight:600; }

  .pack-check{ display:flex; align-items:center; gap:.6rem; padding:.3rem 0; font-size:.84rem; }
  .pack-check input{ width:17px; height:17px; accent-color:var(--primary); cursor:pointer; }
  .pack-progress{ font-weight:700; color:var(--primary); text-transform:none; letter-spacing:0; margin-left:.4rem; }
  .pack-bar{ height:6px; background:var(--lav-100); border-radius:99px; overflow:hidden; margin-bottom:.6rem; }
  .pack-bar i{ display:block; height:100%; background:var(--ok); transition:width .2s; }
  .pickup-form{ display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
  .pickup-form .field label{ font-size:.72rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; display:block; margin-bottom:.35rem; }
  .pickup-form select,.pickup-form input{ width:100%; border:1.5px solid var(--lav-200); border-radius:var(--radius-sm); padding:.6rem .8rem; font-size:.84rem; color:var(--ink); background:#fff; caret-color:var(--primary); color-scheme:light; }
  .pickup-form select:focus,.pickup-form input:focus{ border-color:var(--accent); outline:none; }
  .wb-state{ display:flex; align-items:center; gap:.5rem; font-size:.84rem; font-weight:700; padding-top:1.35rem; }
  .wb-state svg{ width:16px; height:16px; }
  .wb-state.done{ color:var(--ok); } .wb-state.todo{ color:var(--muted); }
  .wb-preview{ background:var(--lav-50); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1rem; }

  .modal-actions{ display:flex; gap:.7rem; justify-content:flex-end; align-items:center; flex-wrap:wrap; border-top:1px solid var(--lav-200); padding-top:1.1rem; margin-top:.3rem; }

  :focus-visible{ outline:none; box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 28%, transparent); border-radius:6px; }
  @media (max-width:640px){ .detail-grid,.pickup-form{ grid-template-columns:1fr; } .sort-wrap{ margin-left:0; } }
  @media (prefers-reduced-motion:reduce){ .pack-bar i{ transition:none; } }
}
${WB_CSS}
`;