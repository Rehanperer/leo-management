'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Plus, Trash2, Upload, DollarSign } from 'lucide-react';

interface FinancialItem {
    id: string;
    description: string;
    billNo: string;
    amount: string;
    receipt: File | null;
}

export default function TreasurerReportPage() {
    const [loading, setLoading] = useState(false);

    // Basic Info
    const [projectName, setProjectName] = useState('');
    const [month, setMonth] = useState('January');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [date, setDate] = useState('');
    const [clubName, setClubName] = useState('');
    const [treasurerName, setTreasurerName] = useState('');

    // Financials
    const [incomes, setIncomes] = useState<FinancialItem[]>([
        { id: '1', description: '', billNo: '', amount: '', receipt: null }
    ]);
    const [expenses, setExpenses] = useState<FinancialItem[]>([
        { id: '1', description: '', billNo: '', amount: '', receipt: null }
    ]);

    // Totals
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [surplusDeficit, setSurplusDeficit] = useState(0);

    useEffect(() => {
        const inc = incomes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const exp = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setTotalIncome(inc);
        setTotalExpense(exp);
        setSurplusDeficit(inc - exp);
    }, [incomes, expenses]);

    const addIncome = () => {
        setIncomes([...incomes, { id: Date.now().toString(), description: '', billNo: '', amount: '', receipt: null }]);
    };

    const removeIncome = (index: number) => {
        setIncomes(incomes.filter((_, i) => i !== index));
    };

    const updateIncome = (index: number, field: keyof FinancialItem, value: any) => {
        const newIncomes = [...incomes];
        newIncomes[index] = { ...newIncomes[index], [field]: value };
        setIncomes(newIncomes);
    };

    const addExpense = () => {
        setExpenses([...expenses, { id: Date.now().toString(), description: '', billNo: '', amount: '', receipt: null }]);
    };

    const removeExpense = (index: number) => {
        setExpenses(expenses.filter((_, i) => i !== index));
    };

    const updateExpense = (index: number, field: keyof FinancialItem, value: any) => {
        const newExpenses = [...expenses];
        newExpenses[index] = { ...newExpenses[index], [field]: value };
        setExpenses(newExpenses);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('projectName', projectName);
            formData.append('month', month);
            formData.append('year', year);
            formData.append('date', date);
            formData.append('clubName', clubName);
            formData.append('treasurerName', treasurerName);
            formData.append('totalIncome', totalIncome.toFixed(2));
            formData.append('totalExpense', totalExpense.toFixed(2));
            formData.append('surplusDeficit', surplusDeficit.toFixed(2));

            // Append Incomes
            incomes.forEach((item, index) => {
                formData.append(`income_${index}_description`, item.description);
                formData.append(`income_${index}_billNo`, item.billNo);
                formData.append(`income_${index}_amount`, item.amount);
                if (item.receipt) {
                    formData.append(`income_${index}_receipt`, item.receipt);
                }
            });

            // Append Expenses
            expenses.forEach((item, index) => {
                formData.append(`expense_${index}_description`, item.description);
                formData.append(`expense_${index}_billNo`, item.billNo);
                formData.append(`expense_${index}_amount`, item.amount);
                if (item.receipt) {
                    formData.append(`expense_${index}_receipt`, item.receipt);
                }
            });

            formData.append('incomeCount', incomes.length.toString());
            formData.append('expenseCount', expenses.length.toString());

            const response = await fetch('/api/reports/treasurer', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to generate report');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Treasurer_Report_${projectName}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30 animate-fade-in pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link href="/dashboard/reports" className="inline-flex items-center text-gray-600 hover:text-leo-600 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reports
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Project Treasurer Report</h1>
                    <p className="text-gray-600 mt-2">Generate financial reports with receipts</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-leo-600" />
                            Project Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="label">Project Name</label><input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)} className="input" /></div>
                            <div><label className="label">Club Name</label><input type="text" required value={clubName} onChange={e => setClubName(e.target.value)} className="input" /></div>
                            <div><label className="label">Treasurer's Name</label><input type="text" required value={treasurerName} onChange={e => setTreasurerName(e.target.value)} className="input" /></div>
                            <div>
                                <label className="label">Month</label>
                                <select value={month} onChange={e => setMonth(e.target.value)} className="input">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div><label className="label">Year</label><input type="text" required value={year} onChange={e => setYear(e.target.value)} className="input" /></div>
                            <div><label className="label">Date</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="input" /></div>
                        </div>
                    </div>

                    {/* Income Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-green-700 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Income
                            </h2>
                            <span className="text-lg font-bold text-green-700">Total: {totalIncome.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4">
                            {incomes.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                    <div className="md:col-span-4">
                                        <input placeholder="Description" value={item.description} onChange={e => updateIncome(index, 'description', e.target.value)} className="input" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input placeholder="Bill No" value={item.billNo} onChange={e => updateIncome(index, 'billNo', e.target.value)} className="input" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input type="number" placeholder="Amount" value={item.amount} onChange={e => updateIncome(index, 'amount', e.target.value)} className="input" required />
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => updateIncome(index, 'receipt', e.target.files?.[0] || null)}
                                                className="hidden"
                                                id={`income-receipt-${index}`}
                                            />
                                            <label
                                                htmlFor={`income-receipt-${index}`}
                                                className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${item.receipt ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {item.receipt ? 'Receipt Added' : 'Add Receipt'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pt-2">
                                        <button type="button" onClick={() => removeIncome(index)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addIncome} className="flex items-center text-leo-600 hover:text-leo-700 font-medium">
                                <Plus className="w-4 h-4 mr-2" /> Add Income Item
                            </button>
                        </div>
                    </div>

                    {/* Expense Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-red-700 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Expenses
                            </h2>
                            <span className="text-lg font-bold text-red-700">Total: {totalExpense.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4">
                            {expenses.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                    <div className="md:col-span-4">
                                        <input placeholder="Description" value={item.description} onChange={e => updateExpense(index, 'description', e.target.value)} className="input" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input placeholder="Bill No" value={item.billNo} onChange={e => updateExpense(index, 'billNo', e.target.value)} className="input" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input type="number" placeholder="Amount" value={item.amount} onChange={e => updateExpense(index, 'amount', e.target.value)} className="input" required />
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => updateExpense(index, 'receipt', e.target.files?.[0] || null)}
                                                className="hidden"
                                                id={`expense-receipt-${index}`}
                                            />
                                            <label
                                                htmlFor={`expense-receipt-${index}`}
                                                className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${item.receipt ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {item.receipt ? 'Receipt Added' : 'Add Receipt'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pt-2">
                                        <button type="button" onClick={() => removeExpense(index)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addExpense} className="flex items-center text-leo-600 hover:text-leo-700 font-medium">
                                <Plus className="w-4 h-4 mr-2" /> Add Expense Item
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                            <div className={`text-2xl font-bold ${surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {surplusDeficit >= 0 ? 'Surplus: ' : 'Deficit: '}
                                {Math.abs(surplusDeficit).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-leo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-leo-500/30 hover:shadow-leo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Report</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
