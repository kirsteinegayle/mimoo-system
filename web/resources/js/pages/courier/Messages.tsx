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

// Inbox for admin, our own logistics hub staff, sellers with a shipment of
// ours, and our own riders (MessagingService::MATRIX).
export default function Messages({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="messages" pageTitle="Messages">
            <Head title="Messages" />

            <div className="max-w-6xl mx-auto">
                <RoleInbox base="/messaging" emptyHint="Message the admin team, your logistics hub, sellers and your riders" />
            </div>
        </CourierLayout>
    );
}

Messages.layout = (page: ReactNode) => page;
