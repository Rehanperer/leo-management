'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ClubCredentials {
    clubName: string;
    username: string;
    password: string;
}

export default function AdminPage() {
    const [clubName, setClubName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState<ClubCredentials | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setCredentials(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ clubName, contactEmail, username }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create club');
            }

            const data = await response.json();
            setCredentials({
                clubName: data.club.name,
                username: data.credentials.username,
                password: data.credentials.password,
            });

            // Reset form
            setClubName('');
            setContactEmail('');
            setUsername('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-[rgba(240,247,255,0.8)] backdrop-blur-lg border-b border-sky-shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 hover:text-leo-700 font-semibold flex items-center gap-2 transition-all hover:gap-3 duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="mb-8 animate-slide-up">
                    <h1 className="text-4xl font-bold text-gradient-leo mb-2">Admin Panel</h1>
                    <p className="text-gray-600 text-lg">Create and manage club accounts</p>
                </div>

                {/* Create Club Form */}
                <div className="card card-hover mb-8 animate-scale-in">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-leo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Club Account</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Club Name *
                            </label>
                            <input
                                type="text"
                                value={clubName}
                                onChange={(e) => setClubName(e.target.value)}
                                className="input group-hover:border-leo-400 transition-colors"
                                placeholder="e.g., Leo Club of Downtown"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input group-hover:border-leo-400 transition-colors"
                                placeholder="e.g., leodowntown"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                This will be used for login. Use lowercase, no spaces.
                            </p>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="input group-hover:border-leo-400 transition-colors"
                                placeholder="contact@leoclub.org"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3 animate-shake">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 shadow-lg"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Club Account
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Success - Show Credentials */}
                {credentials && (
                    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 animate-slide-up shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-green-900 mb-3 text-xl flex items-center gap-2">
                                    ✅ Club Account Created Successfully!
                                </h3>
                                <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-inner">
                                    <p className="text-sm text-gray-600 mb-3 font-medium">Share these credentials with the club:</p>
                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="flex items-center justify-between p-3 bg-sky-mist rounded-lg">
                                            <span className="text-gray-600 font-semibold">Club:</span>
                                            <span className="font-bold text-gray-900">{credentials.clubName}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-sky-mist rounded-lg">
                                            <span className="text-gray-600 font-semibold">Username:</span>
                                            <span className="font-bold text-gray-900">{credentials.username}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-sky-mist rounded-lg">
                                            <span className="text-gray-600 font-semibold">Password:</span>
                                            <span className="font-bold text-red-600">{credentials.password}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
                                        <p className="text-sm text-yellow-900 font-medium flex items-start gap-2">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span><strong>Important:</strong> Save the password now. It cannot be retrieved later.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
