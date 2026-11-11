import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { BuyerHeader } from "@/components/buyer-header";
import { trackingLabel } from "@/components/tracking-line";
import { Package, MapPin, Truck, Clock, CheckCircle2, XCircle, MessageCircle, RotateCcw, Star, CheckCircle } from "lucide-react";
import { ReturnRequestModal, ReturnStatusBadge, ReviewModal, Stars, type ReviewTarget } from "@/components/buyer/returns-reviews";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  seller_id?: number | null;
  seller_name?: string | null;
  review?: { id: number; rating: number; comment: string | null; can_edit: boolean } | null;
  can_review?: boolean;
}

interface OrderSeller {
  id: number;
  name: string;
}

interface Order {
  id: number;
  order_number: string;
  waybill_number: string | null;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_name: string;
  shipping_address: string;
  shipping_phone: string;
  created_at: string;
  can_cancel: boolean;
  tracking_status: string | null;
  tracking_message: string | null;
  tracking_updated_at: string | null;
  assigned_courier_name: string | null;
  current_facility_name: string | null;
  items: OrderItem[];
  sellers?: OrderSeller[];
  can_return?: boolean;
  return_status?: string | null;
  return_id?: number | null;
}

interface PageProps {
  order: Order;
  auth: { user: any };
  returnReasons?: string[];
}

const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-700", icon: Clock },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  packed: { label: "Packed", color: "bg-indigo-100 text-indigo-700", icon: Package },
  // shipped and in_transit both read "In Transit" (no backwards step on out for delivery).
  shipped: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck },
  completed: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: XCircle },
};

const IN_TRANSIT_STEPS = ["Order placed", "Packed", "In Transit"];

/** Rider events shown as detail on the current "In Transit" step. */
const RIDER_DETAIL = ["out_for_delivery", "delivered", "delivery_failed", "returning_to_sender"];

/**
 * Order placed -> Packed -> In Transit (all reached, last = current).
 * Used for both in_transit and shipped, so the timeline never moves backwards
 * when the rider goes out for delivery (in_transit -> shipped).
 */
