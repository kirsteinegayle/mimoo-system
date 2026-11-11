import { Head, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import CourierLayout from './CourierLayout';

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

const JOB_STATUS_LABEL: Record<string, string> = {
    assigned: 'Assigned',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    failed: 'Failed attempt',
    return_to_sender: 'Returned to sender',
};

const JOB_STATUS_CLASS: Record<string, string> = {
    assigned: 'bg-blue-50 text-blue-700',
    out_for_delivery: 'bg-amber-50 text-amber-700',
    delivered: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
    return_to_sender: 'bg-gray-100 text-gray-700',
};

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function DeliveryManagement({ auth, company, orders = [], riders = [] }: Props) {
    const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
    const [selectedRider, setSelectedRider] = useState<string>('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [processing, setProcessing] = useState(false);

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

    const waitingCount = orders.filter((o) => o.assignable).length;

    return (
        <CourierLayout auth={auth} company={company} activeTab="delivery-management" pageTitle="Delivery Management">
            <Head title="Delivery Management" />

            <div className="max-w-7xl mx-auto space-y-4">
                {notice && (
                    <div
                        role={notice.type === 'error' ? 'alert' : 'status'}
                        className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                            notice.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <span>{notice.text}</span>
                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            className="shrink-0 font-medium opacity-70 hover:opacity-100"
                            aria-label="Dismiss message"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">Waiting for a rider</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{waitingCount}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">With a delivery job</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{orders.filter((o) => o.job).length}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">Available riders</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{riders.length}</p>
                    </div>
                </div>

                {riders.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        No available riders. Approve rider applications in Rider Management first. A rider must be active, approved
                        and verified to take deliveries.
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-gray-900">Deliveries</h2>
                        <p className="text-xs text-gray-500">
                            Orders accepted by your company that are in transit or shipped. Assign a rider to create a delivery job in the
                            rider app.
                        </p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="px-5 py-12 text-center text-sm text-gray-500">
                            No orders are ready for delivery yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
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
                                    {orders.map((order) => (
                                        <tr key={order.id} className="align-top">
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-900">{order.order_number}</p>
                                                <p className="text-xs text-gray-500">{order.waybill_number || 'No waybill'}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-gray-900">{order.shipping_name || '—'}</p>
                                                <p className="max-w-xs text-xs text-gray-500">{order.shipping_address || ''}</p>
                                            </td>
                                            <td className="px-5 py-3 text-gray-700">
                                                {order.cod_amount > 0 ? `COD ${peso(order.cod_amount)}` : label(order.payment_method || 'paid')}
                                            </td>
                                            <td className="px-5 py-3 text-gray-700">{label(order.status)}</td>
                                            <td className="px-5 py-3">
                                                {order.job ? (
                                                    <div>
                                                        <span
                                                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                JOB_STATUS_CLASS[order.job.status] || 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {JOB_STATUS_LABEL[order.job.status] || label(order.job.status)}
                                                        </span>
                                                        <p className="mt-1 text-xs text-gray-600">{order.job.rider_name || 'Unknown rider'}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No rider yet</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {order.assignable ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openAssign(order)}
                                                        disabled={processing || riders.length === 0}
                                                        className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Assign Rider
                                                    </button>
                                                ) : order.job ? (
                                                    <span className="text-xs text-gray-400" title="Reassigning a rider is not available yet.">
                                                        Assigned
                                                    </span>
                                                ) : !order.picked_up ? (
                                                    <span className="text-xs text-amber-600" title="The parcel has not been picked up from the seller yet.">
                                                        Awaiting pickup
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not assignable</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="assign-title">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 id="assign-title" className="text-lg font-semibold text-gray-900">Assign Delivery Rider</h3>
                            <p className="text-xs text-gray-500">
                                {selectedOrder.order_number}
                                {selectedOrder.waybill_number ? ` · ${selectedOrder.waybill_number}` : ''}
                            </p>
                        </div>

                        <div className="space-y-4 px-6 py-4">
                            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                                <p className="font-medium text-gray-900">{selectedOrder.shipping_name || '—'}</p>
                                <p className="text-xs">{selectedOrder.shipping_address}</p>
                                {selectedOrder.cod_amount > 0 && (
                                    <p className="mt-1 text-xs font-medium">Collect COD: {peso(selectedOrder.cod_amount)}</p>
                                )}
                            </div>

                            {riders.length === 0 ? (
                                <p className="text-sm text-amber-700">No available riders. Approve rider applications in Rider Management first.</p>
                            ) : (
                                <div>
                                    <label htmlFor="assign-rider" className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Rider <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        id="assign-rider"
                                        value={selectedRider}
                                        onChange={(e) => setSelectedRider(e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
                                    >
                                        <option value="">Select rider</option>
                                        {riders.map((r) => (
                                            <option key={r.personnel_id} value={r.personnel_id}>
                                                {r.name}
                                                {r.vehicle_type ? ` · ${label(r.vehicle_type)}` : ''}
                                                {` · ${r.active_delivery_jobs} active`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Only active, approved riders of your company are listed.</p>
                                </div>
                            )}

                            {modalError && (
                                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                    {modalError}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeAssign}
                                disabled={processing}
                                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAssign}
                                disabled={!selectedRider || processing || riders.length === 0}
                                className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Assigning…' : 'Assign Rider'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CourierLayout>
    );
}

DeliveryManagement.layout = (page: ReactNode) => page;
