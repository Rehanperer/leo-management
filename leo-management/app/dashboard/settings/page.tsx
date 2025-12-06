'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';

import { Camera, Upload, X } from 'lucide-react';

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

    // Profile Picture State
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            // Optimistic update
            setProfileImage(base64String);

            // Upload to server
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/user/profile', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ profilePicture: base64String })
                });

                if (response.ok) {
                    const data = await response.json();

                    // Update local user data
                    if (user) {
                        const updatedUser = {
                            ...user,
                            profilePicture: data.user.profilePicture
                        };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        // Force a reload or update context (reload is simpler for now to propagate changes)
                        window.location.reload();
                    }
                } else {
                    console.error('Failed to upload image');
                    // Revert optimistic update if needed, or show error
                }
            } catch (error) {
                console.error('Error uploading image', error);
            }
        };
        reader.readAsDataURL(file);
    };

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
        <div className="min-h-screen">
            <header className="bg-[rgba(240,247,255,0.8)] backdrop-blur-lg border-b border-sky-shadow sticky top-0 z-50">
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
                        <div className="relative group">
                            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-leo-600 to-purple-600 border-2 border-white shadow-md">
                                {user?.profilePicture || profileImage ? (
                                    <img
                                        src={user?.profilePicture || profileImage || ''}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                                title="Change Profile Picture"
                            >
                                <Camera className="w-3 h-3 text-gray-600" />
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                            />
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

                        {user?.role === 'admin' && (
                            <div className="card mb-6 border-blue-200 bg-blue-50/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                                    Admin Controls
                                    <Link href="/dashboard/admin" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline">
                                        Go to Admin Dashboard <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Allow Club Creation</p>
                                        <p className="text-sm text-gray-600">Enable or disable the ability to create new club accounts.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={user?.canCreateClubs ?? true}
                                            onChange={async (e) => {
                                                const newValue = e.target.checked;
                                                if (user) {
                                                    const updatedUser = { ...user, canCreateClubs: newValue };
                                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                                    window.location.reload();
                                                }

                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await fetch('/api/user/profile', {
                                                        method: 'PATCH',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${token}`
                                                        },
                                                        body: JSON.stringify({ canCreateClubs: newValue })
                                                    });
                                                } catch (error) {
                                                    console.error('Failed to update setting', error);
                                                }
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}

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
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <LoadingSpinner size="sm" />
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Section */}
                {activeTab === 'about' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Two-column layout for About and Contact */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* About LeoLynk - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                <div className="card h-full">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About LeoLynk</h3>
                                    <div className="prose prose-sm max-w-none text-gray-600">
                                        <p className="mb-4">
                                            LeoLynk is a comprehensive, next-generation management platform meticulously designed to empower Leo Clubs across the globe.
                                            More than just a management tool, LeoLynk serves as your club's digital headquarters, seamlessly integrating project planning,
                                            financial oversight, member engagement, and strategic reporting into one unified ecosystem.
                                        </p>
                                        <p className="mb-4">
                                            Our mission is to revolutionize how Leo Clubs operate by providing cutting-edge digital tools that amplify service impact,
                                            streamline leadership workflows, and foster meaningful collaboration. Whether you're a club president managing multiple projects,
                                            a treasurer tracking finances, or a member contributing to your club's success, LeoLynk adapts to your role and enhances
                                            your leadership development journey with intelligent automation, insightful analytics, and intuitive user experiences.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Administrator Contact - Takes 1 column on the right */}
                            <div className="lg:col-span-1">
                                <div className="card h-full">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Contact</h3>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-leo-600 to-purple-600 rounded-full flex items-center justify-center text-white mb-4">
                                            <span className="text-2xl font-bold">RP</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 text-lg mb-1">Rehan Perera</h4>
                                        <p className="text-sm text-gray-500 mb-4">Lead Developer & Administrator</p>

                                        {/* Contact Links */}
                                        <div className="space-y-2 w-full">
                                            <a
                                                href="mailto:pererarehan2007@gmail.com"
                                                className="flex items-center justify-center gap-2 text-gray-700 hover:text-leo-600 text-sm py-2 px-3 rounded-lg hover:bg-leo-50 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs">Email</span>
                                            </a>

                                            <a
                                                href="https://www.linkedin.com/in/rehan-perera-09a9752b6/"
                                                className="flex items-center justify-center gap-2 text-gray-700 hover:text-blue-600 text-sm py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                                <span className="text-xs">LinkedIn</span>
                                            </a>

                                            <a
                                                href="https://github.com/Rehanperer"
                                                className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 text-sm py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                                </svg>
                                                <span className="text-xs">GitHub</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Section - Full width below */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprehensive Feature Set</h3>
                            <div className="prose prose-sm max-w-none text-gray-600">
                                <div className="space-y-4 mb-4">
                                    <div className="bg-gradient-to-br from-leo-50 to-purple-50 p-4 rounded-lg border border-leo-200">
                                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-leo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Project Management
                                        </h5>
                                        <p className="text-sm">
                                            Transform your service projects from concept to completion with our comprehensive project management suite. LeoLynk
                                            enables you to create detailed project proposals with AI-assisted writing, upload and organize project photos and receipts,
                                            track participant engagement, and generate professional PDF reports that meet Leo International standards. With real-time
                                            statistics, customizable PDF themes, and automatic financial calculations, managing multiple projects simultaneously has
                                            never been easier. Visualize your club's journey with the stunning animated Timeline View that showcases projects
                                            chronologically with smooth scroll-based animations and alternating layouts, or use the traditional Grid View for quick
                                            overview. Each project becomes a documented legacy of your club's impact, ready to share with district leadership.
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Financial Tracking
                                        </h5>
                                        <p className="text-sm">
                                            Maintain complete financial transparency with our robust accounting system designed for Leo Club treasurers. Record every
                                            income source and expense with detailed categorization, attach digital receipts for audit trails, and monitor your club's
                                            budget balance in real-time through an intuitive dashboard. The system automatically calculates running balances, generates
                                            treasurer reports for district submissions, and provides visual analytics to help your club make informed financial decisions.
                                            Say goodbye to spreadsheet chaos and embrace financial clarity.
                                        </p>
                                    </div>

                                    {!showAllFeatures && (
                                        <button
                                            onClick={() => setShowAllFeatures(true)}
                                            className="text-leo-600 hover:text-leo-700 font-semibold text-sm mt-2 flex items-center gap-2 bg-leo-50 px-4 py-2 rounded-lg hover:bg-leo-100 transition-colors"
                                        >
                                            <span>Explore All Features</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {showAllFeatures && (
                                    <div className="animate-fade-in space-y-4 mb-4">
                                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Meeting Minutes
                                            </h5>
                                            <p className="text-sm">
                                                Streamline your club meetings from scheduling to documentation with our intelligent meeting management system. Schedule
                                                meetings with date and time tracking, record comprehensive minutes with structured formatting, track member attendance
                                                with digital roll calls, and capture action items with assigned responsibilities. Our AI assistant can help draft
                                                meeting minutes, suggest agenda items based on club activities, and even generate meeting scripts for board meetings.
                                                Export professional meeting minutes in Word format for district reporting, ensuring your club maintains excellent
                                                documentation standards effortlessly.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Event Planning
                                            </h5>
                                            <p className="text-sm">
                                                Elevate your club events from concept to execution with our comprehensive event management platform. Plan every detail
                                                of your fundraisers, service activities, and social gatherings with structured event profiles that include date, time,
                                                location, participant lists, and task assignments. Track event budgets, monitor RSVPs, coordinate logistics, and capture
                                                event highlights with integrated photo galleries. The system helps you analyze event success metrics, compare attendance
                                                patterns, and build on successful event templates for recurring activities. Never miss a detail with automated reminders
                                                and collaborative planning tools.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                D2 Classroom Resources
                                            </h5>
                                            <p className="text-sm">
                                                Access a comprehensive digital library of essential Leo Club resources curated specifically for District 306 A2 clubs.
                                                The D2 Classroom serves as your centralized knowledge hub, featuring the Club Exco Essential Pack with leadership guides,
                                                project planning templates, constitutional documents, officer handbooks, and district-specific guidelines. All documents
                                                are organized by category for easy navigation and available for instant download. Whether you're a new officer seeking
                                                guidance or an experienced leader refreshing your knowledge, these resources provide the foundation for club excellence
                                                and compliance with Leo International standards.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                AI Assistant (Chatbot)
                                            </h5>
                                            <p className="text-sm">
                                                Meet your intelligent club assistant, powered by advanced AI technology through Botpress integration. Available 24/7
                                                via the chat bubble on every page, this AI companion helps you draft project descriptions, write meeting minutes,
                                                generate report content, answer Leo Club policy questions, and provide guidance on administrative tasks. The chatbot
                                                understands context about your club activities and can suggest improvements to your writing, help brainstorm project
                                                ideas, and even assist with formatting requirements for district submissions. It's like having an experienced Leo advisor
                                                available at any time, accelerating your productivity and enhancing content quality.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-lg border border-teal-200">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                Mind Mapping
                                            </h5>
                                            <p className="text-sm">
                                                Unleash your club's creative potential with our advanced visual mind mapping tools powered by Mind Elixir.
                                                Transform brainstorming sessions into structured action plans by creating dynamic, interactive mind maps for project
                                                planning, event ideation, goal setting, and strategic thinking. Add custom styles with colors and icons, insert images
                                                and hyperlinks, create rich text formatting, use tags for organization, and build hierarchical structures with unlimited
                                                nodes. Mind maps are automatically saved and can be exported for presentations or shared with club members. Perfect for
                                                collaborative planning sessions, officer transition planning, and long-term club strategy development.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Automated Reporting
                                            </h5>
                                            <p className="text-sm">
                                                Eliminate hours of manual report writing with our intelligent automated reporting system. Generate professional,
                                                district-ready reports with a single click, including Monthly Activity Reports that summarize all club activities,
                                                Financial Statements with detailed transaction histories, Meeting Agendas with structured formatting, Board Meeting
                                                Scripts with speaking points, and Annual Performance Reviews with comprehensive analytics. Each report template is
                                                pre-formatted to meet Leo International standards and can be exported in Word or PDF formats. The system automatically
                                                pulls data from your projects, finances, meetings, and events, intelligently formatting everything into polished
                                                documents that showcase your club's achievements and professionalism.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setShowAllFeatures(false)}
                                            className="text-leo-600 hover:text-leo-700 font-semibold text-sm mt-2 flex items-center gap-2 bg-leo-50 px-4 py-2 rounded-lg hover:bg-leo-100 transition-colors"
                                        >
                                            <span>Show Less</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
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
