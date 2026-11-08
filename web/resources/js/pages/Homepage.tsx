"use client";

import { useRef, useState, useEffect, type FormEvent } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  ChevronRight,
  ChevronLeft,
  Bell,
  Search,
  ShoppingCart,
  LogOut,
  Heart,
} from "lucide-react";
import { SignupModal } from "@/components/signup-modal";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "guest" | "buyer" | "seller";

interface Category {
  id: string;
  label: string;
  icon?: string | null;
  subcategories?: string[]; // shown in the header hover menu
}

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  effective_price?: number;
  is_on_sale?: boolean;
  stock?: number;
  stock_status?: string;
  is_in_stock?: boolean;
  is_low_stock?: boolean;
  main_image?: string | null;
  seller_name?: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Placeholder data — swap out with real content/API data later
// ---------------------------------------------------------------------------

const CATEGORIES: Category[] = [
  {
    id: "c1",
    label: "Pet Supplies",
    icon: "/images/pet supplies.jpg",
    subcategories: ["Dog Food", "Cat Food", "Dog Treats", "Cat Litter", "Pet Toys", "Grooming & Shampoo", "Beds & Crates", "Leashes & Collars", "Pet Clothing", "Feeding Bowls", "Pet Health & Vitamins", "Aquarium & Fish", "Bird Supplies", "Small Animal Supplies"],
  },
  {
    id: "c2",
    label: "Electronics and Gadgets",
    icon: "/images/electronics.jpg",
    subcategories: ["Mobile Phones", "Tablets", "Laptops", "Desktop PCs", "Audio & Earbuds", "Speakers", "Cameras", "Smartwatches", "Chargers & Cables", "Power Banks", "Phone Cases", "Gaming Consoles", "Monitors", "Keyboards & Mice", "Smart Home", "Drones"],
  },
  {
    id: "c3",
    label: "Women's Apparel",
    icon: "/images/women's apparel.jpg",
    subcategories: ["Dresses", "Tops & Blouses", "T-Shirts", "Pants & Jeans", "Skirts", "Shorts", "Jackets & Cardigans", "Activewear", "Sleepwear", "Lingerie", "Swimwear", "Handbags", "Sandals & Flats", "Heels", "Sneakers", "Scarves & Hats"],
  },
  {
    id: "c4",
    label: "Men's Apparel",
    icon: "/images/mens apparel.jpg",
    subcategories: ["T-Shirts", "Polo Shirts", "Button-Down Shirts", "Pants & Jeans", "Shorts", "Jackets & Hoodies", "Underwear", "Sleepwear", "Activewear", "Swim Trunks", "Sneakers", "Formal Shoes", "Sandals & Slippers", "Belts & Wallets", "Caps & Hats", "Backpacks"],
  },
  {
    id: "c5",
    label: "Kids and Baby",
    icon: "/images/kids and babies.jpg",
    subcategories: ["Baby Clothing", "Kids' Clothing", "Diapers & Wipes", "Baby Formula", "Feeding & Nursing", "Bath & Skincare", "Strollers", "Car Seats", "Cribs & Bedding", "Toys & Games", "Educational Toys", "Building Blocks", "School Bags", "School Supplies", "Kids' Shoes", "Maternity"],
  },
  {
    id: "c6",
    label: "Home and Garden",
    icon: "/images/home and garden.jpg",
    subcategories: ["Cookware", "Kitchen Appliances", "Dinnerware", "Food Storage", "Bedding & Pillows", "Curtains & Blinds", "Rugs & Carpets", "Home Decor", "Lighting", "Bath Essentials", "Laundry & Cleaning", "Organizers", "Plants & Pots", "Garden Tools", "Fans & Aircon", "Tools & Hardware"],
  },
  {
    id: "c7",
    label: "Sports and Outdoors",
    icon: "/images/sports.jpg",
    subcategories: ["Gym Equipment", "Yoga & Pilates", "Running", "Cycling", "Camping & Hiking", "Fishing", "Basketball", "Badminton & Tennis", "Volleyball", "Football", "Swimming", "Martial Arts", "Skateboards & Scooters", "Sportswear", "Sports Shoes", "Water Bottles & Hydration"],
  },
  {
    id: "c8",
    label: "Health and Beauty",
    icon: "/images/health and beauty.jpg",
    subcategories: ["Face Care", "Body Care", "Sunscreen", "Makeup - Face", "Makeup - Lips", "Makeup - Eyes", "Perfume & Cologne", "Hair Care", "Hair Tools", "Nail Care", "Vitamins & Supplements", "Feminine Care", "Men's Grooming", "Oral Care", "Medical Supplies", "Massage & Wellness"],
  },
  {
    id: "c9",
    label: "Books and Media",
    icon: null,
    subcategories: ["Fiction", "Non-Fiction", "Self-Help", "Children's Books", "Textbooks", "Comics & Manga", "Magazines", "Religious Books", "Cookbooks", "Vinyl & CDs", "Musical Instruments", "Movies & DVDs", "Video Games", "Board Games", "Puzzles", "Art & Craft Supplies"],
  },
  {
    id: "c10",
    label: "Food and Gourmet",
    icon: null,
    subcategories: ["Chips & Crackers", "Biscuits & Cookies", "Chocolates", "Candies", "Coffee", "Tea", "Juices & Soft Drinks", "Rice & Grains", "Canned Goods", "Noodles & Pasta", "Condiments & Sauces", "Cooking Oil & Spices", "Local Delicacies", "Dried Fish & Seafood", "Baking Supplies", "Gift Baskets"],
  },
  {
    id: "c11",
    label: "Furniture and Office Equipment",
    icon: null,
    subcategories: ["Sofas", "Dining Sets", "Beds & Mattresses", "Wardrobes & Cabinets", "Shelves & Bookcases", "TV Stands", "Coffee Tables", "Office Desks", "Office Chairs", "Filing Cabinets", "Printers & Ink", "Paper & Notebooks", "Pens & Markers", "Desk Lamps", "Whiteboards", "Outdoor Furniture"],
  },
  {
    id: "c12",
    label: "Jewelry and Watches",
    icon: null,
    subcategories: ["Necklaces", "Pendants", "Rings", "Wedding Bands", "Earrings", "Bracelets", "Anklets", "Brooches", "Gold Jewelry", "Silver Jewelry", "Pearls & Gemstones", "Men's Watches", "Women's Watches", "Smart & Digital Watches", "Watch Straps", "Jewelry Boxes"],
  },
];

