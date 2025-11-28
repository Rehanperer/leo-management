'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function BotpressWebchat() {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    useEffect(() => {
        console.log('BotpressWebchat mounted, pathname:', pathname, 'isLoginPage:', isLoginPage);
    }, [pathname, isLoginPage]);

    // Temporarily always render to debug
    return (
        <>
            <Script
                src="https://cdn.botpress.cloud/webchat/v3.4/inject.js"
                strategy="afterInteractive"
                onLoad={() => console.log('Botpress inject.js loaded')}
            />
            <Script
                src="https://files.bpcontent.cloud/2025/11/28/07/20251128075317-FCAADZD1.js"
                strategy="lazyOnload"
                onLoad={() => console.log('Botpress config.js loaded')}
            />
        </>
    );
}
