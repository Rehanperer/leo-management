'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'appearance' | 'account'>('appearance');

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 dark:text-leo-400 hover:text-leo-700 dark:hover:text-leo-300 font-medium">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                        <div className="w-32"></div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Card */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-leo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user?.username}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user?.role === 'admin' ? 'Administrator' : user?.clubName || 'Club Member'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'appearance'
                                ? 'bg-leo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Appearance
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'account'
                                ? 'bg-leo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Account
                    </button>
                </div>

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark theme</p>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-leo-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        >
                                            {theme === 'dark' ? (
                                                <svg className="w-6 h-6 p-1 text-leo-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 p-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Display Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Compact Mode</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Show more content in less space</p>
                                    </div>
                                    <button
                                        className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-600"
                                        disabled
                                    >
                                        <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1"></span>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Settings */}
                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <div className="input bg-gray-100 dark:bg-gray-700">{user?.username}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <div className="input bg-gray-100 dark:bg-gray-700 capitalize">{user?.role}</div>
                                </div>
                                {user?.clubName && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club</label>
                                        <div className="input bg-gray-100 dark:bg-gray-700">{user.clubName}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Password</p>
                                    <button className="btn btn-secondary">
                                        Change Password
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Coming soon...</p>
                                </div>
                            </div>
                        </div>

                        <div className="card border-red-200 dark:border-red-800">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Logout</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>© 2025 Leo Management System. All rights reserved.</p>
                    <p className="mt-1 text-xs">Website made by Rehan Perera</p>
                </div>
            </main>
        </div>
    );
}