interface HomepageProps {
  auth?: { user: any };
  initialProducts?: Product[];
  filters?: {
    search?: string;
    category?: string;
  };
  vouchers?: any[];
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function HeroMainBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const slides = [
    {
      title: 'Main promo banner 1',
      bgColor: 'bg-violet-100',
      image: '/images/main banner 1.jpg',
    },
    {
      title: 'Main promo banner 2',
      bgColor: 'bg-blue-100',
      image: '/images/main banner 2.jpg',
    },
    {
      title: 'Main promo banner 3',
      bgColor: 'bg-pink-100',
      image: null,
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  return (
    <div className="relative overflow-hidden rounded-xl min-h-48 sm:min-h-56">
      {/* Carousel slides */}
      <div className="relative h-full min-h-48 sm:min-h-56">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {slide.image ? (
              <div className="relative h-full w-full">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover rounded-xl" />
              </div>
            ) : (
              <div className={`flex items-center justify-center rounded-xl ${slide.bgColor} text-xs font-medium text-neutral-400 h-full`}>
                {slide.title}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Carousel indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-6 sm:w-8 bg-white' 
                  : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation controls - bottom right */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-violet-600 text-xl font-bold transition shadow-md"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-violet-600 transition shadow-md"
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-violet-600 text-xl font-bold transition shadow-md"
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

// Each banner box uses the real aspect ratio of its image file, so
// object-fill never stretches. Images are absolutely positioned inside the
// box, so they never push the row height around.
function SmallPlaceholderBanner({ label }: { label: string }) {
  let imageSrc: string | null = null;
  let ratioClass = "min-h-24";
  if (label === "Perfume & makeup offers") {
    imageSrc = "/images/perfumes banner.jpg";
    ratioClass = "aspect-[1199/439]"; // image is 1199 x 439
  } else if (label === "iPhone offers") {
    imageSrc = "/images/phones banner.jpg";
    ratioClass = "aspect-[1200/600]"; // image is 1200 x 600
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-neutral-200 text-xs font-medium text-neutral-400 ${ratioClass}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={label}
          className="absolute inset-0 h-full w-full object-fill"
        />
      ) : (
        label
      )}
    </div>
  );
}

// Image is 415 x 356. On mobile it keeps its own ratio; from sm up it
// stretches to the row height (which matches its ratio by design).
function BuyOneGetOneBanner() {
  return (
    <div className="relative aspect-[415/356] overflow-hidden rounded-xl bg-neutral-200 sm:aspect-auto">
      <img
        src="/images/payday sale.png"
        alt="Payday sale"
        className="absolute inset-0 h-full w-full object-fill"
      />
    </div>
  );
}

// Image is 1080 x 1080 (square).
function SuperSeratusBanner() {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-200 sm:aspect-auto">
      <img
        src="/images/sale banner.jpg"
        alt="Sale Banner"
        className="absolute inset-0 h-full w-full object-fill"
      />
    </div>
  );
}

function VoucherCard({ code, title, discount, minPurchase, validUntil, isClaimed, isUsed, onClaim }: {
  code: string;
  title: string;
  discount: string;
  minPurchase: number;
  validUntil: string;
  isClaimed?: boolean;
  isUsed?: boolean;
  onClaim?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Voucher ${code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-w-[280px] sm:min-w-[300px] snap-start flex-none">
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-pink-50 p-4 hover:shadow-lg transition-shadow">
        {/* Discount Badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {discount}
          </div>
        </div>

        {/* Status Badge */}
        {isUsed && (
          <div className="absolute top-2 left-2">
            <div className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Used
            </div>
          </div>
        )}
        {isClaimed && !isUsed && (
          <div className="absolute top-2 left-2">
            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Claimed
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-3 mt-6">
          <h3 className="font-bold text-violet-900 text-base">{title}</h3>
          <p className="text-xs text-violet-700 mt-0.5">
            Min. purchase: ₱{minPurchase.toLocaleString()}
          </p>
        </div>

        {/* Code */}
        <div className="mb-3">
          <div className="bg-white border-2 border-violet-200 rounded-lg p-3 flex items-center justify-between">
            <span className="font-mono font-bold text-violet-900 text-lg tracking-wider">
              {code}
            </span>
            {isClaimed && !isUsed ? (
              <button
                onClick={copyCode}
                className="ml-2 px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-md hover:bg-violet-700 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            ) : !isUsed && onClaim ? (
              <button
                onClick={onClaim}
                className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                Claim
              </button>
            ) : null}
          </div>
        </div>

        {/* Valid Until */}
        <div className="flex items-center justify-between text-xs text-violet-700">
          <span>Valid until</span>
          <span className="font-semibold">{validUntil}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${encodeURIComponent(category.label)}`}
      className="flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-lg p-1 text-center transition-colors hover:bg-violet-50 sm:gap-2"
      style={{ width: "calc((100% - 40px) / 5)" }}
    >
      <div className="aspect-square w-full rounded-full bg-neutral-200 overflow-hidden">
        {category.icon ? (
          <img 
            src={category.icon} 
            alt={category.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <span className="text-[10px] font-medium text-neutral-700 line-clamp-1 sm:text-xs">
        {category.label}
      </span>
    </Link>
  );
}

function CategoryCarousel({ categories }: { categories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ ratio: 0.5, position: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateProgress = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const ratio = clientWidth / scrollWidth;
    const position = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    setProgress({ ratio, position });
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScroll - 4);
  };

  useEffect(() => {
    updateProgress();
    window.addEventListener("resize", updateProgress);
    return () => window.removeEventListener("resize", updateProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateProgress}
          className="category-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.category-scroll::-webkit-scrollbar { display: none; }`}</style>
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>

        {/* Prev / next controls, centered on the image row */}
        <button
          aria-label="Previous categories"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          className="absolute left-0 top-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-1.5 shadow-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4 text-neutral-600" />
        </button>
        <button
          aria-label="Next categories"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          className="absolute right-0 top-10 -translate-y-1/2 translate-x-1/2 rounded-full border border-neutral-200 bg-white p-1.5 shadow-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronRight className="h-4 w-4 text-neutral-600" />
        </button>
      </div>

      {/* Scroll progress indicator */}
      <div className="relative mx-auto mt-3 h-1.5 w-20 rounded-full bg-neutral-200">
        <div
          className="absolute top-0 h-1.5 rounded-full bg-neutral-400 transition-all duration-150"
          style={{
            width: `${Math.max(progress.ratio * 100, 15)}%`,
            left: `${progress.position * (100 - Math.max(progress.ratio * 100, 15))}%`,
          }}
        />
      </div>
    </div>
  );
}

function ProductCard({ 
  product, 
  role,
  onGuestAction,
  onAddToCart,
}: { 
  product: Product; 
  role: UserRole;
  onGuestAction?: () => void;
  onAddToCart?: (productId: number) => void;
}) {
  const formatPrice = (price: number) => {
    return '₱' + price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-neutral-200 overflow-hidden">
        {product.main_image ? (
          <img src={product.main_image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
            No image
          </div>
        )}
        
        {/* Hover overlay with "Find Similar" */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link
            href={`/category/${encodeURIComponent(product.category)}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-violet-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-violet-50 transition-colors shadow-lg"
          >
            Find Similar
          </Link>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-sm text-neutral-800 line-clamp-2">
          {product.name}
        </span>
        <div className="flex items-center gap-2">
          {product.is_on_sale && product.sale_price ? (
            <>
              <span className="text-sm font-semibold text-violet-700">
                {formatPrice(product.effective_price || product.sale_price)}
              </span>
              <span className="text-xs text-neutral-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-violet-700">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {product.stock_status && (
          <span className={`text-xs ${
            product.is_in_stock 
              ? product.is_low_stock ? 'text-orange-600' : 'text-green-600'
              : 'text-red-600'
          }`}>
            {product.stock_status}
          </span>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// CategoryNav — plain-text category row under the header. Hovering a
// category (desktop) or tapping it (touch devices) opens a full-width panel
// with that category's subcategories.
// ---------------------------------------------------------------------------

function CategoryNav({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const active = categories.find((c) => c.id === activeId);

  // Close when clicking/tapping outside the nav
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const categoryHref = (c: Category, sub?: string) =>
    `/category/${encodeURIComponent(c.label)}${
      sub ? `?sub=${encodeURIComponent(sub)}` : ""
    }`;

  const isTouch = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches;

  return (
    <nav
      ref={navRef}
      onMouseLeave={() => setActiveId(null)}
      className="relative border-t border-white/10 bg-black/10"
      aria-label="Categories"
    >
      <div className="mx-auto max-w-6xl px-4">
        <ul
          className="flex gap-1 overflow-x-auto whitespace-nowrap py-1 text-xs sm:text-[13px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((c) => (
            <li key={c.id} onMouseEnter={() => setActiveId(c.id)}>
              <Link
                href={categoryHref(c)}
                onClick={(e) => {
                  // On touch devices the first tap opens the menu instead of navigating
                  if (isTouch() && c.subcategories?.length) {
                    e.preventDefault();
                    setActiveId(activeId === c.id ? null : c.id);
                  }
                }}
                className={`block rounded px-3 py-2 text-white/90 transition-colors hover:text-white ${
                  activeId === c.id ? "bg-white/15 text-white" : ""
                }`}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Subcategory panel */}
      {active?.subcategories && active.subcategories.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-neutral-200 bg-white text-neutral-800 shadow-lg">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link
              href={categoryHref(active)}
              onClick={() => setActiveId(null)}
              className="mb-3 inline-block text-sm font-bold text-violet-700 hover:underline"
            >
              {active.label}
            </Link>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-4">
              {active.subcategories.map((sub) => (
                <Link
                  key={sub}
                  href={categoryHref(active, sub)}
                  onClick={() => setActiveId(null)}
                  className="rounded px-2 py-1 text-neutral-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Header — search bar + cart/account icons always shown, matching the
// reference design. Role only changes downstream content (product CTAs).
// The category nav sits in its own row below the logo/search row.
//
//   ┌──────────────────────────────────────────────────────────┐
//   │                                              ◯ username   │
//   │  mimoo   ( ───────── search ─────────────── ●)   🔔  🛒   │
//   │  Pet Supplies  Electronics  Women's Apparel  ...         │
//   └──────────────────────────────────────────────────────────┘
// ---------------------------------------------------------------------------

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Header({
  username = "username",
  avatarUrl = null,
  notificationCount = 5,
  cartCount = 0,
  wishlistCount = 0,
  categories = [],
  onSearch,
  onLogout,
  onCategoryFilter,
  initialCategory = "",
}: {
  username?: string;
  avatarUrl?: string | null;
  notificationCount?: number;
  cartCount?: number;
  wishlistCount?: number;
  categories?: Category[];
  onSearch?: (query: string, category?: string) => void;
  onLogout?: () => void;
  onCategoryFilter?: (category: string) => void;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  // Detect if user is logged in based on onLogout being provided
  const isLoggedIn = !!onLogout;

  // Update selected category when initialCategory changes
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query.trim(), selectedCategory);
  };

  const handleCategorySelect = (categoryLabel: string) => {
    setSelectedCategory(categoryLabel);
    setShowCategoryDropdown(false);
    
    // If we have onCategoryFilter prop, use it to filter immediately
    if (onCategoryFilter) {
      onCategoryFilter(categoryLabel);
    }
  };

  return (
    <header
      className="w-full text-white sticky top-0 z-50"
      style={{
        background:
          "linear-gradient(90deg, #1c1430 0%, #3a2d5c 45%, #6a5a8a 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Utility row: account, top right (sits above bell + cart) */}
        <div className="flex h-7 items-center justify-end text-[10px] sm:text-[11px]">
          <div className="relative">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-white"
                >
                  <span className="h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="max-w-24 truncate">{username}</span>
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      onClick={() => setShowMenu(false)}
                    >
                      My Purchases
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLogout?.();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1 text-[11px] font-medium text-white/90 transition-colors hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main row: logo · pill search · bell · cart */}
        <div className="flex items-center gap-3 pb-3 pt-1 sm:gap-6 sm:pb-4">
          <Link
            href="/homepage"
            className="shrink-0 text-xl font-bold lowercase tracking-tight sm:text-2xl"
          >
            mimoo
          </Link>

          <form
            onSubmit={handleSubmit}
            role="search"
            className="relative min-w-0 flex-1 flex items-center gap-0"
          >
            {/* Category Dropdown */}
            <div ref={categoryDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 h-8 sm:h-9 px-3 sm:px-4 bg-neutral-200 rounded-l-full text-xs sm:text-sm text-neutral-700 font-medium hover:bg-neutral-300 transition-colors whitespace-nowrap border-r border-neutral-300"
              >
                <span className="hidden sm:inline">
                  {selectedCategory || "All Categories"}
                </span>
                <span className="sm:hidden">
                  {selectedCategory ? (selectedCategory.length > 12 ? selectedCategory.substring(0, 12) + "..." : selectedCategory) : "All"}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 max-h-[32rem] overflow-y-auto bg-white rounded-lg shadow-xl border border-neutral-200 z-50">
                  {/* Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-violet-700 text-white px-4 py-3 rounded-t-lg">
                    <h3 className="font-semibold text-sm">Browse by Category</h3>
                    <p className="text-xs text-violet-100 mt-0.5">Filter products by category</p>
                  </div>
                  
                  {/* All Categories Option */}
                  <button
                    onClick={() => handleCategorySelect("")}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-violet-50 transition-colors border-b border-neutral-100 ${
                      !selectedCategory ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>All Categories</span>
                      {!selectedCategory && (
                        <svg className="w-4 h-4 ml-auto text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                  
                  {/* Popular Categories Section */}
                  <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Popular Categories</span>
                  </div>
                  
                  {/* Category List */}
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.label)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-violet-50 transition-colors border-b border-neutral-100 ${
                        selectedCategory === cat.label ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {cat.icon ? (
                          <img src={cat.icon} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{cat.label.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{cat.label}</div>
                          {cat.subcategories && (
                            <div className="text-xs text-neutral-500 mt-0.5 truncate">
                              {cat.subcategories.length} subcategories
                            </div>
                          )}
                        </div>
                        {selectedCategory === cat.label && (
                          <svg className="w-5 h-5 text-violet-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                  
                  {/* Footer Tip */}
                  <div className="px-4 py-3 bg-neutral-50 text-xs text-neutral-600 rounded-b-lg border-t border-neutral-200">
                    💡 Tip: Use the search bar along with category filters for better results
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="h-8 w-full rounded-r-full bg-neutral-200 pl-4 pr-11 text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-300 sm:h-9"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#2a2340] text-white transition-colors hover:bg-[#3a2d5c] sm:h-7 sm:w-7"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Bell + Wishlist + Cart, side by side on the same row as the search bar */}
          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            <button
              aria-label="Notifications"
              className="relative flex items-center text-white transition-colors hover:text-white/80"
            >
              <Bell className="h-5 w-5" />
              <CountBadge count={notificationCount} />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex items-center text-white transition-colors hover:text-white/80"
            >
              <Heart className="h-5 w-5" />
              <CountBadge count={wishlistCount} />
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex items-center text-white transition-colors hover:text-white/80"
            >
              <ShoppingCart className="h-5 w-5" />
              <CountBadge count={cartCount} />
            </Link>
          </div>
        </div>
      </div>

      {/* Category nav row (full width so the hover panel can span the header) */}
      {categories.length > 0 && <CategoryNav categories={categories} />}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Homepage({ auth, initialProducts = [], filters = {}, vouchers = [] }: HomepageProps) {
  const user = auth?.user;
  
  const role: UserRole = user ? (user.account_type as UserRole) : "guest";
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState(filters);
  const [voucherList, setVoucherList] = useState(vouchers);

  // Update products when initialProducts change (from server-side filtering)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);
  
  // Update vouchers when vouchers prop changes
  useEffect(() => {
    setVoucherList(vouchers);
  }, [vouchers]);
  
  async function handleClaimVoucher(voucherId: number) {
    if (!user) {
      toast.error('Please login to claim vouchers');
      return;
    }
    
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
        // Refresh vouchers
        const voucherResponse = await fetch('/api/vouchers/available');
        const voucherData = await voucherResponse.json();
        setVoucherList(voucherData.vouchers || []);
      } else {
        toast.error(data.message || 'Failed to claim voucher');
      }
    } catch (error) {
      console.error('Claim voucher error:', error);
      toast.error('Failed to claim voucher');
    }
  }

  // Update products when initialProducts change (from server-side filtering)
  useEffect(() => {
    setProducts(initialProducts);
    setActiveFilters(filters);
  }, [initialProducts, filters]);

  // Fetch cart count on mount
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

  function clearFilters() {
    router.visit('/homepage', {
      preserveScroll: false,
    });
  }

  async function handleAddToCart(productId: number) {
    if (!user) {
      setShowSignupModal(true);
      return;
    }

    if (user.account_type !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Added to cart!');
        setCartCount(data.cart_count || 0);
      } else {
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    router.post('/logout');
  }

  function handleGuestAction() {
    setShowSignupModal(true);
  }

  function handleSearch(query: string, category?: string) {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (category) params.set('category', category);
    
    const queryString = params.toString();
    router.visit(`/homepage${queryString ? '?' + queryString : ''}`);
  }

  function handleCategoryFilter(category: string) {
    const params = new URLSearchParams(window.location.search);
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    const queryString = params.toString();
    router.visit(`/homepage${queryString ? '?' + queryString : ''}`, {
      preserveScroll: true,
    });
  }

  return (
    <div
      className="min-h-screen bg-neutral-50"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <Head title="Home" />
      
      {/* Loads Syne from Google Fonts. If you already load it globally
          (e.g. via next/font or a <link> in your root layout), remove this
          block and the inline fontFamily above to avoid loading it twice. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
      `}</style>

      <Header 
        username={user ? user.name : "Guest"} 
        onLogout={user ? handleLogout : undefined}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={CATEGORIES}
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        initialCategory={activeFilters.category || ""}
      />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Active Filters Display */}
        {(activeFilters.search || activeFilters.category) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-violet-50 p-3 border border-violet-200">
            <span className="text-sm font-medium text-violet-900">Active filters:</span>
            
            {activeFilters.search && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm border border-violet-300">
                <span className="text-neutral-600">Search:</span>
                <span className="font-semibold text-violet-700">{activeFilters.search}</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('search');
                    const queryString = params.toString();
                    router.visit(`/homepage${queryString ? '?' + queryString : ''}`, {
                      preserveScroll: true,
                    });
                  }}
                  className="ml-1 text-violet-600 hover:text-violet-800"
                  aria-label="Remove search filter"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {activeFilters.category && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm border border-violet-300">
                <span className="text-neutral-600">Category:</span>
                <span className="font-semibold text-violet-700">{activeFilters.category}</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('category');
                    const queryString = params.toString();
                    router.visit(`/homepage${queryString ? '?' + queryString : ''}`, {
                      preserveScroll: true,
                    });
                  }}
                  className="ml-1 text-violet-600 hover:text-violet-800"
                  aria-label="Remove category filter"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <button
              onClick={clearFilters}
              className="ml-auto text-sm font-medium text-violet-700 hover:text-violet-900 underline"
            >
              Clear all
            </button>
            
            <div className="w-full mt-1 text-xs text-neutral-600">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Hero: big banner on top, 3-column row below it.
            Column widths (fr) are set from the image ratios so all three
            columns come out the same height with no stretching:
            perfume+phone stack : payday : sale  ≈  372 : 390 : 334 */}
        <section className="flex flex-col gap-2 sm:gap-3">
          <HeroMainBanner />

          <div className="grid grid-cols-[162fr_173fr] gap-2 sm:grid-cols-[372fr_390fr_334fr] sm:gap-3">
            <div className="flex flex-col gap-2 sm:gap-3">
              <SmallPlaceholderBanner label="Perfume & makeup offers" />
              <SmallPlaceholderBanner label="iPhone offers" />
            </div>
            <BuyOneGetOneBanner />
            <SuperSeratusBanner />
          </div>
        </section>

        {/* Browse by categories */}
        <section className="mt-6 sm:mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 sm:text-base">
              Browse by categories
            </h2>
            <button className="flex items-center text-xs text-violet-600 hover:underline sm:text-sm">
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <CategoryCarousel categories={CATEGORIES} />
        </section>

        {/* Vouchers Section */}
        <section className="mt-6 sm:mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 sm:text-base">
                Available Vouchers
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">Save more with these exclusive codes</p>
            </div>
          </div>
          
          {/* Vouchers Carousel */}
          <div className="relative -mx-2">
            <div className="flex gap-3 overflow-x-auto px-2 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
              {voucherList.length > 0 ? (
                voucherList.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    code={voucher.code}
                    title={voucher.name}
                    discount={voucher.type === 'percentage' ? `${voucher.value}% OFF` : `₱${voucher.value} OFF`}
                    minPurchase={voucher.min_purchase}
                    validUntil={voucher.valid_until_formatted}
                    isClaimed={voucher.is_claimed}
                    isUsed={voucher.is_used}
                    onClaim={() => handleClaimVoucher(voucher.id)}
                  />
                ))
              ) : (
                <div className="w-full py-8 text-center text-sm text-neutral-500">
                  No vouchers available at the moment
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top products */}
        <section className="mt-6 sm:mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 sm:text-base">
              Top Products This Week
            </h2>
            <button className="flex items-center text-xs text-violet-600 hover:underline sm:text-sm">
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Carousel Container */}
          <div className="relative">
            {/* Left Arrow */}
            {products.length > 5 && (
              <button
                onClick={() => {
                  const container = document.getElementById('top-products-carousel');
                  if (container) {
                    container.scrollBy({ left: -container.offsetWidth * 0.8, behavior: 'smooth' });
                  }
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-neutral-200 hover:bg-neutral-50 transition-all hover:scale-110"
                aria-label="Previous products"
              >
                <ChevronLeft className="h-5 w-5 text-neutral-700" />
              </button>
            )}

            {/* Scrollable Product Grid */}
            <div
              id="top-products-carousel"
              className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                #top-products-carousel::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {products.slice(0, 15).map((p) => (
                <div key={p.id} className="flex-none w-[calc(50%-4px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(20%-10px)] snap-start">
                  <ProductCard 
                    product={p} 
                    role={role} 
                    onGuestAction={handleGuestAction}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {products.length > 5 && (
              <button
                onClick={() => {
                  const container = document.getElementById('top-products-carousel');
                  if (container) {
                    container.scrollBy({ left: container.offsetWidth * 0.8, behavior: 'smooth' });
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-neutral-200 hover:bg-neutral-50 transition-all hover:scale-110"
                aria-label="Next products"
              >
                <ChevronRight className="h-5 w-5 text-neutral-700" />
              </button>
            )}
          </div>

          {products.length === 0 && (
            <div className="mt-4 text-center text-sm text-neutral-500">
              No products available yet. Sellers can start adding products!
            </div>
          )}
        </section>

        {/* Secondary banners */}
        <section className="mt-6 grid grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-3">
          <div className="relative h-32 overflow-hidden rounded-xl bg-neutral-200">
            <img
              src="/images/pb 1.jpg"
              alt="Promo Banner 1"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="relative h-32 overflow-hidden rounded-xl bg-neutral-200">
            <img
              src="/images/pb 2.jpg"
              alt="Promo Banner 2"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>

        {/* Discover something new */}
        <section className="mt-8 text-center sm:mt-10">
          <h2 className="text-xs font-semibold tracking-wide text-neutral-800 sm:text-sm">
            Discover something new!
          </h2>
          <div className="mx-auto mt-2 h-0.5 w-10 rounded-full bg-violet-600" />
        </section>

        {/* Recommended feed placeholder */}
        <section className="mt-4 grid grid-cols-2 gap-2 pb-8 sm:mt-6 sm:grid-cols-3 sm:gap-3 sm:pb-10 lg:grid-cols-5">
          {products.slice(0, 10).map((p) => (
            <ProductCard 
              key={`rec-${p.id}`} 
              product={p} 
              role={role} 
              onGuestAction={handleGuestAction}
              onAddToCart={handleAddToCart}
            />
          ))}
        </section>
      </main>

      {/* Signup Modal */}
      <SignupModal open={showSignupModal} onClose={() => setShowSignupModal(false)} />

      {/* Chat Button */}
      <button
        onClick={() => {}}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110"
        style={{ backgroundColor: '#1c1430' }}
        aria-label="Open chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}