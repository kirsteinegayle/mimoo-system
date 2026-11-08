import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Package, ShoppingCart } from "lucide-react";
import { BuyerHeader } from "@/components/buyer-header";

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price: number | null;
  effective_price: number;
  is_on_sale: boolean;
  main_image: string | null;
  stock: number;
  category: string;
  seller_name: string;
}

interface CategoryPageProps {
  auth?: { user: any };
  category: string;
  products: Product[];
}

const categories: Category[] = [
  { id: "c1", label: "Pet Supplies", icon: "/images/pet supplies.jpg" },
  { id: "c2", label: "Electronics and Gadgets", icon: "/images/electronics.jpg" },
  { id: "c3", label: "Women's Apparel", icon: "/images/womens apparel.jpg" },
  { id: "c4", label: "Men's Apparel", icon: "/images/mens apparel.jpg" },
  { id: "c5", label: "Kids and Baby", icon: "/images/kids and baby.jpg" },
  { id: "c6", label: "Home and Garden", icon: "/images/home and living.jpg" },
  { id: "c7", label: "Sports and Outdoors", icon: "/images/sports and outdoors.jpg" },
  { id: "c8", label: "Health and Beauty", icon: "/images/health and beauty.jpg" },
  { id: "c9", label: "Books and Media", icon: "/images/books and media.jpg" },
  { id: "c10", label: "Food and Gourmet", icon: "/images/food and gourmet.jpg" },
  { id: "c11", label: "Furniture and Decor", icon: "/images/home and living.jpg" },
  { id: "c12", label: "Jewelry and Watches", icon: "/images/jewelry and watches.jpg" },
];

export default function CategoryPage({ auth, category, products: initialProducts }: CategoryPageProps) {
  const user = auth?.user;
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user && user.account_type === 'buyer') {
      fetchCartCount();
      fetchWishlistCount();
    }
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

  async function fetchWishlistCount() {
    try {
      const response = await fetch('/api/wishlist/count');
      const data = await response.json();
      setWishlistCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error);
    }
  }

  function handleLogout() {
    router.post('/logout');
  }

  const formatPrice = (price: number) => {
    return '₱' + price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-[Syne]">
      <Head title={`${category} - mimoo`} />

      <BuyerHeader
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        currentCategory={category}
      />

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        {/* Minimal Category Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2A1B4D]">{category}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No products found</h3>
            <p className="text-neutral-500 mb-6">There are no products in this category yet.</p>
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 bg-[#4B2E7E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3a2360] transition"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-neutral-100 flex items-center justify-center">
                  {product.main_image ? (
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-neutral-300" />
                  )}
                  {product.is_on_sale && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.round((1 - product.effective_price / product.price) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-[#2A1B4D] line-clamp-2 mb-2 flex-1">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mt-auto">
                    {product.is_on_sale ? (
                      <div>
                        <div className="text-base font-bold text-[#4B2E7E]">
                          {formatPrice(product.effective_price)}
                        </div>
                        <div className="text-xs text-neutral-400 line-through">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-base font-bold text-[#4B2E7E]">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>

                  {/* Stock status */}
                  <div className="text-xs text-neutral-500 mt-1">
                    {product.stock > 0 ? (
                      <span className="text-green-600">{product.stock} in stock</span>
                    ) : (
                      <span className="text-red-600">Out of stock</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
