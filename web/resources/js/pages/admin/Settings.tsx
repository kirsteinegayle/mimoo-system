import AdminShell from '@/layouts/admin/admin-shell';
import { csrfHeaders } from '@/components/notification-bell';
import { Head } from '@inertiajs/react';
import { KeyRound, Loader2, UserCog } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

// Admin settings. The admin team signs in with an access code (no user row),
// so "Change password" changes that code; it is stored hashed and replaces
// ADMIN_MASTER_CODE from then on.

interface Props {
    profile: { display_name: string; email: string };
    codeChangedAt: string | null;
}

type Msg = { ok: boolean; text: string } | null;

const field =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20';

async function post(url: string, body: unknown) {
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...csrfHeaders() },
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
}

const firstErrors = (json: any): Record<string, string> =>
    Object.fromEntries(Object.entries(json?.errors ?? {}).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]));

function Section({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B1F6B]/10 text-[#3B1F6B]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">{desc}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function Note({ msg }: { msg: Msg }) {
    if (!msg) return null;
    return (
        <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {msg.text}
        </p>
    );
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
            {children}
        </label>
    );
}

export default function AdminSettings({ profile, codeChangedAt }: Props) {
    const [p, setP] = useState(profile);
    const [pBusy, setPBusy] = useState(false);
    const [pMsg, setPMsg] = useState<Msg>(null);
    const [pErr, setPErr] = useState<Record<string, string>>({});

    const [c, setC] = useState({ current_code: '', new_code: '', new_code_confirmation: '' });
    const [cBusy, setCBusy] = useState(false);
    const [cMsg, setCMsg] = useState<Msg>(null);
    const [cErr, setCErr] = useState<Record<string, string>>({});
    const [changedAt, setChangedAt] = useState(codeChangedAt);

    async function saveProfile(e: FormEvent) {
        e.preventDefault();
        setPBusy(true);
        setPErr({});
        const { ok, json } = await post('/admin/settings/profile', p);
        setPBusy(false);
        setPErr(ok ? {} : firstErrors(json));
        setPMsg({ ok, text: json?.message || (ok ? 'Saved.' : 'Could not save.') });
    }

    async function saveCode(e: FormEvent) {
        e.preventDefault();
        setCBusy(true);
        setCErr({});
        const { ok, json } = await post('/admin/settings/password', c);
        setCBusy(false);
        setCErr(ok ? {} : firstErrors(json));
        setCMsg({ ok, text: json?.message || (ok ? 'Access code changed.' : 'Could not change the access code.') });
        if (ok) {
            setC({ current_code: '', new_code: '', new_code_confirmation: '' });
            setChangedAt(new Date().toISOString());
        }
    }

    const err = (m: Record<string, string>, k: string) => (m[k] ? <p className="mt-1 text-xs text-red-700">{m[k]}</p> : null);

    return (
        <AdminShell active="settings">
            <Head title="Settings - Admin" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">Admin profile and panel access code</p>
            </div>

            <div className="max-w-2xl space-y-6">
                <Section icon={UserCog} title="Profile" desc="How the admin team is identified in the panel.">
                    <form onSubmit={saveProfile} className="space-y-4">
                        <div>
                            <Label htmlFor="display_name">Display name</Label>
                            <input id="display_name" className={field} value={p.display_name} maxLength={60} onChange={(e) => setP({ ...p, display_name: e.target.value })} />
                            {err(pErr, 'display_name')}
                        </div>
                        <div>
                            <Label htmlFor="admin_email">Contact email (optional)</Label>
                            <input
                                id="admin_email"
                                type="email"
                                className={field}
                                value={p.email}
                                placeholder="admin@example.com"
                                onChange={(e) => setP({ ...p, email: e.target.value })}
                            />
                            {err(pErr, 'email')}
                        </div>
                        <button
                            type="submit"
                            disabled={pBusy}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D1652] disabled:opacity-60"
                        >
                            {pBusy && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
                        </button>
                        <Note msg={pMsg} />
                    </form>
                </Section>

                <Section
                    icon={KeyRound}
                    title="Change password"
                    desc={`The admin panel access code. ${changedAt ? `Last changed ${new Date(changedAt).toLocaleString()}.` : 'Currently the code from the server configuration.'}`}
                >
                    <form onSubmit={saveCode} className="space-y-4" autoComplete="off">
                        <div>
                            <Label htmlFor="current_code">Current access code</Label>
                            <input
                                id="current_code"
                                type="password"
                                autoComplete="current-password"
                                className={field}
                                value={c.current_code}
                                onChange={(e) => setC({ ...c, current_code: e.target.value })}
                            />
                            {err(cErr, 'current_code')}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="new_code">New access code</Label>
                                <input
                                    id="new_code"
                                    type="password"
                                    autoComplete="new-password"
                                    className={field}
                                    value={c.new_code}
                                    onChange={(e) => setC({ ...c, new_code: e.target.value })}
                                />
                                {err(cErr, 'new_code')}
                            </div>
                            <div>
                                <Label htmlFor="new_code_confirmation">Confirm new code</Label>
                                <input
                                    id="new_code_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    className={field}
                                    value={c.new_code_confirmation}
                                    onChange={(e) => setC({ ...c, new_code_confirmation: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">At least 10 characters. Everyone on the admin team will need the new code.</p>
                        <button
                            type="submit"
                            disabled={cBusy || !c.current_code || !c.new_code}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#3B1F6B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2D1652] disabled:opacity-60"
                        >
                            {cBusy && <Loader2 className="h-4 w-4 animate-spin" />} Change access code
                        </button>
                        <Note msg={cMsg} />
                    </form>
                </Section>
            </div>
        </AdminShell>
    );
}
