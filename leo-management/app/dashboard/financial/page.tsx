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

interface Project {
    id: string;
    title: string;
}

export default function FinancialPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'projects' | 'budgeting'>('overview');
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>('all');

    // Budgeting State
    const [budgetForm, setBudgetForm] = useState({
        projectId: '',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchRecords();
        fetchProjects();
    }, [filterType, filterMonth]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                setIsLoading(false);
                return;
            }

            const params = new URLSearchParams();
            if (filterType !== 'all') params.append('type', filterType);
            if (filterMonth !== 'all') params.append('month', filterMonth);

            const response = await fetch(`/api/financial?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRecords(data.records);
            } else {
                console.error('Failed to fetch records:', response.status);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleCreateBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication required. Please log in again.');
                return;
            }

            const response = await fetch('/api/financial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...budgetForm,
                    type: 'expense',
                    status: 'projected',
                    amount: parseFloat(budgetForm.amount),
                }),
            });

            if (response.ok) {
                alert('Budget item added successfully');
                setBudgetForm({
                    projectId: '',
                    description: '',
                    amount: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                });
                fetchRecords(); // Refresh data
            } else {
                alert('Failed to add budget item');
            }
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    // Calculate totals
    const totalIncome = records.filter(r => r.type === 'income' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'expense' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
    const currentBalance = totalIncome - totalExpenses;
    const pendingPayments = records.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

    // Prepare chart data (Extended to June as requested)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Filter to show relevant months (e.g., current fiscal year or just Jan-June as requested)
    // For now, showing Jan-June of current year + any months with data
    const monthlyData = months.slice(0, 6).map((month, index) => {
        const monthIndex = index; // 0-based
        const monthRecords = records.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === monthIndex && d.getFullYear() === currentYear && r.status === 'completed';
        });

        return {
            name: month,
            income: monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
            expenses: monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
        };
    });

    // Aggregate expenses by category
    const expensesByCategory = records
        .filter(r => r.type === 'expense' && r.status === 'completed')
        .reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + r.amount;
            return acc;
        }, {} as Record<string, number>);

    const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

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
                    {['overview', 'transactions', 'projects', 'budgeting'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-leo-600 text-leo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab === 'projects' ? 'Project View' : tab}
                        </button>
                    ))}
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
                            {months.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
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
                                {isLoading ? (
                                    <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-4">No records found</td></tr>
                                ) : (
                                    records.map((record) => (
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
                                                {record.receiptUrl ? (
                                                    <a href={record.receiptUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                ) : 'No Receipt'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {projects.map(project => {
                        const projectRecords = records.filter(r => r.project?.title === project.title);
                        const income = projectRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
                        const expenses = projectRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
                        const balance = income - expenses;

                        return (
                            <div key={project.id} className="card">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                                        <p className="text-sm text-gray-500">{projectRecords.length} transactions</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {balance >= 0 ? 'Surplus' : 'Deficit'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Income</span>
                                        <span className="font-medium text-green-600">${income}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Expenses</span>
                                        <span className="font-medium text-red-600">${expenses}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between font-semibold">
                                        <span>Balance</span>
                                        <span className={balance >= 0 ? 'text-blue-600' : 'text-red-600'}>${balance}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {projects.length === 0 && <p className="text-gray-500 col-span-2 text-center">No projects found.</p>}
                </div>
            )}

            {activeTab === 'budgeting' && (
                <div className="animate-fade-in">
                    <div className="card mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Project Budget</h3>
                        <form onSubmit={handleCreateBudget} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <select
                                    required
                                    className="input"
                                    value={budgetForm.projectId}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, projectId: e.target.value })}
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    required
                                    className="input"
                                    value={budgetForm.category}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {['Supplies', 'Transport', 'Venue', 'Food & Beverage', 'Marketing', 'Equipment', 'Other'].map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="input"
                                    placeholder="0.00"
                                    value={budgetForm.amount}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Budget item details"
                                    value={budgetForm.description}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <button type="submit" className="btn btn-primary">
                                    Add to Budget
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projected Expenses</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.filter(r => r.status === 'projected').map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.project?.title || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                                ${record.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    Projected
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.filter(r => r.status === 'projected').length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-4 text-gray-500">No projected expenses found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
