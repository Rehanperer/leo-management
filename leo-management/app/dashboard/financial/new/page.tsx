'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
    id: string;
    title: string;
}

export default function NewFinancialRecordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [formData, setFormData] = useState({
        type: 'expense',
        status: 'completed',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        receipt: null as string | null,
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No authentication token found');
                    return;
                }

                const response = await fetch('/api/projects', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects);
                } else {
                    console.error('Failed to fetch projects:', response.status);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, []);

    const categories = {
        income: ['Donation', 'Sponsorship', 'Fundraiser', 'Membership Fees', 'Grant', 'Other'],
        expense: ['Supplies', 'Transport', 'Venue', 'Food & Beverage', 'Marketing', 'Equipment', 'Other'],
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, receipt: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication required. Please log in again.');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/financial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (response.ok) {
                router.push('/dashboard/financial');
            } else {
                alert('Failed to create record');
            }
        } catch (error) {
            console.error('Error creating record:', error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link href="/dashboard/financial" className="text-leo-600 hover:text-leo-700 font-medium mb-2 inline-block">
                    ← Back to Financial Records
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Financial Entry</h1>
                <p className="text-gray-600">Record a new income or expense transaction</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                            <select
                                className="input"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                            >
                                <option value="income">Income (+)</option>
                                <option value="expense">Expense (-)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="completed">Completed (Paid/Received)</option>
                                <option value="pending">Pending</option>
                                <option value="projected">Projected (Future)</option>
                            </select>
                        </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="input !pl-14"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Category & Project */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                required
                                className="input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {(formData.type === 'income' ? categories.income : categories.expense).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                            <select
                                className="input"
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            >
                                <option value="">No Project</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            className="input"
                            placeholder="Details about the transaction..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Receipt Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt / Proof</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-leo-500 transition-colors">
                            <div className="space-y-1 text-center">
                                {formData.receipt ? (
                                    <div className="relative">
                                        <img src={formData.receipt} alt="Receipt preview" className="mx-auto h-48 object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, receipt: null })}
                                            className="absolute top-0 right-0 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-leo-600 hover:text-leo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-leo-500">
                                                <span>Upload a file</span>
                                                <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Link href="/dashboard/financial" className="btn btn-secondary mr-4">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary min-w-[120px]"
                        >
                            {isLoading ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

