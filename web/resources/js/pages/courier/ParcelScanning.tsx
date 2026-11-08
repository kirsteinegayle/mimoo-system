import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

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
    facilities: Facility[];
}

interface Facility {
    id: number;
    facility_name: string;
    facility_code: string;
    facility_type: 'Main Hub' | 'Sorting Hub' | 'Branch';
    city: string;
    region: string;
}

interface ScannedParcel {
    waybill_number: string;
    order_number: string;
    buyer_name: string;
    buyer_address: string;
    seller_name: string;
    weight: number;
    payment_method: string;
    total_amount: number;
    destination: string;
}

export default function ParcelScanning({ auth, company, facilities }: Props) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
    const [scannerActive, setScannerActive] = useState(false);
    const [manualEntry, setManualEntry] = useState(false);
    const [parcelInput, setParcelInput] = useState('');
    const [scannedParcel, setScannedParcel] = useState<ScannedParcel | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerId = 'courier-qr-scanner';
    const lastScanRef = useRef<string>('');
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-select first facility if only one exists
    useEffect(() => {
        if (facilities.length === 1 && !selectedFacility) {
            setSelectedFacility(facilities[0].id);
        }
    }, [facilities]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const startScanner = async () => {
        if (!selectedFacility) {
            alert('Please select a facility first');
            return;
        }

        try {
            setCameraError(null);
            
            // Stop existing scanner if any
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop();
            }
            
            // Create new scanner instance
            html5QrCodeRef.current = new Html5Qrcode(scannerId);
            
            // Start scanning with both camera and file support
            await html5QrCodeRef.current.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Prevent duplicate scans
                    if (decodedText === lastScanRef.current) {
                        return;
                    }
                    
                    lastScanRef.current = decodedText;
                    
                    // Clear previous timeout
                    if (scanTimeoutRef.current) {
                        clearTimeout(scanTimeoutRef.current);
                    }
                    
                    // Reset last scan after 2 seconds to allow re-scanning same code
                    scanTimeoutRef.current = setTimeout(() => {
                        lastScanRef.current = '';
                    }, 2000);
                    
                    handleScan(decodedText);
                },
                undefined
            );
            
            setScannerActive(true);
            setManualEntry(false);
        } catch (error: any) {
            console.error('Scanner start error:', error);
            setCameraError(error?.message || 'Cannot access camera. Please allow camera permissions.');
            setScannerActive(false);
        }
    };

    const stopScanner = async () => {
        try {
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
            }
            setScannerActive(false);
        } catch (error) {
            console.error('Scanner stop error:', error);
        }
    };

    const toggleScanner = async () => {
        if (scannerActive) {
            await stopScanner();
        } else {
            await startScanner();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
            }
        };
    }, []);

    const toggleManualEntry = async () => {
        if (!selectedFacility) {
            alert('Please select a facility first');
            return;
        }
        
        // Stop scanner if active
        if (scannerActive) {
            await stopScanner();
        }
        
        setManualEntry(!manualEntry);
        
        if (!manualEntry) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleScan = async (code: string) => {
        if (!selectedFacility || !code.trim()) return;

        setProcessing(true);

        try {
            // Fetch parcel details from API
            const response = await fetch(`/api/courier/parcel/${encodeURIComponent(code)}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Parcel not found');
                setProcessing(false);
                return;
            }
            
            const data = await response.json();
            
            const parcelData: ScannedParcel = {
                waybill_number: data.waybill_number,
                order_number: data.order_number,
                buyer_name: data.buyer_name,
                buyer_address: data.buyer_address,
                seller_name: data.seller_name,
                weight: data.weight,
                payment_method: data.payment_method,
                total_amount: data.total_amount,
                destination: data.destination,
            };

            setScannedParcel(parcelData);
            setShowConfirmation(true);
        } catch (error) {
            console.error('Scan error:', error);
            alert('Failed to scan parcel. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parcelInput.trim()) {
            handleScan(parcelInput);
            setParcelInput('');
        }
    };

    const handleConfirmReceive = async () => {
        if (!scannedParcel || !selectedFacility) return;

        setProcessing(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            
            const response = await fetch('/api/courier/scan-parcel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    waybill_number: scannedParcel.waybill_number,
                    facility_id: selectedFacility,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success - reset state
                setShowConfirmation(false);
                setScannedParcel(null);
                alert(data.message || 'Parcel received successfully!');
            } else {
                alert(data.message || 'Failed to process parcel. Please try again.');
            }
        } catch (error) {
            console.error('Confirmation error:', error);
            alert('Failed to confirm parcel receipt. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
        setScannedParcel(null);
    };

    const selectedFacilityData = facilities.find(f => f.id === selectedFacility);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid', href: '/courier/dashboard' },
        { id: 'incoming-shipments', label: 'Incoming Shipments', icon: 'inbox', href: '/courier/incoming-shipments' },
        { id: 'pickup-management', label: 'Pickup Management', icon: 'calendar', href: '/courier/pickup-management' },
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

    return (
        <>
            <Head title="Parcel Scanning" />
            
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                /* html5-qrcode styling */
                #courier-qr-scanner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                #courier-qr-scanner video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover;
                    border-radius: 12px;
                }
                
                #courier-qr-scanner > div {
                    width: 100% !important;
                    height: 100% !important;
                }
                
                #courier-qr-scanner__scan_region {
                    border: none !important;
                }
                
                #courier-qr-scanner__dashboard_section {
                    display: none !important;
                }
                
                #courier-qr-scanner__dashboard_section_csr {
                    display: none !important;
                }
                
                @keyframes scan-line {
                    0%, 100% { top: 20%; }
                    50% { top: 80%; }
                }
                
                .scan-line {
                    animation: scan-line 2s ease-in-out infinite;
                }
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
                                        item.id === 'parcel-scanning'
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
                                <h2 className="text-base font-semibold text-gray-900">Parcel Scanning</h2>
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
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Facility Selector */}
                            <div className="bg-gradient-to-r from-[#3B1F6B] to-[#5B3A8F] rounded-2xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="4" y="2" width="16" height="20" rx="2"/>
                                                <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium opacity-90">Current Facility</div>
                                            <div className="text-2xl font-bold mt-1" style={fontSyncopate}>
                                                {selectedFacilityData ? `${selectedFacilityData.facility_code} | ${selectedFacilityData.facility_name}` : 'No facility selected'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {facilities.length > 1 && (
                                        <select
                                            value={selectedFacility || ''}
                                            onChange={(e) => setSelectedFacility(parseInt(e.target.value))}
                                            className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 hover:bg-white/30 transition cursor-pointer"
                                            style={{ minWidth: '200px' }}
                                        >
                                            <option value="" disabled className="text-gray-900">Select Facility</option>
                                            {facilities.map((facility) => (
                                                <option key={facility.id} value={facility.id} className="text-gray-900">
                                                    {facility.facility_code} - {facility.facility_name} ({facility.facility_type})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                
                                {!selectedFacility && (
                                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg text-sm">
                                        ⚠️ Please select a facility to start scanning parcels
                                    </div>
                                )}
                            </div>

                            {/* Scanner Section */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 uppercase" style={fontSyncopate}>
                                        Live Optical Viewfinder
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                            scannerActive 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${scannerActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            {scannerActive ? 'Scanner Active' : 'Scanner Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Scanner Viewfinder */}
                                <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                    {/* Scanner container */}
                                    <div id={scannerId} className="w-full h-full"></div>
                                    
                                    {!scannerActive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                                            <div className="text-center">
                                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                                                    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                                                    <line x1="12" y1="8" x2="12" y2="16"/>
                                                </svg>
                                                <p className="text-gray-400 text-sm">
                                                    {cameraError || 'Click "Start Scanner" to begin scanning'}
                                                </p>
                                                {cameraError && (
                                                    <p className="text-red-400 text-xs mt-2">
                                                        Please allow camera access in your browser
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {scannerActive && (
                                        <>
                                            {/* Scanning corners overlay */}
                                            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-green-400 pointer-events-none"></div>
                                            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-green-400 pointer-events-none"></div>
                                            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-green-400 pointer-events-none"></div>
                                            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-green-400 pointer-events-none"></div>
                                            
                                            {/* Animated scan line */}
                                            <div className="absolute left-0 right-0 h-0.5 bg-green-400 scan-line pointer-events-none"></div>
                                        </>
                                    )}
                                </div>

                                {/* Scanner Controls */}
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <button
                                        onClick={toggleScanner}
                                        disabled={!selectedFacility}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition ${
                                            scannerActive
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-[#3B1F6B] text-white hover:bg-[#2E1850]'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {scannerActive ? (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <rect x="6" y="4" width="4" height="16"/>
                                                    <rect x="14" y="4" width="4" height="16"/>
                                                </svg>
                                                Stop Scanner
                                            </>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                                                    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                                                </svg>
                                                Start Scanner
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={toggleManualEntry}
                                        disabled={!selectedFacility}
                                        className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#3B1F6B] text-[#3B1F6B] rounded-xl font-semibold hover:bg-[#F1EDFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Enter Parcel ID manually
                                    </button>
                                </div>

                                {/* Manual Entry Form */}
                                {manualEntry && (
                                    <form onSubmit={handleManualSubmit} className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                        <div className="flex items-center gap-4">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={parcelInput}
                                                onChange={(e) => setParcelInput(e.target.value)}
                                                placeholder="Enter waybill number or order ID"
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B] focus:border-transparent"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!parcelInput.trim() || processing}
                                                className="px-6 py-3 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2E1850] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? 'Scanning...' : 'Scan'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Scanned Result */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 uppercase mb-6" style={fontSyncopate}>
                                    Scanned Result
                                </h3>

                                {!scannedParcel && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                                                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                                                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                                                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No parcel scanned yet</h4>
                                        <p className="text-sm text-gray-500">Scan a QR code to view parcel details</p>
                                    </div>
                                )}

                                {scannedParcel && !showConfirmation && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Waybill Number</div>
                                                <div className="text-lg font-bold text-gray-900">{scannedParcel.waybill_number}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Number</div>
                                                <div className="text-lg font-bold text-gray-900">{scannedParcel.order_number}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Buyer Name</div>
                                                <div className="text-sm font-semibold text-gray-900">{scannedParcel.buyer_name}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Destination</div>
                                                <div className="text-sm font-semibold text-gray-900">{scannedParcel.destination}</div>
                                            </div>
                                            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</div>
                                                <div className="text-sm font-semibold text-gray-900">{scannedParcel.buyer_address}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller</div>
                                                <div className="text-sm font-semibold text-gray-900">{scannedParcel.seller_name}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Weight</div>
                                                <div className="text-sm font-semibold text-gray-900">{scannedParcel.weight} kg</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Method</div>
                                                <div className="text-sm font-semibold text-gray-900">{scannedParcel.payment_method}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</div>
                                                <div className="text-sm font-semibold text-gray-900">₱{scannedParcel.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-6">
                                            <button
                                                onClick={() => setShowConfirmation(true)}
                                                className="flex-1 px-6 py-3 bg-[#3B1F6B] text-white rounded-lg font-semibold hover:bg-[#2E1850] transition"
                                            >
                                                Confirm Receipt
                                            </button>
                                            <button
                                                onClick={handleCancelConfirmation}
                                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && scannedParcel && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2" style={fontSyncopate}>
                                Confirm Parcel Receipt
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Mark this parcel as received at <strong>{selectedFacilityData?.facility_name}</strong>?
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Waybill:</span>
                                    <span className="font-semibold text-gray-900">{scannedParcel.waybill_number}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Buyer:</span>
                                    <span className="font-semibold text-gray-900">{scannedParcel.buyer_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Destination:</span>
                                    <span className="font-semibold text-gray-900">{scannedParcel.destination}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCancelConfirmation}
                                    disabled={processing}
                                    className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmReceive}
                                    disabled={processing}
                                    className="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

ParcelScanning.layout = (page: ReactNode) => page;
