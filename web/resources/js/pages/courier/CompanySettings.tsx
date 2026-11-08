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

export default function CompanySettings({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="settings" pageTitle="Company Settings">
            <Head title="Company Settings" />
            
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/><path d="m19.07 4.93-4.24 4.24m-5.66 5.66-4.24 4.24"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Company Settings</h2>
                        <p className="text-sm text-gray-500 mb-6">Manage your company profile and preferences</p>
                        <p className="text-sm text-gray-400">Nothing here yet</p>
                    </div>
                </div>
            </div>
        </CourierLayout>
    );
}

CompanySettings.layout = (page: ReactNode) => page;
