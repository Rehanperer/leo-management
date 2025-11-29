'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import FinancialCharts from '@/components/charts/FinancialCharts';

interface FinancialRecord {
    id: string;
    type: 'income' | 'expense';
    status: 'completed' | 'pending' | 'projected';
    category: string;
    amount: number;
    description: string;
    date: string;
    project?: { title: string };
    receiptUrl?: string;
}

export default function FinancialPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'projects'>('overview');
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>('all');

    // Mock data for initial render (replace with API call later)
    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setRecords([
                { id: '1', type: 'income', status: 'completed', category: 'Donation', amount: 5000, description: 'Community Fund', date: '2025-11-01', project: { title: 'Health Camp' } },
                { id: '2', type: 'expense', status: 'completed', category: 'Supplies', amount: 1200, description: 'Medical Kits', date: '2025-11-05', project: { title: 'Health Camp' } },
                { id: '3', type: 'expense', status: 'pending', category: 'Transport', amount: 800, description: 'Bus Rental', date: '2025-11-10', project: { title: 'Health Camp' } },
                { id: '4', type: 'income', status: 'projected', category: 'Sponsorship', amount: 10000, description: 'Annual Gala', date: '2025-12-01' },
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    // Calculate totals
    const totalIncome = records.filter(r => r.type === 'income' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'expense' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
    const currentBalance = totalIncome - totalExpenses;
    const pendingPayments = records.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

    // Prepare chart data
    const monthlyData = [
        { name: 'Nov', income: 5000, expenses: 1200 },
        { name: 'Dec', income: 0, expenses: 0 },
    ];

    const categoryData = [
        { name: 'Supplies', value: 1200 },
        { name: 'Transport', value: 800 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
                    <p className="text-gray-600">Track income, expenses, and project budgets</p>
                </div>
                <Link
                    href="/dashboard/financial/new"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Entry
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-white border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="card bg-white border-l-4 border-red-500">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="card bg-white border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${currentBalance.toLocaleString()}</p>
                </div>
                <div className="card bg-white border-l-4 border-yellow-500">
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${pendingPayments.toLocaleString()}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                ? 'border-leo-600 text-leo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transactions'
                                ? 'border-leo-600 text-leo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'projects'
                                ? 'border-leo-600 text-leo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Project View
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="animate-fade-in">
                    <FinancialCharts monthlyData={monthlyData} categoryData={categoryData} />

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.slice(0, 5).map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.category}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {record.type === 'income' ? '+' : '-'}${record.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="card animate-fade-in">
                    <div className="flex gap-4 mb-6">
                        <select
                            className="input max-w-xs"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select
                            className="input max-w-xs"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            <option value="all">All Months</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.project?.title || '-'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {record.type === 'income' ? '+' : '-'}${record.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                            {record.receiptUrl ? 'View' : 'Upload'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {/* Mock Project Cards */}
                    <div className="card">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Health Camp</h3>
                                <p className="text-sm text-gray-500">Completed</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Budget Surplus</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Income</span>
                                <span className="font-medium text-green-600">$5,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Expenses</span>
                                <span className="font-medium text-red-600">$2,000</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between font-semibold">
                                <span>Balance</span>
                                <span className="text-blue-600">$3,000</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
