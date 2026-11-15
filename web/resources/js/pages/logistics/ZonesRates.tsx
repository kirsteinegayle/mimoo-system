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

export default function ZonesRates({ auth }: Props) {
    const [activeTab, setActiveTab] = useState('zones-rates');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [zoneName, setZoneName] = useState('');
    const [region, setRegion] = useState('');
    const [areas, setAreas] = useState('');
    const [serviceable, setServiceable] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    const zones = [
        {
            name: 'Santa Cruz North',
            region: 'Laguna',
            areas: '801, 802, 803, 804, 805, 806',
            serviceable: true,
            tiers: [
                { weight: '0.01-5 kg', base: 93.00, perKg: 12.80, sample3kg: 65.60, col5: 12.00, col6: 8.00, col7: 5.60 },
                { weight: '5.01-90 kg', base: 93.00, perKg: 10.80, sample3kg: 121.00, col5: 18.00, col6: 8.01, col7: 90.90 }
            ]
        },
        {
            name: 'Santa Cruz South',
            region: 'Laguna',
            areas: '807, 808, 809, 810, 811',
            serviceable: true,
            tiers: []
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
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Zones & Shipping Rates" />
            
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
                                <h2 className="text-base font-semibold text-gray-900" style={fontSyncopate}>Zones & Shipping Rates</h2>
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
                                <button className="px-4 py-2 bg-[#E8E3F0] text-[#5B4B6E] rounded-lg text-sm font-semibold hover:bg-[#D4CEE0] transition flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    CHECKOUT CONFIGURATIONS
                                </button>
                                
                                <button className="px-4 py-2 bg-[#E8E3F0] text-[#5B4B6E] rounded-lg text-sm font-semibold hover:bg-[#D4CEE0] transition flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    Support
                                </button>
                            </div>

                            {/* Main Content - Two Columns */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Add Zone Form - Left Column */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6" style={fontSyncopate}>Add Zone</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Zone name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Metro Manila"
                                                    value={zoneName}
                                                    onChange={(e) => setZoneName(e.target.value)}
                                                    className="w-full px-4 py-2 bg-[#E8E3F0] border border-[#D4CEE0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8B0C8]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Region</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. NCR"
                                                    value={region}
                                                    onChange={(e) => setRegion(e.target.value)}
                                                    className="w-full px-4 py-2 bg-[#E8E3F0] border border-[#D4CEE0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8B0C8]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Areas / barangays</label>
                                                <textarea
                                                    placeholder="Comma-separated: Makati, Taguig, Pasig"
                                                    value={areas}
                                                    onChange={(e) => setAreas(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249] resize-none"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="serviceable"
                                                    checked={serviceable}
                                                    onChange={(e) => setServiceable(e.target.checked)}
                                                    className="w-4 h-4 text-[#5B4B6E] border-gray-300 rounded focus:ring-[#B8B0C8]"
                                                />
                                                <label htmlFor="serviceable" className="text-sm text-gray-700">
                                                    Serviceable at checkout
                                                </label>
                                            </div>

                                            <button className="w-full px-4 py-3 bg-[#3D2E54] text-white rounded-lg text-sm font-semibold hover:bg-[#2E2240] transition">
                                                Add Zone
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Zones List - Right Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    {zones.map((zone, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1" style={fontSyncopate}>{zone.name}</h3>
                                                    <p className="text-sm text-gray-500">{zone.region} "” {zone.areas}</p>
                                                </div>
                                                {zone.serviceable && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        Serviceable
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {/* Name Field */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Name</label>
                                                        <input
                                                            type="text"
                                                            defaultValue={zone.name}
                                                            className="w-full px-4 py-2 bg-[#E8E3F0] border border-[#D4CEE0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8B0C8]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Region</label>
                                                        <input
                                                            type="text"
                                                            defaultValue={zone.region}
                                                            className="w-full px-4 py-2 bg-[#E8E3F0] border border-[#D4CEE0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8B0C8]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Areas Field */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Areas</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={zone.areas}
                                                        className="w-full px-4 py-2 bg-[#E8E3F0] border border-[#D4CEE0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8B0C8]"
                                                    />
                                                </div>

                                                {/* Serviceable Checkbox */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`serviceable-${idx}`}
                                                            defaultChecked={zone.serviceable}
                                                            className="w-4 h-4 text-[#5B4B6E] border-gray-300 rounded focus:ring-[#B8B0C8]"
                                                        />
                                                        <label htmlFor={`serviceable-${idx}`} className="text-sm text-gray-700">
                                                            Serviceable
                                                        </label>
                                                    </div>
                                                    <button className="text-sm text-[#5B4B6E] hover:underline font-semibold">
                                                        Save Zone
                                                    </button>
                                                </div>

                                                {/* Rate Tiers Table */}
                                                {zone.tiers.length > 0 && (
                                                    <div className="mt-6">
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Weight Tier</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Base Fee</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Per kg</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Sample 3 kg</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase"></th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase"></th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase"></th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase"></th>
                                                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {zone.tiers.map((tier, tierIdx) => (
                                                                        <tr key={tierIdx} className="hover:bg-gray-50">
                                                                            <td className="px-4 py-3 font-semibold text-gray-900">{tier.weight}</td>
                                                                            <td className="px-4 py-3">â‚±{tier.base.toFixed(2)}</td>
                                                                            <td className="px-4 py-3">â‚±{tier.perKg.toFixed(2)}</td>
                                                                            <td className="px-4 py-3">â‚±{tier.sample3kg.toFixed(2)}</td>
                                                                            <td className="px-4 py-3 text-gray-600">{tier.col5.toFixed(2)}</td>
                                                                            <td className="px-4 py-3 text-gray-600">{tier.col6.toFixed(2)}</td>
                                                                            <td className="px-4 py-3 text-gray-600">{tier.col7.toFixed(2)}</td>
                                                                            <td className="px-4 py-3 text-gray-600">{tier.col7.toFixed(2)}</td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <button className="text-[#5B4B6E] hover:underline text-xs font-semibold">
                                                                                    Save
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* Add Tier Section */}
                                                        <div className="mt-4 grid grid-cols-4 gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Base â‚±"
                                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Per kg â‚±"
                                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Min kg"
                                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Max kg"
                                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249]"
                                                            />
                                                        </div>

                                                        <button className="mt-3 px-4 py-2 bg-[#3D2E54] text-white rounded-lg text-sm font-semibold hover:bg-[#2E2240] transition">
                                                            Add Tier
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

ZonesRates.layout = (page: ReactNode) => page;
