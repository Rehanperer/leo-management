'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Clock, MapPin, Video } from 'lucide-react';

const AGENDA_ITEMS_PHYSICAL = [
    { item: 'Calling Dignitaries to the Head Table', duration: 2 },
    { item: 'Meeting Call to Order', duration: 1 },
    { item: 'National Anthem', duration: 3 },
    { item: 'Pledge of Allegiance to the National Flag of Sri Lanka', duration: 3 },
    { item: 'Leo Pledge', duration: 3 },
    { item: 'Environmental Pledge', duration: 3 },
    { item: 'Introduction of the Head Table', duration: 2 },
    { item: 'Welcome Address', duration: 3 },
    { item: 'Meeting Minutes of the previous General Meeting', duration: 3 },
    { item: 'Treasurer\'s Report of the previous General Meeting', duration: 3 },
    { item: 'Club President\'s Address', duration: 5 },
    { item: 'Open Forum', duration: 3 },
    { item: 'Introduction of the Special Guest', duration: 3 },
    { item: 'Address by the Special Guest', duration: 10 },
    { item: 'Introduction of the Guest of Honor', duration: 3 },
    { item: 'Address by the Guest of Honor', duration: 10 },
    { item: 'Introduction of the Chief Guest', duration: 3 },
    { item: 'Address by the Chief Guest', duration: 10 },
    { item: 'Presentation of Tokens of Appreciation', duration: 2 },
    { item: 'Closing Remarks by Leo Advisor', duration: 5 },
    { item: 'Vote of Thanks', duration: 5 },
    { item: 'Termination of the General meeting', duration: 1 },
    { item: 'End of General meeting', duration: 1 },
];

const AGENDA_ITEMS_ONLINE = [
    { item: 'Meeting Call to Order', duration: 1 },
    { item: 'Pledge of Allegiance to the National Flag of Sri Lanka', duration: 3 },
    { item: 'Leo Pledge', duration: 3 },
    { item: 'Environmental Pledge', duration: 3 },
    { item: 'Welcome Address', duration: 3 },
    { item: 'Meeting Minutes of the previous General Meeting', duration: 3 },
    { item: 'Treasurer\'s Report of the previous General Meeting', duration: 3 },
    { item: 'Club President\'s Address', duration: 5 },
    { item: 'Open Forum', duration: 3 },
    { item: 'Introduction of the Special Guest', duration: 3 },
    { item: 'Address by the Special Guest', duration: 10 },
    { item: 'Introduction of the Guest of Honor', duration: 3 },
    { item: 'Address by the Guest of Honor', duration: 10 },
    { item: 'Introduction of the Chief Guest', duration: 3 },
    { item: 'Address by the Chief Guest', duration: 10 },
    { item: 'Closing Remarks by Leo Advisor', duration: 5 },
    { item: 'Vote of Thanks', duration: 5 },
    { item: 'Termination of the General meeting', duration: 1 },
    { item: 'End of General meeting', duration: 1 },
];

