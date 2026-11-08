import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import CourierLayout from './CourierLayout';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontSyne = { fontFamily: 'Syne, sans-serif' };

interface Shipment {
    id: number;
    waybill_number: string;
    order_number: string;
    seller_name: string;
    seller_id: number | null;
    pickup_address: string;
    destination: string;
    weight: string | number;
    dimensions: string;
    assigned_date: string;
    assignment_status: 'pending' | 'accepted' | 'rejected';
    is_overdue: boolean;
    is_expiring_soon: boolean;
}

interface Stats {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    expiring: number;
}

interface Seller {
    id: number;
    name: string;
}

interface Filters {
    search?: string;
    status: string;
    seller?: number;
    destination?: string;
    date_from?: string;
    date_to?: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
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
    company: {
        name: string;
        contact_person: string;
    };
    shipments: Shipment[];
    stats: Stats;
    sellers: Seller[];
    filters: Filters;
    pagination: Pagination;
}

interface ShipmentDetails {
    id: number;
    waybill_number: string;
    order_number: string;
    assignment_status: string;
    assigned_at: string;
    acceptance_deadline: string;
    accepted_at: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
    weight: string | number;
    dimensions: string;
    pickup_instructions: string;
    seller: {
        id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        province: string;
    } | null;
    buyer_destination: {
        city: string;
        barangay: string;
        province: string;
        region: string;
    };
    total_amount: number;
    payment_method: string;
    items_count: number;
    assigned_by: string;
}

interface HistoryEntry {
    action: string;
    performed_by: string;
    notes: string | null;
    created_at: string;
}

const REJECTION_REASONS = [
    'Out of service area',
    'Vehicle unavailable',
    'Peak capacity reached',
    'Pickup time conflicts',
    'Insufficient preparation time',
    'Weather/road conditions',
    'Other (specify below)',
];

