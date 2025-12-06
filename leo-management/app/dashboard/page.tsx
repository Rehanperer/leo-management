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
    GraduationCap,
    Heart,
    Trophy,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCounter from '../components/AnimatedCounter';
import RippleCard from '../components/RippleCard';
import ParticleBackground from '../components/ParticleBackground';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        projects: 0,
        meetings: 0,
        events: 0,
        budget: 0,
        totalProjectsCompleted: 0,
        totalServiceHours: 0,
        totalBeneficiaries: 0
    });
    const [justLoggedIn, setJustLoggedIn] = useState(true);

    useEffect(() => {
        // Reset the zoom animation state after it plays
        if (justLoggedIn) {
            const timer = setTimeout(() => setJustLoggedIn(false), 600);
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn]);

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

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const leoisticYear = `${currentMonth === 'July' || new Date().getMonth() > 6 ? currentYear : currentYear - 1}-${currentMonth === 'July' || new Date().getMonth() > 6 ? currentYear + 1 : currentYear}`;

    return (
        <div className={`min-h-screen relative p-8 ${justLoggedIn ? 'animate-zoom-in' : 'animate-fade-in'}`}>
            <ParticleBackground />

            {/* Welcome Section */}
            <div className="mb-8 animate-slide-up relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.username}! 👋
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {currentMonth} • Leoistic Year {leoisticYear}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/projects/new" className="btn btn-primary flex items-center gap-2">
                            <Plus size={18} /> New Project
                        </Link>
                    </div>
                </div>
            </div>

            {/* Global Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                <div className="rounded-3xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col items-center justify-center text-center group">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Trophy size={24} />
                    </div>
                    <AnimatedCounter value={stats.totalProjectsCompleted} className="text-4xl font-bold text-gray-900 mb-1" />
                    <p className="text-gray-500 font-medium">Projects Completed</p>
                </div>
                <div className="rounded-3xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col items-center justify-center text-center group">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                    <AnimatedCounter value={stats.totalServiceHours} className="text-4xl font-bold text-gray-900 mb-1" />
                    <p className="text-gray-500 font-medium">Service Hours</p>
                </div>
                <div className="rounded-3xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col items-center justify-center text-center group">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Heart size={24} />
                    </div>
                    <AnimatedCounter value={stats.totalBeneficiaries} className="text-4xl font-bold text-gray-900 mb-1" />
                    <p className="text-gray-500 font-medium">Beneficiaries Served</p>
                </div>
            </div>

            {/* Quick Access & Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative z-10">
                {/* Hero / Highlights */}
                <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 relative overflow-hidden group !border-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={180} className="transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-4">
                            IMPACT HIGHLIGHT
                        </span>
                        <h2 className="text-3xl font-bold mb-4">Making a Difference Together</h2>
                        <p className="text-blue-100 mb-6 max-w-lg">
                            "Leadership, Experience, Opportunity." Your club has made significant strides this month. Keep up the momentum!
                        </p>
                        <Link href="/dashboard/reports" className="btn bg-white text-blue-700 hover:bg-blue-50 border-none">
                            View Monthly Report
                        </Link>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/projects/new" className="rounded-3xl hover:bg-white/80 transition-all p-4 flex flex-col items-center justify-center text-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={20} />
                        </div>
                        <span className="font-medium text-gray-700">New Project</span>
                    </Link>
                    <Link href="/dashboard/events" className="rounded-3xl hover:bg-white/80 transition-all p-4 flex flex-col items-center justify-center text-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar size={20} />
                        </div>
                        <span className="font-medium text-gray-700">Add Event</span>
                    </Link>
                    <Link href="/dashboard/financial" className="rounded-3xl hover:bg-white/80 transition-all p-4 flex flex-col items-center justify-center text-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <DollarSign size={20} />
                        </div>
                        <span className="font-medium text-gray-700">Record Finance</span>
                    </Link>
                    <Link href="/dashboard/meetings" className="rounded-3xl hover:bg-white/80 transition-all p-4 flex flex-col items-center justify-center text-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users size={20} />
                        </div>
                        <span className="font-medium text-gray-700">Start Meeting</span>
                    </Link>
                </div>
            </div>

            {/* Bottom Section: Upcoming & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Upcoming Events */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
                        <Link href="/dashboard/events" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {/* Placeholder for events - in a real app, map through data */}
                        <div className="glass-card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold uppercase">Dec</span>
                                <span className="text-lg font-bold">15</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Monthly General Meeting</h4>
                                <p className="text-sm text-gray-500">10:00 AM • Club House</p>
                            </div>
                        </div>
                        <div className="glass-card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold uppercase">Dec</span>
                                <span className="text-lg font-bold">22</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Christmas Charity Drive</h4>
                                <p className="text-sm text-gray-500">08:00 AM • City Center</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                        <span className="text-sm text-gray-500">Latest updates</span>
                    </div>
                    <div className="space-y-4">
                        <div className="glass-card p-4 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <DollarSign size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium">New income recorded</p>
                                    <p className="text-sm text-gray-500">Donation received for School Project • $500</p>
                                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-4 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium">Project report submitted</p>
                                    <p className="text-sm text-gray-500">Beach Cleanup Phase 1 • Pending Approval</p>
                                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
