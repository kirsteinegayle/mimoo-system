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
    company: {
        name: string;
        contact_person: string;
    };
}

export default function Reports({ auth, company }: Props) {
    const [activeTab, setActiveTab] = useState('reports');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [selectedReport, setSelectedReport] = useState('overdue-parcels');
    const [timePeriod, setTimePeriod] = useState('last-7-days');
    const [fromDate, setFromDate] = useState('10/01/2026');
    const [toDate, setToDate] = useState('10/26/2026');
    const [barangayFilter, setBarangayFilter] = useState('all');

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

    const reportCards = [
        { id: 'parcels-processed', label: 'Parcels Processed', sublabel: 'Active Report', icon: 'box' },
        { id: 'delivery-performance', label: 'Delivery Performance', sublabel: 'Transit SLA & Drop', icon: 'truck' },
        { id: 'rider-performance', label: 'Rider Performance', sublabel: 'Daily Runs & Turnaround', icon: 'bike' },
        { id: 'branch-throughput', label: 'Branch Throughput', sublabel: 'Parcel Sorting Cap', icon: 'building' },
        { id: 'overdue-parcels', label: 'Overdue Parcels', sublabel: 'Active Report', icon: 'clock' }
    ];

    const kpiData = [
        { label: 'Critical Exceptions', value: '56', unit: 'locations', detail: 'Breached SLA threshold', color: 'red', icon: 'alert-triangle' },
        { label: 'SLA Breach Rate', value: '80%', unit: 'of volume', detail: 'Parcels delayed beyond SLA', color: 'red', icon: 'x-circle' },
        { label: 'Avg Sla Delay', value: '23h 53m', unit: 'delay', detail: 'Average post-due time', color: 'blue', icon: 'clock' },
        { label: 'Pending Reassignment', value: '18', unit: 'parcels', detail: 'Held by courier or stalled', color: 'red', icon: 'refresh' }
    ];

    const barangayData = [
        { name: 'Jasaan', count: 7 },
        { name: 'Lumban', count: 6 },
        { name: 'Dakar', count: 5 },
        { name: 'Bagong Pook', count: 5 },
        { name: 'Poboblacion II', count: 5 },
        { name: 'Binan', count: 5 },
        { name: 'Magellan', count: 5 }
    ];

    const overdueParcelsList = [
        { id: '#11074', barangay: 'Dakat', rider: 'K. Villar', received: 'Oct 28, 05:23 AM' },
        { id: '#11073', barangay: 'Lumban', rider: 'E. Navarro', received: 'Oct 26, 06:58 AM' },
        { id: '#11075', barangay: 'Bagong Pook', rider: 'C. Delos Santos', received: 'Oct 26, 06:19 AM' },
        { id: '#11064', barangay: 'Lumban', rider: '', received: 'Oct 26, 06:46 AM' },
        { id: '#11076', barangay: 'Poblacion II', rider: 'M. Aquino', received: 'Oct 26, 06:46 AM' }
    ];

    const sortingCenterData = [
        { date: 'Oct 1, 2026', branch: 'Hub', processed: 0, delivered: 0, overdue: 0 },
        { date: 'Oct 2, 2026', branch: 'Hub', processed: 0, delivered: 0, overdue: 0 },
        { date: 'Oct 3, 2026', branch: 'Hub', processed: 0, delivered: 0, overdue: 0 },
        { date: 'Oct 4, 2026', branch: 'Hub', processed: 0, delivered: 0, overdue: 0 },
        { date: 'Oct 5, 2026', branch: 'Hub', processed: 0, delivered: 0, overdue: 0 }
    ];

    return (
        <>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Reports" />
            
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
                                <h1 className="text-base font-bold text-gray-700">
                                    Laguna Hub (Santa Cruz)
                                </h1>
                                <span className="text-sm text-gray-400">/</span>
                                <h2 className="text-base font-semibold text-gray-900">Reports</h2>
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
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* Export Button */}
                            <div className="flex justify-end">
                                <button className="px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-semibold hover:bg-[#0f172a] transition flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7 10 12 15 17 10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Export
                                </button>
                            </div>

                            {/* Report Type Cards */}
                            <div className="grid grid-cols-5 gap-4">
                                {reportCards.map((card) => (
                                    <button
                                        key={card.id}
                                        onClick={() => setSelectedReport(card.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition ${
                                            selectedReport === card.id
                                                ? 'bg-[#E8E3F0] border-[#B8B0C8]'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${selectedReport === card.id ? 'bg-[#D4CEE0]' : 'bg-gray-100'}`}>
                                                {card.icon === 'box' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                                    </svg>
                                                )}
                                                {card.icon === 'truck' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M16 3h5v13h-5zM2 8h11v11H2z"/>
                                                        <circle cx="7.5" cy="19.5" r="2.5"/>
                                                        <circle cx="17" cy="19.5" r="2.5"/>
                                                    </svg>
                                                )}
                                                {card.icon === 'bike' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="5.5" cy="17.5" r="3.5"/>
                                                        <circle cx="18.5" cy="17.5" r="3.5"/>
                                                        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                                        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                                                    </svg>
                                                )}
                                                {card.icon === 'building' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                        <path d="M9 3v18M3 9h6M3 15h6"/>
                                                    </svg>
                                                )}
                                                {card.icon === 'clock' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900" style={fontSyncopate}>{card.label}</div>
                                                <div className="text-xs text-gray-500 mt-1">{card.sublabel}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Date Range and Filters */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">From Date</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249] focus:border-transparent"
                                            />
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">To Date</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249] focus:border-transparent"
                                            />
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Barangay</label>
                                        <div className="relative">
                                            <select
                                                value={barangayFilter}
                                                onChange={(e) => setBarangayFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2249] focus:border-transparent appearance-none"
                                            >
                                                <option value="all">All Barangays</option>
                                                <option value="jasaan">Jasaan</option>
                                                <option value="lumban">Lumban</option>
                                                <option value="dakat">Dakat</option>
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9"/>
                                            </svg>
                                        </div>
                                    </div>

                                    <button className="px-6 py-2 bg-[#E8E3F0] text-white rounded-lg text-sm font-semibold hover:bg-[#3D2E54] transition flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7 10 12 15 17 10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Generate Report
                                    </button>
                                </div>

                                {/* Time Period Tabs */}
                                <div className="flex gap-4 mt-6 border-t border-gray-200 pt-4">
                                    {['quick', 'today', 'last-7-days', 'this-month'].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setTimePeriod(period)}
                                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                                                timePeriod === period
                                                    ? 'text-[#5B4B6E] underline'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {period.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-4 gap-4">
                                {kpiData.map((kpi, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-2 rounded-lg ${kpi.color === 'red' ? 'bg-red-50' : 'bg-[#E8E3F0]'}`}>
                                                {kpi.icon === 'alert-triangle' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kpi.color === 'red' ? '#dc2626' : '#2563eb'} strokeWidth="2">
                                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                                        <line x1="12" y1="9" x2="12" y2="13"/>
                                                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                                                    </svg>
                                                )}
                                                {kpi.icon === 'x-circle' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kpi.color === 'red' ? '#dc2626' : '#2563eb'} strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <line x1="15" y1="9" x2="9" y2="15"/>
                                                        <line x1="9" y1="9" x2="15" y2="15"/>
                                                    </svg>
                                                )}
                                                {kpi.icon === 'clock' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kpi.color === 'red' ? '#dc2626' : '#2563eb'} strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                )}
                                                {kpi.icon === 'refresh' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kpi.color === 'red' ? '#dc2626' : '#2563eb'} strokeWidth="2">
                                                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-gray-600 uppercase mb-2">{kpi.label}</div>
                                        <div className={`text-3xl font-bold mb-1 ${kpi.color === 'red' ? 'text-red-600' : 'text-[#5B4B6E]'}`}>
                                            {kpi.value} <span className="text-base font-normal text-gray-600">{kpi.unit}</span>
                                        </div>
                                        <div className={`text-xs mt-2 flex items-center gap-1 ${kpi.color === 'red' ? 'text-red-600' : 'text-[#5B4B6E]'}`}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                            </svg>
                                            {kpi.detail}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Overdue Parcels by Barangay Chart */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-base font-bold text-gray-900" style={fontSyncopate}>Overdue Parcels by Barangay</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-[#E8E3F0] rounded"></div>
                                            <span className="text-xs text-gray-600">Overdue parcels</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-6">Overdue Parcels "¢ Oct 1 - 26</div>
                                
                                {/* Simple Bar Chart */}
                                <div className="flex items-end gap-4 h-40">
                                    {barangayData.map((item, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center">
                                            <div className="w-full bg-[#E8E3F0] rounded-t" style={{ height: `${item.count * 20}px` }}></div>
                                            <div className="text-xs text-gray-600 mt-2 text-center">{item.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Overdue Parcels Table */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                        </svg>
                                        <h3 className="text-base font-bold text-gray-900" style={fontSyncopate}>Overdue Parcels</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-sm text-[#5B4B6E] hover:underline">Show all rows</button>
                                        <button className="text-sm text-[#5B4B6E] hover:underline">Oct 01, 2026-26</button>
                                    </div>
                                </div>
                                
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Parcel</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Barangay</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Rider</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Received</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {overdueParcelsList.map((parcel, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">{parcel.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{parcel.barangay}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{parcel.rider || '-'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{parcel.received}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-sm font-semibold text-[#5B4B6E] hover:underline">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">56 overdue parcels "¢ Oct 1 - Oct 26, 2026</p>
                                </div>
                            </div>

                            {/* Daily Parcel Passthrough Chart */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6" style={fontSyncopate}>Daily Parcel Passthrough</h3>
                                <div className="text-xs text-gray-500 mb-6">Parcels Processed "¢ Dec 1 - 26</div>
                                
                                {/* Simple Area Chart */}
                                <div className="relative h-48">
                                    <svg viewBox="0 0 1000 200" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#93c5fd', stopOpacity: 0.8 }} />
                                                <stop offset="100%" style={{ stopColor: '#93c5fd', stopOpacity: 0.1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M 0 180 L 100 160 L 200 140 L 300 100 L 400 60 L 500 30 L 600 40 L 700 80 L 800 120 L 900 160 L 1000 180 L 1000 200 L 0 200 Z"
                                            fill="url(#areaGradient)"
                                        />
                                        <path
                                            d="M 0 180 L 100 160 L 200 140 L 300 100 L 400 60 L 500 30 L 600 40 L 700 80 L 800 120 L 900 160 L 1000 180"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </svg>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>Oct 22</span>
                                        <span>Oct 25</span>
                                        <span>Oct 26</span>
                                        <span>Oct 28</span>
                                        <span>Oct 30</span>
                                        <span>Oct 31</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sorting Center Breakdown Table */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M7 12h10M10 18h4"/>
                                        </svg>
                                        <h3 className="text-base font-bold text-gray-900" style={fontSyncopate}>Sorting Center Breakdown</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-sm text-[#5B4B6E] hover:underline">Show all rows</button>
                                        <button className="text-sm text-[#5B4B6E] hover:underline">Oct 01, 2026-26</button>
                                    </div>
                                </div>
                                
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Branch</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Parcels Processed</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Delivered</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Overdue</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600" style={fontSyncopate}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortingCenterData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{row.date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-[#E8E3F0] rounded-full"></div>
                                                        <span className="text-sm text-gray-900">{row.branch}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{row.processed}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[#5B4B6E]">{row.delivered}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{row.overdue}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-sm font-semibold text-[#5B4B6E] hover:underline">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">26 days in range "¢ Oct 1 - Oct 26, 2026</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

Reports.layout = (page: ReactNode) => page;
