import { Head, router } from '@inertiajs/react';
import { Bike, CheckCircle2, Clock, MapPin, Search, Truck, Users, Wallet, X } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import CourierLayout from './CourierLayout';
import { Card, PageHeader, StatCard, StatusBadge, prettyStatus } from '@/components/courier/ui';

interface DeliveryRider {
    personnel_id: number;
    user_id: number;
    name: string;
    vehicle_type: string | null;
    active_delivery_jobs: number;
}

interface DeliveryOrder {
    id: number;
    order_number: string;
    waybill_number: string | null;
    status: string;
    shipping_name: string | null;
    shipping_address: string | null;
    payment_method: string | null;
    cod_amount: number;
    picked_up: boolean;
    assignable: boolean;
    job: {
        id: number;
        status: string;
        rider_name: string | null;
        assigned_at: string | null;
        pod?: {
            photo_url: string | null;
            recipient: string | null;
            delivered_at: string | null;
        } | null;
    } | null;
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
    orders?: DeliveryOrder[];
    riders?: DeliveryRider[];
}

type Filter = 'all' | 'waiting' | 'active' | 'done';

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ACTIVE = ['assigned', 'out_for_delivery'];

function stage(o: DeliveryOrder): Exclude<Filter, 'all'> | 'other' {
    if (o.assignable) return 'waiting';
    if (o.job && ACTIVE.includes(o.job.status)) return 'active';
    if (o.job) return 'done';
    return 'other';
}

function PaymentPill({ o }: { o: DeliveryOrder }) {
    return o.cod_amount > 0 ? (
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
            <Wallet className="h-3.5 w-3.5" /> COD {peso(o.cod_amount)}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> {prettyStatus(o.payment_method || 'paid')}
        </span>
    );
}

