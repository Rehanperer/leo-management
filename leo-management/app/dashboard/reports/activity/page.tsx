'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Upload, FileText, Loader2 } from 'lucide-react';

interface Participation {
    id: string;
    event: string;
    date: string;
    count: string;
    names: string;
}

interface ProjectSummary {
    id: string;
    date: string;
    name: string;
    category: string;
}

export default function ActivityReportPage() {
    const [loading, setLoading] = useState(false);

    // Basic Info
    const [clubName, setClubName] = useState('');
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [secretaryName, setSecretaryName] = useState('');

    // Membership
    const [membership, setMembership] = useState({
        previous: '',
        inducted: '',
        dropped: '',
        present: '',
        board: ''
    });

    // Meetings - General
    const [generalMeeting, setGeneralMeeting] = useState({
        date: '',
        time: '',
        venue: '',
        officersVisited: '',
        advisorPresent: 'Yes',
        guests: {
            chief: { name: '', designation: '' },
            honor: { name: '', designation: '' },
            special: { name: '', designation: '' },
            other: { name: '', designation: '' }
        },
        attendance: {
            leos: '',
            leosPresentAbsent: '',
            prospects: '',
            lions: '',
            council: '',
            visitingLeos: '',
            parents: '',
            guests: '',
            staffAdvisor: '',
            clubPresident: '',
            clubVicePresident: '',
            clubSecretary: '',
            clubTreasurer: '',
            leoAdvisor: ''
        }
    });

    // Meetings - Board
    const [boardMeeting, setBoardMeeting] = useState({
        date: '',
        time: '',
        venue: '',
        membersPresent: '',
        attendancePercent: '',
        advisorPresent: 'Yes'
    });

    // Finances
    const [finances, setFinances] = useState({
        surplusDeficit: '',
        receivables: '',
        payables: ''
    });

    // Projects Count
    const [projectsCount, setProjectsCount] = useState('');

    // Participation Lists
    const [participation, setParticipation] = useState<{
        district: Participation[];
        multipleDistrict: Participation[];
        lions: Participation[];
        otherClubs: Participation[];
    }>({
        district: [],
        multipleDistrict: [],
        lions: [],
        otherClubs: []
    });

    // Project Summary List
    const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>([]);

    // Images
    const [gmPhoto, setGmPhoto] = useState<File | null>(null);
    const [boardMeetingPhoto, setBoardMeetingPhoto] = useState<File | null>(null);
    const [attendanceLists, setAttendanceLists] = useState<(File | null)[]>([null]);
    const [myleoUpdate, setMyleoUpdate] = useState<File | null>(null);
    const [mylciUpdate, setMylciUpdate] = useState<File | null>(null);
    const [newsletter, setNewsletter] = useState<File | null>(null);
    const [blog, setBlog] = useState<File | null>(null);
    const [website, setWebsite] = useState<File | null>(null);

    // Helper to add items to lists
    const addParticipation = (type: keyof typeof participation) => {
        setParticipation(prev => ({
            ...prev,
            [type]: [...prev[type], { id: Math.random().toString(36).substr(2, 9), event: '', date: '', count: '', names: '' }]
        }));
    };

    const removeParticipation = (type: keyof typeof participation, id: string) => {
        setParticipation(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    };

    const updateParticipation = (type: keyof typeof participation, id: string, field: keyof Participation, value: string) => {
        setParticipation(prev => ({
            ...prev,
            [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addProjectSummary = () => {
        setProjectSummaries([...projectSummaries, { id: Math.random().toString(36).substr(2, 9), date: '', name: '', category: '' }]);
    };

    const removeProjectSummary = (id: string) => {
        setProjectSummaries(projectSummaries.filter(item => item.id !== id));
    };

    const updateProjectSummary = (id: string, field: keyof ProjectSummary, value: string) => {
        setProjectSummaries(projectSummaries.map(item => item.id === id ? { ...item, [field]: value } : item));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            // Basic fields
            formData.append('clubName', clubName);
            formData.append('month', month);
            formData.append('year', year);
            formData.append('secretaryName', secretaryName);
            formData.append('membership', JSON.stringify(membership));
            formData.append('generalMeeting', JSON.stringify(generalMeeting));
            formData.append('boardMeeting', JSON.stringify(boardMeeting));
            formData.append('finances', JSON.stringify(finances));
            formData.append('participation', JSON.stringify(participation));
            formData.append('projectSummaries', JSON.stringify(projectSummaries));
            formData.append('projectsCount', projectsCount);

            // Images
            if (gmPhoto) formData.append('gmPhoto', gmPhoto);
            if (boardMeetingPhoto) formData.append('boardMeetingPhoto', boardMeetingPhoto);
            attendanceLists.forEach((file, index) => {
                if (file) formData.append(`attendanceList_${index}`, file);
            });
            formData.append('attendanceListCount', attendanceLists.filter(f => f !== null).length.toString());
            if (myleoUpdate) formData.append('myleoUpdate', myleoUpdate);
            if (mylciUpdate) formData.append('mylciUpdate', mylciUpdate);
            if (newsletter) formData.append('newsletter', newsletter);
            if (blog) formData.append('blog', blog);
            if (website) formData.append('website', website);

            const response = await fetch('/api/reports/activity', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to generate report');

            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Activity_Report_${month}_${year}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30 animate-fade-in pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        href="/dashboard/reports"
                        className="inline-flex items-center text-gray-600 hover:text-leo-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reports
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Activity Report</h1>
                    <p className="text-gray-600 mt-2">Generate monthly activity reports with comprehensive details</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-leo-600" />
                            Report Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                                <input type="text" required value={clubName} onChange={(e) => setClubName(e.target.value)} className="input" placeholder="e.g. Leo Club of Colombo" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secretary Name</label>
                                <input type="text" required value={secretaryName} onChange={(e) => setSecretaryName(e.target.value)} className="input" placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select value={month} onChange={(e) => setMonth(e.target.value)} className="input">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input type="number" required value={year} onChange={(e) => setYear(e.target.value)} className="input" />
                            </div>
                        </div>
                    </div>

                    {/* Membership Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Membership</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="label">Previous Month</label><input type="number" value={membership.previous} onChange={e => setMembership({ ...membership, previous: e.target.value })} className="input" /></div>
                            <div><label className="label">Inducted</label><input type="number" value={membership.inducted} onChange={e => setMembership({ ...membership, inducted: e.target.value })} className="input" /></div>
                            <div><label className="label">Dropped</label><input type="number" value={membership.dropped} onChange={e => setMembership({ ...membership, dropped: e.target.value })} className="input" /></div>
                            <div><label className="label">Present Month</label><input type="number" value={membership.present} onChange={e => setMembership({ ...membership, present: e.target.value })} className="input" /></div>
                            <div><label className="label">Board Members</label><input type="number" value={membership.board} onChange={e => setMembership({ ...membership, board: e.target.value })} className="input" /></div>
                        </div>
                    </div>

                    {/* Meetings Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Meetings</h2>

                        <h3 className="text-lg font-medium text-gray-800 mb-4">General Meeting</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div><label className="label">Date</label><input type="date" value={generalMeeting.date} onChange={e => setGeneralMeeting({ ...generalMeeting, date: e.target.value })} className="input" /></div>
                            <div><label className="label">Time</label><input type="time" value={generalMeeting.time} onChange={e => setGeneralMeeting({ ...generalMeeting, time: e.target.value })} className="input" /></div>
                            <div className="md:col-span-2"><label className="label">Venue</label><input type="text" value={generalMeeting.venue} onChange={e => setGeneralMeeting({ ...generalMeeting, venue: e.target.value })} className="input" /></div>
                            <div className="md:col-span-2"><label className="label">District/Multiple Officers Visited</label><input type="text" value={generalMeeting.officersVisited} onChange={e => setGeneralMeeting({ ...generalMeeting, officersVisited: e.target.value })} className="input" /></div>
                            <div>
                                <label className="label">Leo Advisor Present?</label>
                                <select value={generalMeeting.advisorPresent} onChange={e => setGeneralMeeting({ ...generalMeeting, advisorPresent: e.target.value })} className="input">
                                    <option>Yes</option><option>No</option>
                                </select>
                            </div>
                        </div>

                        <h4 className="text-md font-medium text-gray-700 mb-3">Guests</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Chief Guest</p>
                                <input placeholder="Name" value={generalMeeting.guests.chief.name} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, chief: { ...generalMeeting.guests.chief, name: e.target.value } } })} className="input mb-2" />
                                <input placeholder="Designation" value={generalMeeting.guests.chief.designation} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, chief: { ...generalMeeting.guests.chief, designation: e.target.value } } })} className="input" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Guest of Honor</p>
                                <input placeholder="Name" value={generalMeeting.guests.honor.name} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, honor: { ...generalMeeting.guests.honor, name: e.target.value } } })} className="input mb-2" />
                                <input placeholder="Designation" value={generalMeeting.guests.honor.designation} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, honor: { ...generalMeeting.guests.honor, designation: e.target.value } } })} className="input" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Special Guest</p>
                                <input placeholder="Name" value={generalMeeting.guests.special.name} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, special: { ...generalMeeting.guests.special, name: e.target.value } } })} className="input mb-2" />
                                <input placeholder="Designation" value={generalMeeting.guests.special.designation} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, special: { ...generalMeeting.guests.special, designation: e.target.value } } })} className="input" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Other Guests</p>
                                <input placeholder="Name" value={generalMeeting.guests.other.name} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, other: { ...generalMeeting.guests.other, name: e.target.value } } })} className="input mb-2" />
                                <input placeholder="Designation" value={generalMeeting.guests.other.designation} onChange={e => setGeneralMeeting({ ...generalMeeting, guests: { ...generalMeeting.guests, other: { ...generalMeeting.guests.other, designation: e.target.value } } })} className="input" />
                            </div>
                        </div>

                        <h4 className="text-md font-medium text-gray-700 mb-3">Attendance</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div><label className="label">Leos (Nos)</label><input type="text" value={generalMeeting.attendance.leos} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, leos: e.target.value } })} className="input" /></div>
                            <div><label className="label">Present/Absent</label><input type="text" value={generalMeeting.attendance.leosPresentAbsent} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, leosPresentAbsent: e.target.value } })} className="input" /></div>
                            <div><label className="label">Leo Prospects</label><input type="text" value={generalMeeting.attendance.prospects} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, prospects: e.target.value } })} className="input" /></div>
                            <div><label className="label">Lions/Lionesses</label><input type="text" value={generalMeeting.attendance.lions} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, lions: e.target.value } })} className="input" /></div>
                        </div>

                        <h4 className="text-md font-medium text-gray-700 mb-3">Officer Attendance (Present/Absent)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <div><label className="label">Club President</label><input type="text" value={generalMeeting.attendance.clubPresident} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, clubPresident: e.target.value } })} className="input" placeholder="Present or Absent" /></div>
                            <div><label className="label">Club Vice President</label><input type="text" value={generalMeeting.attendance.clubVicePresident} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, clubVicePresident: e.target.value } })} className="input" placeholder="Present or Absent" /></div>
                            <div><label className="label">Club Secretary</label><input type="text" value={generalMeeting.attendance.clubSecretary} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, clubSecretary: e.target.value } })} className="input" placeholder="Present or Absent" /></div>
                            <div><label className="label">Club Treasurer</label><input type="text" value={generalMeeting.attendance.clubTreasurer} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, clubTreasurer: e.target.value } })} className="input" placeholder="Present or Absent" /></div>
                            <div><label className="label">Leo Advisor</label><input type="text" value={generalMeeting.attendance.leoAdvisor} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, leoAdvisor: e.target.value } })} className="input" placeholder="Present or Absent" /></div>
                            <div><label className="label">Staff Advisor</label><input type="text" value={generalMeeting.attendance.staffAdvisor} onChange={e => setGeneralMeeting({ ...generalMeeting, attendance: { ...generalMeeting.attendance, staffAdvisor: e.target.value } })} className="input" placeholder="Present or Absent" /></div>
                        </div>

                        <h3 className="text-lg font-medium text-gray-800 mb-4 border-t pt-4">Board Meeting</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="label">Date</label><input type="date" value={boardMeeting.date} onChange={e => setBoardMeeting({ ...boardMeeting, date: e.target.value })} className="input" /></div>
                            <div><label className="label">Time</label><input type="time" value={boardMeeting.time} onChange={e => setBoardMeeting({ ...boardMeeting, time: e.target.value })} className="input" /></div>
                            <div className="md:col-span-2"><label className="label">Venue</label><input type="text" value={boardMeeting.venue} onChange={e => setBoardMeeting({ ...boardMeeting, venue: e.target.value })} className="input" /></div>
                            <div><label className="label">Members Present</label><input type="number" value={boardMeeting.membersPresent} onChange={e => setBoardMeeting({ ...boardMeeting, membersPresent: e.target.value })} className="input" /></div>
                            <div><label className="label">Attendance %</label><input type="text" value={boardMeeting.attendancePercent} onChange={e => setBoardMeeting({ ...boardMeeting, attendancePercent: e.target.value })} className="input" /></div>
                        </div>
                    </div>

                    {/* Finances Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Finances</h2>
                        <div className="space-y-4">
                            <div><label className="label">Total Surplus/Deficit</label><input type="text" value={finances.surplusDeficit} onChange={e => setFinances({ ...finances, surplusDeficit: e.target.value })} className="input" /></div>
                            <div><label className="label">Total Receivables</label><input type="text" value={finances.receivables} onChange={e => setFinances({ ...finances, receivables: e.target.value })} className="input" /></div>
                            <div><label className="label">Total Payables</label><input type="text" value={finances.payables} onChange={e => setFinances({ ...finances, payables: e.target.value })} className="input" /></div>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Projects</h2>
                        <div>
                            <label className="label">Number of Projects Conducted for this Month</label>
                            <input type="number" value={projectsCount} onChange={e => setProjectsCount(e.target.value)} className="input" placeholder="00" />
                        </div>
                    </div>

                    {/* Participation Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Participation</h2>

                        {Object.entries({
                            district: 'District Events',
                            multipleDistrict: 'Multiple District Events',
                            lions: 'Lions Club/District Events',
                            otherClubs: 'Other Clubs\' Events'
                        }).map(([key, title]) => (
                            <div key={key} className="mb-8 last:mb-0">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-medium text-gray-800">{title}</h3>
                                    <button type="button" onClick={() => addParticipation(key as any)} className="text-sm text-leo-600 hover:text-leo-700 flex items-center"><Plus className="w-4 h-4 mr-1" /> Add Row</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="p-2">Event</th>
                                                <th className="p-2 w-32">Date</th>
                                                <th className="p-2 w-24">Count</th>
                                                <th className="p-2">Names</th>
                                                <th className="p-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {participation[key as keyof typeof participation].map((item) => (
                                                <tr key={item.id}>
                                                    <td className="p-2"><input className="input py-1" value={item.event} onChange={e => updateParticipation(key as any, item.id, 'event', e.target.value)} /></td>
                                                    <td className="p-2"><input type="date" className="input py-1" value={item.date} onChange={e => updateParticipation(key as any, item.id, 'date', e.target.value)} /></td>
                                                    <td className="p-2"><input className="input py-1" value={item.count} onChange={e => updateParticipation(key as any, item.id, 'count', e.target.value)} /></td>
                                                    <td className="p-2"><input className="input py-1" value={item.names} onChange={e => updateParticipation(key as any, item.id, 'names', e.target.value)} /></td>
                                                    <td className="p-2"><button type="button" onClick={() => removeParticipation(key as any, item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Project Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Monthly Project Summary</h2>
                            <button type="button" onClick={addProjectSummary} className="btn-secondary text-sm"><Plus className="w-4 h-4 mr-1" /> Add Project</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-2 w-40">Date</th>
                                        <th className="p-2">Project Name</th>
                                        <th className="p-2">Category</th>
                                        <th className="p-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {projectSummaries.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-2"><input type="date" className="input py-1" value={item.date} onChange={e => updateProjectSummary(item.id, 'date', e.target.value)} /></td>
                                            <td className="p-2"><input className="input py-1" value={item.name} onChange={e => updateProjectSummary(item.id, 'name', e.target.value)} /></td>
                                            <td className="p-2"><input className="input py-1" value={item.category} onChange={e => updateProjectSummary(item.id, 'category', e.target.value)} /></td>
                                            <td className="p-2"><button type="button" onClick={() => removeProjectSummary(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Upload className="w-5 h-5 mr-2 text-leo-600" />
                            Photos & Documents
                        </h2>
                        <div className="space-y-6">
                            {/* Meeting Photos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">General Meeting Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setGmPhoto(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="gmPhoto"
                                    />
                                    <label
                                        htmlFor="gmPhoto"
                                        className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${gmPhoto ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {gmPhoto ? gmPhoto.name : 'Upload Photo'}
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Board Meeting Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setBoardMeetingPhoto(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="boardMeetingPhoto"
                                    />
                                    <label
                                        htmlFor="boardMeetingPhoto"
                                        className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${boardMeetingPhoto ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {boardMeetingPhoto ? boardMeetingPhoto.name : 'Upload Photo'}
                                    </label>
                                </div>
                            </div>

                            {/* Attendance Lists */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Lists (up to 10)</label>
                                <div className="space-y-2">
                                    {attendanceLists.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const newLists = [...attendanceLists];
                                                    newLists[index] = e.target.files?.[0] || null;
                                                    setAttendanceLists(newLists);
                                                }}
                                                className="hidden"
                                                id={`attendance_${index}`}
                                            />
                                            <label
                                                htmlFor={`attendance_${index}`}
                                                className={`flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {file ? file.name : `Attendance List ${index + 1}`}
                                            </label>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAttendanceLists(attendanceLists.filter((_, i) => i !== index))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {attendanceLists.length < 10 && (
                                        <button
                                            type="button"
                                            onClick={() => setAttendanceLists([...attendanceLists, null])}
                                            className="flex items-center text-leo-600 hover:text-leo-700 font-medium text-sm"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Attendance List
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* MyLeo & MyLCI */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">MyLeo Update</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setMyleoUpdate(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="myleoUpdate"
                                    />
                                    <label
                                        htmlFor="myleoUpdate"
                                        className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${myleoUpdate ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {myleoUpdate ? myleoUpdate.name : 'Upload Screenshot'}
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">MyLCI Update</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setMylciUpdate(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="mylciUpdate"
                                    />
                                    <label
                                        htmlFor="mylciUpdate"
                                        className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${mylciUpdate ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {mylciUpdate ? mylciUpdate.name : 'Upload Screenshot'}
                                    </label>
                                </div>
                            </div>

                            {/* Monthly Publications */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Publications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setNewsletter(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="newsletter"
                                        />
                                        <label
                                            htmlFor="newsletter"
                                            className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${newsletter ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                        >
                                            <Upload className="w-5 h-5 mr-2" />
                                            {newsletter ? newsletter.name : 'Upload'}
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Blog</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setBlog(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="blog"
                                        />
                                        <label
                                            htmlFor="blog"
                                            className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${blog ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                        >
                                            <Upload className="w-5 h-5 mr-2" />
                                            {blog ? blog.name : 'Upload'}
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setWebsite(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="website"
                                        />
                                        <label
                                            htmlFor="website"
                                            className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${website ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:border-leo-400 hover:bg-leo-50'}`}
                                        >
                                            <Upload className="w-5 h-5 mr-2" />
                                            {website ? website.name : 'Upload'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-leo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-leo-500/30 hover:shadow-leo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
