import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontSyne = { fontFamily: 'Syne, sans-serif' };

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
        };
    };
    company: {
        name: string;
        contact_person: string;
    };
    activeTab: string;
    pageTitle: string;
    children: ReactNode;
}

export default function CourierLayout({ auth, company, activeTab, pageTitle, children }: Props) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { url } = usePage();

    const handleLogout = () => {
        router.post('/logout');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid', href: '/courier/dashboard' },
        { id: 'incoming-shipments', label: 'Incoming Shipments', icon: 'inbox', href: '/courier/incoming-shipments' },
        { id: 'pickup-management', label: 'Pickup Management', icon: 'calendar', href: '/courier/pickup-management' },
        { id: 'parcel-scanning', label: 'Parcel Scanning', icon: 'scan', href: '/courier/parcel-scanning' },
        { id: 'sorting-transfers', label: 'Sorting & Transfers', icon: 'sort', href: '/courier/sorting-transfers' },
        { id: 'branch-facility', label: 'Branch & Facility', icon: 'building', href: '/courier/branch-facility' },
        { id: 'rider-management', label: 'Rider Management', icon: 'bike', href: '/courier/rider-management' },
        { id: 'delivery-management', label: 'Delivery Management', icon: 'truck', href: '/courier/delivery-management' },
        { id: 'cod-remittance', label: 'COD & Remittance', icon: 'chart-bar', href: '/courier/cod-remittance' },
        { id: 'reports', label: 'Reports', icon: 'chart', href: '/courier/reports' },
        { id: 'support', label: 'Support', icon: 'headset', href: '/courier/support' },
        { id: 'messages', label: 'Messages', icon: 'message', href: '/courier/messages' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'grid':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
            case 'inbox':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
            case 'calendar':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
            case 'scan':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="12" y1="8" x2="12" y2="16"/></svg>;
            case 'sort':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M10 18h4"/></svg>;
            case 'building':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>;
            case 'bike':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>;
            case 'truck':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
            case 'chart-bar':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
            case 'chart':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
            case 'headset':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
            case 'message':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
            default:
                return null;
        }
    };

    // Determine active tab based on current URL
    const currentActive = navItems.find(item => url.startsWith(item.href))?.id || activeTab;

    return (
        <>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="flex h-screen bg-gray-50" style={fontSyne}>
                {/* Sidebar */}
                <aside className="w-64 bg-[#2B2249] text-white flex-shrink-0 hidden lg:block overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <span className="w-8 h-8 rounded-full bg-[#9B5DE5]" />
                            <span className="font-bold text-xl tracking-widest" style={fontSyncopate}>
                                mimoo
                            </span>
                        </Link>

                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                                        currentActive === item.id
                                            ? 'bg-[#3B1F6B] text-white'
                                            : 'text-gray-300 hover:bg-[#2E2240]/50 hover:text-white'
                                    }`}
                                >
                                    {getIcon(item.icon)}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="absolute bottom-0 left-0 w-64 border-t border-white/10 bg-[#2B2249]">
                        <Link
                            href="/courier/settings"
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition ${
                                currentActive === 'settings'
                                    ? 'bg-[#3B1F6B] text-white'
                                    : 'text-gray-300 hover:bg-[#2E2240]/50 hover:text-white'
                            }`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6"/>
                                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
                                <path d="m19.07 4.93-4.24 4.24m-5.66 5.66-4.24 4.24"/>
                            </svg>
                            Company Settings
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    {/* Top Bar */}
                    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <h1 className="text-base font-bold text-gray-700">
                                    {company.name}
                                </h1>
                                <span className="text-sm text-gray-400">/</span>
                                <h2 className="text-base font-semibold text-gray-900">{pageTitle}</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search parcels..."
                                        className="w-64 px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    />
                                    <svg
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                </div>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"/>
                                        <path d="M12 1v6m0 6v6"/>
                                    </svg>
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="w-9 h-9 rounded-full bg-[#2B2249] text-white flex items-center justify-center text-sm font-bold hover:bg-[#3d2e5f] transition"
                                    >
                                        {auth.user.name.charAt(0)}
                                    </button>
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                            <Link
                                                href="/courier/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="3"/>
                                                        <path d="M12 1v6m0 6v6"/>
                                                    </svg>
                                                    Settings
                                                </div>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                    <polyline points="16 17 21 12 16 7"/>
                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                </svg>
                                                Log out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 overflow-auto p-6 bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
