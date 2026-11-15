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

export default function Account({ auth, company }: Props) {
    const [activeTab, setActiveTab] = useState('account');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [activeSection, setActiveSection] = useState('company-profile');

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

    return (
        <>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style><Head title="Account" />
            
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
                                <h2 className="text-base font-semibold text-gray-900" style={fontSyncopate}>Account</h2>
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
                        <div className="max-w-7xl mx-auto">
                            {/* Company Header */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="relative w-16 h-16 rounded-lg bg-[#2B2249] flex items-center justify-center text-white text-2xl font-bold">
                                            LH
                                            <svg className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full p-1" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                <path d="M20 6 9 17l-5-5"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Laguna Hub (Santa Cruz)</h1>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Registered Logistics Hub Partner "¢ NODE ID: <span className="font-semibold">MIM-LAG-001</span> "¢ Accredited since Oct 24, 2026
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8E3F0] text-blue-700 text-xs font-semibold">
                                            â˜… Hub Operational Tier
                                        </span>
                                        <span className="text-xs text-gray-600">Priority Sorter "¢ Class A</span>
                                        <button className="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                            Certificate
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6 border-b border-gray-200" style={fontSyne}>
                                    <button
                                        onClick={() => setActiveSection('company-profile')}
                                        className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
                                            activeSection === 'company-profile'
                                                ? 'border-[#2B2249] text-[#2B2249]'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                        style={fontSyne}
                                    >
                                        Company Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('contact-person')}
                                        className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
                                            activeSection === 'contact-person'
                                                ? 'border-[#2B2249] text-[#2B2249]'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                        style={fontSyne}
                                    >
                                        Contact Person
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('documents')}
                                        className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
                                            activeSection === 'documents'
                                                ? 'border-[#2B2249] text-[#2B2249]'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                        style={fontSyne}
                                    >
                                        Documents <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded text-xs">4</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('security')}
                                        className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
                                            activeSection === 'security'
                                                ? 'border-[#2B2249] text-[#2B2249]'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                        style={fontSyne}
                                    >
                                        Security
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Content */}
                                <div className="lg:col-span-2">
                                    {activeSection === 'company-profile' && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-900" style={fontSyncopate}>Registration & Facility Info</h3>
                                                <button className="text-sm text-[#2B2249] hover:underline">Edit</button>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-6">Manage your corporate credentials and authorized operational locations.</p>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Registered Corporate Entity Name</label>
                                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <p className="text-sm text-gray-900">Laguna Hub (Santa Cruz)</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Changing this name requires confirmation.</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Contact Email</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-sm text-gray-900">hub@santacruzhub.ph</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Contact Phone</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-sm text-gray-900">(049) 000-0000</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Street Address & Landmark</label>
                                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <p className="text-sm text-gray-900">Santa Cruz, Laguna</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Coverage Note</label>
                                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <p className="text-sm text-gray-900">Covers Santa Cruz, Laguna, sorted barangay by barangay.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'contact-person' && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-900" style={fontSyncopate}>Contact Person</h3>
                                                <button className="text-sm text-[#2B2249] hover:underline">Edit</button>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-6">The person responsible for this hub. Must be 18 or older.</p>
                                            
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">First Name</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-sm text-gray-900">Sorting</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Last Name</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-sm text-gray-900">Staff</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Middle Initial</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-sm text-gray-400">"”</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Position / Title</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <p className="text-sm text-gray-900">Sorting Staff</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Birthday</label>
                                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <p className="text-sm text-gray-900">mm/dd/yyyy</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">The contact person must be at least 18 years old.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'documents' && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2" style={fontSyncopate}>Compliance Documents</h3>
                                            <p className="text-sm text-gray-600 mb-6">Accreditation paperwork on file for this hub.</p>
                                            
                                            <div className="space-y-3">
                                                {[
                                                    { name: 'SEC Registration Certificate', type: 'Corporate', date: 'Oct 24, 2026' },
                                                    { name: 'BIR Certificate of Registration (2303)', type: 'Tax', date: 'Oct 24, 2026' },
                                                    { name: "Mayor's / Business Permit", type: 'Local Government', date: 'Oct 24, 2026' },
                                                    { name: 'Fire Safety Inspection Certificate', type: 'Facility', date: 'Oct 24, 2026' },
                                                ].map((doc, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2249" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                            <polyline points="14 2 14 8 20 8"/>
                                                        </svg>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                                                            <p className="text-xs text-gray-500">{doc.type}</p>
                                                            <p className="text-xs text-gray-400">Last updated: {doc.date}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-4">Document uploads aren't connected to storage yet "” these entries are placeholders. Last updated: Oct 24, 2026 at 09:48 PM</p>
                                        </div>
                                    )}

                                    {activeSection === 'security' && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2" style={fontSyncopate}>Security</h3>
                                            <p className="text-sm text-gray-600 mb-6">Access standards for this sorting center.</p>
                                            
                                            <div className="space-y-4">
                                                <div className="p-4 bg-[#E8E3F0] border border-[#D4CEE0] rounded-lg flex items-start gap-3">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B2249" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <path d="M12 8v4m0 4h.01"/>
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">Strict Metric Standard</p>
                                                        <p className="text-xs text-gray-600 mt-1">Every parcel handled at this hub must be verified with a 2D QR scan. Linear barcodes are rejected.</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">Sign-in is turned off</p>
                                                        <p className="text-xs text-gray-600 mt-1">This build runs without login. Password and session controls will appear here once authentication is restored.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    {/* Key Operations Lead */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4" style={fontSyncopate}>Key Operations Lead</h3>
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-[#2B2249] flex items-center justify-center text-white text-lg font-bold">
                                                SC
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Sorting Staff</p>
                                                <p className="text-xs text-gray-500">Sorting Staff</p>
                                                <p className="text-xs text-[#2B2249] mt-2">hub@santacruzhub.ph</p>
                                                <p className="text-xs text-[#2B2249]">(049) 000-0000</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <p className="text-xs text-gray-600">Daily Capacity</p>
                                                <p className="text-lg font-bold text-gray-900">12,500</p>
                                                <p className="text-xs text-gray-500">Parcels / Day</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Sort S.L.A.</p>
                                                <p className="text-lg font-bold text-gray-900">99.4%</p>
                                                <p className="text-xs text-gray-500">Met this month</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-gray-900" style={fontSyncopate}>Sorting Bay Token</h3>
                                            <button className="text-xs text-[#2B2249] hover:underline">Live Scanner</button>
                                        </div>
                                        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                            <div className="w-48 h-48 bg-white border-4 border-[#2B2249] flex items-center justify-center">
                                                <svg width="160" height="160" viewBox="0 0 100 100" fill="#2B2249">
                                                    <rect width="100" height="100" fill="white"/>
                                                    {/* Simple QR-like pattern */}
                                                    <rect x="0" y="0" width="10" height="10"/>
                                                    <rect x="20" y="0" width="10" height="10"/>
                                                    <rect x="40" y="0" width="10" height="10"/>
                                                    <rect x="0" y="20" width="10" height="10"/>
                                                    <rect x="40" y="20" width="10" height="10"/>
                                                    <rect x="0" y="40" width="10" height="10"/>
                                                    <rect x="20" y="40" width="10" height="10"/>
                                                    <rect x="40" y="40" width="10" height="10"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs text-center text-gray-500 mt-3">Scan to verify hub identity</p>
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

Account.layout = (page: ReactNode) => page;
