'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Club {
    id: string;
    name: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Service',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        beneficiaries: '',
        serviceHours: '',
        participants: '',
    });

    useEffect(() => {
        // Check if user is admin and fetch clubs
        const checkAdminAndFetchClubs = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Decode token to check role (simple check, real verification on server)
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'admin') {
                    setIsAdmin(true);
                    const response = await fetch('/api/clubs', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setClubs(data.clubs);
                        if (data.clubs.length > 0) {
                            setSelectedClubId(data.clubs[0].id);
                        }
                    }
                }
            } catch (e) {
                console.error('Error checking admin status:', e);
            }
        };

        checkAdminAndFetchClubs();
    }, []);

    const handleAiAssist = async () => {
        if (!formData.title) {
            alert('Please enter a project title first');
            return;
        }

        setIsAiLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai/form-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fieldName: 'description',
                    currentData: { title: formData.title, category: formData.category }
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get AI suggestion');
            }

            if (data.suggestion) {
                setFormData(prev => ({ ...prev, description: data.suggestion }));
            }
        } catch (error: any) {
            console.error('AI Assist failed:', error);
            alert(error.message || 'Failed to get AI suggestion');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                ...formData,
                beneficiaries: parseInt(formData.beneficiaries) || 0,
                serviceHours: parseFloat(formData.serviceHours) || 0,
                participants: parseInt(formData.participants) || 0,
                date: new Date(formData.date).toISOString(),
            };

            if (isAdmin) {
                if (!selectedClubId) {
                    alert('Please select a club');
                    setIsLoading(false);
                    return;
                }
                payload.clubId = selectedClubId;
            }

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create project');
            }

            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">New Project Report</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <div className="grid grid-cols-1 gap-6">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Community Food Drive"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleAiAssist}
                                        disabled={isAiLoading}
                                        className="text-xs flex items-center text-leo-600 hover:text-leo-700 font-medium"
                                    >
                                        {isAiLoading ? 'Generating...' : '✨ AI Assist'}
                                    </button>
                                </div>
                                <textarea
                                    required
                                    rows={4}
                                    className="input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the project activities, goals, and outcomes..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="input"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Service</option>
                                        <option>Fundraising</option>
                                        <option>Meeting</option>
                                        <option>Social</option>
                                        <option>Administration</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.venue}
                                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiaries</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input"
                                        value={formData.beneficiaries}
                                        onChange={e => setFormData({ ...formData, beneficiaries: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Hours</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        className="input"
                                        value={formData.serviceHours}
                                        onChange={e => setFormData({ ...formData, serviceHours: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input"
                                        value={formData.participants}
                                        onChange={e => setFormData({ ...formData, participants: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                        >
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
