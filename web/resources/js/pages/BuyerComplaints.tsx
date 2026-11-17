import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';
import { toast } from 'sonner';
import { BuyerHeader } from '@/components/buyer-header';

interface Props {
    orders: { id: number; label: string; sellers: { id: number; name: string }[] }[];
    types: { value: string; label: string }[];
    complaints: { id: number; order: string; type: string; description: string; status: string; resolution: string | null; created_at: string }[];
    preselectOrder: number | null;
}

const STATUS: Record<string, [string, string]> = {
    open: ['Open', 'bg-amber-50 text-amber-700'],
    in_review: ['In review', 'bg-sky-50 text-sky-700'],
    resolved: ['Resolved', 'bg-emerald-50 text-emerald-700'],
    rejected: ['Closed', 'bg-gray-100 text-gray-600'],
};

// Buyer web: file a complaint about an order (with evidence) and follow its status.
export default function BuyerComplaints({ orders, types, complaints, preselectOrder }: Props) {
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const fileRef = useRef<HTMLInputElement>(null);
    const form = useForm<{ order_id: string; seller_id: string; type: string; description: string; evidence: File[] }>({
        order_id: preselectOrder ? String(preselectOrder) : '',
        seller_id: '',
        type: '',
        description: '',
        evidence: [],
    });

    const order = orders.find((o) => String(o.id) === form.data.order_id);

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/complaints', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Your complaint was submitted.');
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    const base = 'w-full rounded-lg border-2 px-4 py-2.5 text-sm focus:outline-none focus:border-[#4B2E7E]';
    const cls = (k: string) => `${base} ${(form.errors as Record<string, string>)[k] ? 'border-red-300' : 'border-gray-200'}`;
    const err = (k: string) => ((form.errors as Record<string, string>)[k] ? <p className="mt-1 text-xs text-red-600">{(form.errors as Record<string, string>)[k]}</p> : null);

    return (
        <>
            <Head title="Report a problem" />
            <div className="min-h-screen bg-[#f6f4fa]">
                <BuyerHeader user={auth?.user} onLogout={() => router.post('/logout')} cartCount={0} />
                <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-5">
                    <form onSubmit={submit} className="rounded-xl border-2 border-[#E6DFF2] bg-white p-6 lg:col-span-3">
                        <h1 className="text-lg font-bold text-[#2A1B4D]">Report a problem with an order</h1>
                        <p className="mb-4 mt-1 text-sm text-gray-500">Tell us what went wrong. Add photos or a PDF as evidence. Our team reviews every complaint.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Order *</label>
                                <select className={cls('order_id')} value={form.data.order_id} onChange={(e) => form.setData({ ...form.data, order_id: e.target.value, seller_id: '' })}>
                                    <option value="">Select an order</option>
                                    {orders.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                                </select>
                                {err('order_id')}
                            </div>
                            {order && order.sellers.length > 1 && (
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Which seller? *</label>
                                    <select className={cls('seller_id')} value={form.data.seller_id} onChange={(e) => form.setData('seller_id', e.target.value)}>
                                        <option value="">Select a seller</option>
                                        {order.sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {err('seller_id')}
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Type of problem *</label>
                                <select className={cls('type')} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                    <option value="">Select a type</option>
                                    {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                {err('type')}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">What happened? *</label>
                                <textarea rows={5} maxLength={2000} className={cls('description')} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                                {err('description')}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Evidence (up to 5 files, JPG / PNG / WEBP / PDF, 5 MB each)</label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={(e) => form.setData('evidence', Array.from(e.target.files ?? []))}
                                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F1EDFB] file:px-4 file:py-2 file:font-semibold file:text-[#3B1F6B]"
                                />
                                {err('evidence')}
                                {Object.keys(form.errors).filter((k) => k.startsWith('evidence.')).map((k) => <p key={k} className="mt-1 text-xs text-red-600">{(form.errors as Record<string, string>)[k]}</p>)}
                            </div>
                        </div>

                        <button type="submit" disabled={form.processing} className="mt-5 rounded-lg bg-[#3B1F6B] px-5 py-2.5 font-semibold text-white hover:bg-[#2E1850] disabled:opacity-60">
                            {form.processing ? 'Submitting…' : 'Submit complaint'}
                        </button>
                    </form>

                    <section className="lg:col-span-2">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Your complaints</h2>
                        {complaints.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">You have not filed any complaints.</div>}
                        <div className="space-y-3">
                            {complaints.map((c) => (
                                <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-900">{c.order}</span>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[c.status]?.[1]}`}>{STATUS[c.status]?.[0] ?? c.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{c.type.split(' (')[0]} · {c.created_at}</p>
                                    <p className="mt-2 line-clamp-3 text-gray-700">{c.description}</p>
                                    {c.resolution && <p className="mt-2 rounded-lg bg-violet-50 p-2 text-[#4B2E7E]"><span className="font-semibold">Decision:</span> {c.resolution}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