function InTransitTimeline({ trackingStatus }: { trackingStatus?: string | null }) {
  const last = IN_TRANSIT_STEPS.length - 1;
  const detail = trackingStatus && RIDER_DETAIL.includes(trackingStatus) ? trackingLabel(trackingStatus) : null;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-purple-600" />
        Order Status
      </h2>
      <ol className="flex items-start">
        {IN_TRANSIT_STEPS.map((step, i) => (
          <li key={step} className="flex-1 flex flex-col items-center text-center relative">
            {i > 0 && <span className="absolute top-3 right-1/2 w-full h-0.5 bg-purple-500" aria-hidden="true" />}
            <span
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                i === last ? "bg-purple-600 ring-4 ring-purple-100" : "bg-purple-500"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </span>
            <span className={`mt-2 text-xs ${i === last ? "font-semibold text-purple-900" : "text-gray-600"}`}>
              {i === last && detail ? `${step} · ${detail}` : step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface DeliveryCode {
  code: string;
  expires_at: string;
  rider_first_name: string | null;
}

/** Rider OTP: shown only while the backend returns an active code. Memory only. */
function DeliveryCodeBanner({ orderId }: { orderId: number }) {
  const [dc, setDc] = useState<DeliveryCode | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/delivery-code`, {
          headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
          credentials: "same-origin",
          cache: "no-store",
        });
        const body = res.ok ? await res.json() : null;
        const d = body?.data;
        if (alive) setDc(d && typeof d.code === "string" && d.expires_at ? d : null);
      } catch {
        if (alive) setDc(null);
      }
      if (alive) setNow(Date.now());
    };
    load();
    const t = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [orderId]);

  if (!dc) return null;
  const exp = new Date(dc.expires_at);
  if (isNaN(exp.getTime()) || exp.getTime() <= now) return null;

  return (
    <div className="bg-purple-50 rounded-lg border border-purple-300 p-6 mb-6">
      <p className="text-sm font-medium text-purple-900">
        Give this code to your rider{dc.rider_first_name ? ` (${dc.rider_first_name})` : ""}:
      </p>
      <p className="text-3xl font-bold tracking-[0.4em] text-purple-900 font-mono my-2">{dc.code}</p>
      <p className="text-xs text-gray-600">
        Expires at {exp.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}. Only share it when you
        receive your parcel.
      </p>
    </div>
  );
}

export default function OrderDetail({ order, auth, returnReasons = [] }: PageProps) {
  const user = auth?.user;
  const [returnOpen, setReturnOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // After a return/review is saved, reload the order so every flag stays server-driven.
  function done(message: string) {
    setReturnOpen(false);
    setReviewTarget(null);
    setNotice(message);
    router.reload({ only: ["order"] });
  }
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  // "Chat with seller": hidden for the seller themself and for non-buyer accounts.
  const chatSellers = (order.sellers ?? []).filter(
    (s) => s.id && (!user || (user.account_type === "buyer" && Number(user.id) !== Number(s.id))),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title={`Order ${order.order_number}`} />
      
      <BuyerHeader user={user} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Purchases
          </Link>
        </div>

        {notice && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="text-green-700 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Order header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{order.order_number}</h1>
              <p className="text-sm text-gray-500">Placed on {order.created_at}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${config.color}`}>
              <StatusIcon className="w-4 h-4" />
              {config.label}
            </div>
          </div>

          {order.waybill_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
              <Package className="w-4 h-4" />
              <span className="font-medium">Waybill:</span>
              <span className="font-mono">{order.waybill_number}</span>
            </div>
          )}
        </div>

        {/* In-transit timeline (same steps as the buyer app); other statuses unchanged */}
        {(order.status === "in_transit" || order.status === "shipped") && (
          <InTransitTimeline trackingStatus={order.tracking_status} />
        )}

        {/* Tracking information */}
        {/* Rider delivery code (hidden unless active) */}
        <DeliveryCodeBanner orderId={order.id} />

        {order.tracking_message && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Tracking Information
            </h2>
            
            <div className="space-y-4">
              {/* Current status */}
              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{order.tracking_message}</p>
                    {order.tracking_updated_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {order.tracking_updated_at}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {order.assigned_courier_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Courier Company</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      {order.assigned_courier_name}
                    </p>
                  </div>
                )}
                {order.current_facility_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Location</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {order.current_facility_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
          <div className="text-gray-900">
            <p className="font-medium">{order.shipping_name}</p>
            <p className="text-sm text-gray-600 mt-1">{order.shipping_phone}</p>
            <p className="text-sm text-gray-600 mt-1">{order.shipping_address}</p>
          </div>
        </div>

        {/* Order items */}
        <div id="reviews" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 scroll-mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            {chatSellers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chatSellers.map((s) => (
                  <Link
                    key={s.id}
                    href={`/messages?seller_id=${s.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {chatSellers.length > 1 ? `Chat with ${s.name}` : "Chat with seller"}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                  {item.review ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Stars value={item.review.rating} />
                      <span className="text-gray-500">Your review</span>
                      {item.review.can_edit && (
                        <button
                          type="button"
                          onClick={() => setReviewTarget({ mode: "edit", reviewId: item.review!.id, productName: item.product_name, rating: item.review!.rating, comment: item.review!.comment })}
                          className="font-medium text-purple-700 hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  ) : item.can_review ? (
                    <button
                      type="button"
                      onClick={() => setReviewTarget({ mode: "create", orderId: order.id, itemId: item.id, productName: item.product_name })}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-purple-300 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      Write a review
                    </button>
                  ) : null}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="font-medium text-gray-900">{peso(item.unit_price)}</p>
                </div>
                
                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-semibold text-gray-900">{peso(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return / refund (same rules as the mobile app) */}
        {(order.can_return || order.return_status) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  Return / Refund
                </h2>
                {order.return_status ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ReturnStatusBadge status={order.return_status} />
                    {order.return_id && (
                      <Link href={`/returns?id=${order.return_id}`} className="text-sm font-medium text-purple-700 hover:underline">
                        View details
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">Something wrong with your order? You can request a return within 7 days.</p>
                )}
              </div>
              {order.can_return && (
                <button
                  type="button"
                  onClick={() => setReturnOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Request return / refund
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span className="font-medium text-gray-900">
                {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>Payment Status</span>
              <span className={`font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                {order.payment_status === "paid" ? "Paid" : "Unpaid"}
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-purple-600">{peso(order.total)}</span>
              </div>
            </div>
          </div>

          {order.can_cancel && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this order?")) {
                    // Handle cancel order
                    window.location.href = `/api/orders/${order.id}/cancel`;
                  }
                }}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </main>

      {returnOpen && (
        <ReturnRequestModal
          orderId={order.id}
          orderNumber={order.order_number}
          reasons={returnReasons}
          onClose={() => setReturnOpen(false)}
          onDone={done}
        />
      )}
      {reviewTarget && <ReviewModal target={reviewTarget} onClose={() => setReviewTarget(null)} onDone={done} />}
    </div>
  );
}
