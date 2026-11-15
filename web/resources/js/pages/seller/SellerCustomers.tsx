import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SellerShell from '@/layouts/seller/seller-shell';
import { Download, MessageSquareText, Repeat, Search, ShoppingBag, Star, UserPlus, Users } from 'lucide-react';
import { ReviewsTab, type ReviewSummary } from './SellerReturns';

// ---------------------------------------------------------------------------
// Seller > Customers
//  · Customers: buyers who bought my items (from order_items, cancelled
//    orders excluded) — computed server-side in the /seller/customers route.
//  · Customer Feedback: reviews of my products + rating summary, same feed and
//    reply endpoint as Returns & Reviews (/seller/reviews/feed, /reply).
// ---------------------------------------------------------------------------

interface Customer {
    id: number;
    name: string;
    email: string;
    orders: number;
    spent: number;
    last_order: string;
}

interface Props {
    customers?: Customer[];
    stats?: { total: number; new_month: number; repeat: number; avg_order: number };
    initialTab?: 'customers' | 'feedback';
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: string | number; icon: typeof Users; tint: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-full p-3 ${tint}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
            </div>
        </div>
    );
}

function FeedbackSummary({ summary }: { summary: ReviewSummary | null }) {
    if (!summary) return null;
    const total = summary.rating_count;
    return (
        <div className="mb-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-[200px_1fr_auto] md:items-center">
            <div className="text-center md:border-r md:border-gray-100 md:pr-4">
                <p className="text-4xl font-bold text-[#3B1F6B]">{summary.rating_avg !== null ? summary.rating_avg.toFixed(1) : '—'}</p>
                <div className="mt-1 flex justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`h-4 w-4 ${i <= Math.round(summary.rating_avg ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    {total} review{total === 1 ? '' : 's'}
                </p>
            </div>
            <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                    const n = summary.breakdown?.[String(stars)] ?? 0;
                    const pct = total ? Math.round((n / total) * 100) : 0;
                    return (
                        <div key={stars} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-6 text-right">{stars}★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right">{n}</span>
                        </div>
                    );
                })}
            </div>
            <div className="rounded-lg bg-violet-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#3B1F6B]">{summary.unreplied}</p>
                <p className="text-xs text-gray-600">awaiting reply</p>
            </div>
        </div>
    );
}

export default function SellerCustomers({ customers = [], stats, initialTab = 'customers' }: Props) {
    const [tab, setTab] = useState<'customers' | 'feedback'>(initialTab);
    const [search, setSearch] = useState('');
    const [summary, setSummary] = useState<ReviewSummary | null>(null);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? customers.filter((c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) : customers;
    }, [customers, search]);

    function exportCsv() {
        const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = [['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order'].map(esc).join(',')].concat(
            rows.map((c) => [c.name, c.email, c.orders, c.spent.toFixed(2), new Date(c.last_order).toLocaleDateString()].map(esc).join(',')),
        );
        const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Head title="Customers - Seller Dashboard" />
            <SellerShell active="customers">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Customers
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">Your buyers and what they say about your products</p>
                        </div>
                        {tab === 'customers' && (
                            <button
                                type="button"
                                onClick={exportCsv}
                                disabled={rows.length === 0}
                                className="flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D1652] disabled:opacity-50"
                            >
                                <Download className="h-4 w-4" strokeWidth={1.5} />
                                Export Customers
                            </button>
                        )}
                    </div>

                    <div className="mb-6 flex gap-6 border-b border-gray-200">
                        {(
                            [
                                ['customers', 'Customers', Users],
                                ['feedback', 'Customer Feedback', MessageSquareText],
                            ] as const
                        ).map(([key, label, Icon]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-2 text-sm font-semibold transition ${
                                    tab === key ? 'border-[#3B1F6B] text-[#3B1F6B]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === 'feedback' ? (
                        <div className="max-w-5xl">
                            <FeedbackSummary summary={summary} />
                            <ReviewsTab onSummary={setSummary} initialFilter="all" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard label="Total Customers" value={stats?.total ?? 0} icon={Users} tint="bg-blue-100 text-blue-600" />
                                <StatCard label="New This Month" value={stats?.new_month ?? 0} icon={UserPlus} tint="bg-green-100 text-green-600" />
                                <StatCard label="Repeat Customers" value={stats?.repeat ?? 0} icon={Repeat} tint="bg-purple-100 text-purple-600" />
                                <StatCard label="Avg Order Value" value={peso(stats?.avg_order ?? 0)} icon={ShoppingBag} tint="bg-orange-100 text-orange-600" />
                            </div>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search customers by name or email..."
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-[#3B1F6B] focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/20"
                                />
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order'].map((h) => (
                                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <Users className="mx-auto h-12 w-12 text-gray-300" strokeWidth={1.5} />
                                                    <p className="mt-2 text-sm font-medium text-gray-500">{search ? 'No matching customers' : 'No customers yet'}</p>
                                                    <p className="text-xs text-gray-400">Customers who purchase from you will appear here</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((c) => (
                                                <tr key={c.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B1F6B] text-xs font-bold text-white">
                                                                {(c.name || '?').charAt(0).toUpperCase()}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-600">{c.email}</td>
                                                    <td className="px-6 py-3 text-sm text-gray-900">{c.orders}</td>
                                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{peso(c.spent)}</td>
                                                    <td className="px-6 py-3 text-sm text-gray-600">{new Date(c.last_order).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </SellerShell>
        </>
    );
}
