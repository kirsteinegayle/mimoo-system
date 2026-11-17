import { Head, router, usePage } from '@inertiajs/react';
import { BuyerHeader } from '@/components/buyer-header';
import { SupportCenter } from '@/components/support/support-center';

// Buyer web: Help & support (support tickets). Same JSON as the buyer app.
export default function BuyerSupport() {
    const { auth, categories } = usePage<{ auth: { user: any }; categories: Record<string, string> }>().props;

    return (
        <>
            <Head title="Help & support" />
            <div className="min-h-screen bg-[#f6f4fa]">
                <BuyerHeader user={auth?.user} onLogout={() => router.post('/logout')} cartCount={0} />
                <main className="mx-auto max-w-6xl px-4 py-6">
                    <SupportCenter categories={categories} accent="#4B2E7E" />
                </main>
            </div>
        </>
    );
}
