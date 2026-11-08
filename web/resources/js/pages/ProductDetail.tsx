"use client";

import { useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Star, ChevronRight, Minus, Plus, Package, ShoppingCart, Flag, Heart } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "guest" | "buyer" | "seller";

interface ProductDetailProps {
  auth?: { user: any };
  product: {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    sale_price: number | null;
    effective_price: number;
    is_on_sale: boolean;
    stock: number;
    stock_status: string;
    is_in_stock: boolean;
    is_low_stock: boolean;
    images: string[];
    main_image_index: number;
    weight: number | null;
    brand: string;
    sku: string;
    seller_name: string;
    seller_id: number;
    seller_profile_photo?: string | null;
    has_variants?: boolean;
    variant_options?: Array<{
      name: string;
      values: string[];
    }>;
    variants?: Array<{
      id: string;
      combination: Record<string, string>;
      sku: string;
      price: number;
      stock: number;
      image?: string | null;
    }>;
  };
}

interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

interface SizeOption {
  id: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const COLORS: ColorOption[] = [
  { id: "tan", label: "Tan", hex: "#B8956A" },
  { id: "brown", label: "Brown", hex: "#3E2723" },
  { id: "cream", label: "Cream", hex: "#E8E4E0" },
];

const SIZES: SizeOption[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function Breadcrumb({ category, sellerName }: { category: string; sellerName: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500">
      <Link href="/homepage" className="hover:text-neutral-700">Home</Link>
      <ChevronRight className="h-3.5 w-3.5" />
      {category && (
        <>
          <span className="hover:text-neutral-700">{category}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </>
      )}
      <span className="text-neutral-700">{sellerName}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Image Gallery
// ---------------------------------------------------------------------------

function ProductImageGallery({ 
  images, 
  productName, 
  variantImage,
  allVariantImages,
}: { 
  images: string[]; 
  productName: string; 
  variantImage?: string | null;
  allVariantImages?: string[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Build display images: main images + ALL variant images by default
  const displayImages = [...(images || [])];
  
  // Add all variant images to the gallery
  if (allVariantImages && allVariantImages.length > 0) {
    allVariantImages.forEach(img => {
      if (img && !displayImages.includes(img)) {
        displayImages.push(img);
      }
    });
  }
  
  // When a variant is selected, auto-select that image
  useEffect(() => {
    if (variantImage) {
      const variantIndex = displayImages.indexOf(variantImage);
      if (variantIndex !== -1) {
        setSelectedIndex(variantIndex);
      }
    }
  }, [variantImage]);
  
  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-neutral-100 flex items-center justify-center">
        <Package className="w-32 h-32 text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square w-full rounded-2xl bg-neutral-100 overflow-hidden">
        <img 
          src={displayImages[selectedIndex]} 
          alt={productName} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === idx 
                  ? 'border-violet-900 ring-2 ring-violet-900 ring-offset-2' 
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variant Selector Component
// ---------------------------------------------------------------------------

function VariantSelector({ 
  options, 
  selected, 
  onChange 
}: { 
  options: Array<{name: string; values: string[]}>;
  selected: Record<string, string>;
  onChange: (selection: Record<string, string>) => void;
}) {
  const handleSelect = (optionName: string, value: string) => {
    onChange({ ...selected, [optionName]: value });
  };

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.name}>
          <label className="text-sm font-semibold text-neutral-700 mb-2 block">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <button
                key={value}
                onClick={() => handleSelect(option.name, value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected[option.name] === value
                    ? 'border-violet-900 bg-violet-50 text-violet-900'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Info
// ---------------------------------------------------------------------------

function ProductInfo({ 
  product, 
  role,
  onAddToCart,
  onReportProduct,
  selectedVariant,
  onVariantChange,
  inWishlist,
  wishlistLoading,
  toggleWishlist,
}: { 
  product: ProductDetailProps['product']; 
  role: UserRole;
  onAddToCart: (quantity: number, variantId?: string, replaceQuantity?: boolean) => Promise<any>;
  onReportProduct: () => void;
  selectedVariant: Record<string, string>;
  onVariantChange: (selection: Record<string, string>) => void;
  inWishlist: boolean;
  wishlistLoading: boolean;
  toggleWishlist: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  
  // Find selected variant from combinations
  const currentVariant = product.has_variants && product.variants
    ? product.variants.find(v => 
        Object.entries(v.combination).every(([key, val]) => selectedVariant[key] === val)
      )
    : null;
  
  // Use variant price/stock if available
  const effectivePrice = currentVariant?.price ?? product.effective_price;
  const effectiveStock = currentVariant?.stock ?? product.stock;
  const maxQuantity = effectiveStock; // Max = available stock
  
  // Check if all variant options are selected
  const isVariantComplete = !product.has_variants || 
    (product.variant_options?.every(opt => selectedVariant[opt.name]) ?? false);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const formatPrice = (price: number) => {
    return '₱' + price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAddToCart = () => {
    if (product.has_variants && !isVariantComplete) {
      toast.error('Please select all options');
      return;
    }
    onAddToCart(quantity, currentVariant?.id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Product title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          {product.name}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          {product.brand && (
            <span className="text-sm text-neutral-600">Brand: {product.brand}</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div>
        {product.is_on_sale ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-violet-700 sm:text-4xl">
              {formatPrice(product.effective_price)}
            </span>
            <span className="text-xl text-neutral-400 line-through">
              {formatPrice(product.price)}
            </span>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              {Math.round((1 - product.effective_price / product.price) * 100)}% OFF
            </span>
          </div>
        ) : (
          <div className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            {formatPrice(product.price)}
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Description</h3>
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Product Variants */}
      {product.has_variants && product.variant_options && (
        <VariantSelector
          options={product.variant_options}
          selected={selectedVariant}
          onChange={onVariantChange}
        />
      )}

      {/* Stock status & Weight - Combined */}
      <div className="space-y-3">
        <div className="rounded-lg border-2 border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-700">Stock Availability:</span>
            <span className={`text-lg font-bold ${
              effectiveStock > 0
                ? effectiveStock <= 10 ? 'text-orange-600' : 'text-green-600'
                : 'text-red-600'
            }`}>
              {effectiveStock > 0 
                ? (effectiveStock <= 10 ? `Only ${effectiveStock} left` : `${effectiveStock} Available`)
                : 'Out of Stock'
              }
            </span>
          </div>
        </div>
        
        {/* Weight */}
        {product.weight && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Package className="h-4 w-4" />
            <span>Weight: {product.weight} kg</span>
          </div>
        )}
      </div>

      {/* Quantity selector - only show if in stock */}
      {effectiveStock > 0 && role !== "seller" && (
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-700">Quantity</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="text-neutral-700 hover:text-neutral-900 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (val >= 1 && val <= maxQuantity) {
                    setQuantity(val);
                  } else if (val > maxQuantity) {
                    setQuantity(maxQuantity);
                  } else {
                    setQuantity(1);
                  }
                }}
                className="w-16 text-center text-sm font-medium text-neutral-900 border-0 focus:outline-none focus:ring-0"
              />
              <button
                onClick={increaseQuantity}
                disabled={quantity >= maxQuantity}
                className="text-neutral-700 hover:text-neutral-900 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-xs text-neutral-500">
              {maxQuantity} available
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {role === "guest" && (
        <div className="flex gap-2">
          <Link
            href="/register"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-800"
          >
            Sign up to buy
          </Link>
        </div>
      )}

      {role === "buyer" && effectiveStock > 0 && (
        <div className="space-y-3">
          {/* Warning message if variants not selected */}
          {product.has_variants && !isVariantComplete && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm font-medium text-amber-800">
                ⚠️ Please select all product options above before adding to cart
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading || (product.has_variants && !isVariantComplete)}
              className={`flex items-center justify-center rounded-lg border p-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                inWishlist
                  ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wishlistLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
              )}
            </button>
            <button 
              onClick={handleAddToCart}
              disabled={!isVariantComplete}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-900 py-2.5 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isVariantComplete ? 'Please select all product options first' : 'Add to cart'}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </button>
            <button 
              onClick={async () => {
                if (product.has_variants && !isVariantComplete) {
                  toast.error('Please select all options first');
                  return;
                }
                // Add to cart with REPLACE mode (for Buy Now)
                const cartItemData = await onAddToCart(quantity, currentVariant?.id, true);
                
                if (cartItemData && cartItemData.id) {
                  // Redirect to checkout with only this item selected
                  setTimeout(() => {
                    router.visit(`/checkout?items=${cartItemData.id}`);
                  }, 500);
                }
              }}
              disabled={!isVariantComplete}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isVariantComplete ? 'Please select all product options first' : 'Buy now'}
            >
              Buy now
            </button>
          </div>
        </div>
      )}

      {role === "buyer" && effectiveStock <= 0 && (
        <div className="flex gap-2">
          <button disabled className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-300 py-2.5 text-sm font-semibold text-neutral-500 cursor-not-allowed">
            Out of stock
          </button>
        </div>
      )}

      {/* Report Product Button - Available for buyers */}
      {role === "buyer" && (
        <button 
          onClick={() => onReportProduct()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Flag className="h-4 w-4" />
          Report this product
        </button>
      )}
      {role === "seller" && (
        <div className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600">
          You're viewing this as a seller. Switch to a buyer account to purchase products.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Seller Info Card
// ---------------------------------------------------------------------------

function SellerInfo({ sellerName, sellerId, profilePhoto }: { sellerName: string; sellerId: number; profilePhoto?: string | null }) {
  const initials = sellerName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // TODO: Replace with actual rating from reviews/orders
  const rating = 4.5;
  const totalReviews = 0; // Placeholder

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {profilePhoto ? (
            <img 
              src={profilePhoto} 
              alt={sellerName} 
              className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-violet-100"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-900 text-xl font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-neutral-900">
              {sellerName}
            </p>
            <p className="text-sm text-neutral-500 mb-2">
              Seller
            </p>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : i < rating
                        ? 'fill-amber-200 text-amber-400'
                        : 'fill-neutral-200 text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-neutral-700">
                {rating.toFixed(1)}
              </span>
              {totalReviews > 0 && (
                <span className="text-xs text-neutral-500">
                  ({totalReviews} reviews)
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* View Store Button */}
        <Link
          href={`/seller/${sellerId}`}
          className="rounded-lg border-2 border-violet-900 bg-white px-4 py-2 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-50"
        >
          View Store
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProductDetail({ auth, product }: ProductDetailProps) {
  const user = auth?.user;
  const role: UserRole = user?.account_type ? (user.account_type as UserRole) : "guest";
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('misleading');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Find selected variant from combinations
  const currentVariant = product.has_variants && product.variants
    ? product.variants.find(v => 
        Object.entries(v.combination).every(([key, val]) => selectedVariant[key] === val)
      )
    : null;

  // Collect all variant images for display
  const allVariantImages = product.has_variants && product.variants
    ? product.variants.map(v => v.image).filter((img): img is string => !!img)
    : [];

  // Debug logging
  useEffect(() => {
    console.log('Selected variant:', selectedVariant);
    console.log('Current variant:', currentVariant);
    console.log('Variant image:', currentVariant?.image);
    console.log('All variant images:', allVariantImages);
  }, [selectedVariant, currentVariant]);

  useEffect(() => {
    if (user && user.account_type === 'buyer') {
      fetchCartCount();
      fetchWishlistCount();
      checkInWishlist();
    }
  }, []);

  // Check wishlist status when variant changes
  useEffect(() => {
    if (user && user.account_type === 'buyer') {
      checkInWishlist();
    }
  }, [selectedVariant]);

  async function fetchCartCount() {
    try {
      const response = await fetch('/api/cart/count');
      const data = await response.json();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
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

  async function checkInWishlist() {
    try {
      const response = await fetch('/api/wishlist/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: currentVariant?.id,
        }),
      });
      const data = await response.json();
      setInWishlist(data.in_wishlist || false);
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  }

  async function toggleWishlist() {
    if (!user) {
      router.visit('/login');
      return;
    }

    if (user.account_type !== 'buyer') {
      toast.error('Only buyers can use wishlist');
      return;
    }

    // If product has variants but none selected, show error
    if (product.has_variants && !currentVariant) {
      toast.error('Please select product options first');
      return;
    }

    setWishlistLoading(true);
    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: currentVariant?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInWishlist(data.in_wishlist);
        setWishlistCount(data.wishlist_count || 0);
        toast.success(data.message || (data.in_wishlist ? 'Added to wishlist' : 'Removed from wishlist'));
      } else {
        toast.error(data.error || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleAddToCart(quantity: number, variantId?: string, replaceQuantity: boolean = false) {
    if (!user) {
      router.visit('/login');
      return;
    }

    if (user.account_type !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          variant_id: variantId,
          replace_quantity: replaceQuantity, // For Buy Now
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Added to cart!', {
          action: {
            label: 'View Cart',
            onClick: () => router.visit('/cart'),
          },
        });
        setCartCount(data.cart_count || 0);
        return data.cart_item; // Return cart item data for Buy Now
      } else {
        toast.error(data.error || 'Failed to add to cart');
        return null;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
      return null;
    }
  }

  function handleReportProduct() {
    if (!user) {
      router.visit('/login');
      return;
    }
    setShowReportModal(true);
  }

  async function submitReport() {
    if (!reportReason || !reportDescription.trim()) {
      toast.error('Please select a reason and provide details');
      return;
    }

    setReportLoading(true);
    try {
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
      const response = await fetch(`/api/products/${product.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Product reported successfully');
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      } else {
        toast.error(data.error || 'Failed to report product');
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to report product');
    } finally {
      setReportLoading(false);
    }
  }

  function handleLogout() {
    router.post('/logout');
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-[Syne]">
      <Head title={`${product.name} - mimoo`} />

      <BuyerHeader
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />

      <main className="mx-auto max-w-[1100px] bg-white px-6 py-6 sm:py-8">
        <Breadcrumb 
          category={product.category} 
          sellerName={product.seller_name} 
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImageGallery 
            images={product.images} 
            productName={product.name}
            variantImage={currentVariant?.image}
            allVariantImages={allVariantImages}
          />
          <ProductInfo 
            product={product} 
            role={role}
            onAddToCart={handleAddToCart}
            onReportProduct={handleReportProduct}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            inWishlist={inWishlist}
            wishlistLoading={wishlistLoading}
            toggleWishlist={toggleWishlist}
          />
        </div>

        {/* Seller info card below */}
        <div className="mt-8">
          <SellerInfo 
            sellerName={product.seller_name} 
            sellerId={product.seller_id} 
            profilePhoto={product.seller_profile_photo}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Customer Reviews</h2>
            <button className="rounded-lg border-2 border-violet-900 bg-white px-4 py-2 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-50">
              Write a Review
            </button>
          </div>

          {/* Rating Summary */}
          <div className="mb-8 rounded-lg bg-violet-50 p-6 border border-violet-200">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overall Rating */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-violet-900 mb-2">4.8</div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < 5 ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-neutral-600">Based on 127 reviews</div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-neutral-700">{stars}</span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${stars === 5 ? 75 : stars === 4 ? 15 : stars === 3 ? 7 : stars === 2 ? 2 : 1}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-600 w-12 text-right">
                      {stars === 5 ? 95 : stars === 4 ? 19 : stars === 3 ? 9 : stars === 2 ? 3 : 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            {/* Sample Review 1 */}
            <div className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  MA
                </div>
                
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-neutral-900">Maria Santos</div>
                      <div className="text-xs text-neutral-500">Verified Purchase • 2 weeks ago</div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 5 ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    Excellent product! Exactly as described. The quality is top-notch and delivery was fast. 
                    The seller was very responsive to my questions. Highly recommend this to anyone looking for quality products!
                  </p>
                  
                  {/* Review Images */}
                  <div className="flex gap-2 mb-3">
                    <div className="h-20 w-20 rounded-lg bg-neutral-100 border border-neutral-200" />
                    <div className="h-20 w-20 rounded-lg bg-neutral-100 border border-neutral-200" />
                    <div className="h-20 w-20 rounded-lg bg-neutral-100 border border-neutral-200" />
                  </div>
                  
                  {/* Helpful Button */}
                  <div className="flex items-center gap-4 text-sm">
                    <button className="text-neutral-600 hover:text-violet-700 font-medium">
                      👍 Helpful (24)
                    </button>
                    <button className="text-neutral-600 hover:text-violet-700 font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Review 2 */}
            <div className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  JD
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-neutral-900">Juan Dela Cruz</div>
                      <div className="text-xs text-neutral-500">Verified Purchase • 1 month ago</div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    Good value for money. The product works as expected and meets my needs. 
                    Shipping took a bit longer than expected but overall satisfied with my purchase.
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <button className="text-neutral-600 hover:text-violet-700 font-medium">
                      👍 Helpful (12)
                    </button>
                    <button className="text-neutral-600 hover:text-violet-700 font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Review 3 */}
            <div className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white">
                  AR
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-neutral-900">Anna Reyes</div>
                      <div className="text-xs text-neutral-500">Verified Purchase • 2 months ago</div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 5 ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    Love it! 💖 This product exceeded my expectations. Great quality, fast shipping, 
                    and excellent customer service. Will definitely order again!
                  </p>
                  
                  {/* Review Images */}
                  <div className="flex gap-2 mb-3">
                    <div className="h-20 w-20 rounded-lg bg-neutral-100 border border-neutral-200" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <button className="text-neutral-600 hover:text-violet-700 font-medium">
                      👍 Helpful (18)
                    </button>
                    <button className="text-neutral-600 hover:text-violet-700 font-medium">
                      Reply
                    </button>
                  </div>

                  {/* Seller Reply */}
                  <div className="mt-4 ml-4 rounded-lg bg-violet-50 p-4 border-l-4 border-violet-600">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                        {product.seller_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900 text-sm mb-1">
                          {product.seller_name} <span className="text-xs font-normal text-violet-700">(Seller)</span>
                        </div>
                        <p className="text-sm text-neutral-700">
                          Thank you so much for your kind words! We're thrilled you're happy with your purchase. 
                          Looking forward to serving you again! 🙏
                        </p>
                        <div className="text-xs text-neutral-500 mt-2">2 months ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Load More Button */}
          <div className="mt-8 text-center">
            <button className="rounded-lg border border-violet-300 bg-white px-6 py-2.5 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-50">
              Load More Reviews
            </button>
          </div>
        </div>
      </main>

      {/* Report Product Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Report Product</h2>
            
            <div className="space-y-4">
              {/* Reason Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Reason for reporting <span className="text-red-600">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-900/20"
                >
                  <option value="misleading">Misleading or false information</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="counterfeit">Counterfeit or fake product</option>
                  <option value="spam">Spam or duplicate listing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Additional details <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide more details about why you're reporting this product..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-900/20 resize-none"
                />
                <p className="mt-1 text-xs text-neutral-500 text-right">
                  {reportDescription.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('misleading');
                    setReportDescription('');
                  }}
                  disabled={reportLoading}
                  className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={reportLoading || !reportReason || !reportDescription.trim()}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
