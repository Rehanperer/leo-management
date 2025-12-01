'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'club' | 'about'>('account');
    const [isLoading, setIsLoading] = useState(false);

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [showAllFeatures, setShowAllFeatures] = useState(false);

    // Club Settings State
    const [clubData, setClubData] = useState({
        name: user?.clubName || '',
        district: ''
    });
    const [clubMessage, setClubMessage] = useState({ type: '', text: '' });

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        setIsLoading(true);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClubSave = async () => {
        if (!user?.clubId) return;

        setIsLoading(true);
        setClubMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/clubs/${user.clubId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clubData)
            });

            const data = await response.json();

            if (response.ok) {
                setClubMessage({ type: 'success', text: 'Club details updated successfully' });

                // Update local storage with new club details
                if (user) {
                    const updatedUser = {
                        ...user,
                        clubName: clubData.name
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }

                // Reload to reflect changes
                window.location.reload();
            } else {
                setClubMessage({ type: 'error', text: data.error || 'Failed to update club details' });
            }
        } catch (error) {
            setClubMessage({ type: 'error', text: 'An error occurred. Please try again.' });
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
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                        <div className="w-32"></div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Card */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-leo-600 to-purple-600 rounded-full flex items-center justify-center relative group cursor-pointer">
                            <span className="text-2xl font-bold text-white">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                            <p className="text-sm text-gray-600">
                                {user?.role === 'admin' ? 'Administrator' : user?.clubName || 'Club Member'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'account'
                            ? 'bg-blue-600 !text-white'
                            : 'bg-gray-200 !text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Account
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'security'
                            ? 'bg-blue-600 !text-white'
                            : 'bg-gray-200 !text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Security
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('club')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'club'
                                ? 'bg-blue-600 !text-white'
                                : 'bg-gray-200 !text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Club Settings
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'about'
                            ? 'bg-blue-600 !text-white'
                            : 'bg-gray-200 !text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        About
                    </button>
                </div>

                {/* Account Settings */}
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <div className="input bg-gray-100">{user?.username}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <div className="input bg-gray-100 capitalize">{user?.role}</div>
                                </div>
                                {user?.clubName && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                                        <div className="input bg-gray-100">{user.clubName}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card border-red-200">
                            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900 mb-2">Logout</p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Sign out of your account on this device
                                    </p>
                                    <button
                                        onClick={handleLogout}
                                        className="btn bg-red-600 text-white hover:bg-red-700"
                                    >
                                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                            <form className="space-y-4" onSubmit={handlePasswordChange}>
                                {passwordMessage.text && (
                                    <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                        }`}>
                                        {passwordMessage.text}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Enter current password"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Enter new password"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Club Settings */}
                {activeTab === 'club' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Details</h3>
                            <div className="space-y-4">
                                {clubMessage.text && (
                                    <div className={`p-4 rounded-lg ${clubMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {clubMessage.text}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={clubData.name}
                                        onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. 306 A2"
                                        value={clubData.district}
                                        onChange={(e) => setClubData({ ...clubData, district: e.target.value })}
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleClubSave}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Section */}
                {activeTab === 'about' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">About LeoLynk</h3>
                            <div className="prose prose-sm max-w-none text-gray-600">
                                <p className="mb-4">
                                    LeoLynk is a comprehensive management system designed specifically for Leo Clubs.
                                    It streamlines club operations, project reporting, financial management, and member engagement.
                                </p>
                                <p className="mb-4">
                                    Our mission is to empower Leo Clubs with digital tools that enhance their service impact
                                    and leadership development journey.
                                </p>

                                <div className="mt-6">
                                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                                    <ul className="list-disc pl-5 space-y-1 mb-4">
                                        <li><strong>Project Management:</strong> comprehensive tools to plan, track, and report on service projects with real-time statistics.</li>
                                        <li><strong>Financial Tracking:</strong> Manage club finances, track income and expenses, and generate transparent financial reports.</li>
                                        {!showAllFeatures && (
                                            <button
                                                onClick={() => setShowAllFeatures(true)}
                                                className="text-leo-600 hover:text-leo-700 font-medium text-sm mt-2 flex items-center gap-1"
                                            >
                                                Read More
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        )}
                                    </ul>

                                    {showAllFeatures && (
                                        <div className="animate-fade-in">
                                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                                <li><strong>Meeting Minutes:</strong> Schedule meetings, record detailed minutes, and track member attendance effortlessly.</li>
                                                <li><strong>Event Planning:</strong> Organize club events, manage tasks, and track participation to ensure successful outcomes.</li>
                                                <li><strong>Document Repository:</strong> A centralized, secure hub for all club documents, resources, and guidelines.</li>
                                                <li><strong>AI Assistant:</strong> An intelligent chatbot to assist with reporting, drafting content, and answering queries instantly.</li>
                                                <li><strong>Mind Mapping:</strong> Visual brainstorming tools to plan projects and organize ideas effectively.</li>
                                                <li><strong>Member Directory:</strong> Manage club members, track roles, and maintain up-to-date contact information.</li>
                                                <li><strong>Automated Reporting:</strong> Generate professional monthly and annual reports with a single click.</li>
                                            </ul>
                                            <button
                                                onClick={() => setShowAllFeatures(false)}
                                                className="text-leo-600 hover:text-leo-700 font-medium text-sm mt-2 flex items-center gap-1"
                                            >
                                                Show Less
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Contact</h3>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-leo-100 rounded-full flex items-center justify-center text-leo-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Rehan Perera</h4>
                                    <p className="text-sm text-gray-500 mb-2">Lead Developer & Administrator</p>
                                    <a href="mailto:pererarehan2007@gmail.com" className="text-leo-600 hover:text-leo-700 text-sm flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        pererarehan2007@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>© 2025 LeoLynk. All rights reserved.</p>
                    <p className="mt-1 text-xs flex items-center justify-center gap-1">
                        Crafted with <span className="text-red-500">❤️</span> for Leo Clubs
                    </p>
                </div>
            </main>
        </div>
    );
}
