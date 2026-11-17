import { Head, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppModal } from '@/components/app-modal';
import AdminShell from '@/layouts/admin/admin-shell';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    status_reason: string | null;
    warning_count: number;
    created_at: string | null;
}

interface Props {
    users: UserRow[];
    filters: { role: string; status: string; q: string };
    counts: { total: number; active: number; suspended: number; deactivated: number };
    pagination: { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
}

interface Profile {
    id: number;
    name: string;
    email: string;
    contact_number: string | null;
    role: string;
    status: string;
    status_reason: string | null;
    status_changed_at: string | null;
    business_name: string | null;
    registered_category: string | null;
    address: string | null;
    verification: string | null;
    joined: string | null;
    stats: Record<string, number>;
    logs: { action: string; from: string | null; to: string; reason: string | null; by: string; at: string }[];
}

type Action = 'activate' | 'suspend' | 'deactivate';

const ROLE_LABEL: Record<string, string> = { buyer: 'Buyer', seller: 'Seller', courier: 'Courier', logistics_staff: 'Logistics', rider: 'Rider' };
const STATUS_STYLE: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    suspended: 'bg-amber-50 text-amber-700',
    deactivated: 'bg-gray-100 text-gray-600',
    pending: 'bg-sky-50 text-sky-700',
    disapproved: 'bg-red-50 text-red-700',
};

export const StatusBadge = ({ status }: { status: string }) => (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
);

