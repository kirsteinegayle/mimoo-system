import { useApprovalPolling } from '@/hooks/use-approval-polling';

/** Mounted on the pending-approval pages: shows the result once the admin decides, and signs the user in on approval. */
export default function ApprovalWatcher() {
    const { state, message } = useApprovalPolling();

    if (state !== 'approved' && state !== 'rejected') return null;

    const ok = state === 'approved';

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed inset-x-0 top-0 z-50 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg ${ok ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
            {ok ? `✓ ${message}` : message}
        </div>
    );
}
