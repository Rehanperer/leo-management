'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AgendaItem {
    title: string;
    presenter: string;
    duration: string;
    outcomes?: string;
}

interface ActionItem {
    task: string;
    assignee: string;
    deadline: string;
    status?: 'pending' | 'completed';
}

interface Meeting {
    id: string;
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    venue: string;
    type: string;
    status: string;
    summary?: string;
    agenda?: string; // JSON
    minutes?: string;
    actionItems?: string; // JSON
    project?: { title: string };
}

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'agenda' | 'minutes' | 'actions' | 'docs'>('agenda');

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const { id } = await params;
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/meetings/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMeeting(data.meeting);
                } else {
                    router.push('/dashboard/meetings');
                }
            } catch (error) {
                console.error('Error fetching meeting:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeeting();
    }, [params, router]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!meeting) return null;

    const agendaItems: AgendaItem[] = meeting.agenda ? JSON.parse(meeting.agenda) : [];
    const actionItems: ActionItem[] = meeting.actionItems ? JSON.parse(meeting.actionItems) : [];

    const addToGoogleCalendar = () => {
        const startDate = new Date(meeting.date);
        if (meeting.startTime) {
            const [hours, minutes] = meeting.startTime.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes));
        }

        const endDate = new Date(startDate);
        if (meeting.endTime) {
            const [hours, minutes] = meeting.endTime.split(':');
            endDate.setHours(parseInt(hours), parseInt(minutes));
        } else {
            endDate.setHours(startDate.getHours() + 1); // Default 1 hour
        }

        const text = encodeURIComponent(meeting.title);
        const details = encodeURIComponent(meeting.summary || '');
        const location = encodeURIComponent(meeting.venue || '');
        const dates = `${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`;

        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${dates}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/meetings" className="text-leo-600 hover:text-leo-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Meetings
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={addToGoogleCalendar}
                                className="text-gray-600 hover:text-leo-600 font-medium text-sm flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Add to Calendar
                            </button>
                            {/* Edit button could go here */}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Meeting Info & Agenda */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Meeting Header Card */}
                        <div className="card">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                                            {meeting.type}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide ${meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {meeting.status}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
                                    {meeting.project && (
                                        <p className="text-sm text-gray-500 font-medium">Project: {meeting.project.title}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-leo-600">
                                        {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500">
                                        {meeting.startTime} - {meeting.endTime}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {meeting.venue}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    {/* Placeholder for attendee count */}
                                    View Attendance
                                </div>
                            </div>

                            {meeting.summary && (
                                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{meeting.summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {['agenda', 'minutes', 'actions', 'docs'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`${activeTab === tab
                                            ? 'border-leo-500 text-leo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                    >
                                        {tab === 'docs' ? 'Documents' : tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === 'agenda' && (
                                <div className="space-y-4 animate-fade-in">
                                    {agendaItems.length > 0 ? (
                                        agendaItems.map((item, index) => (
                                            <div key={index} className="card border border-gray-100 hover:border-leo-100 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-gray-900">{index + 1}. {item.title}</h3>
                                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {item.duration}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">Presenter: <span className="font-medium">{item.presenter}</span></p>
                                                {item.outcomes && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-sm text-gray-700"><span className="font-semibold text-leo-600">Outcome:</span> {item.outcomes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No agenda items recorded.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'minutes' && (
                                <div className="card prose max-w-none animate-fade-in">
                                    {meeting.minutes ? (
                                        <div className="whitespace-pre-wrap text-gray-700">{meeting.minutes}</div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8 italic">No minutes recorded yet.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'actions' && (
                                <div className="space-y-4 animate-fade-in">
                                    {actionItems.length > 0 ? (
                                        actionItems.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <input type="checkbox" className="mt-1 rounded text-leo-600 focus:ring-leo-500" checked={item.status === 'completed'} readOnly />
                                                    <div>
                                                        <p className={`font-medium ${item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                            {item.task}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">Assigned to: {item.assignee}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${new Date(item.deadline) < new Date() && item.status !== 'completed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        Due {new Date(item.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No action items.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="card text-center py-12 animate-fade-in">
                                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No documents attached</h3>
                                    <p className="mt-1 text-gray-500">Upload minutes, presentations, or attendance sheets.</p>
                                    <button className="mt-4 btn btn-outline">Upload Document</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Next Steps & Quick Actions */}
                    <div className="space-y-6">
                        <div className="card bg-leo-50 border-leo-100">
                            <h3 className="font-semibold text-leo-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Next Steps
                            </h3>
                            <div className="space-y-3">
                                {actionItems.filter(i => i.status !== 'completed').slice(0, 3).map((item, i) => (
                                    <div key={i} className="bg-white p-3 rounded border border-leo-100 shadow-sm">
                                        <p className="text-sm font-medium text-gray-900">{item.task}</p>
                                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                                            <span>{item.assignee}</span>
                                            <span className="text-leo-600">Due {new Date(item.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {actionItems.filter(i => i.status !== 'completed').length === 0 && (
                                    <p className="text-sm text-leo-700 italic">No pending actions. Great job!</p>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full btn btn-outline justify-start">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Meeting Details
                                </button>
                                <button className="w-full btn btn-outline justify-start">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Minutes (PDF)
                                </button>
                                <button className="w-full btn btn-outline justify-start text-red-600 hover:bg-red-50 hover:border-red-200">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Cancel Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
