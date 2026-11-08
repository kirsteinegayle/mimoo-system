"use client";

import { useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Package, X, ShoppingCart, Trash2, Heart } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_sku: string;
  seller_name: string;
  unit_price: number;
  regular_price: number;
  is_on_sale: boolean;
  stock: number;
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
  notes?: string | null;
  added_at: string;
  product: {
    id: number;
    name: string;
    status: string;
    stock: number;
    category: string;
    has_variants: boolean;
  };
}

interface WishlistData {
  items: WishlistItem[];
  total_items: number;
}

// ---------------------------------------------------------------------------
// Wishlist Page Component
// ---------------------------------------------------------------------------

export default function Wishlist() {
  const { auth } = usePage<{ auth: { user: any } }>().props;
  const user = auth?.user;

  // State
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId: number) {
    setRemoving(itemId);
    try {
      const response = await fetch(`/api/wishlist/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Item removed from wishlist');
        await fetchWishlist(); // Refresh wishlist
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  }

  async function addToCart(item: WishlistItem) {
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: 1,
          variant_id: item.variant_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Added to cart');
        // Optionally remove from wishlist after adding to cart
        // await removeItem(item.id);
      } else {
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  }

  function handleLogout() {
    router.post('/logout');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 font-[Syne]">
        <Head title="My Wishlist - mimoo" />
        <BuyerHeader user={user} onLogout={handleLogout} cartCount={0} wishlistCount={0} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700"></div>
        </div>
      </div>
    );
  }

  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-neutral-50 font-[Syne]">
      <Head title="My Wishlist - mimoo" />

      <BuyerHeader
        user={user}
        onLogout={handleLogout}
        cartCount={0}
        wishlistCount={wishlist?.total_items || 0}
      />

      <main className="mx-auto max-w-[1100px] px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/homepage"
            className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shopping
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-[#2A1B4D]">
            <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            My Wishlist
          </h1>
          <p className="mt-2 text-neutral-600">
            {isEmpty ? 'Your wishlist is empty' : `${items.length} ${items.length === 1 ? 'item' : 'items'} saved`}
          </p>
        </div>

        {isEmpty ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Heart className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
            <h2 className="mb-2 text-xl font-semibold text-neutral-700">Your wishlist is empty</h2>
            <p className="mb-6 text-neutral-500">
              Save your favorite products here to easily find them later
            </p>
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4B2E7E] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#3a2360]"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Product Image */}
                <Link
                  href={`/product/${item.product_id}`}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
                >
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-neutral-300" />
                    </div>
                  )}
                  {item.is_on_sale && (
                    <div className="absolute right-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      SALE
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/product/${item.product_id}`}
                    className="mb-1 text-base font-semibold text-[#2A1B4D] hover:text-violet-700 line-clamp-2"
                  >
                    {item.product_name}
                  </Link>

                  <p className="mb-2 text-xs text-neutral-500">
                    by {item.seller_name}
                  </p>

                  {/* Variant info */}
                  {item.variant_snapshot && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {Object.entries(item.variant_snapshot.combination).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-2">
                    {item.is_on_sale ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#4B2E7E]">
                          {peso(item.unit_price)}
                        </span>
                        <span className="text-sm text-neutral-400 line-through">
                          {peso(item.regular_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#4B2E7E]">
                        {peso(item.unit_price)}
                      </span>
                    )}
                  </div>

                  {/* Stock status */}
                  <div className="mb-3 text-sm">
                    {item.is_valid ? (
                      item.stock > 0 ? (
                        <span className="text-green-600">
                          ✓ In stock ({item.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-600">Out of stock</span>
                      )
                    ) : (
                      <span className="text-red-600">
                        {item.validation_issue || 'Not available'}
                      </span>
                    )}
                  </div>

                  {/* Added date */}
                  <p className="mt-auto text-xs text-neutral-400">
                    Added {item.added_at}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={removing === item.id}
                    className="flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    {removing === item.id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>

                  {item.is_valid && item.stock > 0 && (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center justify-center rounded-lg bg-[#4B2E7E] p-2 text-white transition-colors hover:bg-[#3a2360]"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
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
