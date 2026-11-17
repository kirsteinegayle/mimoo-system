import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useState } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

const perks = [
    'Track every order from checkout to delivery.',
    'Message sellers directly about your order.',
    'Save vouchers and reuse them at checkout.',
];

interface LoginProps {
    canResetPassword: boolean;
    status?: string;
}

export default function Login({ canResetPassword, status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        portal: 'buyer',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden" style={fontPoppins}>
            <style>{`
                @keyframes fadeSlideIn {
                    0%   { opacity: 0; transform: translateY(-4px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-slide-in {
                    animation: fadeSlideIn 0.18s ease-out;
                }
                .toggle-thumb {
                    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>

            {/* Mobile header - simple mimoo title only */}
            <div className="lg:hidden w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B1F6B]" />
                    <h1 className="text-base font-bold tracking-widest text-gray-900" style={fontSyncopate}>
                        mimoo
                    </h1>
                </Link>
                <span className="text-xs bg-[#F1EDFB] text-[#3B1F6B] px-3 py-1 rounded-full tracking-wide font-medium" style={fontSFCompact}>
                    BUYER
                </span>
            </div>

            {/* Desktop Sidebar - only visible on lg+ screens */}
            <aside
                className="hidden lg:flex lg:w-80 lg:h-screen lg:sticky lg:top-0 shrink-0 min-w-0 relative flex-col gap-9 px-8 pt-10 pb-10 text-[#F1EEFB]"
                style={{ background: 'radial-gradient(120% 140% at 15% 0%, #2B2249 0%, #201A33 60%)' }}
            >
                {/* soft glow, bottom right */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    <div
                        className="absolute -bottom-[35%] -right-[30%] w-[420px] h-[420px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(122,99,172,0.35), transparent 70%)' }}
                    />
                </div>

                {/* Brand + badge */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#9B5DE5]" />
                        <h1 className="text-lg font-bold tracking-widest" style={fontSyncopate}>
                            mimoo
                        </h1>
                    </Link>

                    <div className="mt-6">
                        <span
                            className="text-xs bg-white/10 px-3 py-1 rounded-full inline-block tracking-wide"
                            style={fontSFCompact}
                        >
                            BUYER LOG IN
                        </span>
                    </div>

                    <h2 className="mt-8 text-[1.7rem] leading-tight font-black tracking-wide mb-2.5" style={fontCalibri}>
                        Good to see you again.
                    </h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Log in to pick up where you left off — track orders, message sellers, and keep shopping.
                    </p>
                </div>

                {/* Perks list */}
                <div className="relative z-10">
                    <p className="text-xs uppercase text-white/75 mb-3 tracking-wide" style={fontSFCompact}>
                        Why buyers stick around
                    </p>
                    <ul className="space-y-3 text-sm">
                        {perks.map((perk) => (
                            <li key={perk} className="flex items-start gap-2 text-white/80">
                                <span className="mt-0.5 w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                </span>
                                {perk}
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-white/10 mt-5 pt-4">
                        <p className="text-xs text-white/60">
                            We will never share your log-in details with buyers or sellers.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main content - responsive padding */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-24">
                <div className="max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto lg:mx-0">
                    <h2 className="text-2xl md:text-[28px] font-bold text-gray-900" style={fontSyncopate}>
                        log in to mimoo
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Sign in below to continue shopping.
                    </p>

                    {status && (
                        <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                Email address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                                className={`w-full rounded-xl border bg-white px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 transition ${
                                    errors.email
                                        ? 'border-red-300 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-[#E4DBF7] focus:border-[#8B72C4]'
                                }`}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full rounded-xl border bg-white px-3 md:px-4 py-2.5 md:py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 transition ${
                                    errors.password
                                        ? 'border-red-300 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-[#E4DBF7] focus:border-[#8B72C4]'
                                }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-2 mb-6">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-[#3B1F6B] focus:ring-[#D9CCF2]"
                                />
                                Remember me
                            </label>
                            {canResetPassword && (
                                <Link href="/forgot-password" className="text-sm text-[#3B1F6B] font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#3B1F6B] text-white rounded-xl py-3 md:py-3.5 text-sm md:text-[15px] font-medium hover:bg-[#2E1854] transition disabled:opacity-60"
                            style={fontSFCompact}
                        >
                            {processing ? 'Logging in…' : 'Log in'}
                        </button>
                    </form>

                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-5">
                        New to mimoo?{' '}
                        <Link href="/register" className="text-[#3B1F6B] font-medium">
                            Create a buyer account
                        </Link>
                    </p>
                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-1">
                        Want to sell instead?{' '}
                        <Link href="/seller" className="text-[#3B1F6B] font-medium">
                            Become a seller
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

Login.layout = (page: ReactNode) => page;