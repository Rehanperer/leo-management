'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    FileText,
    Calendar,
    Settings,
    LogOut,
    Plus,
    ArrowRight,
    Briefcase,
    DollarSign,
    Clock,
    Bot,
    Shield,
    GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ projects: 0, meetings: 0, events: 0, budget: 0 });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leo-50 to-purple-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30 animate-fade-in">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 group">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <img src="/logo.png" alt="LeoLynk" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-xl font-bold text-gradient-leo">LeoLynk</h1>
                                <p className="text-sm text-gray-600">{user?.clubName || 'Admin'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard/settings"
                                className="btn btn-secondary text-sm hover:shadow-md"
                            >
                                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </Link>
                            <button
                                onClick={logout}
                                className="btn btn-secondary text-sm hover:shadow-md"
                            >
                                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Dashboard */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-slide-up">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.username}! 👋
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Here's what's happening with your Leo club today.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card gradient-leo text-white card-hover group stagger-item">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-4xl font-bold mb-1">{stats.projects}</div>
                                <div className="text-leo-100">Active Projects</div>
                            </div>
                            <svg className="w-10 h-10 text-leo-200 opacity-80 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="card gradient-gold text-white card-hover group stagger-item">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-4xl font-bold mb-1">{stats.meetings}</div>
                                <div className="text-gold-100">Meetings</div>
                            </div>
                            <svg className="w-10 h-10 text-gold-200 opacity-80 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-emerald-700 text-white card-hover group stagger-item">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-4xl font-bold mb-1">{stats.events}</div>
                                <div className="text-green-100">Events</div>
                            </div>
                            <svg className="w-10 h-10 text-green-200 opacity-80 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="card gradient-purple text-white card-hover group stagger-item">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-4xl font-bold mb-1">${stats.budget.toFixed(2)}</div>
                                <div className="text-purple-100">Budget Balance</div>
                            </div>
                            <svg className="w-10 h-10 text-purple-200 opacity-80 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        href="/dashboard/projects/new"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-leo-100 to-leo-200 rounded-xl flex items-center justify-center group-hover:from-leo-200 group-hover:to-leo-300 transition-all duration-300">
                                <svg className="w-7 h-7 text-leo-600 icon-hover-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">New Project</h3>
                                <p className="text-sm text-gray-600">
                                    Create a new project report with AI assistance
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/projects"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                                <svg className="w-7 h-7 text-blue-600 icon-hover-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">View Projects</h3>
                                <p className="text-sm text-gray-600">
                                    Browse and manage all project reports
                                </p>
                            </div>
                        </div>
                    </Link>



                    <Link
                        href="/dashboard/financial"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-300 transition-all duration-300">
                                <svg className="w-7 h-7 text-green-600 icon-hover-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Financial Records</h3>
                                <p className="text-sm text-gray-600">
                                    Track income and expenses
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/reports"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                                <FileText className="w-7 h-7 text-indigo-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Reports</h3>
                                <p className="text-sm text-gray-600">
                                    Generate and manage club reports
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/meetings"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                                <svg className="w-7 h-7 text-purple-600 icon-hover-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Meetings</h3>
                                <p className="text-sm text-gray-600">
                                    Manage meeting minutes and attendance
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/events"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                                <svg className="w-7 h-7 text-orange-600 icon-hover-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Events</h3>
                                <p className="text-sm text-gray-600">
                                    Plan and track club events
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/mindmap"
                        className="card-interactive stagger-item group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-leo-600 transform rotate-12 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-start">
                                <div className="w-14 h-14 bg-gradient-to-br from-leo-100 to-leo-200 rounded-xl flex items-center justify-center group-hover:from-leo-200 group-hover:to-leo-300 transition-all duration-300">
                                    <svg className="w-7 h-7 text-leo-600 icon-hover-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">Mindmaps</h3>
                                    <p className="text-sm text-gray-600">
                                        Visualize ideas and plan projects
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-leo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                Create Mindmap <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/classroom"
                        className="card-interactive stagger-item group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap className="w-24 h-24 text-purple-600 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-start">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                                    <GraduationCap className="w-7 h-7 text-purple-600 icon-hover-scale" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">D2 Resources</h3>
                                    <p className="text-sm text-gray-600">
                                        Access district documents & guides
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                Browse Resources <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {user?.role === 'admin' && (
                        <div className="md:col-span-2 lg:col-span-3 mt-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                                        <p className="text-gray-600">Manage club accounts and system settings</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/admin"
                                    className="btn btn-primary"
                                >
                                    Access Panel
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm flex flex-col items-center">
                    <img src="/logo.png" alt="LeoLynk" className="w-8 h-8 mb-2 opacity-50 grayscale hover:grayscale-0 transition-all" />
                    <p>© 2025 LeoLynk. All rights reserved.</p>
                    <p className="mt-1 text-xs flex items-center justify-center gap-1">
                        Crafted with <span className="text-red-500">❤️</span> for Leo Clubs
                    </p>
                </div>
            </main>
        </div>
    );
}
