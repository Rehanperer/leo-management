'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Meeting {
    id: string;
    title: string;
    date: string;
    startTime?: string;
    venue: string;
    type: string;
    status: string;
    summary?: string;
    project?: { title: string };
}

interface Project {
    id: string;
    title: string;
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterProject, setFilterProject] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const [meetingsRes, projectsRes] = await Promise.all([
                fetch('/api/meetings', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (meetingsRes.ok) {
                const data = await meetingsRes.json();
                setMeetings(data.meetings);
            }
            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state for stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthCount = meetings.filter(m => {
        const d = new Date(m.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const upcomingCount = meetings.filter(m => new Date(m.date) > new Date()).length;
    const completedCount = meetings.filter(m => m.status === 'completed').length;

    // Filtered meetings
    const filteredMeetings = meetings.filter(meeting => {
        const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.venue?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || meeting.type === filterType;
        const matchesProject = filterProject === 'all' || meeting.project?.title === filterProject; // Ideally filter by ID if API supported it fully

        return matchesSearch && matchesType && matchesProject;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 hover:text-leo-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Meetings Management</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">This Month</p>
                                <h3 className="text-3xl font-bold mt-1">{thisMonthCount}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-blue-100 mt-4">Total scheduled meetings</p>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Upcoming</p>
                                <h3 className="text-3xl font-bold mt-1">{upcomingCount}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-purple-100 mt-4">Future meetings planned</p>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Completed</p>
                                <h3 className="text-3xl font-bold mt-1">{completedCount}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-green-100 mt-4">Successfully concluded</p>
                    </div>
                </div>

                {/* Controls & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="flex flex-1 w-full md:w-auto gap-4">
                        <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search meetings..."
                                className="input !pl-14 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="input w-40"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="General">General</option>
                            <option value="Board">Board</option>
                            <option value="Project">Project</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                        <select
                            className="input w-40"
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                        >
                            <option value="all">All Projects</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.title}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <Link href="/dashboard/meetings/new" className="btn btn-primary whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Schedule Meeting
                    </Link>
                </div>

                {/* Timeline View */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading your schedule...</p>
                    </div>
                ) : filteredMeetings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No meetings found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your filters or schedule a new meeting.</p>
                    </div>
                ) : (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        {filteredMeetings.map((meeting, index) => (
                            <div key={meeting.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Timeline Icon */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-leo-100 text-leo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600`}>
                                                    {meeting.type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(meeting.status)} capitalize`}>
                                                    {meeting.status}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg">{meeting.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            {meeting.startTime && (
                                                <p className="text-xs text-gray-500">{meeting.startTime}</p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {meeting.summary || 'No summary provided.'}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {meeting.venue || 'No venue'}
                                        </div>
                                        {meeting.project && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                                {meeting.project.title}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <Link
                                            href={`/dashboard/meetings/${meeting.id}`}
                                            className="text-sm font-medium text-leo-600 hover:text-leo-700 flex items-center gap-1 group-hover:gap-2 transition-all"
                                        >
                                            View Details
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
