import { Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useState, useEffect } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

interface VerifyEmailProps {
    email?: string;
    status?: string;
}

export default function VerifyEmail({ email: initialEmail, status }: VerifyEmailProps) {
    const [countdown, setCountdown] = useState(0);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: initialEmail || '',
        code: '',
    });

    const { post: postResend, processing: resending } = useForm({
        email: initialEmail || '',
    });

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/verify-email', {
            onSuccess: (page) => {
                console.log('OTP verification success:', page);
                reset('code');
                // Force redirect to login for buyers (backend already redirects, but ensure it)
                // Sellers/logistics will be redirected to pending-approval by backend
            },
            onError: (errors) => {
                console.error('OTP verification failed:', errors);
            },
        });
    };

    const handleResend = () => {
        postResend('/verify-email/resend', {
            onSuccess: () => {
                setCountdown(60); // 60 second cooldown
            },
        });
    };

    const handleCodeInput = (value: string) => {
        // Only allow digits, max 6
        const cleaned = value.replace(/\D/g, '').slice(0, 6);
        setData('code', cleaned);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden" style={fontPoppins}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>

            {/* Mobile header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B1F6B]" />
                    <h1 className="text-base font-bold tracking-widest text-gray-900" style={fontSyncopate}>
                        mimoo
                    </h1>
                </Link>
                <span className="text-xs bg-[#F1EDFB] text-[#3B1F6B] px-3 py-1 rounded-full tracking-wide font-medium" style={fontSFCompact}>
                    VERIFY EMAIL
                </span>
            </div>

            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex lg:w-80 lg:h-screen lg:sticky lg:top-0 shrink-0 min-w-0 relative flex-col gap-9 px-8 pt-10 pb-10 text-[#F1EEFB]"
                style={{ background: 'radial-gradient(120% 140% at 15% 0%, #2B2249 0%, #201A33 60%)' }}
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    <div
                        className="absolute -bottom-[35%] -right-[30%] w-[420px] h-[420px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(122,99,172,0.35), transparent 70%)' }}
                    />
                </div>

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
                            EMAIL VERIFICATION
                        </span>
                    </div>

                    <h2 className="mt-8 text-[1.7rem] leading-tight font-black tracking-wide mb-2.5" style={fontCalibri}>
                        One more step.
                    </h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        We sent a 6-digit code to your email. Enter it below to verify your account and start shopping.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-white/60">Check your inbox</p>
                                <p className="text-sm font-medium text-white">{data.email}</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/50 mt-3">
                            The code expires in 5 minutes. Didn't get it? Check your spam folder or request a new code.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-24">
                <div className="max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto lg:mx-0">
                    <h2 className="text-2xl md:text-[28px] font-bold text-gray-900" style={fontSyncopate}>
                        verify your email
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter the 6-digit code we sent to <strong>{data.email}</strong>
                    </p>

                    {status && (
                        <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Verification Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="000000"
                                value={data.code}
                                onChange={(e) => handleCodeInput(e.target.value)}
                                maxLength={6}
                                autoComplete="off"
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 placeholder:text-gray-400 placeholder:tracking-[0.5em] outline-none focus:ring-2 transition ${
                                    errors.code
                                        ? 'border-red-300 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-[#E4DBF7] focus:border-[#8B72C4]'
                                }`}
                            />
                            {errors.code && <p className="text-xs text-red-500 mt-1.5">{errors.code}</p>}
                            <p className="text-xs text-gray-500 mt-2">
                                Enter all 6 digits without spaces
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 6}
                            className="w-full bg-[#3B1F6B] text-white rounded-xl py-3 md:py-3.5 text-sm md:text-[15px] font-medium hover:bg-[#2E1854] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            style={fontSFCompact}
                        >
                            {processing ? 'Verifying…' : 'Verify Email'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600 mb-3">
                            Didn't receive the code?
                        </p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending || countdown > 0}
                            className="w-full border border-gray-200 bg-white text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:border-[#8B72C4] hover:text-[#3B1F6B] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resending ? 'Sending…' : countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        Wrong email?{' '}
                        <Link href="/register" className="text-[#3B1F6B] font-medium hover:underline">
                            Start over
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

VerifyEmail.layout = (page: ReactNode) => page;
