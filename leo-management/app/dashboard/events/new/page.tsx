'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Club {
    id: string;
    name: string;
}

interface Goal {
    objective: string;
    target: string;
}

interface Collaborator {
    name: string;
    role: string;
    type: string;
}

export default function NewEventPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // Dynamic Lists
    const [goals, setGoals] = useState<Goal[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        startTime: '',
        endTime: '',
        venue: '',
        status: 'planned',
        type: 'Community Service',
        highlight: false,
        mood: '🌟',
        participants: '',
        impactBeneficiaries: '',
        impactFunds: '',
    });

    useEffect(() => {
        const checkAdminAndFetchClubs = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'admin') {
                    setIsAdmin(true);
                    const response = await fetch('/api/clubs', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setClubs(data.clubs);
                        if (data.clubs.length > 0) setSelectedClubId(data.clubs[0].id);
                    }
                }
            } catch (e) {
                console.error('Error checking admin status:', e);
            }
        };
        checkAdminAndFetchClubs();
    }, []);

    const handleAddGoal = () => {
        setGoals([...goals, { objective: '', target: '' }]);
    };

    const handleRemoveGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    const handleGoalChange = (index: number, field: keyof Goal, value: string) => {
        const newGoals = [...goals];
        newGoals[index][field] = value;
        setGoals(newGoals);
    };

    const handleAddCollaborator = () => {
        setCollaborators([...collaborators, { name: '', role: '', type: 'Leo Club' }]);
    };

    const handleRemoveCollaborator = (index: number) => {
        setCollaborators(collaborators.filter((_, i) => i !== index));
    };

    const handleCollaboratorChange = (index: number, field: keyof Collaborator, value: string) => {
        const newCollaborators = [...collaborators];
        newCollaborators[index][field] = value;
        setCollaborators(newCollaborators);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
                goals,
                collaborators,
                impactMetrics: {
                    beneficiaries: formData.impactBeneficiaries,
                    fundsRaised: formData.impactFunds
                }
            };

            if (isAdmin) {
                if (!selectedClubId) {
                    alert('Please select a club');
                    setIsLoading(false);
                    return;
                }
                payload.clubId = selectedClubId;
            }

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create event');
            }

            router.push('/dashboard/events');
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Failed to create event');
        } finally {
            setIsLoading(false);
        }
    };

    const eventTypes = [
        'Community Service', 'Fundraising', 'Fellowship',
        'Awareness Campaign', 'Sports & Competitions', 'Internal Club Activities'
    ];

    const moodIcons = ['🌟', '🤝', '🎉', '💪', '🌱', '🎓', '🏆', '❤️'];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/events" className="text-leo-600 hover:text-leo-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Events
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Plan New Event</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="card space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Event Details</h2>

                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Club (Admin Mode)</label>
                                <select
                                    className="input"
                                    value={selectedClubId}
                                    onChange={e => setSelectedClubId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a club...</option>
                                    {clubs.map(club => (
                                        <option key={club.id} value={club.id}>{club.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input text-lg font-medium"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Annual Installation Ceremony"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                                <select
                                    className="input"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="input"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="planned">Planned</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What is this event about?"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.venue}
                                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                    placeholder="e.g., Town Hall, Zoom"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timing */}
                    <div className="card space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Date & Time</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    className="input"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Goals & Impact */}
                    <div className="card space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Goals & Impact</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">Event Goals</label>
                                <button type="button" onClick={handleAddGoal} className="text-sm text-leo-600 hover:text-leo-700 font-medium">+ Add Goal</button>
                            </div>
                            {goals.map((goal, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <input
                                        type="text"
                                        placeholder="Objective"
                                        className="input flex-1"
                                        value={goal.objective}
                                        onChange={e => handleGoalChange(index, 'objective', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Target"
                                        className="input w-1/3"
                                        value={goal.target}
                                        onChange={e => handleGoalChange(index, 'target', e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveGoal(index)} className="text-red-500 hover:text-red-700 p-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Beneficiaries</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.impactBeneficiaries}
                                    onChange={e => setFormData({ ...formData, impactBeneficiaries: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fundraising Goal (LKR)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.impactFunds}
                                    onChange={e => setFormData({ ...formData, impactFunds: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collaborators */}
                    <div className="card space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-900">Collaborators</h2>
                            <button type="button" onClick={handleAddCollaborator} className="text-sm text-leo-600 hover:text-leo-700 font-medium">+ Add Partner</button>
                        </div>

                        {collaborators.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No collaborators added yet.</p>
                        )}

                        {collaborators.map((collab, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                <input
                                    type="text"
                                    placeholder="Organization Name"
                                    className="input"
                                    value={collab.name}
                                    onChange={e => handleCollaboratorChange(index, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Role (e.g., Sponsor)"
                                    className="input"
                                    value={collab.role}
                                    onChange={e => handleCollaboratorChange(index, 'role', e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="input flex-1"
                                        value={collab.type}
                                        onChange={e => handleCollaboratorChange(index, 'type', e.target.value)}
                                    >
                                        <option>Leo Club</option>
                                        <option>Lions Club</option>
                                        <option>NGO</option>
                                        <option>School</option>
                                        <option>Corporate</option>
                                    </select>
                                    <button type="button" onClick={() => handleRemoveCollaborator(index)} className="text-red-500 hover:text-red-700 p-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Extras */}
                    <div className="card space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Extras</h2>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded text-leo-600 focus:ring-leo-500 w-5 h-5"
                                    checked={formData.highlight}
                                    onChange={e => setFormData({ ...formData, highlight: e.target.checked })}
                                />
                                <span className="text-gray-700 font-medium">Highlight as Major Event</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Mood / Theme Icon</label>
                            <div className="flex gap-4">
                                {moodIcons.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, mood: icon })}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border transition-all ${formData.mood === icon
                                                ? 'border-leo-500 bg-leo-50 scale-110 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/dashboard/events" className="btn btn-secondary px-8">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary px-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            {isLoading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
