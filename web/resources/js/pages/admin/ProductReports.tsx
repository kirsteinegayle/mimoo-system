import { alertDialog } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { AlertTriangle, Eye, CheckCircle, XCircle, Package, User, Calendar, FileText } from 'lucide-react';

interface Report {
    id: number;
    reason: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_at: string | null;
    admin_notes: string | null;
    created_at: string;
    reporter: {
        id: number;
        name: string;
        email: string;
    };
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        main_image: string | null;
        sku: string;
        removed?: boolean;
        url?: string | null;
        seller: {
            id: number;
            name: string;
            email: string;
        };
    };
}

interface ReportsResponse {
    data: Report[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats?: { pending: number; approved: number; rejected: number };
}

export default function ProductReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmApprove, setShowConfirmApprove] = useState(false);
    const [showConfirmReject, setShowConfirmReject] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [filter, currentPage]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                per_page: meta.per_page.toString(),
                page: currentPage.toString(),
            });

            if (filter !== 'all') {
                params.append('status', filter);
            }

            const response = await fetch(`/api/admin/reports?${params}`, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    alertDialog('Session expired. Please refresh the page.');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ReportsResponse = await response.json();
            setReports(data.data || []);
            if (data.stats) setStats(data.stats);
            setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReport = async (reportId: number) => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/reports/${reportId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            if (response.ok) {
                fetchReports();
                setShowModal(false);
                setShowConfirmApprove(false);
                alertDialog('Report approved and product deleted successfully!');
            } else {
                const error = await response.json();
                alertDialog(error.error || 'Failed to approve report');
            }
        } catch (error) {
            console.error('Failed to approve report:', error);
            alertDialog('Failed to approve report');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectReport = async (reportId: number) => {
        if (!adminNotes.trim()) {
            alertDialog('Please provide admin notes for rejection');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/reports/${reportId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ admin_notes: adminNotes }),
            });

            if (response.ok) {
                fetchReports();
                setShowModal(false);
                setShowConfirmReject(false);
                setAdminNotes('');
                alertDialog('Report rejected successfully!');
            } else {
                const error = await response.json();
                alertDialog(error.error || 'Failed to reject report');
            }
        } catch (error) {
            console.error('Failed to reject report:', error);
            alertDialog('Failed to reject report');
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (report: Report) => {
        console.log('Opening modal for report:', report);
        setSelectedReport(report);
        setShowModal(true);
        setShowConfirmApprove(false);
        setShowConfirmReject(false);
        setAdminNotes('');
        console.log('Modal state set to true');
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            misleading: 'Misleading or false information',
            inappropriate: 'Inappropriate content',
            counterfeit: 'Counterfeit or fake product',
            spam: 'Spam or duplicate listing',
            other: 'Other',
        };
        return labels[reason] || reason;
    };

    return (
        <AdminShell active="reports">
            <Head title="Product Reports - Admin" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Product Reports</h1>
                <p className="mt-1 text-sm text-gray-500">Review and take action on reported products from buyers</p>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending Review</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            <p className="text-xs text-gray-500">Approved (Product Deleted)</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">Rejected (Product Kept)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        filter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        filter === 'pending'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        filter === 'approved'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        filter === 'rejected'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    Rejected
                </button>
            </div>

            {/* Reports Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No reports found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {report.product.main_image ? (
                                                <img
                                                    src={report.product.main_image}
                                                    alt={report.product.name}
                                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{report.product.name}</p>
                                                <p className="text-xs text-gray-500">by {report.product.seller.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                            <AlertTriangle className="h-3 w-3" />
                                            {getReasonLabel(report.reason)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">{report.reporter.name}</p>
                                        <p className="text-xs text-gray-500">{report.reporter.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                report.status === 'pending'
                                                    ? 'bg-yellow-50 text-yellow-700'
                                                    : report.status === 'approved'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-red-50 text-red-700'
                                            }`}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-900">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => openModal(report)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {reports.length} of {meta.total} reports
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="flex items-center px-3 text-sm text-gray-700">
                            Page {currentPage} of {meta.last_page}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === meta.last_page}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Report Details Modal */}
            {showModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                        <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Report ID: #{selectedReport.id}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setShowConfirmApprove(false);
                                        setShowConfirmReject(false);
                                    }}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Report Status */}
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                            selectedReport.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : selectedReport.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {selectedReport.status}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="rounded-lg border-2 border-purple-100 bg-purple-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-purple-900 uppercase tracking-wide">Reported Product</h3>
                                <div className="flex items-start gap-4">
                                    {selectedReport.product.main_image ? (
                                        <img
                                            src={selectedReport.product.main_image}
                                            alt={selectedReport.product.name}
                                            className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 border-2 border-gray-200">
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{selectedReport.product.name}</p>
                                        <p className="text-sm text-gray-600 mt-1">{selectedReport.product.description}</p>
                                        <p className="text-sm text-gray-600 mt-1">SKU: {selectedReport.product.sku}</p>
                                        {selectedReport.product.removed || !selectedReport.product.url ? (
                                            <p className="mt-1 text-xs font-semibold text-red-600">This product has been removed from the store.</p>
                                        ) : (
                                            <a href={selectedReport.product.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-purple-700 underline">
                                                View product page
                                            </a>
                                        )}
                                        <p className="text-sm font-semibold text-purple-700 mt-2">
                                            Price: ₱{selectedReport.product.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-purple-200">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Seller:</span> {selectedReport.product.seller.name}
                                    </p>
                                    <p className="text-xs text-gray-600">{selectedReport.product.seller.email}</p>
                                </div>
                            </div>

                            {/* Report Details */}
                            <div className="rounded-lg border-2 border-red-100 bg-red-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-red-900 uppercase tracking-wide">Report Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Reason</p>
                                        <p className="text-sm font-semibold text-gray-900">{getReasonLabel(selectedReport.reason)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Description</p>
                                        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Reported By</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedReport.reporter.name}</p>
                                        <p className="text-xs text-gray-600">{selectedReport.reporter.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Reported On</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedReport.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Notes (if reviewed) */}
                            {selectedReport.admin_notes && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-600 uppercase mb-1">Admin Notes</p>
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReport.admin_notes}</p>
                                </div>
                            )}

                            {/* Action Buttons - Only show if pending */}
                            {selectedReport.status === 'pending' && !showConfirmApprove && !showConfirmReject && (
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowConfirmApprove(true)}
                                        className="flex-1 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                                    >
                                        Approve Report (Delete Product)
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmReject(true)}
                                        className="flex-1 rounded-lg border-2 border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Reject Report (Keep Product)
                                    </button>
                                </div>
                            )}

                            {/* Approve Confirmation */}
                            {showConfirmApprove && (
                                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                                    <h4 className="font-bold text-red-900 mb-2">⚠️ Confirm Approval</h4>
                                    <p className="text-sm text-red-800 mb-4">
                                        This will <strong>permanently delete</strong> the reported product from the platform. 
                                        The seller will no longer be able to access or sell this product. This action cannot be undone.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApproveReport(selectedReport.id)}
                                            disabled={actionLoading}
                                            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Deleting...' : 'Yes, Delete Product'}
                                        </button>
                                        <button
                                            onClick={() => setShowConfirmApprove(false)}
                                            disabled={actionLoading}
                                            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reject Confirmation */}
                            {showConfirmReject && (
                                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                                    <h4 className="font-bold text-gray-900 mb-2">Reject Report</h4>
                                    <p className="text-sm text-gray-700 mb-3">
                                        This will keep the product on the platform and mark the report as rejected. 
                                        Please provide a reason for your decision.
                                    </p>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Admin notes (required)"
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none mb-3"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRejectReport(selectedReport.id)}
                                            disabled={actionLoading || !adminNotes.trim()}
                                            className="flex-1 rounded-lg bg-gray-600 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading ? 'Rejecting...' : 'Reject Report'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowConfirmReject(false);
                                                setAdminNotes('');
                                            }}
                                            disabled={actionLoading}
                                            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
