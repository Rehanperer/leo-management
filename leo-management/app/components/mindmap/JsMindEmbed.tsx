'use client';

import { useEffect, useRef } from 'react';

interface JsMindEmbedProps {
    content: string;
}

export default function JsMindEmbed({ content }: JsMindEmbedProps) {
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
                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #f8fafc; }
                            #jsmind_container { width: 100%; height: 100%; }
                        </style>
                        <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsmind@0.8.5/style/jsmind.css" />
                        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsmind@0.8.5/es6/jsmind.js"></script>
                        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsmind@0.8.5/es6/jsmind.draggable-node.js"></script>
                    </head>
                    <body>
                        <div id="status" style="padding: 20px; font-family: sans-serif;">Loading scripts...</div>
                        <div id="jsmind_container"></div>
                        <script>
                            let jm = null;

                            function parseMarkdownToJsMind(markdown) {
                                const lines = markdown.split('\\n');
                                const root = { id: 'root', topic: 'Root', isroot: true, children: [] };
                                const stack = [{ level: 0, node: root }];
                                let idCounter = 1;

                                lines.forEach(line => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return;

                                    let level = 0;
                                    let topic = '';

                                    if (trimmed.startsWith('#')) {
                                        const match = trimmed.match(/^(#+)\\s+(.*)/);
                                        if (match) {
                                            level = match[1].length; // # is level 1 (root is 0)
                                            topic = match[2];
                                        } else {
                                            topic = trimmed;
                                            level = 1;
                                        }
                                    } else if (trimmed.startsWith('-')) {
                                        const indentMatch = line.match(/^(\\s*)-/);
                                        const indent = indentMatch ? indentMatch[1].length : 0;
                                        // Base list level is usually 2 (under a # header)
                                        // We approximate: 1 header level + 1 + indent/2
                                        // Or simpler: just find the parent in the stack.
                                        // Let's assume - is always at least level 2.
                                        level = 2 + Math.floor(indent / 2);
                                        topic = trimmed.replace(/^-\\s+/, '');
                                    } else {
                                        return;
                                    }

                                    // Create node
                                    const node = { id: 'node_' + idCounter++, topic: topic, children: [] };

                                    // Find parent
                                    // Pop stack until we find a node with level < current level
                                    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                                        stack.pop();
                                    }

                                    if (stack.length > 0) {
                                        const parent = stack[stack.length - 1].node;
                                        parent.children.push(node);
                                    } else {
                                        // Fallback if something is weird, attach to root
                                        root.children.push(node);
                                    }

                                    stack.push({ level, node });
                                });

                                // If root has only one child and it's from the first header, maybe make that the root?
                                // Standard jsMind format expects one root.
                                // Our parser creates a dummy root. Let's see if we can use the first header as root.
                                if (root.children.length === 1 && lines[0].startsWith('# ')) {
                                    // The first header is the real root
                                    const realRoot = root.children[0];
                                    realRoot.isroot = true;
                                    return realRoot;
                                }
                                
                                // If multiple top-level headers, keep dummy root or pick first?
                                // Let's keep dummy root but name it "Mindmap"
                                root.topic = "Mindmap";
                                return root;
                            }

                            const mind = {
                                "meta": {
                                    "name": "jsMind",
                                    "author": "Leo Management",
                                    "version": "0.2"
                                },
                                "format": "node_tree",
                                "data": {"id":"root", "topic":"Test Mindmap", "children":[
                                    {"id":"sub1", "topic":"Child 1"},
                                    {"id":"sub2", "topic":"Child 2"}
                                ]}
                            };

                            const options = {
                                container: 'jsmind_container',
                                editable: true,
                                theme: 'primary'
                            };

                            try {
                                document.getElementById('status').innerText = 'Initializing jsMind...';
                                if (!jm) {
                                    jm = new jsMind(options);
                                }
                                jm.show(mind);
                                document.getElementById('status').style.display = 'none';
                            } catch (e) {
                                document.getElementById('status').innerText = 'Error: ' + e.message;
                                document.getElementById('status').style.color = 'red';
                            }
                        }

                        // Initial render
                        // Escape backticks and backslashes for the template literal
                        // const initialContent = \`${content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                        // update(initialContent);
                        
                        // FORCE UPDATE with hardcoded data for test
                        setTimeout(() => update(''), 1000);

                        // Listen for messages
                        window.addEventListener('message', (event) => {
                            if (event.data.type === 'update') {
                                // update(event.data.content);
                                console.log('Update received (ignored for test)');
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
    }, []);

    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'update', content }, '*');
        }
    }, [content]);

    return (
        <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="jsMind Viewer"
        />
    );
}
