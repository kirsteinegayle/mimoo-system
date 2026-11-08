import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Application {
    id: number;
    status: string;
    submitted_at: string;
    updated_at: string;
    approved_at: string | null;
    
    // Step 1
    company_name: string | null;
    trade_name: string | null;
    business_registration_number: string | null;
    business_address: string | null;
    business_email: string | null;
    company_contact_number: string | null;
    company_website: string | null;
    company_logo: string | null;
    
    // Step 2
    rep_full_name: string;
    rep_first_name: string;
    rep_last_name: string;
    rep_position: string | null;
    rep_email: string;
    rep_contact_number: string;
    rep_sex: string | null;
    rep_birthday: string | null;
    
    // Step 3
    dti_sec_certificate: string | null;
    mayors_permit: string | null;
    operating_permits: string | null;
    rep_valid_id: string | null;
    proof_of_address: string | null;
    
    // Step 4
    regions_served: string[];
    provinces_served: string[];
    cities_served: string[];
    service_areas_raw: string[];
    delivery_services: string[] | null;
    pickup_available: string | null;
    estimated_delivery_time: string | null;
    
    region: string;
    province: string | null;
    municipality_city: string;
    barangay: string;
    postal_code: string | null;
    
    privacy_policy_accepted: boolean;
    verification_status: string;
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
    application: Application;
}

const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    
    const color = colors[status as keyof typeof colors] || colors.pending;
    
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${color} capitalize`}>
            {status}
        </span>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-0">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900 md:col-span-2">
            {value || <span className="text-gray-400 italic">Not provided</span>}
        </dd>
    </div>
);

const FileField = ({ label, path }: { label: string; path: string | null }) => {
    if (!path) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-0">
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-400 italic md:col-span-2">No file uploaded</dd>
            </div>
        );
    }
    
    const fileName = path.split('/').pop() || 'document';
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const isPdf = fileExt === 'pdf';
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 md:col-span-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{fileName}</span>
                    </div>
                    <a 
                        href={`/storage/${path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                        View / Download
                    </a>
                </div>
            </dd>
        </div>
    );
};

const ChipList = ({ items, emptyMessage }: { items: string[]; emptyMessage?: string }) => {
    const [showAll, setShowAll] = useState(false);
    
    if (!items || items.length === 0) {
        return <span className="text-gray-400 italic">{emptyMessage || 'Not provided'}</span>;
    }
    
    const displayItems = showAll ? items : items.slice(0, 10);
    const hasMore = items.length > 10;
    
    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {displayItems.map((item, index) => (
                    <span 
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                        {item}
                    </span>
                ))}
            </div>
            {hasMore && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                    Show all ({items.length})
                </button>
            )}
            {showAll && hasMore && (
                <button
                    onClick={() => setShowAll(false)}
                    className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                    Show less
                </button>
            )}
        </div>
    );
};

