'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, User, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface ClubCredentials {
    clubName: string;
    username: string;
    password: string;
}

export default function AdminPage() {
    const { user } = useAuth();
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

            // Reset form and refresh list
            setClubName('');
            setContactEmail('');
            setUsername('');
            fetchClubs();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Club List & Deletion Logic ---
    const [clubs, setClubs] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clubToDelete, setClubToDelete] = useState<any>(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchClubs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/clubs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setClubs(data.clubs);
            }
        } catch (error) {
            console.error('Failed to fetch clubs', error);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchClubs();
        }
    }, [user]);

    const initiateDelete = (club: any) => {
        setClubToDelete(club);
        setAdminPassword('');
        setDeleteError('');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!clubToDelete || !adminPassword) return;

        setIsDeleting(true);
        setDeleteError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/clubs/${clubToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: adminPassword })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete club');
            }

            // Success
            setIsDeleteModalOpen(false);
            setClubToDelete(null);
            fetchClubs(); // Refresh list
        } catch (err: any) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
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
                    {user?.canCreateClubs === false && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 6.524a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Club creation is currently disabled. You can enable it in <Link href="/dashboard/settings" className="font-medium underline hover:text-red-600">Settings</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`flex items-center gap-3 mb-6 ${user?.canCreateClubs === false ? 'opacity-50' : ''}`}>
                        <div className="w-12 h-12 bg-gradient-to-br from-leo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Club Account</h2>
                    </div>



                    <fieldset disabled={user?.canCreateClubs === false} className={user?.canCreateClubs === false ? 'opacity-50 pointer-events-none' : ''}>
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
                    </fieldset>
                </div>

                {/* Success - Show Credentials */}
                {
                    credentials && (
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
                    )
                }
            </main >

            {/* Club List Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-leo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Manage Clubs</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Club Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clubs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No clubs found. Create one above!
                                        </td>
                                    </tr>
                                ) : (
                                    clubs.map((club) => (
                                        <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{club.name}</div>
                                                {club.district && <div className="text-xs text-gray-500">{club.district}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    {club.username}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(club.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => initiateDelete(club)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Club Account"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && clubToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scale-in">
                        <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Delete Account?</h3>
                                <p className="text-red-700 text-sm">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                You are about to permanently delete <strong>{clubToDelete.name}</strong> and all associated data including projects, reports, and financial records.
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enter Admin Password to Confirm
                                </label>
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="input w-full border-red-200 focus:border-red-500 focus:ring-red-200"
                                    placeholder="Admin Password"
                                    autoFocus
                                />
                                {deleteError && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                        {deleteError}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={!adminPassword || isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 flex items-center gap-2"
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
}
