import { Head, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import CourierLayout from './CourierLayout';

interface Rider {
    id: number;
    rider_id: string;
    full_name: string;
    email: string;
    contact_number: string;
    assigned_branch: {
        id: number;
        name: string;
        code: string;
    } | null;
    vehicle_type: string;
    plate_number: string | null;
    employment_status: string;
    verification_status: string;
    is_available_for_delivery: boolean;
    service_areas: string[];
    region: string;
    province: string | null;
    municipality_city: string;
    barangay: string;
    street_address: string;
    postal_code: string | null;
    created_at: string;
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
    pendingApplications?: Rider[];
    allRiders?: Rider[];
    branches?: Array<{ id: number; name: string; code: string; type: string; city: string }>;
}

export default function RiderManagement({ auth, company, pendingApplications = [], allRiders = [], branches = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
    const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [approveError, setApproveError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Server flashes { success } or { error } and redirects back (Inertia).
    const readFlash = (flash: unknown): { success?: string; error?: string } =>
        (flash && typeof flash === 'object' ? flash : {}) as { success?: string; error?: string };
    const firstError = (errors: Record<string, string>, fallback: string) =>
        Object.values(errors)[0] || fallback;

    const handleApprove = (riderId: number) => {
        const rider = pendingApplications.find(r => r.id === riderId);
        if (rider) {
            setSelectedRider(rider);
            setSelectedBranch('');
            setApproveError(null);
            setShowApproveModal(true);
        }
    };

    const confirmApproval = () => {
        if (!selectedBranch) {
            return; // Disabled button prevents this, but just in case
        }

        if (selectedRider) {
            router.post(`/api/courier/riders/${selectedRider.id}/approve`, 
                { assigned_branch_id: selectedBranch }, 
                {
                    preserveScroll: true,
                    onStart: () => {
                        setProcessing(true);
                        setApproveError(null);
                    },
                    onFinish: () => setProcessing(false),
                    onSuccess: (page) => {
                        const flash = readFlash(page.flash);
                        if (flash.error) {
                            // e.g. email already used by another account: keep the modal open.
                            setApproveError(flash.error);
                            return;
                        }
                        setShowApproveModal(false);
                        setSelectedRider(null);
                        setSelectedBranch('');
                        setNotice({ type: 'success', text: flash.success || 'Rider application approved.' });
                    },
                    onError: (errors) => {
                        setApproveError(firstError(errors, 'Failed to approve rider. Please try again.'));
                    },
                }
            );
        }
    };

    const handleReject = (riderId: number) => {
        const reason = prompt('Please provide a reason for rejection (at least 10 characters):');
        if (reason) {
            router.post(`/api/courier/riders/${riderId}/reject`, { reason }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = readFlash(page.flash);
                    setNotice(flash.error
                        ? { type: 'error', text: flash.error }
                        : { type: 'success', text: flash.success || 'Rider application rejected.' });
                },
                onError: (errors) => {
                    setNotice({ type: 'error', text: firstError(errors, 'Failed to reject rider. Please try again.') });
                },
            });
        }
    };

    const handleViewDetails = (rider: Rider) => {
        setSelectedRider(rider);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 'approved':
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getEmploymentBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
            case 'inactive':
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
            case 'suspended':
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Suspended</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <CourierLayout auth={auth} company={company} activeTab="rider-management" pageTitle="Rider Management">
            <Head title="Rider Management" />

            {notice && (
                <div
                    role={notice.type === 'error' ? 'alert' : 'status'}
                    className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                        notice.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                >
                    <span>{notice.text}</span>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        className="shrink-0 font-medium opacity-70 hover:opacity-100"
                        aria-label="Dismiss message"
                    >
                        ✕
                    </button>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rider Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage rider applications and assignments</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                            {pendingApplications.length} pending applications
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-t-xl border border-gray-200 border-b-0">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                                activeTab === 'pending'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Pending Applications
                            {pendingApplications.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600">
                                    {pendingApplications.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                                activeTab === 'all'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            All Riders
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                {allRiders.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-b-xl border border-gray-200">
                    {/* Pending Applications Tab */}
                    {activeTab === 'pending' && (
                        <div className="p-6">
                            {pendingApplications.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No pending applications</h3>
                                    <p className="text-sm text-gray-500">New rider applications will appear here for review</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Applicant</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Branch</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Applied</th>
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApplications.map((rider) => (
                                                <tr key={rider.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-4 px-4">
                                                        <div className="font-medium text-gray-900">{rider.full_name}</div>
                                                        <div className="text-sm text-gray-500">{rider.email}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-900">{rider.contact_number}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-900">
                                                            {rider.assigned_branch ? rider.assigned_branch.name : (
                                                                <span className="text-gray-400 italic">Not Assigned</span>
                                                            )}
                                                        </div>
                                                        {rider.assigned_branch && (
                                                            <div className="text-xs text-gray-500">{rider.assigned_branch.code}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-900 capitalize">{rider.vehicle_type}</div>
                                                        {rider.plate_number && (
                                                            <div className="text-xs text-gray-500">{rider.plate_number}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-600">
                                                            {new Date(rider.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleViewDetails(rider)}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(rider.id)}
                                                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(rider.id)}
                                                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Riders Tab */}
                    {activeTab === 'all' && (
                        <div className="p-6">
                            {allRiders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                            <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No riders yet</h3>
                                    <p className="text-sm text-gray-500">Approved riders will appear here</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Rider</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Rider ID</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Branch</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Availability</th>
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allRiders.map((rider) => (
                                                <tr key={rider.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-4 px-4">
                                                        <div className="font-medium text-gray-900">{rider.full_name}</div>
                                                        <div className="text-sm text-gray-500">{rider.email}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm font-mono text-gray-900">{rider.rider_id}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-900">{rider.contact_number}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-900">{rider.assigned_branch.name}</div>
                                                        <div className="text-xs text-gray-500">{rider.assigned_branch.code}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm text-gray-900 capitalize">{rider.vehicle_type}</div>
                                                        {rider.plate_number && (
                                                            <div className="text-xs text-gray-500">{rider.plate_number}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        {getEmploymentBadge(rider.employment_status)}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        {rider.is_available_for_delivery ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                                Available
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                                Offline
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleViewDetails(rider)}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                                            >
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedRider && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Rider Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Full Name</div>
                                        <div className="font-medium text-gray-900">{selectedRider.full_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Rider ID</div>
                                        <div className="font-mono text-gray-900">{selectedRider.rider_id}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Email</div>
                                        <div className="text-gray-900">{selectedRider.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Contact Number</div>
                                        <div className="text-gray-900">{selectedRider.contact_number}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Branch Assignment */}
                            {selectedRider.assigned_branch ? (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Branch Assignment</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Assigned Branch</div>
                                            <div className="font-medium text-gray-900">{selectedRider.assigned_branch.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Branch Code</div>
                                            <div className="font-mono text-gray-900">{selectedRider.assigned_branch.code}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Employment Status</div>
                                            <div>{getEmploymentBadge(selectedRider.employment_status)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Verification Status</div>
                                            <div>{getStatusBadge(selectedRider.verification_status)}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Application Status</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Assigned Branch</div>
                                            <div className="font-medium text-gray-500 italic">Not yet assigned</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Verification Status</div>
                                            <div>{getStatusBadge(selectedRider.verification_status)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Information */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Vehicle Type</div>
                                        <div className="text-gray-900 capitalize">{selectedRider.vehicle_type}</div>
                                    </div>
                                    {selectedRider.plate_number && (
                                        <div>
                                            <div className="text-gray-600">Plate Number</div>
                                            <div className="font-mono text-gray-900">{selectedRider.plate_number}</div>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <div className="text-gray-600 mb-2">Service Areas</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRider.service_areas.map((area, idx) => (
                                                <span key={idx} className="px-2.5 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Address</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Street Address</div>
                                        <div className="text-gray-900">{selectedRider.street_address}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Barangay</div>
                                        <div className="text-gray-900">{selectedRider.barangay}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">City/Municipality</div>
                                        <div className="text-gray-900">{selectedRider.municipality_city}</div>
                                    </div>
                                    {selectedRider.province && (
                                        <div>
                                            <div className="text-gray-600">Province</div>
                                            <div className="text-gray-900">{selectedRider.province}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-gray-600">Region</div>
                                        <div className="text-gray-900">{selectedRider.region}</div>
                                    </div>
                                    {selectedRider.postal_code && (
                                        <div>
                                            <div className="text-gray-600">Postal Code</div>
                                            <div className="font-mono text-gray-900">{selectedRider.postal_code}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedRider.verification_status === 'pending' && (
                            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleReject(selectedRider.id);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleApprove(selectedRider.id);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                >
                                    Approve Application
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Approval Modal with Branch Selection */}
            {showApproveModal && selectedRider && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-lg font-bold text-gray-900">Approve Rider & Assign Branch</h2>
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedRider(null);
                                    setSelectedBranch('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Approving: <span className="font-semibold text-gray-900">{selectedRider.full_name}</span>
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                                    <p className="font-semibold mb-1">📍 Service Areas:</p>
                                    <p>{selectedRider.service_areas.join(', ')}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                    Assign to Branch <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                                >
                                    <option value="">Select branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name} ({branch.code})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Choose a branch based on the rider's service areas</p>
                                {branches.length === 0 && (
                                    <p className="text-xs text-amber-700 mt-1">
                                        Your company has no active branch yet. Add one in Branch &amp; Facility before approving riders.
                                    </p>
                                )}
                            </div>

                            {approveError && (
                                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                    {approveError}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedRider(null);
                                    setSelectedBranch('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproval}
                                disabled={!selectedBranch || processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Approve & Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CourierLayout>
    );
}

RiderManagement.layout = (page: ReactNode) => page;
