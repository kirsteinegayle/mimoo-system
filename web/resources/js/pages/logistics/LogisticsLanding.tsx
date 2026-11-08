import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useState, useEffect } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };
const fontSyne = { fontFamily: "'Syne', sans-serif" };

// ---- PLACEHOLDERS: replace with your real rates and policy ----
const RIDER_FEE_PER_DELIVERY = 60;
const RIDER_SAMPLE_DELIVERIES = 15;
const RIDER_SAMPLE_TOTAL = RIDER_FEE_PER_DELIVERY * RIDER_SAMPLE_DELIVERIES;
const HUB_FEE_PER_PARCEL = 8;
const HUB_SAMPLE_PARCELS = 200;
const HUB_SAMPLE_TOTAL = HUB_FEE_PER_PARCEL * HUB_SAMPLE_PARCELS;
const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Why mimoo', href: '#why' },
    { label: 'Earnings', href: '#earnings' },
    { label: 'FAQ', href: '#faq' },
];

const faqs = [
    {
        q: 'Do I need my own vehicle to ride?',
        a: 'Yes. Riders use their own motorcycle, bicycle, or e-bike, depending on the delivery areas you choose. You will need to upload your vehicle documents when you apply.',
    },
    {
        q: 'Can I choose my own schedule?',
        a: 'Yes. You decide when you are available. Go online when you want to take deliveries and go offline when you are done.',
    },
    {
        q: 'How and when do I get paid?',
        a: 'Earnings from completed deliveries are added to your wallet. You can withdraw to your bank or e-wallet.',
    },
    {
        q: 'What does a sorting center do?',
        a: 'Sorting centers receive parcels from sellers and riders, organize them by area, and hand them off for the final delivery. Hub partners earn a handling fee per parcel.',
    },
    {
        q: 'How long does approval take?',
        a: "Our admin team reviews every application to keep deliveries safe for sellers and buyers. You'll see an update in your account once it's done.",
    },
];

