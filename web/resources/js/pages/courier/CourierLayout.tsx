import { AnnouncementBanner } from '@/components/announcement-banner';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bike,
    Building2,
    ChevronDown,
    Headphones,
    Inbox,
    LayoutGrid,
    LogOut,
    Menu,
    MessageSquare,
    ScanLine,
    Settings,
    Shuffle,
    Truck,
    Wallet,
    X,
    type LucideIcon,
} from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { NotificationBell } from '@/components/notification-bell';
import { CurrentUserAvatar } from '@/components/user-avatar';
import { BRAND_GRADIENT, CowMark } from '@/components/courier/ui';

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
    activeTab: string;
    pageTitle: string;
    children: ReactNode;
}

const NAV: { section: string; items: { id: string; label: string; icon: LucideIcon; href: string }[] }[] = [
    {
        section: 'Overview',
        items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/courier/dashboard' }],
    },
    {
        section: 'Operations',
        items: [
            { id: 'incoming-shipments', label: 'Incoming Shipments', icon: Inbox, href: '/courier/incoming-shipments' },
            { id: 'parcel-scanning', label: 'Parcel Scanning', icon: ScanLine, href: '/courier/parcel-scanning' },
            { id: 'sorting-transfers', label: 'Sorting & Transfers', icon: Shuffle, href: '/courier/sorting-transfers' },
            { id: 'delivery-management', label: 'Delivery Management', icon: Truck, href: '/courier/delivery-management' },
        ],
    },
    {
        section: 'Team & network',
        items: [
            { id: 'rider-management', label: 'Rider Management', icon: Bike, href: '/courier/rider-management' },
            { id: 'branch-facility', label: 'Branch & Facility', icon: Building2, href: '/courier/branch-facility' },
        ],
    },
    {
        section: 'Business',
        items: [
            { id: 'cod-remittance', label: 'COD & Remittance', icon: Wallet, href: '/courier/cod-remittance' },
            { id: 'reports', label: 'Reports', icon: BarChart3, href: '/courier/reports' },
            { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/courier/messages' },
            { id: 'support', label: 'Support', icon: Headphones, href: '/courier/support' },
        ],
    },
];

function Sidebar({ current, company, onNavigate }: { current: string; company: string; onNavigate?: () => void }) {
    return (
        <div className="flex h-full flex-col text-white" style={{ background: BRAND_GRADIENT }}>
            <div className="px-5 pb-4 pt-6">
                <Link href="/courier/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
                    <CowMark size={36} />
                    <div className="leading-tight">
                        <span className="block text-lg font-bold tracking-widest" style={fontSyncopate}>
                            mimoo
                        </span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-200/80">Courier</span>
                    </div>
                </Link>
                <div className="mt-5 truncate rounded-xl bg-white/10 px-3 py-2 text-xs text-violet-100 ring-1 ring-white/10" title={company}>
                    {company}
                </div>
            </div>

            <nav className="scrollbar-hide flex-1 space-y-5 overflow-y-auto px-3 pb-4">
                {NAV.map((group) => (
                    <div key={group.section}>
                        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/60">{group.section}</p>
                        <div className="space-y-0.5">
                            {group.items.map(({ id, label, icon: Icon, href }) => {
                                const active = current === id;
                                return (
                                    <Link
                                        key={id}
                                        href={href}
                                        onClick={onNavigate}
                                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                            active ? 'bg-white text-[#2B2249] shadow-lg shadow-black/20' : 'text-violet-100/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon className={`h-[18px] w-[18px] ${active ? 'text-[#4B2E7E]' : 'text-violet-200/70 group-hover:text-white'}`} />
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-white/10 p-3">
                <Link
                    href="/courier/settings"
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        current === 'settings' ? 'bg-white text-[#2B2249]' : 'text-violet-100/80 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <Settings className="h-[18px] w-[18px]" />
                    Company Settings
                </Link>
            </div>
        </div>
    );
}

export default function CourierLayout({ auth, company, activeTab, pageTitle, children }: Props) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { url } = usePage();

    const flat = NAV.flatMap((g) => g.items);
    const current = flat.find((item) => url.startsWith(item.href))?.id || activeTab;

    useEffect(() => {
        if (!showUserMenu) return;
        const close = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setShowUserMenu(false);
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showUserMenu]);

    useEffect(() => {
        document.body.style.overflow = drawer ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawer]);


    return (
        <>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="flex h-screen bg-[#F6F4FA]" style={fontSyne}>
                {/* Desktop sidebar */}
                <aside className="hidden w-64 shrink-0 lg:block">
                    <Sidebar current={current} company={company.name} />
                </aside>

                {/* Mobile drawer */}
                {drawer && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
                        <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
                            <button
                                type="button"
                                onClick={() => setDrawer(false)}
                                aria-label="Close menu"
                                className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white/80 hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <Sidebar current={current} company={company.name} onNavigate={() => setDrawer(false)} />
                        </div>
                    </div>
                )}

                <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                    {/* Top bar */}
                    <header className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-gray-200/70 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDrawer(true)}
                                aria-label="Open menu"
                                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <p className="hidden truncate text-xs font-medium text-gray-400 sm:block">{company.name}</p>
                                <h2 className="truncate text-base font-bold text-[#1c1430]">{pageTitle}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link
                                href="/courier/messages"
                                aria-label="Messages"
                                title="Messages"
                                className={`rounded-xl p-2 transition hover:bg-gray-100 ${current === 'messages' ? 'bg-violet-50 text-[#4B2E7E]' : 'text-gray-600'}`}
                            >
                                <MessageSquare className="h-5 w-5" />
                            </Link>
                            <NotificationBell
                                isLoggedIn
                                baseUrl="/courier/notifications"
                                buttonClassName="relative flex items-center rounded-xl p-2 text-gray-600 transition hover:bg-gray-100"
                            />
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-gray-100"
                                >
                                    <CurrentUserAvatar fallbackName={auth.user.name} className="h-8 w-8 text-xs" />
                                    <span className="hidden max-w-[140px] truncate text-sm font-semibold text-gray-800 md:block">{auth.user.name}</span>
                                    <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                                        <div className="border-b border-gray-100 px-4 py-3">
                                            <p className="truncate text-sm font-semibold text-gray-900">{auth.user.name}</p>
                                            <p className="truncate text-xs text-gray-500">{auth.user.email}</p>
                                        </div>
                                        <Link href="/courier/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Settings className="h-4 w-4" /> Settings
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => router.post('/logout')}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                        >
                                            <LogOut className="h-4 w-4" /> Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto p-4 sm:p-6">
                        <AnnouncementBanner className="mb-4" />
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
