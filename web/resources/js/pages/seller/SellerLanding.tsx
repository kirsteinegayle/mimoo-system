import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useState, useEffect } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };
const fontSyne = { fontFamily: "'Syne', sans-serif" };

// ---- PLACEHOLDERS: replace with your real policy ----
const COMMISSION_RATE = 0.05; // share mimoo takes per sale
const SAMPLE_PRICE = 1000;
const SAMPLE_COMMISSION = SAMPLE_PRICE * COMMISSION_RATE;
const SAMPLE_PAYOUT = SAMPLE_PRICE - SAMPLE_COMMISSION;
const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Why mimoo', href: '#why' },
    { label: 'Earnings', href: '#earnings' },
    { label: 'FAQ', href: '#faq' },
];

const faqs = [
    {
        q: 'How much does it cost to sell?',
        a: `Registering and listing are free. mimoo only takes a ${COMMISSION_RATE * 100}% commission when you make a sale, so there's nothing to pay if nothing sells.`,
    },
    {
        q: 'How and when do I get paid?',
        a: 'Once the buyer receives and confirms the order, your earnings go to your seller wallet. You can withdraw to your bank or e-wallet.',
    },
    {
        q: 'Who delivers my orders?',
        a: "mimoo's logistics partners. You pack the order, and a rider picks it up and delivers it to the buyer.",
    },
    {
        q: 'How long does approval take?',
        a: "Our admin team reviews every application to keep the marketplace safe for buyers and honest sellers. You'll get an update in your account once it's done.",
    },
    {
        q: 'What can I sell?',
        a: 'Most everyday products: apparel, gadgets, food, home items, and more. Some items are prohibited, so check the seller guidelines before listing.',
    },
];

