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
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'docs'>('overview');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        venue: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        status: '',
        type: '',
        highlight: false,
        mood: '',
    });

    // Dynamic lists for editing
    const [editGoals, setEditGoals] = useState<Goal[]>([]);
    const [editCollaborators, setEditCollaborators] = useState<Collaborator[]>([]);
    const [editImpact, setEditImpact] = useState({ beneficiaries: '', fundsRaised: '' });

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

                    // Helper to safely parse JSON that might already be an object
                    const safeParse = (value: any, fallback: any = []) => {
                        if (!value) return fallback;
                        if (typeof value === 'string') {
                            try {
                                return JSON.parse(value);
                            } catch {
                                return fallback;
                            }
                        }
                        return value; // Already an object
                    };

                    // Populate edit form
                    setEditForm({
                        title: data.event.title || '',
                        description: data.event.description || '',
                        venue: data.event.venue || '',
                        startDate: data.event.startDate?.split('T')[0] || '',
                        endDate: data.event.endDate?.split('T')[0] || '',
                        startTime: data.event.startTime || '',
                        endTime: data.event.endTime || '',
                        status: data.event.status || 'planned',
                        type: data.event.type || 'General',
                        highlight: data.event.highlight || false,
                        mood: data.event.mood || '🌟',
                    });

                    setEditGoals(safeParse(data.event.goals, []));
                    setEditCollaborators(safeParse(data.event.collaborators, []));
                    const metrics = safeParse(data.event.impactMetrics, {});
                    setEditImpact({
                        beneficiaries: metrics.beneficiaries || '',
                        fundsRaised: metrics.fundsRaised || ''
                    });
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

    // Helper to safely parse JSON that might already be an object or double-stringified
    const safeParse = (value: any, fallback: any = []) => {
        if (!value) return fallback;
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                // If it's still a string after parsing, try parsing again (double-stringified case)
                if (typeof parsed === 'string') {
                    try {
                        return JSON.parse(parsed);
                    } catch {
                        return fallback;
                    }
                }
                // Ensure we return the expected type
                return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : fallback;
            } catch {
                return fallback;
            }
        }
        // Already an object/array
        return value;
    };

    const goals: Goal[] = Array.isArray(safeParse(event.goals, [])) ? safeParse(event.goals, []) : [];
    const collaborators: Collaborator[] = Array.isArray(safeParse(event.collaborators, [])) ? safeParse(event.collaborators, []) : [];
    const documents: DocumentItem[] = Array.isArray(safeParse(event.documents, [])) ? safeParse(event.documents, []) : [];
    const impactMetrics = safeParse(event.impactMetrics, {});

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

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            await updateEvent({
                ...editForm,
                startDate: new Date(editForm.startDate).toISOString(),
                endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : undefined,
                goals: JSON.stringify(editGoals),
                collaborators: JSON.stringify(editCollaborators),
                impactMetrics: JSON.stringify({
                    beneficiaries: editImpact.beneficiaries,
                    fundsRaised: editImpact.fundsRaised
                })
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form to current event data
        if (event) {
            setEditForm({
                title: event.title || '',
                description: event.description || '',
                venue: event.venue || '',
                startDate: event.startDate?.split('T')[0] || '',
                endDate: event.endDate?.split('T')[0] || '',
                startTime: event.startTime || '',
                endTime: event.endTime || '',
                status: event.status || 'planned',
                type: event.type || 'General',
                highlight: event.highlight || false,
                mood: event.mood || '🌟',
            });
            setEditGoals(safeParse(event.goals, []));
            setEditCollaborators(safeParse(event.collaborators, []));
            const metrics = safeParse(event.impactMetrics, {});
            setEditImpact({
                beneficiaries: metrics.beneficiaries || '',
                fundsRaised: metrics.fundsRaised || ''
            });
        }
    };

    const handleAddGoal = () => {
        setEditGoals([...editGoals, { objective: '', target: '' }]);
    };

    const handleRemoveGoal = (index: number) => {
        setEditGoals(editGoals.filter((_, i) => i !== index));
    };

    const handleGoalChange = (index: number, field: keyof Goal, value: string) => {
        const newGoals = [...editGoals];
        newGoals[index][field] = value;
        setEditGoals(newGoals);
    };

    const handleAddCollaborator = () => {
        setEditCollaborators([...editCollaborators, { name: '', role: '', type: 'Leo Club' }]);
    };

    const handleRemoveCollaborator = (index: number) => {
        setEditCollaborators(editCollaborators.filter((_, i) => i !== index));
    };

    const handleCollaboratorChange = (index: number, field: keyof Collaborator, value: string) => {
        const newCollaborators = [...editCollaborators];
        newCollaborators[index][field] = value;
        setEditCollaborators(newCollaborators);
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="bg-[rgba(240,247,255,0.8)] backdrop-blur-lg border-b border-sky-shadow">
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
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="text-3xl font-bold text-gray-900 border-b-2 border-leo-500 focus:outline-none bg-transparent w-full"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    {event.mood && <span className="text-4xl">{event.mood}</span>}
                                    {event.title}
                                </h1>
                            )}
                            <div className="flex flex-wrap gap-6 mt-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            className="input-sm"
                                        />
                                    ) : (
                                        <>{new Date(event.startDate).toLocaleDateString()}</>
                                    )}
                                    {isEditing ? (
                                        <input
                                            type="time"
                                            value={editForm.startTime}
                                            onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                                            className="input-sm"
                                        />
                                    ) : (
                                        <>{event.startTime && ` • ${event.startTime}`}</>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.venue}
                                            onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                                            className="input-sm"
                                            placeholder="Venue"
                                        />
                                    ) : (
                                        <>{event.venue}</>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="input-sm"
                                        >
                                            <option value="planned">Planned</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    ) : (
                                        <>
                                            <span className={`w-2.5 h-2.5 rounded-full ${event.status === 'completed' ? 'bg-green-500' :
                                                event.status === 'ongoing' ? 'bg-blue-500' : 'bg-yellow-500'
                                                }`}></span>
                                            <span className="capitalize">{event.status}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-outline flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Event
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="btn btn-secondary"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="btn btn-primary"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
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
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="input w-full"
                                            rows={4}
                                            placeholder="Event description..."
                                        />
                                    ) : (
                                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                            {event.description || 'No description provided.'}
                                        </p>
                                    )}
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborators</h3>
                                    {collaborators.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {collaborators.map((collab, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-sky-mist rounded-lg border border-gray-100">
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
                                    <div className="card bg-sky-mist border-sky-shadow">
                                        <h4 className="text-sm font-medium text-sky-800 uppercase tracking-wide mb-1">Beneficiaries</h4>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editImpact.beneficiaries}
                                                onChange={(e) => setEditImpact({ ...editImpact, beneficiaries: e.target.value })}
                                                className="input w-full mt-2"
                                                placeholder="0"
                                            />
                                        ) : (
                                            <>
                                                <p className="text-3xl font-bold text-gray-900">{impactMetrics.beneficiaries || '0'}</p>
                                                <p className="text-xs text-gray-500 mt-2">People impacted by this project</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="card bg-sky-mist border-sky-shadow">
                                        <h4 className="text-sm font-medium text-sky-800 uppercase tracking-wide mb-1">Funds Raised</h4>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editImpact.fundsRaised}
                                                onChange={(e) => setEditImpact({ ...editImpact, fundsRaised: e.target.value })}
                                                className="input w-full mt-2"
                                                placeholder="0.00"
                                            />
                                        ) : (
                                            <>
                                                <p className="text-3xl font-bold text-gray-900">LKR {impactMetrics.fundsRaised || '0'}</p>
                                                <p className="text-xs text-gray-500 mt-2">Total funds generated</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Goals vs. Achievements</h3>
                                        {isEditing && (
                                            <button type="button" onClick={handleAddGoal} className="text-sm text-leo-600 hover:text-leo-700 font-medium">
                                                + Add Goal
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        {isEditing ? (
                                            <>
                                                {editGoals.map((goal, i) => (
                                                    <div key={i} className="flex gap-4 items-start">
                                                        <input
                                                            type="text"
                                                            placeholder="Objective"
                                                            className="input flex-1"
                                                            value={goal.objective}
                                                            onChange={(e) => handleGoalChange(i, 'objective', e.target.value)}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Target"
                                                            className="input w-1/3"
                                                            value={goal.target}
                                                            onChange={(e) => handleGoalChange(i, 'target', e.target.value)}
                                                        />
                                                        <button type="button" onClick={() => handleRemoveGoal(i)} className="text-red-500 hover:text-red-700 p-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                {editGoals.length === 0 && <p className="text-gray-500 italic">No goals added yet.</p>}
                                            </>
                                        ) : (
                                            <>
                                                {goals.map((goal, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="font-medium text-gray-900">{goal.objective}</span>
                                                            <span className="text-sm text-gray-500">Target: {goal.target}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                            <div className="bg-leo-600 h-2.5 rounded-full w-0 animate-pulse" style={{ width: '0%' }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {goals.length === 0 && <p className="text-gray-500 italic">No specific goals set.</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-sky-mist border border-sky-shadow rounded-lg group hover:border-leo-300 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-white/50 rounded text-gray-500">
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
                        <div className="card bg-sky-mist border-sky-shadow">
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
