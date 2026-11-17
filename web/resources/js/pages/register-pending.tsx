import { Head, Link } from '@inertiajs/react';
import ApprovalWatcher from '@/components/approval-watcher';
import { CheckCircle2, Clock, Mail } from 'lucide-react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins   = { fontFamily: 'Poppins, sans-serif' };

export default function RegisterPending() {
    return (
        <>
            <Head title="Registration Submitted" />
            <ApprovalWatcher />

            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#3B1F6B] to-[#19132A] px-4"
                style={fontPoppins}
            >
                <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl text-center">
                    {/* Icon stack */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFEAF7]">
                                <CheckCircle2 className="h-8 w-8 text-[#3B1F6B]" strokeWidth={1.5} />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                                <Clock className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
                            </span>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1
                        className="text-lg font-bold tracking-widest text-[#3B1F6B] uppercase"
                        style={fontSyncopate}
                    >
                        mimoo
                    </h1>
                    <h2 className="mt-3 text-xl font-semibold text-gray-900">
                        Registration submitted!
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        Your account is now <span className="font-medium text-amber-600">pending review</span>.
                        Our admin team will verify your details and notify you via email once your account is approved.
                    </p>

                    {/* Info box */}
                    <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#EFEAF7] px-4 py-3 text-left">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#3B1F6B]" strokeWidth={1.5} />
                        <p className="text-xs text-[#3B1F6B]/80 leading-relaxed">
                            Check your inbox — we'll send a confirmation once an admin approves your registration.
                            This usually takes 1–2 business days.
                        </p>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/"
                        className="mt-8 inline-block w-full rounded-xl bg-[#3B1F6B] py-3 text-sm font-medium text-white transition hover:bg-[#2E1854]"
                    >
                        Back to home
                    </Link>
                    <p className="mt-4 text-xs text-gray-400">
                        Already approved?{' '}
                        <Link href="/login" className="font-medium text-[#3B1F6B] hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

RegisterPending.layout = (page: React.ReactNode) => page;
