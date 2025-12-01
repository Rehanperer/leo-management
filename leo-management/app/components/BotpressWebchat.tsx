'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BotpressWebchat() {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const [injectLoaded, setInjectLoaded] = useState(false);

    useEffect(() => {
        console.log('BotpressWebchat mounted, pathname:', pathname, 'isLoginPage:', isLoginPage);
    }, [pathname, isLoginPage]);

    return (
        <>
            <Script
                src="https://cdn.botpress.cloud/webchat/v3.4/inject.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('Botpress inject.js loaded');
                    setInjectLoaded(true);
                }}
                onError={(e) => {
                    console.error('Failed to load Botpress inject.js', e);
                }}
            />
            {injectLoaded && (
                <>
                    <Script
                        src="https://files.bpcontent.cloud/2025/11/28/07/20251128075317-FCAADZD1.js"
                        strategy="afterInteractive"
                        onLoad={() => console.log('Botpress config.js loaded')}
                        onError={(e) => {
                            console.error('Failed to load Botpress config.js', e);
                        }}
                    />
                    <Script id="botpress-custom-config" strategy="afterInteractive">
                        {`
                            window.botpressWebChat.onEvent(async ({ type }) => {
                                if (type === 'LIFECYCLE.LOADED') {
                                    // Override logo with custom logo
                                    window.botpressWebChat.sendEvent({
                                        type: 'UPDATE_CONFIG',
                                        payload: {
                                            avatarUrl: '/logo.png',
                                            stylesheet: 'https://webchat-styler-css.botpress.app/prod/code/f6d750a7-fad6-44a7-aa2b-3862cd0f7f2f/v93738/style.css'
                                        }
                                    });
                                }
                            });
                        `}
                    </Script>
                </>
            )}
        </>
    );
}
