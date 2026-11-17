import { Head, Link } from '@inertiajs/react';

interface Props {
    type: string;
    title: string;
    content: string | null;
    version: number | null;
    updatedAt: string | null;
    others: { type: string; label: string }[];
}

// Public platform policy page (Terms, Privacy, Commission, Prohibited Items). Text is edited by the admin.
export default function PlatformPolicy({ type, title, content, version, updatedAt, others }: Props) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-[#f6f4fa] px-4 py-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="mx-auto max-w-3xl">
                    <Link href="/" className="text-sm font-semibold text-[#4B2E7E] hover:underline">← mimoo</Link>
                    <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
                        <h1 className="text-2xl font-bold text-[#2A1B4D]">{title}</h1>
                        {updatedAt && <p className="mt-1 text-xs text-gray-500">Version {version} · last updated {updatedAt}</p>}
                        {content ? (
                            <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-700">{content}</div>
                        ) : (
                            <p className="mt-6 text-sm text-gray-500">This policy has not been published yet.</p>
                        )}
                    </div>
                    <nav className="mt-6 flex flex-wrap gap-4 text-sm">
                        {others.filter((o) => o.type !== type).map((o) => (
                            <Link key={o.type} href={`/policies/${o.type}`} className="font-semibold text-[#4B2E7E] hover:underline">{o.label}</Link>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
}
