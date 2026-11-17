import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import StaffSupportQueue from '@/components/support/staff-queue';
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

export default function Support({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="support" pageTitle="Support">
            <Head title="Support" />
            <StaffSupportQueue />
        </CourierLayout>
    );
}

Support.layout = (page: ReactNode) => page;
