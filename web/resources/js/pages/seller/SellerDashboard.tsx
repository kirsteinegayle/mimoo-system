import { Head } from '@inertiajs/react';
import { AlertTriangle, Box, MessageSquare, Package, Star, TrendingUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import SellerShell from '@/layouts/seller/seller-shell';

interface SellerDashboardProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
            profile_photo?: string | null;
            cover_photo?: string | null;
        };
    };
    seller: {
        store_name: string;
        business_name?: string;
        profile_photo_url?: string | null;
        cover_photo_url?: string | null;
    };
    stats: {
        total_sales: number;
        sales_growth: number;
        total_orders: number;
        pending_orders: number;
        store_rating: number;
        total_reviews: number;
        to_prepare: number;
        low_stock_count: number;
        new_messages: number;
        new_reviews: number;
        current_month_sales: number;
        current_month_orders: number;
    };
    recentOrders: Array<{
        id: string;
        buyer_name: string;
        item: string;
        total: number;
        status: 'To Ship' | 'In Transit' | 'Delivered';
        date: string;
    }>;
    topProducts: Array<{
        rank: number;
        name: string;
        units_sold: number;
        revenue: number;
        share_percent: number;
    }>;
    lowStockItems: Array<{
        name: string;
        reorder_point: number;
        current_stock: number;
        percentage: number;
    }>;
    chartData: {
        monthly_sales: Array<{
            month: string;
            sales: number;
        }>;
    };
}

const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSyne = { fontFamily: "'Syne', sans-serif" };

const TH = 'text-left text-[0.7rem] font-semibold uppercase tracking-wide text-[#6E6570] pb-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)]';

const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Real-time stats from SSE
interface RealtimeStats {
    timestamp: string;
    total_stock: number;
    total_sold: number;
    total_revenue: number;
    recent_orders: Array<{
        order_id: number;
        order_number: string;
        product_name: string;
        quantity: number;
        total: number;
        status: string;
        created_at: string;
        is_new: boolean;
    }>;
    top_products: Array<{
        id: number;
        name: string;
        stock: number;
        sold: number;
        status: string;
    }>;
    status?: 'connected' | 'closing';
    error?: string;
}

