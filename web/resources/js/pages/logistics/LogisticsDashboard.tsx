import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };

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
    stats: {
        parcelsToday: number;
        pendingSort: number;
        outForDelivery: number;
        ridersActive: number;
        delivered: number;
        deliveredTotal: number;
    };
    recentShipments: {
        id: string;
        destination: string;
        address: string;
        rider: string;
        lastScan: string;
        date: string;
        status: string;
    }[];
    activityTimeline: { type: string; message: string; time: string }[];
    now: string;
}

export default function LogisticsDashboard({ auth, company, stats, recentShipments, activityTimeline, now }: Props) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid', href: '/logistics/dashboard' },
        { id: 'incoming-parcels', label: 'Incoming Parcels', icon: 'inbox', href: '/logistics/incoming-parcels' },
        { id: 'sort-assign', label: 'Sort & Assign', icon: 'sort', href: '/logistics/sort-assign' },
        { id: 'courier-applications', label: 'Courier Applications', icon: 'file-text', href: '/logistics/courier-applications' },
        { id: 'delivery-monitoring', label: 'Delivery Monitoring', icon: 'monitor', href: '/logistics/delivery-monitoring' },
        { id: 'riders', label: 'Riders', icon: 'bike', href: '/logistics/riders' },
        { id: 'branches-checklists', label: 'Branches & Checklists', icon: 'checklist', href: '/logistics/branches-checklists' },
        { id: 'zones-rates', label: 'Zones & Rates', icon: 'zones', href: '/logistics/zones-rates' },
        { id: 'cod-remittance', label: 'COD & Remittance', icon: 'chart-bar', href: '/logistics/cod-remittance' },
        { id: 'reports', label: 'Reports', icon: 'chart', href: '/logistics/reports' },
        { id: 'support', label: 'Support', icon: 'headset', href: '/logistics/support' },
        { id: 'messages', label: 'Messages', icon: 'message', href: '/logistics/messages' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'grid':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
            case 'inbox':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
            case 'file-text':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
            case 'sort':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M10 18h4"/></svg>;
            case 'monitor':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
            case 'bike':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>;
            case 'checklist':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>;
            case 'zones':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>;
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

    return (
        <>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Logistics Dashboard" />
            
            <div className="flex h-screen bg-gray-50" style={fontPoppins}>
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
                                        activeTab === item.id
                                            ? 'bg-[#2E2240] text-white'
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
                            href="/logistics/account"
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition ${
                                activeTab === 'account'
                                    ? 'bg-[#4B5EF9] text-white'
                                    : 'text-gray-300 hover:bg-[#2E2240]/50 hover:text-white'
                            }`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Account
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
                                    Laguna Hub (Santa Cruz)
                                </h1>
                                <span className="text-sm text-gray-400">/</span>
                                <h2 className="text-base font-semibold text-gray-900">Dashboard</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
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
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ctrl + K</span>
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
                                                href="/logistics/account"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                        <circle cx="12" cy="7" r="4"/>
                                                    </svg>
                                                    Account
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
                        {/* Stream Live Badge */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-[#E8E3F0] text-blue-700 px-3 py-1.5 rounded-lg border border-[#D4CEE0]">
                                <span className="w-2 h-2 bg-[#E8E3F0] rounded-full animate-pulse"></span>
                                <span className="text-xs font-semibold">STREAM LIVE</span>
                                <span className="text-xs text-[#5B4B6E]">{now}</span>
                            </div>
                            <Link href="/logistics/incoming-parcels" className="bg-[#2B2249] hover:bg-[#3B1F6B] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
                                </svg>
                                Scan QR Code
                            </Link>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Parcels Today */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8E3F0] flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Parcels Today</div>
                                <div className="text-3xl font-bold text-gray-900">{stats.parcelsToday}</div>
                            </div>

                            {/* Pending Sort */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8E3F0] flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                            <path d="M3 6h18M7 12h10M10 18h4"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pending Sort</div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingSort}</div>
                                <div className="text-xs text-gray-500">Confirmed at hub, not yet dispatched</div>
                            </div>

                            {/* Out for Delivery */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8E3F0] flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                            <circle cx="5.5" cy="17.5" r="3.5"/>
                                            <circle cx="18.5" cy="17.5" r="3.5"/>
                                            <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                            <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Out for Delivery</div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.outForDelivery}</div>
                                <div className="text-xs text-gray-500">{stats.ridersActive} rider{stats.ridersActive === 1 ? '' : 's'} active</div>
                            </div>

                            {/* Delivered */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                            <path d="M20 6 9 17l-5-5"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivered</div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.delivered}</div>
                                <div className="text-xs text-gray-500">{stats.deliveredTotal} delivered all time</div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Parcels Processed Per Hour Chart */}
                            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                                <div className="border-b border-gray-200 px-5 py-4">
                                    <h2 className="text-sm font-bold text-gray-900">Parcels Processed Per Hour</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Operating timeline: 06:00 "“ 22:00</p>
                                </div>
                                <div className="p-5">
                                    <div className="h-64 flex items-end justify-between gap-2">
                                        {/* Simple bar chart placeholder */}
                                        <div className="flex-1 h-full border-l border-b border-gray-200 relative">
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8E3F0]"></div>
                                            <div className="absolute bottom-0 left-0 text-[10px] text-gray-400">0</div>
                                            <div className="absolute top-0 left-0 text-[10px] text-gray-400">8</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                                        <span>00:00</span>
                                        <span>02:00</span>
                                        <span>04:00</span>
                                        <span>06:00</span>
                                        <span>08:00</span>
                                        <span>10:00</span>
                                        <span>12:00</span>
                                        <span>14:00</span>
                                        <span>16:00</span>
                                        <span>18:00</span>
                                        <span>20:00</span>
                                        <span>22:00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                                <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">Activity Timeline</h2>
                                    </div>
                                    <Link href="#" className="text-xs font-semibold text-[#3B1F6B] hover:underline">
                                        View all
                                    </Link>
                                </div>
                                <div className="p-5 space-y-4">
                                    {activityTimeline.length === 0 && <p className="text-xs text-gray-500">No activity yet.</p>}
                                    {activityTimeline.map((activity, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${activity.type === 'success' ? 'bg-green-500' : 'bg-[#E8E3F0]'}`}></div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-900">{activity.message}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Shipments Table */}
                        <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Recent Shipments</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Latest courier dispatches</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Parcel ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Destination</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Rider</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Last Scan</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentShipments.length === 0 && (
                                            <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">No shipments yet.</td></tr>
                                        )}
                                        {recentShipments.map((shipment) => (
                                            <tr key={shipment.id} className="hover:bg-gray-50/50">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                                        </svg>
                                                        <span className="text-sm font-bold text-gray-900">{shipment.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{shipment.destination}</div>
                                                    <div className="text-xs text-gray-500">{shipment.address}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#D4CEE0] flex items-center justify-center text-xs font-bold text-blue-700">
                                                            {shipment.rider.charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-gray-900">{shipment.rider}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{shipment.lastScan}</div>
                                                    <div className="text-xs text-gray-500">{shipment.date}</div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        shipment.status === 'delivered' ? 'bg-green-50 text-green-700'
                                                        : shipment.status === 'failed' || shipment.status === 'return_to_sender' ? 'bg-red-50 text-red-700'
                                                        : 'bg-[#E8E3F0] text-[#3B1F6B]'
                                                    }`}>
                                                        {shipment.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-gray-200 px-5 py-3 bg-gray-50/50">
                                <p className="text-xs text-gray-500">
                                    {recentShipments.length} latest shipment{recentShipments.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

LogisticsDashboard.layout = (page: ReactNode) => page;