function Icon({ children }: { children: ReactNode }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

const WalletIcon = () => (
    <Icon>
        <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Icon>
);
const TruckIcon = () => (
    <Icon>
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </Icon>
);
const PinIcon = () => (
    <Icon>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);
const ShieldIcon = () => (
    <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <polyline points="9 12 11 14 15 10" />
    </Icon>
);
const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function SellerLanding() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        portal: 'seller',
    });

    // Auto-scroll down on page load
    useEffect(() => {
        // Smooth scroll to the "Why mimoo" section
        const scrollTarget = document.getElementById('why');
        if (scrollTarget) {
            setTimeout(() => {
                scrollTarget.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 300);
        }
    }, []);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <div className="bg-white min-h-screen" style={fontPoppins}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        .mimoo-logo:hover .mimoo-letter { animation: mimoo-wave 1.4s ease-in-out infinite; }
        @keyframes mimoo-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    `}</style>

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
                    <Link href="/" className="mimoo-logo flex items-center gap-2 shrink-0">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3B1F6B]" />
                        <span className="font-bold tracking-widest text-sm text-gray-900 flex" style={fontSyncopate}>
                            {'mimoo'.split('').map((letter, i) => (
                                <span key={i} className="mimoo-letter inline-block" style={{ animationDelay: `${i * 0.1}s` }}>
                                    {letter}
                                </span>
                            ))}
                        </span>
                        <span className="text-xs font-medium text-[#3B1F6B] bg-[#F1EDFB] rounded-full px-2.5 py-0.5 ml-1" style={fontSFCompact}>
                            Seller
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

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <Link 
                            href="/" 
                            className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center gap-1"
                            title="Browse as a buyer instead"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            <span className="hidden sm:inline">Shop as buyer</span>
                        </Link>
                        <Link href="/login" className="text-xs sm:text-sm font-medium text-gray-700 hover:text-[#3B1F6B] transition">
                            Log in
                        </Link>
                        <Link
                            href="/register/seller"
                            className="bg-[#3B1F6B] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#2E1854] transition"
                        >
                            Start selling
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero with login panel */}
            <section className="bg-white px-4 sm:px-6 py-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#19132A] via-[#2B1F4A] to-[#6E5F8F] max-w-7xl mx-auto rounded-3xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-5 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-20">
                        {/* Pitch */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-xl mb-4 lg:mb-5" style={fontSyne}>
                                Sell your products to buyers right in your area.
                            </h1>
                            <p className="text-xs sm:text-sm text-white/80 max-w-md mb-6 leading-relaxed">
                                No signup cost, no monthly fee. List your products, let our logistics partners handle delivery, and get paid straight to your seller wallet.
                            </p>
                            <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/85">
                                {['Free to register', 'No monthly fee', 'Delivery partners included'].map((t) => (
                                    <span key={t} className="inline-flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white">
                                            <CheckIcon />
                                        </span>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Login panel */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md mx-auto lg:ml-auto lg:mr-0 shadow-xl">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={fontSyne}>
                                Log in to your seller account
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-6">
                                Manage your orders, products, and earnings.
                            </p>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label htmlFor="seller-email" className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        id="seller-email"
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5DE5] focus:border-transparent"
                                    />
                                    {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="seller-password" className="block text-xs font-medium text-gray-700">
                                            Password
                                        </label>
                                        <Link href="/forgot-password" className="text-xs text-[#3B1F6B] font-medium hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="seller-password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            className="w-full border border-gray-200 rounded-full pl-4 pr-16 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B5DE5] focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-[#3B1F6B]"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-600 mt-1.5">{errors.password}</p>}
                                </div>

                                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-gray-300 text-[#3B1F6B] focus:ring-[#9B5DE5]"
                                    />
                                    Keep me logged in
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 bg-[#3B1F6B] hover:bg-[#2E1854] disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-full transition"
                                >
                                    {processing ? 'Logging in...' : 'Log in'}
                                    {!processing && <span>→</span>}
                                </button>
                            </form>

                            <div className="border-t border-gray-100 mt-6 pt-5 text-center text-xs sm:text-sm text-gray-500">
                                New to mimoo?{' '}
                                <Link href="/register/seller" className="text-[#3B1F6B] font-semibold hover:underline">
                                    Register as a seller
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who it's for */}
            <section className="bg-[#F8F6FC] px-4 sm:px-6 py-12 sm:py-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                        is mimoo for you?
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 mb-8">
                        Big shop or small side hustle, there's room for you here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {[
                            'Home-based sellers',
                            'Store owners',
                            'Social media sellers',
                            'Resellers',
                            'Makers and crafters',
                            'Food and pastry makers',
                            'First-time sellers',
                        ].map((tag) => (
                            <span key={tag} className="bg-white border border-gray-100 text-sm font-medium text-gray-800 px-4 py-2 rounded-full hover:border-[#3B1F6B]/30 transition">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why mimoo */}
            <section id="why" className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            Why sell on mimoo
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            We took out the hardest parts of selling online.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: <WalletIcon />,
                                problem: 'Starting costs too much?',
                                title: 'No upfront cost',
                                desc: "Registration and listings are free. You only pay a commission when you make a sale, so you're never out of pocket while you're getting started.",
                            },
                            {
                                icon: <TruckIcon />,
                                problem: 'Shipping is a headache?',
                                title: 'Delivery is built in',
                                desc: 'Pack your order and our logistics partners pick it up and deliver it. You can follow the status of every order from your dashboard.',
                            },
                            {
                                icon: <PinIcon />,
                                problem: 'Nobody sees your products?',
                                title: 'Buyers close to you',
                                desc: "mimoo is built around local shopping, so the people who find your products are nearby. Faster delivery means happier buyers.",
                            },
                            {
                                icon: <ShieldIcon />,
                                problem: 'Worried about scams and no-pays?',
                                title: 'Every transaction is protected',
                                desc: 'Payment and order confirmation run through mimoo. Sellers are verified, so buyers feel safe purchasing from you.',
                            },
                        ].map((b) => (
                            <div key={b.title} className="bg-[#F8F6FC] rounded-2xl p-6 sm:p-8 flex gap-5 hover:shadow-md transition">
                                <div className="w-12 h-12 shrink-0 rounded-full bg-white flex items-center justify-center text-[#3B1F6B]">
                                    {b.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-[#3B1F6B] font-medium mb-1" style={fontSFCompact}>{b.problem}</p>
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">{b.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Earnings */}
            <section id="earnings" className="bg-white px-4 sm:px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-[#3B1F6B] to-[#6E5F8F] rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="text-white">
                            <h2 className="text-xl sm:text-2xl font-bold mb-3" style={fontSyne}>
                                See exactly what you take home.
                            </h2>
                            <p className="text-sm text-white/80 leading-relaxed mb-5 max-w-md">
                                No hidden charges. Only the commission is deducted, and your earnings show up in your seller wallet for every order.
                            </p>
                            <Link
                                href="/register/seller"
                                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#3B1F6B] text-sm font-semibold px-5 py-2.5 rounded-full transition"
                            >
                                Start selling
                                <span>→</span>
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
                            <p className="text-xs text-gray-400 mb-3" style={fontSFCompact}>Example order</p>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Product price</span>
                                    <span className="font-semibold">{peso(SAMPLE_PRICE)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>mimoo commission ({COMMISSION_RATE * 100}%)</span>
                                    <span>− {peso(SAMPLE_COMMISSION)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Delivery fee</span>
                                    <span>Paid by buyer</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">You receive</span>
                                    <span className="text-xl font-bold text-[#3B1F6B]">{peso(SAMPLE_PAYOUT)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard preview */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3" style={fontSyncopate}>
                            Your whole shop, one screen
                        </h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            No juggling apps or spreadsheets to run your business.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Update stock and prices anytime',
                                'See new orders and update their status right away',
                                'Answer buyer questions in chat before they check out',
                                'Track your sales and earnings in your seller wallet',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-[#F1EDFB] text-[#3B1F6B] flex items-center justify-center">
                                        <CheckIcon />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mock dashboard: replace with a real screenshot when available */}
                    <div className="bg-[#F8F6FC] rounded-3xl p-5 sm:p-6">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'New orders', value: '12' },
                                { label: "Today's sales", value: '₱4,850' },
                                { label: 'New chats', value: '5' },
                            ].map((s) => (
                                <div key={s.label} className="bg-white rounded-xl p-3 text-center">
                                    <p className="text-[10px] sm:text-xs text-gray-400">{s.label}</p>
                                    <p className="text-base sm:text-lg font-bold text-[#3B1F6B] mt-1">{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-xl divide-y divide-gray-100">
                            {[
                                { name: 'Order #1024', status: 'To pack' },
                                { name: 'Order #1023', status: 'Handed to rider' },
                                { name: 'Order #1022', status: 'Delivered' },
                            ].map((o) => (
                                <div key={o.name} className="flex justify-between items-center px-4 py-3 text-xs sm:text-sm">
                                    <span className="font-medium text-gray-800">{o.name}</span>
                                    <span className="text-[#3B1F6B] bg-[#F1EDFB] rounded-full px-3 py-1">{o.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How to start + requirements */}
            <section className="bg-white px-4 sm:px-6 pb-12 sm:pb-16">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#F1EDFB] rounded-3xl p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                                How to get started
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Three steps before you make your first sale.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            {[
                                { number: '1', title: 'Register', desc: 'Enter your business details and upload the requirements.' },
                                { number: '2', title: 'Get approved', desc: 'Our admin team reviews your application to keep the marketplace safe.' },
                                { number: '3', title: 'List and sell', desc: 'Add your products, receive orders, and schedule pick-up with logistics.' },
                            ].map((step) => (
                                <div key={step.number} className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#3B1F6B] text-white flex items-center justify-center text-xl font-bold">
                                        {step.number}
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl p-6 max-w-2xl mx-auto">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Have these ready (edit to match your requirements)</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                {['Valid government ID', 'Business name and details', 'Pick-up address', 'Bank or e-wallet for payouts'].map((r) => (
                                    <li key={r} className="flex items-center gap-2">
                                        <span className="text-[#3B1F6B]"><CheckIcon /></span>
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="bg-[#F8F6FC] px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            Frequently asked
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Answers before you decide.</p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((f, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={f.q} className="bg-white rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        aria-expanded={open}
                                        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 text-sm font-semibold text-gray-900 hover:text-[#3B1F6B] transition"
                                    >
                                        {f.q}
                                        <span className={`text-[#3B1F6B] text-xl transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
                                    </button>
                                    {open && <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{f.a}</p>}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-8">
                        Just want to shop? <Link href="/register" className="text-[#3B1F6B] font-semibold underline">Create a buyer account</Link>. Want to ride or run a sorting hub? <Link href="/logistics" className="text-[#3B1F6B] font-semibold underline">Apply as a logistics partner</Link>.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-[#19132A] via-[#2B1F4A] to-[#3B1F6B] rounded-3xl p-8 sm:p-16 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={fontSyncopate}>
                            Ready to start selling?
                        </h2>
                        <p className="text-sm text-white/70 mb-8 max-w-xl mx-auto">
                            Registration is free. Open your shop today and start reaching the buyers around you.
                        </p>
                        <Link
                            href="/register/seller"
                            className="inline-flex items-center gap-2 bg-[#9B5DE5] hover:bg-[#8B4FD1] text-white text-sm font-semibold px-6 py-3 rounded-full transition"
                        >
                            Open your shop
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

SellerLanding.layout = (page: ReactNode) => page;