export default function IncomingShipments({ auth, company, shipments: initialShipments, stats: initialStats, sellers, filters: initialFilters, pagination }: Props) {
    const [shipments, setShipments] = useState(initialShipments);
    const [stats, setStats] = useState(initialStats);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<ShipmentDetails | null>(null);
    const [shipmentHistory, setShipmentHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getStatusBadge = (status: string, isOverdue: boolean, isExpiring: boolean) => {
        if (status === 'pending') {
            if (isOverdue) {
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Overdue</span>;
            }
            if (isExpiring) {
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">Expiring Soon</span>;
            }
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
        }
        if (status === 'accepted') {
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Accepted</span>;
        }
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Rejected</span>;
    };

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        // Build query string
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'all') {
                params.append(k, v.toString());
            }
        });
        
        router.get(`/courier/incoming-shipments?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({ status: 'all' });
        router.get('/courier/incoming-shipments');
    };

    const handleCardFilter = (status: string) => {
        handleFilterChange('status', status);
    };

    const fetchShipmentDetails = async (id: number) => {
        setLoading(true);
        setError('');
        
        // Use fetch instead of axios
        fetch(`/api/courier/shipments/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load details');
                return response.json();
            })
            .then(data => {
                setSelectedShipment(data.assignment);
                setShipmentHistory(data.history);
                setShowDetailsModal(true);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to load shipment details');
                setLoading(false);
            });
    };

    const handleAccept = async (id: number) => {
        if (!confirm('Accept this shipment? It will become available for pickup.')) {
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/shipments/${id}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccess(data.message);
                    
                    // Refresh data
                    router.reload({ only: ['shipments', 'stats'] });
                    
                    // Update modal if open
                    if (selectedShipment?.id === id) {
                        setSelectedShipment({
                            ...selectedShipment,
                            assignment_status: 'accepted',
                            accepted_at: data.assignment.accepted_at,
                        });
                    }
                    
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to accept shipment');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to accept shipment');
                setActionLoading(false);
            });
    };

    const handleRejectClick = (id: number) => {
        setShowRejectModal(true);
        setRejectionReason('');
        setCustomReason('');
        setError('');
    };

    const handleRejectSubmit = async (id: number) => {
        const finalReason = rejectionReason === 'Other (specify below)' ? customReason : rejectionReason;
        
        if (!finalReason || finalReason.trim().length < 10) {
            setError('Please provide a reason of at least 10 characters.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/shipments/${id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ reason: finalReason.trim() }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccess(data.message);
                    setShowRejectModal(false);
                    
                    // Refresh data
                    router.reload({ only: ['shipments', 'stats'] });
                    
                    // Update modal if open
                    if (selectedShipment?.id === id) {
                        setSelectedShipment({
                            ...selectedShipment,
                            assignment_status: 'rejected',
                            rejected_at: data.assignment.rejected_at,
                            rejection_reason: data.assignment.rejection_reason,
                        });
                    }
                    
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to reject shipment');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to reject shipment');
                setActionLoading(false);
            });
    };

    return (
        <CourierLayout auth={auth} company={company} activeTab="incoming-shipments" pageTitle="Incoming Shipments">
            <Head title="Incoming Shipments" />
            
            <div className="max-w-7xl mx-auto space-y-6" style={fontSyne}>
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-5 gap-6">
                    <button
                        onClick={() => handleCardFilter('all')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'all' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                                    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Total</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600 mt-1">All assignments</div>
                    </button>

                    <button
                        onClick={() => handleCardFilter('pending')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'pending' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Pending</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                        <div className="text-sm text-gray-600 mt-1">Awaiting response</div>
                    </button>

                    <button
                        onClick={() => handleCardFilter('accepted')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'accepted' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Accepted</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.accepted}</div>
                        <div className="text-sm text-gray-600 mt-1">Confirmed</div>
                    </button>

                    <button
                        onClick={() => handleCardFilter('rejected')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'rejected' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Rejected</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
                        <div className="text-sm text-gray-600 mt-1">Declined</div>
                    </button>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Urgent</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.expiring}</div>
                        <div className="text-sm text-gray-600 mt-1">Expiring/Overdue</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-2">
                            <input
                                type="text"
                                placeholder="Search by Waybill or Order #"
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <select
                                value={filters.seller || ''}
                                onChange={(e) => handleFilterChange('seller', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            >
                                <option value="">All Sellers</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Destination"
                                value={filters.destination || ''}
                                onChange={(e) => handleFilterChange('destination', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
                                placeholder="From Date"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
                                placeholder="To Date"
                                value={filters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                        >
                            Clear filters
                        </button>
                    </div>
                </div>

                {/* Shipments Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {shipments.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                            </svg>
                            <p className="text-sm">
                                {Object.values(filters).some(v => v && v !== 'all') 
                                    ? 'No results. Try clearing filters.' 
                                    : 'No incoming shipments yet'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Waybill No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seller</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pickup Address</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {shipments.map((shipment) => (
                                            <tr key={shipment.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{shipment.waybill_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{shipment.order_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{shipment.seller_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{shipment.pickup_address}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{shipment.destination}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div>{typeof shipment.weight === 'number' ? `${shipment.weight} kg` : <span className="text-gray-400">{shipment.weight}</span>}</div>
                                                    <div className="text-xs text-gray-400">{shipment.dimensions}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{shipment.assigned_date}</td>
                                                <td className="px-6 py-4">{getStatusBadge(shipment.assignment_status, shipment.is_overdue, shipment.is_expiring_soon)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => fetchShipmentDetails(shipment.id)}
                                                            className="text-sm text-[#3B1F6B] hover:underline"
                                                        >
                                                            View
                                                        </button>
                                                        {shipment.assignment_status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAccept(shipment.id)}
                                                                    disabled={actionLoading}
                                                                    className="text-sm text-green-600 hover:underline disabled:opacity-50"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        fetchShipmentDetails(shipment.id);
                                                                        setShowRejectModal(true);
                                                                    }}
                                                                    disabled={actionLoading}
                                                                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {pagination.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-[#3B1F6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedShipment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Shipment Details</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Waybill and Order Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Waybill Number:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.waybill_number}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Order Number:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.order_number}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status:</span>
                                            <div className="mt-1">{getStatusBadge(selectedShipment.assignment_status, false, false)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Assigned By:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.assigned_by}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Assigned At:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.assigned_at}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Deadline:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.acceptance_deadline}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Details */}
                                {selectedShipment.seller && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller Contact Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Name:</span>
                                                <div className="font-medium text-gray-900">{selectedShipment.seller.name}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Email:</span>
                                                <div className="font-medium text-gray-900">{selectedShipment.seller.email}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Phone:</span>
                                                <div className="font-medium text-gray-900">{selectedShipment.seller.phone}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Pickup Address:</span>
                                                <div className="font-medium text-gray-900">{selectedShipment.seller.address}, {selectedShipment.seller.city}, {selectedShipment.seller.province}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Buyer Destination (Limited) */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Destination (Limited Info)</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">City:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.buyer_destination.city}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Barangay:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.buyer_destination.barangay}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Province:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.buyer_destination.province}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Region:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.buyer_destination.region}</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Full buyer details will be available after acceptance.</p>
                                </div>

                                {/* Parcel Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Parcel Details</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Weight:</span>
                                            <div className="font-medium text-gray-900">
                                                {typeof selectedShipment.weight === 'number' ? `${selectedShipment.weight} kg` : <span className="text-gray-400">{selectedShipment.weight}</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Dimensions:</span>
                                            <div className="font-medium text-gray-900">
                                                {selectedShipment.dimensions === 'Not provided' ? <span className="text-gray-400">{selectedShipment.dimensions}</span> : selectedShipment.dimensions}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Items Count:</span>
                                            <div className="font-medium text-gray-900">{selectedShipment.items_count}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Pickup Instructions</h3>
                                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                        {selectedShipment.pickup_instructions}
                                    </div>
                                </div>

                                {/* Assignment History */}
                                {shipmentHistory.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment History</h3>
                                        <div className="space-y-3">
                                            {shipmentHistory.map((entry, index) => (
                                                <div key={index} className="flex gap-3 text-sm">
                                                    <div className="w-2 h-2 bg-[#3B1F6B] rounded-full mt-1.5"></div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 capitalize">{entry.action}</div>
                                                        <div className="text-xs text-gray-500">by {entry.performed_by} • {entry.created_at}</div>
                                                        {entry.notes && <div className="text-xs text-gray-600 mt-1 italic">"{entry.notes}"</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedShipment.assignment_status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleAccept(selectedShipment.id)}
                                            disabled={actionLoading}
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Processing...' : 'Accept Assignment'}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={actionLoading}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                        >
                                            Reject Assignment
                                        </button>
                                    </div>
                                )}

                                {selectedShipment.assignment_status === 'rejected' && selectedShipment.rejection_reason && (
                                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</div>
                                        <div className="text-sm text-red-700">{selectedShipment.rejection_reason}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedShipment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Reject Assignment</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Rejection *</label>
                                    <select
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    >
                                        <option value="">Select a reason</option>
                                        {REJECTION_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                </div>

                                {rejectionReason === 'Other (specify below)' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Please specify (min 10 characters) *</label>
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                            placeholder="Enter your reason..."
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRejectSubmit(selectedShipment.id)}
                                    disabled={actionLoading || !rejectionReason}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CourierLayout>
    );
}

IncomingShipments.layout = (page: ReactNode) => page;
