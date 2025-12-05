'use client';

import { useState, useEffect, useRef } from 'react';
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

interface DocumentItem {
    name: string;
    url: string;
    type: string;
    date: string;
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
    documents?: string; // JSON
    project?: { title: string };
}

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'agenda' | 'minutes' | 'actions' | 'docs'>('agenda');
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit State
    const [editForm, setEditForm] = useState<Partial<Meeting>>({});

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
                    setEditForm(data.meeting);
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

    const agendaItems: AgendaItem[] = (() => {
        try {
            return meeting.agenda ? JSON.parse(meeting.agenda) : [];
        } catch (error) {
            console.error('Error parsing agenda:', error);
            return [];
        }
    })();

    const actionItems: ActionItem[] = (() => {
        try {
            return meeting.actionItems ? JSON.parse(meeting.actionItems) : [];
        } catch (error) {
            console.error('Error parsing actionItems:', error);
            return [];
        }
    })();

    const documents: DocumentItem[] = (() => {
        try {
            return meeting.documents ? JSON.parse(meeting.documents) : [];
        } catch (error) {
            console.error('Error parsing documents:', error);
            return [];
        }
    })();

    const handleUpdateMeeting = async (updates: Partial<Meeting>) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/meetings/${meeting.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                setMeeting({ ...meeting, ...updates });
                setIsEditing(false);
            } else {
                alert('Failed to update meeting');
            }
        } catch (error) {
            console.error('Error updating meeting:', error);
            alert('An error occurred while updating');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        await handleUpdateMeeting({ status: newStatus });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit file size to 5MB for this simple Base64 implementation
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Max 5MB allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            const newDoc: DocumentItem = {
                name: file.name,
                url: base64,
                type: file.type,
                date: new Date().toISOString()
            };

            const updatedDocs = [...documents, newDoc];
            await handleUpdateMeeting({ documents: JSON.stringify(updatedDocs) });
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteDocument = async (index: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        const updatedDocs = documents.filter((_, i) => i !== index);
        await handleUpdateMeeting({ documents: JSON.stringify(updatedDocs) });
    };

    const handleCancelMeeting = async () => {
        if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/meetings/${meeting.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                router.push('/dashboard/meetings');
            } else {
                alert('Failed to delete meeting');
            }
        } catch (error) {
            console.error('Error deleting meeting:', error);
            alert('An error occurred while deleting the meeting');
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

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
            endDate.setHours(startDate.getHours() + 1);
        }

        const text = encodeURIComponent(meeting.title);
        const details = encodeURIComponent(meeting.summary || '');
        const location = encodeURIComponent(meeting.venue || '');
        const dates = `${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`;

        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${dates}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
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
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                                            {meeting.type}
                                        </span>
                                        <select
                                            value={meeting.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className={`text-xs font-medium uppercase tracking-wide border-0 rounded py-1 pl-2 pr-8 cursor-pointer focus:ring-2 focus:ring-offset-1 ${meeting.status === 'completed' ? 'bg-green-100 text-green-800 focus:ring-green-500' :
                                                meeting.status === 'cancelled' ? 'bg-red-100 text-red-800 focus:ring-red-500' : 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                                                }`}
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3 mb-4">
                                            <input
                                                type="text"
                                                className="input text-2xl font-bold"
                                                value={editForm.title || ''}
                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                            />
                                            <textarea
                                                className="input"
                                                value={editForm.summary || ''}
                                                onChange={e => setEditForm({ ...editForm, summary: e.target.value })}
                                                placeholder="Summary..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateMeeting(editForm)}
                                                    disabled={isSaving}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
                                            {meeting.project && (
                                                <p className="text-sm text-gray-500 font-medium">Project: {meeting.project.title}</p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {!isEditing && (
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-leo-600">
                                            {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-gray-500">
                                            {meeting.startTime} - {meeting.endTime}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="input py-1 px-2 text-sm"
                                            value={editForm.venue || ''}
                                            onChange={e => setEditForm({ ...editForm, venue: e.target.value })}
                                        />
                                    ) : (
                                        meeting.venue
                                    )}
                                </div>
                            </div>

                            {!isEditing && meeting.summary && (
                                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{meeting.summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 print:hidden">
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
                                    {isEditing ? (
                                        <textarea
                                            className="input h-64"
                                            value={editForm.minutes || ''}
                                            onChange={e => setEditForm({ ...editForm, minutes: e.target.value })}
                                            placeholder="Record minutes here..."
                                        />
                                    ) : meeting.minutes ? (
                                        <div className="whitespace-pre-wrap text-gray-700">{meeting.minutes}</div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8 italic">No minutes recorded yet.</p>
                                    )}
                                    {isEditing && (
                                        <div className="mt-4 text-right">
                                            <button
                                                onClick={() => handleUpdateMeeting({ minutes: editForm.minutes })}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Save Minutes
                                            </button>
                                        </div>
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
                                <div className="space-y-6 animate-fade-in">
                                    {documents.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2 bg-gray-100 rounded">
                                                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                                            <p className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={doc.url}
                                                            download={doc.name}
                                                            className="p-1 text-gray-400 hover:text-leo-600 transition-colors"
                                                            title="Download"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteDocument(index)}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="card text-center py-12 border-dashed border-2 border-gray-200 hover:border-leo-300 transition-colors">
                                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                                        <p className="mt-1 text-gray-500 mb-4">Upload minutes, presentations, or attendance sheets (Max 5MB).</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving}
                                            className="btn btn-outline"
                                        >
                                            {isSaving ? 'Uploading...' : 'Select File'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Next Steps & Quick Actions */}
                    <div className="space-y-6 print:hidden">
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
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`w-full btn justify-start ${isEditing ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {isEditing ? 'Exit Edit Mode' : 'Edit Meeting Details'}
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full btn btn-outline justify-start"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Minutes (PDF)
                                </button>
                                <button
                                    onClick={handleCancelMeeting}
                                    className="w-full btn btn-outline justify-start text-red-600 hover:bg-red-50 hover:border-red-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
