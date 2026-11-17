import { fmtDate, jsonFetch } from '@/lib/json-fetch';
import { Loader2, PackageX, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Buyer web: report a parcel problem for one order (damaged, lost, wrong item,
 * not received). GET/POST /buyer/orders/{id}/parcel-report (same rules as the app).
 * Hidden until the order has shipped and there is nothing to show.
 */

interface Report {
    id: number;
    reason_label: string;
    status: 'open' | 'reviewed' | 'resolved';
    created_at: string | null;
    resolved_at: string | null;
}

const STATUS: Record<Report['status'], { label: string; cls: string }> = {
    open: { label: 'Sent - waiting for review', cls: 'bg-amber-50 text-amber-700' },
    reviewed: { label: 'Under review', cls: 'bg-sky-50 text-sky-700' },
    resolved: { label: 'Resolved', cls: 'bg-emerald-50 text-emerald-700' },
};

export function ParcelReportCard({ orderId }: { orderId: number }) {
    const [report, setReport] = useState<Report | null>(null);
    const [canReport, setCanReport] = useState(false);
    const [reasons, setReasons] = useState<Record<string, string>>({});
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const json = await jsonFetch<{ data: Report | null; meta: { can_report: boolean; reasons: Record<string, string> } }>(
                `/buyer/orders/${orderId}/parcel-report`,
            );
            setReport(json.data);
            setCanReport(json.meta.can_report);
            setReasons(json.meta.reasons);
        } catch {
            setCanReport(false);
        } finally {
            setLoaded(true);
        }
    }, [orderId]);

    useEffect(() => {
        load();
    }, [load]);

    if (!loaded || (!report && !canReport)) return null;

    const submit = async () => {
        setBusy(true);
        setError(null);
        try {
            const json = await jsonFetch<{ message: string }>(`/buyer/orders/${orderId}/parcel-report`, 'POST', { reason, description });
            setNotice(json.message);
            setOpen(false);
            setReason('');
            setDescription('');
            await load();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PackageX className="h-5 w-5 text-purple-600" />
                        Parcel problem
                    </h2>
                    {report ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-gray-700">{report.reason_label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[report.status].cls}`}>{STATUS[report.status].label}</span>
                            <span className="text-xs text-gray-400">{fmtDate(report.created_at)}</span>
                        </div>
                    ) : (
                        <p className="mt-1 text-sm text-gray-500">Parcel damaged, lost, wrong item or not received? Tell us and our team will check.</p>
                    )}
                    {notice && <p className="mt-2 text-sm text-emerald-700">{notice}</p>}
                </div>
                {canReport && (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
                    >
                        <PackageX className="h-4 w-4" />
                        {report ? 'Report another problem' : 'Report a problem'}
                    </button>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setOpen(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <p className="text-sm font-semibold text-gray-900">Report a parcel problem</p>
                            <button onClick={() => setOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3 px-5 py-4">
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(reasons).map(([k, v]) => (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => setReason(k)}
                                        className={`rounded-lg border px-3 py-2 text-left text-sm ${reason === k ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                                rows={4}
                                placeholder="What happened? (e.g. box was crushed, item missing)"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                            <p className="text-right text-[10px] text-gray-400">{description.length}/1000</p>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-2 border-t px-5 py-3">
                            <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
                                Cancel
                            </button>
                            <button
                                onClick={submit}
                                disabled={busy || !reason || description.trim().length < 5}
                                className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
