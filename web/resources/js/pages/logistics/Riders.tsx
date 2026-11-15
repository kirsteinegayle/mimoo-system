import { Head, Link, router } from '@inertiajs/react';
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
}

export default function Riders({ auth }: Props) {
    const [activeTab, setActiveTab] = useState('riders');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [riderTab, setRiderTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        router.post('/logout');
    };

    const riders = [
        {
            initial: 'AS',
            name: 'A. Santos',
            id: 'Rid-996-0021',
            hub: 'HUB-001',
            status: '0/3 jobs',
            plate: 'TRY 6082',
            transport: 'Scooter',
            route: 'Panasan',
            barangay: '801'
        },
        {
            initial: 'BF',
            name: 'B. Flores',
            id: 'Rid-606-0039',
            hub: 'HUB-001',
            status: '5/3 jobs',
            plate: 'NMB 2231',
            transport: 'Motorcycle',
            route: 'Buenealista',
            barangay: '808'
        },
        {
            initial: 'CD',
            name: 'C. Delos Santos',
            id: 'Rid-699-0059',
            hub: 'HUB-001',
            status: '0/3 jobs',
            plate: 'NKD 4490',
            transport: 'Motorcycle',
            route: 'Bagong Pook',
            barangay: '801'
        },
        {
            initial: 'EN',
            name: 'E. Navarro',
            id: 'Rid-598-0997',
            hub: 'HUB-001',
            status: '0/3 jobs',
            plate: 'NJD 9401',
            transport: 'Motorcycle',
            route: 'Magsaysay',
            barangay: '801'
        }
    ];

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
            case 'sort':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M10 18h4"/></svg>;
            case 'file-text':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
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
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Riders" />
            
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
                                <h1 className="text-base font-bold text-gray-700" style={fontSyncopate}>
                                    Laguna Hub (Santa Cruz)
                                </h1>
                                <span className="text-sm text-gray-400">/</span>
                                <h2 className="text-base font-semibold text-gray-900" style={fontSyncopate}>Riders</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-64 px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249] focus:border-transparent"
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
                                <Link href="/logistics/messages" aria-label="Messages" title="Messages" className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </Link>
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
                        <div className="max-w-7xl mx-auto">
                            {/* Top Action Buttons */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 bg-[#E8E3F0] text-[#5B4B6E] rounded-lg text-sm font-semibold hover:bg-[#D4CEE0] transition flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        FLEET VERIFICATION
                                    </button>
                                    <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                                        Bulk
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#E8E3F0] rounded-full"></div>
                                        <span className="text-sm text-gray-600">Online: <span className="font-semibold">4 Pending</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        <span className="text-sm text-gray-600"><span className="font-semibold">0 On Duty</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setRiderTab('pending')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                                        riderTab === 'pending'
                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Pending Applications
                                    <span className="w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center">
                                        0
                                    </span>
                                </button>
                                <button
                                    onClick={() => setRiderTab('active')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                                        riderTab === 'active'
                                            ? 'bg-[#E8E3F0] text-[#5B4B6E] border border-[#D4CEE0]'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Active Riders
                                    <span className="w-5 h-5 bg-[#3D2E54] text-white rounded-full text-xs flex items-center justify-center">
                                        16
                                    </span>
                                </button>
                            </div>

                            {/* Active Riders Section */}
                            {riderTab === 'active' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900" style={fontSyncopate}>Active Riders</h3>
                                                <p className="text-sm text-gray-500">One rider per barangay "” 15 cleared, 1 unassigned</p>
                                            </div>
                                        </div>

                                        {/* Search and Filters */}
                                        <div className="grid grid-cols-6 gap-3 mb-6">
                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]"
                                                />
                                            </div>
                                            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]">
                                                <option>Sort: Default</option>
                                                <option>Name A-Z</option>
                                                <option>Name Z-A</option>
                                            </select>
                                            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]">
                                                <option>All statuses</option>
                                                <option>Active</option>
                                                <option>Inactive</option>
                                            </select>
                                            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]">
                                                <option>All barangays</option>
                                                <option>801</option>
                                                <option>808</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                                    </svg>
                                                </button>
                                                <button className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Riders Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Rider Details</th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Plate & Transport</th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Assigned Route Area</th>
                                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {riders.map((rider, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-[#D4CEE0] text-[#5B4B6E] flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                                        {rider.initial}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-gray-900">{rider.name}</div>
                                                                        <div className="text-xs text-gray-500">{rider.id} "¢ {rider.hub}</div>
                                                                        <div className="text-xs text-gray-500">{rider.status}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-bold text-gray-900">{rider.plate}</div>
                                                                <div className="text-xs text-gray-500">{rider.transport}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-900">{rider.route}</div>
                                                                <div className="text-xs text-gray-500">{rider.barangay}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button className="text-sm font-semibold text-[#5B4B6E] hover:underline">
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pending Applications Section */}
                            {riderTab === 'pending' && (
                                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="5.5" cy="17.5" r="3.5"/>
                                            <circle cx="18.5" cy="17.5" r="3.5"/>
                                            <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                            <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Pending Applications</h3>
                                    <p className="text-gray-600">There are currently no pending rider applications to review.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

Riders.layout = (page: ReactNode) => page;
