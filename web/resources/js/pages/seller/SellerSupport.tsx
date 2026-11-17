import { Head, usePage } from '@inertiajs/react';
import SellerShell from '@/layouts/seller/seller-shell';
import { SupportCenter } from '@/components/support/support-center';

// Seller web: Help & support (support tickets to the admin team).
export default function SellerSupport() {
    const { categories } = usePage<{ categories: Record<string, string> }>().props;

    return (
        <>
            <Head title="Help & support - Seller" />
            <SellerShell active="support">
                <SupportCenter categories={categories} accent="#3B1F6B" />
            </SellerShell>
        </>
    );
}
