import { Link } from '@inertiajs/react';
import ApprovalWatcher from '@/components/approval-watcher';
import { ReactNode } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontCalibri = { fontFamily: 'Calibri, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };
const fontSFCompact = { fontFamily: "'SF Compact', -apple-system, BlinkMacSystemFont, sans-serif" };

export default function PendingApproval() {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden" style={fontPoppins}>
            <ApprovalWatcher />
            {/* Mobile header */}
            <div className="lg:hidden w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B1F6B]" />
                    <h1 className="text-base font-bold tracking-widest text-gray-900" style={fontSyncopate}>
                        mimoo
                    </h1>
                </Link>
                <span className="text-xs bg-[#F1EDFB] text-[#3B1F6B] px-3 py-1 rounded-full tracking-wide font-medium" style={fontSFCompact}>
                    PENDING APPROVAL
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
                            PENDING APPROVAL
                        </span>
                    </div>

                    <h2 className="mt-8 text-[1.7rem] leading-tight font-black tracking-wide mb-2.5" style={fontCalibri}>
                        Almost there!
                    </h2>
                    <p className="text-[0.95rem] text-[#CEC6E6] max-w-[34ch]">
                        Your seller account is being reviewed by our admin team. You'll receive an email once your account is approved.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Email Verified</p>
                                <p className="text-xs text-white/60">Your email has been confirmed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/80">Admin Review</p>
                                <p className="text-xs text-white/60">Pending approval</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <p className="text-xs text-[#B4A7D6] mb-3">What happens next?</p>
                    <ul className="text-sm text-[#CEC6E6] space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-[#9B5DE5] mt-1">•</span>
                            <span>Our team will review your business documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#9B5DE5] mt-1">•</span>
                            <span>You'll receive an email notification once approved</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#9B5DE5] mt-1">•</span>
                            <span>Review typically takes 1-2 business days</span>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-h-screen lg:h-screen overflow-y-auto bg-[#F8F6FC] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-24">
                <div className="max-w-2xl mx-auto lg:mx-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                        {/* Success icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#F1EDFB] flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#3B1F6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3" style={fontSyncopate}>
                            account under review
                        </h2>
                        
                        <p className="text-center text-gray-600 mb-8">
                            Thank you for registering as a seller on mimoo! Your account is currently being reviewed by our admin team.
                        </p>

                        {/* Info boxes */}
                        <div className="space-y-4 mb-8">
                            <div className="bg-[#F8F6FC] rounded-xl p-4 border border-[#DDD5EE]">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#3B1F6B] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Email Verified</p>
                                        <p className="text-sm text-gray-600">Your email address has been successfully confirmed.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Awaiting Admin Approval</p>
                                        <p className="text-sm text-gray-700">Our team is reviewing your business documents and seller information. This usually takes 1-2 business days.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What to expect */}
                        <div className="border-t border-gray-100 pt-6 mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-[#7A63AC] mb-4" style={fontSFCompact}>
                                What to expect
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="text-[#3B1F6B] font-bold">1.</span>
                                    <span>We'll review your business permit, DTI registration, and other submitted documents</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="text-[#3B1F6B] font-bold">2.</span>
                                    <span>You'll receive an email notification once your account is approved or if we need additional information</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="text-[#3B1F6B] font-bold">3.</span>
                                    <span>After approval, you can log in and start listing your products</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/seller"
                                className="flex-1 bg-[#3B1F6B] text-white rounded-xl py-3 px-6 text-center font-medium hover:bg-[#2E1854] transition"
                            >
                                Back to Seller Landing
                            </Link>
                            <Link
                                href="/"
                                className="flex-1 border border-[#DDD5EE] bg-white text-gray-800 rounded-xl py-3 px-6 text-center font-medium hover:border-[#9B5DE5] hover:text-[#3B1F6B] transition"
                            >
                                Go to Homepage
                            </Link>
                        </div>

                        <p className="text-center text-xs text-gray-500 mt-6">
                            Need help? Contact us at{' '}
                            <a href="mailto:support@mimoo.bond" className="text-[#3B1F6B] hover:underline">
                                support@mimoo.bond
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

PendingApproval.layout = (page: ReactNode) => page;
