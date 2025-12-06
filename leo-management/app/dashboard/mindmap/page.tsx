'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    FileText,
    MoreVertical,
    Calendar,
    Users,
    TrendingUp,
    StickyNote,
    ArrowRight
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
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-[rgba(240,247,255,0.8)] backdrop-blur-lg border-b border-sky-shadow sticky top-0 z-50">
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
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Project Mindmaps</h2>
                                        <p className="text-sm text-gray-500">Visualizations for your ongoing projects</p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                        {filteredMindmaps.filter(m => m.entityType === 'project').length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => m.entityType === 'project').map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="group relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100/50 hover:border-blue-200 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                <FileText size={120} className="transform rotate-12 text-blue-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-50">
                                                        {getEntityIcon(mindmap.entityType)}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">
                                                    {mindmap.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
                                                    {mindmap.description || 'No description provided'}
                                                </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-blue-100/50">
                                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                                        Project
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                    </span>
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
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Users className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Meeting Mindmaps</h2>
                                        <p className="text-sm text-gray-500">Brainstorms and notes from meetings</p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
                                        {filteredMindmaps.filter(m => m.entityType === 'meeting').length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => m.entityType === 'meeting').map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="group relative bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100/50 hover:border-purple-200 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                <Users size={120} className="transform rotate-12 text-purple-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-50">
                                                        {getEntityIcon(mindmap.entityType)}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="p-2 bg-white rounded-full shadow-sm text-purple-600">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
                                                    {mindmap.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
                                                    {mindmap.description || 'No description provided'}
                                                </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-purple-100/50">
                                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                                        Meeting
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                    </span>
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
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Calendar className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Event Mindmaps</h2>
                                        <p className="text-sm text-gray-500">Planning and layouts for events</p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                                        {filteredMindmaps.filter(m => m.entityType === 'event').length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => m.entityType === 'event').map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="group relative bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100/50 hover:border-green-200 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                <Calendar size={120} className="transform rotate-12 text-green-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-green-50">
                                                        {getEntityIcon(mindmap.entityType)}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="p-2 bg-white rounded-full shadow-sm text-green-600">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-1">
                                                    {mindmap.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
                                                    {mindmap.description || 'No description provided'}
                                                </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-green-100/50">
                                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                        Event
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                    </span>
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
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <StickyNote className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Other Mindmaps</h2>
                                        <p className="text-sm text-gray-500">General ideas and uncategorized maps</p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-bold">
                                        {filteredMindmaps.filter(m => !m.entityType || (m.entityType !== 'project' && m.entityType !== 'meeting' && m.entityType !== 'event')).length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMindmaps.filter(m => !m.entityType || (m.entityType !== 'project' && m.entityType !== 'meeting' && m.entityType !== 'event')).map((mindmap) => (
                                        <Link
                                            key={mindmap.id}
                                            href={`/dashboard/mindmap/${mindmap.id}`}
                                            className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-gray-200 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                <StickyNote size={120} className="transform rotate-12 text-gray-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-50">
                                                        {getEntityIcon(mindmap.entityType)}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="p-2 bg-white rounded-full shadow-sm text-gray-600">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                                                    {mindmap.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
                                                    {mindmap.description || 'No description provided'}
                                                </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                                                    <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                        Note
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(mindmap.updatedAt).toLocaleDateString()}
                                                    </span>
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
