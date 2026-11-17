import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import TransfersManager from '@/components/courier/transfers-manager';
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

export default function SortingTransfers({ auth, company }: Props) {
    return (
        <CourierLayout auth={auth} company={company} activeTab="sorting-transfers" pageTitle="Sorting & Transfers">
            <Head title="Sorting & Transfers" />
            
            <TransfersManager />
        </CourierLayout>
    );
}

SortingTransfers.layout = (page: ReactNode) => page;
