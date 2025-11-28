'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Club {
    id: string;
    name: string;
}

export default function NewEventPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        venue: '',
        status: 'planned',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
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

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/events" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Events
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Plan New Event</h1>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Annual Installation Ceremony"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Event details..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
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
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard/events" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                        >
                            {isLoading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
