'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Link from 'next/link';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    Users,
    TrendingUp,
    CheckCircle,
    Circle,
    StickyNote,
} from 'lucide-react';

interface Mindmap {
    id: string;
    title: string;
    description?: string;
    entityType?: string;
    entityId?: string;
    updatedAt: string;
    content: string;
}

export default function MindmapListPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchMindmaps();
        }
    }, [user, isLoading, router]);

    const fetchMindmaps = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/mindmaps', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setMindmaps(data.mindmaps);
            }
        } catch (error) {
            console.error('Error fetching mindmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEntityIcon = (type?: string) => {
        switch (type) {
            case 'project':
                return <FileText className="w-5 h-5 text-leo-600" />;
            case 'meeting':
                return <Users className="w-5 h-5 text-purple-600" />;
            case 'event':
                return <Calendar className="w-5 h-5 text-green-600" />;
            default:
                return <TrendingUp className="w-5 h-5 text-gray-600" />;
        }
    };

    const filteredMindmaps = mindmaps
        .filter(m => {
            if (filterType !== 'all' && m.entityType !== filterType) return false;
            if (searchTerm && !m.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            return true;
        });

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leo-50 to-purple-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-leo-600 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gradient-leo">Mindmaps</h1>
                        </div>
                        <Link href="/dashboard/mindmap/new" className="btn btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            New Mindmap
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search mindmaps..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="project">Projects</option>
                        <option value="meeting">Meetings</option>
                        <option value="event">Events</option>
                    </select>
                </div>

                {/* Mindmaps by Category */}
                {filteredMindmaps.length === 0 ? (
                    <div className="text-center py-16">
                        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No mindmaps yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Create your first mindmap to visualize your projects, meetings, and events
                        </p>
                        <Link href="/dashboard/mindmap/new" className="btn btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Mindmap
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Project Mindmaps */}
                        {filteredMindmaps.filter(m => m.entityType === 'project').length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="w-6 h-6 text-leo-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Project Mindmaps</h2>
                                    <span className="px-3 py-1 bg-leo-100 text-leo-700 rounded-full text-sm font-medium">
                                        {filteredMindmaps.filter(m => m.entityType === 'project').length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => m.entityType === 'project').map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="card card-hover group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {getEntityIcon(mindmap.entityType)}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-leo-600 transition-colors">
                                                            {mindmap.title}
                                                        </h3>
                                                        {mindmap.description && (
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {mindmap.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Markdown</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Meeting Mindmaps */}
                        {filteredMindmaps.filter(m => m.entityType === 'meeting').length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Users className="w-6 h-6 text-purple-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Meeting Mindmaps</h2>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        {filteredMindmaps.filter(m => m.entityType === 'meeting').length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => m.entityType === 'meeting').map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="card card-hover group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {getEntityIcon(mindmap.entityType)}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-leo-600 transition-colors">
                                                            {mindmap.title}
                                                        </h3>
                                                        {mindmap.description && (
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {mindmap.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Markdown</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Event Mindmaps */}
                        {filteredMindmaps.filter(m => m.entityType === 'event').length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Event Mindmaps</h2>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        {filteredMindmaps.filter(m => m.entityType === 'event').length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => m.entityType === 'event').map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="card card-hover group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {getEntityIcon(mindmap.entityType)}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-leo-600 transition-colors">
                                                            {mindmap.title}
                                                        </h3>
                                                        {mindmap.description && (
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {mindmap.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Markdown</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Other/Uncategorized Mindmaps */}
                        {filteredMindmaps.filter(m => !m.entityType || (m.entityType !== 'project' && m.entityType !== 'meeting' && m.entityType !== 'event')).length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <StickyNote className="w-6 h-6 text-gray-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Other Mindmaps</h2>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        {filteredMindmaps.filter(m => !m.entityType || (m.entityType !== 'project' && m.entityType !== 'meeting' && m.entityType !== 'event')).length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => !m.entityType || (m.entityType !== 'project' && m.entityType !== 'meeting' && m.entityType !== 'event')).map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="card card-hover group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {getEntityIcon(mindmap.entityType)}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-leo-600 transition-colors">
                                                            {mindmap.title}
                                                        </h3>
                                                        {mindmap.description && (
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {mindmap.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Markdown</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
