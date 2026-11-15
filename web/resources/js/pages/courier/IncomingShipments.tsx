import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Check, CheckCircle2, ClipboardList, Clock, Eye, History, Inbox, Loader2, MapPin, Package, PackageSearch, Search, Store, X, XCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';
import CourierLayout from './CourierLayout';
import TrackingLine from '@/components/tracking-line';
import { Card, HERO_GRADIENT, PageHeader, StatusBadge, prettyStatus } from '@/components/courier/ui';

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
    // Delivery tracking from orders.tracking_* (display only)
    tracking_status?: string | null;
    tracking_message?: string | null;
    tracking_updated_at?: string | null;
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
    // Delivery tracking from orders.tracking_* (display only)
    tracking_status?: string | null;
    tracking_message?: string | null;
    tracking_updated_at?: string | null;
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
            if (isOverdue) return <StatusBadge status="rejected" label="Overdue" />;
            if (isExpiring) return <StatusBadge status="out_for_delivery" label="Expiring soon" />;
            return <StatusBadge status="pending" />;
        }
        return <StatusBadge status={status} />;
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

    const field =
        'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4B2E7E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/20';

    const statTiles: { key: string; label: string; hint: string; value: number; icon: typeof Inbox; tone: string }[] = [
        { key: 'all', label: 'Total', hint: 'All assignments', value: stats.total, icon: Inbox, tone: 'bg-violet-100 text-violet-700' },
        { key: 'pending', label: 'Pending', hint: 'Awaiting response', value: stats.pending, icon: Clock, tone: 'bg-amber-100 text-amber-700' },
        { key: 'accepted', label: 'Accepted', hint: 'Confirmed', value: stats.accepted, icon: CheckCircle2, tone: 'bg-emerald-100 text-emerald-700' },
        { key: 'rejected', label: 'Rejected', hint: 'Declined', value: stats.rejected, icon: XCircle, tone: 'bg-gray-100 text-gray-600' },
    ];

    const rowActions = (shipment: Shipment, full = false) => (
        <div className={`flex items-center gap-2 ${full ? 'w-full' : ''}`}>
            <button
                type="button"
                onClick={() => fetchShipmentDetails(shipment.id)}
                className={`inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#4B2E7E] hover:bg-violet-50 ${full ? 'flex-1' : ''}`}
            >
                <Eye className="h-3.5 w-3.5" /> View
            </button>
            {shipment.assignment_status === 'pending' && (
                <>
                    <button
                        type="button"
                        onClick={() => handleAccept(shipment.id)}
                        disabled={actionLoading}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 ${full ? 'flex-1' : ''}`}
                    >
                        <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            fetchShipmentDetails(shipment.id);
                            setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 ${full ? 'flex-1' : ''}`}
                    >
                        <X className="h-3.5 w-3.5" /> Reject
                    </button>
                </>
            )}
        </div>
    );

    const Info = ({ label, children }: { label: string; children: ReactNode }) => (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
            <dd className="mt-0.5 break-words text-sm font-semibold text-gray-900">{children}</dd>
        </div>
    );

    const Section = ({ icon: Icon, title, children }: { icon: typeof Inbox; title: string; children: ReactNode }) => (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1c1430]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1ECFA] text-[#4B2E7E]">
                    <Icon className="h-4 w-4" />
                </span>
                {title}
            </h3>
            {children}
        </section>
    );

    return (
        <CourierLayout auth={auth} company={company} activeTab="incoming-shipments" pageTitle="Incoming Shipments">
            <Head title="Incoming Shipments" />

            <div className="mx-auto max-w-7xl space-y-5" style={fontSyne}>
                <PageHeader icon={Inbox} title="Incoming shipments" subtitle="Parcels assigned to your company. Accept to schedule pickup, or reject with a reason." />

                {success && (
                    <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" /> {success}
                    </div>
                )}
                {error && !showRejectModal && (
                    <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        <AlertTriangle className="h-4 w-4" /> {error}
                    </div>
                )}

                {/* Summary (click to filter) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    {statTiles.map(({ key, label, hint, value, icon: Icon, tone }) => {
                        const on = filters.status === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleCardFilter(key)}
                                className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                                    on ? 'border-[#4B2E7E] ring-2 ring-[#4B2E7E]/15' : 'border-gray-100'
                                }`}
                            >
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                                <p className="mt-3 text-3xl font-bold tabular-nums text-[#1c1430]">{value}</p>
                                <p className="text-sm font-semibold text-gray-700">{label}</p>
                                <p className="text-xs text-gray-500">{hint}</p>
                            </button>
                        );
                    })}
                    <div className={`col-span-2 rounded-2xl border p-4 shadow-sm sm:p-5 lg:col-span-1 ${stats.expiring > 0 ? 'border-rose-200 bg-rose-50' : 'border-gray-100 bg-white'}`}>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                            <AlertTriangle className="h-5 w-5" />
                        </span>
                        <p className="mt-3 text-3xl font-bold tabular-nums text-[#1c1430]">{stats.expiring}</p>
                        <p className="text-sm font-semibold text-gray-700">Urgent</p>
                        <p className="text-xs text-gray-500">Expiring or overdue</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
                        <div className="relative sm:col-span-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by waybill or order #"
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className={`${field} pl-9`}
                            />
                        </div>
                        <select value={filters.seller || ''} onChange={(e) => handleFilterChange('seller', e.target.value)} className={field} aria-label="Seller">
                            <option value="">All sellers</option>
                            {sellers.map((seller) => (
                                <option key={seller.id} value={seller.id}>
                                    {seller.name}
                                </option>
                            ))}
                        </select>
                        <input type="text" placeholder="Destination" value={filters.destination || ''} onChange={(e) => handleFilterChange('destination', e.target.value)} className={field} />
                        <input type="date" aria-label="From date" value={filters.date_from || ''} onChange={(e) => handleFilterChange('date_from', e.target.value)} className={field} />
                        <input type="date" aria-label="To date" value={filters.date_to || ''} onChange={(e) => handleFilterChange('date_to', e.target.value)} className={field} />
                    </div>
                    <div className="flex justify-end border-t border-gray-100 px-4 py-2">
                        <button type="button" onClick={handleClearFilters} className="text-sm font-semibold text-gray-500 hover:text-[#4B2E7E]">
                            Clear filters
                        </button>
                    </div>
                </Card>

                {/* Shipments */}
                <Card>
                    {shipments.length === 0 ? (
                        <div className="py-14 text-center text-gray-400">
                            <PackageSearch className="mx-auto mb-3 h-10 w-10" />
                            <p className="text-sm font-medium text-gray-500">
                                {Object.values(filters).some((v) => v && v !== 'all') ? 'No results. Try clearing filters.' : 'No incoming shipments yet'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Phones: cards */}
                            <ul className="divide-y divide-gray-100 lg:hidden">
                                {shipments.map((shipment) => (
                                    <li key={shipment.id} className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-sm font-semibold text-gray-900">{shipment.waybill_number}</p>
                                                <p className="text-xs text-gray-500">
                                                    {shipment.order_number} · {shipment.assigned_date}
                                                </p>
                                            </div>
                                            {getStatusBadge(shipment.assignment_status, shipment.is_overdue, shipment.is_expiring_soon)}
                                        </div>
                                        <div className="space-y-1.5 text-sm">
                                            <p className="flex items-start gap-2 text-gray-700">
                                                <Store className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                                <span>
                                                    <span className="font-semibold text-gray-900">{shipment.seller_name}</span>
                                                    <span className="block text-xs text-gray-500">{shipment.pickup_address}</span>
                                                </span>
                                            </p>
                                            <p className="flex items-center gap-2 text-gray-700">
                                                <MapPin className="h-4 w-4 shrink-0 text-gray-400" /> {shipment.destination}
                                            </p>
                                            <p className="flex items-center gap-2 text-xs text-gray-500">
                                                <Package className="h-4 w-4 shrink-0 text-gray-400" />
                                                {typeof shipment.weight === 'number' ? `${shipment.weight} kg` : shipment.weight} · {shipment.dimensions}
                                            </p>
                                        </div>
                                        <TrackingLine tracking={shipment} />
                                        {rowActions(shipment, true)}
                                    </li>
                                ))}
                            </ul>

                            {/* Desktop: table */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#FAF8FD] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">Waybill / Order</th>
                                            <th className="px-5 py-3">Seller &amp; pickup</th>
                                            <th className="px-5 py-3">Destination</th>
                                            <th className="px-5 py-3">Parcel</th>
                                            <th className="px-5 py-3">Assigned</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {shipments.map((shipment) => (
                                            <tr key={shipment.id} className="align-top transition hover:bg-[#FAF8FD]">
                                                <td className="px-5 py-4">
                                                    <p className="font-mono font-semibold text-gray-900">{shipment.waybill_number}</p>
                                                    <p className="text-xs text-gray-500">{shipment.order_number}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">{shipment.seller_name}</p>
                                                    <p className="max-w-[220px] truncate text-xs text-gray-500" title={shipment.pickup_address}>
                                                        {shipment.pickup_address}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-gray-700">{shipment.destination}</td>
                                                <td className="px-5 py-4 text-gray-700">
                                                    <p>{typeof shipment.weight === 'number' ? `${shipment.weight} kg` : <span className="text-gray-400">{shipment.weight}</span>}</p>
                                                    <p className="text-xs text-gray-400">{shipment.dimensions}</p>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">{shipment.assigned_date}</td>
                                                <td className="px-5 py-4">
                                                    {getStatusBadge(shipment.assignment_status, shipment.is_overdue, shipment.is_expiring_soon)}
                                                    <TrackingLine tracking={shipment} className="mt-2 min-w-[200px]" />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end">{rowActions(shipment)}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pagination.last_page > 1 && (
                                <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
                                    <div className="text-sm text-gray-500">
                                        Showing {(pagination.current_page - 1) * pagination.per_page + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pagination.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`min-w-8 rounded-lg px-3 py-1 text-sm font-semibold ${
                                                    link.active ? 'bg-[#2B2249] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } disabled:cursor-not-allowed disabled:opacity-40`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {loading && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/40">
                        <Loader2 className="h-8 w-8 animate-spin text-[#4B2E7E]" />
                    </div>
                )}

                {/* Details drawer / modal */}
                {showDetailsModal && selectedShipment && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setShowDetailsModal(false)}>
                        <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-[#F6F4FA] shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="relative shrink-0 px-5 py-5 text-white sm:px-6" style={{ background: HERO_GRADIENT }}>
                                <button
                                    type="button"
                                    onClick={() => setShowDetailsModal(false)}
                                    aria-label="Close"
                                    className="absolute right-3 top-3 rounded-lg p-2 text-white/80 hover:bg-white/10"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Shipment details</p>
                                <h2 className="mt-1 font-mono text-xl font-bold">{selectedShipment.waybill_number}</h2>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-violet-100">
                                    <span>{selectedShipment.order_number}</span>
                                    <span className="rounded-full bg-white px-0.5">{getStatusBadge(selectedShipment.assignment_status, false, false)}</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                                <Section icon={ClipboardList} title="Order information">
                                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        <Info label="Assigned by">{selectedShipment.assigned_by}</Info>
                                        <Info label="Assigned at">{selectedShipment.assigned_at}</Info>
                                        <Info label="Deadline">{selectedShipment.acceptance_deadline}</Info>
                                        <Info label="Payment">{selectedShipment.payment_method ? prettyStatus(selectedShipment.payment_method) : '—'}</Info>
                                        <Info label="Items">{selectedShipment.items_count}</Info>
                                    </dl>
                                    <TrackingLine tracking={selectedShipment} className="mt-4" />
                                </Section>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {selectedShipment.seller && (
                                        <Section icon={Store} title="Seller & pickup">
                                            <dl className="space-y-3">
                                                <Info label="Name">{selectedShipment.seller.name}</Info>
                                                <Info label="Phone">{selectedShipment.seller.phone}</Info>
                                                <Info label="Email">{selectedShipment.seller.email}</Info>
                                                <Info label="Pickup address">
                                                    {selectedShipment.seller.address}, {selectedShipment.seller.city}, {selectedShipment.seller.province}
                                                </Info>
                                            </dl>
                                        </Section>
                                    )}
                                    <Section icon={MapPin} title="Destination">
                                        <dl className="grid grid-cols-2 gap-3">
                                            <Info label="City">{selectedShipment.buyer_destination.city}</Info>
                                            <Info label="Barangay">{selectedShipment.buyer_destination.barangay}</Info>
                                            <Info label="Province">{selectedShipment.buyer_destination.province}</Info>
                                            <Info label="Region">{selectedShipment.buyer_destination.region}</Info>
                                        </dl>
                                        <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-[#4B2E7E]">Full buyer details become available after acceptance.</p>
                                    </Section>
                                </div>

                                <Section icon={Package} title="Parcel">
                                    <dl className="grid grid-cols-3 gap-4">
                                        <Info label="Weight">
                                            {typeof selectedShipment.weight === 'number' ? `${selectedShipment.weight} kg` : <span className="text-gray-400">{selectedShipment.weight}</span>}
                                        </Info>
                                        <Info label="Dimensions">
                                            {selectedShipment.dimensions === 'Not provided' ? <span className="text-gray-400">{selectedShipment.dimensions}</span> : selectedShipment.dimensions}
                                        </Info>
                                        <Info label="Items">{selectedShipment.items_count}</Info>
                                    </dl>
                                    <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Pickup instructions</p>
                                        {selectedShipment.pickup_instructions}
                                    </div>
                                </Section>

                                {shipmentHistory.length > 0 && (
                                    <Section icon={History} title="Assignment history">
                                        <ol className="relative space-y-4 border-l-2 border-violet-100 pl-5">
                                            {shipmentHistory.map((entry, index) => (
                                                <li key={index} className="relative">
                                                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#4B2E7E] ring-2 ring-violet-100" />
                                                    <p className="text-sm font-semibold capitalize text-gray-900">{entry.action}</p>
                                                    <p className="text-xs text-gray-500">
                                                        by {entry.performed_by} · {entry.created_at}
                                                    </p>
                                                    {entry.notes && <p className="mt-1 text-xs italic text-gray-600">“{entry.notes}”</p>}
                                                </li>
                                            ))}
                                        </ol>
                                    </Section>
                                )}

                                {selectedShipment.assignment_status === 'rejected' && selectedShipment.rejection_reason && (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                        <p className="mb-1 text-sm font-bold text-rose-900">Rejection reason</p>
                                        <p className="text-sm text-rose-700">{selectedShipment.rejection_reason}</p>
                                    </div>
                                )}
                            </div>

                            {selectedShipment.assignment_status === 'pending' && (
                                <div className="flex shrink-0 gap-3 border-t border-gray-200 bg-white p-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={actionLoading}
                                        className="flex-1 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAccept(selectedShipment.id)}
                                        disabled={actionLoading}
                                        className="flex-[2] rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Processing…' : 'Accept assignment'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reject modal */}
                {showRejectModal && selectedShipment && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
                        <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h2 className="text-lg font-bold text-[#1c1430]">Reject assignment</h2>
                                <p className="font-mono text-xs text-gray-500">{selectedShipment.waybill_number}</p>
                            </div>

                            <div className="space-y-4 px-6 py-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Reason for rejection *</label>
                                    <select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className={field}>
                                        <option value="">Select a reason</option>
                                        {REJECTION_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {rejectionReason === 'Other (specify below)' && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Please specify (min 10 characters) *</label>
                                        <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} rows={4} className={field} placeholder="Enter your reason..." />
                                    </div>
                                )}

                                {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                            </div>

                            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setError('');
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRejectSubmit(selectedShipment.id)}
                                    disabled={actionLoading || !rejectionReason}
                                    className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing…' : 'Confirm rejection'}
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
