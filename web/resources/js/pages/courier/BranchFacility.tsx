import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState, useEffect, useRef } from 'react';
import * as psgcApi from '../../services/psgcApi';
import CustomSelect from '../../components/CustomSelect';
import CustomMultiSelect from '../../components/CustomMultiSelect';

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
        service_areas?: string[];
    };
    facilities: Facility[];
}

interface Facility {
    id: number;
    facility_name: string;
    facility_code: string;
    facility_type: 'Main Hub' | 'Sorting Hub' | 'Branch';
    parent_facility: string | null;
    status: 'Active' | 'Inactive';
    region: string;
    province: string;
    city: string;
    address: string;
    manager: string;
    contact: string;
    coverage: string[];
}

export default function BranchFacility({ auth, company, facilities: initialFacilities }: Props) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [selectedFacilityForManagement, setSelectedFacilityForManagement] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'received' | 'archived'>('received');
    const [receivedParcels, setReceivedParcels] = useState<any[]>([]);
    const [archivedParcels, setArchivedParcels] = useState<any[]>([]);
    const [loadingParcels, setLoadingParcels] = useState(false);

    // PSGC API State
    const [psgcRegions, setPsgcRegions] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcProvinces, setPsgcProvinces] = useState<Array<{ name: string; code: string }>>([]);
    const [psgcCities, setPsgcCities] = useState<Array<{ name: string; code: string }>>([]);
    const [regionsLoading, setRegionsLoading] = useState(false);
    const [provincesLoading, setProvincesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const regionNameToCodeMap = useRef(new Map<string, string>());
    const provinceNameToCodeMap = useRef(new Map<string, string>());

    // Use facilities from props
    const facilities = initialFacilities || [];

    // Form state
    const [formData, setFormData] = useState({
        facility_name: '',
        facility_type: 'Branch' as 'Main Hub' | 'Sorting Hub' | 'Branch',
        parent_facility: '',
        status: 'Active' as 'Active' | 'Inactive',
        region: '',
        province: '',
        city: '',
        address: '',
        manager: '',
        contact: '',
        coverage: [] as string[]
    });

    // Generate branches form state
    const [generateForm, setGenerateForm] = useState({
        selectedCities: [] as string[],
        parentFacility: '',
        region: '',
        province: ''
    });

    // Load regions when modal opens
    useEffect(() => {
        if ((showAddModal || showEditModal || showGenerateModal) && psgcRegions.length === 0 && !regionsLoading) {
            setRegionsLoading(true);
            psgcApi.fetchRegions().then(({ data }) => {
                setPsgcRegions(data);
                data.forEach(r => regionNameToCodeMap.current.set(r.name, r.code));
                setRegionsLoading(false);
            });
        }
    }, [showAddModal, showEditModal, showGenerateModal]);

    // Load provinces when region is selected
    useEffect(() => {
        if ((showAddModal || showEditModal || showGenerateModal) && (formData.region || generateForm.region)) {
            const regionToUse = showGenerateModal ? generateForm.region : formData.region;
            const regionCode = regionNameToCodeMap.current.get(regionToUse);
            
            if (regionCode) {
                setProvincesLoading(true);
                setPsgcProvinces([]);
                setPsgcCities([]);
                
                Promise.all([
                    psgcApi.fetchProvinces([regionCode]),
                    psgcApi.fetchCitiesByRegion([regionCode])
                ]).then(([provincesResult, citiesResult]) => {
                    setPsgcProvinces(provincesResult.data);
                    provincesResult.data.forEach(p => provinceNameToCodeMap.current.set(p.name, p.code));
                    
                    // If no provinces (like NCR), show cities directly
                    if (provincesResult.data.length === 0) {
                        setPsgcCities(citiesResult.data);
                    }
                    
                    setProvincesLoading(false);
                });
            }
        }
    }, [showAddModal, showEditModal, showGenerateModal, formData.region, generateForm.region]);

    // Load cities when province is selected
    useEffect(() => {
        if ((showAddModal || showEditModal || showGenerateModal) && (formData.province || generateForm.province)) {
            const provinceToUse = showGenerateModal ? generateForm.province : formData.province;
            const provinceCode = provinceNameToCodeMap.current.get(provinceToUse);
            
            if (provinceCode) {
                setCitiesLoading(true);
                setPsgcCities([]);
                
                psgcApi.fetchCitiesByProvince([provinceCode]).then(({ data }) => {
                    setPsgcCities(data);
                    setCitiesLoading(false);
                });
            }
        }
    }, [showAddModal, showEditModal, showGenerateModal, formData.province, generateForm.province]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleAddFacility = () => {
        // Reset form
        setFormData({
            facility_name: '',
            facility_type: 'Branch',
            parent_facility: '',
            status: 'Active',
            region: '',
            province: '',
            city: '',
            address: '',
            manager: '',
            contact: '',
            coverage: []
        });
        setShowAddModal(true);
    };

    const handleEditFacility = (facility: Facility) => {
        setSelectedFacility(facility);
        setFormData({
            facility_name: facility.facility_name,
            facility_type: facility.facility_type,
            parent_facility: facility.parent_facility || '',
            status: facility.status,
            region: facility.region,
            province: facility.province,
            city: facility.city,
            address: facility.address,
            manager: facility.manager,
            contact: facility.contact,
            coverage: facility.coverage
        });
        setShowEditModal(true);
    };

    const handleDeleteFacility = (facility: Facility) => {
        setSelectedFacility(facility);
        setShowDeleteModal(true);
    };

    const handleSaveFacility = () => {
        // Find parent facility ID if parent is selected
        const parentFacilityId = formData.parent_facility 
            ? facilities.find(f => f.facility_name === formData.parent_facility)?.id 
            : null;

        router.post('/courier/branch-facility', {
            facility_name: formData.facility_name,
            facility_type: formData.facility_type,
            parent_facility_id: parentFacilityId,
            status: formData.status,
            region: formData.region,
            province: formData.province || null,
            city: formData.city,
            address: formData.address,
            manager_name: formData.manager,
            contact_number: formData.contact,
            coverage_cities: formData.coverage,
        }, {
            onSuccess: () => {
                setShowAddModal(false);
                setFormData({
                    facility_name: '',
                    facility_type: 'Branch',
                    parent_facility: '',
                    status: 'Active',
                    region: '',
                    province: '',
                    city: '',
                    address: '',
                    manager: '',
                    contact: '',
                    coverage: []
                });
            }
        });
    };

    const handleUpdateFacility = () => {
        if (!selectedFacility) return;

        const parentFacilityId = formData.parent_facility 
            ? facilities.find(f => f.facility_name === formData.parent_facility)?.id 
            : null;

        router.put(`/courier/branch-facility/${selectedFacility.id}`, {
            facility_name: formData.facility_name,
            facility_type: formData.facility_type,
            parent_facility_id: parentFacilityId,
            status: formData.status,
            region: formData.region,
            province: formData.province || null,
            city: formData.city,
            address: formData.address,
            manager_name: formData.manager,
            contact_number: formData.contact,
            coverage_cities: formData.coverage,
        }, {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedFacility(null);
            }
        });
    };

    const confirmDelete = () => {
        if (!selectedFacility) return;

        router.delete(`/courier/branch-facility/${selectedFacility.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedFacility(null);
            }
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCoverageAdd = (city: string) => {
        if (city && !formData.coverage.includes(city)) {
            setFormData(prev => ({ ...prev, coverage: [...prev.coverage, city] }));
        }
    };

    const handleCoverageRemove = (city: string) => {
        setFormData(prev => ({ 
            ...prev, 
            coverage: prev.coverage.filter(c => c !== city) 
        }));
    };

    const handleGenerateBranches = () => {
        if (generateForm.selectedCities.length === 0) {
            alert('Please select at least one city');
            return;
        }

        if (!generateForm.parentFacility) {
            alert('Please select a parent facility');
            return;
        }

        if (!generateForm.region) {
            alert('Please select a region');
            return;
        }

        const parentFacilityId = facilities.find(f => f.facility_name === generateForm.parentFacility)?.id;

        router.post('/courier/branch-facility/generate', {
            cities: generateForm.selectedCities,
            parent_facility_id: parentFacilityId,
            region: generateForm.region,
            province: generateForm.province || null,
        }, {
            onSuccess: () => {
                setShowGenerateModal(false);
                setGenerateForm({
                    selectedCities: [],
                    parentFacility: '',
                    region: '',
                    province: ''
                });
            }
        });
    };

    const handleToggleCitySelection = (city: string) => {
        setGenerateForm(prev => ({
            ...prev,
            selectedCities: prev.selectedCities.includes(city)
                ? prev.selectedCities.filter(c => c !== city)
                : [...prev.selectedCities, city]
        }));
    };

    const handleSelectAllCities = () => {
        const availableCities = (company.service_areas || []).filter(
            city => !facilities.some(f => f.city === city)
        );
        setGenerateForm(prev => ({
            ...prev,
            selectedCities: availableCities
        }));
    };

    const handleDeselectAllCities = () => {
        setGenerateForm(prev => ({
            ...prev,
            selectedCities: []
        }));
    };

    // Filter facilities
    const filteredFacilities = facilities.filter(facility => {
        const matchesSearch = facility.facility_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            facility.facility_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            facility.city.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = filterType === 'all' || facility.facility_type === filterType;
        const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    const selectedFacilityData = selectedFacilityForManagement 
        ? facilities.find(f => f.id === selectedFacilityForManagement) 
        : null;

    // Load parcels when facility is selected
    useEffect(() => {
        if (selectedFacilityForManagement) {
            loadParcels();
        }
    }, [selectedFacilityForManagement, activeTab]);

    const loadParcels = async () => {
        if (!selectedFacilityForManagement) return;
        
        setLoadingParcels(true);
        
        try {
            const endpoint = activeTab === 'received' 
                ? `/api/courier/facility/${selectedFacilityForManagement}/received-parcels`
                : `/api/courier/facility/${selectedFacilityForManagement}/archived-parcels`;
            
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (activeTab === 'received') {
                setReceivedParcels(data);
            } else {
                setArchivedParcels(data);
            }
        } catch (error) {
            console.error('Error loading parcels:', error);
        } finally {
            setLoadingParcels(false);
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid', href: '/courier/dashboard' },
        { id: 'incoming-shipments', label: 'Incoming Shipments', icon: 'inbox', href: '/courier/incoming-shipments' },
        { id: 'parcel-scanning', label: 'Parcel Scanning', icon: 'scan', href: '/courier/parcel-scanning' },
        { id: 'sorting-transfers', label: 'Sorting & Transfers', icon: 'sort', href: '/courier/sorting-transfers' },
        { id: 'branch-facility', label: 'Branch & Facility', icon: 'building', href: '/courier/branch-facility' },
        { id: 'rider-management', label: 'Rider Management', icon: 'bike', href: '/courier/rider-management' },
        { id: 'delivery-management', label: 'Delivery Management', icon: 'truck', href: '/courier/delivery-management' },
        { id: 'cod-remittance', label: 'COD & Remittance', icon: 'chart-bar', href: '/courier/cod-remittance' },
        { id: 'reports', label: 'Reports', icon: 'chart', href: '/courier/reports' },
        { id: 'support', label: 'Support', icon: 'headset', href: '/courier/support' },
        { id: 'messages', label: 'Messages', icon: 'message', href: '/courier/messages' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'grid':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
            case 'inbox':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
            case 'calendar':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
            case 'scan':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="12" y1="8" x2="12" y2="16"/></svg>;
            case 'sort':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M10 18h4"/></svg>;
            case 'building':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>;
            case 'bike':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>;
            case 'truck':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
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

    const getStatusColor = (status: string) => {
        return status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Main Hub':
                return 'bg-purple-100 text-purple-700';
            case 'Sorting Hub':
                return 'bg-blue-100 text-blue-700';
            case 'Branch':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
            <Head title="Branch & Facility Management" />
            
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="flex h-screen bg-gray-50" style={fontSyne}>
                {/* Sidebar */}
                <aside className="w-64 bg-[#2B2249] text-white flex-shrink-0 hidden lg:block overflow-y-auto scrollbar-hide">
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
                                        item.id === 'branch-facility'
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
                            href="/courier/settings"
                            className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-300 hover:bg-[#2E2240]/50 hover:text-white transition"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6"/>
                                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
                                <path d="m19.07 4.93-4.24 4.24m-5.66 5.66-4.24 4.24"/>
                            </svg>
                            Company Settings
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    {/* Top Bar */}
                    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <h1 className="text-base font-bold text-gray-900">
                                    {company.name}
                                </h1>
                                <span className="text-sm text-gray-400">/</span>
                                <h2 className="text-base font-semibold text-gray-900">Branch & Facility</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"/>
                                        <path d="M12 1v6m0 6v6"/>
                                    </svg>
                                </button>
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
                                                href="/courier/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="3"/>
                                                        <path d="M12 1v6m0 6v6"/>
                                                    </svg>
                                                    Settings
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
                            {/* Facility Selection Banner - NEW */}
                            {!selectedFacilityForManagement && (
                                <>
                                    {/* Header Actions */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900" style={fontSyncopate}>
                                                Branch & Facility Management
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Manage your courier branches, hubs, and facilities
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowGenerateModal(true)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#3B1F6B] text-[#3B1F6B] rounded-lg font-semibold hover:bg-[#F1EDFB] transition"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                                    <polyline points="3.29 7 12 12 20.71 7"/>
                                                    <line x1="12" y1="22" x2="12" y2="12"/>
                                                </svg>
                                                Auto-Generate Branches
                                            </button>
                                            <button
                                                onClick={handleAddFacility}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2E1850] transition"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                                </svg>
                                                Add Facility
                                            </button>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex-1 min-w-[300px]">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, code, or city..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
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
                                                </div>
                                            </div>
                                            <div>
                                                <select
                                                    value={filterType}
                                                    onChange={(e) => setFilterType(e.target.value)}
                                                    className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                                >
                                                    <option value="all">All Types</option>
                                                    <option value="Main Hub">Main Hub</option>
                                                    <option value="Sorting Hub">Sorting Hub</option>
                                                    <option value="Branch">Branch</option>
                                                </select>
                                            </div>
                                            <div>
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                                >
                                                    <option value="all">All Status</option>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facilities Table */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Facility
                                                        </th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Location
                                                        </th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Manager
                                                        </th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Coverage
                                                        </th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {filteredFacilities.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                                <div className="text-gray-400">
                                                                    <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <rect x="4" y="2" width="16" height="20" rx="2"/>
                                                                        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
                                                                    </svg>
                                                                    <p className="text-sm font-medium text-gray-900">No facilities found</p>
                                                                    <p className="text-xs mt-1 text-gray-500">Try adjusting your filters or add a new facility</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredFacilities.map((facility) => (
                                                            <tr key={facility.id} className="hover:bg-gray-50 transition">
                                                                <td className="px-6 py-4">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900">
                                                                            {facility.facility_name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {facility.facility_code}
                                                                        </div>
                                                                        {facility.parent_facility && (
                                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                                Under: {facility.parent_facility}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeColor(facility.facility_type)}`}>
                                                                        {facility.facility_type}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="text-sm text-gray-900">
                                                                        {facility.city}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {facility.region}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="text-sm text-gray-900">
                                                                        {facility.manager}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {facility.contact}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="text-sm text-gray-900">
                                                                        {facility.coverage.length} cities
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {facility.coverage.slice(0, 2).join(', ')}
                                                                        {facility.coverage.length > 2 && ` +${facility.coverage.length - 2}`}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(facility.status)}`}>
                                                                        {facility.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => setSelectedFacilityForManagement(facility.id)}
                                                                            className="p-1.5 text-gray-600 hover:text-[#3B1F6B] hover:bg-gray-100 rounded transition"
                                                                            title="Manage"
                                                                        >
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M12 2v6m0 6v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m6 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"/>
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleEditFacility(facility)}
                                                                            className="p-1.5 text-gray-600 hover:text-[#3B1F6B] hover:bg-gray-100 rounded transition"
                                                                            title="Edit"
                                                                        >
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteFacility(facility)}
                                                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                                            title="Delete"
                                                                        >
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <polyline points="3 6 5 6 21 6"/>
                                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Facility Management View - NEW */}
                            {selectedFacilityForManagement && selectedFacilityData && (
                                <>
                                    {/* Facility Header */}
                                    <div className="bg-gradient-to-r from-[#3B1F6B] to-[#5B3A8F] rounded-2xl p-6 text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setSelectedFacilityForManagement(null)}
                                                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="19" y1="12" x2="5" y2="12"/>
                                                        <polyline points="12 19 5 12 12 5"/>
                                                    </svg>
                                                </button>
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="4" y="2" width="16" height="20" rx="2"/>
                                                        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium opacity-90">Managing Facility</div>
                                                    <div className="text-2xl font-bold mt-1" style={fontSyncopate}>
                                                        {selectedFacilityData.facility_code} | {selectedFacilityData.facility_name}
                                                    </div>
                                                    <div className="text-sm opacity-75 mt-1">
                                                        {selectedFacilityData.facility_type} • {selectedFacilityData.city}, {selectedFacilityData.region}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-lg font-semibold ${
                                                    selectedFacilityData.status === 'Active' 
                                                        ? 'bg-green-500/20 text-green-100' 
                                                        : 'bg-gray-500/20 text-gray-100'
                                                }`}>
                                                    {selectedFacilityData.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facility Management Tabs/Content */}
                                    <div className="bg-white rounded-xl border border-gray-200">
                                        {/* Tabs */}
                                        <div className="border-b border-gray-200">
                                            <div className="flex gap-4 px-6">
                                                <button
                                                    onClick={() => setActiveTab('received')}
                                                    className={`py-4 px-4 font-semibold text-sm transition border-b-2 ${
                                                        activeTab === 'received'
                                                            ? 'border-[#3B1F6B] text-[#3B1F6B]'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    Received Parcels ({receivedParcels.length})
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('archived')}
                                                    className={`py-4 px-4 font-semibold text-sm transition border-b-2 ${
                                                        activeTab === 'archived'
                                                            ? 'border-[#3B1F6B] text-[#3B1F6B]'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    Archived Parcels ({archivedParcels.length})
                                                </button>
                                            </div>
                                        </div>

                                        {/* Parcels List */}
                                        <div className="p-6">
                                            {loadingParcels ? (
                                                <div className="text-center py-12">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B1F6B]"></div>
                                                    <p className="text-sm text-gray-500 mt-3">Loading parcels...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Received Parcels */}
                                                    {activeTab === 'received' && (
                                                        <>
                                                            {receivedParcels.length === 0 ? (
                                                                <div className="text-center py-12">
                                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                                        </svg>
                                                                    </div>
                                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Received Parcels</h3>
                                                                    <p className="text-sm text-gray-500">Parcels scanned at this facility will appear here</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {receivedParcels.map((parcel) => (
                                                                        <div key={parcel.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#3B1F6B] transition">
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-3 mb-2">
                                                                                        <span className="font-mono text-sm font-bold text-[#3B1F6B]">
                                                                                            {parcel.waybill_number}
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-500">
                                                                                            {parcel.order_number}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                                                        <div>
                                                                                            <span className="text-gray-500">Buyer:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-900">{parcel.buyer_name}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-gray-500">Destination:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-900">{parcel.destination}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-gray-500">Weight:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-900">{parcel.weight} kg</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-gray-500">Payment:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-900">{parcel.payment_method}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                                                                                        <div className="flex items-center gap-1">
                                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                                <circle cx="12" cy="12" r="10"/>
                                                                                                <polyline points="12 6 12 12 16 14"/>
                                                                                            </svg>
                                                                                            Received: {parcel.received_at}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                                                                <circle cx="12" cy="7" r="4"/>
                                                                                            </svg>
                                                                                            By: {parcel.scanned_by}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="ml-4">
                                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                                                        parcel.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                                        parcel.status === 'packed' ? 'bg-yellow-100 text-yellow-700' :
                                                                                        parcel.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                                        'bg-gray-100 text-gray-700'
                                                                                    }`}>
                                                                                        {parcel.status}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Archived Parcels */}
                                                    {activeTab === 'archived' && (
                                                        <>
                                                            {archivedParcels.length === 0 ? (
                                                                <div className="text-center py-12">
                                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                                                            <polyline points="21 8 21 21 3 21 3 8"/>
                                                                            <rect x="1" y="3" width="22" height="5"/>
                                                                            <line x1="10" y1="12" x2="14" y2="12"/>
                                                                        </svg>
                                                                    </div>
                                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Archived Parcels</h3>
                                                                    <p className="text-sm text-gray-500">Parcels transferred to other facilities will appear here</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {archivedParcels.map((parcel) => (
                                                                        <div key={parcel.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-3 mb-2">
                                                                                        <span className="font-mono text-sm font-bold text-gray-600">
                                                                                            {parcel.waybill_number}
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-500">
                                                                                            {parcel.order_number}
                                                                                        </span>
                                                                                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                                                                            Transferred
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                                                        <div>
                                                                                            <span className="text-gray-500">Buyer:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-700">{parcel.buyer_name}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-gray-500">Destination:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-700">{parcel.destination}</span>
                                                                                        </div>
                                                                                        <div className="col-span-2">
                                                                                            <span className="text-gray-500">Transferred to:</span>
                                                                                            <span className="ml-2 font-semibold text-gray-900">{parcel.transferred_to}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                                                                                        <div className="flex items-center gap-1">
                                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                                <circle cx="12" cy="12" r="10"/>
                                                                                                <polyline points="12 6 12 12 16 14"/>
                                                                                            </svg>
                                                                                            Received: {parcel.received_at}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                                <polyline points="16 16 12 12 8 8"/>
                                                                                                <line x1="12" y1="12" x2="12" y2="21"/>
                                                                                                <line x1="12" y1="3" x2="12" y2="7"/>
                                                                                            </svg>
                                                                                            Transferred: {parcel.transferred_at}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900" style={fontSyncopate}>
                                {showAddModal ? 'Add New Facility' : 'Edit Facility'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Facility Name <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.facility_name}
                                            onChange={(e) => handleInputChange('facility_name', e.target.value)}
                                            placeholder="e.g. Sta. Cruz Branch"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Facility Type <span className="text-red-600">*</span>
                                        </label>
                                        <CustomSelect
                                            value={formData.facility_type}
                                            onChange={(value) => handleInputChange('facility_type', value as 'Main Hub' | 'Sorting Hub' | 'Branch')}
                                            options={[
                                                { value: 'Main Hub', label: 'Main Hub' },
                                                { value: 'Sorting Hub', label: 'Sorting Hub' },
                                                { value: 'Branch', label: 'Branch' }
                                            ]}
                                            placeholder="Select facility type"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Parent Facility {formData.facility_type !== 'Main Hub' && <span className="text-red-600">*</span>}
                                        </label>
                                        <CustomSelect
                                            value={formData.parent_facility}
                                            onChange={(value) => handleInputChange('parent_facility', value)}
                                            options={facilities
                                                .filter(f => f.facility_type === 'Main Hub' || f.facility_type === 'Sorting Hub')
                                                .map(f => ({ value: f.facility_name, label: f.facility_name }))}
                                            placeholder={formData.facility_type === 'Main Hub' ? 'None (Main Hub)' : 'Select parent facility'}
                                            disabled={formData.facility_type === 'Main Hub'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Status <span className="text-red-600">*</span>
                                        </label>
                                        <CustomSelect
                                            value={formData.status}
                                            onChange={(value) => handleInputChange('status', value as 'Active' | 'Inactive')}
                                            options={[
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' }
                                            ]}
                                            placeholder="Select status"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                    Location
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Region <span className="text-red-600">*</span>
                                        </label>
                                        <CustomSelect
                                            value={formData.region}
                                            onChange={(value) => {
                                                handleInputChange('region', value);
                                                handleInputChange('province', '');
                                                handleInputChange('city', '');
                                            }}
                                            options={psgcRegions.map(r => ({ value: r.name, label: r.name }))}
                                            placeholder={regionsLoading ? 'Loading regions...' : 'Select region'}
                                            disabled={regionsLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Province
                                        </label>
                                        <CustomSelect
                                            value={formData.province}
                                            onChange={(value) => {
                                                handleInputChange('province', value);
                                                handleInputChange('city', '');
                                            }}
                                            options={psgcProvinces.map(p => ({ value: p.name, label: p.name }))}
                                            placeholder={
                                                !formData.region 
                                                    ? 'Select region first'
                                                    : provincesLoading
                                                    ? 'Loading provinces...'
                                                    : psgcProvinces.length === 0
                                                    ? 'No provinces (e.g., NCR)'
                                                    : 'Select province'
                                            }
                                            disabled={!formData.region || provincesLoading || psgcProvinces.length === 0}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            City / Municipality <span className="text-red-600">*</span>
                                        </label>
                                        <CustomSelect
                                            value={formData.city}
                                            onChange={(value) => handleInputChange('city', value)}
                                            options={psgcCities.map(c => ({ value: c.name, label: c.name }))}
                                            placeholder={
                                                !formData.region
                                                    ? 'Select region first'
                                                    : citiesLoading
                                                    ? 'Loading cities...'
                                                    : psgcCities.length === 0
                                                    ? 'No cities available'
                                                    : 'Select city/municipality'
                                            }
                                            disabled={!formData.region || citiesLoading || psgcCities.length === 0}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Complete Address <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Street, Barangay, City"
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Branch Manager <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.manager}
                                            onChange={(e) => handleInputChange('manager', e.target.value)}
                                            placeholder="Manager's name"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Contact Number <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.contact}
                                            onChange={(e) => handleInputChange('contact', e.target.value)}
                                            placeholder="09XXXXXXXXX"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Coverage */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                    Service Coverage
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Covered Cities / Municipalities <span className="text-red-600">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Select cities and municipalities that this facility covers
                                    </p>
                                    <div className="mb-3">
                                        <CustomMultiSelect
                                            onSelect={(value) => handleCoverageAdd(value)}
                                            options={psgcCities
                                                .filter(city => !formData.coverage.includes(city.name))
                                                .map(c => ({ value: c.name, label: c.name }))}
                                            placeholder={
                                                psgcCities.length === 0 
                                                    ? 'Select region and province first' 
                                                    : 'Select city to add to coverage'
                                            }
                                            disabled={psgcCities.length === 0}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.coverage.map((city, index) => (
                                            <div
                                                key={index}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F1EDFB] text-[#3B1F6B] rounded-lg text-sm font-medium"
                                            >
                                                <span>{city}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCoverageRemove(city)}
                                                    className="hover:text-red-600 transition"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {formData.coverage.length === 0 && (
                                            <p className="text-sm text-gray-500">No cities added yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}
                                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showAddModal ? handleSaveFacility : handleUpdateFacility}
                                className="px-5 py-2.5 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2E1850] transition"
                            >
                                {showAddModal ? 'Add Facility' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedFacility && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2" style={fontSyncopate}>
                                Delete Facility?
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Are you sure you want to delete <strong>{selectedFacility.facility_name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedFacility(null);
                                    }}
                                    className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto-Generate Branches Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900" style={fontSyncopate}>
                                Auto-Generate Branches
                            </h3>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 flex-shrink-0 mt-0.5">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="16" x2="12" y2="12"/>
                                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                                    </svg>
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">How does this work?</p>
                                        <p>This feature automatically creates one branch for each selected city from your registered service areas. Each branch will be pre-configured with the city as its coverage area.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Parent Facility Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Parent Facility <span className="text-red-600">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    All generated branches will be under this parent facility
                                </p>
                                <CustomSelect
                                    value={generateForm.parentFacility}
                                    onChange={(value) => setGenerateForm(prev => ({ ...prev, parentFacility: value }))}
                                    options={facilities
                                        .filter(f => f.facility_type === 'Main Hub' || f.facility_type === 'Sorting Hub')
                                        .map(f => ({ value: f.facility_name, label: `${f.facility_name} (${f.facility_type})` }))}
                                    placeholder="Select parent facility"
                                />
                            </div>

                            {/* Region & Province Selection */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Default Location
                                </h4>
                                <p className="text-xs text-gray-500 mb-3">
                                    Set the default region and province for all generated branches
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Region <span className="text-red-600">*</span>
                                        </label>
                                        <CustomSelect
                                            value={generateForm.region}
                                            onChange={(value) => {
                                                setGenerateForm(prev => ({ ...prev, region: value, province: '' }));
                                            }}
                                            options={psgcRegions.map(r => ({ value: r.name, label: r.name }))}
                                            placeholder={regionsLoading ? 'Loading regions...' : 'Select region'}
                                            disabled={regionsLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Province (optional)
                                        </label>
                                        <CustomSelect
                                            value={generateForm.province}
                                            onChange={(value) => setGenerateForm(prev => ({ ...prev, province: value }))}
                                            options={psgcProvinces.map(p => ({ value: p.name, label: p.name }))}
                                            placeholder={
                                                !generateForm.region 
                                                    ? 'Select region first'
                                                    : provincesLoading
                                                    ? 'Loading provinces...'
                                                    : psgcProvinces.length === 0
                                                    ? 'No provinces (e.g., NCR)'
                                                    : 'Select province'
                                            }
                                            disabled={!generateForm.region || provincesLoading || psgcProvinces.length === 0}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* City Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Select Cities <span className="text-red-600">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Choose cities from your registered service areas
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSelectAllCities}
                                            className="text-xs text-[#3B1F6B] hover:underline font-medium"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            type="button"
                                            onClick={handleDeselectAllCities}
                                            className="text-xs text-gray-600 hover:underline font-medium"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {company.service_areas && company.service_areas.length > 0 ? (
                                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                        <div className="divide-y divide-gray-200">
                                            {company.service_areas.map((city) => {
                                                const alreadyHasBranch = facilities.some(f => f.city === city);
                                                const isSelected = generateForm.selectedCities.includes(city);

                                                return (
                                                    <label
                                                        key={city}
                                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                                                            alreadyHasBranch 
                                                                ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                                                                : 'hover:bg-[#F1EDFB]'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => !alreadyHasBranch && handleToggleCitySelection(city)}
                                                            disabled={alreadyHasBranch}
                                                            className="w-4 h-4 text-[#3B1F6B] border-gray-300 rounded focus:ring-[#3B1F6B] disabled:cursor-not-allowed"
                                                        />
                                                        <span className={`flex-1 text-sm ${alreadyHasBranch ? 'text-gray-500' : 'text-gray-900'}`}>
                                                            {city}
                                                        </span>
                                                        {alreadyHasBranch && (
                                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                                                Already exists
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg p-8 text-center">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                        <p className="text-sm font-medium text-gray-900 mb-1">No Service Areas Found</p>
                                        <p className="text-xs text-gray-500">
                                            Your account doesn't have registered service areas yet.
                                        </p>
                                    </div>
                                )}

                                {generateForm.selectedCities.length > 0 && (
                                    <div className="mt-3 text-sm text-gray-700">
                                        <span className="font-semibold">{generateForm.selectedCities.length}</span> {generateForm.selectedCities.length === 1 ? 'city' : 'cities'} selected
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateBranches}
                                disabled={generateForm.selectedCities.length === 0 || !generateForm.parentFacility || !generateForm.region}
                                className="px-5 py-2.5 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2E1850] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate {generateForm.selectedCities.length > 0 && `(${generateForm.selectedCities.length})`} Branches
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

BranchFacility.layout = (page: ReactNode) => page;
