'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Goal {
    objective: string;
    target: string;
    achieved?: string;
}

interface Collaborator {
    name: string;
    role: string;
    type: string;
}

interface DocumentItem {
    name: string;
    url: string;
    type: string;
    date: string;
}

interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    venue: string;
    status: string;
    type: string;
    highlight: boolean;
    mood?: string;
    goals?: string; // JSON
    impactMetrics?: string; // JSON
    collaborators?: string; // JSON
    documents?: string; // JSON
    participants?: number;
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'docs'>('overview');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { id } = await params;
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/events/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setEvent(data.event);
                } else {
                    router.push('/dashboard/events');
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvent();
    }, [params, router]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!event) return null;

    const goals: Goal[] = event.goals ? JSON.parse(event.goals) : [];
    const collaborators: Collaborator[] = event.collaborators ? JSON.parse(event.collaborators) : [];
    const documents: DocumentItem[] = event.documents ? JSON.parse(event.documents) : [];
    const impactMetrics = event.impactMetrics ? JSON.parse(event.impactMetrics) : {};

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Max 5MB allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            const newDoc: DocumentItem = {
                name: file.name,
                url: base64,
                type: file.type,
                date: new Date().toISOString()
            };

            const updatedDocs = [...documents, newDoc];
            await updateEvent({ documents: JSON.stringify(updatedDocs) });
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteDocument = async (index: number) => {
        if (!confirm('Delete this document?')) return;
        const updatedDocs = documents.filter((_, i) => i !== index);
        await updateEvent({ documents: JSON.stringify(updatedDocs) });
    };

    const updateEvent = async (updates: Partial<Event>) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/events/${event.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const data = await response.json();
                setEvent(data.event);
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Link href="/dashboard/events" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                                    ← Events
                                </Link>
                                <span className="text-gray-300">|</span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                                    {event.type}
                                </span>
                                {event.highlight && (
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                                        Major Event
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                {event.mood && <span className="text-4xl">{event.mood}</span>}
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 mt-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {new Date(event.startDate).toLocaleDateString()}
                                    {event.startTime && ` • ${event.startTime}`}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {event.venue}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${event.status === 'completed' ? 'bg-green-500' :
                                            event.status === 'ongoing' ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}></span>
                                    <span className="capitalize">{event.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Actions like Edit could go here */}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'impact', 'docs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`${activeTab === tab
                                        ? 'border-leo-500 text-leo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                            >
                                {tab === 'docs' ? 'Documents' : tab === 'impact' ? 'Goals & Impact' : tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Event</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                        {event.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborators</h3>
                                    {collaborators.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {collaborators.map((collab, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                                                        {collab.type === 'Leo Club' ? '🦁' :
                                                            collab.type === 'School' ? '🏫' :
                                                                collab.type === 'Corporate' ? '🏢' : '🤝'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{collab.name}</p>
                                                        <p className="text-xs text-gray-500">{collab.role} • {collab.type}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No collaborators listed.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'impact' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
                                        <h4 className="text-sm font-medium text-blue-800 uppercase tracking-wide mb-1">Beneficiaries</h4>
                                        <p className="text-3xl font-bold text-gray-900">{impactMetrics.beneficiaries || '0'}</p>
                                        <p className="text-xs text-gray-500 mt-2">People impacted by this project</p>
                                    </div>
                                    <div className="card bg-gradient-to-br from-green-50 to-white border-green-100">
                                        <h4 className="text-sm font-medium text-green-800 uppercase tracking-wide mb-1">Funds Raised</h4>
                                        <p className="text-3xl font-bold text-gray-900">LKR {impactMetrics.fundsRaised || '0'}</p>
                                        <p className="text-xs text-gray-500 mt-2">Total funds generated</p>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Goals vs. Achievements</h3>
                                    <div className="space-y-6">
                                        {goals.map((goal, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="font-medium text-gray-900">{goal.objective}</span>
                                                    <span className="text-sm text-gray-500">Target: {goal.target}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                    <div className="bg-leo-600 h-2.5 rounded-full w-0 animate-pulse" style={{ width: '0%' }}></div>
                                                    {/* Progress bar logic would go here if we had 'achieved' value */}
                                                </div>
                                            </div>
                                        ))}
                                        {goals.length === 0 && <p className="text-gray-500 italic">No specific goals set.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group hover:border-leo-300 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-gray-100 rounded text-gray-500">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a href={doc.url} download={doc.name} className="p-1 text-gray-400 hover:text-leo-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </a>
                                                <button onClick={() => handleDeleteDocument(index)} className="p-1 text-gray-400 hover:text-red-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="card text-center py-12 border-dashed border-2 border-gray-200 hover:border-leo-300 transition-colors">
                                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Upload Event Documents</h3>
                                    <p className="mt-1 text-gray-500 mb-4">Flyers, reports, photos, or minutes.</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn btn-outline"
                                    >
                                        Select File
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card bg-leo-50 border-leo-100">
                            <h3 className="font-semibold text-leo-900 mb-4">Next Steps</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1 rounded text-leo-600" />
                                    <span>Confirm venue booking</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1 rounded text-leo-600" />
                                    <span>Send invitations to guests</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1 rounded text-leo-600" />
                                    <span>Prepare budget report</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
