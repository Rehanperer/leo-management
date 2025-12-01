'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useEffect, useState, useCallback, use, useRef } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

export default function MindmapEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading, token } = useAuth();
    const router = useRouter();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [mindmap, setMindmap] = useState<any>(null);
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [iframeReady, setIframeReady] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Fetch mindmap data
    useEffect(() => {
        if (!token) return;

        const fetchMindmap = async () => {
            try {
                const response = await fetch(`/api/mindmaps/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMindmap(data.mindmap);
                    setContent(data.mindmap.content);
                    setLastSaved(new Date(data.mindmap.updatedAt));
                } else {
                    router.push('/dashboard/mindmap');
                }
            } catch (error) {
                console.error('Error fetching mindmap:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMindmap();
    }, [id, token, router]);

    // Save mindmap
    const saveMindmap = useCallback(async () => {
        if (!mindmap || !token) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/mindmaps/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: mindmap.title,
                    description: mindmap.description,
                    content,
                }),
            });

            if (response.ok) {
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error('Error saving mindmap:', error);
        } finally {
            setIsSaving(false);
        }
    }, [mindmap, content, id, token]);

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (content !== mindmap?.content) {
                // saveMindmap(); // Disabled for debugging
                console.log('Auto-save disabled for debugging');
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [content, mindmap, saveMindmap]);

    // Delete mindmap
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this mindmap?')) return;

        try {
            const response = await fetch(`/api/mindmaps/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                router.push('/dashboard/mindmap');
            }
        } catch (error) {
            console.error('Error deleting mindmap:', error);
        }
    };

    // Listen for iframe ready message and updates
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'MINDMAP_READY') {
                console.log('Mindmap iframe is ready');
                setIframeReady(true);
            } else if (event.data && event.data.type === 'MINDMAP_UPDATED') {
                console.log('Mindmap updated from iframe');
                setContent(event.data.content);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Send content to iframe when ready or when content changes
    useEffect(() => {
        if (iframeReady && iframeRef.current && content) {
            console.log('Sending content to iframe:', content.substring(0, 50));
            iframeRef.current.contentWindow?.postMessage(
                { type: 'UPDATE_MINDMAP', content },
                '*'
            );
        }
    }, [iframeReady, content]);

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/mindmap"
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{mindmap?.title}</h1>
                        <p className="text-xs text-gray-500">
                            {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Unsaved changes'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                        title="Help & Shortcuts"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Help
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Mindmap"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-2" />
                    <button
                        onClick={saveMindmap}
                        disabled={isSaving}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {isSaving ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save
                    </button>
                </div>
            </header>

            {/* Editor */}
            <main className="p-4 flex-1">
                <div className="relative bg-gray-50 rounded-lg border border-gray-200 shadow-inner w-full h-full">
                    <iframe
                        ref={iframeRef}
                        src="/mind-elixir-renderer.html"
                        className="w-full h-full border-0 rounded-lg"
                        title="Mindmap Renderer"
                    />
                </div>
            </main>

            {/* Help Dialog */}
            {showHelp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Mindmap Controls & Shortcuts</h2>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                        Mouse Actions
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex justify-between"><span className="font-medium text-gray-900">Click Node</span> <span>Select node</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900">Double Click</span> <span>Edit text</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900">Right Click</span> <span>Open menu (Link, Icon, Tag)</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900">Drag Node</span> <span>Move node freely</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900">Drag Canvas</span> <span>Pan view</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900">Scroll Wheel</span> <span>Zoom in/out</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        Keyboard Shortcuts
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex justify-between"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Tab</span> <span>Add child node</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Enter</span> <span>Add sibling node</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Delete</span> <span>Delete selected</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">F2</span> <span>Edit text</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Space</span> <span>Expand/Collapse</span></li>
                                        <li className="flex justify-between"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Ctrl + Z</span> <span>Undo</span></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h3>
                                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                    <li>Right-click a node and select <strong>Link</strong> to draw connection arrows between nodes.</li>
                                    <li>Use the toolbar at the top to center the map or change layout.</li>
                                    <li>Changes are auto-saved, but use the Save button to be sure!</li>
                                </ul>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
