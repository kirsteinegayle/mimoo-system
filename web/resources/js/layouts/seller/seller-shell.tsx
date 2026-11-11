import { Link, router } from '@inertiajs/react';
import {
    Box,
    ChevronDown,
    Cog,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Package,
    ShoppingBag,
    TrendingUp,
    User,
    Users,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { NotificationBell } from '@/components/notification-bell';
import type { FormEvent, ReactNode } from 'react';

// ─── Nav definition ───────────────────────────────────────────────────────────

export type SellerNavKey =
    | 'dashboard'
    | 'products'
    | 'orders'
    | 'customers'
    | 'analytics'
    | 'messages'
    | 'settings';

const navItems: { key: SellerNavKey; label: string; icon: React.ElementType; href: string }[] = [
    { key: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, href: '/seller/dashboard'  },
    { key: 'products',   label: 'Products',   icon: Box,             href: '/seller/products'   },
    { key: 'orders',     label: 'Orders',     icon: ShoppingBag,     href: '/seller/orders'     },
    { key: 'customers',  label: 'Customers',  icon: Users,           href: '/seller/customers'  },
    { key: 'analytics',  label: 'Analytics',  icon: TrendingUp,      href: '/seller/analytics'  },
    { key: 'messages',   label: 'Messages',   icon: MessageSquare,   href: '/seller/messages'   },
    { key: 'settings',   label: 'Settings',   icon: Cog,             href: '/seller/settings'   },
];

// ─── Memoized Nav Item ────────────────────────────────────────────────────────

interface NavItemProps {
    item: typeof navItems[number];
    isActive: boolean;
}

const NavItem = memo(({ item, isActive }: NavItemProps) => {
    const Icon = item.icon;
    
    // Prefetch on hover for instant navigation
    const handleMouseEnter = useCallback(() => {
        router.prefetch(item.href);
    }, [item.href]);
    
    return (
        <Link
            href={item.href}
            className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                isActive
                    ? 'bg-[#3B1F6B] font-semibold text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90',
            ].join(' ')}
            preserveScroll={false}
            preserveState={false}
            onMouseEnter={handleMouseEnter}
        >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{item.label}</span>
        </Link>
    );
});

NavItem.displayName = 'NavItem';

// ─── Shell ────────────────────────────────────────────────────────────────────

interface SellerShellProps {
    active: SellerNavKey;
    children: ReactNode;
}

export default function SellerShell({ active, children }: SellerShellProps) {
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside - optimized with useCallback
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setAccountMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        if (accountMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [accountMenuOpen, handleClickOutside]);

    const handleLogout = useCallback((e: FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    }, []);

    return (
        <div
            className="flex h-screen overflow-hidden bg-gray-50 text-gray-900"
            style={{ fontFamily: "'Syne', ui-sans-serif, system-ui, sans-serif" }}
        >
            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside className="flex w-[224px] shrink-0 flex-col bg-[#1E1B2E] text-white" style={{ fontFamily: "'Syne', ui-sans-serif, system-ui, sans-serif" }}>
                {/* Logo */}
                <div className="flex h-14 items-center gap-2 border-b border-white/10 px-5">
                    <span className="h-5 w-5 rounded-full bg-[#9B5DE5]" />
                    <span
                        className="text-base font-extrabold uppercase tracking-widest"
                        style={{ fontFamily: "'Syncopate', ui-sans-serif, system-ui, sans-serif" }}
                    >
                        mimoo.
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-2 py-4">
                    {navItems.map((item) => (
                        <NavItem key={item.key} item={item} isActive={active === item.key} />
                    ))}
                </nav>

                {/* Logout */}
                <div className="border-t border-white/10 px-2 py-3">
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
                        >
                            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                            Logout
                        </button>
                    </form>
                    <div className="mt-2 flex items-center gap-2 px-3 py-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9B5DE5] text-[10px] font-bold">
                            S
                        </span>
                        <span className="truncate text-xs text-white/40">SELLER</span>
                    </div>
                </div>
            </aside>

            {/* ── Main area ─────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div className="flex h-8 w-72 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
                        </svg>
                        Search products, orders, customers…
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                            <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        {/* Seller notifications (shared bell, seller routes) */}
                        <NotificationBell
                            isLoggedIn
                            baseUrl="/seller/notifications"
                            buttonClassName="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        />
                        
                        {/* Account Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 hover:bg-gray-50 transition"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3B1F6B] text-[10px] font-bold text-white">
                                    <Package className="h-3 w-3" />
                                </span>
                                <span className="text-xs font-semibold text-gray-700">My Account</span>
                                <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {accountMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                                    <div className="py-1">
                                        <Link
                                            href="/seller/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setAccountMenuOpen(false)}
                                        >
                                            <Cog className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                            <span className="font-medium">General Settings</span>
                                        </Link>
                                        <Link
                                            href="/seller/account"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setAccountMenuOpen(false)}
                                        >
                                            <User className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                            <span className="font-medium">Seller Account</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={(e) => { handleLogout(e); setAccountMenuOpen(false); }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" strokeWidth={1.5} />
                                            <span className="font-medium">Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content (scrollable) */}
                <main className="flex-1 overflow-y-auto px-8 pt-10 pb-16">
                    {children}
                </main>
            </div>
        </div>
    );
}
