import { csrfHeaders } from '@/components/notification-bell';

/** Same-origin JSON request with CSRF; throws Error(message) on non-2xx. */
export async function jsonFetch<T = any>(url: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
    const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
            ...csrfHeaders(),
        },
        body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((json as any)?.message || `Request failed (${res.status})`);
    return json as T;
}

export function fmtDate(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
