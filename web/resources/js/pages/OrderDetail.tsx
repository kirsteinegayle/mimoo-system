import { Head, Link } from "@inertiajs/react";
import { BuyerHeader } from "@/components/buyer-header";
import { Package, MapPin, Truck, Clock, CheckCircle2, XCircle } from "lucide-react";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
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
}

interface PageProps {
  order: Order;
  auth: { user: any };
}

const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-700", icon: Clock },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  packed: { label: "Packed", color: "bg-indigo-100 text-indigo-700", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", icon: Truck },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck },
  completed: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function OrderDetail({ order, auth }: PageProps) {
  const user = auth?.user;
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

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

        {/* Tracking information */}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          
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
    </div>
  );
}
