import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BuyerHeader } from '@/components/buyer-header';
import { FollowButton } from "@/components/buyer/follow-button";
import { Package, Users, Star, MessageCircle, Truck, CheckCircle, Share2 } from 'lucide-react';

interface Product {
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
  images: string[];
  main_image: string | null;
  brand: string;
}

interface SellerStats {
  products: number;
  sold: number;
  followers: number;
  rating: number;
  total_reviews: number;
  account_age_years: number;
  verified: boolean;
}

interface ViewSellerProps {
  auth?: { user: any };
  seller: {
    id: number;
    name: string;
    business_name: string | null;
    email: string;
    profile_photo_url?: string | null;
    cover_photo_url?: string | null;
  };
}

export default function ViewSeller({ auth, seller }: ViewSellerProps) {
  const user = auth?.user;
  // "Chat with seller": guests go to login via /messages; hidden for the seller
  // themself, non-buyer accounts, or when the seller id is missing.
  const canChat = !!seller?.id && (!user || (user.account_type === 'buyer' && Number(user.id) !== Number(seller.id)));
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug: Log seller data
  console.log('Seller data received:', seller);
  console.log('Profile photo URL:', seller.profile_photo_url);
  console.log('Cover photo URL:', seller.cover_photo_url);

  useEffect(() => {
    if (user && user.account_type === 'buyer') {
      fetchCartCount();
    }
    fetchStoreData();
  }, []);

  async function fetchCartCount() {
    try {
      const response = await fetch('/api/cart/count');
      const data = await response.json();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  }

  async function fetchStoreData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/seller/${seller.id}/store`);
      const data = await response.json();
      setProducts(data.products || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    router.post('/logout');
  }

  const displayName = seller.business_name || seller.name;
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format followers count
  function formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  function handleProductClick(productId: number) {
    router.visit(`/product/${productId}`);
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-[Syne]">
      <Head title={`${displayName} - mimoo`} />

      <BuyerHeader
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
      />

      <main className="mx-auto max-w-[1200px]">
        {/* Cover Photo */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-violet-700">
          {seller.cover_photo_url ? (
            <img 
              src={seller.cover_photo_url} 
              alt="Store Cover" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[url('/images/store-pattern.png')] bg-cover bg-center opacity-20" />
          )}
          
          {/* Certified Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-lg">
            <CheckCircle className="h-4 w-4 text-violet-600" />
            <span className="text-xs font-semibold text-neutral-800">mimoo Mall Certified</span>
          </div>

          {/* Share Button */}
          <button className="absolute top-4 right-48 rounded-full bg-white p-2 shadow-lg hover:bg-neutral-100 transition">
            <Share2 className="h-4 w-4 text-neutral-700" />
          </button>
        </div>

        {/* Store Info Section */}
        <div className="relative bg-white px-8 pb-6">
          {/* Store Avatar - overlapping cover */}
          <div className="flex items-end justify-between" style={{ marginTop: '-48px' }}>
            <div className="flex items-end gap-4">
              {/* Avatar with border */}
              <div className="relative">
                {seller.profile_photo_url ? (
                  <img 
                    src={seller.profile_photo_url} 
                    alt={displayName} 
                    className="h-32 w-32 rounded-2xl object-cover shadow-xl border-4 border-white"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-violet-900 text-4xl font-bold text-white shadow-xl border-4 border-white">
                    {initials}
                  </div>
                )}
                {stats?.verified && (
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-violet-600 p-2">
                    <CheckCircle className="h-5 w-5 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Store Name & Badge */}
              <div className="pb-4">
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  {stats?.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      <CheckCircle className="h-3 w-3" />
                      VERIFIED STUDIO
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pb-4">
              <FollowButton
                sellerId={seller.id}
                user={user}
                onCountChange={(n) => setStats((prev) => (prev ? { ...prev, followers: n } : prev))}
              />
              {canChat && (
                <Link
                  href={`/messages?seller_id=${seller.id}`}
                  className="rounded-lg border border-violet-600 bg-white px-6 py-2.5 text-sm font-semibold text-violet-600 hover:bg-violet-50 transition flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with seller
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-6 gap-6 border-t border-neutral-200 pt-6">
            {/* Products */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Package className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-neutral-500">Products</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{stats?.products || 0}</p>
              <p className="text-xs text-green-600 font-medium">Active</p>
            </div>

            {/* Followers */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-neutral-500">Followers</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">
                {formatCount(stats?.followers || 0)}
              </p>
              <p className="text-xs text-neutral-500">Store followers</p>
            </div>

            {/* Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-neutral-500">Store Rating</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{stats?.rating.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-neutral-500">({stats?.total_reviews || 0} reviews)</p>
            </div>

            {/* Total Sold */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Package className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-neutral-500">Total Sold</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{stats?.sold || 0}</p>
              <p className="text-xs text-green-600 font-medium">Units</p>
            </div>

            {/* Fulfillment */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-neutral-500">Fulfillment</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">&lt; 24h</p>
              <p className="text-xs text-green-600 font-medium">Priority</p>
            </div>

            {/* Registration */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-violet-600" />
                <span className="text-xs text-neutral-500">Registration</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{stats?.account_age_years || 0} Yrs</p>
              <p className="text-xs text-green-600 font-medium">
                {stats?.verified ? 'BIR Verified' : 'Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-6 px-8 pb-8">
          <div className="rounded-xl border border-neutral-200 bg-white p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Products</h2>
            
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
                <p className="mt-4 text-neutral-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No products available yet.
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                      {product.main_image ? (
                        <img
                          src={product.main_image}
                          alt={product.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-400">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-medium text-neutral-900 mb-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-2">
                        {product.is_on_sale ? (
                          <div>
                            <p className="text-lg font-bold text-violet-600">
                              ₱{product.effective_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-neutral-500 line-through">
                              ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-neutral-900">
                            ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>

                      {/* Stock Status */}
                      {product.stock <= 10 && product.stock > 0 && (
                        <p className="text-xs text-orange-600 font-medium">
                          Only {product.stock} left!
                        </p>
                      )}
                      {product.stock === 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          Out of Stock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