function Icon({ children }: { children: ReactNode }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

const ClockIcon = () => (
    <Icon>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
    </Icon>
);
const PinIcon = () => (
    <Icon>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
);
const WalletIcon = () => (
    <Icon>
        <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Icon>
);
const PackageIcon = () => (
    <Icon>
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" x2="12" y1="22" y2="12" />
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
const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function LogisticsLanding() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [showPassword, setShowPassword] = useState(false);
    const [activeLoginCard, setActiveLoginCard] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    const loginCards = [
        {
            title: 'Log in as Logistics Partner',
            subtitle: 'Manage your sorting center and parcel operations',
            role: 'logistics',
            icon: <PackageIcon />,
            color: 'from-[#3B1F6B] to-[#6E5F8F]',
            registerLink: '/register/logistics',
            registerText: 'Apply as logistics partner',
        },
        {
            title: 'Log in as Courier Hub',
            subtitle: 'Track deliveries and coordinate with riders',
            role: 'courier',
            icon: <TruckIcon />,
            color: 'from-[#2E1854] to-[#5B4A7A]',
            registerLink: '/register/courier',
            registerText: 'Apply as courier hub',
        },
        {
            title: 'Log in as Rider',
            subtitle: 'Check your jobs and manage deliveries',
            role: 'rider',
            icon: <TruckIcon />,
            color: 'from-[#4A2B7D] to-[#7A6A9F]',
            registerLink: '/register/rider',
            registerText: 'Apply as rider',
        },
    ];

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
                            Logistics
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
                            href="/register/logistics"
                            className="bg-[#3B1F6B] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#2E1854] transition"
                        >
                            Join the team
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero with login panel */}
            <section className="bg-white px-4 sm:px-6 py-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#19132A] via-[#2B1F4A] to-[#6E5F8F] max-w-7xl mx-auto rounded-3xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-5 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-20">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-xl mb-4 lg:mb-5" style={fontSyne}>
                                Deliver for your community. Earn on your own schedule.
                            </h1>
                            <p className="text-xs sm:text-sm text-white/80 max-w-md mb-6 leading-relaxed">
                                Ride for mimoo or run a sorting center, and get steady work from local sellers right where you live.
                            </p>
                            <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/85">
                                {['Choose your own hours', 'Short, local routes', 'Earnings go straight to your wallet'].map((t) => (
                                    <span key={t} className="inline-flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white">
                                            <CheckIcon />
                                        </span>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Login Carousel */}
                        <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
                            {/* Carousel indicators */}
                            <div className="flex justify-center gap-2 mb-4">
                                {loginCards.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveLoginCard(index)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            activeLoginCard === index 
                                                ? 'w-8 bg-white' 
                                                : 'w-1.5 bg-white/40 hover:bg-white/60'
                                        }`}
                                        aria-label={`Go to ${loginCards[index].role} login`}
                                    />
                                ))}
                            </div>

                            {/* Login cards */}
                            <div className="relative overflow-hidden rounded-3xl shadow-xl">
                                <div 
                                    className="flex transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-${activeLoginCard * 100}%)` }}
                                >
                                    {loginCards.map((card, index) => (
                                        <div 
                                            key={card.role}
                                            className="w-full flex-shrink-0"
                                        >
                                            <div className="bg-white p-6 sm:p-8">
                                                {/* Card header with icon */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                                                        {card.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={fontSyne}>
                                                            {card.title}
                                                        </h2>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {card.subtitle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <form onSubmit={submit} className="space-y-4">
                                                    <div>
                                                        <label htmlFor={`email-${card.role}`} className="block text-xs font-medium text-gray-700 mb-1.5">
                                                            Email
                                                        </label>
                                                        <input
                                                            id={`email-${card.role}`}
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
                                                            <label htmlFor={`password-${card.role}`} className="block text-xs font-medium text-gray-700">
                                                                Password
                                                            </label>
                                                            <Link href="/forgot-password" className="text-xs text-[#3B1F6B] font-medium hover:underline">
                                                                Forgot password?
                                                            </Link>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                id={`password-${card.role}`}
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
                                                        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${card.color} hover:opacity-90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-full transition`}
                                                    >
                                                        {processing ? 'Logging in...' : `Log in as ${card.role}`}
                                                        {!processing && <span></span>}
                                                    </button>
                                                </form>

                                                <div className="border-t border-gray-100 mt-6 pt-5 text-center text-xs sm:text-sm text-gray-500">
                                                    New to mimoo?{' '}
                                                    <Link href={card.registerLink} className="text-[#3B1F6B] font-semibold hover:underline">
                                                        {card.registerText}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation arrows */}
                            <div className="flex justify-center gap-3 mt-4">
                                <button
                                    onClick={() => setActiveLoginCard((prev) => (prev - 1 + 3) % 3)}
                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition"
                                    aria-label="Previous login card"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setActiveLoginCard((prev) => (prev + 1) % 3)}
                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition"
                                    aria-label="Next login card"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who can join */}
            <section className="bg-[#F8F6FC] px-4 sm:px-6 py-12 sm:py-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                        who can join?
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 mb-8">
                        Full-time or between jobs, if you know your area, there's a place for you.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {[
                            'Motorcycle riders',
                            'Bicycle and e-bike riders',
                            'Part-time earners',
                            'Full-time riders',
                            'Sorting center owners',
                            'Small warehouse operators',
                            'Students and side-hustlers',
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
                            Why deliver with mimoo
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Work that fits around your life, not the other way around.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: <ClockIcon />,
                                problem: 'Tired of fixed shifts?',
                                title: 'You set your own hours',
                                desc: 'Go online when you are free and offline when you are not. Deliver in the morning, after class, or on weekends only.',
                            },
                            {
                                icon: <PinIcon />,
                                problem: 'Long routes eating your fuel?',
                                title: 'Short, local routes',
                                desc: 'mimoo is built around local shopping, so most pick-ups and drop-offs are in or near your own neighborhood.',
                            },
                            {
                                icon: <PackageIcon />,
                                problem: 'Not sure where the next job comes from?',
                                title: 'Steady orders from local sellers',
                                desc: 'Every seller on mimoo needs deliveries. As more shops open, more parcels need riders and hubs to move them.',
                            },
                            {
                                icon: <WalletIcon />,
                                problem: 'Unclear how much you earn?',
                                title: 'Transparent payouts',
                                desc: 'See the fee for every job and track your earnings in your wallet. Withdraw to your bank or e-wallet when you need it.',
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

            {/* Two ways to join */}
            <section className="bg-white px-4 sm:px-6 pb-12 sm:pb-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={fontSyncopate}>
                            Two ways to join
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Pick the one that fits what you have.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                icon: <TruckIcon />,
                                title: 'Ride as a delivery partner',
                                desc: 'Pick up parcels from sellers or hubs and deliver them to buyers in your area.',
                                points: ['Your own motorcycle, bicycle, or e-bike', 'Paid per completed delivery', 'Work whenever you go online'],
                                cta: 'Apply as a rider',
                                link: '/register/rider',
                            },
                            {
                                icon: <PackageIcon />,
                                title: 'Run a sorting center',
                                desc: 'Receive, sort, and hand off parcels so riders can make faster final deliveries.',
                                points: ['A space to receive and sort parcels', 'Paid a handling fee per parcel', 'Become the hub for your community'],
                                cta: 'Register a sorting center',
                                link: '/register/logistics',
                            },
                        ].map((role) => (
                            <div key={role.title} className="bg-[#F8F6FC] rounded-2xl p-8 hover:shadow-lg transition">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#3B1F6B] mb-4">
                                    {role.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{role.desc}</p>
                                <ul className="space-y-2 mb-6">
                                    {role.points.map((p) => (
                                        <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="text-[#3B1F6B]"><CheckIcon /></span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={role.link} className="inline-flex items-center gap-2 text-[#3B1F6B] font-semibold text-sm hover:gap-3 transition-all">
                                    {role.cta}
                                    <span></span>
                                </Link>
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
                                Know what you can earn before you start.
                            </h2>
                            <p className="text-sm text-white/80 leading-relaxed mb-5 max-w-md">
                                Every job shows its fee up front. The more you deliver or sort, the more you earn.
                            </p>
                            <Link
                                href="/register/logistics"
                                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#3B1F6B] text-sm font-semibold px-5 py-2.5 rounded-full transition"
                            >
                                Join the team
                                <span></span>
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg space-y-5">
                            <div>
                                <p className="text-xs text-gray-400 mb-2" style={fontSFCompact}>Example rider day</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>{RIDER_SAMPLE_DELIVERIES} deliveries Ã— {peso(RIDER_FEE_PER_DELIVERY)}</span>
                                        <span>{peso(RIDER_SAMPLE_TOTAL)}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">You earn</span>
                                        <span className="text-xl font-bold text-[#3B1F6B]">{peso(RIDER_SAMPLE_TOTAL)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2" style={fontSFCompact}>Example sorting center day</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>{HUB_SAMPLE_PARCELS} parcels Ã— {peso(HUB_FEE_PER_PARCEL)}</span>
                                        <span>{peso(HUB_SAMPLE_TOTAL)}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">You earn</span>
                                        <span className="text-xl font-bold text-[#3B1F6B]">{peso(HUB_SAMPLE_TOTAL)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* App preview */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3" style={fontSyncopate}>
                            Every job, clear and organized
                        </h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Know where to go, what to carry, and what you will earn before you accept.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'See pick-up and drop-off details for each parcel',
                                'Update delivery status as you go',
                                'Track daily deliveries and earnings in one place',
                                'Withdraw your earnings to your bank or e-wallet',
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
                                { label: 'Deliveries today', value: '8' },
                                { label: 'Earned today', value: '₱480' },
                                { label: 'Pending pick-ups', value: '3' },
                            ].map((s) => (
                                <div key={s.label} className="bg-white rounded-xl p-3 text-center">
                                    <p className="text-[10px] sm:text-xs text-gray-400">{s.label}</p>
                                    <p className="text-base sm:text-lg font-bold text-[#3B1F6B] mt-1">{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-xl divide-y divide-gray-100">
                            {[
                                { name: 'Parcel #2041', status: 'For pick-up' },
                                { name: 'Parcel #2040', status: 'Out for delivery' },
                                { name: 'Parcel #2039', status: 'Delivered' },
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
                            <p className="text-sm text-gray-500 mt-1">Three steps before your first delivery.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            {[
                                { number: '1', title: 'Apply', desc: 'Choose rider or sorting center, then fill in your details and upload your documents.' },
                                { number: '2', title: 'Get approved', desc: 'Our admin team reviews your application to keep deliveries safe and reliable.' },
                                { number: '3', title: 'Start earning', desc: 'Go online, accept jobs, and get paid for every completed delivery or parcel.' },
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            <div className="bg-white rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Riders (edit to match your requirements)</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {['Valid government ID', "Driver's license", 'Vehicle registration (OR/CR)', 'Bank or e-wallet for payouts'].map((r) => (
                                        <li key={r} className="flex items-center gap-2">
                                            <span className="text-[#3B1F6B]"><CheckIcon /></span>
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sorting centers (edit to match)</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {['Valid government ID', 'Business name and details', 'Address of your sorting space', 'Bank or e-wallet for payouts'].map((r) => (
                                        <li key={r} className="flex items-center gap-2">
                                            <span className="text-[#3B1F6B]"><CheckIcon /></span>
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
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
                        Just want to shop? <Link href="/register" className="text-[#3B1F6B] font-semibold underline">Create a buyer account</Link>. Have products to sell? <Link href="/register/seller" className="text-[#3B1F6B] font-semibold underline">Register as a seller</Link>.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-white px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-[#19132A] via-[#2B1F4A] to-[#3B1F6B] rounded-3xl p-8 sm:p-16 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={fontSyncopate}>
                            Ready to hit the road?
                        </h2>
                        <p className="text-sm text-white/70 mb-8 max-w-xl mx-auto">
                            Apply in a few minutes and start earning by delivering for your own community.
                        </p>
                        <Link
                            href="/register/logistics"
                            className="inline-flex items-center gap-2 bg-[#9B5DE5] hover:bg-[#8B4FD1] text-white text-sm font-semibold px-6 py-3 rounded-full transition"
                        >
                            Join the team
                            <span></span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

LogisticsLanding.layout = (page: ReactNode) => page;