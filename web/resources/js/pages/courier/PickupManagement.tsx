import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import CourierLayout from './CourierLayout';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontSyne = { fontFamily: 'Syne, sans-serif' };

interface Pickup {
    id: number;
    waybill_number: string;
    seller_name: string;
    seller_id: number | null;
    seller_contact: string;
    pickup_address: string;
    service_area: string;
    scheduled_date: string | null;
    scheduled_time_window: string;
    assigned_personnel: string;
    pickup_status: 'pending_pickup' | 'scheduled' | 'picked_up' | 'failed' | 'cancelled';
    attempt_count: number;
}

interface Stats {
    pending_pickup: number;
    scheduled_today: number;
    assigned: number;
    picked_up: number;
    failed: number;
}

interface Personnel {
    id: number;
    name: string;
    role: string;
    contact_number: string | null;
}

interface Seller {
    id: number;
    name: string;
}

interface Filters {
    search?: string;
    status: string;
    seller?: number;
    service_area?: string;
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
    pickups: Pickup[];
    stats: Stats;
    sellers: Seller[];
    personnel: Personnel[];
    filters: Filters;
    pagination: Pagination;
}

interface PickupDetails {
    id: number;
    waybill_number: string;
    order_number: string;
    pickup_status: string;
    weight: string | number;
    dimensions: string;
    pickup_instructions: string;
    scheduled_date: string | null;
    scheduled_time_window: string | null;
    assigned_personnel: {
        id: number;
        name: string;
        role: string;
        contact: string | null;
    } | null;
    picked_up_at: string | null;
    picked_up_by_name: string | null;
    attempt_count: number;
    last_attempt_at: string | null;
    cancellation_reason: string | null;
    failure_reason: string | null;
    seller: {
        id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        province: string;
    } | null;
    items_count: number;
}

interface HistoryEntry {
    action: string;
    performed_by: string;
    notes: string | null;
    created_at: string;
}

const CANCELLATION_REASONS = [
    'Seller unavailable',
    'Parcel not ready',
    'Wrong pickup address',
    'Seller refused',
    'Out of service area',
    'Weather/road conditions',
    'Vehicle breakdown',
    'Other (specify below)',
];

const FAILURE_REASONS = [
    'Seller unavailable',
    'Parcel not ready',
    'Wrong address',
    'Seller refused shipment',
    'Access denied to location',
    'Incomplete documentation',
    'Other (specify below)',
];

