import { Link } from '@inertiajs/react';
import { ReactNode, useRef, useState, useEffect } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

// href: '#' for links that don't have a page yet. Point 'Shop' at whatever
// route actually serves Homepage.tsx on your backend (adjust if it isn't
// literally "/homepage").
const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/homepage' },
    { label: 'Categories', href: '#' },
    { label: 'Deals', href: '#' },
];

const categories = [
    { name: 'Pet Supplies', count: '3 items', icon: '/images/pet supplies.jpg' },
    { name: 'Electronics and Gadgets', count: '3 items', icon: '/images/electronics.jpg' },
    { name: "Women's Apparel", count: '3 items', icon: "/images/women's apparel.jpg" },
    { name: "Men's Apparel", count: '3 items', icon: "/images/mens apparel.jpg" },
    { name: 'Kids and Baby', count: '3 items', icon: '/images/kids and babies.jpg' },
    { name: 'Home and Garden', count: '3 items', icon: '/images/home and garden.jpg' },
    { name: 'Sports and Outdoors', count: '3 items', icon: '/images/sports.jpg' },
    { name: 'Health and Beauty', count: '3 items', icon: '/images/health and beauty.jpg' },
    { name: 'Books and Media', count: '3 items', icon: '/images/booksMedia.jpg' },
    { name: 'Food and Gourmet', count: '3 items', icon: '/images/foodGourmet.jpg' },
    { name: 'Furniture and Office Equipment', count: '3 items', icon: '/images/furniture.jpg' },
    { name: 'Jewelry and Watches', count: '3 items', icon: '/images/jewelry.jpg' },
];

function CategoryIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B1F6B" strokeWidth="1.5" strokeDasharray="2 2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="8" r="1.5" fill="#3B1F6B" stroke="none" />
            <circle cx="8.5" cy="11" r="1.5" fill="#3B1F6B" stroke="none" />
            <circle cx="15.5" cy="11" r="1.5" fill="#3B1F6B" stroke="none" />
            <circle cx="12" cy="15" r="1.5" fill="#3B1F6B" stroke="none" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    );
}

function MessageIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function PackageIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4 7.55 4.24" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" x2="12" y1="22" y2="12" />
        </svg>
    );
}

function StarIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

function ChatBubbleIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    );
}

function BoxIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    );
}

