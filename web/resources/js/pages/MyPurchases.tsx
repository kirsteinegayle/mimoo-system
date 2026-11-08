"use client";

import { useMemo, useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  ClipboardList,
  Wallet,
  Package,
  Truck,
  Star,
  XCircle,
  X,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  seller_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  variant_id?: string | null;
  variant_snapshot?: {
    id: string;
    combination: Record<string, string>;
    sku: string;
    price: number;
    stock: number;
  } | null;
}

interface Order {
  id: number;
  order_number: string;
  waybill_number?: string | null;
  total: number;
  status: string; // pending | paid | shipped | completed | cancelled | failed
  payment_status: string;
  payment_method?: string; // "cod" | "gcash" | "paymongo" (optional, see notes)
  reviewed?: boolean; // optional: true once the buyer has rated the order
  item_count: number;
  created_at: string;
  can_cancel: boolean;
  tracking_message?: string | null;
  tracking_updated_at?: string | null;
  assigned_courier_name?: string | null;
  items: OrderItem[];
}

interface PageProps {
  orders: Order[];
  auth: { user: any };
  cartCount?: number;
  [key: string]: any;
}

type TabKey = "all" | "to_pay" | "to_ship" | "to_receive" | "to_review" | "cancelled";

// ---------------------------------------------------------------------------
// Tabs + status mapping
// ---------------------------------------------------------------------------

const TABS: { key: TabKey; label: string; icon: typeof Wallet; empty: string }[] = [
  { key: "all", label: "All", icon: ClipboardList, empty: "You haven't placed any orders yet." },
  { key: "to_pay", label: "To Pay", icon: Wallet, empty: "No orders waiting for payment." },
  { key: "to_ship", label: "To Ship", icon: Package, empty: "No orders being prepared by sellers." },
  { key: "to_receive", label: "To Receive", icon: Truck, empty: "No orders on the way." },
  { key: "to_review", label: "To Review", icon: Star, empty: "No delivered orders waiting for your review." },
  { key: "cancelled", label: "Cancelled", icon: XCircle, empty: "No cancelled orders." },
];

