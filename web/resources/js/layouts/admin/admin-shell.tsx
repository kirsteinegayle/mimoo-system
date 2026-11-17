import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronDown,
    Bell,
    CheckSquare,
    Cog,
    FileText,
    Image,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    Percent,
    Scale,
    ShieldAlert,
    SlidersHorizontal,
    Ticket,
    Users,
    PackageX,
    MessageSquare,
    RotateCcw,
    Truck,
    UserCheck,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

// ─── Nav definition ───────────────────────────────────────────────────────────

export type AdminNavKey =
    | 'dashboard'
    | 'accounts-approval'
    | 'seller-approval'
    | 'logistics-approval'
    | 'product-approval'
    | 'user-accounts'
    | 'seller-compliance'
    | 'complaints'
    | 'commission'
    | 'generate-reports'
    | 'platform-settings'
    | 'vouchers'
    | 'banners'
    | 'reports'
    | 'returns'
    | 'parcel-reports'
    | 'support'
    | 'messages'
    | 'notifications'
    | 'settings';

type NavItem = { key: AdminNavKey; label: string; icon: React.ElementType; href: string };

// Grouped sections (collapsible). The group that holds the current page is always open.
const navGroups: { title: string; items: NavItem[] }[] = [
    {
        title: 'Overview',
        items: [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }],
    },
    {
        title: 'Accounts',
        items: [
            { key: 'accounts-approval', label: 'Accounts Approval', icon: UserCheck, href: '/admin/accounts-approval' },
            { key: 'user-accounts', label: 'User Accounts', icon: Users, href: '/admin/user-accounts' },
            { key: 'seller-compliance', label: 'Seller Compliance', icon: ShieldAlert, href: '/admin/seller-compliance' },
        ],
    },
    {
        title: 'Catalog & Marketing',
        items: [
            { key: 'product-approval', label: 'Product Approval', icon: CheckSquare, href: '/admin/product-approval' },
            { key: 'reports', label: 'Product Reports', icon: AlertTriangle, href: '/admin/reports' },
            { key: 'banners', label: 'Banner Management', icon: Image, href: '/admin/banners' },
            { key: 'vouchers', label: 'Vouchers', icon: Ticket, href: '/admin/vouchers' },
        ],
    },
    {
        title: 'Orders & Support',
        items: [
            { key: 'complaints', label: 'Complaints & Disputes', icon: Scale, href: '/admin/complaints' },
            { key: 'returns', label: 'Escalated Returns', icon: RotateCcw, href: '/admin/returns' },
            { key: 'parcel-reports', label: 'Parcel Reports', icon: PackageX, href: '/admin/parcel-reports' },
            { key: 'support', label: 'Help & Support', icon: LifeBuoy, href: '/admin/support' },
            { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
        ],
    },
    {
        title: 'Finance & Reports',
        items: [
            { key: 'commission', label: 'Commission', icon: Percent, href: '/admin/commission' },
            { key: 'generate-reports', label: 'Generate Reports', icon: FileText, href: '/admin/generate-reports' },
        ],
    },
    {
        title: 'System',
        items: [
            { key: 'platform-settings', label: 'Platform Settings', icon: SlidersHorizontal, href: '/admin/platform-settings' },
            { key: 'settings', label: 'Admin Settings', icon: Cog, href: '/admin/settings' },
        ],
    },
];

const OPEN_KEY = 'mimoo_admin_nav_open';

/** Collapsed groups are remembered per browser; the group of the active page is always shown open. */
function useCollapsedGroups(active: AdminNavKey) {
    const [closed, setClosed] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(OPEN_KEY) || '[]');
        } catch {
            return [];
        }
    });
    const toggle = (title: string) =>
        setClosed((c) => {
            const next = c.includes(title) ? c.filter((t) => t !== title) : [...c, title];
            try {
                localStorage.setItem(OPEN_KEY, JSON.stringify(next));
            } catch {
                /* storage unavailable: still works for this visit */
            }
            return next;
        });
    const holdsActive = (title: string) => navGroups.find((g) => g.title === title)?.items.some((i) => i.key === active) ?? false;
    return { isOpen: (title: string) => holdsActive(title) || !closed.includes(title), toggle };
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AdminShellProps {
    active: AdminNavKey;
    children: ReactNode;
}

/** Unread admin notifications for the header bell (refreshes every 60 s while visible). */
function useAdminUnread() {
    const [unread, setUnread] = useState(0);
    useEffect(() => {
        let alive = true;
        const load = () =>
            fetch('/admin/notifications/unread-count', { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
                .then((r) => (r.ok ? r.json() : null))
                .then((j) => alive && j && setUnread(Number(j?.data?.unread ?? 0)))
                .catch(() => {});
        load();
        const onFocus = () => document.visibilityState === 'visible' && load();
        const t = window.setInterval(onFocus, 60000);
        window.addEventListener('admin-notifications-changed', load);
        return () => {
            alive = false;
            window.clearInterval(t);
            window.removeEventListener('admin-notifications-changed', load);
        };
    }, []);
    return unread;
}

export default function AdminShell({ active, children }: AdminShellProps) {
    const unread = useAdminUnread();
    const groups = useCollapsedGroups(active);
    function handleLogout(e: React.FormEvent) {
        e.preventDefault();
        router.post('/admin/logout');
    }

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
                <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin navigation">
                    {navGroups.map((group) => {
                        const open = groups.isOpen(group.title);
                        return (
                            <div key={group.title} className="mb-1">
                                <button
                                    type="button"
                                    onClick={() => groups.toggle(group.title)}
                                    aria-expanded={open}
                                    className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-white/60"
                                >
                                    {group.title}
                                    <ChevronDown className={`h-3 w-3 transition-transform ${open ? '' : '-rotate-90'}`} />
                                </button>
                                {open &&
                                    group.items.map(({ key, label, icon: Icon, href }) => (
                                        <Link
                                            key={key}
                                            href={href}
                                            aria-current={active === key ? 'page' : undefined}
                                            className={[
                                                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                                active === key
                                                    ? 'bg-[#3B1F6B] font-semibold text-white'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                                            ].join(' ')}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                            <span className="truncate">{label}</span>
                                        </Link>
                                    ))}
                            </div>
                        );
                    })}
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
                            A
                        </span>
                        <span className="truncate text-xs text-white/65">MIMOO ADMIN</span>
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
                        Search orders, sellers, applications…
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/messages" aria-label="Messages" title="Messages" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                            <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                        <Link
                            href="/admin/notifications"
                            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                            title="Notifications"
                            className={`relative ${active === 'notifications' ? 'border-[#3B1F6B] text-[#3B1F6B] ' : ''}flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50`}
                        >
                            <Bell className="h-4 w-4" strokeWidth={1.5} />
                            {unread > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                                    {unread > 99 ? '99+' : unread}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/admin/settings"
                            aria-label="Settings"
                            title="Settings"
                            className={`${active === 'settings' ? 'border-[#3B1F6B] text-[#3B1F6B] ' : ''}flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50`}
                        >
                            <Cog className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3B1F6B] text-[10px] font-bold text-white">
                                KF
                            </span>
                            <span className="text-xs font-semibold text-gray-700">Super Admin</span>
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
