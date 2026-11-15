import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BarChart3, Bike, CalendarClock, CheckCircle2, Inbox, MessageSquare, PackageSearch, ScanLine, Truck } from 'lucide-react';
import { ReactNode } from 'react';
import CourierLayout from './CourierLayout';
import { Card, CowMark, HERO_GRADIENT, StatCard, StatusBadge } from '@/components/courier/ui';

interface RecentJob {
    id: number;
    order_id: number;
    order_number: string;
    waybill: string | null;
    recipient: string | null;
    rider: string | null;
    status: string;
    updated_at: string | null;
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
    stats: {
        incoming_shipments: number;
        pending_pickups: number;
        in_transit: number;
        deliveries_today: number;
        exceptions: number;
    };
    recent?: RecentJob[];
}

function ago(iso: string | null) {
    if (!iso) return '';
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

const ACTIONS = [
    { href: '/courier/incoming-shipments', label: 'Review shipments', desc: 'Accept or reject new parcels', icon: Inbox },
    { href: '/courier/parcel-scanning', label: 'Scan parcel', desc: 'Receive parcels at a hub', icon: ScanLine },
    { href: '/courier/delivery-management', label: 'Assign rider', desc: 'Create delivery jobs', icon: Bike },
    { href: '/courier/messages', label: 'Messages', desc: 'Riders, sellers, admin', icon: MessageSquare },
    { href: '/courier/reports', label: 'Reports', desc: 'Performance overview', icon: BarChart3 },
];

export default function CourierDashboard({ auth, company, stats, recent = [] }: Props) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = (company.contact_person || auth.user.name).split(/\s+/)[0];

    return (
        <CourierLayout auth={auth} company={company} activeTab="dashboard" pageTitle="Dashboard">
            <Head title="Courier Dashboard" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8" style={{ background: HERO_GRADIENT }}>
                    <div className="pointer-events-none absolute -right-10 -top-10 opacity-15">
                        <CowMark size={220} />
                    </div>
                    <div className="relative">
                        <p className="text-sm font-medium text-violet-200">{greeting},</p>
                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{firstName} 👋</h1>
                        <p className="mt-2 max-w-xl text-sm text-violet-100/90">
                            {stats.incoming_shipments > 0
                                ? `${stats.incoming_shipments} new shipment${stats.incoming_shipments === 1 ? '' : 's'} waiting for your review.`
                                : 'No new shipments waiting. Everything is up to date.'}
                            {stats.exceptions > 0 && ` ${stats.exceptions} exception${stats.exceptions === 1 ? ' needs' : 's need'} attention.`}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link
                                href="/courier/incoming-shipments"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#2B2249] shadow hover:bg-violet-50"
                            >
                                <Inbox className="h-4 w-4" /> Incoming shipments
                            </Link>
                            <Link
                                href="/courier/delivery-management"
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20"
                            >
                                <Truck className="h-4 w-4" /> Deliveries
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    <StatCard label="Incoming" hint="Awaiting acceptance" value={stats.incoming_shipments} icon={Inbox} tone="blue" href="/courier/incoming-shipments" />
                    <StatCard label="Pickups" hint="Pending pickup" value={stats.pending_pickups} icon={CalendarClock} tone="amber" href="/courier/incoming-shipments" />
                    <StatCard label="Out for delivery" hint="Active delivery jobs" value={stats.in_transit} icon={Truck} tone="violet" href="/courier/delivery-management" />
                    <StatCard label="Delivered today" hint="Completed jobs" value={stats.deliveries_today} icon={CheckCircle2} tone="green" href="/courier/delivery-management" />
                    <StatCard label="Exceptions" hint="Need attention" value={stats.exceptions} icon={AlertTriangle} tone={stats.exceptions > 0 ? 'red' : 'gray'} href="/courier/delivery-management" />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent deliveries */}
                    <Card
                        className="lg:col-span-2"
                        title="Recent deliveries"
                        subtitle="Latest updates from your riders"
                        actions={
                            <Link href="/courier/delivery-management" className="inline-flex items-center gap-1 text-sm font-semibold text-[#4B2E7E] hover:underline">
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        }
                    >
                        {recent.length === 0 ? (
                            <div className="px-5 py-14 text-center text-gray-400">
                                <PackageSearch className="mx-auto mb-3 h-10 w-10" />
                                <p className="text-sm font-medium text-gray-500">No delivery activity yet</p>
                                <p className="mt-1 text-xs">Assign a rider in Delivery Management to get started.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recent.map((r) => (
                                    <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1ECFA] text-[#4B2E7E]">
                                            <Truck className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {r.order_number}
                                                {r.waybill && <span className="ml-2 font-mono text-xs font-normal text-gray-400">{r.waybill}</span>}
                                            </p>
                                            <p className="truncate text-xs text-gray-500">
                                                {r.recipient || 'Recipient'} · Rider {r.rider || '—'}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <StatusBadge status={r.status} />
                                            <span className="text-[11px] text-gray-400">{ago(r.updated_at)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {/* Quick actions */}
                    <Card title="Quick actions">
                        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-1">
                            {ACTIONS.map(({ href, label, desc, icon: Icon }) => (
                                <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#F6F3FB]">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2B2249] to-[#6a5a8a] text-white">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-gray-900">{label}</span>
                                        <span className="block text-xs text-gray-500">{desc}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#4B2E7E]" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </CourierLayout>
    );
}

CourierDashboard.layout = (page: ReactNode) => page;
