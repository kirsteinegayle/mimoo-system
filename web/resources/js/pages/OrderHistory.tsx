"use client";

import { confirmDialog } from '@/components/app-modal';
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Package, X } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { toast } from "sonner";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Order {
  id: number;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  item_count: number;
  created_at: string;
  can_cancel: boolean;
}

interface PageProps {
  orders: Order[];
  auth: { user: any };
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Order History Page Component
// ---------------------------------------------------------------------------

export default function OrderHistory() {
  const { orders: initialOrders, auth } = usePage<PageProps>().props;
  const user = auth?.user;
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleLogout() {
    router.post('/logout');
  }

  async function handleCancelOrder(orderId: number) {
    if (!(await confirmDialog('Are you sure you want to cancel this order?'))) {
      return;
    }

    setCancelling(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Order cancelled successfully');
        
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled', can_cancel: false }
            : order
        ));
      } else {
        toast.error(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'packed':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'failed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
      <Head title="My Orders" />

      <BuyerHeader user={user} onLogout={handleLogout} cartCount={0} />

      <main className="max-w-[1000px] mx-auto px-6 py-6 pb-16">
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>My Orders</h1>
          <p className="text-[0.83rem] text-[#6E6570] mt-1">
            <span className="font-bold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{orders.length}</span> total orders
          </p>
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-12 text-center">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-[0.88rem] text-[#6E6570] mb-4">You haven't placed any orders yet</p>
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="text-[1rem] font-extrabold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {order.order_number}
                      </div>
                      <span className={`text-[0.72rem] font-bold px-2.5 py-1 rounded-full border uppercase ${getStatusColor(order.status)}`}>
                        {order.status === 'packed' ? 'Packed, waiting for pickup' : order.status}
                      </span>
                    </div>
                    <div className="text-[0.82rem] text-[#6E6570] space-y-1">
                      <div>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</div>
                      <div>Placed on {order.created_at}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[0.76rem] text-[#6E6570] mb-1">Total</div>
                    <div className="text-[1.2rem] font-extrabold text-[#4B2E7E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {peso(order.total)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white font-bold text-[0.82rem] px-4 py-2 rounded-lg hover:bg-[#3a2360] transition"
                  >
                    View Details
                  </Link>

                  {order.can_cancel && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelling === order.id}
                      className="inline-flex items-center gap-2 border-[1.5px] border-red-300 text-red-600 font-bold text-[0.82rem] px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling === order.id ? (
                        <>Cancelling...</>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Cancel Order
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
