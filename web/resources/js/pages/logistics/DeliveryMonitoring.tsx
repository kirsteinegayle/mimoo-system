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

export default function DeliveryMonitoring({ auth }: Props) {
    const [activeTab, setActiveTab] = useState('delivery-monitoring');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [statusTab, setStatusTab] = useState('all');
    const [selectedParcel, setSelectedParcel] = useState('PKG-0003');

    const handleLogout = () => {
        router.post('/logout');
    };

    const parcels = [
        { id: 'PKG-0001', destination: 'Barangay 801', rider: 'A. Santos', status: 'out' },
        { id: 'PKG-0002', destination: 'Panasan', rider: 'B. Flores', status: 'delivered' },
        { id: 'PKG-0003', destination: 'Magsaysay', rider: 'C. Delos Santos', status: 'out' },
        { id: 'PKG-0004', destination: 'Barangay 808', rider: 'E. Navarro', status: 'hub' },
        { id: 'PKG-0005', destination: 'Bagong Pook', rider: 'A. Santos', status: 'overdue' },
        { id: 'PKG-0006', destination: 'Buenealista', rider: 'B. Flores', status: 'hub' }
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
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Delivery Monitoring" />
            
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
                                <h2 className="text-base font-semibold text-gray-900" style={fontSyncopate}>Delivery Monitoring</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search / Scan"
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

                    {/* Content Area - Split Panel */}
                    <main className="flex-1 overflow-auto p-6 bg-gray-50">
                        <div className="h-full flex gap-6">
                            {/* Left Panel - 2/3 width */}
                            <div className="flex-1 flex flex-col">
                                {/* Stats Row */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="text-xs text-gray-500 mb-1" style={fontSyncopate}>AT HUB</div>
                                        <div className="text-2xl font-bold text-gray-900">12</div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="text-xs text-gray-500 mb-1" style={fontSyncopate}>OUT</div>
                                        <div className="text-2xl font-bold text-[#5B4B6E]">28</div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="text-xs text-gray-500 mb-1" style={fontSyncopate}>DELIVERED</div>
                                        <div className="text-2xl font-bold text-green-600">156</div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="text-xs text-gray-500 mb-1" style={fontSyncopate}>OVERDUE</div>
                                        <div className="text-2xl font-bold text-red-600">3</div>
                                    </div>
                                </div>

                                {/* Main Card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900" style={fontSyncopate}>Delivery Monitoring</h3>
                                        <button className="px-4 py-2 bg-[#E8E3F0] text-[#5B4B6E] rounded-lg text-sm font-semibold hover:bg-[#D4CEE0] transition flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="3"/>
                                                <path d="M12 1v6m0 6v6"/>
                                            </svg>
                                            LIVE DISPATCHER
                                        </button>
                                    </div>

                                    {/* Status Tabs */}
                                    <div className="flex gap-2 mb-6">
                                        <button
                                            onClick={() => setStatusTab('all')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                statusTab === 'all'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setStatusTab('hub')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                statusTab === 'hub'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            At-Hub
                                        </button>
                                        <button
                                            onClick={() => setStatusTab('out')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                statusTab === 'out'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Out for Delivery
                                        </button>
                                        <button
                                            onClick={() => setStatusTab('delivered')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                statusTab === 'delivered'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Delivered
                                        </button>
                                        <button
                                            onClick={() => setStatusTab('overdue')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                statusTab === 'overdue'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Overdue
                                        </button>
                                        <button
                                            onClick={() => setStatusTab('archived')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                statusTab === 'archived'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Archived
                                        </button>
                                    </div>

                                    {/* Search and Filters */}
                                    <div className="grid grid-cols-5 gap-3 mb-6">
                                        <input
                                            type="text"
                                            placeholder="Search parcels..."
                                            className="col-span-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]"
                                        />
                                        <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]">
                                            <option>All riders</option>
                                        </select>
                                        <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]">
                                            <option>All areas</option>
                                        </select>
                                        <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 flex items-center justify-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            Filter
                                        </button>
                                    </div>

                                    {/* Parcels Table */}
                                    <div className="overflow-auto flex-1">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Parcel ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Destination</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Rider</th>
                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {parcels.map((parcel) => (
                                                    <tr key={parcel.id} className={`hover:bg-gray-50 cursor-pointer ${selectedParcel === parcel.id ? 'bg-[#E8E3F0]' : ''}`} onClick={() => setSelectedParcel(parcel.id)}>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-900">{parcel.id}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">{parcel.destination}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-600">{parcel.rider}</div>
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

                            {/* Right Panel - 1/3 width */}
                            <div className="w-96 flex-shrink-0 space-y-6">
                                {/* Parcel Details */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4" style={fontSyncopate}>Parcel Details</h3>
                                    
                                    <div className="mb-6">
                                        <div className="text-sm font-semibold text-gray-500 mb-1">Tracking Number</div>
                                        <div className="text-lg font-bold text-gray-900">{selectedParcel}</div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <div className="w-0.5 h-full bg-gray-200"></div>
                                            </div>
                                            <div className="pb-4">
                                                <div className="text-sm font-semibold text-gray-900">Assigned</div>
                                                <div className="text-xs text-gray-500">Nov 1, 2026 "¢ 9:15 AM</div>
                                                <div className="text-xs text-gray-600 mt-1">Rider: C. Delos Santos</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <div className="w-0.5 h-full bg-gray-200"></div>
                                            </div>
                                            <div className="pb-4">
                                                <div className="text-sm font-semibold text-gray-900">Sorted</div>
                                                <div className="text-xs text-gray-500">Nov 1, 2026 "¢ 8:45 AM</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">Inbound Scan</div>
                                                <div className="text-xs text-gray-500">Nov 1, 2026 "¢ 8:30 AM</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Consignee Card */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="text-xs font-semibold text-gray-500 mb-2" style={fontSyncopate}>CONSIGNEE</div>
                                        <div className="text-sm font-bold text-gray-900 mb-1">Juan Dela Cruz</div>
                                        <div className="text-sm text-gray-600 mb-2">Magsaysay, Santa Cruz, Laguna</div>
                                        <div className="flex items-center gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                            <span className="text-sm text-gray-600">+63 912 345 6789</span>
                                        </div>
                                    </div>

                                    {/* Download Button */}
                                    <button className="w-full px-4 py-3 bg-[#2B2249] text-white rounded-lg text-sm font-semibold hover:bg-[#2E2240] transition flex items-center justify-center gap-2 mb-4">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7 10 12 15 17 10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Download QR Proof
                                    </button>
                                </div>

                                {/* Dispatch Hotline Card */}
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <div className="flex items-start gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 flex-shrink-0">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        <div>
                                            <div className="text-xs font-semibold text-red-600 mb-1" style={fontSyncopate}>DISPATCH DEAL HOTLINE</div>
                                            <div className="text-sm text-gray-700 mb-2">Contact dispatch for urgent issues or escalations</div>
                                            <div className="text-lg font-bold text-gray-900">1-800-MIMOO-DISPATCH</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

DeliveryMonitoring.layout = (page: ReactNode) => page;
