'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EntitySelector from '@/app/components/mindmap/EntitySelector';

export default function NewMindmapPage() {
    const { user, isLoading, token } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const createMindmap = async () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!token) {
            alert('Please login to create mindmaps');
            router.push('/login');
            return;
        }

        setCreating(true);
        try {
            const response = await fetch('/api/mindmaps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    entityType: selectedEntity?.type,
                    entityId: selectedEntity?.id,
                    content: '', // Start with empty content
                }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/dashboard/mindmap/${data.mindmap.id}`);
            } else {
                const error = await response.json();
                alert(`Failed to create mindmap: ${error.details || error.error}`);
            }
        } catch (error) {
            console.error('Error creating mindmap:', error);
            alert('Failed to create mindmap');
        } finally {
            setCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leo-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-leo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link
                            href="/dashboard/mindmap"
                            className="flex items-center gap-2 text-gray-600 hover:text-leo-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="card max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gradient-leo mb-2">Create New Mindmap</h1>
                    <p className="text-gray-600 mb-8">
                        Start visualizing your ideas, tasks, and projects
                    </p>

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mindmap Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Community Service Project Planning"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of what this mindmap is about..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Entity Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link to Entity (Optional)
                            </label>
                            <EntitySelector
                                selectedEntity={selectedEntity}
                                onSelect={setSelectedEntity}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4">
                            <button
                                onClick={() => createMindmap()}
                                className="btn btn-primary w-full py-3 text-lg"
                                disabled={creating || !title.trim()}
                            >
                                {creating ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Mindmap'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
