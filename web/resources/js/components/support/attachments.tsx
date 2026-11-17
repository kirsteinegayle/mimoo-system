import { Paperclip, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Ticket attachments: picker (validates type / size / count before upload, shows previews) and a list that
 * renders image thumbnails or PDF links. The server re-validates everything (SupportAttachmentService).
 */
export const MAX_FILES = 3;
export const MAX_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export interface TicketFile { id: number; name: string; mime: string; size: number; is_image: boolean; url: string }

/** Build the multipart body for a ticket / reply: plain fields + attachments[]. */
export function withFiles(fields: Record<string, string | number | null | undefined>, files: File[]): FormData {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => v !== null && v !== undefined && v !== '' && fd.append(k, String(v)));
    files.forEach((f) => fd.append('attachments[]', f));
    return fd;
}

export function AttachmentPicker({ files, onChange, disabled }: { files: File[]; onChange: (f: File[]) => void; disabled?: boolean }) {
    const ref = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');
    const previews = useMemo(() => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : '')), [files]);
    useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

    const add = (list: FileList | null) => {
        if (!list) return;
        setError('');
        const next = [...files];
        for (const f of Array.from(list)) {
            if (!ALLOWED.includes(f.type)) {
                setError(`"${f.name}" is not allowed. Use JPG, PNG, WEBP or PDF.`);
                continue;
            }
            if (f.size > MAX_MB * 1024 * 1024) {
                setError(`"${f.name}" is larger than ${MAX_MB} MB.`);
                continue;
            }
            if (next.length >= MAX_FILES) {
                setError(`You can attach up to ${MAX_FILES} files.`);
                break;
            }
            next.push(f);
        }
        onChange(next);
        if (ref.current) ref.current.value = '';
    };

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={disabled || files.length >= MAX_FILES} onClick={() => ref.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    <Paperclip className="h-3.5 w-3.5" /> Attach photo / PDF
                </button>
                <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => add(e.target.files)} />
                {files.map((f, i) => (
                    <span key={i} className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-lg bg-gray-100 py-1 pl-1.5 pr-1 text-xs text-gray-700">
                        {previews[i] ? <img src={previews[i]} alt="" className="h-6 w-6 rounded object-cover" /> : <span className="rounded bg-red-100 px-1 text-[9px] font-bold text-red-700">PDF</span>}
                        <span className="truncate">{f.name}</span>
                        <button type="button" onClick={() => onChange(files.filter((_, n) => n !== i))} aria-label={`Remove ${f.name}`} className="rounded p-0.5 text-gray-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                    </span>
                ))}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function AttachmentList({ files, dark }: { files?: TicketFile[]; dark?: boolean }) {
    if (!files?.length) return null;
    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {files.map((f) =>
                f.is_image ? (
                    <a key={f.id} href={f.url} target="_blank" rel="noreferrer" title={f.name}>
                        <img src={f.url} alt={f.name} className="h-20 w-20 rounded-lg border border-white/30 object-cover" loading="lazy" />
                    </a>
                ) : (
                    <a key={f.id} href={`${f.url}?download=1`} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold underline ${dark ? 'bg-white/15 text-white' : 'bg-white text-gray-700'}`}>
                        <Paperclip className="h-3 w-3" /> {f.name} ({Math.max(1, Math.round(f.size / 1024))} KB)
                    </a>
                ),
            )}
        </div>
    );
}
