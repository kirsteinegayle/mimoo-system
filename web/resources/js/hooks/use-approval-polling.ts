import { useEffect, useState } from 'react';

export type ApprovalState = 'checking' | 'pending' | 'approved' | 'rejected' | 'unknown';

/**
 * Pending-approval pages: asks the server every few seconds whether the admin approved this
 * browser's registration. On approval the server signs the user in, so we only show the success
 * message and go to their dashboard.
 */
export function useApprovalPolling(intervalMs = 8000): { state: ApprovalState; message: string | null } {
    const [state, setState] = useState<ApprovalState>('checking');
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        let stopped = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const check = async () => {
            try {
                const res = await fetch('/register/approval-status', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
                const data = await res.json();
                if (stopped) return;
                if (data.state === 'approved') {
                    setState('approved');
                    setMessage(data.message ?? 'Your account was approved.');
                    timer = setTimeout(() => window.location.assign(data.redirect || '/dashboard'), 1800);
                    return;
                }
                if (data.state === 'rejected') {
                    setState('rejected');
                    setMessage(data.message ?? null);
                    return;
                }
                setState(data.state === 'pending' ? 'pending' : 'unknown');
                if (data.state !== 'pending') return; // nothing to poll for in this browser
            } catch {
                /* offline / transient: try again */
            }
            timer = setTimeout(check, intervalMs);
        };

        const onVisible = () => {
            if (document.visibilityState === 'visible' && !stopped) {
                clearTimeout(timer);
                check();
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        check();

        return () => {
            stopped = true;
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [intervalMs]);

    return { state, message };
}