export default function CourierApplicationDetail({ auth, application }: Props) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    
    // Parse delivery services - handle both array (new format) and string (legacy format)
    const deliveryServicesList = Array.isArray(application.delivery_services)
        ? application.delivery_services
        : application.delivery_services 
            ? application.delivery_services.split(',').map(s => s.trim()).filter(Boolean)
            : [];
    
    const handleApprove = async () => {
        if (!confirm(`Are you sure you want to APPROVE ${application.company_name}?\n\nThis will give them access to the courier dashboard.`)) {
            return;
        }
        
        setIsApproving(true);
        
        try {
            const response = await fetch(`/api/logistics/courier-applications/${application.id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('✅ Courier application approved successfully!');
                router.visit('/logistics/courier-applications');
            } else {
                alert('❌ ' + (data.error || 'Failed to approve application'));
            }
        } catch (error) {
            console.error('Error approving courier:', error);
            alert('❌ Network error. Please try again.');
        } finally {
            setIsApproving(false);
        }
    };
    
    const handleReject = async () => {
        const reason = prompt(`Enter rejection reason for ${application.company_name}:\n\n(This will be sent to them via email)`);
        
        if (reason === null) {
            return; // User cancelled
        }
        
        if (!reason.trim()) {
            alert('Please enter a rejection reason.');
            return;
        }
        
        setIsRejecting(true);
        
        try {
            const response = await fetch(`/api/logistics/courier-applications/${application.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ reason: reason.trim() }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('✅ Courier application rejected.');
                router.visit('/logistics/courier-applications');
            } else {
                alert('❌ ' + (data.error || 'Failed to reject application'));
            }
        } catch (error) {
            console.error('Error rejecting courier:', error);
            alert('❌ Network error. Please try again.');
        } finally {
            setIsRejecting(false);
        }
    };
    
    return (
        <>
            <Head title={`${application.company_name} - Courier Application`} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/logistics/courier-applications"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {application.company_name || 'Courier Application'}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Application #{application.id} • Submitted {application.submitted_at}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={application.status} />
                                
                                {application.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={handleReject}
                                            disabled={isRejecting || isApproving}
                                            className="px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isRejecting ? 'Rejecting...' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            disabled={isApproving || isRejecting}
                                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isApproving ? 'Approving...' : 'Approve'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        
                        {/* Application Info */}
                        <Section title="Application Information">
                            <dl className="divide-y divide-gray-100">
                                <Field label="Application ID" value={`#${application.id}`} />
                                <Field label="Status" value={application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : null} />
                                <Field label="Submitted" value={application.submitted_at} />
                                <Field label="Last Updated" value={application.updated_at} />
                                {application.approved_at && (
                                    <Field label="Approved" value={application.approved_at} />
                                )}
                                <Field label="Email Verification" value={application.verification_status ? application.verification_status.charAt(0).toUpperCase() + application.verification_status.slice(1) : null} />
                            </dl>
                        </Section>
                        
                        {/* Step 1: Company Information */}
                        <Section title="Company Information">
                            <dl className="divide-y divide-gray-100">
                                <Field label="Company Name" value={application.company_name} />
                                <Field label="Trade Name" value={application.trade_name} />
                                <Field label="Registration Number" value={application.business_registration_number} />
                                <Field label="Business Address" value={application.business_address} />
                                <Field label="Business Email" value={application.business_email} />
                                <Field label="Contact Number" value={application.company_contact_number} />
                                <Field label="Website" value={application.company_website} />
                                {application.company_logo && (
                                    <FileField label="Company Logo" path={application.company_logo} />
                                )}
                            </dl>
                        </Section>
                        
                        {/* Step 2: Authorized Representative */}
                        <Section title="Authorized Representative">
                            <dl className="divide-y divide-gray-100">
                                <Field label="Full Name" value={application.rep_full_name} />
                                <Field label="Position / Designation" value={application.rep_position} />
                                <Field label="Email Address" value={application.rep_email} />
                                <Field label="Contact Number" value={application.rep_contact_number} />
                                <Field label="Sex" value={application.rep_sex ? application.rep_sex.charAt(0).toUpperCase() + application.rep_sex.slice(1) : null} />
                                <Field label="Birthday" value={application.rep_birthday} />
                            </dl>
                        </Section>
                        
                        {/* Step 3: Business Documents */}
                        <Section title="Business Documents">
                            <dl className="divide-y divide-gray-100">
                                <FileField label="DTI/SEC Certificate" path={application.dti_sec_certificate} />
                                <FileField label="Mayor's Permit" path={application.mayors_permit} />
                                <FileField label="Operating Permits" path={application.operating_permits} />
                                <FileField label="Representative Valid ID" path={application.rep_valid_id} />
                                <FileField label="Proof of Address" path={application.proof_of_address} />
                            </dl>
                        </Section>
                        
                        {/* Step 4: Service Coverage */}
                        <Section title="Service Coverage and Operations">
                            <dl className="divide-y divide-gray-100">
                                <div className="py-3 border-b border-gray-100">
                                    <dt className="text-sm font-medium text-gray-500 mb-2">Regions Served</dt>
                                    <dd className="text-sm text-gray-900">
                                        <ChipList items={application.regions_served} emptyMessage="No regions specified" />
                                    </dd>
                                </div>
                                <div className="py-3 border-b border-gray-100">
                                    <dt className="text-sm font-medium text-gray-500 mb-2">Provinces Served</dt>
                                    <dd className="text-sm text-gray-900">
                                        <ChipList items={application.provinces_served} emptyMessage="No provinces specified" />
                                    </dd>
                                </div>
                                <div className="py-3 border-b border-gray-100">
                                    <dt className="text-sm font-medium text-gray-500 mb-2">Cities / Municipalities Served</dt>
                                    <dd className="text-sm text-gray-900">
                                        <ChipList items={application.cities_served} emptyMessage="No cities specified" />
                                    </dd>
                                </div>
                                <div className="py-3 border-b border-gray-100">
                                    <dt className="text-sm font-medium text-gray-500 mb-2">Available Delivery Services</dt>
                                    <dd className="text-sm text-gray-900">
                                        <ChipList items={deliveryServicesList} emptyMessage="No delivery services specified" />
                                    </dd>
                                </div>
                                <Field 
                                    label="Pickup Availability" 
                                    value={
                                        application.pickup_available === 'yes' ? 'Yes, we offer pickup' :
                                        application.pickup_available === 'no' ? 'No, drop-off only' :
                                        application.pickup_available === 'selected_areas' ? 'Selected areas only' :
                                        application.pickup_available
                                    } 
                                />
                                <Field label="Estimated Delivery Time" value={application.estimated_delivery_time} />
                            </dl>
                        </Section>
                        
                        {/* Address Details */}
                        <Section title="Additional Address Details">
                            <dl className="divide-y divide-gray-100">
                                <Field label="Region" value={application.region} />
                                <Field label="Province" value={application.province} />
                                <Field label="Municipality/City" value={application.municipality_city} />
                                <Field label="Barangay" value={application.barangay} />
                                <Field label="Postal Code" value={application.postal_code} />
                            </dl>
                        </Section>
                        
                    </div>
                </div>
            </div>
        </>
    );
}
