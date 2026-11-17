import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * ONE reusable modal for the whole app.
 *
 *  - <AppModal>            presentational dialog (title, body, Cancel / Confirm buttons)
 *  - confirmDialog(...)    replaces window.confirm()  -> Promise<boolean>
 *  - alertDialog(...)      replaces window.alert()    -> Promise<void>
 *                          (success messages show as a toast instead of blocking)
 *  - <AppDialogHost />     mounted once in app.tsx; renders the dialogs requested above
 *
 * Buttons use the same styles as the rest of the system: primary purple #3B1F6B,
 * destructive red, outlined grey Cancel (rounded-lg, font-semibold).
 */

export type ModalTone = 'primary' | 'danger' | 'success' | 'info';

export interface AppModalProps {
    open: boolean;
    title: string;
    children?: ReactNode;
    tone?: ModalTone;
    confirmLabel?: string;
    /** Pass null to hide the Cancel button (alert-style). */
    cancelLabel?: string | null;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const TONE_ICON: Record<ModalTone, { bg: string; fg: string; Icon: typeof Info }> = {
    primary: { bg: 'bg-[#F1EDFB]', fg: 'text-[#3B1F6B]', Icon: Info },
    info: { bg: 'bg-[#F1EDFB]', fg: 'text-[#3B1F6B]', Icon: Info },
    danger: { bg: 'bg-red-100', fg: 'text-red-600', Icon: AlertTriangle },
    success: { bg: 'bg-green-100', fg: 'text-green-600', Icon: CheckCircle2 },
};

export function AppModal({ open, title, children, tone = 'primary', confirmLabel = 'Confirm', cancelLabel = 'Cancel', busy = false, onConfirm, onCancel }: AppModalProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    // Callers pass inline handlers (new function every render). Keep the latest in a ref so the
    // effects below depend on `open` only: otherwise every keystroke in a field inside the modal
    // re-ran the effect and moved focus to the Confirm button.
    const onCancelRef = useRef(onCancel);
    onCancelRef.current = onCancel;

    useEffect(() => {
        if (!open) return;
        // Focus the first text field in the body (e.g. a reason box), otherwise the Confirm button.
        (bodyRef.current?.querySelector<HTMLElement>('textarea, input') ?? confirmRef.current)?.focus();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancelRef.current();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    if (!open) return null;
    const { bg, fg, Icon } = TONE_ICON[tone];
    const confirmCls =
        tone === 'danger'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-[#3B1F6B] text-white hover:bg-[#2E1850]';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
        >
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" style={{ fontFamily: 'Syne, Poppins, sans-serif' }}>
                <button type="button" onClick={onCancel} aria-label="Close" className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <X className="h-4 w-4" />
                </button>
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-6 w-6 ${fg}`} />
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-gray-900">{title}</h3>
                {children && <div ref={bodyRef} className="mb-6 whitespace-pre-line text-center text-sm text-gray-600">{children}</div>}
                <div className="flex items-center gap-3">
                    {cancelLabel !== null && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={busy}
                            className="flex-1 rounded-lg border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className={`flex-1 rounded-lg px-5 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmCls}`}
                    >
                        {busy ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── imperative API ───────────────────────────────────────────────────────────

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ModalTone;
}

type Request =
    | { kind: 'confirm'; opts: ConfirmOptions; resolve: (v: boolean) => void }
    | { kind: 'alert'; opts: ConfirmOptions; resolve: () => void };

let push: ((r: Request) => void) | null = null;

const DANGER = /\b(delete|remove|reject|disapprove|cancel|discard)\b/i;

/** Promise-based replacement for window.confirm(). Falls back to the native one only if the host is not mounted. */
export function confirmDialog(input: string | ConfirmOptions): Promise<boolean> {
    const opts = typeof input === 'string' ? { message: input } : input;
    if (!push) return Promise.resolve(window.confirm(opts.message));
    return new Promise((resolve) => push!({ kind: 'confirm', opts, resolve }));
}

const SUCCESS = /(success|submitted|saved|updated|uploaded|confirmed|approved|rejected|assigned|generated|received)/i;
const FAILURE = /(fail|error|could not|cannot|invalid|expired|please|required|too large|only|not found|select)/i;

/** Replacement for window.alert(). Success messages are shown as a toast; everything else as a modal. */
export function alertDialog(input: string | ConfirmOptions): Promise<void> {
    const opts = typeof input === 'string' ? { message: input } : input;
    const text = opts.message.replace(/^[✅❌✓]\s*/u, '');
    if (typeof input === 'string' && SUCCESS.test(text) && !FAILURE.test(text)) {
        toast.success(text);
        return Promise.resolve();
    }
    if (!push) {
        window.alert(opts.message);
        return Promise.resolve();
    }
    return new Promise((resolve) => push!({ kind: 'alert', opts: { ...opts, message: text }, resolve }));
}

export function AppDialogHost() {
    const [queue, setQueue] = useState<Request[]>([]);

    useEffect(() => {
        push = (r) => setQueue((q) => [...q, r]);
        return () => {
            push = null;
        };
    }, []);

    const current = queue[0];
    if (!current) return null;

    const done = (value: boolean) => {
        if (current.kind === 'confirm') current.resolve(value);
        else current.resolve();
        setQueue((q) => q.slice(1));
    };

    const o = current.opts;
    const isConfirm = current.kind === 'confirm';
    const tone: ModalTone = o.tone ?? (isConfirm ? (DANGER.test(o.message) ? 'danger' : 'primary') : 'info');

    return (
        <AppModal
            open
            tone={tone}
            title={o.title ?? (isConfirm ? 'Please confirm' : 'Notice')}
            confirmLabel={o.confirmLabel ?? (isConfirm ? 'Confirm' : 'OK')}
            cancelLabel={isConfirm ? (o.cancelLabel ?? 'Cancel') : null}
            onConfirm={() => done(true)}
            onCancel={() => done(false)}
        >
            {o.message}
        </AppModal>
    );
}
