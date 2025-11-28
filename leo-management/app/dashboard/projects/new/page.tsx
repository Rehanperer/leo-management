'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Club {
    id: string;
    name: string;
}

const PROJECT_CATEGORIES = [
    "Best Project for Spotlight on Children",
    "Best Project for Responsible Consumption & Waste Management",
    "Best Project for Nutrition & Food Safety",
    "Best Project for Peace, Religious & Cultural Activities",
    "Best Project for Sports & Recreation",
    "Best Project for Health & Wellbeing",
    "Best Project for Senior Citizens Development",
    "Best Project for Helping Hand to Differently Abled",
    "Best Project for Public Relations",
    "Best Project for Fundraiser",
    "Best Project for Quality Education & Literacy",
    "Best Project for Women Empowerment",
    "Best Project for Poverty & Better Life",
    "Best Project for Clean Water & Energy Conservation",
    "Best Project for Crime & Accident Prevention",
    "Best Project for Infrastructure Development",
    "Best Project for Research & Development",
    "Best Project for Drug Prevention & Rehabilitation",
    "Best Project for Street Animals, Wildlife & Life Below Water",
    "Best Project for Fellowship",
    "Best Project for Betterment of Leoism",
    "Most Outstanding Service Project",
    "Most Innovative Project",
    "Most Outstanding Continuous Project",
    "Most Outstanding Project by a New Leo",
    "Best Project Organized on Behalf of the Leo District",
    "Best Project Organized on Behalf of the Leo Multiple District",
    "Best Serving Together Project (Joint Project with Lions Club/Sponsoring Lions Club)",
    "Best Joint Project with Non-Leo/Outside Organization",
    "Best Joint Inter-District Project (Joint Project Between Leo Clubs from Different Leo Districts)",
    "Best Joint Intra-District Project (Joint Projects Between Leo Clubs of the Same Leo District)",
    "Joint Projects with Foreign Leo Clubs/Best International Joint Project",
    "Most Outstanding Joint Service Project",
    "Best Project for Diabetes",
    "Best Project for Environment",
    "Best Project for Hunger",
    "Best Project for Childhood Cancer",
    "Best Project for Vision",
    "Best Project for Youth",
    "Best Project for Disaster Management and Prevention"
];

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: PROJECT_CATEGORIES[0],
        venue: '',
        date: new Date().toISOString().split('T')[0],
        beneficiaries: '',
        serviceHours: '',
        participants: '',
        projectObjective: '',
        benefitingCommunity: '',
        identifiedCommunityNeed: '',
        serviceOpportunity: '',
        modeOfDataCollection: '',
        chairmen: [''],
        secretaries: [''],
        treasurers: [''],
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

    const addOfficer = (field: 'chairmen' | 'secretaries' | 'treasurers') => {
        if (formData[field].length < 2) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], '']
            }));
        }
    };

    const removeOfficer = (field: 'chairmen' | 'secretaries' | 'treasurers', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const updateOfficer = (field: 'chairmen' | 'secretaries' | 'treasurers', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((v, i) => i === index ? value : v)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                venue: formData.venue,
                date: new Date(formData.date).toISOString(),
                beneficiaries: parseInt(formData.beneficiaries) || 0,
                serviceHours: parseFloat(formData.serviceHours) || 0,
                participants: parseInt(formData.participants) || 0,
                projectObjective: formData.projectObjective,
                benefitingCommunity: formData.benefitingCommunity,
                identifiedCommunityNeed: formData.identifiedCommunityNeed,
                serviceOpportunity: formData.serviceOpportunity,
                modeOfDataCollection: formData.modeOfDataCollection,
                chairman: JSON.stringify(formData.chairmen.filter(c => c.trim())),
                secretary: JSON.stringify(formData.secretaries.filter(s => s.trim())),
                treasurer: JSON.stringify(formData.treasurers.filter(t => t.trim())),
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* AI Assistance Note */}
                <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-purple-900">Need assistance filling out this form?</p>
                            <p className="text-sm text-purple-700 mt-1">Use the AI chatbot in the bottom right corner for help with any field!</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                                        {PROJECT_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
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
                        </div>
                    </div>

                    {/* Project Details Section */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Objective</label>
                                <textarea
                                    rows={3}
                                    className="input"
                                    value={formData.projectObjective}
                                    onChange={e => setFormData({ ...formData, projectObjective: e.target.value })}
                                    placeholder="What is the main objective of this project?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefiting Community</label>
                                <textarea
                                    rows={3}
                                    className="input"
                                    value={formData.benefitingCommunity}
                                    onChange={e => setFormData({ ...formData, benefitingCommunity: e.target.value })}
                                    placeholder="Which community will benefit from this project?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Identified Community Need</label>
                                <textarea
                                    rows={3}
                                    className="input"
                                    value={formData.identifiedCommunityNeed}
                                    onChange={e => setFormData({ ...formData, identifiedCommunityNeed: e.target.value })}
                                    placeholder="What community need does this project address?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Opportunity</label>
                                <textarea
                                    rows={3}
                                    className="input"
                                    value={formData.serviceOpportunity}
                                    onChange={e => setFormData({ ...formData, serviceOpportunity: e.target.value })}
                                    placeholder="Describe the service opportunity..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Data Collection</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.modeOfDataCollection}
                                    onChange={e => setFormData({ ...formData, modeOfDataCollection: e.target.value })}
                                    placeholder="e.g., Surveys, Interviews, Observation"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Officers Section */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Officers</h3>
                        <div className="space-y-6">
                            {/* Chairmen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Chairman (Max 2)</label>
                                {formData.chairmen.map((chairman, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="input flex-1"
                                            value={chairman}
                                            onChange={e => updateOfficer('chairmen', index, e.target.value)}
                                            placeholder={`Chairman ${index + 1}`}
                                        />
                                        {formData.chairmen.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOfficer('chairmen', index)}
                                                className="btn btn-secondary px-3"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {formData.chairmen.length < 2 && (
                                    <button
                                        type="button"
                                        onClick={() => addOfficer('chairmen')}
                                        className="text-sm text-leo-600 hover:text-leo-700 font-medium"
                                    >
                                        + Add Another Chairman
                                    </button>
                                )}
                            </div>

                            {/* Secretaries */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Secretary (Max 2)</label>
                                {formData.secretaries.map((secretary, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="input flex-1"
                                            value={secretary}
                                            onChange={e => updateOfficer('secretaries', index, e.target.value)}
                                            placeholder={`Secretary ${index + 1}`}
                                        />
                                        {formData.secretaries.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOfficer('secretaries', index)}
                                                className="btn btn-secondary px-3"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {formData.secretaries.length < 2 && (
                                    <button
                                        type="button"
                                        onClick={() => addOfficer('secretaries')}
                                        className="text-sm text-leo-600 hover:text-leo-700 font-medium"
                                    >
                                        + Add Another Secretary
                                    </button>
                                )}
                            </div>

                            {/* Treasurers */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Treasurer (Max 2)</label>
                                {formData.treasurers.map((treasurer, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="input flex-1"
                                            value={treasurer}
                                            onChange={e => updateOfficer('treasurers', index, e.target.value)}
                                            placeholder={`Treasurer ${index + 1}`}
                                        />
                                        {formData.treasurers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOfficer('treasurers', index)}
                                                className="btn btn-secondary px-3"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {formData.treasurers.length < 2 && (
                                    <button
                                        type="button"
                                        onClick={() => addOfficer('treasurers')}
                                        className="text-sm text-leo-600 hover:text-leo-700 font-medium"
                                    >
                                        + Add Another Treasurer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Statistics Section */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h3>
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
