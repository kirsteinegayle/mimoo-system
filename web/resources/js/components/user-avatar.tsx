import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * One avatar for every role: the photo when there is one, otherwise (or when
 * the image fails to load) the initials in a colored circle. Never a broken
 * image or an empty grey dot.
 */

const COLORS = [
    'bg-violet-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-fuchsia-500',
];

export function avatarInitials(name?: string | null): string {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = Array.from(parts[0])[0] ?? '';
    const last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? '') : '';
    return (first + last).toUpperCase();
}

function colorFor(name?: string | null): string {
    const s = (name ?? '').trim().toLowerCase();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
}

export function UserAvatar({
    src,
    name,
    className = 'h-8 w-8 text-xs',
    ring = false,
}: {
    src?: string | null;
    name?: string | null;
    /** Size + text size classes, e.g. "h-10 w-10 text-sm". */
    className?: string;
    ring?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);
    const showImg = !!src && !failed;

    return (
        <span
            className={[
                'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold leading-none text-white select-none',
                showImg ? 'bg-gray-100' : colorFor(name),
                ring ? 'ring-2 ring-white/70' : '',
                className,
            ].join(' ')}
            aria-label={name ?? undefined}
        >
            {showImg ? (
                <img src={src!} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} loading="lazy" />
            ) : (
                <span aria-hidden="true">{avatarInitials(name)}</span>
            )}
        </span>
    );
}

/** The signed-in user's avatar (shared Inertia prop `currentAvatar`). */
export function useCurrentAvatar(): { url: string | null; name: string } | null {
    const props = usePage().props as { currentAvatar?: { url: string | null; name: string } | null };
    return props.currentAvatar ?? null;
}

/** Avatar of the signed-in user; `fallbackName` is used when not shared. */
export function CurrentUserAvatar({ fallbackName, className, ring }: { fallbackName?: string | null; className?: string; ring?: boolean }) {
    const me = useCurrentAvatar();
    return <UserAvatar src={me?.url ?? null} name={me?.name || fallbackName || ''} className={className} ring={ring} />;
}
