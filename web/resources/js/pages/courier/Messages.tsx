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

export default function Messages({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="messages" pageTitle="Messages">
            <Head title="Messages" />
            
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Messages</h2>
                        <p className="text-sm text-gray-500 mb-6">View and send messages to customers and team</p>
                        <p className="text-sm text-gray-400">Nothing here yet</p>
                    </div>
                </div>
            </div>
        </CourierLayout>
    );
}

Messages.layout = (page: ReactNode) => page;