export default function Landing() {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const slides = [
        {
            badge: 'FOR BUYERS',
            title: 'Shop from trusted local sellers, all in one place.',
            description: 'Create a free buyer account to browse products, chat directly with sellers, and check out in minutes. Selling instead? You can register a seller account too.',
            image: '/images/landing page bg 1.png',
        },
        {
            badge: 'FOR SELLERS',
            title: 'Start selling to local buyers today.',
            description: 'Register as a seller and list your products in minutes. Reach thousands of buyers looking for items just like yours.',
            image: '/images/landing page bg 2.png',
        },
    ];

    useEffect(() => {
        if (isPaused) return;
        
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Auto-advance every 5 seconds

        return () => clearInterval(timer);
    }, [slides.length, isPaused]);

    const scrollByAmount = (amount: number) => {
        scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    return (
        <div className="bg-white min-h-screen" style={fontPoppins}>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        .mimoo-logo:hover .mimoo-letter {
            animation: mimoo-wave 1.4s ease-in-out infinite;
        }
        @keyframes mimoo-wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
    `}</style>
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
                    <Link href="/" className="mimoo-logo flex items-center gap-2 shrink-0">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3B1F6B]" />
                        <span className="font-bold tracking-widest text-sm text-gray-900 flex" style={fontSyncopate}>
                            {'mimoo'.split('').map((letter, i) => (
                                <span
                                    key={i}
                                    className="mimoo-letter inline-block"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="group relative py-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:text-[#3B1F6B]"
                            >
                                {label}
                                <span className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#3B1F6B] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center flex-1 max-w-xs">
                        <div className="w-full flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-400">
                            <SearchIcon />
                            Search for products, sellers, or listing
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <button className="relative text-gray-500 hover:text-gray-700">
                            <MessageIcon />
                            <span className="absolute -top-1.5 -right-1.5 bg-[#3B1F6B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                0
                            </span>
                        </button>
                        <button className="relative text-gray-500 hover:text-gray-700">
                            <CartIcon />
                            <span className="absolute -top-1.5 -right-1.5 bg-[#3B1F6B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                0
                            </span>
                        </button>
                        <Link
                            href="/register"
                            className="bg-[#3B1F6B] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#2E1854] transition"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Carousel */}
            <section className="bg-white px-4 sm:px-6 py-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#19132A] via-[#2B1F4A] to-[#6E5F8F] h-[400px] sm:h-[500px] lg:h-[600px] max-w-7xl mx-auto rounded-3xl">
                {/* Carousel slides */}
                <div className="relative h-full">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        >
                            {/* Background image */}
                            <div 
                                className="absolute inset-0 bg-cover bg-right bg-no-repeat rounded-3xl"
                                style={{ backgroundImage: `url('${slide.image}')` }}
                            />
                            
                            {/* Dark overlay for better text readability on mobile */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#19132A]/80 via-[#19132A]/60 to-transparent sm:from-[#19132A]/60 sm:via-transparent" />
                            
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10 h-full flex flex-col justify-center">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-xl sm:max-w-2xl mb-3 sm:mb-4 lg:mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    {slide.title}
                                </h1>

                                <p className="text-xs sm:text-sm text-white/90 sm:text-white/70 max-w-md sm:max-w-lg mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                                    {slide.description}
                                </p>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <Link
                                        href="/register"
                                        className="flex items-center justify-center gap-2 bg-[#9B5DE5] hover:bg-[#8B4FD1] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition"
                                    >
                                        Create your account
                                        <span>→</span>
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="bg-transparent border border-white/40 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-white/10 transition text-center"
                                    >
                                        Log in
                                    </Link>
                                </div>

                                <div className="text-[10px] sm:text-xs text-white/60 leading-relaxed max-w-md space-y-1">
                                    <p>
                                        Selling instead? <a href="/seller" className="text-white underline hover:text-white/90">Register a seller account</a>. Want to ride or run a sorting hub? <a href="/logistics" className="text-white underline hover:text-white/90">Apply as a logistics partner</a>.
                                    </p>
                                    <p>
                                        Already a member? Log in above — takes less than a minute.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel indicators */}
                {slides.length > 1 && (
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
                    <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 flex items-center gap-2">
                        <button
                            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#3B1F6B] text-xl sm:text-2xl font-bold transition shadow-md"
                            aria-label="Previous slide"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#3B1F6B] transition shadow-md"
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
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#3B1F6B] text-xl sm:text-2xl font-bold transition shadow-md"
                            aria-label="Next slide"
                        >
                            ›
                        </button>
                    </div>
                )}
                </div>
            </section>

            {/* Shop by category */}
            <section className="bg-[#F8F6FC] px-4 sm:px-6 py-12 sm:py-16 text-center">
                <div className="max-w-7xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                    shop by category
                </h2>
                <p className="text-sm text-gray-500 mt-1 mb-8 sm:mb-10">
                    Browse what local sellers are stocking right now.
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => scrollByAmount(-280)}
                        aria-label="Previous categories"
                        className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] border-2 border-gray-200 items-center justify-center text-gray-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:border-gray-300 transition text-xl font-bold"
                    >
                        ‹
                    </button>

                    <div ref={scrollerRef} className="flex-1 flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {categories.map((cat, i) => (
                            <a
                                key={`${cat.name}-${i}`}
                                href="#"
                                className="shrink-0 w-40 sm:w-44 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-md transition text-center"
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                                    {cat.icon ? (
                                        <img 
                                            src={cat.icon} 
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <CategoryIcon />
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug min-h-[2.5rem] flex items-center justify-center">
                                    {cat.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{cat.count}</p>
                            </a>
                        ))}
                    </div>

                    <button
                        onClick={() => scrollByAmount(280)}
                        aria-label="Next categories"
                        className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] border-2 border-gray-200 items-center justify-center text-gray-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:border-gray-300 transition text-xl font-bold"
                    >
                        ›
                    </button>
                </div>
                </div>
            </section>

            {/* Trending this week */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            Trending this week
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wide" style={fontSFCompact}>
                            — mimoo picks —
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            A taste of the bestsellers in buyer's carts visiting us over the last 7 days.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="group cursor-pointer">
                                <div className="relative bg-gray-100 rounded-2xl overflow-hidden mb-3 aspect-[4/3]">
                                    <span className="absolute top-3 left-3 bg-[#3B1F6B] text-white text-xs font-semibold px-3 py-1 rounded-full" style={fontSFCompact}>
                                        Bestseller
                                    </span>
                                    {/* Placeholder for product image */}
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <BoxIcon />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Health & Wellness</p>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#3B1F6B] transition">
                                        Anti Depressant Medicine
                                    </h3>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className="text-yellow-400 text-xs">★</span>
                                        ))}
                                        <span className="text-xs text-gray-400 ml-1">(4.9)</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#3B1F6B]">₱999</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-[#3B1F6B] hover:bg-[#2E1854] text-white text-sm font-semibold px-6 py-3 rounded-full transition"
                        >
                            Sign up to shop the full catalog
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Promo banner */}
            <section className="bg-white px-4 sm:px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-[#3B1F6B] to-[#6E5F8F] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <span className="text-2xl sm:text-3xl font-bold" style={fontSyncopate}>15%</span>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Pamper your first order with a welcome discount!
                                </h3>
                                <p className="text-sm text-white/80" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    New shoppers get 15% off plus free shipping on orders over ₱500.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/register"
                            className="shrink-0 flex items-center gap-2 bg-white hover:bg-gray-50 text-[#3B1F6B] text-sm font-semibold px-5 py-2.5 rounded-full transition"
                        >
                            Claim offer
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why shop here */}
            <section className="bg-[#F8F6FC] px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            Why shop here
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Everything unique, secure, delivered like a letter
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <CheckIcon />,
                                title: 'Verified sellers',
                                desc: 'Every seller on mimoo has been vetted. We double-check before they can list.',
                            },
                            {
                                icon: <PackageIcon />,
                                title: 'Fast, simple checkout',
                                desc: 'Add items to your cart, review, and complete order in under 2 minutes.',
                            },
                            {
                                icon: <StarIcon />,
                                title: 'Track every order',
                                desc: 'See where your package is in real-time, from checkout to doorstep.',
                            },
                            {
                                icon: <ChatBubbleIcon />,
                                title: 'Chat with sellers',
                                desc: 'Message sellers directly with product questions before you buy or after.',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F1EDFB] flex items-center justify-center text-[#3B1F6B]">
                                    {feature.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Want to grow with Mimoo */}
            <section className="bg-[#F8F6FC] px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            Want to grow with Mimoo?
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Buyers get the spotlight, but there's room for your business or your delivery team too.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {/* Sell on Mimoo Card */}
                        <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition">
                            <div className="w-12 h-12 rounded-full bg-[#F1EDFB] flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B1F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <path d="M8 21h8" />
                                    <path d="M12 17v4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                                Sell on Mimoo
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                List your products, chat with buyers directly, and reach customers across your area. Just your business details and a quick admin review to get started.
                            </p>
                            <Link
                                href="/seller"
                                className="inline-flex items-center gap-2 text-[#3B1F6B] font-semibold text-sm hover:gap-3 transition-all"
                            >
                                Register as a seller
                                <span>→</span>
                            </Link>
                        </div>

                        {/* Join logistics team Card */}
                        <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition">
                            <div className="w-12 h-12 rounded-full bg-[#F1EDFB] flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B1F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" />
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                                Join our logistics team
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Ride for us or register your sorting center to help deliver orders across the community. We'll review your application before approving your account.
                            </p>
                            <Link
                                href="/logistics"
                                className="inline-flex items-center gap-2 text-[#3B1F6B] font-semibold text-sm hover:gap-3 transition-all"
                            >
                                Apply as a logistics partner
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Getting started as a buyer */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#F1EDFB] rounded-3xl p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                                Getting started as a buyer
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Create an account, shop, and you're done. So simple.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    number: '1',
                                    title: 'Create your account',
                                    desc: 'Set up your info, profile — takes 2 minutes max. No upfront cost or subscription.',
                                },
                                {
                                    number: '2',
                                    title: 'Browse, identify',
                                    desc: "Search by need or by our seller catalog. Verify item's sold-by and condition.",
                                },
                                {
                                    number: '3',
                                    title: 'Checkout, log-out',
                                    desc: 'Add products, select your payment and delivery, then complete your order.',
                                },
                            ].map((step, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#3B1F6B] text-white flex items-center justify-center text-xl font-bold">
                                        {step.number}
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Ready to start shopping CTA */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-[#19132A] via-[#2B1F4A] to-[#3B1F6B] rounded-3xl p-8 sm:p-16 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={fontSyncopate}>
                            Ready to start shopping?
                        </h2>
                        <p className="text-sm text-white/70 mb-8 max-w-xl mx-auto">
                            Create your free buyer account in minutes to start.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-[#9B5DE5] hover:bg-[#8B4FD1] text-white text-sm font-semibold px-6 py-3 rounded-full transition"
                        >
                            Create your account
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

Landing.layout = (page: ReactNode) => page;