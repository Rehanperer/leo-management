'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AIConsultantPage() {
    const [projectIdea, setProjectIdea] = useState('');
    const [consultation, setConsultation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectIdea.trim()) return;

        setIsLoading(true);
        setError('');
        setConsultation('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai/consultant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ projectIdea }),
            });

            if (!response.ok) {
                throw new Error('Failed to get consultation');
            }

            const data = await response.json();
            setConsultation(data.consultation);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Header */}
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
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">AI Project Consultant</h1>
                            <p className="text-gray-600 mt-1">
                                Get expert AI-powered suggestions to improve your Leo project ideas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input Form */}
                <div className="card mb-8">
                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Describe  Your Project Idea
                        </label>
                        <textarea
                            value={projectIdea}
                            onChange={(e) => setProjectIdea(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leo-500 focus:border-transparent"
                            rows={10}
                            placeholder="Describe your project idea in detail. Include:&#10;- What problem or need you want to address&#10;- Who will benefit from this project&#10;- Your initial plan or approach&#10;- Any specific goals or outcomes you hope to achieve&#10;&#10;Example: 'We want to organize a food donation drive for homeless shelters in our city. We're thinking of collecting non-perishable items from our school and local businesses, then distributing them to 3 shelters monthly...'"
                            required
                        />

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !projectIdea.trim()}
                            className="mt-4 btn btn-primary py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Analyzing your project...
                                </span>
                            ) : (
                                'Get AI Consultation'
                            )}
                        </button>
                    </form>
                </div>

                {/* AI Response */}
                {consultation && (
                    <div className="card bg-gradient-to-br from-leo-50 to-gold-50 animate-fade-in">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">AI Consultation Results</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                    {consultation}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setProjectIdea('');
                                        setConsultation('');
                                    }}
                                    className="btn btn-secondary"
                                >
                                    New Consultation
                                </button>
                                <Link
                                    href="/dashboard/projects/new"
                                    className="btn btn-primary"
                                >
                                    Create Project →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                {!consultation && !isLoading && (
                    <div className="card bg-blue-50">
                        <h3 className="font-semibold text-gray-900 mb-2">💡 Tips for Better Consultation</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                            <li>• Be specific about the community need you're addressing</li>
                            <li>• Mention your target beneficiaries and expected impact</li>
                            <li>• Share any initial ideas for implementation</li>
                            <li>• Ask about alignment with Leo/Lions award criteria if relevant</li>
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