export default function SellerDashboard({ auth, seller, stats, recentOrders, topProducts, lowStockItems, chartData }: SellerDashboardProps) {
    const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionFailed, setConnectionFailed] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    
    // Photo upload states
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(seller.profile_photo_url || null);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(seller.cover_photo_url || null);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    
    const storeName = seller?.store_name || seller?.business_name || auth.user.name;

    // Setup SSE connection for real-time updates
    useEffect(() => {
        // DISABLED - SSE causing slow navigation
        // Let's just use static data for now
        console.log('📊 Using static dashboard data (SSE disabled for performance)');
        return;
        
        /* COMMENTED OUT - SSE CODE
        let reconnectTimeout: NodeJS.Timeout;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const reconnectDelay = 3000; // 3 seconds
        
        const connect = () => {
            console.log(`🔌 Connecting to SSE... (attempt ${reconnectAttempts + 1})`);
            
            // Connect to SSE stream
            const eventSource = new EventSource('/api/seller/dashboard/stream');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('✅ Real-time dashboard connected');
                setIsConnected(true);
                reconnectAttempts = 0; // Reset counter on successful connection
            };

            eventSource.onmessage = (event) => {
                try {
                    const data: RealtimeStats = JSON.parse(event.data);
                    
                    // Handle status messages
                    if ('status' in data) {
                        if (data.status === 'connected') {
                            console.log('📡 SSE handshake successful');
                        } else if (data.status === 'closing') {
                            console.log('👋 SSE stream closing normally');
                        }
                        return;
                    }
                    
                    // Handle error messages
                    if ('error' in data) {
                        console.warn('⚠️ SSE error event:', data.error);
                        return;
                    }
                    
                    // Update with real data
                    setRealtimeStats(data);
                    console.log('📊 Dashboard updated:', data.timestamp);
                } catch (error) {
                    console.error('Failed to parse SSE data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('❌ SSE connection error:', error);
                setIsConnected(false);
                eventSource.close();
                
                // Attempt to reconnect with backoff
                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    const delay = reconnectDelay * reconnectAttempts; // Progressive backoff
                    console.log(`🔄 Reconnecting in ${delay / 1000}s... (${reconnectAttempts}/${maxReconnectAttempts})`);
                    
                    reconnectTimeout = setTimeout(() => {
                        connect();
                    }, delay);
                } else {
                    console.error('❌ Max reconnection attempts reached. Dashboard will use static data.');
                    setConnectionFailed(true);
                }
            };
        };
        
        // Initial connection
        connect();

        // Cleanup on unmount
        return () => {
            console.log('🔌 Closing SSE connection');
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
        */ // END COMMENTED SSE CODE
    }, []);

    // Use real-time stats if available, otherwise fall back to initial props
    const displayStats = {
        total_sales: realtimeStats?.total_revenue ?? stats.total_sales,
        total_sold: realtimeStats?.total_sold ?? 0,
        total_stock: realtimeStats?.total_stock ?? 0,
    };

    const displayRecentOrders = realtimeStats?.recent_orders ?? recentOrders;
    const displayTopProducts = realtimeStats?.top_products ?? [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'To Ship': return 'text-[#a9752b]';
            case 'In Transit': return 'text-[#4B2E7E]';
            case 'Delivered': return 'text-[#2c7a52]';
            default: return 'text-gray-600';
        }
    };

    // Photo upload handlers
    const handleProfilePhotoClick = () => {
        profileInputRef.current?.click();
    };

    const handleCoverPhotoClick = () => {
        coverInputRef.current?.click();
    };

    const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            alert('Only JPG and PNG files are allowed');
            return;
        }

        setUploadingProfile(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/api/seller/profile-photo', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setProfilePhotoUrl(data.photo_url);
                alert('Profile photo uploaded successfully!');
            } else {
                console.error('Upload failed:', data);
                alert(`Failed to upload profile photo: ${data.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Failed to upload profile photo: ${error instanceof Error ? error.message : 'Network error'}`);
        } finally {
            setUploadingProfile(false);
            if (profileInputRef.current) {
                profileInputRef.current.value = '';
            }
        }
    };

    const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            alert('Only JPG and PNG files are allowed');
            return;
        }

        setUploadingCover(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/api/seller/cover-photo', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setCoverPhotoUrl(data.photo_url);
                alert('Cover photo uploaded successfully!');
            } else {
                console.error('Upload failed:', data);
                alert(`Failed to upload cover photo: ${data.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Failed to upload cover photo: ${error instanceof Error ? error.message : 'Network error'}`);
        } finally {
            setUploadingCover(false);
            if (coverInputRef.current) {
                coverInputRef.current.value = '';
            }
        }
    };

    return (
        <SellerShell active="dashboard">
            <Head title="Seller Dashboard" />
            <div style={fontPoppins}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

                :root {
                    --deep: #2A1B4D;
                    --deep-2: color-mix(in srgb, var(--deep) 85%, black);
                    --primary: #4B2E7E;
                    --primary-hover: color-mix(in srgb, var(--primary) 82%, black);
                    --accent: color-mix(in srgb, var(--primary) 55%, #B9A6DE 45%);
                    --accent-soft: #B9A6DE;
                    --muted: #6E6570;
                    --lav-50: color-mix(in srgb, var(--accent-soft) 12%, white);
                    --lav-100: color-mix(in srgb, var(--accent-soft) 24%, white);
                    --lav-200: color-mix(in srgb, var(--accent-soft) 44%, white);
                    --gold: #a9752b;
                    --gold-bg: #f7ecd6;
                    --ok: #2c7a52;
                    --ok-bg: #e7f5ec;
                    --danger: #b3384f;
                    --danger-bg: #fbeced;
                    --logi: #2f6f8f;
                    --logi-bg: #e4eef3;
                }
            `}</style>

            {/* Store Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[0.76rem] font-semibold text-[#4B2E7E] uppercase tracking-wider mb-1" style={fontPoppins}>Welcome back, {auth.user.name}</p>
                        <h1 className="text-[1.8rem] font-semibold leading-tight" style={fontSyne}>{storeName}</h1>
                        <p className="text-sm text-[#6E6570] mt-1">Here is how your store is performing this month.</p>
                    </div>
                </div>
            </div>

            {/* Store Profile Section */}
            <div className="mb-6">
                <div className="bg-white rounded-xl overflow-hidden border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                    {/* Cover Photo */}
                    <div className="relative h-48 bg-gradient-to-br from-[#4B2E7E] via-[#6a4d9c] to-[#B9A6DE]">
                        {/* Actual cover image or gradient background */}
                        {coverPhotoUrl ? (
                            <img 
                                src={coverPhotoUrl} 
                                alt="Store Cover" 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-[url('/images/store-pattern.png')] bg-cover bg-center opacity-20" />
                        )}
                        
                        {/* Edit Cover Photo Button */}
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleCoverPhotoChange}
                            className="hidden"
                        />
                        <button 
                            onClick={handleCoverPhotoClick}
                            disabled={uploadingCover}
                            className="absolute top-4 right-4 flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-[#4B2E7E] hover:bg-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadingCover ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-[#4B2E7E] border-t-transparent rounded-full"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Edit Cover Photo
                                </>
                            )}
                        </button>

                        {/* File size hint */}
                        <div className="absolute bottom-4 left-4 text-xs text-white/80 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
                            Max 5MB
                        </div>
                    </div>

                    {/* Store Info Section */}
                    <div className="relative px-8 pb-6">
                        {/* Store Avatar - overlapping cover */}
                        <div className="flex items-end justify-between" style={{ marginTop: '-48px' }}>
                            <div className="flex items-end gap-4">
                                {/* Avatar with border - Editable */}
                                <div className="relative group">
                                    {profilePhotoUrl ? (
                                        <img 
                                            src={profilePhotoUrl} 
                                            alt="Store Profile" 
                                            className="h-32 w-32 rounded-2xl object-cover shadow-xl border-4 border-white"
                                        />
                                    ) : (
                                        <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4B2E7E] to-[#B9A6DE] text-4xl font-bold text-white shadow-xl border-4 border-white">
                                            {storeName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                    )}
                                    
                                    {/* Edit Overlay */}
                                    <input
                                        ref={profileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleProfilePhotoChange}
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={handleProfilePhotoClick}
                                        disabled={uploadingProfile}
                                        className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                    >
                                        <div className="text-center">
                                            {uploadingProfile ? (
                                                <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-xs font-semibold text-white">Edit Photo</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* Verified Badge */}
                                    <div className="absolute -bottom-2 -right-2 rounded-full bg-[#2c7a52] p-2">
                                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Store Name & Info */}
                                <div className="pb-4">
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-1" style={fontSyne}>
                                        {storeName}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-[#4B2E7E]">
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            VERIFIED SELLER
                                        </span>
                                        <span className="text-xs">mimoo Mall Certified</span>
                                    </div>
                                    <p className="text-xs text-[#6E6570] mt-2">
                                        💡 Upload professional photos to make your store stand out to buyers
                                    </p>
                                </div>
                            </div>

                            {/* Preview Store Button */}
                            <div className="pb-4">
                                <a 
                                    href={`/seller/${auth.user.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[#4B2E7E] bg-white px-6 py-2.5 text-sm font-semibold text-[#4B2E7E] hover:bg-violet-50 transition"
                                >
                                    👁️ Preview Store Page
                                </a>
                            </div>
                        </div>

                        {/* Upload Requirements Card */}
                        <div className="mt-6 rounded-lg bg-[color-mix(in_srgb,#B9A6DE_12%,white)] border border-[color-mix(in_srgb,#B9A6DE_44%,white)] p-4">
                            <h3 className="text-sm font-semibold text-[#4B2E7E] mb-2" style={fontSyne}>Photo Requirements</h3>
                            <div className="grid grid-cols-2 gap-4 text-xs text-[#6E6570]">
                                <div>
                                    <p className="font-semibold text-neutral-900 mb-1">Cover Photo:</p>
                                    <ul className="space-y-1">
                                        <li>• Recommended size: 1200 x 300 pixels</li>
                                        <li>• Max file size: 5MB</li>
                                        <li>• Format: JPG, PNG</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-900 mb-1">Profile Photo:</p>
                                    <ul className="space-y-1">
                                        <li>• Recommended size: 400 x 400 pixels</li>
                                        <li>• Max file size: 5MB</li>
                                        <li>• Format: JPG, PNG</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4" style={fontSyne}>Store overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Sales - Accent card */}
                    <div className="bg-gradient-to-br from-[#4B2E7E] to-[#B9A6DE] text-white rounded-xl p-5 border-0">
                        <div className="flex items-center gap-2 text-sm font-semibold opacity-80 mb-3" style={fontSyne}>
                            <TrendingUp className="w-4 h-4" />
                            <span>Total Sales</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-[1.7rem] font-extrabold leading-none" style={fontPoppins}>{peso(displayStats.total_sales)}</span>
                            <span className="text-xs font-extrabold bg-white/20 px-2 py-1 rounded-full">
                                {stats.sales_growth >= 0 ? '▲' : '▼'} {Math.abs(stats.sales_growth).toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-[0.76rem] opacity-75 mt-2">This month</p>
                    </div>

                    {/* Orders */}
                    <div className="bg-white rounded-xl p-5 border-2 border-[#E4EEF3] border-l-[3px] border-l-[#2f6f8f]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#6E6570] mb-3" style={fontSyne}>
                            <Box className="w-4 h-4 text-[#2f6f8f]" />
                            <span>Total Sold</span>
                        </div>
                        <div className="text-[1.7rem] font-extrabold leading-none" style={fontPoppins}>{displayStats.total_sold.toLocaleString()}</div>
                        <p className="text-[0.76rem] text-[#6E6570] mt-2">Units sold (all time)</p>
                    </div>

                    {/* Stock */}
                    <div className="bg-white rounded-xl p-5 border-2 border-[#F7ECD6] border-l-[3px] border-l-[#a9752b]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#6E6570] mb-3" style={fontSyne}>
                            <Package className="w-4 h-4 text-[#a9752b]" />
                            <span>Total Stock</span>
                        </div>
                        <div className="text-[1.7rem] font-extrabold leading-none" style={fontPoppins}>{displayStats.total_stock.toLocaleString()}</div>
                        <p className="text-[0.76rem] text-[#6E6570] mt-2">Current inventory</p>
                    </div>

                    {/* Store Rating */}
                    <div className="bg-white rounded-xl p-5 border-2 border-[#E7F5EC] border-l-[3px] border-l-[#2c7a52]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#6E6570] mb-3" style={fontSyne}>
                            <Star className="w-4 h-4 text-[#2c7a52]" />
                            <span>Store Rating</span>
                        </div>
                        <div className="text-[1.7rem] font-extrabold leading-none" style={fontPoppins}>
                            {stats.store_rating > 0 ? stats.store_rating.toFixed(1) : 'N/A'}
                        </div>
                        <p className="text-[0.76rem] text-[#6E6570] mt-2">From {stats.total_reviews} reviews</p>
                    </div>
                </div>
            </div>

            {/* Sales Performance */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4" style={fontSyne}>Sales performance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Chart Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                        <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                            <div>
                                <p className="text-xs text-[#6E6570] mb-1">Sales overview — last 6 months</p>
                            </div>
                            <div className="flex gap-1 bg-[color-mix(in_srgb,#B9A6DE_12%,white)] border border-[color-mix(in_srgb,#B9A6DE_44%,white)] rounded-lg p-1">
                                <button onClick={() => setChartPeriod('daily')} className={`text-xs font-bold px-3 py-2 rounded ${chartPeriod === 'daily' ? 'bg-[#4B2E7E] text-white' : 'text-[#6E6570]'}`}>Daily</button>
                                <button onClick={() => setChartPeriod('monthly')} className={`text-xs font-bold px-3 py-2 rounded ${chartPeriod === 'monthly' ? 'bg-[#4B2E7E] text-white' : 'text-[#6E6570]'}`}>Monthly</button>
                                <button onClick={() => setChartPeriod('yearly')} className={`text-xs font-bold px-3 py-2 rounded ${chartPeriod === 'yearly' ? 'bg-[#4B2E7E] text-white' : 'text-[#6E6570]'}`}>Yearly</button>
                            </div>
                        </div>

                        <div className="flex items-end gap-9 mb-4 flex-wrap">
                            <div>
                                <div className="text-2xl font-extrabold" style={fontPoppins}>{peso(stats.current_month_sales)}</div>
                                <div className="text-xs text-[#6E6570] mt-1">Sales this month</div>
                            </div>
                            <div>
                                <div className="text-xl font-extrabold" style={fontPoppins}>{stats.current_month_orders.toLocaleString()}</div>
                                <div className="text-xs text-[#6E6570] mt-1">Orders this month</div>
                            </div>
                        </div>

                        {/* Simplified Chart Placeholder */}
                        <div className="relative h-32 mb-2">
                            <svg className="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="sellerRevFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4B2E7E" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="#4B2E7E" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,118 C60,118 60,108 120,108 C180,108 180,120 240,120 C300,120 300,92 360,92 C420,92 420,100 480,100 C540,100 540,55 600,55 L600,150 L0,150 Z" fill="url(#sellerRevFill)" />
                                <path d="M0,118 C60,118 60,108 120,108 C180,108 180,120 240,120 C300,120 300,92 360,92 C420,92 420,100 480,100 C540,100 540,55 600,55" fill="none" stroke="#4B2E7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="600" cy="55" r="4.5" fill="#4B2E7E" />
                            </svg>
                            <div className="flex justify-between text-[0.7rem] text-[#6E6570] font-semibold mt-2 px-1">
                                {chartData.monthly_sales.map((data, index) => (
                                    <span key={index}>{data.month}</span>
                                ))}
                            </div>
                        </div>

                        {/* Sub Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 mt-5 border-t border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                            <div className="pl-3 border-l-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                                <div className="text-[0.72rem] text-[#6E6570] truncate">Avg. order value</div>
                                <div className="text-[0.95rem] font-extrabold mt-1" style={fontPoppins}>₱147.10</div>
                            </div>
                            <div className="pl-3 border-l-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                                <div className="text-[0.72rem] text-[#6E6570] truncate">Items sold</div>
                                <div className="text-[0.95rem] font-extrabold mt-1" style={fontPoppins}>1,890</div>
                            </div>
                            <div className="pl-3 border-l-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                                <div className="text-[0.72rem] text-[#6E6570] truncate">Active vouchers</div>
                                <div className="text-[0.95rem] font-extrabold mt-1" style={fontPoppins}>3</div>
                            </div>
                            <div className="pl-3 border-l-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                                <div className="text-[0.72rem] text-[#6E6570] truncate">Awaiting courier</div>
                                <div className="text-[0.95rem] font-extrabold mt-1" style={fontPoppins}>5</div>
                            </div>
                        </div>
                    </div>

                    {/* Donut Card */}
                    <div className="bg-white rounded-xl p-6 border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                        <div className="text-base font-semibold mb-1" style={fontSyne}>Order status</div>
                        <p className="text-xs text-[#6E6570] mb-5">Share of this month's orders</p>

                        {/* Donut SVG */}
                        <div className="flex items-center justify-center py-6">
                            <svg className="w-36 h-36" viewBox="0 0 42 42">
                                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="color-mix(in srgb, #B9A6DE 24%, white)" strokeWidth="6"></circle>
                                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#2c7a52" strokeWidth="6" strokeDasharray="60 40" strokeDashoffset="25" transform="rotate(-90 21 21)"></circle>
                                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#4B2E7E" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-35" transform="rotate(-90 21 21)"></circle>
                                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#a9752b" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-60" transform="rotate(-90 21 21)"></circle>
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-between gap-3 pt-4 border-t border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                            <div>
                                <div className="flex items-center gap-2 text-[0.74rem] text-[#6E6570] mb-1">
                                    <i className="w-2 h-2 rounded-full bg-[#2c7a52]"></i>
                                    <span>Delivered</span>
                                </div>
                                <div className="text-base font-extrabold" style={fontPoppins}>60%</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-[0.74rem] text-[#6E6570] mb-1">
                                    <i className="w-2 h-2 rounded-full bg-[#4B2E7E]"></i>
                                    <span>In transit</span>
                                </div>
                                <div className="text-base font-extrabold" style={fontPoppins}>25%</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-[0.74rem] text-[#6E6570] mb-1">
                                    <i className="w-2 h-2 rounded-full bg-[#a9752b]"></i>
                                    <span>To ship</span>
                                </div>
                                <div className="text-base font-extrabold" style={fontPoppins}>15%</div>
                            </div>
                        </div>

                        <p className="text-[0.74rem] text-[#6E6570] mt-4">Based on 1,240 orders placed this month.</p>
                    </div>
                </div>
            </div>

            {/* Needs Your Attention */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4" style={fontSyne}>Needs your attention</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* To Prepare */}
                    <a href="/seller/orders" className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] hover:border-[#B9A6DE] hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <div className="relative flex-none w-12 h-12 bg-[#f7ecd6] text-[#a9752b] rounded-xl flex items-center justify-center">
                            <Box className="w-5 h-5" />
                            {stats.to_prepare > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[21px] h-5 px-1 bg-[#a9752b] text-white text-[0.7rem] font-extrabold rounded-full flex items-center justify-center border-2 border-white" style={fontPoppins}>{stats.to_prepare}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold" style={fontSyne}>To Prepare</div>
                            <div className="text-xs text-[#6E6570]">Orders awaiting packing</div>
                        </div>
                    </a>

                    {/* Low Stock */}
                    <a href="/seller/products" className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] hover:border-[#B9A6DE] hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <div className="relative flex-none w-12 h-12 bg-[#f7ecd6] text-[#a9752b] rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                            {stats.low_stock_count > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[21px] h-5 px-1 bg-[#a9752b] text-white text-[0.7rem] font-extrabold rounded-full flex items-center justify-center border-2 border-white" style={fontPoppins}>{stats.low_stock_count}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold" style={fontSyne}>Low Stock</div>
                            <div className="text-xs text-[#6E6570]">Products below reorder point</div>
                        </div>
                    </a>

                    {/* New Messages */}
                    <a href="/seller/messages" className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] hover:border-[#B9A6DE] hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <div className="relative flex-none w-12 h-12 bg-[#e4eef3] text-[#2f6f8f] rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                            {stats.new_messages > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[21px] h-5 px-1 bg-[#2f6f8f] text-white text-[0.7rem] font-extrabold rounded-full flex items-center justify-center border-2 border-white" style={fontPoppins}>{stats.new_messages}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold" style={fontSyne}>New Messages</div>
                            <div className="text-xs text-[#6E6570]">From buyers & support</div>
                        </div>
                    </a>

                    {/* New Reviews */}
                    <a href="/seller/customers?tab=feedback" className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] hover:border-[#B9A6DE] hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <div className="relative flex-none w-12 h-12 bg-[#e7f5ec] text-[#2c7a52] rounded-xl flex items-center justify-center">
                            <Star className="w-5 h-5" />
                            {stats.new_reviews > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[21px] h-5 px-1 bg-[#2c7a52] text-white text-[0.7rem] font-extrabold rounded-full flex items-center justify-center border-2 border-white" style={fontPoppins}>{stats.new_reviews}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold" style={fontSyne}>New Reviews</div>
                            <div className="text-xs text-[#6E6570]">Awaiting your reply</div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={fontSyne}>Recent orders</h2>
                    <a href="/seller/orders" className="text-sm font-bold text-[#4B2E7E] hover:text-[color-mix(in_srgb,#4B2E7E_82%,black)] hover:underline">View all orders</a>
                </div>
                <div className="bg-white rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] p-6 overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse">
                        <thead>
                            <tr>
                                <th className={TH} style={fontPoppins}>Order</th>
                                <th className={TH} style={fontPoppins}>Product</th>
                                <th className={TH} style={fontPoppins}>Quantity</th>
                                <th className={TH} style={fontPoppins}>Total</th>
                                <th className={TH} style={fontPoppins}>Status</th>
                                <th className={TH} style={fontPoppins}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRecentOrders.length > 0 ? displayRecentOrders.map((order: any) => (
                                <tr key={order.order_id || order.id} className={order.is_new ? 'bg-green-50' : ''}>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)] font-bold" style={fontPoppins}>
                                        {order.order_number || order.id}
                                        {order.is_new && (
                                            <span className="ml-2 text-[0.65rem] bg-green-500 text-white px-2 py-0.5 rounded-full font-extrabold">NEW</span>
                                        )}
                                    </td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)] text-[#6E6570] text-sm">{order.product_name || order.item}</td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)] text-[#6E6570] text-sm">{order.quantity || 1}</td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)]" style={fontPoppins}>{peso(order.total)}</td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                                        <span className={`text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`} style={fontPoppins}>{order.status}</span>
                                    </td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)] text-[#6E6570] text-sm" style={fontPoppins}>{order.created_at || order.date}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-sm text-[#6E6570]">No recent orders yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Products & Inventory */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={fontSyne}>Products & inventory</h2>
                    <a href="/seller/products" className="text-sm font-bold text-[#4B2E7E] hover:text-[color-mix(in_srgb,#4B2E7E_82%,black)] hover:underline">Manage inventory</a>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] p-6 mb-5 overflow-x-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold" style={fontSyne}>Top products</h3>
                        <span className="text-xs text-[#6E6570]">Ranked by revenue this month</span>
                    </div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className={`${TH} w-11`} style={fontSyne}>#</th>
                                <th className={TH} style={fontPoppins}>Product</th>
                                <th className={TH} style={fontPoppins}>Units sold</th>
                                <th className={TH} style={fontPoppins}>Revenue</th>
                                <th className={`${TH} hidden md:table-cell`} style={fontSyne}>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.length > 0 ? topProducts.map((product) => (
                                <tr key={product.rank}>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)]">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[color-mix(in_srgb,#B9A6DE_24%,white)] text-[#4B2E7E] text-xs font-extrabold" style={fontPoppins}>{product.rank}</span>
                                    </td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)] font-bold text-sm" style={fontPoppins}>{product.name}</td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)]" style={fontPoppins}>{product.units_sold}</td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)]" style={fontPoppins}>{peso(product.revenue)}</td>
                                    <td className="py-3 border-b border-[color-mix(in_srgb,#B9A6DE_44%,white)] hidden md:table-cell">
                                        <div className="flex items-center gap-3 min-w-[150px]">
                                            <div className="flex-1 h-2 bg-[color-mix(in_srgb,#B9A6DE_24%,white)] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#B9A6DE] to-[#4B2E7E] rounded-full" style={{ width: `${product.share_percent}%` }}></div>
                                            </div>
                                            <span className="text-xs text-[#6E6570] w-11 text-right" style={fontPoppins}>{product.share_percent.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-[#6E6570]">No products yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl border-2 border-[color-mix(in_srgb,#B9A6DE_44%,white)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold" style={fontSyne}>Low stock alerts</h3>
                        <span className="text-xs text-[#6E6570]">{lowStockItems.length} products are below their reorder point</span>
                    </div>
                    {lowStockItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                            {lowStockItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="font-bold text-sm mb-1">{item.name}</div>
                                        <div className="text-xs text-[#6E6570] mb-2">Reorder point: {item.reorder_point} units</div>
                                        <div className="h-1.5 bg-[color-mix(in_srgb,#B9A6DE_24%,white)] rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.current_stock <= 5 ? 'bg-[#b3384f]' : 'bg-[#a9752b]'}`} style={{ width: `${item.percentage}%` }}></div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-extrabold whitespace-nowrap ${item.current_stock <= 5 ? 'text-[#b3384f]' : 'text-[#a9752b]'}`} style={fontPoppins}>
                                        {item.current_stock} left
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-[#6E6570] py-8">All products are well stocked</div>
                    )}
                </div>
            </div>
            </div>
        </SellerShell>
    );
}

SellerDashboard.layout = (page: ReactNode) => page;