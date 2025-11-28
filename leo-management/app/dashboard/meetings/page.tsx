'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Meeting {
    id: string;
    title: string;
    date: string;
    venue: string;
    attendees: string; // JSON string
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/meetings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMeetings(data.meetings);
            }
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
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
                        <h1 className="text-xl font-bold text-gray-900">Meetings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Club Meetings</h2>
                    <Link href="/dashboard/meetings/new" className="btn btn-primary">
                        + Record Meeting
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading meetings...</div>
                ) : meetings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings recorded</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by recording your first meeting minutes.</p>
                        <div className="mt-6">
                            <Link href="/dashboard/meetings/new" className="btn btn-primary">
                                Record Meeting
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {meetings.map((meeting) => (
                            <div key={meeting.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                                        <p className="text-sm text-gray-500">{new Date(meeting.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        Minutes
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-4">
                                    <p>📍 {meeting.venue || 'No venue specified'}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">View details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
