import { usePage } from '@inertiajs/react';
import { Megaphone, X } from 'lucide-react';
import { useState } from 'react';

interface Item {
    id: number;
    title: string;
    body: string;
    published_at: string | null;
}

const KEY = 'mimoo.dismissedAnnouncements';

function dismissed(): number[] {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

/** Published admin announcements for the signed-in user's role (shared Inertia prop `announcements`). */
export function AnnouncementBanner({ className = '' }: { className?: string }) {
    const { announcements = [] } = usePage<{ announcements?: Item[] }>().props;
    const [hidden, setHidden] = useState<number[]>(dismissed);

    const visible = announcements.filter((a) => !hidden.includes(a.id));
    if (visible.length === 0) return null;

    const close = (id: number) => {
        const next = [...hidden, id];
        setHidden(next);
        try {
            localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
            /* private mode: banner just comes back on reload */
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {visible.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-[#2A1B4D]">
                    <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-[#4B2E7E]" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">{a.title}</p>
                        <p className="whitespace-pre-line text-[#4B2E7E]/90">{a.body}</p>
                        {a.published_at && <p className="mt-1 text-xs text-gray-500">{a.published_at}</p>}
                    </div>
                    <button type="button" onClick={() => close(a.id)} aria-label="Dismiss announcement" className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
