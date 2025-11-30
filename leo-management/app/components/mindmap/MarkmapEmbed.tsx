'use client';

import { useEffect, useRef } from 'react';

interface MarkmapEmbedProps {
    content: string;
}

export default function MarkmapEmbed({ content }: MarkmapEmbedProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
                            #mindmap { width: 100%; height: 100%; }
                        </style>
                        <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
                        <script src="https://cdn.jsdelivr.net/npm/markmap-view"></script>
                        <script src="https://cdn.jsdelivr.net/npm/markmap-lib"></script>
                    </head>
                    <body>
                        <svg id="mindmap"></svg>
                        <script>
                            const { Markmap, loadCSS, loadJS } = window.markmap;
                            const { Transformer } = window.markmap;
                            const transformer = new Transformer();
                            let mm;

                            function update(content) {
                                if (!mm) {
                                    mm = Markmap.create('#mindmap');
                                }
                                const { root } = transformer.transform(content);
                                mm.setData(root);
                                mm.fit();
                            }

                            // Initial render
                            update(\`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);

                            // Listen for messages from parent
                            window.addEventListener('message', (event) => {
                                if (event.data.type === 'update') {
                                    update(event.data.content);
                                }
                            });
                        </script>
                    </body>
                    </html>
                `;
                doc.open();
                doc.write(html);
                doc.close();
            }
        }
    }, []); // Run once to set up the iframe

    // Update content via postMessage
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'update', content }, '*');
        }
    }, [content]);

    return (
        <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="Mindmap Viewer"
        />
    );
}
