'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { login } = useAuth();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            // Trigger zoom-out animation on successful login
            setIsLoggingIn(true);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 px-4 relative overflow-hidden cursor-none ${isLoggingIn ? 'animate-zoom-out' : ''}`}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

                {/* Fluid cursor follower */}
                <div
                    className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/30 to-yellow-400/30 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
                    style={{
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            </div>

            {/* Custom cursor */}
            <div
                className="fixed w-4 h-4 bg-yellow-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-100"
                style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    transform: 'translate(-50%, -50%)'
                }}
            />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
                        <img src="/logo.png" alt="LeoLynk Logo" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        LeoLynk
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Welcome back! Please login to your account.
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl p-8 border-2 border-white/30 animate-scale-in">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input !pl-14 focus:shadow-lg"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input !pl-14 focus:shadow-lg"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-shake">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Sign In
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setShowContactModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Need Access?
                        </button>
                    </div>
                </div>

                {/* Contact Modal */}
                {showContactModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Access</h3>
                                <p className="text-gray-600 mb-6">
                                    To create an account for your Leo Club, please contact our administrator
                                </p>

                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-100">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                                            <p className="text-lg font-semibold text-gray-900">Rehan Perera</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                                            <p className="text-lg font-semibold text-gray-900">076 570 4754</p>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href="https://wa.me/94765704754"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl mb-4"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp Now
                                </a>

                                <p className="text-xs text-gray-500 mb-4">
                                    <strong>Note:</strong> Only club presidents should request access for their respective clubs.
                                </p>

                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-blue-100 text-sm">
                    <p>© 2025 LeoLynk. All rights reserved.</p>
                    <p className="mt-1 text-xs flex items-center justify-center gap-1">
                        Crafted with <span className="text-yellow-400">❤️</span> for Leo Clubs
                    </p>
                </div>
            </div>
        </div>
    );
}
