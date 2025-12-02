'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function TreasurerReportPage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAssets, setShowAssets] = useState(false);
    const [showLiabilities, setShowLiabilities] = useState(false);
    const [formData, setFormData] = useState({
        clubName: '',
        month: '',
        year: new Date().getFullYear().toString(),
        treasurerName: '',
        date: new Date().toISOString().split('T')[0],

        // Basic Summary
        openingBalance: '',
        totalIncome: '',
        totalExpenses: '',
        closingBalance: '',

        // Non-Current Assets
        nonCurrentAssetNote: '',
        fixedDeposits: '',
        totalNonCurrentAssets: '',

        // Current Assets
        accountReceivables: '',
        cashInHand: '',
        bankBalance: '',
        totalCurrentAssets: '',
        totalAssets: '',

        // Accumulated Fund
        accumulatedFundStart: '',
        surplusDeficit: '',
        accumulatedFundEnd: '',

        // Non-Current Liabilities
        loans: '',
        loansCash: '',
        loansBank: '',

        // Current Liabilities
        bankOverDrafts: '',
        creditorsPayables: '',
        totalCurrentLiabilities: '',
        totalLiabilities: '',

        // Details
        incomeDetails: '',
        expenseDetails: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-calculate closing balance
        if (name === 'openingBalance' || name === 'totalIncome' || name === 'totalExpenses') {
            const opening = parseFloat(name === 'openingBalance' ? value : formData.openingBalance) || 0;
            const income = parseFloat(name === 'totalIncome' ? value : formData.totalIncome) || 0;
            const expenses = parseFloat(name === 'totalExpenses' ? value : formData.totalExpenses) || 0;
            const closing = opening + income - expenses;

            setFormData(prev => ({
                ...prev,
                [name]: value,
                closingBalance: closing.toFixed(2)
            }));
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/reports/treasurer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Treasurer_Report_${formData.month}_${formData.year}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30">
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/reports"
                                className="text-gray-600 hover:text-leo-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gradient-leo">Monthly Treasurer's Report</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Information</h2>
                        <p className="text-gray-600">Fill in the details below to generate your monthly treasurer's report.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Club Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
                                <input
                                    type="text"
                                    name="clubName"
                                    value={formData.clubName}
                                    onChange={handleInputChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Treasurer Name *</label>
                                <input
                                    type="text"
                                    name="treasurerName"
                                    value={formData.treasurerName}
                                    onChange={handleInputChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Report Period */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleInputChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Select Month</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className="input"
                                    min="2020"
                                    max="2100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> After downloading, you can rename the file to your preferred name and ensure it has the <code className="bg-blue-100 px-1 rounded">.docx</code> extension.
                            </p>
                        </div>

                        {/* Financial Summary */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-leo-600" />
                                Financial Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance ($) *</label>
                                    <input
                                        type="number"
                                        name="openingBalance"
                                        value={formData.openingBalance}
                                        onChange={handleInputChange}
                                        className="input"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Income ($) *</label>
                                    <input
                                        type="number"
                                        name="totalIncome"
                                        value={formData.totalIncome}
                                        onChange={handleInputChange}
                                        className="input"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Expenses ($) *</label>
                                    <input
                                        type="number"
                                        name="totalExpenses"
                                        value={formData.totalExpenses}
                                        onChange={handleInputChange}
                                        className="input"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Closing Balance ($)</label>
                                    <input
                                        type="number"
                                        name="closingBalance"
                                        value={formData.closingBalance}
                                        className="input bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cash Distribution */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Distribution</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cash in Hand ($)</label>
                                    <input
                                        type="number"
                                        name="cashInHand"
                                        value={formData.cashInHand}
                                        onChange={handleInputChange}
                                        className="input"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Balance ($)</label>
                                    <input
                                        type="number"
                                        name="bankBalance"
                                        value={formData.bankBalance}
                                        onChange={handleInputChange}
                                        className="input"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Balance Sheet - Assets */}
                        <div className="border-t pt-6">
                            <div
                                className="flex justify-between items-center cursor-pointer mb-4"
                                onClick={() => setShowAssets(!showAssets)}
                            >
                                <h3 className="text-lg font-semibold text-gray-900">Balance Sheet - Assets</h3>
                                <button
                                    type="button"
                                    className="text-leo-600 hover:text-leo-700 transition-colors"
                                >
                                    {showAssets ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {showAssets && (
                                <div className="space-y-4 animate-slide-down">
                                    <div className="mb-4">
                                        <h4 className="text-md font-medium text-gray-800 mb-3">Non-Current Assets</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Non-Current Asset Note ($)</label>
                                                <input
                                                    type="number"
                                                    name="nonCurrentAssetNote"
                                                    value={formData.nonCurrentAssetNote}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Deposits ($)</label>
                                                <input
                                                    type="number"
                                                    name="fixedDeposits"
                                                    value={formData.fixedDeposits}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Non-Current Assets ($)</label>
                                                <input
                                                    type="number"
                                                    name="totalNonCurrentAssets"
                                                    value={formData.totalNonCurrentAssets}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-md font-medium text-gray-800 mb-3">Current Assets</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Receivables ($)</label>
                                                <input
                                                    type="number"
                                                    name="accountReceivables"
                                                    value={formData.accountReceivables}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cash and Cash Equivalents ($)</label>
                                                <input
                                                    type="number"
                                                    name="cashInHand"
                                                    value={formData.cashInHand}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Current Assets ($)</label>
                                                <input
                                                    type="number"
                                                    name="totalCurrentAssets"
                                                    value={formData.totalCurrentAssets}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Assets ($)</label>
                                                <input
                                                    type="number"
                                                    name="totalAssets"
                                                    value={formData.totalAssets}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Balance Sheet - Liabilities */}
                        <div className="border-t pt-6">
                            <div
                                className="flex justify-between items-center cursor-pointer mb-4"
                                onClick={() => setShowLiabilities(!showLiabilities)}
                            >
                                <h3 className="text-lg font-semibold text-gray-900">Balance Sheet - Liabilities</h3>
                                <button
                                    type="button"
                                    className="text-leo-600 hover:text-leo-700 transition-colors"
                                >
                                    {showLiabilities ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {showLiabilities && (
                                <div className="space-y-4 animate-slide-down">
                                    <div className="mb-4">
                                        <h4 className="text-md font-medium text-gray-800 mb-3">Accumulated Fund</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Accumulated Fund (Start) ($)</label>
                                                <input
                                                    type="number"
                                                    name="accumulatedFundStart"
                                                    value={formData.accumulatedFundStart}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Surplus/(Deficit) ($)</label>
                                                <input
                                                    type="number"
                                                    name="surplusDeficit"
                                                    value={formData.surplusDeficit}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Accumulated Fund (End) ($)</label>
                                                <input
                                                    type="number"
                                                    name="accumulatedFundEnd"
                                                    value={formData.accumulatedFundEnd}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-md font-medium text-gray-800 mb-3">Non-Current Liabilities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Loans (Cash) ($)</label>
                                                <input
                                                    type="number"
                                                    name="loansCash"
                                                    value={formData.loansCash}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Loans (Bank) ($)</label>
                                                <input
                                                    type="number"
                                                    name="loansBank"
                                                    value={formData.loansBank}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-md font-medium text-gray-800 mb-3">Current Liabilities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Over Drafts ($)</label>
                                                <input
                                                    type="number"
                                                    name="bankOverDrafts"
                                                    value={formData.bankOverDrafts}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Creditors/Payables ($)</label>
                                                <input
                                                    type="number"
                                                    name="creditorsPayables"
                                                    value={formData.creditorsPayables}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Current Liabilities ($)</label>
                                                <input
                                                    type="number"
                                                    name="totalCurrentLiabilities"
                                                    value={formData.totalCurrentLiabilities}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Liabilities ($)</label>
                                                <input
                                                    type="number"
                                                    name="totalLiabilities"
                                                    value={formData.totalLiabilities}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Income Details</label>
                                    <textarea
                                        name="incomeDetails"
                                        value={formData.incomeDetails}
                                        onChange={handleInputChange}
                                        className="input min-h-[100px]"
                                        placeholder="List all income sources and amounts..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Details</label>
                                    <textarea
                                        name="expenseDetails"
                                        value={formData.expenseDetails}
                                        onChange={handleInputChange}
                                        className="input min-h-[100px]"
                                        placeholder="List all expenses and amounts..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="border-t pt-6 flex justify-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !formData.clubName || !formData.month}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
