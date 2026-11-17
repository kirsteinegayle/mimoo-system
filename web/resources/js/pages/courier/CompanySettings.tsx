import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import CompanySettingsForm from '@/components/courier/company-settings-form';
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
            
            <CompanySettingsForm />
        </CourierLayout>
    );
}

CompanySettings.layout = (page: ReactNode) => page;
