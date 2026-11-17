import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronUp,
    CircleDollarSign,
    ClipboardList,
    Minus,
    ShoppingBag,
    Truck,
    Users,
    Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AdminShell from '@/layouts/admin/admin-shell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
    stats: {
        totalBuyers: number;
        totalSellers: number;
        totalCouriers: number;
        totalOrders: number;
        revenueMTD: number;
    };
    attention: {
        pendingRegistrations: number;
        pendingToday: number;
        complianceFlags: number;
        openDisputes: number;
        commissionThisMonth: number;
        commissionRate: number;
    };
    operations: {
        activeDeliveries: number;
        ordersInProgress: number;
        supportTickets: number;
    };
    products: {
        pendingApproval: number;
    };
    salesTrend: { date: string; revenue: number; orders: number }[];
    ordersByStatus: { status: string; count: number }[];
    topSellers: { id: number; name: string; revenue: number; orders: number }[];
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-400',
    paid: 'bg-sky-400',
    packed: 'bg-indigo-400',
    shipped: 'bg-blue-500',
    in_transit: 'bg-violet-500',
    delivered: 'bg-teal-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-rose-400',
};

const statusColor = (s: string) => STATUS_COLORS[s] ?? 'bg-gray-400';
const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const shortDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

function EmptyChart({ text }: { text: string }) {
    return (
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <div className="flex flex-col items-center gap-2 text-gray-300">
                <BarChart3 className="h-8 w-8" strokeWidth={1} />
                <span className="text-xs text-gray-400">{text}</span>
            </div>
        </div>
    );
}

