'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    startDate: string;
    venue: string;
    status: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
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
                        <h1 className="text-xl font-bold text-gray-900">Events</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                    <Link href="/dashboard/events/new" className="btn btn-primary">
                        + Plan Event
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No events planned</h3>
                        <p className="mt-1 text-sm text-gray-500">Start planning your next club event.</p>
                        <div className="mt-6">
                            <Link href="/dashboard/events/new" className="btn btn-primary">
                                Plan Event
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <div key={event.id} className="card flex items-center p-4 hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-16 h-16 bg-leo-100 rounded-lg flex flex-col items-center justify-center text-leo-700">
                                    <span className="text-xs font-bold uppercase">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-bold">{new Date(event.startDate).getDate()}</span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                            <p className="text-sm text-gray-500">📍 {event.venue}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                                            event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                        </span>
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
