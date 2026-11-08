"use client";

import { useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Package, X, ChevronRight, AlertCircle } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "guest" | "buyer" | "seller";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_sku: string;
  seller_name: string;
  unit_price: number;
  regular_price: number;
  is_on_sale: boolean;
  quantity: number;
  line_total: number;
  max_quantity: number;
  stock_status: string;
  is_valid: boolean;
  validation_issue: string | null;
  variant_id?: string | null;
  variant_snapshot?: {
    id: string;
    combination: Record<string, string>;
    sku: string;
    price: number;
    stock: number;
  } | null;
  product: {
    id: number;
    name: string;
    status: string;
    stock: number;
  };
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  total: number;
  total_items: number;
  has_invalid_items: boolean;
}

// ---------------------------------------------------------------------------
// Cart Page Component
// ---------------------------------------------------------------------------

export default function Cart() {
  const { auth, suggestedProducts = [] } = usePage<{ auth: { user: any }, suggestedProducts: any[] }>().props;
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const user = auth?.user;
  const role: UserRole = user?.account_type ? (user.account_type as UserRole) : "guest";

  // State
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);
  
  // Fetch available vouchers when modal opens
  useEffect(() => {
    if (showVoucherModal) {
      fetchAvailableVouchers();
    }
  }, [showVoucherModal]);
  
  async function fetchAvailableVouchers() {
    setLoadingVouchers(true);
    try {
      const response = await fetch('/api/vouchers/available');
      const data = await response.json();
      setAvailableVouchers(data.vouchers || []);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoadingVouchers(false);
    }
  }
  
  async function handleClaimVoucher(voucherId: number) {
    try {
      const response = await fetch('/api/vouchers/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ voucher_id: voucherId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Voucher claimed successfully!');
        fetchAvailableVouchers(); // Refresh voucher list
      } else {
        toast.error(data.message || 'Failed to claim voucher');
      }
    } catch (error) {
      console.error('Claim voucher error:', error);
      toast.error('Failed to claim voucher');
    }
  }

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
    if (user && user.account_type === 'buyer') {
      fetchWishlistCount();
    }
  }, []);

  async function fetchCart() {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCart(data);
      // Auto-select all valid items by default
      const validItemIds = new Set(data.items.filter((item: CartItem) => item.is_valid).map((item: CartItem) => item.id));
      setSelectedItems(validItemIds);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  async function fetchWishlistCount() {
    try {
      const response = await fetch('/api/wishlist/count');
      const data = await response.json();
      setWishlistCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error);
    }
  }

  async function updateQuantity(itemId: number, newQty: number) {
    if (newQty < 1) return;
    
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        toast.error(data.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(itemId: number) {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Item removed');
        await fetchCart(); // Refresh cart
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    }
  }

  function handleLogout() {
    router.post('/logout');
  }

  function toggleItemSelection(itemId: number) {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    const validItems = items.filter(item => item.is_valid);
    if (selectedItems.size === validItems.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all valid items
      setSelectedItems(new Set(validItems.map(item => item.id)));
    }
  }

  function handleCheckout() {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }
    
    const selectedItemsHaveIssues = items
      .filter(item => selectedItems.has(item.id))
      .some(item => !item.is_valid);
    
    if (selectedItemsHaveIssues) {
      toast.error('Please fix invalid items before checkout');
      return;
    }
    
    // Pass selected item IDs to checkout page
    router.visit('/checkout', {
      method: 'get',
      data: {
        items: Array.from(selectedItems).join(',')
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
        <Head title="My Cart" />
        <BuyerHeader user={user} onLogout={handleLogout} cartCount={0} wishlistCount={wishlistCount} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const validItems = items.filter(item => item.is_valid);
  const allValidSelected = validItems.length > 0 && selectedItems.size === validItems.length;
  
  // Calculate selected items total
  const selectedTotal = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.line_total, 0);

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
      <Head title="My Cart" />

      <BuyerHeader
        user={user}
        onLogout={handleLogout}
        cartCount={cart?.total_items || 0}
        wishlistCount={wishlistCount}
      />

      <main className="max-w-[1100px] mx-auto px-6 py-6 pb-16">
        {/* Cart header */}
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>My Cart</h1>
            <p className="text-[0.83rem] text-[#6E6570] mt-1">
              <span className="font-bold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{items.length}</span> items in your cart
            </p>
          </div>
          <Link href="/homepage" className="inline-flex items-center gap-2 text-[0.82rem] font-bold text-[#4B2E7E] hover:underline">
            <ArrowLeft className="w-[14px] h-[14px]" />
            Continue shopping
          </Link>
        </div>

        {/* Invalid items warning */}
        {cart?.has_invalid_items && (
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-none mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-orange-900 mb-1">Some items need attention</h3>
              <p className="text-sm text-orange-800">Please fix invalid items before checkout</p>
            </div>
          </div>
        )}

        {/* Cart items card */}
        <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-5 mb-4">
          {/* Column headers */}
          <div className="grid grid-cols-[40px_72px_1fr_110px_132px_110px_60px] items-center gap-x-6 pb-3 mb-1 border-b-[1.5px] border-[#E6DFF2] text-[0.72rem] font-bold text-[#6E6570] uppercase tracking-wide">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allValidSelected}
                onChange={toggleSelectAll}
                disabled={validItems.length === 0}
                className="w-4 h-4 text-violet-900 bg-white border-2 border-violet-300 rounded focus:ring-2 focus:ring-violet-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
            <span></span>
            <span>Product</span>
            <span className="text-right">Unit Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total Price</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Empty state */}
          {isEmpty ? (
            <div className="py-12 text-center">
              <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-[0.88rem] text-[#6E6570] mb-4">Your cart is empty</p>
              <Link
                href="/homepage"
                className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            // Cart items
            items.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-[40px_72px_1fr_110px_132px_110px_60px] items-center gap-x-6 py-4 border-b border-[#E6DFF2] last:border-b-0 ${
                  !item.is_valid ? 'bg-red-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    disabled={!item.is_valid}
                    className="w-4 h-4 text-violet-900 bg-white border-2 border-violet-300 rounded focus:ring-2 focus:ring-violet-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="w-[72px] h-[72px] rounded-[10px] bg-[#F9F7FC] border border-[#E6DFF2] flex items-center justify-center text-[#B9A6DE] overflow-hidden">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-[26px] h-[26px]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[0.88rem] font-bold text-[#2A1B4D] leading-snug">{item.product_name}</div>
                  <div className="text-[0.76rem] text-[#6E6570] mt-1">{item.seller_name}</div>
                  
                  {/* Variant info */}
                  {item.variant_snapshot && item.variant_snapshot.combination && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {Object.entries(item.variant_snapshot.combination).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center gap-1 text-[0.72rem] bg-violet-50 text-violet-700 border border-violet-200 rounded px-2 py-0.5">
                          <strong>{key}:</strong> {val}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="inline-block text-[0.72rem] text-[#4B2E7E] mt-1 bg-[#F9F7FC] border border-[#E6DFF2] rounded px-1.5 py-0.5">
                    SKU: {item.variant_snapshot?.sku || item.product_sku}
                  </div>
                  <div className={`text-[0.72rem] mt-1.5 font-medium ${
                    !item.is_valid ? 'text-red-600' : item.max_quantity < 5 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {item.is_valid ? `${item.max_quantity} in stock` : item.validation_issue}
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-[0.88rem] font-extrabold text-[#2A1B4D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {peso(item.unit_price)}
                  </span>
                  {item.is_on_sale && (
                    <span className="block text-[0.7rem] text-[#6E6570] line-through mt-0.5">
                      {peso(item.regular_price)}
                    </span>
                  )}
                </div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center border-[1.5px] border-[#E6DFF2] rounded-lg overflow-hidden shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.id}
                      className="w-[30px] h-[30px] flex items-center justify-center text-[#2A1B4D] text-base font-bold bg-white hover:bg-[#F3EFFA] disabled:text-[#E6DFF2] disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>
                    <span className="w-[32px] text-center text-[0.85rem] font-bold border-l border-r border-[#E6DFF2]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.max_quantity || updating === item.id}
                      className="w-[30px] h-[30px] flex items-center justify-center text-[#2A1B4D] text-base font-bold bg-white hover:bg-[#F3EFFA] disabled:text-[#E6DFF2] disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap text-[0.92rem] font-extrabold text-[#4B2E7E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {peso(item.line_total)}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-[34px] h-[34px] border-[1.5px] border-[#E6DFF2] bg-white rounded-lg flex items-center justify-center text-[#6E6570] hover:bg-[#fbeced] hover:border-[#b3384f] hover:text-[#b3384f] transition shadow-sm"
                  >
                    <X className="w-[15px] h-[15px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout summary */}
        {!isEmpty && (
          <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="text-[0.83rem] text-[#6E6570] mb-2">
                  Total (<span style={{ fontFamily: "'Poppins', sans-serif" }}>{selectedItems.size}</span> selected {selectedItems.size === 1 ? 'item' : 'items'}):
                </div>
                <div className="text-[1.8rem] font-extrabold text-[#4B2E7E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {peso(selectedTotal)}
                </div>
              </div>
              <button
                disabled={selectedItems.size === 0}
                onClick={handleCheckout}
                className="appearance-none border-none cursor-pointer bg-gradient-to-r from-[#2A1B4D] to-[#4B2E7E] text-white font-extrabold text-[0.92rem] px-9 py-3 rounded-full flex items-center gap-2 shadow-[0_4px_18px_rgba(75,46,126,0.45)] transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_28px_rgba(75,46,126,0.55)] disabled:bg-[#E6DFF2] disabled:text-[#6E6570] disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none whitespace-nowrap"
              >
                Proceed to Checkout ({selectedItems.size})
              </button>
            </div>
            
            {/* Voucher Button */}
            <div className="mt-4 pt-4 border-t border-[#E6DFF2]">
              <button
                onClick={() => setShowVoucherModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#4B2E7E] bg-[#F9F7FC] border-2 border-dashed border-[#B9A6DE] rounded-lg hover:bg-[#F3EFFC] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Apply Voucher
              </button>
            </div>
          </div>
        )}

        {/* You may also like */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[1.05rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>You may also like</h2>
            <Link href="/homepage" className="inline-flex items-center gap-1 text-[0.82rem] font-bold text-[#4B2E7E] hover:underline">
              See All <ChevronRight className="w-[14px] h-[14px]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {suggestedProducts.map((product: any) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-[14px] border border-[rgba(185,166,222,0.18)] shadow-sm overflow-hidden cursor-pointer transition hover:shadow-md hover:translate-y-[-2px] flex flex-col"
              >
                <div className="relative w-full aspect-square bg-[#F9F7FC] flex items-center justify-center text-[#B9A6DE] overflow-hidden">
                  {product.main_image ? (
                    <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-[34px] h-[34px]" />
                  )}
                </div>
                <div className="p-2.5 flex-1 flex flex-col">
                  <div className="text-[0.78rem] text-[#2A1B4D] leading-snug line-clamp-2 min-h-[2.1em] mb-1.5">
                    {product.name}
                  </div>
                  <div className="text-[0.7rem] text-[#6E6570] mb-1 truncate">
                    {product.seller_name}
                  </div>
                  <div className="flex items-baseline justify-between mt-auto gap-2">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[#4B2E7E] text-[0.9rem] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {peso(product.effective_price)}
                      </span>
                      {product.is_on_sale && (
                        <span className="text-[0.68rem] text-[#6E6570] line-through">
                          {peso(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-[#2A1B4D]">Select Voucher</h2>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {availableVouchers.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-600">
                  No vouchers available
                </div>
              ) : (
                availableVouchers.map((voucher: any) => {
                  const canApply = selectedTotal >= voucher.min_purchase;
                  const isAvailable = !voucher.is_claimed;
                  const isClaimed = voucher.is_claimed && !voucher.is_used;
                  const isUsed = voucher.is_used;
                  
                  return (
                    <button
                      key={voucher.id}
                      onClick={() => {
                        if (isUsed) return;
                        if (!isAvailable) {
                          // Copy code if already claimed
                          if (canApply) {
                            navigator.clipboard.writeText(voucher.code);
                            toast.success(`Voucher ${voucher.code} copied! Apply it at checkout.`);
                            setShowVoucherModal(false);
                          }
                        } else {
                          // Claim voucher
                          handleClaimVoucher(voucher.id);
                        }
                      }}
                      disabled={isUsed || (!isClaimed && !canApply)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isUsed
                          ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                          : isClaimed && canApply
                          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md cursor-pointer'
                          : isAvailable && canApply
                          ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-pink-50 hover:shadow-md cursor-pointer'
                          : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono font-bold text-violet-900 text-sm">{voucher.code}</span>
                            {isUsed && (
                              <span className="text-xs px-2 py-0.5 bg-gray-400 text-white rounded-full">
                                Used
                              </span>
                            )}
                            {isClaimed && !isUsed && (
                              <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                                Claimed
                              </span>
                            )}
                            {isAvailable && canApply && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2 font-semibold">{voucher.name}</p>
                          <p className="text-xs text-gray-600">
                            Min. purchase: ₱{voucher.min_purchase.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-base font-bold text-violet-600">
                            {voucher.type === 'percentage' ? `${voucher.value}%` : `₱${voucher.value}`}
                          </div>
                        </div>
                      </div>
                      {!canApply && !isUsed && (
                        <div className="mt-2 text-xs text-red-600">
                          Add ₱{(voucher.min_purchase - selectedTotal).toLocaleString()} more to claim
                        </div>
                      )}
                      {isClaimed && !isUsed && (
                        <div className="mt-2 text-xs text-green-700 font-semibold">
                          {canApply ? '✓ Click to copy code for checkout' : 'Add more items to use'}
                        </div>
                      )}
                      {isAvailable && canApply && (
                        <div className="mt-2 text-xs text-blue-700 font-semibold">
                          Click to claim this voucher
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
