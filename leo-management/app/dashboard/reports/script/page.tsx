'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Users, MapPin, Video } from 'lucide-react';

export default function ScriptReportPage() {
    const [loading, setLoading] = useState(false);

    // Basic Info
    const [clubName, setClubName] = useState('');
    const [month, setMonth] = useState('January');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [date, setDate] = useState('');

    // Meeting Type
    const [meetingType, setMeetingType] = useState<'Physical' | 'Online'>('Physical');

    // Physical-only fields
    const [frontRowGuests, setFrontRowGuests] = useState<string[]>(['', '', '', '', '', '', '', '']);
    const [headTableGuests, setHeadTableGuests] = useState<string[]>(Array(15).fill(''));
    const [introHeadTable, setIntroHeadTable] = useState('');

    // Common fields
    const [pledgeAllegiance, setPledgeAllegiance] = useState('');
    const [leoPledge, setLeoPledge] = useState('');
    const [environmentalPledge, setEnvironmentalPledge] = useState('');
    const [welcomeAddress, setWelcomeAddress] = useState('');
    const [presentMinutes, setPresentMinutes] = useState('');
    const [firstMinutes, setFirstMinutes] = useState('');
    const [secondMinutes, setSecondMinutes] = useState('');
    const [presentFinancial, setPresentFinancial] = useState('');
    const [secondFinancial, setSecondFinancial] = useState('');
    const [presidentAddress, setPresidentAddress] = useState('');
    const [introChiefGuest, setIntroChiefGuest] = useState('');
    const [speechChiefGuest, setSpeechChiefGuest] = useState('');
    const [introGuestHonor, setIntroGuestHonor] = useState('');
    const [speechGuestHonor, setSpeechGuestHonor] = useState('');
    const [introSpecialGuest, setIntroSpecialGuest] = useState('');
    const [speechSpecialGuest, setSpeechSpecialGuest] = useState('');
    const [closingRemarks, setClosingRemarks] = useState('');
    const [voteOfThanks, setVoteOfThanks] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                clubName,
                month,
                year,
                date,
                meetingType,
                frontRowGuests: meetingType === 'Physical' ? frontRowGuests.filter(g => g.trim()) : [],
                headTableGuests: meetingType === 'Physical' ? headTableGuests.filter(g => g.trim()) : [],
                introHeadTable: meetingType === 'Physical' ? introHeadTable : '',
                pledgeAllegiance,
                leoPledge,
                environmentalPledge,
                welcomeAddress,
                presentMinutes,
                firstMinutes,
                secondMinutes,
                presentFinancial,
                secondFinancial,
                presidentAddress,
                introChiefGuest,
                speechChiefGuest,
                introGuestHonor,
                speechGuestHonor,
                introSpecialGuest,
                speechSpecialGuest,
                closingRemarks,
                voteOfThanks
            };

            const response = await fetch('/api/reports/script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to generate script');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Script_${month}_${year}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate script');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30 animate-fade-in pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link href="/dashboard/reports" className="inline-flex items-center text-gray-600 hover:text-leo-600 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reports
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">General Meeting Script</h1>
                    <p className="text-gray-600 mt-2">Generate meeting scripts with assigned roles</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Meeting Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-leo-600" />
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

                            <div className="md:col-span-2">
                                <label className="label">Meeting Type</label>
                                <div className="flex space-x-4">
                                    <button type="button" onClick={() => setMeetingType('Physical')} className={`px-4 py-2 rounded-lg border ${meetingType === 'Physical' ? 'bg-leo-50 border-leo-500 text-leo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <MapPin className="w-4 h-4 inline mr-2" /> Physical
                                    </button>
                                    <button type="button" onClick={() => setMeetingType('Online')} className={`px-4 py-2 rounded-lg border ${meetingType === 'Online' ? 'bg-leo-50 border-leo-500 text-leo-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <Video className="w-4 h-4 inline mr-2" /> Online
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Physical Only Fields */}
                    {meetingType === 'Physical' && (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Front Row Guests (up to 8)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {frontRowGuests.map((guest, idx) => (
                                        <div key={idx}>
                                            <label className="label">Guest {idx + 1}</label>
                                            <input type="text" value={guest} onChange={e => setFrontRowGuests(frontRowGuests.map((g, i) => i === idx ? e.target.value : g))} className="input" placeholder="Name" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Head Table Guests (up to 15)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {headTableGuests.map((guest, idx) => (
                                        <div key={idx}>
                                            <label className="label">Guest {idx + 1}</label>
                                            <input type="text" value={guest} onChange={e => setHeadTableGuests(headTableGuests.map((g, i) => i === idx ? e.target.value : g))} className="input" placeholder="Name" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
                                <div>
                                    <label className="label">Introduction of Head Table</label>
                                    <input type="text" value={introHeadTable} onChange={e => setIntroHeadTable(e.target.value)} className="input" placeholder="Name" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Common Script Fields */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Script Assignments</h2>
                        <div className="space-y-4">
                            <div><label className="label">Pledge of Allegiance to the National Flag</label><input type="text" value={pledgeAllegiance} onChange={e => setPledgeAllegiance(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Leo Pledge</label><input type="text" value={leoPledge} onChange={e => setLeoPledge(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Environmental Pledge</label><input type="text" value={environmentalPledge} onChange={e => setEnvironmentalPledge(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Welcome Address</label><input type="text" value={welcomeAddress} onChange={e => setWelcomeAddress(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Present Minutes of Previous General Meeting</label><input type="text" value={presentMinutes} onChange={e => setPresentMinutes(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">1st that Meeting Minutes are in Order</label><input type="text" value={firstMinutes} onChange={e => setFirstMinutes(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">2nd that Meeting Minutes are in Order</label><input type="text" value={secondMinutes} onChange={e => setSecondMinutes(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Present Financial Report</label><input type="text" value={presentFinancial} onChange={e => setPresentFinancial(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">2nd Financial Report</label><input type="text" value={secondFinancial} onChange={e => setSecondFinancial(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">President's Address</label><input type="text" value={presidentAddress} onChange={e => setPresidentAddress(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Introduction of Chief Guest</label><input type="text" value={introChiefGuest} onChange={e => setIntroChiefGuest(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Speech by Chief Guest</label><input type="text" value={speechChiefGuest} onChange={e => setSpeechChiefGuest(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Introduction of Guest of Honor</label><input type="text" value={introGuestHonor} onChange={e => setIntroGuestHonor(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Speech by Guest of Honor</label><input type="text" value={speechGuestHonor} onChange={e => setSpeechGuestHonor(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Introduction of Special Guest</label><input type="text" value={introSpecialGuest} onChange={e => setIntroSpecialGuest(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Speech by Special Guest</label><input type="text" value={speechSpecialGuest} onChange={e => setSpeechSpecialGuest(e.target.value)} className="input" placeholder="Name" /></div>
                            <div><label className="label">Closing Remarks (Advisor Name)</label><input type="text" value={closingRemarks} onChange={e => setClosingRemarks(e.target.value)} className="input" placeholder="Advisor Name" /></div>
                            <div><label className="label">Vote of Thanks (Secretary Name)</label><input type="text" value={voteOfThanks} onChange={e => setVoteOfThanks(e.target.value)} className="input" placeholder="Secretary Name" /></div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-leo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-leo-500/30 hover:shadow-leo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Script</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
