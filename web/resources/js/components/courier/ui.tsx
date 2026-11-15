import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Courier portal UI kit: brand mark, page header, stat cards, status badges.
// Mimoo palette: deep purple gradient (#1c1430 → #3a2d5c → #6a5a8a), violet
// accents (#4B2E7E / #9B5DE5) and a cow-print brand mark.
// ---------------------------------------------------------------------------

export const BRAND_GRADIENT = 'linear-gradient(160deg, #1c1430 0%, #2B2249 45%, #3a2d5c 75%, #6a5a8a 130%)';
export const HERO_GRADIENT = 'linear-gradient(120deg, #1c1430 0%, #3a2d5c 55%, #6a5a8a 100%)';

/** Cow-print brand mark (white disc with black spots). */
export function CowMark({ size = 36 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
            <defs>
                <clipPath id="cow-disc">
                    <circle cx="20" cy="20" r="18" />
                </clipPath>
            </defs>
            <circle cx="20" cy="20" r="19" fill="#fff" />
            <g clipPath="url(#cow-disc)" fill="#1c1430">
                <path d="M4 9c4-3 9-2 10 2s-3 7-7 7-6-6-3-9z" />
                <path d="M24 4c5-1 10 2 9 6s-6 4-9 2-4-7 0-8z" />
                <path d="M21 22c4-2 9 0 9 4s-4 7-8 6-5-8-1-10z" />
                <path d="M3 27c3-1 6 1 6 4s-3 5-6 4-3-7 0-8z" />
                <circle cx="14" cy="21" r="1.8" />
                <circle cx="33" cy="20" r="1.6" />
            </g>
            <circle cx="20" cy="20" r="18.5" fill="none" stroke="#9B5DE5" strokeWidth="1.5" />
        </svg>
    );
}

export function PageHeader({ title, subtitle, actions, icon: Icon }: { title: string; subtitle?: string; actions?: ReactNode; icon?: LucideIcon }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
                {Icon && (
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1ECFA] text-[#4B2E7E]">
                        <Icon className="h-5 w-5" />
                    </span>
                )}
                <div>
                    <h1 className="text-xl font-bold text-[#1c1430] sm:text-2xl">{title}</h1>
                    {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

const TONES = {
    violet: { icon: 'bg-violet-100 text-violet-700', ring: 'hover:ring-violet-200' },
    blue: { icon: 'bg-sky-100 text-sky-700', ring: 'hover:ring-sky-200' },
    amber: { icon: 'bg-amber-100 text-amber-700', ring: 'hover:ring-amber-200' },
    green: { icon: 'bg-emerald-100 text-emerald-700', ring: 'hover:ring-emerald-200' },
    red: { icon: 'bg-rose-100 text-rose-700', ring: 'hover:ring-rose-200' },
    gray: { icon: 'bg-gray-100 text-gray-600', ring: 'hover:ring-gray-200' },
} as const;
export type Tone = keyof typeof TONES;

export function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'violet',
    href,
}: {
    label: string;
    value: ReactNode;
    hint?: string;
    icon: LucideIcon;
    tone?: Tone;
    href?: string;
}) {
    const t = TONES[tone];
    const body = (
        <>
            <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}>
                    <Icon className="h-5 w-5" />
                </span>
                {href && <span className="text-xs font-semibold text-gray-400 transition group-hover:text-[#4B2E7E]">View →</span>}
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums text-[#1c1430]">{value}</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-700">{label}</p>
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </>
    );
    const cls = `group block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md ${t.ring}`;
    return href ? (
        <Link href={href} className={cls}>
            {body}
        </Link>
    ) : (
        <div className={cls}>{body}</div>
    );
}

const BADGE: Record<string, { label: string; cls: string }> = {
    // delivery jobs
    assigned: { label: 'Assigned', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
    out_for_delivery: { label: 'Out for delivery', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
    delivered: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    failed: { label: 'Failed attempt', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
    return_to_sender: { label: 'Returned to sender', cls: 'bg-gray-100 text-gray-700 ring-gray-200' },
    // shipment assignments
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
    accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    rejected: { label: 'Rejected', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
    expired: { label: 'Expired', cls: 'bg-gray-100 text-gray-600 ring-gray-200' },
    // orders
    in_transit: { label: 'In transit', cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
    shipped: { label: 'Shipped', cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
    completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
    waiting: { label: 'Waiting for rider', cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
    awaiting_pickup: { label: 'Awaiting pickup', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

export const prettyStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function StatusBadge({ status, label }: { status: string; label?: string }) {
    const b = BADGE[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                b?.cls ?? 'bg-gray-100 text-gray-700 ring-gray-200'
            }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {label ?? b?.label ?? prettyStatus(status)}
        </span>
    );
}

export function Card({ title, subtitle, actions, children, className = '' }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
            {(title || actions) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div>
                        {title && <h2 className="text-base font-bold text-[#1c1430]">{title}</h2>}
                        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                    </div>
                    {actions}
                </div>
            )}
            {children}
        </section>
    );
}
