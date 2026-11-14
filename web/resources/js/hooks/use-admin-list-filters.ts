import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export interface AdminListFilters {
    status: string; // all | pending | approved | disapproved
    sort: string; // newest | oldest
    q: string;
}

export interface AdminListPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

/**
 * Server-side filter / sort / search for the admin approval lists. Every change
 * is sent to the server as query params (status, sort, q) and the page is
 * re-rendered with the matching rows; changing a filter goes back to page 1.
 */
export function useAdminListFilters(path: string, filters: AdminListFilters) {
    const [search, setSearch] = useState(filters.q);
    const first = useRef(true);

    const visit = (next: Partial<AdminListFilters> & { page?: number }) => {
        const merged = { ...filters, q: search, ...next };
        const params: Record<string, string | number> = {};
        if (merged.status && merged.status !== 'all') params.status = merged.status;
        if (merged.sort && merged.sort !== 'newest') params.sort = merged.sort;
        if (merged.q) params.q = merged.q;
        if (next.page && next.page > 1) params.page = next.page;
        router.get(path, params, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Debounced search
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        if (search === filters.q) return;
        const t = setTimeout(() => visit({ q: search }), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return {
        statusFilter: filters.status === 'all' ? 'All' : filters.status.charAt(0).toUpperCase() + filters.status.slice(1),
        setStatusFilter: (label: string) => visit({ status: label.toLowerCase() }),
        sort: filters.sort,
        setSort: (sort: string) => visit({ sort }),
        search,
        setSearch,
        goToPage: (page: number) => visit({ page }),
    };
}
