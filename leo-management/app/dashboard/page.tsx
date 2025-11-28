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
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-leo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                </div>
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
                                <div className="w-10 h-10 bg-gradient-to-br from-leo-600 to-purple-600 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <span className="text-white font-bold text-xl">L</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-xl font-bold text-gradient-leo">Leo Management</h1>
                                <p className="text-sm text-gray-600">{user?.clubName || 'Admin'}</p>
                            </div>
                        </div>
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
                                    <h3 className="font-semibold text-gray-900 mb-1">D2 Classroom</h3>
                                    <p className="text-sm text-gray-600">
                                        Access study guides & docs
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                Enter Classroom <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {user?.role === 'admin' && (
                        <Link
                            href="/dashboard/admin"
                            className="card bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-2 border-red-200 hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer stagger-item"
                        >
                            <div className="flex items-start">
                                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white icon-hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">Admin Panel</h3>
                                    <p className="text-sm text-gray-600">
                                        Manage club accounts and system settings
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