export default function UserAccounts({ users, filters, counts, pagination }: Props) {
    const [f, setF] = useState(filters);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [pending, setPending] = useState<{ user: { id: number; name: string }; action: Action } | null>(null);
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    const go = (next: typeof f, page = 1) =>
        router.get('/admin/user-accounts', { ...next, page }, { preserveState: true, preserveScroll: true, replace: true });

    // live search (debounced)
    useEffect(() => {
        if (f.q === filters.q) return;
        const t = setTimeout(() => go(f), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [f.q]);

    async function openProfile(id: number) {
        setLoadingId(id);
        try {
            const r = await fetch(`/admin/user-accounts/${id}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!r.ok) throw new Error();
            setProfile(await r.json());
        } catch {
            toast.error('Could not load this profile.');
        } finally {
            setLoadingId(null);
        }
    }

    function ask(user: { id: number; name: string }, action: Action) {
        setReason('');
        setErrors({});
        setPending({ user, action });
    }

    function submit() {
        if (!pending) return;
        setBusy(true);
        router.post(
            `/admin/user-accounts/${pending.user.id}/status`,
            { action: pending.action, reason: reason.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${pending.user.name} was ${pending.action === 'activate' ? 'activated' : pending.action === 'suspend' ? 'suspended' : 'deactivated'}.`);
                    setPending(null);
                    setProfile(null);
                },
                onError: (e) => setErrors(e as Record<string, string>),
                onFinish: () => setBusy(false),
            },
        );
    }

    const input = 'h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30';
    const needsReason = pending && pending.action !== 'activate';
    const canActivate = (s: string) => s === 'suspended' || s === 'deactivated';
    const canBlock = (s: string) => s === 'active' || s === 'suspended' || s === 'deactivated';

    const actions = (id: number, name: string, status: string) => (
        <div className="flex justify-end gap-1.5">
            {canActivate(status) && (
                <button onClick={() => ask({ id, name }, 'activate')} className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Activate</button>
            )}
            {canBlock(status) && status !== 'suspended' && (
                <button onClick={() => ask({ id, name }, 'suspend')} className="rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">Suspend</button>
            )}
            {canBlock(status) && status !== 'deactivated' && (
                <button onClick={() => ask({ id, name }, 'deactivate')} className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Deactivate</button>
            )}
        </div>
    );

    return (
        <>
            <Head title="User Accounts" />
            <AdminShell active="user-accounts">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">User Accounts</h1>
                    <p className="mt-1 text-sm text-gray-500">View profiles and activate, suspend or deactivate buyer, seller, courier and rider accounts.</p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        ['All users', counts.total],
                        ['Active', counts.active],
                        ['Suspended', counts.suspended],
                        ['Deactivated', counts.deactivated],
                    ].map(([label, value]) => (
                        <div key={label as string} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
                            <div className="mt-1 text-xl font-bold text-gray-900">{(value as number).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input className={`${input} w-64 pl-9`} placeholder="Search name, email, phone" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
                    </div>
                    <select className={input} value={f.role} onChange={(e) => { const n = { ...f, role: e.target.value }; setF(n); go(n); }}>
                        <option value="">All roles</option>
                        {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select className={input} value={f.status} onChange={(e) => { const n = { ...f, status: e.target.value }; setF(n); go(n); }}>
                        <option value="">All statuses</option>
                        {['active', 'suspended', 'deactivated', 'pending', 'disapproved'].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No users match these filters.</td></tr>
                            )}
                            {users.map((u) => (
                                <tr key={u.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">{u.name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{ROLE_LABEL[u.role] ?? u.role}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={u.status} />
                                        {u.warning_count > 0 && <span className="ml-2 text-xs text-amber-600">{u.warning_count} warning{u.warning_count > 1 ? 's' : ''}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{u.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openProfile(u.id)} disabled={loadingId === u.id} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                                <Eye className="h-3.5 w-3.5" /> Profile
                                            </button>
                                            {actions(u.id, u.name, u.status)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Showing {pagination.from}–{pagination.to} of {pagination.total}</span>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page <= 1} onClick={() => go(f, pagination.current_page - 1)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
                            <button disabled={pagination.current_page >= pagination.last_page} onClick={() => go(f, pagination.current_page + 1)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}

                {/* Profile */}
                {profile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setProfile(null)}>
                        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                                    <p className="text-sm text-gray-500">{ROLE_LABEL[profile.role] ?? profile.role} · joined {profile.joined}</p>
                                </div>
                                <StatusBadge status={profile.status} />
                            </div>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                                {([
                                    ['Email', profile.email],
                                    ['Phone', profile.contact_number],
                                    ['Business', profile.business_name],
                                    ['Registered category', profile.registered_category],
                                    ['Address', profile.address],
                                    ['Email verification', profile.verification],
                                ] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k} className={k === 'Address' ? 'col-span-2' : ''}>
                                        <dt className="text-xs text-gray-400">{k}</dt>
                                        <dd className="break-words font-medium capitalize-first text-gray-800">{v}</dd>
                                    </div>
                                ))}
                                {Object.entries(profile.stats).map(([k, v]) => (
                                    <div key={k}><dt className="text-xs text-gray-400">{k}</dt><dd className="font-medium text-gray-800">{v.toLocaleString()}</dd></div>
                                ))}
                            </dl>
                            {profile.status_reason && (
                                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                    <span className="font-semibold">Reason ({profile.status_changed_at}):</span> {profile.status_reason}
                                </p>
                            )}
                            <h4 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-gray-700">Status history</h4>
                            {profile.logs.length === 0 ? (
                                <p className="text-sm text-gray-400">No status changes yet.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {profile.logs.map((l, i) => (
                                        <li key={i} className="rounded-lg border border-gray-100 p-3">
                                            <span className="font-semibold capitalize">{l.action}</span> by {l.by} · <span className="text-gray-500">{l.at}</span>
                                            {l.reason && <p className="mt-1 text-gray-600">{l.reason}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-5 flex items-center justify-between gap-3">
                                {actions(profile.id, profile.name, profile.status)}
                                <button onClick={() => setProfile(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm (reason required for suspend / deactivate) */}
                <AppModal
                    open={!!pending}
                    tone={pending?.action === 'activate' ? 'success' : pending?.action === 'suspend' ? 'primary' : 'danger'}
                    title={pending ? `${pending.action === 'activate' ? 'Activate' : pending.action === 'suspend' ? 'Suspend' : 'Deactivate'} ${pending.user.name}?` : ''}
                    confirmLabel={pending ? pending.action[0].toUpperCase() + pending.action.slice(1) : 'Confirm'}
                    busy={busy}
                    onConfirm={submit}
                    onCancel={() => !busy && setPending(null)}
                >
                    {pending?.action === 'activate'
                        ? 'The user will be able to sign in again.'
                        : 'The user is signed out right away and cannot log in (web or app) until you activate the account again.'}
                    {needsReason && (
                        <div className="mt-4 text-left">
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Reason (shown to the user) *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.reason ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#3B1F6B]/30`}
                                placeholder="e.g. Selling prohibited items"
                            />
                        </div>
                    )}
                    {(errors.reason || errors.action) && <p className="mt-2 text-left text-xs text-red-600">{errors.reason || errors.action}</p>}
                </AppModal>
            </AdminShell>
        </>
    );
}
