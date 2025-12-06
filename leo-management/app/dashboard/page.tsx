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
        totalBeneficiaries: 0,
        upcomingItems: [],
        recentActivity: []
    });
    const [quote, setQuote] = useState({ text: '', author: '' });

    const quotes = [
        { text: "Leadership is the capacity to translate vision into reality.", author: "Warren Bennis" },
        { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
        { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
        { text: "Service to others is the rent you pay for your room here on earth.", author: "Muhammad Ali" },
        { text: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek" },
        { text: "To handle yourself, use your head; to handle others, use your heart.", author: "Eleanor Roosevelt" },
        { text: "Volunteers do not necessarily have the time; they just have the heart.", author: "Elizabeth Andrew" },
        { text: "Act as if what you do makes a difference. It does.", author: "William James" },
        { text: "The meaning of life is to find your gift. The purpose of life is to give it away.", author: "Pablo Picasso" },
        { text: "No one has ever become poor by giving.", author: "Anne Frank" },
        { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
        { text: "Leadership is action, not position.", author: "Donald H. McGannon" },
        { text: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things.", author: "Ronald Reagan" },
        { text: "Service is the very purpose of life. It is the rent we pay for living on the planet.", author: "Marian Wright Edelman" },
        { text: "Small acts, when multiplied by millions of people, can transform the world.", author: "Howard Zinn" },
        { text: "Earn your success based on service to others, not at the expense of others.", author: "H. Jackson Brown Jr." },
        { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
        { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
        { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
        { text: "It is literally true that you can succeed best and quickest by helping others to succeed.", author: "Napoleon Hill" },
        { text: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "Don't find fault, find a remedy.", author: "Henry Ford" },
        { text: "If your actions inspire others to dream more, learn more, do more and become more, you are a leader.", author: "John Quincy Adams" },
        { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
    ];
    const [justLoggedIn, setJustLoggedIn] = useState(true);

    useEffect(() => {
        // Reset the zoom animation state after it plays
        if (justLoggedIn) {
            const timer = setTimeout(() => setJustLoggedIn(false), 600);
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn]);

    useEffect(() => {
        // Set random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[randomIndex]);
    }, []);

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
        <div className={`min-h-screen relative p-4 md:p-8 ${justLoggedIn ? 'animate-zoom-in' : 'animate-fade-in'}`}>
            <ParticleBackground />

            {/* Welcome Section */}
            <div className="mb-8 animate-slide-up relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="mt-12 md:mt-0">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
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
                        <p className="text-blue-100 mb-6 max-w-lg italic">
                            "{quote.text}" <span className="block mt-2 text-sm not-italic opacity-80">- {quote.author}</span>
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
                        <h3 className="text-xl font-bold text-gray-900">Upcoming Meetings & Events</h3>
                        <Link href="/dashboard/events" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {stats.upcomingItems?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No upcoming meetings or events</p>
                            </div>
                        ) : (
                            stats.upcomingItems?.map((item: any) => (
                                <div key={`${item.type}-${item.id}`} className="glass-card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 
                                        ${item.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                        <span className="text-xs font-bold uppercase">
                                            {new Date(item.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {new Date(item.date).getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border
                                                ${item.type === 'event' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                                {item.type === 'event' ? 'Event' : 'Meeting'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.location || 'No location'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                        <span className="text-sm text-gray-500">Latest updates</span>
                    </div>
                    <div className="space-y-4">
                        {stats.recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            stats.recentActivity.map((activity: any) => (
                                <div key={`${activity.type}-${activity.id}`} className="glass-card p-4 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 
                                            ${activity.type === 'finance' ? 'bg-green-100 text-green-600' :
                                                activity.type === 'project' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-purple-100 text-purple-600'}`}>
                                            {activity.type === 'finance' ? <DollarSign size={16} /> :
                                                activity.type === 'project' ? <Briefcase size={16} /> :
                                                    <FileText size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">{activity.title}</p>
                                            <p className="text-sm text-gray-500">{activity.subtitle}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(activity.date).toLocaleDateString()} • {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