export default function PickupManagement({ auth, company, pickups: initialPickups, stats: initialStats, sellers, personnel, filters: initialFilters, pagination }: Props) {
    const [pickups, setPickups] = useState(initialPickups);
    const [stats, setStats] = useState(initialStats);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    
    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [selectedPickup, setSelectedPickup] = useState<PickupDetails | null>(null);
    const [pickupHistory, setPickupHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Form states
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [selectedPersonnelId, setSelectedPersonnelId] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [customCancelReason, setCustomCancelReason] = useState('');
    const [failureReason, setFailureReason] = useState('');
    const [customFailureReason, setCustomFailureReason] = useState('');
    const [scannedWaybill, setScannedWaybill] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getStatusBadge = (status: string, attemptCount: number) => {
        if (status === 'pending_pickup') {
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Pending Pickup</span>;
        }
        if (status === 'scheduled') {
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Scheduled</span>;
        }
        if (status === 'picked_up') {
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Picked Up</span>;
        }
        if (status === 'failed') {
            const badgeText = attemptCount > 0 ? `Failed (Attempt #${attemptCount})` : 'Failed';
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">{badgeText}</span>;
        }
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Cancelled</span>;
    };

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'all') {
                params.append(k, v.toString());
            }
        });
        
        router.get(`/courier/pickup-management?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({ status: 'all' });
        router.get('/courier/pickup-management');
    };

    const handleCardFilter = (status: string) => {
        handleFilterChange('status', status);
    };

    const fetchPickupDetails = async (id: number) => {
        setLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load details');
                return response.json();
            })
            .then(data => {
                setSelectedPickup(data.pickup);
                setPickupHistory(data.history);
                setShowDetailsModal(true);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to load pickup details');
                setLoading(false);
            });
    };

    const handleSchedule = async () => {
        if (!selectedPickup || !scheduleDate || !scheduleTime) {
            setError('Please select date and time window.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${selectedPickup.id}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                scheduled_date: scheduleDate,
                scheduled_time_window: scheduleTime,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccess(data.message);
                    setShowScheduleModal(false);
                    router.reload({ only: ['pickups', 'stats'] });
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to schedule pickup');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to schedule pickup');
                setActionLoading(false);
            });
    };

    const handleAssignPersonnel = async () => {
        if (!selectedPickup || !selectedPersonnelId) {
            setError('Please select personnel.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${selectedPickup.id}/assign-personnel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                personnel_id: selectedPersonnelId,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccess(data.message);
                    setShowAssignModal(false);
                    router.reload({ only: ['pickups', 'stats'] });
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to assign personnel');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to assign personnel');
                setActionLoading(false);
            });
    };

    const handleReschedule = async () => {
        if (!selectedPickup || !rescheduleDate || !rescheduleTime || !rescheduleReason.trim()) {
            setError('Please fill all fields including reason (min 10 characters).');
            return;
        }

        if (rescheduleReason.trim().length < 10) {
            setError('Reason must be at least 10 characters.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${selectedPickup.id}/reschedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                scheduled_date: rescheduleDate,
                scheduled_time_window: rescheduleTime,
                reason: rescheduleReason.trim(),
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccess(data.message);
                    setShowRescheduleModal(false);
                    router.reload({ only: ['pickups', 'stats'] });
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to reschedule pickup');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to reschedule pickup');
                setActionLoading(false);
            });
    };

    const handleCancel = async () => {
        const finalReason = cancelReason === 'Other (specify below)' ? customCancelReason : cancelReason;
        
        if (!finalReason || finalReason.trim().length < 10) {
            setError('Please provide a reason of at least 10 characters.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${selectedPickup?.id}/cancel`, {
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
                    setShowCancelModal(false);
                    router.reload({ only: ['pickups', 'stats'] });
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to cancel pickup');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to cancel pickup');
                setActionLoading(false);
            });
    };

    const handleRecordFailed = async () => {
        const finalReason = failureReason === 'Other (specify below)' ? customFailureReason : failureReason;
        
        if (!finalReason || finalReason.trim().length < 10) {
            setError('Please provide a reason of at least 10 characters.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${selectedPickup?.id}/record-failed`, {
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
                    if (data.warning) {
                        setError(data.warning);
                    }
                    setShowFailedModal(false);
                    router.reload({ only: ['pickups', 'stats'] });
                    setTimeout(() => {
                        setSuccess('');
                        setError('');
                    }, 5000);
                } else {
                    setError(data.message || 'Failed to record attempt');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to record attempt');
                setActionLoading(false);
            });
    };

    const handleConfirmPickup = async () => {
        if (!scannedWaybill.trim()) {
            setError('Please enter or scan the waybill number.');
            return;
        }

        setActionLoading(true);
        setError('');
        
        fetch(`/api/courier/pickups/${selectedPickup?.id}/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ scanned_waybill: scannedWaybill.trim() }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccess(data.message);
                    setShowConfirmModal(false);
                    setShowDetailsModal(false);
                    router.reload({ only: ['pickups', 'stats'] });
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.message || 'Failed to confirm pickup');
                }
                setActionLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to confirm pickup');
                setActionLoading(false);
            });
    };

    const openScheduleModal = (pickup: Pickup) => {
        fetchPickupDetails(pickup.id);
        setScheduleDate('');
        setScheduleTime('');
        setError('');
        setShowScheduleModal(true);
    };

    const openAssignModal = (pickup: Pickup) => {
        fetchPickupDetails(pickup.id);
        setSelectedPersonnelId('');
        setError('');
        setShowAssignModal(true);
    };

    const openRescheduleModal = (pickup: Pickup) => {
        fetchPickupDetails(pickup.id);
        setRescheduleDate('');
        setRescheduleTime('');
        setRescheduleReason('');
        setError('');
        setShowRescheduleModal(true);
    };

    const openCancelModal = (pickup: Pickup) => {
        fetchPickupDetails(pickup.id);
        setCancelReason('');
        setCustomCancelReason('');
        setError('');
        setShowCancelModal(true);
    };

    const openFailedModal = (pickup: Pickup) => {
        fetchPickupDetails(pickup.id);
        setFailureReason('');
        setCustomFailureReason('');
        setError('');
        setShowFailedModal(true);
    };

    const openConfirmModal = (pickup: Pickup) => {
        fetchPickupDetails(pickup.id);
        setScannedWaybill('');
        setError('');
        setShowConfirmModal(true);
    };

    return (
        <CourierLayout auth={auth} company={company} activeTab="pickup-management" pageTitle="Pickup Management">
            <Head title="Pickup Management" />
            
            <div className="max-w-7xl mx-auto space-y-6" style={fontSyne}>
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && !showScheduleModal && !showAssignModal && !showRescheduleModal && !showCancelModal && !showFailedModal && !showConfirmModal && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Summary Cards - Keep Purple Theme */}
                <div className="grid grid-cols-5 gap-6">
                    <button
                        onClick={() => handleCardFilter('pending_pickup')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'pending_pickup' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Pending</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.pending_pickup}</div>
                        <div className="text-sm text-gray-600 mt-1">Awaiting schedule</div>
                    </button>

                    <button
                        onClick={() => handleCardFilter('scheduled')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'scheduled' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Today</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.scheduled_today}</div>
                        <div className="text-sm text-gray-600 mt-1">Scheduled pickups</div>
                    </button>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Assigned</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.assigned}</div>
                        <div className="text-sm text-gray-600 mt-1">With personnel</div>
                    </div>

                    <button
                        onClick={() => handleCardFilter('picked_up')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'picked_up' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Picked Up</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.picked_up}</div>
                        <div className="text-sm text-gray-600 mt-1">Completed</div>
                    </button>

                    <button
                        onClick={() => handleCardFilter('failed')}
                        className={`bg-white rounded-xl border p-6 hover:shadow-lg transition text-left ${filters.status === 'failed' ? 'border-[#3B1F6B] shadow-md' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide" style={fontSyncopate}>Failed</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.failed}</div>
                        <div className="text-sm text-gray-600 mt-1">Need retry</div>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-2">
                            <input
                                type="text"
                                placeholder="Search by Waybill"
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
                                placeholder="Service Area"
                                value={filters.service_area || ''}
                                onChange={(e) => handleFilterChange('service_area', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
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

                {/* Pickups - CARD GRID LAYOUT (Different from Incoming Shipments Table) */}
                <div className="space-y-4">
                    {pickups.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 text-center py-12 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <p className="text-sm">
                                {Object.values(filters).some(v => v && v !== 'all') 
                                    ? 'No results. Try clearing filters.' 
                                    : 'No pickups yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {pickups.map((pickup) => (
                                <div 
                                    key={pickup.id} 
                                    className="bg-white rounded-xl border border-gray-200 hover:border-[#3B1F6B] hover:shadow-lg transition p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left Section - Main Info */}
                                        <div className="flex-1 grid grid-cols-3 gap-6">
                                            {/* Column 1 - Waybill & Seller */}
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Waybill</div>
                                                <div className="text-sm font-bold text-[#3B1F6B] mb-3">{pickup.waybill_number}</div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Seller</div>
                                                <div className="text-sm text-gray-900 font-medium">{pickup.seller_name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{pickup.seller_contact}</div>
                                            </div>
                                            
                                            {/* Column 2 - Pickup Details */}
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pickup Address</div>
                                                <div className="text-sm text-gray-700 mb-3">{pickup.pickup_address}</div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Service Area</div>
                                                <div className="text-sm text-gray-700">{pickup.service_area}</div>
                                            </div>
                                            
                                            {/* Column 3 - Schedule & Personnel */}
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Scheduled</div>
                                                {pickup.scheduled_date ? (
                                                    <div className="mb-3">
                                                        <div className="text-sm font-medium text-gray-900">{pickup.scheduled_date}</div>
                                                        <div className="text-xs text-gray-500">{pickup.scheduled_time_window}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic mb-3">Not scheduled</div>
                                                )}
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Personnel</div>
                                                {pickup.assigned_personnel === 'Not assigned' ? (
                                                    <div className="text-sm text-gray-400 italic">{pickup.assigned_personnel}</div>
                                                ) : (
                                                    <div className="text-sm font-medium text-gray-900">{pickup.assigned_personnel}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Right Section - Status & Actions */}
                                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                            {getStatusBadge(pickup.pickup_status, pickup.attempt_count)}
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <button
                                                    onClick={() => fetchPickupDetails(pickup.id)}
                                                    className="px-4 py-2 bg-[#3B1F6B] text-white text-xs font-semibold rounded-lg hover:bg-[#2d1850] transition shadow-sm"
                                                >
                                                    View Details
                                                </button>
                                                {pickup.pickup_status === 'pending_pickup' && (
                                                    <button
                                                        onClick={() => openScheduleModal(pickup)}
                                                        className="px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition shadow-sm"
                                                    >
                                                        Schedule
                                                    </button>
                                                )}
                                                {(pickup.pickup_status === 'pending_pickup' || pickup.pickup_status === 'scheduled') && pickup.assigned_personnel === 'Not assigned' && (
                                                    <button
                                                        onClick={() => openAssignModal(pickup)}
                                                        className="px-4 py-2 bg-purple-500 text-white text-xs font-semibold rounded-lg hover:bg-purple-600 transition shadow-sm"
                                                    >
                                                        Assign
                                                    </button>
                                                )}
                                                {pickup.pickup_status === 'scheduled' && (
                                                    <>
                                                        <button
                                                            onClick={() => openRescheduleModal(pickup)}
                                                            className="px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => openConfirmModal(pickup)}
                                                            className="px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition shadow-sm"
                                                        >
                                                            Confirm Pickup
                                                        </button>
                                                        <button
                                                            onClick={() => openFailedModal(pickup)}
                                                            className="px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition shadow-sm"
                                                        >
                                                            Mark Failed
                                                        </button>
                                                    </>
                                                )}
                                                {pickup.pickup_status === 'failed' && (
                                                    <button
                                                        onClick={() => openRescheduleModal(pickup)}
                                                        className="px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
                                                    >
                                                        Retry Pickup
                                                            </button>
                                                        )}
                                                        {(pickup.pickup_status === 'pending_pickup' || pickup.pickup_status === 'scheduled' || pickup.pickup_status === 'failed') && (
                                                            <button
                                                                onClick={() => openCancelModal(pickup)}
                                                                className="text-sm text-gray-600 hover:underline font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {pickups.length > 0 && pagination.last_page > 1 && (
                        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center justify-between">
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
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Pickup Details</h2>
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
                                {/* Shipment Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipment Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Waybill:</span>
                                            <div className="font-medium text-gray-900">{selectedPickup.waybill_number}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Order:</span>
                                            <div className="font-medium text-gray-900">{selectedPickup.order_number}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status:</span>
                                            <div className="mt-1">{getStatusBadge(selectedPickup.pickup_status, selectedPickup.attempt_count)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Items:</span>
                                            <div className="font-medium text-gray-900">{selectedPickup.items_count} item(s)</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Info */}
                                {selectedPickup.seller && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller & Pickup Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Name:</span>
                                                <div className="font-medium text-gray-900">{selectedPickup.seller.name}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Phone:</span>
                                                <div className="font-medium text-gray-900">{selectedPickup.seller.phone}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Pickup Address:</span>
                                                <div className="font-medium text-gray-900">{selectedPickup.seller.address}, {selectedPickup.seller.city}, {selectedPickup.seller.province}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule & Assignment */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule & Assignment</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Scheduled Date:</span>
                                            <div className="font-medium text-gray-900">{selectedPickup.scheduled_date || <span className="text-gray-400">Not scheduled</span>}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time Window:</span>
                                            <div className="font-medium text-gray-900">{selectedPickup.scheduled_time_window || <span className="text-gray-400">-</span>}</div>
                                        </div>
                                        {selectedPickup.assigned_personnel && (
                                            <>
                                                <div>
                                                    <span className="text-gray-500">Assigned Personnel:</span>
                                                    <div className="font-medium text-gray-900">{selectedPickup.assigned_personnel.name} ({selectedPickup.assigned_personnel.role})</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Contact:</span>
                                                    <div className="font-medium text-gray-900">{selectedPickup.assigned_personnel.contact || 'Not provided'}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Parcel Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Parcel Details</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Weight:</span>
                                            <div className="font-medium text-gray-900">
                                                {typeof selectedPickup.weight === 'number' ? `${selectedPickup.weight} kg` : <span className="text-gray-400">{selectedPickup.weight}</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Dimensions:</span>
                                            <div className="font-medium text-gray-900">
                                                {selectedPickup.dimensions === 'Not provided' ? <span className="text-gray-400">{selectedPickup.dimensions}</span> : selectedPickup.dimensions}
                                            </div>
                                        </div>
                                        {selectedPickup.attempt_count > 0 && (
                                            <div>
                                                <span className="text-gray-500">Attempts:</span>
                                                <div className="font-medium text-gray-900">{selectedPickup.attempt_count}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Pickup Instructions</h3>
                                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                        {selectedPickup.pickup_instructions}
                                    </div>
                                </div>

                                {/* Pickup History */}
                                {pickupHistory.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pickup History</h3>
                                        <div className="space-y-3">
                                            {pickupHistory.map((entry, index) => (
                                                <div key={index} className="flex gap-3 text-sm">
                                                    <div className="w-2 h-2 bg-[#3B1F6B] rounded-full mt-1.5"></div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 capitalize">{entry.action.replace('_', ' ')}</div>
                                                        <div className="text-xs text-gray-500">by {entry.performed_by} • {entry.created_at}</div>
                                                        {entry.notes && <div className="text-xs text-gray-600 mt-1 italic">"{entry.notes}"</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reasons (if cancelled or failed) */}
                                {selectedPickup.cancellation_reason && (
                                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-red-900 mb-1">Cancellation Reason:</div>
                                        <div className="text-sm text-red-700">{selectedPickup.cancellation_reason}</div>
                                    </div>
                                )}
                                {selectedPickup.failure_reason && (
                                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-orange-900 mb-1">Last Failure Reason:</div>
                                        <div className="text-sm text-orange-700">{selectedPickup.failure_reason}</div>
                                        {selectedPickup.attempt_count >= 3 && (
                                            <div className="text-sm text-orange-600 mt-2 font-medium">
                                                ⚠️ This is attempt #{selectedPickup.attempt_count}. Consider cancelling if pickup cannot be completed.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Modal */}
                {showScheduleModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Schedule Pickup</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date *</label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Window *</label>
                                    <select
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    >
                                        <option value="">Select time window</option>
                                        <option value="8AM-10AM">8AM-10AM</option>
                                        <option value="10AM-12PM">10AM-12PM</option>
                                        <option value="12PM-2PM">12PM-2PM</option>
                                        <option value="2PM-4PM">2PM-4PM</option>
                                        <option value="4PM-6PM">4PM-6PM</option>
                                    </select>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowScheduleModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSchedule}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2d1850] transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Scheduling...' : 'Schedule Pickup'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Personnel Modal */}
                {showAssignModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Assign Personnel</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                {personnel.length === 0 ? (
                                    <div className="text-center py-6">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                        </svg>
                                        <p className="text-sm text-gray-600">No personnel yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Add personnel in Rider Management first</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Personnel *</label>
                                        <select
                                            value={selectedPersonnelId}
                                            onChange={(e) => setSelectedPersonnelId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                        >
                                            <option value="">Select personnel</option>
                                            {personnel.map((person) => (
                                                <option key={person.id} value={person.id}>
                                                    {person.name} ({person.role}) {person.contact_number ? `- ${person.contact_number}` : ''}
                                                </option>
                                            ))}
                                        </select>
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
                                        setShowAssignModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                {personnel.length > 0 && (
                                    <button
                                        onClick={handleAssignPersonnel}
                                        disabled={actionLoading}
                                        className="flex-1 px-6 py-3 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2d1850] transition disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Assigning...' : 'Assign Personnel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reschedule Modal */}
                {showRescheduleModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Reschedule Pickup</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Pickup Date *</label>
                                    <input
                                        type="date"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Window *</label>
                                    <select
                                        value={rescheduleTime}
                                        onChange={(e) => setRescheduleTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    >
                                        <option value="">Select time window</option>
                                        <option value="8AM-10AM">8AM-10AM</option>
                                        <option value="10AM-12PM">10AM-12PM</option>
                                        <option value="12PM-2PM">12PM-2PM</option>
                                        <option value="2PM-4PM">2PM-4PM</option>
                                        <option value="4PM-6PM">4PM-6PM</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason (min 10 characters) *</label>
                                    <textarea
                                        value={rescheduleReason}
                                        onChange={(e) => setRescheduleReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                        placeholder="Why is this pickup being rescheduled?"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRescheduleModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReschedule}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Rescheduling...' : 'Reschedule'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Cancel Pickup</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Cancellation *</label>
                                    <select
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    >
                                        <option value="">Select a reason</option>
                                        {CANCELLATION_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                </div>

                                {cancelReason === 'Other (specify below)' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Please specify (min 10 characters) *</label>
                                        <textarea
                                            value={customCancelReason}
                                            onChange={(e) => setCustomCancelReason(e.target.value)}
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
                                        setShowCancelModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading || !cancelReason}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Record Failed Modal */}
                {showFailedModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Record Failed Attempt</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Failure *</label>
                                    <select
                                        value={failureReason}
                                        onChange={(e) => setFailureReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    >
                                        <option value="">Select a reason</option>
                                        {FAILURE_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                </div>

                                {failureReason === 'Other (specify below)' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Please specify (min 10 characters) *</label>
                                        <textarea
                                            value={customFailureReason}
                                            onChange={(e) => setCustomFailureReason(e.target.value)}
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
                                        setShowFailedModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleRecordFailed}
                                    disabled={actionLoading || !failureReason}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Recording...' : 'Record Failed'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Pickup Modal */}
                {showConfirmModal && selectedPickup && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900" style={fontSyncopate}>Confirm Pickup</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-700">
                                    <div className="font-semibold mb-1">Scan or enter waybill number</div>
                                    <div>Expected: <span className="font-mono font-bold">{selectedPickup.waybill_number}</span></div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Waybill Number *</label>
                                    <input
                                        type="text"
                                        value={scannedWaybill}
                                        onChange={(e) => setScannedWaybill(e.target.value)}
                                        onPaste={(e) => setScannedWaybill(e.clipboardData.getData('text'))}
                                        placeholder="Scan or type waybill..."
                                        autoFocus
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Barcode scanners work as keyboard input</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmPickup}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Confirming...' : 'Confirm Pickup'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CourierLayout>
    );
}

PickupManagement.layout = (page: ReactNode) => page;

