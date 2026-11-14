import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useState } from 'react';
import auth from '@/routes/auth';

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
                    <p className="text-xs uppercase text-white/50 mb-3 tracking-wide" style={fontSFCompact}>
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
                        <p className="text-xs text-white/30">
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

                    <a
                        href={auth.google.url()}
                        className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 md:py-3 mt-5 bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </a>

                    <div className="flex items-center gap-3 my-5">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400" style={fontSFCompact}>
                            or log in with email
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

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