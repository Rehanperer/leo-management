'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Clock, Heart, TrendingUp, Award, LayoutGrid, GitBranch } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import ProjectTimeline from '@/app/components/ProjectTimeline';
import ImageSlideshow from '@/app/components/ImageSlideshow';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    status: string;
    beneficiaries?: number;
    serviceHours?: number;
    participants?: number;
    photos?: string;
    club: { name: string };
    user: { username: string };
}

interface ProjectStats {
    totalProjects: number;
    totalServiceHours: number;
    totalBeneficiaries: number;
    categoryDistribution: { [key: string]: number };
    lastYearProjects: number;
}

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/projects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects);
                    calculateStats(data.projects);
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const parsePhotos = (photosData: string | undefined) => {
        if (!photosData) return [];
        try {
            const parsed = JSON.parse(photosData);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const calculateStats = (projectList: Project[]) => {
        const now = new Date();
        const currentYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1; // July-June
        const leoYearStart = new Date(currentYear, 6, 1); // July 1st
        const leoYearEnd = new Date(currentYear + 1, 5, 30); // June 30th

        const lastYearStart = new Date(currentYear - 1, 6, 1);
        const lastYearEnd = new Date(currentYear, 5, 30);

        // Filter completed projects in current Leo year
        const currentYearProjects = projectList.filter(p => {
            const projectDate = new Date(p.date);
            return p.status === 'completed' && projectDate >= leoYearStart && projectDate <= leoYearEnd;
        });

        const lastYearProjectsCount = projectList.filter(p => {
            const projectDate = new Date(p.date);
            return p.status === 'completed' && projectDate >= lastYearStart && projectDate <= lastYearEnd;
        }).length;

        // Calculate totals
        const totalServiceHours = currentYearProjects.reduce((sum, p) => sum + (p.serviceHours || 0), 0);
        const totalBeneficiaries = currentYearProjects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0);

        // Calculate category distribution
        const categoryDistribution: { [key: string]: number } = {};
        currentYearProjects.forEach(p => {
            if (p.category) {
                categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
            }
        });

        setStats({
            totalProjects: currentYearProjects.length,
            totalServiceHours,
            totalBeneficiaries,
            categoryDistribution,
            lastYearProjects: lastYearProjectsCount
        });
    };

    const getChartData = () => {
        if (!stats) return null;

        const categories = Object.keys(stats.categoryDistribution);
        const values = Object.values(stats.categoryDistribution);

        const colors = [
            'rgba(147, 51, 234, 0.8)', // Purple
            'rgba(59, 130, 246, 0.8)', // Blue
            'rgba(16, 185, 129, 0.8)', // Green
            'rgba(245, 158, 11, 0.8)', // Amber
            'rgba(239, 68, 68, 0.8)',  // Red
            'rgba(236, 72, 153, 0.8)', // Pink
        ];

        return {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: 'white',
                borderWidth: 2,
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    padding: 15,
                    font: { size: 11 },
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leo-50 to-purple-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const growthRate = stats && stats.lastYearProjects > 0
        ? ((stats.totalProjects - stats.lastYearProjects) / stats.lastYearProjects * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
                        <Link href="/dashboard/projects/new" className="btn btn-primary">
                            + New Project
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Dashboard */}
                {stats && (
                    <div className="mb-8 space-y-6">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Projects */}
                            <div className="card bg-gradient-to-br from-leo-500 to-purple-600 text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-leo-100 text-sm font-medium mb-1">Completed Projects</p>
                                        <p className="text-4xl font-bold">{stats.totalProjects}</p>
                                        {growthRate !== 0 && (
                                            <div className="mt-2 flex items-center gap-1 text-sm">
                                                <TrendingUp className={`w-4 h-4 ${growthRate > 0 ? '' : 'rotate-180'}`} />
                                                <span>{Math.abs(growthRate).toFixed(1)}% vs last year</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        <Award className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            {/* Total Service Hours */}
                            <div className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Service Hours</p>
                                        <p className="text-4xl font-bold">{stats.totalServiceHours.toLocaleString()}</p>
                                        <p className="mt-2 text-sm text-blue-100">Hours contributed</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            {/* Total Beneficiaries */}
                            <div className="card bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium mb-1">Beneficiaries</p>
                                        <p className="text-4xl font-bold">{stats.totalBeneficiaries.toLocaleString()}</p>
                                        <p className="mt-2 text-sm text-emerald-100">Lives impacted</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        <Heart className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart and Impact Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Category Distribution Chart */}
                            {Object.keys(stats.categoryDistribution).length > 0 && (
                                <div className="card lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Project Categories</h3>
                                    <div className="h-64">
                                        <Doughnut data={getChartData()!} options={chartOptions} />
                                    </div>
                                </div>
                            )}

                            {/* Impact Summary */}
                            <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Users className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Impact Summary</h3>
                                        <p className="text-sm text-gray-600 mt-1">Leoistic Year {new Date().getMonth() >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    This year, we've completed <strong>{stats.totalProjects} projects</strong>,
                                    contributing <strong>{stats.totalServiceHours.toLocaleString()} service hours</strong> and
                                    positively impacting <strong>{stats.totalBeneficiaries.toLocaleString()} beneficiaries</strong> across
                                    our community.{' '}
                                    {Object.keys(stats.categoryDistribution).length > 0 && (
                                        <>Our efforts span <strong>{Object.keys(stats.categoryDistribution).length} categories</strong>, demonstrating our commitment to diverse community needs.</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Toggle and Projects */}
                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-600 mb-6">Create your first project to get started!</p>
                        <Link href="/dashboard/projects/new" className="btn btn-primary">
                            Create Project
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* View Mode Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">All Projects</h2>
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${viewMode === 'grid'
                                        ? 'bg-white text-leo-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    Grid View
                                </button>
                                <button
                                    onClick={() => setViewMode('timeline')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${viewMode === 'timeline'
                                        ? 'bg-white text-leo-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <GitBranch className="w-4 h-4" />
                                    Timeline View
                                </button>
                            </div>
                        </div>

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/projects/${project.id}`}
                                        className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                    >
                                        {/* Project Images Slideshow */}
                                        {parsePhotos(project.photos).length > 0 && (
                                            <div className="mb-3 -mx-6 -mt-6">
                                                <ImageSlideshow images={parsePhotos(project.photos)} compact={true} />
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {project.status}
                                            </span>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {project.title}
                                        </h3>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="space-y-2 text-sm text-gray-500">
                                            {project.category && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    {project.category}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(project.date).toLocaleDateString()}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                {project.club.name}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Timeline View */}
                        {viewMode === 'timeline' && (
                            <ProjectTimeline projects={projects} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
