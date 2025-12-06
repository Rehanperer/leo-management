'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
    id: string;
    title: string;
}

interface AgendaItem {
    title: string;
    presenter: string;
    duration: string;
}

interface ActionItem {
    task: string;
    assignee: string;
    deadline: string;
}

export default function NewMeetingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        venue: '',
        type: 'General',
        projectId: '',
        summary: '',
    });

    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([{ title: '', presenter: '', duration: '' }]);
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Fetch Projects
                const projectsRes = await fetch('/api/projects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (projectsRes.ok) {
                    const data = await projectsRes.json();
                    setProjects(data.projects);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleAgendaChange = (index: number, field: keyof AgendaItem, value: string) => {
        const newAgenda = [...agendaItems];
        newAgenda[index][field] = value;
        setAgendaItems(newAgenda);
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, { title: '', presenter: '', duration: '' }]);
    };

    const removeAgendaItem = (index: number) => {
        setAgendaItems(agendaItems.filter((_, i) => i !== index));
    };

    const handleActionItemChange = (index: number, field: keyof ActionItem, value: string) => {
        const newActions = [...actionItems];
        newActions[index][field] = value;
        setActionItems(newActions);
    };

    const addActionItem = () => {
        setActionItems([...actionItems, { task: '', assignee: '', deadline: '' }]);
    };

    const removeActionItem = (index: number) => {
        setActionItems(actionItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    agenda: agendaItems.filter(i => i.title), // Only send items with titles
                    actionItems: actionItems.filter(i => i.task),
                }),
            });

            if (response.ok) {
                router.push('/dashboard/meetings');
            } else {
                alert('Failed to create meeting');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            <header className="bg-[rgba(240,247,255,0.8)] backdrop-blur-lg border-b border-sky-shadow sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/meetings" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Cancel
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Schedule New Meeting</h1>
                        <div className="w-16"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Meeting Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="e.g., Monthly Board Meeting"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="input"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue / Link</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Conference Room A or Zoom Link"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                                <select
                                    className="input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="General">General Meeting</option>
                                    <option value="Board">Board Meeting</option>
                                    <option value="Project">Project Meeting</option>
                                    <option value="Emergency">Emergency Meeting</option>
                                    <option value="Committee">Committee Meeting</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Related Project (Optional)</label>
                                <select
                                    className="input"
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Summary / Objectives</label>
                                <textarea
                                    className="input min-h-[80px]"
                                    placeholder="Briefly describe the purpose of this meeting..."
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Agenda Builder */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Agenda</h2>
                            <button type="button" onClick={addAgendaItem} className="text-sm text-leo-600 hover:text-leo-700 font-medium">
                                + Add Item
                            </button>
                        </div>
                        <div className="space-y-4">
                            {agendaItems.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start bg-sky-mist p-4 rounded-lg group">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-6">
                                            <input
                                                type="text"
                                                placeholder="Agenda Item Title"
                                                className="input bg-white"
                                                value={item.title}
                                                onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <input
                                                type="text"
                                                placeholder="Presenter"
                                                className="input bg-white"
                                                value={item.presenter}
                                                onChange={(e) => handleAgendaChange(index, 'presenter', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                className="input bg-white"
                                                value={item.duration}
                                                onChange={(e) => handleAgendaChange(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {agendaItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAgendaItem(index)}
                                            className="text-gray-400 hover:text-red-500 mt-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Items (Pre-meeting) */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Action Items (Pre-meeting)</h2>
                            <button type="button" onClick={addActionItem} className="text-sm text-leo-600 hover:text-leo-700 font-medium">
                                + Add Task
                            </button>
                        </div>
                        <div className="space-y-4">
                            {actionItems.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start bg-sky-mist p-4 rounded-lg">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-6">
                                            <input
                                                type="text"
                                                placeholder="Task Description"
                                                className="input bg-white"
                                                value={item.task}
                                                onChange={(e) => handleActionItemChange(index, 'task', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                placeholder="Assignee"
                                                className="input bg-white"
                                                value={item.assignee}
                                                onChange={(e) => handleActionItemChange(index, 'assignee', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <input
                                                type="date"
                                                className="input bg-white"
                                                value={item.deadline}
                                                onChange={(e) => handleActionItemChange(index, 'deadline', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeActionItem(index)}
                                        className="text-gray-400 hover:text-red-500 mt-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {actionItems.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-4">No action items added yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full md:w-auto px-8 py-3 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        >
                            {isLoading ? 'Creating...' : 'Schedule Meeting'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