export default function AgendaReportPage() {
    const [loading, setLoading] = useState(false);

    // Basic Info
    const [clubName, setClubName] = useState('');
    const [month, setMonth] = useState('January');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('15:00');

    // Meeting Type
    const [meetingType, setMeetingType] = useState<'Physical' | 'Online'>('Physical');
    const [venue, setVenue] = useState('');

    // Guests
    const [guests, setGuests] = useState({
        chief: { name: '', designation: '', club: '' },
        honor: { name: '', designation: '', club: '' },
        special: { name: '', designation: '', club: '' }
    });

    // Calculated Agenda
    const [agenda, setAgenda] = useState<{ time: string; item: string; duration: number }[]>([]);

    useEffect(() => {
        calculateAgenda();
    }, [startTime, meetingType]);

    const calculateAgenda = () => {
        if (!startTime) return;

        // Select the appropriate agenda items based on meeting type
        const items = meetingType === 'Online' ? AGENDA_ITEMS_ONLINE : AGENDA_ITEMS_PHYSICAL;

        const [hours, minutes] = startTime.split(':').map(Number);
        let currentTime = new Date();
        currentTime.setHours(hours, minutes, 0);

        const newAgenda = items.map(item => {
            const timeString = currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Add duration for next item
            currentTime.setMinutes(currentTime.getMinutes() + item.duration);

            return {
                time: timeString,
                item: item.item,
                duration: item.duration
            };
        });

        setAgenda(newAgenda);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                clubName,
                month,
                year,
                date,
                startTime,
                meetingType,
                venue,
                guests,
                agenda
            };

            const response = await fetch('/api/reports/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to generate agenda');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Agenda_${month}_${year}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate agenda');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen animate-fade-in pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link href="/dashboard/reports" className="inline-flex items-center text-gray-600 hover:text-leo-600 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reports
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">General Meeting Agenda</h1>
                    <p className="text-gray-600 mt-2">Generate a structured agenda with automatic time allocation</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Meeting Details */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-leo-600" />
                            Meeting Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="label">Club Name</label><input type="text" required value={clubName} onChange={e => setClubName(e.target.value)} className="input" /></div>
                            <div>
                                <label className="label">Month</label>
                                <select value={month} onChange={e => setMonth(e.target.value)} className="input">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div><label className="label">Year</label><input type="text" required value={year} onChange={e => setYear(e.target.value)} className="input" /></div>
                            <div><label className="label">Date</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="input" /></div>
                            <div><label className="label">Start Time</label><input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="input" /></div>

                            <div className="md:col-span-2">
                                <label className="label">Meeting Type</label>
                                <div className="flex space-x-4 mb-4">
                                    <button type="button" onClick={() => setMeetingType('Physical')} className={`px-4 py-2 rounded-lg border ${meetingType === 'Physical' ? 'bg-sky-mist border-leo-500 text-leo-700' : 'border-gray-200 hover:bg-sky-mist'}`}>
                                        <MapPin className="w-4 h-4 inline mr-2" /> Physical
                                    </button>
                                    <button type="button" onClick={() => setMeetingType('Online')} className={`px-4 py-2 rounded-lg border ${meetingType === 'Online' ? 'bg-sky-mist border-leo-500 text-leo-700' : 'border-gray-200 hover:bg-sky-mist'}`}>
                                        <Video className="w-4 h-4 inline mr-2" /> Online
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={venue}
                                    onChange={e => setVenue(e.target.value)}
                                    className="input"
                                    placeholder={meetingType === 'Physical' ? "Enter Venue Location" : "Enter Platform & Link (e.g. Zoom)"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Guests</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3 font-medium text-gray-700">Chief Guest</div>
                                <input placeholder="Name" value={guests.chief.name} onChange={e => setGuests({ ...guests, chief: { ...guests.chief, name: e.target.value } })} className="input" />
                                <input placeholder="Designation" value={guests.chief.designation} onChange={e => setGuests({ ...guests, chief: { ...guests.chief, designation: e.target.value } })} className="input" />
                                <input placeholder="Club/District" value={guests.chief.club} onChange={e => setGuests({ ...guests, chief: { ...guests.chief, club: e.target.value } })} className="input" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3 font-medium text-gray-700">Guest of Honor</div>
                                <input placeholder="Name" value={guests.honor.name} onChange={e => setGuests({ ...guests, honor: { ...guests.honor, name: e.target.value } })} className="input" />
                                <input placeholder="Designation" value={guests.honor.designation} onChange={e => setGuests({ ...guests, honor: { ...guests.honor, designation: e.target.value } })} className="input" />
                                <input placeholder="Club/District" value={guests.honor.club} onChange={e => setGuests({ ...guests, honor: { ...guests.honor, club: e.target.value } })} className="input" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3 font-medium text-gray-700">Special Guest</div>
                                <input placeholder="Name" value={guests.special.name} onChange={e => setGuests({ ...guests, special: { ...guests.special, name: e.target.value } })} className="input" />
                                <input placeholder="Designation" value={guests.special.designation} onChange={e => setGuests({ ...guests, special: { ...guests.special, designation: e.target.value } })} className="input" />
                                <input placeholder="Club/District" value={guests.special.club} onChange={e => setGuests({ ...guests, special: { ...guests.special, club: e.target.value } })} className="input" />
                            </div>
                        </div>
                    </div>

                    {/* Agenda Preview */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Agenda Preview</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-sky-mist">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {agenda.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.time}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.item}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.duration} mins</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-leo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-leo-500/30 hover:shadow-leo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Agenda</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
