import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import CourierLayout from './CourierLayout';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            account_type: string;
        };
    };
    company: {
        name: string;
        contact_person: string;
    };
}

export default function CODRemittance({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="cod-remittance" pageTitle="COD & Remittance">
            <Head title="COD & Remittance" />
            
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">COD & Remittance</h2>
                        <p className="text-sm text-gray-500 mb-6">Manage cash-on-delivery and remittance reports</p>
                        <p className="text-sm text-gray-400">Nothing here yet</p>
                    </div>
                </div>
            </div>
        </CourierLayout>
    );
}

CODRemittance.layout = (page: ReactNode) => page;
