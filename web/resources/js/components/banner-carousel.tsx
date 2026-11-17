import { useEffect, useState } from 'react';

export interface LiveBanner { id: number; title: string; image: string; link_url: string | null }
export interface LiveBanners { hero: LiveBanner[]; secondary: LiveBanner[]; sidebar: LiveBanner[] }

/** Banners from Admin > Banner Management (live ones only). Renders nothing when the list is empty. */
export function BannerCarousel({ banners, className = '' }: { banners: LiveBanner[]; className?: string }) {
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || banners.length < 2) return;
        const t = setInterval(() => setI((n) => (n + 1) % banners.length), 5000);
        return () => clearInterval(t);
    }, [paused, banners.length]);

    if (banners.length === 0) return null;
    const current = Math.min(i, banners.length - 1);

    return (
        <div className={`relative overflow-hidden rounded-xl min-h-40 sm:min-h-56 ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {banners.map((b, n) => {
                const img = <img src={b.image} alt={b.title} className="h-full w-full rounded-xl object-cover" />;
                return (
                    <div key={b.id} className={`absolute inset-0 transition-opacity duration-1000 ${n === current ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                        {b.link_url ? <a href={b.link_url} className="block h-full w-full">{img}</a> : img}
                    </div>
                );
            })}
            {banners.length > 1 && (
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {banners.map((_, n) => (
                        <button key={n} aria-label={`Show banner ${n + 1}`} onClick={() => setI(n)} className={`h-2 rounded-full transition-all ${n === current ? 'w-5 bg-white' : 'w-2 bg-white/60'}`} />
                    ))}
                </div>
            )}
        </div>
    );
}