/** Which tab an order belongs to (never "all"). */
function tabOf(o: Order): Exclude<TabKey, "all"> {
  if (o.status === "cancelled" || o.status === "failed") return "cancelled";
  if (o.status === "completed") return "to_review"; // delivered; button switches to "Edit review" once reviewed
  if (o.status === "in_transit") return "to_receive"; // assigned to courier and in transit
  if (o.status === "shipped") return "to_receive"; // confirmed by logistics
  if (o.status === "packed") return "to_ship"; // packed but not yet picked up by courier
  if (o.status === "paid") return "to_ship";
  // pending: online payments still need paying, COD goes straight to "To Ship"
  const online = o.payment_method ? o.payment_method !== "cod" : true;
  return online && o.payment_status !== "paid" ? "to_pay" : "to_ship";
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  to_pay: { text: "Awaiting payment", cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  to_ship: { text: "Preparing to ship", cls: "bg-blue-50 text-blue-800 border-blue-200" },
  packed: { text: "Packed, waiting for pickup", cls: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  in_transit: { text: "In transit", cls: "bg-purple-50 text-purple-800 border-purple-200" },
  to_receive: { text: "On the way", cls: "bg-purple-50 text-purple-800 border-purple-200" },
  to_review: { text: "Delivered", cls: "bg-green-50 text-green-800 border-green-200" },
  cancelled: { text: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
};

const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function readTabFromUrl(url: string): TabKey {
  const q = new URLSearchParams(url.split("?")[1] ?? "").get("status");
  return TABS.some((t) => t.key === q) ? (q as TabKey) : "all";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyPurchases() {
  const page = usePage<PageProps>();
  const { orders: initialOrders, auth, cartCount } = page.props;
  const user = auth?.user;

  const [orders, setOrders] = useState<Order[]>(initialOrders ?? []);
  const [tab, setTab] = useState<TabKey>(readTabFromUrl(page.url));
  const [query, setQuery] = useState("");
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch fresh orders from backend
  async function fetchOrders() {
    try {
      setRefreshing(true);
      const response = await fetch('/orders/data', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        toast.success('Orders updated');
      } else {
        toast.error('Failed to refresh orders');
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      toast.error('Failed to refresh orders');
    } finally {
      setRefreshing(false);
    }
  }

  // Count per tab (badges)
  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: orders.length, to_pay: 0, to_ship: 0, to_receive: 0, to_review: 0, cancelled: 0 };
    orders.forEach((o) => (c[tabOf(o)] += 1));
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) => (tab === "all" || tabOf(o) === tab) && (!q || o.order_number.toLowerCase().includes(q))
    );
  }, [orders, tab, query]);

  function selectTab(key: TabKey) {
    setTab(key);
    // keep the URL in sync so the tab can be shared / bookmarked / used by other links
    const next = key === "all" ? "/orders" : `/orders?status=${key}`;
    window.history.replaceState(window.history.state, "", next);
  }

  function handleLogout() {
    router.post("/logout");
  }

  async function handleCancelOrder(orderId: number) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Order cancelled successfully");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled", can_cancel: false } : o))
        );
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  }

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne] text-[#2A1B4D]">
      <Head title="My Purchases" />

      <BuyerHeader user={user} onLogout={handleLogout} cartCount={cartCount ?? 0} />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[1.3rem] font-bold text-[#2A1B4D]" style={{ fontFamily: "'Syne', sans-serif" }}>
            My Purchases
          </h1>
          <button
            type="button"
            onClick={fetchOrders}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-[0.82rem] font-semibold text-[#4B2E7E] hover:bg-[#F9F7FC] rounded-lg border border-[#B9A6DE] transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Status navigation */}
        <div className="sticky top-0 z-20 -mx-4 sm:mx-0 bg-[#f5f4f8] pt-1">
          <div
            role="tablist"
            aria-label="Order status"
            className="flex overflow-x-auto bg-white sm:rounded-[14px] border-y sm:border border-[rgba(185,166,222,0.28)] shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              const n = counts[t.key];
              return (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => selectTab(t.key)}
                  className={`relative flex-1 min-w-[96px] flex flex-col items-center gap-1 px-3 pt-3 pb-3 text-[0.78rem] font-bold whitespace-nowrap transition-colors ${
                    active ? "text-[#4B2E7E]" : "text-[#6E6570] hover:text-[#4B2E7E]"
                  }`}
                >
                  <span className="relative">
                    <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                    {n > 0 && t.key !== "all" && (
                      <span
                        className="absolute -top-2 -right-3 min-w-[17px] h-[17px] px-1 rounded-full bg-[#4B2E7E] text-white text-[0.62rem] leading-[17px] text-center font-bold"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {n > 99 ? "99+" : n}
                      </span>
                    )}
                  </span>
                  {t.label}
                  <span
                    className={`absolute left-3 right-3 bottom-0 h-[3px] rounded-t-full transition-colors ${
                      active ? "bg-[#4B2E7E]" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative px-4 sm:px-0 mt-3 mb-4">
            <Search className="absolute left-7 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8FB0]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order number"
              aria-label="Search orders by order number"
              className="w-full h-10 pl-9 pr-4 rounded-lg border-[1.5px] border-[#E6DFF2] bg-white text-[#2A1B4D] placeholder:text-[#9B8FB0] caret-[#4B2E7E] [color-scheme:light] focus:border-[#4B2E7E] focus:ring-2 focus:ring-[#4B2E7E]/20 outline-none text-[0.85rem]"
            />
          </div>
        </div>

        {/* Orders */}
        <div role="tabpanel" aria-label={activeTab.label} className="space-y-4">
          {visible.length === 0 ? (
            <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-12 text-center">
              <activeTab.icon className="w-14 h-14 text-[#B9A6DE] mx-auto mb-4" strokeWidth={1.4} />
              <p className="text-[0.88rem] text-[#6E6570] mb-4">
                {query ? `No orders match “${query}”.` : activeTab.empty}
              </p>
              {tab === "all" && !query && (
                <Link
                  href="/homepage"
                  className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition"
                >
                  Start shopping
                </Link>
              )}
            </div>
          ) : (
            visible.map((order) => {
              const key = tabOf(order);
              // Use packed status label if order is packed, otherwise use tab label
              const label = order.status === "packed" ? STATUS_LABEL["packed"] : STATUS_LABEL[key];
              const Icon = TABS.find((t) => t.key === key)!.icon;
              return (
                <article
                  key={order.id}
                  className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div
                          className="text-[1rem] font-extrabold text-[#2A1B4D]"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {order.order_number}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[0.74rem] font-bold px-2.5 py-1 rounded-full border ${label.cls}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label.text}
                        </span>
                      </div>
                      <div className="text-[0.82rem] text-[#6E6570] space-y-1">
                        <div>
                          {order.item_count} {order.item_count === 1 ? "item" : "items"}
                        </div>
                        <div>Placed on {order.created_at}</div>
                        {order.waybill_number && (
                          <div className="text-[0.76rem] font-mono text-[#4B2E7E]">
                            {order.waybill_number}
                          </div>
                        )}
                        {order.tracking_message && (
                          <div className="flex items-start gap-2 mt-2 text-[0.82rem] text-[#4B2E7E] bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                            <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{order.tracking_message}</div>
                              {order.tracking_updated_at && (
                                <div className="text-[0.72rem] text-[#6E6570] mt-0.5">
                                  {order.tracking_updated_at}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[0.76rem] text-[#6E6570] mb-1">Total</div>
                      <div
                        className="text-[1.2rem] font-extrabold text-[#4B2E7E]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {peso(order.total)}
                      </div>
                    </div>
                  </div>

                  {/* Product Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[rgba(185,166,222,0.18)] space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[0.88rem] font-semibold text-[#2A1B4D] line-clamp-2 mb-1">
                              {item.product_name}
                            </h4>
                            
                            {/* Variant info */}
                            {item.variant_snapshot && item.variant_snapshot.combination && (
                              <div className="mb-1 flex flex-wrap gap-1">
                                {Object.entries(item.variant_snapshot.combination).map(([key, val]) => (
                                  <span key={key} className="inline-flex items-center gap-1 text-[0.7rem] bg-violet-50 text-violet-700 border border-violet-200 rounded px-1.5 py-0.5">
                                    <strong>{key}:</strong> {val}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-[0.76rem] text-[#6E6570] mb-1">
                              Seller: {item.seller_name}
                            </p>
                            <div className="flex items-center gap-3 text-[0.76rem]">
                              <span className="text-[#6E6570]">Qty: {item.quantity}</span>
                              <span className="text-[#4B2E7E] font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                {peso(item.unit_price)}
                              </span>
                            </div>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right">
                            <div className="text-[0.9rem] font-bold text-[#4B2E7E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {peso(item.subtotal)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {key === "to_pay" && (
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white font-bold text-[0.82rem] px-4 py-2 rounded-lg hover:bg-[#3a2360] transition"
                      >
                        Pay now
                      </Link>
                    )}
                    {key === "to_review" && (
                      <Link
                        href={`/orders/${order.id}/review`}
                        className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white font-bold text-[0.82rem] px-4 py-2 rounded-lg hover:bg-[#3a2360] transition"
                      >
                        <Star className="w-4 h-4" />
                        {order.reviewed ? "Edit review" : "Rate order"}
                      </Link>
                    )}

                    <Link
                      href={`/orders/${order.id}`}
                      className={`inline-flex items-center gap-2 font-bold text-[0.82rem] px-4 py-2 rounded-lg transition ${
                        key === "to_pay" || key === "to_review"
                          ? "border-[1.5px] border-[#4B2E7E] text-[#4B2E7E] hover:bg-[#F9F7FC]"
                          : "bg-[#4B2E7E] text-white hover:bg-[#3a2360]"
                      }`}
                    >
                      View details
                    </Link>

                    {order.can_cancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelling === order.id}
                        className="inline-flex items-center gap-2 border-[1.5px] border-red-300 text-red-600 font-bold text-[0.82rem] px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            Cancel order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}