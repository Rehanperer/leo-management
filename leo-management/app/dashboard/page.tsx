'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ projects: 0, meetings: 0, events: 0 });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-leo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-leo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">L</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-xl font-bold text-gray-900">Leo Management</h1>
                                <p className="text-sm text-gray-600">{user?.clubName || 'Admin'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-secondary text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Dashboard */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.username}!
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Here's what's happening with your Leo club today.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-leo-500 to-leo-700 text-white">
                        <div className="text-3xl font-bold">{stats.projects}</div>
                        <div className="text-leo-100 mt-1">Active Projects</div>
                    </div>
                    <div className="card bg-gradient-to-br from-gold-500 to-gold-700 text-white">
                        <div className="text-3xl font-bold">{stats.meetings}</div>
                        <div className="text-gold-100 mt-1">Meetings</div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
                        <div className="text-3xl font-bold">{stats.events}</div>
                        <div className="text-green-100 mt-1">Events</div>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                        <div className="text-3xl font-bold">$0</div>
                        <div className="text-purple-100 mt-1">Budget Balance</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        href="/dashboard/projects/new"
                        className="card hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-leo-100 rounded-lg flex items-center justify-center group-hover:bg-leo-200 transition-colors">
                                <svg className="w-6 h-6 text-leo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900">New Project</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Create a new project report with AI assistance
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/ai-consultant"
                        className="card hover:shadow-lg transition-shadow cursor-pointer group bg-gradient-to-br from-leo-50 to-gold-50"
                    >
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900">AI Project Consultant</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Get AI-powered suggestions to improve your project ideas
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/financial"
                        className="card hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900">Financial Records</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Track income and expenses
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/meetings"
                        className="card hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900">Meetings</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage meeting minutes and attendance
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/events"
                        className="card hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900">Events</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Plan and track club events
                                </p>
                            </div>
                        </div>
                    </Link>

                    {user?.role === 'admin' && (
                        <Link
                            href="/dashboard/admin"
                            className="card hover:shadow-lg transition-shadow cursor-pointer group bg-gradient-to-br from-red-50 to-orange-50"
                        >
                            <div className="flex items-start">
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                                    <p className="text-sm text-gray-600 mt-1">
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
