'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FinancialRecord {
    id: string;
    type: string;
    category: string;
    amount: number;
    description: string;
    date: string;
}

export default function FinancialPage() {
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/financial', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRecords(data.records);
            }
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalIncome = records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-leo-600 hover:text-leo-700 font-medium">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Financial Records</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-green-50 border-green-100">
                        <div className="text-sm text-green-600 font-medium">Total Income</div>
                        <div className="text-2xl font-bold text-green-700">${totalIncome.toFixed(2)}</div>
                    </div>
                    <div className="card bg-red-50 border-red-100">
                        <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                        <div className="text-2xl font-bold text-red-700">${totalExpense.toFixed(2)}</div>
                    </div>
                    <div className="card bg-blue-50 border-blue-100">
                        <div className="text-sm text-blue-600 font-medium">Net Balance</div>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                            ${balance.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Records List */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                        <Link href="/dashboard/financial/new" className="btn btn-primary text-sm">
                            + Add Record
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading records...</div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No financial records found.</p>
                            <Link href="/dashboard/financial/new" className="mt-2 text-leo-600 hover:text-leo-700 font-medium inline-block">
                                Create your first record
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{record.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {record.category}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {record.type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
