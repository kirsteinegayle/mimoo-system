import { Head, router } from '@inertiajs/react';
import { Download, Printer, Search } from 'lucide-react';
import { useState } from 'react';
import AdminShell from '@/layouts/admin/admin-shell';

interface Summary {
    orders: number;
    items: number;
    gross_sales: number;
    commission: number;
    seller_net: number;
    commission_rate: number;
}
interface SellerRow extends Omit<Summary, 'commission_rate'> {
    seller: string;
}
interface DayRow {
    date: string;
    orders: number;
    gross_sales: number;
    commission: number;
}
interface Line {
    order_number: string;
    date: string;
    seller: string;
    product: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    commission: number;
    status: string;
}
interface Filters {
    from: string;
    to: string;
    seller_id: number | null;
    status: 'completed' | 'all';
    type: 'sales' | 'commission';
}
interface Props {
    filters: Filters;
    report: {
        summary: Summary;
        by_seller: SellerRow[];
        by_day: DayRow[];
        lines: Line[];
        truncated: boolean;
        generated_at: string;
    };
    sellers: { id: number; name: string }[];
    commissionRate: number;
}

const peso = (n: number) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GenerateReports({ filters, report, sellers, commissionRate }: Props) {
    const [f, setF] = useState<Filters>(filters);
    const isCommission = f.type === 'commission';
    const s = report.summary;

    const query = () => {
        const q: Record<string, string> = { from: f.from, to: f.to, status: f.status, type: f.type };
        if (f.seller_id) q.seller_id = String(f.seller_id);
        return q;
    };

    const generate = () => router.get('/admin/generate-reports', query(), { preserveState: true, preserveScroll: true });
    const exportCsv = () => {
        window.location.href = '/admin/generate-reports/export?' + new URLSearchParams(query()).toString();
    };

    const input = 'h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30';

    return (
        <>
            <Head title="Generate Reports" />
            <AdminShell active="generate-reports">
                <div className="mb-6 flex items-start justify-between print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Generate Reports</h1>
                        <p className="mt-1 text-sm text-gray-500">Sales Summary and Commission reports · platform commission {(commissionRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Printer className="h-4 w-4" /> Print
                        </button>
                        <button onClick={exportCsv} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#3B1F6B] px-3 text-sm font-medium text-white hover:bg-[#2d1752]">
                            <Download className="h-4 w-4" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Report tabs: ONE page, two reports */}
                <div className="mb-4 flex gap-2 border-b border-gray-200 print:hidden">
                    {([['sales', 'Sales Summary Report'], ['commission', 'Commission Report']] as const).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => {
                                const n = { ...f, type: key };
                                setF(n);
                                router.get('/admin/generate-reports', { from: n.from, to: n.to, status: n.status, type: key, ...(n.seller_id ? { seller_id: String(n.seller_id) } : {}) }, { preserveState: true, preserveScroll: true });
                            }}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${f.type === key ? 'border-[#3B1F6B] text-[#3B1F6B]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 print:hidden">
                    <label className="text-xs font-semibold text-gray-500">
                        From
                        <input type="date" className={`${input} mt-1 block`} value={f.from} max={f.to} onChange={(e) => setF({ ...f, from: e.target.value })} />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        To
                        <input type="date" className={`${input} mt-1 block`} value={f.to} min={f.from} onChange={(e) => setF({ ...f, to: e.target.value })} />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        Seller
                        <select className={`${input} mt-1 block`} value={f.seller_id ?? ''} onChange={(e) => setF({ ...f, seller_id: e.target.value ? Number(e.target.value) : null })}>
                            <option value="">All sellers</option>
                            {sellers.map((x) => (
                                <option key={x.id} value={x.id}>{x.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                        Orders
                        <select className={`${input} mt-1 block`} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Filters['status'] })}>
                            <option value="completed">Completed / delivered only</option>
                            <option value="all">All except cancelled</option>
                        </select>
                    </label>
                    <button onClick={generate} className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">
                        <Search className="h-4 w-4" /> Generate
                    </button>
                </div>

                <div className="mb-4 hidden print:block">
                    <h2 className="text-lg font-bold">{isCommission ? 'Commission Report' : 'Sales Summary Report'}</h2>
                    <p className="text-sm">{filters.from} to {filters.to}</p>
                </div>

                {/* Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {[
                        ['Orders', s.orders.toLocaleString()],
                        ['Items sold', s.items.toLocaleString()],
                        ['Gross sales', peso(s.gross_sales)],
                        [`Commission (${(s.commission_rate * 100).toFixed(0)}%)`, peso(s.commission)],
                        ['Seller net', peso(s.seller_net)],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
                            <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
                        </div>
                    ))}
                </div>

                {report.truncated && (
                    <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                        Result limited to the latest 5,000 order lines. Narrow the date range for exact totals.
                    </div>
                )}

                {/* By seller */}
                <Section title="By seller">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Seller</th>
                                <th className="px-4 py-2 text-right">Orders</th>
                                <th className="px-4 py-2 text-right">Items</th>
                                <th className="px-4 py-2 text-right">Gross sales</th>
                                <th className="px-4 py-2 text-right">Commission</th>
                                {!isCommission && <th className="px-4 py-2 text-right">Seller net</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {report.by_seller.length === 0 && <Empty cols={isCommission ? 5 : 6} />}
                            {report.by_seller.map((r) => (
                                <tr key={r.seller} className="border-t border-gray-100">
                                    <td className="px-4 py-2 font-medium text-gray-900">{r.seller}</td>
                                    <td className="px-4 py-2 text-right">{r.orders}</td>
                                    <td className="px-4 py-2 text-right">{r.items}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.gross_sales)}</td>
                                    <td className="px-4 py-2 text-right font-semibold text-[#3B1F6B]">{peso(r.commission)}</td>
                                    {!isCommission && <td className="px-4 py-2 text-right">{peso(r.seller_net)}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* By day */}
                <Section title="By day">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2 text-right">Orders</th>
                                <th className="px-4 py-2 text-right">Gross sales</th>
                                <th className="px-4 py-2 text-right">Commission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.by_day.length === 0 && <Empty cols={4} />}
                            {report.by_day.map((r) => (
                                <tr key={r.date} className="border-t border-gray-100">
                                    <td className="px-4 py-2">{r.date}</td>
                                    <td className="px-4 py-2 text-right">{r.orders}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.gross_sales)}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.commission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* Lines */}
                <Section title="Order lines">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Order</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Seller</th>
                                <th className="px-4 py-2">Product</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2 text-right">Line total</th>
                                <th className="px-4 py-2 text-right">Commission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.lines.length === 0 && <Empty cols={7} />}
                            {report.lines.map((r, i) => (
                                <tr key={`${r.order_number}-${i}`} className="border-t border-gray-100">
                                    <td className="px-4 py-2 font-mono text-xs">{r.order_number}</td>
                                    <td className="px-4 py-2">{r.date}</td>
                                    <td className="px-4 py-2">{r.seller}</td>
                                    <td className="px-4 py-2">{r.product}</td>
                                    <td className="px-4 py-2 text-right">{r.quantity}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.line_total)}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.commission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                <p className="mt-4 text-xs text-gray-400">Generated {report.generated_at}</p>
            </AdminShell>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">{title}</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">{children}</div>
        </div>
    );
}

function Empty({ cols }: { cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="px-4 py-8 text-center text-gray-400">
                No sales in this period.
            </td>
        </tr>
    );
}
