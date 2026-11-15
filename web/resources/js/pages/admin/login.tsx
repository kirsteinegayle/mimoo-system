import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/admin/verify', {
            onSuccess: () => {
                console.log('Login successful');
            },
            onError: (errors) => {
                console.error('Login errors:', errors);
            },
        });
    }

    return (
        <>
            <Head title="Admin Access" />

            {/*
             * Full-viewport dark canvas.
             * The page intentionally gives no visual indication that this is an
             * "admin" area — it looks like a generic gate to prevent enumeration.
             */}
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0D0D0F]">
                {/* Subtle radial glow behind the card */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,31,107,0.35) 0%, transparent 70%)',
                    }}
                />

                <div className="relative z-10 w-full max-w-sm px-4">
                    {/* Lock icon */}
                    <div className="mb-8 flex justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A1A1F] ring-1 ring-white/10">
                            <KeyRound className="h-6 w-6 text-[#9B5DE5]" strokeWidth={1.5} />
                        </span>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl bg-[#111115] p-8 ring-1 ring-white/8 shadow-2xl">
                        <h1 className="mb-1 text-center text-lg font-semibold tracking-tight text-white">
                            Restricted access
                        </h1>
                        <p className="mb-7 text-center text-sm text-white/65">
                            Enter the access code to continue.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="code"
                                        className="mb-1.5 block text-xs font-medium tracking-wide text-white/70 uppercase"
                                    >
                                        Access code
                                    </label>
                                    <input
                                        id="code"
                                        type="password"
                                        autoComplete="off"
                                        autoFocus
                                        spellCheck={false}
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        aria-describedby={
                                            errors.code ? 'code-error' : undefined
                                        }
                                        aria-invalid={!!errors.code}
                                        className={[
                                            'w-full rounded-lg border bg-white px-4 py-2.5',
                                            'text-sm text-gray-900 placeholder-gray-400 outline-none',
                                            'transition-colors duration-150',
                                            'focus:ring-2 focus:ring-[#9B5DE5]/60 focus:border-[#9B5DE5]/60',
                                            errors.code
                                                ? 'border-red-500/60'
                                                : 'border-white/10 hover:border-white/20',
                                        ].join(' ')}
                                        placeholder="••••••••••••"
                                    />
                                    {errors.code && (
                                        <p
                                            id="code-error"
                                            role="alert"
                                            className="mt-1.5 text-xs text-red-400"
                                        >
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !data.code}
                                    className={[
                                        'flex w-full items-center justify-center gap-2',
                                        'rounded-lg px-4 py-2.5 text-sm font-medium',
                                        'bg-[#3B1F6B] text-white',
                                        'transition-all duration-150',
                                        'hover:bg-[#4e2a8e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B5DE5]/60',
                                        'disabled:cursor-not-allowed disabled:opacity-40',
                                    ].join(' ')}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2
                                                className="h-4 w-4 animate-spin"
                                                aria-hidden="true"
                                            />
                                            Verifying…
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

// Bypass any global layout wrapper — this page is fully self-contained
AdminLogin.layout = (page: React.ReactNode) => page;
