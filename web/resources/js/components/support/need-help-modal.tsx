import { AttachmentPicker, withFiles } from '@/components/support/attachments';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Formal complaint form for buyers (Messages page "Need Help").
 * Submits a support ticket; the category decides where it is routed:
 *   Logistics issue    -> Logistics Support
 *   Seller / product   -> Admin Help and Support
 */
const CATEGORIES = [
    { value: 'logistics', label: 'Logistics issue', hint: 'Delivery, rider or parcel problem. Goes to Logistics Support.' },
    { value: 'seller_product', label: 'Seller / product issue', hint: 'Item, listing or seller problem. Goes to Admin Help and Support.' },
];

interface OrderOpt {
    id: number;
    order_number: string;
}

export default function NeedHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [category, setCategory] = useState('logistics');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [orders, setOrders] = useState<OrderOpt[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || orders.length) return;
        fetch('/orders/data', { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => (r.ok ? r.json() : { orders: [] }))
            .then((j) => setOrders((j.orders ?? []).map((o: any) => ({ id: o.id, order_number: o.order_number ?? `Order #${o.id}` }))))
            .catch(() => {});
    }, [open, orders.length]);

    if (!open) return null;

    const submit = async () => {
        setError('');
        if (subject.trim().length < 3 || message.trim().length < 10) {
            setError('Please add a subject (3+ characters) and describe the problem (10+ characters).');
            return;
        }
        setBusy(true);
        try {
            const r = await fetch('/support/tickets', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: withFiles({ category, subject: subject.trim(), message: message.trim(), order_id: orderId || null }, files),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) {
                setError(j.message || 'Could not send your complaint.');
                return;
            }
            toast.success(j.message || 'Complaint sent.');
            setSubject('');
            setMessage('');
            setOrderId('');
            setFiles([]);
            onClose();
        } finally {
            setBusy(false);
        }
    };

    const input = 'w-full rounded-lg border-[1.5px] border-[#E6DFF2] bg-white px-3 py-2 text-sm text-[#2A1B4D] focus:border-[#4B2E7E] focus:outline-none focus:ring-2 focus:ring-[#4B2E7E]/20';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#2A1B4D]">Need help? File a complaint</h3>
                <p className="mt-1 text-xs text-[#6E6570]">Choose what the problem is about so it reaches the right team.</p>

                <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setCategory(c.value)}
                                className={`rounded-lg border-[1.5px] p-3 text-left transition ${category === c.value ? 'border-[#4B2E7E] bg-[#F4F0FA]' : 'border-[#E6DFF2] hover:bg-[#FAF8FD]'}`}
                            >
                                <span className="block text-sm font-semibold text-[#2A1B4D]">{c.label}</span>
                                <span className="mt-0.5 block text-[0.72rem] text-[#6E6570]">{c.hint}</span>
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#2A1B4D]">Related order (optional)</label>
                        <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className={input}>
                            <option value="">None</option>
                            {orders.map((o) => (
                                <option key={o.id} value={o.id}>{o.order_number}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#2A1B4D]">Subject</label>
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} className={input} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#2A1B4D]">What happened?</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2000} className={`${input} resize-none`} />
                    </div>
                    <AttachmentPicker files={files} onChange={setFiles} disabled={busy} />
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>

                <div className="mt-5 flex gap-3">
                    <button type="button" onClick={onClose} disabled={busy} className="flex-1 rounded-lg border border-[#E6DFF2] py-2.5 text-sm font-semibold text-[#2A1B4D] hover:bg-[#FAF8FD]">
                        Cancel
                    </button>
                    <button type="button" onClick={submit} disabled={busy} className="flex-1 rounded-lg bg-[#4B2E7E] py-2.5 text-sm font-semibold text-white hover:bg-[#3a2360] disabled:opacity-60">
                        {busy ? 'Sending…' : 'Submit complaint'}
                    </button>
                </div>
            </div>
        </div>
    );
}
