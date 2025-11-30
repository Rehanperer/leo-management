'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import * as d3 from 'd3';

const transformer = new Transformer();

interface MarkmapViewerProps {
    content: string;
    onChange?: (content: string) => void;
    editable?: boolean;
}

export default function MarkmapViewer({ content, onChange, editable = false }: MarkmapViewerProps) {
    const [mm, setMm] = useState<Markmap | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Initialize Markmap
    useEffect(() => {
        if (svgRef.current && !mm) {
            console.log('Initializing Markmap...');
            // Clear existing content
            svgRef.current.innerHTML = '';
            const newMm = Markmap.create(svgRef.current);
            setMm(newMm);
        }
    }, [svgRef.current]); // Only run when ref is ready (initial mount)

    // Update data
    useEffect(() => {
        if (mm && content) {
            console.log('Updating Markmap data...');
            const { root } = transformer.transform(content);
            mm.setData(root);

            // Fit after a short delay
            setTimeout(() => {
                console.log('Fitting Markmap...');
                mm.fit();
            }, 200);
        }
    }, [mm, content]);

    // Handle resizing
    useEffect(() => {
        if (!mm || !svgRef.current?.parentElement) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    requestAnimationFrame(() => {
                        mm.fit();
                    });
                }
            }
        });

        resizeObserver.observe(svgRef.current.parentElement);

        return () => resizeObserver.disconnect();
    }, [mm]);

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Manual Fit Button */}
            <button
                onClick={() => mm?.fit()}
                className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 border border-gray-200"
                title="Fit View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
            </button>

            {editable && (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="h-full border-r border-gray-200 p-4">
                        <textarea
                            className="w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent resize-none"
                            value={content}
                            onChange={(e) => onChange?.(e.target.value)}
                            placeholder="# Root\n\n## Branch 1\n- Leaf 1\n- Leaf 2"
                        />
                    </div>
                    <div className="h-full relative bg-white rounded-lg shadow-inner overflow-hidden">
                        <svg ref={svgRef} className="w-full h-full" width="100%" height="100%" />
                    </div>
                </div>
            )}

            {!editable && (
                <div className="h-full w-full relative bg-white rounded-lg shadow-sm overflow-hidden">
                    <svg ref={svgRef} className="w-full h-full" width="100%" height="100%" />
                </div>
            )}
        </div>
    );
}
