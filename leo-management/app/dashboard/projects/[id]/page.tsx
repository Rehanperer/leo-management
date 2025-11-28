'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leo-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-leo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const chairmen = parseOfficers(project.chairman);
    const secretaries = parseOfficers(project.secretary);
    const treasurers = parseOfficers(project.treasurer);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/projects" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Projects
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Project Details</h1>
                        <div className="w-32"></div> {/* Spacer */}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Card */}
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

                {/* Basic Information */}
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

                {/* Project Details */}
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

                {/* Project Officers */}
                {(chairmen.length > 0 || secretaries.length > 0 || treasurers.length > 0) && (
                    <div className="card mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Officers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {chairmen.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chairman</label>
                                    <ul className="space-y-1">
                                        {chairmen.map((name, idx) => (
                                            <li key={idx} className="text-gray-900">{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {secretaries.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Secretary</label>
                                    <ul className="space-y-1">
                                        {secretaries.map((name, idx) => (
                                            <li key={idx} className="text-gray-900">{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {treasurers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Treasurer</label>
                                    <ul className="space-y-1">
                                        {treasurers.map((name, idx) => (
                                            <li key={idx} className="text-gray-900">{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Project Statistics */}
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

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <Link href="/dashboard/projects" className="btn btn-secondary">
                        Back to Projects
                    </Link>
                    <div className="text-sm text-gray-500">
                        To edit this project, please contact your administrator
                    </div>
                </div>
            </main>
        </div>
    );
}
