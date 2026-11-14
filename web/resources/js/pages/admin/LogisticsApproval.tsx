import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Eye,
    Search,
    ThumbsDown,
    ThumbsUp,
    Timer,
    XCircle,
    Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminListFilters, type AdminListFilters, type AdminListPagination } from '@/hooks/use-admin-list-filters';
import AdminShell from '@/layouts/admin/admin-shell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Registration {
    id: number;
    company_name: string;
    email: string;
    account_type: string;
    status: 'pending' | 'approved' | 'disapproved';
    created_at: string;
    approved_at: string | null;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    disapproved: number;
}

interface Props {
    registrations: Registration[];
    stats: Stats;
    filters: AdminListFilters;
    pagination: AdminListPagination;
}

// ─── Stat cards ───────────────────────────────────────────────────────────────

function StatCards({ stats }: { stats: Stats }) {
    const statCards = [
        {
            label: 'Total Applications',
            icon: ClipboardList,
            value: stats.total.toString(),
            sub: 'All time',
            accent: 'bg-[#3B1F6B]',
            iconColor: 'text-white',
            dark: true,
        },
        {
            label: 'Pending Review',
            icon: Timer,
            value: stats.pending.toString(),
            sub: 'Awaiting action',
            accent: 'bg-white',
            iconColor: 'text-amber-500',
            dark: false,
        },
        {
            label: 'Approved',
            icon: CheckCircle2,
            value: stats.approved.toString(),
            sub: 'Active partners',
            accent: 'bg-white',
            iconColor: 'text-emerald-500',
            dark: false,
        },
        {
            label: 'Disapproved',
            icon: XCircle,
            value: stats.disapproved.toString(),
            sub: 'Rejected',
            accent: 'bg-white',
            iconColor: 'text-red-400',
            dark: false,
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map(({ label, icon: Icon, value, sub, accent, iconColor, dark }) => (
                <div
                    key={label}
                    className={`flex flex-col gap-1 rounded-lg border p-4 shadow-sm ${accent} ${dark ? 'border-[#3B1F6B]' : 'border-gray-200'}`}
                >
                    <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.5} />
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? 'text-white/70' : 'text-gray-500'}`}>
                            {label}
                        </span>
                    </div>
                    <p className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                    <p className={`text-xs ${dark ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Table columns ────────────────────────────────────────────────────────────

const columns = ['Company', 'Type', 'Registration No.', 'Documents', 'Date Applied', 'Status', 'Action'];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'disapproved' }) {
    const map = {
        pending:     'text-amber-600  bg-amber-50  border-amber-200',
        approved:    'text-emerald-600 bg-emerald-50 border-emerald-200',
        disapproved: 'text-red-500    bg-red-50    border-red-200',
    };
    return (
        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status]}`}>
            {status}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogisticsApproval({ registrations, stats, filters, pagination }: Props) {
    const { statusFilter, setStatusFilter, search, setSearch, sort, setSort, goToPage } = useAdminListFilters('/admin/logistics-approval', filters);
    const [selectedLogistics, setSelectedLogistics] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

    // ESC key to close preview
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && previewDoc) {
                setPreviewDoc(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [previewDoc]);

    // Filtering, sorting and paging happen on the server (see useAdminListFilters).
    const filteredRegistrations = registrations;

    async function handleViewDetails(userId: number) {
        setLoadingDetails(true);
        setShowModal(true);
        
        try {
            const response = await fetch(`/admin/logistics-approval/${userId}/details`);
            const data = await response.json();
            setSelectedLogistics(data);
        } catch (error) {
            console.error('Failed to load logistics details:', error);
            alert('Failed to load logistics details');
            setShowModal(false);
        } finally {
            setLoadingDetails(false);
        }
    }

    function handleApprove(userId: number) {
        if (confirm('Are you sure you want to approve this logistics partner registration?')) {
            router.post(`/admin/logistics-approval/${userId}/approve`);
            setShowModal(false);
        }
    }

    function handleDisapprove(userId: number) {
        if (confirm('Are you sure you want to disapprove this logistics partner registration?')) {
            router.post(`/admin/logistics-approval/${userId}/disapprove`);
            setShowModal(false);
        }
    }

    return (
        <>
            <Head title="Logistics Approval" />
            <AdminShell active="logistics-approval">
                {/* Header row */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Logistics Partner Approval</h1>
                        <p className="mt-1 text-sm text-gray-500">Review logistics company documents and approve or reject registrations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Status filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-8 appearance-none rounded-md border border-gray-200 bg-white pl-3 pr-8 text-xs text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30"
                            >
                                {['All', 'Pending', 'Approved', 'Disapproved'].map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <StatCards stats={stats} />

                {/* Table card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Table header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Logistics partner applications</p>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Review logistics company documents including SEC, BIR, and business permits — tap the review icon for full details.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="flex h-8 w-56 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3">
                                <Search className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Search by company name…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none"
                                />
                            </div>
                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    aria-label="Sort by date"
                                    className="h-8 appearance-none rounded-md border border-gray-200 bg-white pl-3 pr-7 text-xs text-gray-600 shadow-sm focus:outline-none"
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {columns.map((col) => (
                                        <th
                                            key={col}
                                            className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.length === 0 ? (
                                    /* Empty state */
                                    <tr>
                                        <td colSpan={columns.length} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                                <Truck className="h-8 w-8" strokeWidth={1} />
                                                <p className="text-sm font-medium text-gray-400">
                                                    {search || statusFilter !== 'All'
                                                        ? 'No matching logistics applications'
                                                        : 'No logistics applications yet'}
                                                </p>
                                                <p className="text-xs text-gray-300">
                                                    {search || statusFilter !== 'All'
                                                        ? 'Try adjusting your filters or search query.'
                                                        : 'Logistics partner applications will appear here once they start signing up.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            {/* Company */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800">{reg.company_name}</span>
                                                    <span className="text-xs text-gray-400">{reg.email}</span>
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="px-5 py-4">
                                                <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 capitalize">
                                                    {reg.account_type}
                                                </span>
                                            </td>

                                            {/* Registration No. */}
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-600 font-mono">
                                                    {/* Will show SEC reg no */}
                                                    —
                                                </span>
                                            </td>

                                            {/* Documents */}
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(reg.id)}
                                                    className="text-xs text-[#3B1F6B] hover:underline"
                                                >
                                                    View docs
                                                </button>
                                            </td>

                                            {/* Date Applied */}
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-500">{reg.created_at}</span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <StatusBadge status={reg.status} />
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {reg.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(reg.id)}
                                                                className="flex h-7 w-7 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                                title="Approve"
                                                            >
                                                                <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDisapprove(reg.id)}
                                                                className="flex h-7 w-7 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                                                                title="Disapprove"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {reg.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleDisapprove(reg.id)}
                                                            className="flex h-7 w-7 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                                                            title="Revoke approval"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        </button>
                                                    )}
                                                    {reg.status === 'disapproved' && (
                                                        <button
                                                            onClick={() => handleApprove(reg.id)}
                                                            className="flex h-7 w-7 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                            title="Approve"
                                                        >
                                                            <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewDetails(reg.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-[#3B1F6B]"
                                                        title="View details"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer / pagination stub */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                        <p className="text-xs text-gray-400">
                            {pagination.total === 0
                                ? 'No results'
                                : `Showing ${pagination.from}-${pagination.to} of ${pagination.total} result${pagination.total !== 1 ? 's' : ''}`}
                        </p>
                        {pagination.last_page > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={pagination.current_page <= 1}
                                    onClick={() => goToPage(pagination.current_page - 1)}
                                    className="h-7 rounded-md border border-gray-200 px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="text-xs text-gray-500">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <button
                                    type="button"
                                    disabled={pagination.current_page >= pagination.last_page}
                                    onClick={() => goToPage(pagination.current_page + 1)}
                                    className="h-7 rounded-md border border-gray-200 px-3 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status badge legend */}
                <div className="mt-4 flex items-center gap-4 px-1">
                    {(['pending', 'approved', 'disapproved'] as const).map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                            <StatusBadge status={s} />
                        </div>
                    ))}
                    <span className="ml-1 text-xs text-gray-300">— status indicators</span>
                    <Eye className="ml-auto h-3.5 w-3.5 text-gray-300" strokeWidth={1.5} />
                    <span className="text-xs text-gray-300">review icon</span>
                </div>

                {/* Details Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                            {loadingDetails ? (
                                <div className="flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#3B1F6B]"></div>
                                        <p className="mt-4 text-sm text-gray-500">Loading logistics details...</p>
                                    </div>
                                </div>
                            ) : selectedLogistics ? (
                                <>
                                    {/* Modal Header */}
                                    <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">Logistics Application Details</h2>
                                                <p className="text-sm text-gray-500">Review all submitted information and documents</p>
                                            </div>
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="rounded-lg p-2 hover:bg-gray-100"
                                            >
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-6">
                                        {/* Company Information */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Company Information</h3>
                                            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Company Name</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.company_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">SEC Registration No.</p>
                                                    <p className="mt-1 font-medium text-gray-900 font-mono">{selectedLogistics.sec_registration_no}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">TIN</p>
                                                    <p className="mt-1 font-medium text-gray-900 font-mono">{selectedLogistics.tin}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Business Address */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Business Address</h3>
                                            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Region</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.region}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Province</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.province || '—'}</p>
                                                </div>
                                                {selectedLogistics.district && (
                                                    <div>
                                                        <p className="text-xs text-gray-500">District</p>
                                                        <p className="mt-1 font-medium text-gray-900">{selectedLogistics.district}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-gray-500">City/Municipality</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.municipality_city}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Barangay</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.barangay}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Postal Code</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.postal_code}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500">Street Address</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.street_address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Person */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Contact Person</h3>
                                            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="mt-1 font-medium text-gray-900">
                                                        {selectedLogistics.contact_first_name} {selectedLogistics.contact_last_name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Position</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.contact_position}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Contact Number</p>
                                                    <p className="mt-1 font-medium text-gray-900">{selectedLogistics.contact_number}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Areas */}
                                        {selectedLogistics.service_areas && selectedLogistics.service_areas.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Service Areas</h3>
                                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedLogistics.service_areas.map((area: string) => (
                                                            <span key={area} className="inline-block rounded-full bg-[#F1EDFB] px-3 py-1 text-xs font-medium text-[#3B1F6B]">
                                                                {area}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Documents */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Submitted Documents</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedLogistics.sec_certificate_url && (
                                                    <button
                                                        onClick={() => setPreviewDoc({ url: selectedLogistics.sec_certificate_url, title: 'SEC Certificate' })}
                                                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-[#3B1F6B] hover:bg-gray-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1EDFB]">
                                                            <svg className="h-5 w-5 text-[#3B1F6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-sm font-medium text-gray-900">SEC Certificate</p>
                                                            <p className="text-xs text-gray-500">Click to preview</p>
                                                        </div>
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                )}
                                                {selectedLogistics.bir_form_2303_url && (
                                                    <button
                                                        onClick={() => setPreviewDoc({ url: selectedLogistics.bir_form_2303_url, title: 'BIR Form 2303' })}
                                                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-[#3B1F6B] hover:bg-gray-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1EDFB]">
                                                            <svg className="h-5 w-5 text-[#3B1F6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-sm font-medium text-gray-900">BIR Form 2303</p>
                                                            <p className="text-xs text-gray-500">Click to preview</p>
                                                        </div>
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                )}
                                                {selectedLogistics.business_permit_url && (
                                                    <button
                                                        onClick={() => setPreviewDoc({ url: selectedLogistics.business_permit_url, title: 'Business Permit' })}
                                                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-[#3B1F6B] hover:bg-gray-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1EDFB]">
                                                            <svg className="h-5 w-5 text-[#3B1F6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-sm font-medium text-gray-900">Business Permit</p>
                                                            <p className="text-xs text-gray-500">Click to preview</p>
                                                        </div>
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                )}
                                                {selectedLogistics.valid_id_url && (
                                                    <button
                                                        onClick={() => setPreviewDoc({ url: selectedLogistics.valid_id_url, title: 'Valid ID' })}
                                                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-[#3B1F6B] hover:bg-gray-50"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1EDFB]">
                                                            <svg className="h-5 w-5 text-[#3B1F6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-sm font-medium text-gray-900">Valid ID</p>
                                                            <p className="text-xs text-gray-500">Click to preview</p>
                                                        </div>
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Info */}
                                        <div className="mb-6">
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Application Status</h3>
                                            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <StatusBadge status={selectedLogistics.status} />
                                                <div className="text-xs text-gray-500">
                                                    <p>Applied: {selectedLogistics.created_at}</p>
                                                    {selectedLogistics.approved_at && <p>Approved: {selectedLogistics.approved_at}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer - Actions */}
                                    <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Close
                                            </button>
                                            {selectedLogistics.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleDisapprove(selectedLogistics.id)}
                                                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Disapprove
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(selectedLogistics.id)}
                                                        className="flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#2E1854]"
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                        Approve Partner
                                                    </button>
                                                </>
                                            )}
                                            {selectedLogistics.status === 'approved' && (
                                                <button
                                                    onClick={() => handleDisapprove(selectedLogistics.id)}
                                                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Revoke Approval
                                                </button>
                                            )}
                                            {selectedLogistics.status === 'disapproved' && (
                                                <button
                                                    onClick={() => handleApprove(selectedLogistics.id)}
                                                    className="flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#2E1854]"
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                    Approve Partner
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Document Preview Modal */}
                {previewDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewDoc(null)}>
                        <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {/* Preview Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1EDFB]">
                                        <Eye className="h-4 w-4 text-[#3B1F6B]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{previewDoc.title}</h3>
                                        <p className="text-xs text-gray-500">Document preview</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={previewDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Open in new tab
                                    </a>
                                    <button
                                        onClick={() => setPreviewDoc(null)}
                                        className="rounded-lg p-2 hover:bg-gray-100"
                                        aria-label="Close preview"
                                    >
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 overflow-hidden bg-gray-100">
                                <iframe
                                    src={previewDoc.url}
                                    className="h-full w-full border-0"
                                    title={previewDoc.title}
                                    sandbox="allow-same-origin allow-scripts"
                                />
                            </div>

                            {/* Preview Footer */}
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                                <p className="text-xs text-gray-500">
                                    Press ESC to close or click outside to dismiss
                                </p>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminShell>
        </>
    );
}

LogisticsApproval.layout = (page: React.ReactNode) => page;
