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

export default function BranchesChecklists({ auth }: Props) {
    const [activeTab, setActiveTab] = useState('branches-checklists');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [checklistType, setChecklistType] = useState('inbound');

    const handleLogout = () => {
        router.post('/logout');
    };

    const branches = [
        {
            id: 'BR-001',
            tier: 'Tier 1 - Branch',
            name: 'BR-001 Sila HuHa! NCR Branch',
            location: 'Quezon City, Metro Manila - BR-001',
            throughput: '20,000 parcels/day',
            icon: 'A'
        },
        {
            id: 'HUB-001',
            tier: 'Tier 2 - Hub',
            name: 'HUB-001 Sila HuHa! Central Hub',
            location: 'Santa Cruz, Laguna - HUB-001',
            throughput: '45,000 parcels/day',
            icon: 'H'
        },
        {
            id: 'WH-001',
            tier: 'Tier 3 - Warehouse',
            name: 'WH-001 Sila HuHa! CALABARZON Warehouse',
            location: 'Calamba, Laguna - WH-001',
            throughput: '50,000 parcels/day',
            icon: 'W'
        }
    ];

    const inboundChecklist = [
        {
            title: 'Sorting Staff',
            subtitle: 'Sorting Staff',
            station: 'STATION',
            shift: 'SHIFT',
            stationValue: 'Dock 8 Outbound',
            shiftValue: 'Night (22:00 - 08:00)',
            completed: '3 of 3 Completed (97%)'
        }
    ];

    const outboundChecklist = [
        {
            title: 'Sorting Staff',
            subtitle: 'Sorting Staff',
            station: 'STATION',
            shift: 'SHIFT',
            stationValue: 'Dock 8 Outbound',
            shiftValue: 'Night (22:00 - 08:00)',
            completed: '0 of 3 Completed (0%)'
        }
    ];

    const inboundTriage = [
        {
            title: 'Confirm manifest QR matches loaded bin',
            description: 'Scan each cluster manifest QR and confirm the parcel count against the loading sheet.',
            hasNote: true,
            hasPhoto: true
        },
        {
            title: 'Verify courier assignment per route',
            description: 'Every consignee courier must have been assigned courier before the dock gate opens.',
            hasNote: true,
            hasPhoto: true
        },
        {
            title: 'Seal and tag outbound vehicle',
            description: 'Apply a numbered seal, record it, file dispatch ledger and photograph the closed load.',
            hasNote: true,
            hasPhoto: true
        }
    ];

    const outboundTriage = [
        {
            title: 'Verify truck seal integrity',
            description: 'Check that complete seal numbers match the received cargo manifest prior to unloading.',
            hasNote: true,
            hasPhoto: true
        },
        {
            title: 'Scan every parcel\'s QR code',
            description: 'Ensure all inbound packages are verified with optical QR scan against the electronic waybill (hh barcodes).',
            hasNote: true,
            hasPhoto: true
        },
        {
            title: 'Inspect for damage and weight differences',
            description: 'Record any crushed boxes or tare discrepancies (>20kg) in the stage log before sorting the clearance.',
            hasNote: true,
            hasPhoto: true
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
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Branches & Checklists" />
            
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
                            className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition text-gray-300 hover:bg-[#2E2240]/50 hover:text-white"
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
                                <h2 className="text-base font-semibold text-gray-900" style={fontSyncopate}>Branches & Checklists</h2>
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

                    {/* Content Area */}
                    <main className="flex-1 overflow-auto p-6 bg-gray-50">
                        <div className="max-w-7xl mx-auto">
                            {/* Top Action Buttons */}
                            <div className="flex items-center justify-between mb-6">
                                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    FACILITY OPERATIONS
                                </button>
                                
                                <div className="flex items-center gap-4">
                                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="1"/>
                                            <circle cx="12" cy="5" r="1"/>
                                            <circle cx="12" cy="19" r="1"/>
                                        </svg>
                                        <span className="text-green-600 font-semibold">Regional Sync: Running</span>
                                    </button>
                                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                        </svg>
                                        Audit Logs
                                    </button>
                                </div>
                            </div>

                            {/* Branch Sync Info */}
                            <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 4 23 10 17 10"/>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                                <span>Daily Sync (02:30 - 08:00) • Sep 25, 2026</span>
                            </div>

                            {/* Main Content - Two Columns */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Branch Network Hierarchy - Left Column */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900" style={fontSyncopate}>Branch Network Hierarchy</h3>
                                            <p className="text-sm text-gray-500">Southern Luzon Cluster Structure</p>
                                        </div>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {branches.map((branch, idx) => (
                                            <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#2B2249] text-white flex items-center justify-center text-lg font-bold flex-shrink-0" style={fontSyncopate}>
                                                        {branch.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs text-gray-600 mb-1">{branch.id} • {branch.tier}</div>
                                                        <h4 className="text-sm font-bold text-gray-900 mb-1">{branch.name}</h4>
                                                        <p className="text-xs text-gray-600 mb-2">{branch.location}</p>
                                                        <div className="text-xs text-gray-500">
                                                            <span className="font-semibold">Max Throughput</span>
                                                            <span className="ml-2">{branch.throughput}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Strict Matrix Standard */}
                                    <div className="mt-6 bg-[#1e293b] text-white rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-1">
                                                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-bold mb-1">Strict Matrix Standard</h4>
                                                <p className="text-xs text-gray-300">All nodes strictly enforce 3D QR validation. Linear 1D barcodes inputs are not sent across branches.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Checklists - Right Column */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1" style={fontSyncopate}>Operational Checklists</h3>
                                        <p className="text-sm text-gray-500">Mandatory procedure verification per shift sequence</p>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-6">
                                        <button
                                            onClick={() => setChecklistType('inbound')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                checklistType === 'inbound'
                                                    ? 'bg-[#2B2249] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Inbound Checklist
                                        </button>
                                        <button
                                            onClick={() => setChecklistType('outbound')}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                                checklistType === 'outbound'
                                                    ? 'bg-[#2B2249] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Outbound Checklist
                                        </button>
                                    </div>

                                    {/* Checklist Content */}
                                    {checklistType === 'inbound' ? (
                                        <div className="space-y-6">
                                            {inboundChecklist.map((item, idx) => (
                                                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#2B2249] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                            SC
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                                                            <p className="text-xs text-gray-600">{item.subtitle}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-600 mb-1">{item.station}</div>
                                                            <div className="text-xs text-gray-900">{item.stationValue}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-600 mb-1">{item.shift}</div>
                                                            <div className="text-xs text-gray-900">{item.shiftValue}</div>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-gray-600 mb-4">
                                                        <span className="font-semibold">Inbound Manifest Triage</span>
                                                        <span className="ml-2">{item.completed}</span>
                                                    </div>

                                                    {inboundTriage.map((task, taskIdx) => (
                                                        <div key={taskIdx} className="bg-white rounded-lg p-4 mb-3">
                                                            <div className="flex items-start gap-3">
                                                                <input type="radio" name={`task-${idx}-${taskIdx}`} className="mt-1" />
                                                                <div className="flex-1">
                                                                    <h5 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h5>
                                                                    <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                                                                    <div className="flex gap-2">
                                                                        {task.hasNote && (
                                                                            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">
                                                                                Add note...
                                                                            </button>
                                                                        )}
                                                                        {task.hasPhoto && (
                                                                            <button className="px-3 py-1 text-blue-600 text-xs hover:underline flex items-center gap-1">
                                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                                                    <path d="M21 15l-5-5L5 21"/>
                                                                                </svg>
                                                                                Photo
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="flex items-center gap-2 mt-4">
                                                        <input type="radio" id={`beginner-${idx}`} name={`region-${idx}`} />
                                                        <label htmlFor={`beginner-${idx}`} className="text-xs text-gray-700">
                                                            Returned to Regional Ledger (Laguna Hub (Santa Cruz) Route)
                                                        </label>
                                                    </div>

                                                    <button className="w-full mt-4 px-4 py-2 bg-[#2B2249] text-white rounded-lg text-sm font-semibold hover:bg-[#3B1F6B] transition">
                                                        Submit Checklist
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Compliance Stats */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-2">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <path d="M12 6v6l4 2"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900">98.6%</div>
                                                    <div className="text-xs text-gray-500">SHIFT COMPLIANCE</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-2">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900">100%</div>
                                                    <div className="text-xs text-gray-500">90 ROLLING SCANS RATE</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {outboundChecklist.map((item, idx) => (
                                                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#2B2249] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                            SC
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                                                            <p className="text-xs text-gray-600">{item.subtitle}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-600 mb-1">{item.station}</div>
                                                            <div className="text-xs text-gray-900">{item.stationValue}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-600 mb-1">{item.shift}</div>
                                                            <div className="text-xs text-gray-900">{item.shiftValue}</div>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-gray-600 mb-4">
                                                        <span className="font-semibold">Inbound Manifest Triage</span>
                                                        <span className="ml-2">{item.completed}</span>
                                                    </div>

                                                    {outboundTriage.map((task, taskIdx) => (
                                                        <div key={taskIdx} className="bg-white rounded-lg p-4 mb-3">
                                                            <div className="flex items-start gap-3">
                                                                <input type="radio" name={`task-${idx}-${taskIdx}`} className="mt-1" />
                                                                <div className="flex-1">
                                                                    <h5 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h5>
                                                                    <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                                                                    <div className="flex gap-2">
                                                                        {task.hasNote && (
                                                                            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">
                                                                                Add note...
                                                                            </button>
                                                                        )}
                                                                        {task.hasPhoto && (
                                                                            <button className="px-3 py-1 text-blue-600 text-xs hover:underline flex items-center gap-1">
                                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                                                    <path d="M21 15l-5-5L5 21"/>
                                                                                </svg>
                                                                                Photo
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button className="w-full mt-4 px-4 py-2 bg-[#2B2249] text-white rounded-lg text-sm font-semibold hover:bg-[#3B1F6B] transition">
                                                        Submit Checklist
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

BranchesChecklists.layout = (page: ReactNode) => page;
