'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'club' | 'notifications' | 'data'>('account');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
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
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
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
                                ? 'bg-leo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Account
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'security'
                                ? 'bg-leo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Security
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('club')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'club'
                                    ? 'bg-leo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Club Settings
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'notifications'
                                ? 'bg-leo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'data'
                                ? 'bg-leo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Data & Export
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
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input type="password" className="input" placeholder="Enter current password" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input type="password" className="input" placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input type="password" className="input" placeholder="Confirm new password" />
                                </div>
                                <div className="pt-2">
                                    <button className="btn btn-primary">Update Password</button>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                                    <input type="text" className="input" defaultValue={user?.clubName} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <input type="text" className="input" placeholder="e.g. 306 A2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Club Logo</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-leo-500 transition-colors cursor-pointer">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button className="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">Project Approvals</p>
                                        <p className="text-sm text-gray-600">Get notified when a project is approved</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">Upcoming Deadlines</p>
                                        <p className="text-sm text-gray-600">Reminders for reporting deadlines</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-gray-900">System Updates</p>
                                        <p className="text-sm text-gray-600">News about new features and updates</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data & Export */}
                {activeTab === 'data' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                            <p className="text-gray-600 mb-6">
                                Download a copy of your club's data, including project reports, financial records, and meeting minutes.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="p-4 border border-gray-200 rounded-lg hover:border-leo-500 hover:bg-leo-50 transition-all text-left group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-gray-900">Export as CSV</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Best for spreadsheet analysis</p>
                                </button>
                                <button className="p-4 border border-gray-200 rounded-lg hover:border-leo-500 hover:bg-leo-50 transition-all text-left group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-gray-900">Export as PDF</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Best for printing and sharing</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>© 2025 Leo Management System. All rights reserved.</p>
                    <p className="mt-1 text-xs">Website made by Rehan Perera</p>
                </div>
            </main>
        </div>
    );
}
