'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Link from 'next/link';

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

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    date: string;
    beneficiaries: number;
    serviceHours: number;
    participants: number;
    status: string;
    chairman: string;
    secretary: string;
    treasurer: string;
    projectObjective: string;
    benefitingCommunity: string;
    identifiedCommunityNeed: string;
    serviceOpportunity: string;
    modeOfDataCollection: string;
    club: { name: string };
    user: { username: string };
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: PROJECT_CATEGORIES[0],
        venue: '',
        date: '',
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
        status: 'draft',
    });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/projects/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProject(data.project);

                    // Populate form data
                    const chairmen = parseOfficers(data.project.chairman);
                    const secretaries = parseOfficers(data.project.secretary);
                    const treasurers = parseOfficers(data.project.treasurer);

                    setFormData({
                        title: data.project.title || '',
                        description: data.project.description || '',
                        category: data.project.category || PROJECT_CATEGORIES[0],
                        venue: data.project.venue || '',
                        date: data.project.date ? new Date(data.project.date).toISOString().split('T')[0] : '',
                        beneficiaries: data.project.beneficiaries?.toString() || '',
                        serviceHours: data.project.serviceHours?.toString() || '',
                        participants: data.project.participants?.toString() || '',
                        projectObjective: data.project.projectObjective || '',
                        benefitingCommunity: data.project.benefitingCommunity || '',
                        identifiedCommunityNeed: data.project.identifiedCommunityNeed || '',
                        serviceOpportunity: data.project.serviceOpportunity || '',
                        modeOfDataCollection: data.project.modeOfDataCollection || '',
                        chairmen: chairmen.length > 0 ? chairmen : [''],
                        secretaries: secretaries.length > 0 ? secretaries : [''],
                        treasurers: treasurers.length > 0 ? treasurers : [''],
                        status: data.project.status || 'draft',
                    });
                } else {
                    router.push('/dashboard/projects');
                }
            } catch (error) {
                console.error('Failed to fetch project:', error);
                router.push('/dashboard/projects');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchProject();
        }
    }, [params.id, router]);

    const parseOfficers = (officerData: string) => {
        try {
            const parsed = JSON.parse(officerData);
            return Array.isArray(parsed) ? parsed.filter(o => o) : [officerData];
        } catch {
            return officerData ? [officerData] : [];
        }
    };

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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
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
                chairman: JSON.stringify(formData.chairmen.filter(c => c && c.trim())),
                secretary: JSON.stringify(formData.secretaries.filter(s => s && s.trim())),
                treasurer: JSON.stringify(formData.treasurers.filter(t => t && t.trim())),
                status: formData.status,
            };

            const response = await fetch(`/api/projects/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                setProject(data.project);
                setIsEditing(false);
                alert('Project updated successfully!');
            } else {
                throw new Error('Failed to update project');
            }
        } catch (error: any) {
            console.error('Error updating project:', error);
            alert(error.message || 'Failed to update project');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leo-50 to-purple-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/projects" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Projects
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Project' : 'Project Details'}</h1>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                                    Edit Project
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!isEditing ? (
                    <>
                        {/* View Mode */}
                        <div className="card mb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h2 className="text-3xl font-bold text-gray-900">{project.title}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {project.club.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(project.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Created by {project.user.username}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{project.description}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <p className="text-gray-900">{project.category}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                        <p className="text-gray-900">{project.venue || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(project.projectObjective || project.benefitingCommunity || project.identifiedCommunityNeed || project.serviceOpportunity || project.modeOfDataCollection) && (
                            <div className="card mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                                <div className="space-y-4">
                                    {project.projectObjective && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Objective</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.projectObjective}</p>
                                        </div>
                                    )}
                                    {project.benefitingCommunity && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Benefiting Community</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.benefitingCommunity}</p>
                                        </div>
                                    )}
                                    {project.identifiedCommunityNeed && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Identified Community Need</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.identifiedCommunityNeed}</p>
                                        </div>
                                    )}
                                    {project.serviceOpportunity && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Opportunity</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.serviceOpportunity}</p>
                                        </div>
                                    )}
                                    {project.modeOfDataCollection && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Data Collection</label>
                                            <p className="text-gray-900">{project.modeOfDataCollection}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(parseOfficers(project.chairman).length > 0 || parseOfficers(project.secretary).length > 0 || parseOfficers(project.treasurer).length > 0) && (
                            <div className="card mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Officers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {parseOfficers(project.chairman).length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chairman</label>
                                            <ul className="space-y-1">
                                                {parseOfficers(project.chairman).map((name, idx) => (
                                                    <li key={idx} className="text-gray-900">{name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {parseOfficers(project.secretary).length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Secretary</label>
                                            <ul className="space-y-1">
                                                {parseOfficers(project.secretary).map((name, idx) => (
                                                    <li key={idx} className="text-gray-900">{name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {parseOfficers(project.treasurer).length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Treasurer</label>
                                            <ul className="space-y-1">
                                                {parseOfficers(project.treasurer).map((name, idx) => (
                                                    <li key={idx} className="text-gray-900">{name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="card mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-leo-50 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-leo-600 mb-1">{project.beneficiaries || 0}</div>
                                    <div className="text-sm text-gray-600">Beneficiaries</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-purple-600 mb-1">{project.serviceHours || 0}</div>
                                    <div className="text-sm text-gray-600">Service Hours</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-green-600 mb-1">{project.participants || 0}</div>
                                    <div className="text-sm text-gray-600">Participants</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Edit Mode - Similar to create form */}
                        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-purple-900">Need assistance editing this form?</p>
                                    <p className="text-sm text-purple-700 mt-1">Use the AI chatbot in the bottom right corner for help with any field!</p>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-6">
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            className="input"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="input"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Benefiting Community</label>
                                        <textarea
                                            rows={3}
                                            className="input"
                                            value={formData.benefitingCommunity}
                                            onChange={e => setFormData({ ...formData, benefitingCommunity: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Identified Community Need</label>
                                        <textarea
                                            rows={3}
                                            className="input"
                                            value={formData.identifiedCommunityNeed}
                                            onChange={e => setFormData({ ...formData, identifiedCommunityNeed: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Opportunity</label>
                                        <textarea
                                            rows={3}
                                            className="input"
                                            value={formData.serviceOpportunity}
                                            onChange={e => setFormData({ ...formData, serviceOpportunity: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Data Collection</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.modeOfDataCollection}
                                            onChange={e => setFormData({ ...formData, modeOfDataCollection: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Officers</h3>
                                <div className="space-y-6">
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
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
