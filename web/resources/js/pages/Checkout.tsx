"use client";

import { useState, useRef, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Package, CreditCard, MapPin, Phone, User, Loader2, X } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  seller_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface PageProps {
  cartItems: CartItem[];
  codEnabled?: boolean;
  buyNow?: { product_id: number; quantity: number; variant_id: string | null } | null;
  shippingQuote?: { fee: number; zone: string | null; weight: number; logistics: string | null; fallback: boolean } | null;
  subtotal: number;
  total: number;
  auth: { user: any };
  [key: string]: any;
}

// PSGC API Types
interface Region {
  code: string;
  name: string;
}

interface Province {
  code: string;
  name: string;
  regionCode: string;
}

interface CityMunicipality {
  code: string;
  name: string;
  provinceCode?: string;
  regionCode?: string;
}

interface Barangay {
  code: string;
  name: string;
  cityCode: string;
}

// ---------------------------------------------------------------------------
// Shared input style (explicit colors so text is always visible)
// ---------------------------------------------------------------------------

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border-[1.5px] border-[#E6DFF2] bg-white text-[#2A1B4D] " +
  "placeholder:text-[#9B8FB0] caret-[#4B2E7E] [color-scheme:light] " +
  "focus:border-[#4B2E7E] focus:ring-2 focus:ring-[#4B2E7E]/20 outline-none text-[0.88rem]";

// ---------------------------------------------------------------------------
// Checkout Page Component
// ---------------------------------------------------------------------------

export default function Checkout() {
  const { cartItems, buyNow, subtotal, total, auth, shippingQuote, codEnabled = true } = usePage<PageProps>().props;
  const user = auth?.user;

  // State
  const [submitting, setSubmitting] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingName, setShippingName] = useState(user?.name || "");
  const [shippingPhone, setShippingPhone] = useState(user?.contact_number || "");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "gcash" | "paymongo">(codEnabled ? "cod" : "gcash");

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Address fields - pre-fill from user registration
  const [region, setRegion] = useState(user?.region || "");
  const [province, setProvince] = useState(user?.province || "");
  const [city, setCity] = useState(user?.municipality_city || "");
  const [barangay, setBarangay] = useState(user?.barangay || "");
  const [street, setStreet] = useState(user?.street_address || "");

  // PSGC API states
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false,
  });

  // Check if selected region is NCR
  const isNCR = region === "National Capital Region (NCR)";
  
  // Has a complete shipping address (profile, address book or typed in the modal)
  const hasSavedAddress = !!(region && city && barangay && street);

  // Address book (same /buyer/addresses as the buyer app). The default entry is
  // pre-selected like the app's checkout; the buyer can switch in the modal.
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const applySaved = (a: any) => {
    if (!a) return;
    setShippingName(a.recipient_name || "");
    setShippingPhone(a.phone || "");
    setRegion(a.region || "");
    setProvince(a.province || "");
    setCity(a.municipality_city || "");
    setBarangay(a.barangay || "");
    setStreet(a.street_address || "");
  };
  useEffect(() => {
    fetch("/buyer/addresses", { credentials: "same-origin", headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        const rows = Array.isArray(j?.data) ? j.data : [];
        setSavedAddresses(rows);
        applySaved(rows.find((a: any) => a.is_default));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shipping fee: from the buyer's zone + parcel weight; recalculated whenever the address changes.
  const [quote, setQuote] = useState<PageProps["shippingQuote"]>(shippingQuote ?? null);
  const [saveToBook, setSaveToBook] = useState(false);
  useEffect(() => {
    if (!city) return;
    const p = new URLSearchParams({ city, province: isNCR ? "" : province });
    if (buyNow) {
      p.set("buy_now", "1");
      p.set("product_id", String(buyNow.product_id));
      p.set("quantity", String(buyNow.quantity));
      if (buyNow.variant_id) p.set("variant_id", buyNow.variant_id);
    } else {
      p.set("cart_item_ids", cartItems.map((i) => i.id).join(","));
    }
    let cancelled = false;
    fetch(`/api/shipping/quote?${p.toString()}`, { credentials: "same-origin", headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => { if (!cancelled && q) setQuote(q); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, province, isNCR]);
  const shippingFee = quote?.fee ?? 0;

  // Save the typed address into the address book (same endpoint as the Addresses page)
  const saveAddressToBook = async () => {
    try {
      await fetch("/buyer/addresses", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          label: "Checkout address", recipient_name: shippingName, phone: shippingPhone, region, province: isNCR ? null : province,
          municipality_city: city, barangay, street_address: street,
        }),
      }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.data) setSavedAddresses((a) => [...a, j.data]); });
    } catch { /* the address still works for this order */ }
  };

  // Created ONCE per checkout page, so double-clicks/retries reuse the same key
  const idempotencyKeyRef = useRef(
    `${user?.id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  );

  // Load regions on mount
  useEffect(() => {
    setLoading((prev) => ({ ...prev, regions: true }));
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((res) => res.json())
      .then((data: Region[]) => {
        setRegions(data.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading((prev) => ({ ...prev, regions: false }));
      })
      .catch(() => setLoading((prev) => ({ ...prev, regions: false })));
  }, []);

  // Load provinces when region changes (skip for NCR)
  useEffect(() => {
    if (region && !isNCR) {
      const selected = regions.find((r) => r.name === region);
      if (selected) {
        setLoading((prev) => ({ ...prev, provinces: true }));
        fetch(`https://psgc.gitlab.io/api/regions/${selected.code}/provinces/`)
          .then((res) => res.json())
          .then((data: Province[]) => {
            setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
            setLoading((prev) => ({ ...prev, provinces: false }));
          })
          .catch(() => setLoading((prev) => ({ ...prev, provinces: false })));
      }
    } else if (isNCR) {
      // For NCR, load cities directly from region
      const selected = regions.find((r) => r.name === region);
      if (selected) {
        setLoading((prev) => ({ ...prev, cities: true }));
        fetch(`https://psgc.gitlab.io/api/regions/${selected.code}/cities-municipalities/`)
          .then((res) => res.json())
          .then((data: CityMunicipality[]) => {
            setCities(data.sort((a, b) => a.name.localeCompare(b.name)));
            setLoading((prev) => ({ ...prev, cities: false }));
          })
          .catch(() => setLoading((prev) => ({ ...prev, cities: false })));
      }
      setProvinces([]);
      setProvince("N/A"); // Set province to N/A for NCR
    } else {
      setProvinces([]);
    }
  }, [region, regions, isNCR]);

  // Load cities when province changes (skip for NCR since already loaded)
  useEffect(() => {
    if (province && !isNCR) {
      const selected = provinces.find((p) => p.name === province);
      if (selected) {
        setLoading((prev) => ({ ...prev, cities: true }));
        fetch(`https://psgc.gitlab.io/api/provinces/${selected.code}/cities-municipalities/`)
          .then((res) => res.json())
          .then((data: CityMunicipality[]) => {
            setCities(data.sort((a, b) => a.name.localeCompare(b.name)));
            setLoading((prev) => ({ ...prev, cities: false }));
          })
          .catch(() => setLoading((prev) => ({ ...prev, cities: false })));
      }
    } else if (!isNCR) {
      setCities([]);
    }
  }, [province, provinces, isNCR]);

  // Load barangays when city changes
  useEffect(() => {
    if (city) {
      const selected = cities.find((c) => c.name === city);
      if (selected) {
        setLoading((prev) => ({ ...prev, barangays: true }));
        fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selected.code}/barangays/`)
          .then((res) => res.json())
          .then((data: Barangay[]) => {
            setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
            setLoading((prev) => ({ ...prev, barangays: false }));
          })
          .catch(() => setLoading((prev) => ({ ...prev, barangays: false })));
      }
    } else {
      setBarangays([]);
    }
  }, [city, cities]);

  const peso = (n: number) =>
    "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleLogout() {
    router.post("/logout");
  }

  // Fetch available vouchers when modal opens
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

  // Apply voucher directly from modal
  async function applyVoucherFromModal(code: string) {
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          order_total: subtotal,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedVoucher(data.voucher);
        setVoucherDiscount(data.voucher.discount_amount);
        setVoucherCode(code);
        setShowVoucherModal(false);
        toast.success(data.message || 'Voucher applied!');
      } else {
        toast.error(data.message || 'Invalid voucher code');
      }
    } catch (error) {
      console.error('Voucher validation error:', error);
      toast.error('Failed to apply voucher');
    }
  }

  // Remove voucher
  function removeVoucher() {
    setVoucherCode('');
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    toast.info('Voucher removed');
  }

  // Open voucher modal and fetch vouchers
  function openVoucherModal() {
    setShowVoucherModal(true);
    fetchAvailableVouchers();
  }

  // Calculate final total with voucher
  const finalTotal = subtotal - voucherDiscount + shippingFee;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    console.log('Place Order clicked'); // DEBUG

    // Prevent double submit
    if (submitting) {
      console.log('Already submitting, prevented double submit'); // DEBUG
      return;
    }

    // Validate
    if (!shippingName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!region) {
      toast.error("Please select a region");
      return;
    }
    if (!isNCR && !province) {
      toast.error("Please select a province");
      return;
    }
    if (!city) {
      toast.error("Please select a city/municipality");
      return;
    }
    if (!barangay) {
      toast.error("Please select a barangay");
      return;
    }
    if (!street.trim()) {
      toast.error("Please enter your street address");
      return;
    }
    if (!shippingPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Build full address
    const fullAddress = isNCR
      ? `${street}, ${barangay}, ${city}, ${region}`
      : `${street}, ${barangay}, ${city}, ${province}`;

    console.log('All validations passed, submitting order...'); // DEBUG
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          shipping_name: shippingName,
          shipping_address: fullAddress,
          shipping_phone: shippingPhone,
          shipping_region: region,
          shipping_province: isNCR ? null : province,
          shipping_municipality_city: city,
          shipping_barangay: barangay,
          idempotency_key: idempotencyKeyRef.current,
          // Buy Now orders the one product directly; otherwise send the selected cart item IDs
          ...(buyNow ? { buy_now: buyNow } : { cart_item_ids: cartItems.map(item => item.id) }),
          voucher_code: voucherCode || null, // Send voucher code if applied
        }),
      });

      console.log('Response status:', response.status); // DEBUG
      const data = await response.json();
      console.log('Response data:', data); // DEBUG

      if (response.ok) {
        // Success - redirect to order success page
        toast.success(data.message || "Order placed successfully!");
        router.visit(`/orders/success?order_id=${data.order_id}`);
      } else {
        // Error
        toast.error(data.error || "Failed to place order");

        // If insufficient stock, redirect back to cart
        if (data.available_stock !== undefined) {
          setTimeout(() => {
            router.visit("/cart");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f8] font-[Syne]">
      <Head title="Checkout" />

      <BuyerHeader user={user} onLogout={handleLogout} cartCount={cartItems.length} />

      <main className="max-w-[1100px] mx-auto px-6 py-6 pb-16">
        {/* Checkout header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[1.3rem] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              Checkout
            </h1>
            <p className="text-[0.83rem] text-[#6E6570] mt-1">Complete your order</p>
          </div>
          <button
            type="button"
            onClick={() => router.visit("/cart")}
            className="inline-flex items-center gap-2 text-[0.82rem] font-bold text-[#4B2E7E] hover:underline"
          >
            <ArrowLeft className="w-[14px] h-[14px]" />
            Back to Cart
          </button>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-[1fr_400px] gap-5">
            {/* Left column - Forms */}
            <div className="space-y-5">
              {/* Shipping Information - Compact Display */}
              <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#4B2E7E]" />
                    <h2 className="text-[1.05rem] font-bold text-[#2A1B4D]">Shipping Information</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-sm font-semibold text-[#4B2E7E] hover:underline"
                  >
                    {hasSavedAddress ? 'Change Address' : 'Add Address'}
                  </button>
                </div>

                {hasSavedAddress ? (
                  // Compact address display
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-[#6E6570] mt-0.5 flex-none" />
                      <div>
                        <p className="text-sm font-semibold text-[#2A1B4D]">{shippingName}</p>
                        <p className="text-sm text-[#6E6570]">{shippingPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#6E6570] mt-0.5 flex-none" />
                      <p className="text-sm text-[#2A1B4D] leading-relaxed">
                        {street}, {barangay}, {city}
                        {!isNCR && province && `, ${province}`}, {region}
                      </p>
                    </div>
                  </div>
                ) : (
                  // No address - show message
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-[#E6DFF2] mx-auto mb-3" />
                    <p className="text-sm text-[#6E6570] mb-4">No shipping address yet</p>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3a2360] transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Add Shipping Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#4B2E7E]" />
                  <h2 className="text-[1.05rem] font-bold text-[#2A1B4D]">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {codEnabled && (<label
                    className={`flex items-center gap-3 p-4 rounded-lg border-[1.5px] cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-[#4B2E7E] bg-[#F9F7FC]"
                        : "border-[#E6DFF2] hover:border-[#B9A6DE]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 accent-[#4B2E7E]"
                    />
                    <div className="flex-1">
                      <div className="text-[0.88rem] font-bold text-[#2A1B4D]">Cash on Delivery</div>
                      <div className="text-[0.76rem] text-[#6E6570]">Pay when you receive</div>
                    </div>
                  </label>)}

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-[1.5px] cursor-pointer transition ${
                      paymentMethod === "gcash"
                        ? "border-[#4B2E7E] bg-[#F9F7FC]"
                        : "border-[#E6DFF2] hover:border-[#B9A6DE]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="gcash"
                      checked={paymentMethod === "gcash"}
                      onChange={() => setPaymentMethod("gcash")}
                      className="w-4 h-4 accent-[#4B2E7E]"
                    />
                    <div className="flex-1">
                      <div className="text-[0.88rem] font-bold text-[#2A1B4D]">GCash (Mock)</div>
                      <div className="text-[0.76rem] text-[#6E6570]">Digital payment</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-[1.5px] cursor-pointer transition ${
                      paymentMethod === "paymongo"
                        ? "border-[#4B2E7E] bg-[#F9F7FC]"
                        : "border-[#E6DFF2] hover:border-[#B9A6DE]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paymongo"
                      checked={paymentMethod === "paymongo"}
                      onChange={() => setPaymentMethod("paymongo")}
                      className="w-4 h-4 accent-[#4B2E7E]"
                    />
                    <div className="flex-1">
                      <div className="text-[0.88rem] font-bold text-[#2A1B4D]">PayMongo (Mock)</div>
                      <div className="text-[0.76rem] text-[#6E6570]">Credit/Debit card</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right column - Order Summary */}
            <div>
              <div className="bg-white rounded-[14px] shadow-sm border border-[rgba(185,166,222,0.18)] p-5 sticky top-6">
                <h2 className="text-[1.05rem] font-bold text-[#2A1B4D] mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-[60px] h-[60px] rounded-lg bg-[#F9F7FC] border border-[#E6DFF2] flex items-center justify-center overflow-hidden flex-none">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[#B9A6DE]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[0.85rem] font-bold text-[#2A1B4D] leading-snug line-clamp-2">
                          {item.product_name}
                        </div>
                        <div className="text-[0.75rem] text-[#6E6570] mt-0.5">{item.seller_name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[0.8rem] text-[#6E6570]">Qty: {item.quantity}</span>
                          <span
                            className="text-[0.88rem] font-extrabold text-[#4B2E7E]"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {peso(item.line_total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E6DFF2] pt-4 space-y-2">
                  <div className="flex justify-between text-[0.85rem]">
                    <span className="text-[#6E6570]">Subtotal</span>
                    <span
                      className="font-bold text-[#2A1B4D]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {peso(subtotal)}
                    </span>
                  </div>

                  {/* Voucher Section */}
                  <div className="py-3 border-t border-[#E6DFF2]">
                    {!appliedVoucher ? (
                      <button
                        type="button"
                        onClick={openVoucherModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#4B2E7E] bg-[#F9F7FC] border-2 border-dashed border-[#B9A6DE] rounded-lg hover:bg-[#F3EFFC] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        Apply Voucher
                      </button>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-green-900">{appliedVoucher.code}</p>
                            <p className="text-xs text-green-700">{appliedVoucher.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeVoucher}
                            className="text-green-700 hover:text-green-900 text-sm font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-green-700">Discount</span>
                          <span className="text-sm font-bold text-green-900">-{peso(voucherDiscount)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-[0.85rem]">
                    <span className="text-[#6E6570]">Shipping</span>
                    <span
                      className="font-bold text-[#2A1B4D]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {quote ? peso(shippingFee) : "Enter address"}
                    </span>
                  </div>
                  {quote && (
                    <p className="-mt-2 text-[0.72rem] text-[#6E6570]">
                      {quote.zone ? `${quote.zone} zone` : "Standard rate"} · {quote.weight} kg
                    </p>
                  )}
                  <div className="flex justify-between text-[1.1rem] pt-2 border-t border-[#E6DFF2]">
                    <span className="font-bold text-[#2A1B4D]">Total</span>
                    <span
                      className="font-extrabold text-[#4B2E7E]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {peso(finalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 bg-gradient-to-r from-[#2A1B4D] to-[#4B2E7E] text-white font-extrabold text-[0.92rem] px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(75,46,126,0.45)] transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_28px_rgba(75,46,126,0.55)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Place Order</>
                  )}
                </button>

                <p className="text-[0.72rem] text-center text-[#6E6570] mt-3">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E6DFF2] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2A1B4D]">Shipping Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-[#6E6570] hover:text-[#2A1B4D]">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {savedAddresses.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Use a saved address</label>
                  <select
                    defaultValue=""
                    onChange={(e) => applySaved(savedAddresses.find((a) => String(a.id) === e.target.value))}
                    className={inputClass}
                  >
                    <option value="">Choose from your address book…</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}{a.is_default ? " (default)" : ""} · {a.recipient_name} · {a.municipality_city}
                      </option>
                    ))}
                  </select>
                  <a href="/addresses" className="mt-1 inline-block text-xs font-semibold text-[#4B2E7E] hover:underline">Manage addresses</a>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Full Name</label>
                <input type="text" value={shippingName} onChange={(e) => setShippingName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Phone Number</label>
                <input type="tel" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} placeholder="09XX XXX XXXX" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Region</label>
                <select value={region} onChange={(e) => { setRegion(e.target.value); setProvince(""); setCity(""); setBarangay(""); }} className={inputClass}>
                  <option value="">Select Region</option>
                  {regions.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              {!isNCR && (
                <div>
                  <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Province</label>
                  <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); setBarangay(""); }} className={inputClass} disabled={!region}>
                    <option value="">Select Province</option>
                    {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">City / Municipality</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setBarangay(""); }} className={inputClass} disabled={isNCR ? !region : !province}>
                  <option value="">Select City/Municipality</option>
                  {cities.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Barangay</label>
                <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className={inputClass} disabled={!city}>
                  <option value="">Select Barangay</option>
                  {barangays.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2A1B4D] mb-1">Street Address</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="House No., Street Name" className={inputClass} />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#2A1B4D]">
                <input type="checkbox" checked={saveToBook} onChange={(e) => setSaveToBook(e.target.checked)} />
                Also save this address to my address book
              </label>
              <button
                onClick={async () => {
                  if (saveToBook && region && city && barangay && street) await saveAddressToBook();
                  setSaveToBook(false);
                  setShowAddressModal(false);
                }}
                className="w-full bg-[#4B2E7E] text-white font-semibold py-3 rounded-lg hover:bg-[#3a2360] transition"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div 
            className="relative w-full max-w-md max-h-[80vh] rounded-xl bg-white shadow-2xl"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-[#2A1B4D]">Select Voucher</h2>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div 
              className="p-4 space-y-3"
              style={{
                overflow: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`
                .voucher-scroll::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {loadingVouchers ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading vouchers...</p>
                </div>
              ) : availableVouchers.filter(v => v.is_claimed && !v.is_used).length === 0 ? (
                <div className="py-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <p className="text-sm text-gray-600">No claimed vouchers</p>
                  <p className="text-xs text-gray-500 mt-1">Claim vouchers from Homepage or Cart</p>
                </div>
              ) : (
                availableVouchers.filter(v => v.is_claimed && !v.is_used).map((voucher: any) => {
                  const canApply = subtotal >= voucher.min_purchase;
                  const discount = voucher.type === 'percentage' 
                    ? `${voucher.value}% OFF`
                    : `₱${voucher.value} OFF`;
                  
                  // Calculate potential savings
                  let savings = 0;
                  if (voucher.type === 'percentage') {
                    savings = (subtotal * voucher.value) / 100;
                    if (voucher.max_discount && savings > voucher.max_discount) {
                      savings = voucher.max_discount;
                    }
                  } else {
                    savings = voucher.value;
                  }

                  return (
                    <button
                      key={voucher.id}
                      onClick={() => {
                        if (canApply) {
                          applyVoucherFromModal(voucher.code);
                        }
                      }}
                      disabled={!canApply}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        canApply 
                          ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-pink-50 hover:shadow-md cursor-pointer' 
                          : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-violet-900 text-sm">{voucher.code}</span>
                            {canApply && (
                              <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2 font-semibold">{voucher.name}</p>
                          {voucher.description && (
                            <p className="text-xs text-gray-600 mb-2">{voucher.description}</p>
                          )}
                          <p className="text-xs text-gray-600">
                            Min. purchase: ₱{voucher.min_purchase.toLocaleString()}
                          </p>
                          {voucher.max_discount && voucher.type === 'percentage' && (
                            <p className="text-xs text-gray-600">
                              Max discount: ₱{voucher.max_discount.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-base font-bold text-violet-600">{discount}</div>
                          {canApply && (
                            <div className="text-xs text-green-600 mt-1">
                              Save ₱{savings.toFixed(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      {!canApply && (
                        <div className="mt-2 text-xs text-red-600">
                          Add ₱{(voucher.min_purchase - subtotal).toLocaleString()} more to use
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