import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

const fontSyncopate = { fontFamily: 'Syncopate, sans-serif' };
const fontPoppins = { fontFamily: 'Poppins, sans-serif' };

export default function RiderRegistration() {
    return (
        <div className="bg-white min-h-screen" style={fontPoppins}>
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3B1F6B]" />
                        <span className="font-bold tracking-widest text-sm text-gray-900" style={fontSyncopate}>
                            mimoo
                        </span>
                        <span className="text-xs font-medium text-[#3B1F6B] bg-[#F1EDFB] rounded-full px-2.5 py-0.5 ml-1">
                            Rider
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <Link href="/logistics" className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition">
                            â† Back
                        </Link>
                        <Link href="/login" className="text-xs sm:text-sm font-medium text-gray-700 hover:text-[#3B1F6B] transition">
                            Log in
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F1EDFB] text-[#3B1F6B] mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3" style={fontSyncopate}>
                        Apply as a Rider
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                        Deliver for your community and earn on your own schedule. Work whenever you're available.
                    </p>
                </div>

                {/* Coming Soon Message */}
                <div className="bg-gradient-to-br from-[#3B1F6B] to-[#6E5F8F] rounded-3xl p-8 sm:p-12 text-center text-white">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">
                            Rider Application Coming Soon
                        </h2>
                        <p className="text-sm sm:text-base text-white/90 mb-8 leading-relaxed">
                            We're building the rider application system to make it easy for delivery partners to join our platform. 
                            Get ready to start earning on your own schedule!
                        </p>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                            <h3 className="font-semibold mb-4">What you'll need when applications open:</h3>
                            <ul className="text-left space-y-2 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-white/60">"¢</span>
                                    <span>Valid government-issued ID</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-white/60">"¢</span>
                                    <span>Driver's license (for motorcycle riders)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-white/60">"¢</span>
                                    <span>Vehicle registration (OR/CR)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-white/60">"¢</span>
                                    <span>Bank account or e-wallet for payouts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-white/60">"¢</span>
                                    <span>Smartphone for the rider app</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link 
                                href="/logistics" 
                                className="inline-flex items-center justify-center gap-2 bg-white text-[#3B1F6B] px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
                            >
                                â† Back to Logistics
                            </Link>
                            <a 
                                href="mailto:riders@mimoo.ph"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition"
                            >
                                Contact Us
                                <span></span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                        {
                            title: 'Flexible Schedule',
                            desc: 'Work whenever you want. Go online and offline anytime.',
                        },
                        {
                            title: 'Instant Earnings',
                            desc: 'Track your earnings in real-time and withdraw anytime.',
                        },
                        {
                            title: 'Local Routes',
                            desc: 'Short deliveries within your area. Save on gas.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="bg-[#F8F6FC] rounded-2xl p-6 text-center">
                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

RiderRegistration.layout = (page: ReactNode) => page;
