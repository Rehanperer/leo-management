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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600 mt-1">Create and manage club accounts</p>
                </div>

                {/* Create Club Form */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Club Account</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Club Name *
                            </label>
                            <input
                                type="text"
                                value={clubName}
                                onChange={(e) => setClubName(e.target.value)}
                                className="input"
                                placeholder="e.g., Leo Club of Downtown"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input"
                                placeholder="e.g., leodowntown"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This will be used for login. Use lowercase, no spaces.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="input"
                                placeholder="contact@leoclub.org"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Club Account'}
                        </button>
                    </form>
                </div>

                {/* Success - Show Credentials */}
                {credentials && (
                    <div className="card bg-green-50 border-green-200 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 mb-3">
                                    ✅ Club Account Created Successfully!
                                </h3>
                                <div className="bg-white rounded-lg p-4 border border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Share these credentials with the club:</p>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div>
                                            <span className="text-gray-600">Club:</span>{' '}
                                            <span className="font-semibold text-gray-900">{credentials.clubName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Username:</span>{' '}
                                            <span className="font-semibold text-gray-900">{credentials.username}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Password:</span>{' '}
                                            <span className="font-semibold text-red-600">{credentials.password}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-sm text-yellow-800">
                                            ⚠️ <strong>Important:</strong> Save the password now. It cannot be retrieved later.
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
