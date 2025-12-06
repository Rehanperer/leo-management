'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    venue: string;
    status: string;
    type: string;
    startTime?: string;
    highlight: boolean;
    mood?: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, searchQuery, typeFilter, statusFilter]);

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

    const filterEvents = () => {
        let filtered = events;

        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (typeFilter !== 'All') {
            filtered = filtered.filter(event => event.type === typeFilter);
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(event => event.status === statusFilter);
        }

        setFilteredEvents(filtered);
    };

    const upcomingEvents = events.filter(e => new Date(e.startDate) >= new Date());
    const completedEvents = events.filter(e => e.status === 'completed');
    const highlightEvent = upcomingEvents.find(e => e.highlight) || upcomingEvents[0];

    const eventTypes = [
        'Community Service', 'Fundraising', 'Fellowship',
        'Awareness Campaign', 'Sports & Competitions', 'Internal Club Activities'
    ];

    return (
        <div className="min-h-screen pb-12">
            <header className="bg-[rgba(240,247,255,0.8)] backdrop-blur-lg border-b border-sky-shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
                        <Link href="/dashboard/events/new" className="btn btn-primary shadow-lg hover:shadow-xl transition-all">
                            + Plan New Event
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                        <h3 className="text-blue-100 font-medium">Total Events (Year)</h3>
                        <p className="text-4xl font-bold mt-2">{events.length}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                        <h3 className="text-purple-100 font-medium">Upcoming</h3>
                        <p className="text-4xl font-bold mt-2">{upcomingEvents.length}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                        <h3 className="text-green-100 font-medium">Completed</h3>
                        <p className="text-4xl font-bold mt-2">{completedEvents.length}</p>
                    </div>
                </div>

                {/* Highlight Box */}
                {highlightEvent && (
                    <div className="relative overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
                        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur-sm">
                                    Major Upcoming Event
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{highlightEvent.title}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-lg text-white/90">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(highlightEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {highlightEvent.startTime || 'Time TBD'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {highlightEvent.venue}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Link href={`/dashboard/events/${highlightEvent.id}`} className="btn bg-white text-blue-600 hover:bg-gray-100 border-none px-8 py-3 text-lg shadow-lg">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 card p-4">
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="input !pl-14 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="input w-full md:w-48"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select
                        className="input w-full md:w-48"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="planned">Planned</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Timeline & Event Cards */}
                {isLoading ? (
                    <div className="text-center py-12">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-16 card border-dashed border-sky-shadow">
                        <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or plan a new event.</p>
                    </div>
                ) : (
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                        {filteredEvents.map((event, index) => (
                            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Timeline Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 transform -translate-x-1/2 md:translate-x-0 z-10">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                {/* Card */}
                                <Link href={`/dashboard/events/${event.id}`} className="block w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card hover:shadow-md transition-all ml-16 md:ml-0 cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase tracking-wide ${event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {event.status}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium">{event.type}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {event.startTime || 'TBD'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {event.venue}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
