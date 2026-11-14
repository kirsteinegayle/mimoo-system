import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import CourierLayout from './CourierLayout';
import { RoleInbox } from '@/components/chat/role-inbox';

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

// Inbox for admin, sellers with a shipment of ours, and our own riders.
export default function Messages({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="messages" pageTitle="Messages">
            <Head title="Messages" />

            <div className="max-w-6xl mx-auto">
                <RoleInbox base="/messaging" emptyHint="Messages from the admin team, sellers and your riders appear here" />
            </div>
        </CourierLayout>
    );
}

Messages.layout = (page: ReactNode) => page;
