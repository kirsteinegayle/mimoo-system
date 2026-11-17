import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AdminShell from '@/layouts/admin/admin-shell';

interface Props {
    filters: { from: string; to: string; seller_id: number | null };
    rate: number;
    summary: { orders: number; items: number; gross_sales: number; commission: number; seller_net: number };
    bySeller: { seller: string; orders: number; gross_sales: number; commission: number; seller_net: number }[];
    byOrder: { order_id: number; order_number: string; date: string; seller: string; gross_sales: number; commission: number; status: string }[];
    truncated: boolean;
    sellers: { id: number; name: string }[];
}

const peso = (n: number) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Commission({ filters, rate, summary, bySeller, byOrder, truncated, sellers }: Props) {
    const [f, setF] = useState(filters);
    const input = 'h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30';
    const q = () => {
        const p: Record<string, string> = { from: f.from, to: f.to };
        if (f.seller_id) p.seller_id = String(f.seller_id);
        return p;
    };
    const reportHref = '/admin/generate-reports?' + new URLSearchParams({ ...q(), type: 'commission', status: 'completed' }).toString();

    return (
        <>
            <Head title="Commission" />
            <AdminShell active="commission">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Commission</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Platform commission of {(rate * 100).toFixed(0)}% on delivered or completed orders only. Change the rate with PLATFORM_COMMISSION_RATE in the server settings.
                        </p>
                    </div>
                    <Link href={reportHref} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Open Commission Report (CSV / print)</Link>
                </div>

                <form
                    className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
                    onSubmit={(e) => { e.preventDefault(); router.get('/admin/commission', q(), { preserveState: true, preserveScroll: true }); }}
                >
                    <label className="text-xs font-semibold text-gray-500">From
                        <input type="date" className={`${input} mt-1 block`} value={f.from} max={f.to} onChange={(e) => setF({ ...f, from: e.target.value })} />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">To
                        <input type="date" className={`${input} mt-1 block`} value={f.to} min={f.from} onChange={(e) => setF({ ...f, to: e.target.value })} />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">Seller
                        <select className={`${input} mt-1 block`} value={f.seller_id ?? ''} onChange={(e) => setF({ ...f, seller_id: e.target.value ? Number(e.target.value) : null })}>
                            <option value="">All sellers</option>
                            {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </label>
                    <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"><Search className="h-4 w-4" /> Calculate</button>
                </form>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        ['Delivered orders', summary.orders.toLocaleString()],
                        ['Gross sales', peso(summary.gross_sales)],
                        [`Total commission (${(rate * 100).toFixed(0)}%)`, peso(summary.commission)],
                        ['Sellers’ net', peso(summary.seller_net)],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
                            <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
                        </div>
                    ))}
                </div>

                {truncated && <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Result limited to the latest 5,000 order lines. Narrow the date range for exact totals.</div>}

                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Per seller</h3>
                <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr><th className="px-4 py-2">Seller</th><th className="px-4 py-2 text-right">Orders</th><th className="px-4 py-2 text-right">Gross sales</th><th className="px-4 py-2 text-right">Commission</th><th className="px-4 py-2 text-right">Seller net</th></tr>
                        </thead>
                        <tbody>
                            {bySeller.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No delivered orders in this period.</td></tr>}
                            {bySeller.map((r) => (
                                <tr key={r.seller} className="border-t border-gray-100">
                                    <td className="px-4 py-2 font-medium text-gray-900">{r.seller}</td>
                                    <td className="px-4 py-2 text-right">{r.orders}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.gross_sales)}</td>
                                    <td className="px-4 py-2 text-right font-semibold text-[#3B1F6B]">{peso(r.commission)}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.seller_net)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Per order</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr><th className="px-4 py-2">Order</th><th className="px-4 py-2">Delivered</th><th className="px-4 py-2">Seller</th><th className="px-4 py-2 text-right">Gross sales</th><th className="px-4 py-2 text-right">Commission</th></tr>
                        </thead>
                        <tbody>
                            {byOrder.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No delivered orders in this period.</td></tr>}
                            {byOrder.map((r) => (
                                <tr key={r.order_id} className="border-t border-gray-100">
                                    <td className="px-4 py-2 font-mono text-xs">{r.order_number}</td>
                                    <td className="px-4 py-2">{r.date}</td>
                                    <td className="px-4 py-2">{r.seller}</td>
                                    <td className="px-4 py-2 text-right">{peso(r.gross_sales)}</td>
                                    <td className="px-4 py-2 text-right font-semibold text-[#3B1F6B]">{peso(r.commission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminShell>
        </>
    );
}