function SalesTrendChart({ data, peso }: { data: PageProps['salesTrend']; peso: (n: number) => string }) {
    const max = Math.max(0, ...data.map((d) => d.revenue));
    if (data.length === 0 || max === 0) {
        return <EmptyChart text="No completed sales in the last 30 days" />;
    }
    const total = data.reduce((s, d) => s + d.revenue, 0);
    const orders = data.reduce((s, d) => s + d.orders, 0);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-[10px] text-gray-400">
                <span>Completed sales · last 30 days</span>
                <span>
                    {peso(total)} · {orders} order{orders === 1 ? '' : 's'}
                </span>
            </div>
            <div className="flex h-36 items-end gap-[3px] rounded-lg bg-gray-50 px-2 pt-2">
                {data.map((d) => (
                    <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${shortDate(d.date)}: ${peso(d.revenue)} · ${d.orders} order${d.orders === 1 ? '' : 's'}`}>
                        <div
                            className={`w-full rounded-t-sm ${d.revenue > 0 ? 'bg-[#9B5DE5] group-hover:bg-[#3B1F6B]' : 'bg-gray-200'}`}
                            style={{ height: d.revenue > 0 ? `${Math.max((d.revenue / max) * 100, 3)}%` : '2px' }}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-1 flex justify-between px-2 text-[10px] text-gray-400">
                <span>{shortDate(data[0].date)}</span>
                <span>{shortDate(data[Math.floor(data.length / 2)].date)}</span>
                <span>{shortDate(data[data.length - 1].date)}</span>
            </div>
        </div>
    );
}

function OrdersByStatusChart({ data }: { data: PageProps['ordersByStatus'] }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) {
        return <EmptyChart text="No orders yet" />;
    }
    const max = Math.max(...data.map((d) => d.count));

    return (
        <div>
            <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                {data
                    .filter((d) => d.count > 0)
                    .map((d) => (
                        <div key={d.status} className={statusColor(d.status)} style={{ width: `${(d.count / total) * 100}%` }} title={`${statusLabel(d.status)}: ${d.count}`} />
                    ))}
            </div>
            <div className="space-y-2.5">
                {data.map((d) => (
                    <div key={d.status}>
                        <div className="mb-1 flex justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-gray-500">
                                <span className={`h-2 w-2 rounded-full ${statusColor(d.status)}`} />
                                {statusLabel(d.status)}
                            </span>
                            <span className="font-semibold text-gray-800">
                                {d.count} <span className="font-normal text-gray-400">({((d.count / total) * 100).toFixed(0)}%)</span>
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className={`h-2 rounded-full ${statusColor(d.status)}`} style={{ width: `${max > 0 ? (d.count / max) * 100 : 0}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopSellersList({ data, peso }: { data: PageProps['topSellers']; peso: (n: number) => string }) {
    if (data.length === 0) {
        return <EmptyChart text="No completed seller sales yet" />;
    }
    const max = Math.max(...data.map((d) => d.revenue));

    return (
        <ol className="space-y-3">
            {data.map((s, i) => (
                <li key={s.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate text-gray-600">
                            <span className="mr-1.5 font-semibold text-gray-400">{i + 1}.</span>
                            {s.name}
                        </span>
                        <span className="shrink-0 font-semibold text-gray-800">
                            {peso(s.revenue)} <span className="font-normal text-gray-400">· {s.orders} order{s.orders === 1 ? '' : 's'}</span>
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${max > 0 ? (s.revenue / max) * 100 : 0}%` }} />
                    </div>
                </li>
            ))}
        </ol>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
    return <h2 className="mb-4 text-sm font-semibold text-gray-700">{children}</h2>;
}

function EmptyValue({ label }: { label: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-800">—</span>
            <span className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <Minus className="h-3 w-3" />
                {label}
            </span>
        </div>
    );
}

function StatCard({ label, icon: Icon, color, value }: { label: string; icon: React.ElementType; color: string; value?: number | string }) {
    const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.5} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
            </div>
            {value !== undefined && value !== null ? (
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-gray-800">
                        {typeof value === 'number' && label.toLowerCase().includes('revenue') ? peso(value) : value.toLocaleString()}
                    </span>
                </div>
            ) : (
                <EmptyValue label="No data yet" />
            )}
        </div>
    );
}

function AttentionCard({ label, action, badge, value, href }: { label: string; action: string; badge?: string; value?: number | string; href?: string }) {
    const displayValue = value !== undefined && value !== null ? value.toLocaleString() : '—';
    
    const content = (
        <>
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-800">{displayValue}</p>
                {badge && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                        <ChevronUp className="h-3 w-3 text-emerald-400" />
                        {badge}
                    </span>
                )}
            </div>
            <button className="mt-3 text-left text-xs font-medium text-[#3B1F6B] hover:underline">{action}</button>
        </>
    );
    
    return (
        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {href ? (
                <Link href={href} className="flex flex-col justify-between h-full">
                    {content}
                </Link>
            ) : (
                content
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { stats, attention, operations, products, salesTrend, ordersByStatus, topSellers } = usePage<PageProps>().props;
    const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminShell active="dashboard">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900">Welcome back, Admin !</h1>
                    <p className="mt-0.5 text-sm text-gray-400">Here's what's happening across Mimoo today.</p>
                </div>

                {/* Stat cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <StatCard label="Total Buyers"   icon={Users}              color="text-blue-500"    value={stats.totalBuyers} />
                    <StatCard label="Total Sellers"  icon={ShoppingBag}        color="text-emerald-500" value={stats.totalSellers} />
                    <StatCard label="Total Couriers" icon={Truck}              color="text-violet-500"  value={stats.totalCouriers} />
                    <StatCard label="Total Orders"   icon={ClipboardList}      color="text-orange-500"  value={stats.totalOrders} />
                    <StatCard label="Revenue (MTD)"  icon={CircleDollarSign}   color="text-pink-500"    value={stats.revenueMTD} />
                </div>

                {/* Needs attention */}
                <div className="mb-8">
                    <SectionLabel>Needs your attention</SectionLabel>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <AttentionCard 
                            label="Pending Approval" 
                            action="Review applications" 
                            badge={`${attention.pendingToday} today`}
                            value={attention.pendingRegistrations}
                            href="/admin/pending-approval"
                        />
                        <AttentionCard 
                            label="Products Pending"  
                            action="Review products"
                            value={products.pendingApproval}
                            href="/admin/product-approval"
                        />
                        <AttentionCard 
                            label="Compliance Flags"
                            action="Review sellers' products"
                            value={attention.complianceFlags}
                            href="/admin/seller-compliance"
                        />
                        <AttentionCard 
                            label="Open Disputes"
                            action="Review complaints"
                            value={attention.openDisputes}
                            href="/admin/complaints"
                        />
                        <AttentionCard 
                            label="Commission This Month"  
                            action="Open commission"
                            value={peso(attention.commissionThisMonth)}
                            href="/admin/commission"
                        />
                    </div>
                </div>

                {/* Financial overview */}
                <div className="mb-8">
                    <SectionLabel>Financial overview</SectionLabel>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Revenue this month</p>
                                    <p className="mt-1 text-xl font-bold text-gray-800">{peso(stats.revenueMTD)}</p>
                                    <p className="text-xs text-gray-400">Commission earned: {peso(attention.commissionThisMonth)}</p>
                                </div>
                                <div className="flex gap-1">
                                    {['Daily', 'Monthly', 'Yearly'].map((t) => (
                                        <button
                                            key={t}
                                            className={[
                                                'rounded-md px-2.5 py-1 text-xs font-medium',
                                                t === 'Monthly' ? 'bg-[#3B1F6B] text-white' : 'text-gray-500 hover:bg-gray-100',
                                            ].join(' ')}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <SalesTrendChart data={salesTrend ?? []} peso={peso} />
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Platform balance',     value: peso(attention.commissionThisMonth) },
                                    { label: 'Total revenue',        value: peso(stats.revenueMTD) },
                                    { label: 'Total orders',         value: stats.totalOrders.toString() },
                                    { label: 'Commission rate',      value: `${Math.round(attention.commissionRate * 100)}%` },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-[10px] text-gray-400">{label}</p>
                                        <p className="text-sm font-semibold text-gray-700">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold text-gray-700">Revenue breakdown</p>
                            <p className="mb-4 text-[10px] text-gray-400">Platform statistics</p>
                            <div className="space-y-3 pt-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Total Buyers</span>
                                        <span className="font-semibold text-gray-800">{stats.totalBuyers}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min((stats.totalBuyers / (stats.totalBuyers + stats.totalSellers + stats.totalCouriers)) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Total Sellers</span>
                                        <span className="font-semibold text-gray-800">{stats.totalSellers}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min((stats.totalSellers / (stats.totalBuyers + stats.totalSellers + stats.totalCouriers)) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Total Couriers</span>
                                        <span className="font-semibold text-gray-800">{stats.totalCouriers}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.min((stats.totalCouriers / (stats.totalBuyers + stats.totalSellers + stats.totalCouriers)) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders & sellers */}
                <div className="mb-8">
                    <SectionLabel>Orders &amp; sellers</SectionLabel>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold text-gray-700">Orders by status</p>
                            <p className="mb-4 text-[10px] text-gray-400">All orders, current status</p>
                            <OrdersByStatusChart data={ordersByStatus ?? []} />
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold text-gray-700">Top 5 sellers</p>
                            <p className="mb-4 text-[10px] text-gray-400">By completed order revenue (all time)</p>
                            <TopSellersList data={topSellers ?? []} peso={peso} />
                        </div>
                    </div>
                </div>

                {/* Live operations */}
                <div>
                    <SectionLabel>Live operations</SectionLabel>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Active deliveries',    icon: Truck,       value: operations.activeDeliveries,   total: stats.totalOrders },
                            { label: 'Orders in progress',   icon: ShoppingBag, value: operations.ordersInProgress,  total: stats.totalOrders },
                            { label: 'Support tickets open', icon: Zap,         value: operations.supportTickets,    total: 100 },
                        ].map(({ label, icon: Icon, value, total }) => {
                            const percentage = total > 0 ? (value / total) * 100 : 0;
                            return (
                                <div key={label} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-[#9B5DE5]" strokeWidth={1.5} />
                                        <span className="text-xs font-semibold text-gray-500">{label}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                                        <div className="h-1.5 rounded-full bg-[#9B5DE5]" style={{ width: `${Math.min(percentage, 100)}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400">{percentage.toFixed(1)}% of total</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </AdminShell>
        </>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => page;