export default function DeliveryManagement({ auth, company, orders = [], riders = [] }: Props) {
    const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
    const [selectedRider, setSelectedRider] = useState<string>('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');

    // Server flashes { success } or { error } and redirects back (Inertia).
    const readFlash = (flash: unknown): { success?: string; error?: string } =>
        (flash && typeof flash === 'object' ? flash : {}) as { success?: string; error?: string };

    const openAssign = (order: DeliveryOrder) => {
        setSelectedOrder(order);
        setSelectedRider('');
        setModalError(null);
    };

    const closeAssign = () => {
        if (processing) return;
        setSelectedOrder(null);
        setSelectedRider('');
        setModalError(null);
    };

    const confirmAssign = () => {
        if (!selectedOrder || !selectedRider || processing) return;

        router.post(
            '/courier/delivery-management/assign',
            { order_id: selectedOrder.id, personnel_id: Number(selectedRider) },
            {
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                    setModalError(null);
                },
                onFinish: () => setProcessing(false),
                onSuccess: (page) => {
                    const flash = readFlash(page.flash);
                    if (flash.error) {
                        setModalError(flash.error);
                        return;
                    }
                    setSelectedOrder(null);
                    setSelectedRider('');
                    setNotice({ type: 'success', text: flash.success || 'Delivery rider assigned.' });
                },
                onError: (errors) => {
                    setModalError(Object.values(errors)[0] || 'Could not assign the rider. Please try again.');
                },
            },
        );
    };

    const counts = useMemo(() => {
        const c = { all: orders.length, waiting: 0, active: 0, done: 0 };
        orders.forEach((o) => {
            const s = stage(o);
            if (s !== 'other') c[s] += 1;
        });
        return c;
    }, [orders]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter(
            (o) =>
                (filter === 'all' || stage(o) === filter) &&
                (!q ||
                    o.order_number.toLowerCase().includes(q) ||
                    (o.waybill_number ?? '').toLowerCase().includes(q) ||
                    (o.shipping_name ?? '').toLowerCase().includes(q) ||
                    (o.job?.rider_name ?? '').toLowerCase().includes(q)),
        );
    }, [orders, filter, search]);

    const action = (order: DeliveryOrder, full = false) =>
        order.assignable ? (
            <button
                type="button"
                onClick={() => openAssign(order)}
                disabled={processing || riders.length === 0}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4B2E7E] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3B1F6B] disabled:cursor-not-allowed disabled:opacity-50 ${full ? 'w-full' : ''}`}
            >
                <Bike className="h-4 w-4" /> Assign rider
            </button>
        ) : order.job ? (
            <span className="text-xs text-gray-400" title="Reassigning a rider is not available yet.">
                Rider assigned
            </span>
        ) : !order.picked_up ? (
            <StatusBadge status="awaiting_pickup" />
        ) : (
            <span className="text-xs text-gray-400">Not assignable</span>
        );

    const delivery = (order: DeliveryOrder) =>
        order.job ? (
            <div className="space-y-1">
                <StatusBadge status={order.job.status} />
                <p className="flex items-center gap-1 text-xs text-gray-600">
                    <Bike className="h-3.5 w-3.5 text-gray-400" />
                    {order.job.rider_name || 'Unknown rider'}
                </p>
                {order.job.pod && (
                    <p className="text-xs text-gray-600">
                        Received by {order.job.pod.recipient || '—'}
                        {order.job.pod.delivered_at ? ` · ${order.job.pod.delivered_at}` : ''}
                        {order.job.pod.photo_url && (
                            <>
                                {' · '}
                                <a href={order.job.pod.photo_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#4B2E7E] hover:underline">
                                    View POD photo
                                </a>
                            </>
                        )}
                    </p>
                )}
            </div>
        ) : order.assignable ? (
            <StatusBadge status="waiting" />
        ) : (
            <span className="text-xs text-gray-400">No rider yet</span>
        );

    return (
        <CourierLayout auth={auth} company={company} activeTab="delivery-management" pageTitle="Delivery Management">
            <Head title="Delivery Management" />

            <div className="mx-auto max-w-7xl space-y-5">
                <PageHeader icon={Truck} title="Deliveries" subtitle="Assign riders to parcels that are ready for last-mile delivery." />

                {notice && (
                    <div
                        role={notice.type === 'error' ? 'alert' : 'status'}
                        className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                            notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
                        }`}
                    >
                        <span>{notice.text}</span>
                        <button type="button" onClick={() => setNotice(null)} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Dismiss message">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <StatCard label="Waiting for a rider" value={counts.waiting} icon={Clock} tone="violet" />
                    <StatCard label="Active deliveries" value={counts.active} icon={Truck} tone="amber" />
                    <StatCard label="Available riders" hint="Online and approved" value={riders.length} icon={Users} tone={riders.length ? 'green' : 'red'} />
                </div>

                {riders.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        No available riders. Approve rider applications in Rider Management first. A rider must be active, approved, verified and
                        online to take deliveries.
                    </div>
                )}

                <Card>
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1">
                            {(
                                [
                                    ['all', 'All'],
                                    ['waiting', 'Waiting'],
                                    ['active', 'Active'],
                                    ['done', 'Finished'],
                                ] as const
                            ).map(([key, text]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFilter(key)}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                                        filter === key ? 'bg-[#2B2249] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {text}
                                    <span className={`rounded-full px-1.5 text-[11px] ${filter === key ? 'bg-white/20' : 'bg-white text-gray-500'}`}>{counts[key]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative lg:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order, waybill, recipient, rider"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4B2E7E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/20"
                            />
                        </div>
                    </div>

                    {rows.length === 0 ? (
                        <div className="px-5 py-14 text-center text-gray-400">
                            <Truck className="mx-auto mb-3 h-10 w-10" />
                            <p className="text-sm font-medium text-gray-500">{orders.length === 0 ? 'No orders are ready for delivery yet.' : 'No orders match this filter.'}</p>
                        </div>
                    ) : (
                        <>
                            {/* Phones: cards */}
                            <ul className="divide-y divide-gray-100 md:hidden">
                                {rows.map((order) => (
                                    <li key={order.id} className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.order_number}</p>
                                                <p className="font-mono text-xs text-gray-500">{order.waybill_number || 'No waybill'}</p>
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900">{order.shipping_name || '—'}</p>
                                                <p className="text-xs text-gray-500">{order.shipping_address || ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <PaymentPill o={order} />
                                            {delivery(order)}
                                        </div>
                                        {order.assignable && action(order, true)}
                                    </li>
                                ))}
                            </ul>

                            {/* Tablet / desktop: table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-[#FAF8FD] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">Order</th>
                                            <th className="px-5 py-3">Recipient</th>
                                            <th className="px-5 py-3">Payment</th>
                                            <th className="px-5 py-3">Order status</th>
                                            <th className="px-5 py-3">Delivery</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rows.map((order) => (
                                            <tr key={order.id} className="align-top transition hover:bg-[#FAF8FD]">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                                                    <p className="font-mono text-xs text-gray-500">{order.waybill_number || 'No waybill'}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-900">{order.shipping_name || '—'}</p>
                                                    <p className="max-w-xs text-xs text-gray-500">{order.shipping_address || ''}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <PaymentPill o={order} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="px-5 py-4">{delivery(order)}</td>
                                                <td className="px-5 py-4 text-right">{action(order)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-4" onClick={closeAssign}>
                    <div
                        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="assign-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-[#1c1430] to-[#3a2d5c] px-6 py-4 text-white">
                            <h3 id="assign-title" className="text-lg font-bold">
                                Assign delivery rider
                            </h3>
                            <p className="text-xs text-violet-200">
                                {selectedOrder.order_number}
                                {selectedOrder.waybill_number ? ` · ${selectedOrder.waybill_number}` : ''}
                            </p>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div className="rounded-xl bg-[#F6F3FB] p-3 text-sm text-gray-700">
                                <p className="font-semibold text-gray-900">{selectedOrder.shipping_name || '—'}</p>
                                <p className="text-xs">{selectedOrder.shipping_address}</p>
                                {selectedOrder.cod_amount > 0 && <p className="mt-1.5 text-xs font-semibold text-amber-800">Collect COD: {peso(selectedOrder.cod_amount)}</p>}
                            </div>

                            {riders.length === 0 ? (
                                <p className="text-sm text-amber-700">No available riders. Approve rider applications in Rider Management first.</p>
                            ) : (
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-gray-800">
                                        Choose a rider <span className="text-rose-600">*</span>
                                    </p>
                                    <div className="max-h-64 space-y-2 overflow-y-auto">
                                        {riders.map((r) => {
                                            const on = selectedRider === String(r.personnel_id);
                                            return (
                                                <label
                                                    key={r.personnel_id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                                        on ? 'border-[#4B2E7E] bg-violet-50 ring-2 ring-[#4B2E7E]/20' : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="assign-rider"
                                                        value={r.personnel_id}
                                                        checked={on}
                                                        disabled={processing}
                                                        onChange={(e) => setSelectedRider(e.target.value)}
                                                        className="sr-only"
                                                    />
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2B2249] to-[#6a5a8a] text-xs font-bold text-white">
                                                        {r.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold text-gray-900">{r.name}</span>
                                                        <span className="block text-xs text-gray-500">
                                                            {r.vehicle_type ? prettyStatus(r.vehicle_type) : 'Vehicle not set'} · {r.active_delivery_jobs} active
                                                        </span>
                                                    </span>
                                                    {on && <CheckCircle2 className="h-5 w-5 text-[#4B2E7E]" />}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Only active, approved riders of your company who are online are listed.</p>
                                </div>
                            )}

                            {modalError && (
                                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                                    {modalError}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeAssign}
                                disabled={processing}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAssign}
                                disabled={!selectedRider || processing || riders.length === 0}
                                className="rounded-xl bg-[#4B2E7E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B1F6B] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Assigning…' : 'Assign rider'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CourierLayout>
    );
}

DeliveryManagement.layout = (page: ReactNode) => page;
