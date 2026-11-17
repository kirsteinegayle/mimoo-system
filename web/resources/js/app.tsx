import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppDialogHost } from '@/components/app-modal';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    strictMode: true,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`];
        
        if (!page) {
            console.error(`Page not found: ./pages/${name}.tsx`);
            console.error('Available pages:', Object.keys(pages));
            throw new Error(`Page not found: ${name}`);
        }
        
        // @ts-ignore - page module has default export
        return page.default;
    },
    setup({ el, App, props }) {
        // Only run on the browser, not during SSR
        if (typeof window !== 'undefined') {
            const appElement = (
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                    <Toaster />
                    <AppDialogHost />
                </TooltipProvider>
            );

            // Remove old content to avoid hydration mismatches
            el.innerHTML = '';
            
            const root = createRoot(el);
            root.render(appElement);
        }
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
if (typeof window !== 'undefined') {
    initializeTheme();
}
