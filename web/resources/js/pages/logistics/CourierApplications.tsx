import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };

interface CourierApplication {
    id: number;
    company_name: string;
    trade_name: string;
    business_email: string;
    rep_full_name: string;
    rep_position: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
        };
    };
    applications: CourierApplication[];
}

export default function CourierApplications({ auth, applications = [] }: Props) {
    const [activeTab, setActiveTab] = useState('courier-applications');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedApp, setSelectedApp] = useState<CourierApplication | null>(null);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };
    
    const handleApprove = async (courierId: number) => {
        if (!confirm('Are you sure you want to approve this courier application?')) {
            return;
        }
        
        setIsApproving(true);
        
        try {
            const response = await fetch(`/api/logistics/courier-applications/${courierId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Courier application approved! They can now access the courier dashboard.');
                setSelectedApp(null);
                router.reload(); // Reload page to refresh data
            } else {
                alert(data.error || 'Failed to approve application');
            }
        } catch (error) {
            console.error('Error approving courier:', error);
            alert('Network error. Please try again.');
        } finally {
            setIsApproving(false);
        }
    };
    
    const handleReject = async (courierId: number) => {
        const reason = prompt('Enter rejection reason (optional):');
        
        if (reason === null) {
            return; // User cancelled
        }
        
        setIsRejecting(true);
        
        try {
            const response = await fetch(`/api/logistics/courier-applications/${courierId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ reason: reason || 'Application rejected by logistics team' }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Courier application rejected.');
                setSelectedApp(null);
                router.reload(); // Reload page to refresh data
            } else {
                alert(data.error || 'Failed to reject application');
            }
        } catch (error) {
            console.error('Error rejecting courier:', error);
            alert('Network error. Please try again.');
        } finally {
            setIsRejecting(false);
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'all') return true;
        return app.status === filterStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
            case 'approved':
                return <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Approved</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Rejected</span>;
            default:
                return null;
        }
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

    const pendingCount = applications.filter(app => app.status === 'pending').length;

    return (
        <>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            <Head title="Courier Applications" />
            
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
                                            ? 'bg-[#3B1F6B] text-white'
                                            : 'text-gray-300 hover:bg-[#2E2240]/50 hover:text-white'
                                    }`}
                                >
                                    {getIcon(item.icon)}
                                    {item.label}
                                    {item.id === 'courier-applications' && pendingCount > 0 && (
                                        <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {pendingCount}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="absolute bottom-0 left-0 w-64 border-t border-white/10 bg-[#2B2249]">
                        <Link
                            href="/logistics/account"
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition ${
                                activeTab === 'account'
                                    ? 'bg-[#3B1F6B] text-white'
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
                                <h2 className="text-base font-semibold text-gray-900">Courier Applications</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                    {pendingCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
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
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'pending').length}</div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase">Pending Review</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                            <path d="M20 6 9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'approved').length}</div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase">Approved</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="15" y1="9" x2="9" y2="15"/>
                                            <line x1="9" y1="9" x2="15" y2="15"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'rejected').length}</div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase">Rejected</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applications Table */}
                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Courier Company Applications</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">{filteredApplications.length} application(s)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select 
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="text-xs border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]"
                                    >
                                        <option value="all">All Applications</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {filteredApplications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <path d="M14 2v6h6"/>
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">No applications found</p>
                                    <p className="text-xs text-gray-500">Applications will appear here once courier companies submit their registration.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Company</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Representative</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Submitted</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredApplications.map((app) => (
                                                <tr key={app.id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">{app.company_name}</div>
                                                            <div className="text-xs text-gray-500">{app.trade_name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{app.rep_full_name}</div>
                                                            <div className="text-xs text-gray-500">{app.rep_position}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-gray-900">{app.business_email}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-gray-900">{app.submitted_at}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStatusBadge(app.status)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <Link
                                                            href={`/logistics/courier-applications/${app.id}`}
                                                            className="text-xs font-semibold text-[#3B1F6B] hover:underline"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* View Details Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedApp(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
                            <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-gray-100 rounded transition">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Company Information</h4>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Company Name</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedApp.company_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Trade Name</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedApp.trade_name}</dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="text-xs font-medium text-gray-500">Business Email</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedApp.business_email}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Authorized Representative</h4>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Full Name</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedApp.rep_full_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Position</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{selectedApp.rep_position}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                {selectedApp.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleApprove(selectedApp.id)}
                                            disabled={isApproving || isRejecting}
                                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
                                        >
                                            {isApproving ? 'Approving...' : 'Approve Application'}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(selectedApp.id)}
                                            disabled={isApproving || isRejecting}
                                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
                                        >
                                            {isRejecting ? 'Rejecting...' : 'Reject Application'}
                                        </button>
                                    </>
                                )}
                                {selectedApp.status !== 'pending' && (
                                    <div className="flex-1 text-center py-2">
                                        <span className="text-sm text-gray-500">
                                            This application has been {selectedApp.status}.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

CourierApplications.layout = (page: ReactNode) => page;
