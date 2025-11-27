import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { financial } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function FinancialForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        incomeEntries: [],
        expenseEntries: []
    });

    useEffect(() => {
        if (id) {
            fetchReport();
        }
    }, [id]);

    const fetchReport = async () => {
        try {
            const response = await financial.getOne(id);
            setReport(response.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        }
    };

    const addEntry = (type) => {
        const newEntry = { description: '', amount: 0 };
        setReport({
            ...report,
            [`${type}Entries`]: [...report[`${type}Entries`], newEntry]
        });
    };

    const updateEntry = (type, index, field, value) => {
        const entries = [...report[`${type}Entries`]];
        entries[index][field] = value;
        setReport({ ...report, [`${type}Entries`]: entries });
    };

    const removeEntry = (type, index) => {
        const entries = report[`${type}Entries`].filter((_, i) => i !== index);
        setReport({ ...report, [`${type}Entries`]: entries });
    };

    const calculateTotals = () => {
        const totalIncome = report.incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const totalExpense = report.expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await financial.update(id, report);
            } else {
                await financial.create(report);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to save report:', error);
            alert('Failed to save report');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const { totalIncome, totalExpense, balance } = calculateTotals();
        const monthName = new Date(report.year, report.month - 1).toLocaleString('default', { month: 'long' });

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('MONTHLY FINANCIAL REPORT', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`${monthName} ${report.year}`, 105, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });

        let yPos = 50;

        // Income Table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Income', 14, yPos);
        yPos += 2;

        const incomeRows = report.incomeEntries.length > 0
            ? report.incomeEntries.map(entry => [
                entry.description || 'N/A',
                `$${parseFloat(entry.amount || 0).toFixed(2)}`
            ])
            : [['No income entries', '-']];

        doc.autoTable({
            startY: yPos,
            head: [['Description', 'Amount']],
            body: incomeRows,
            foot: [['TOTAL INCOME', `$${totalIncome.toFixed(2)}`]],
            theme: 'striped',
            headStyles: {
                fillColor: [39, 174, 96],
                fontStyle: 'bold',
                fontSize: 11
            },
            footStyles: {
                fillColor: [39, 174, 96],
                fontStyle: 'bold',
                fontSize: 11,
                halign: 'right'
            },
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 130 },
                1: { halign: 'right', cellWidth: 60 }
            }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Expenses Table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Expenses', 14, yPos);
        yPos += 2;

        const expenseRows = report.expenseEntries.length > 0
            ? report.expenseEntries.map(entry => [
                entry.description || 'N/A',
                `$${parseFloat(entry.amount || 0).toFixed(2)}`
            ])
            : [['No expense entries', '-']];

        doc.autoTable({
            startY: yPos,
            head: [['Description', 'Amount']],
            body: expenseRows,
            foot: [['TOTAL EXPENSES', `$${totalExpense.toFixed(2)}`]],
            theme: 'striped',
            headStyles: {
                fillColor: [231, 76, 60],
                fontStyle: 'bold',
                fontSize: 11
            },
            footStyles: {
                fillColor: [231, 76, 60],
                fontStyle: 'bold',
                fontSize: 11,
                halign: 'right'
            },
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 130 },
                1: { halign: 'right', cellWidth: 60 }
            }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Summary Table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Financial Summary', 14, yPos);
        yPos += 2;

        const balanceColor = balance >= 0 ? [46, 204, 113] : [231, 76, 60];
        const balanceStatus = balance >= 0 ? 'SURPLUS' : 'DEFICIT';

        doc.autoTable({
            startY: yPos,
            body: [
                ['Total Income', `$${totalIncome.toFixed(2)}`],
                ['Total Expenses', `$${totalExpense.toFixed(2)}`],
                [{
                    content: `Net Balance (${balanceStatus})`,
                    styles: { fontStyle: 'bold', fontSize: 12 }
                }, {
                    content: `$${Math.abs(balance).toFixed(2)}`,
                    styles: {
                        fontStyle: 'bold',
                        fontSize: 12,
                        textColor: balanceColor
                    }
                }]
            ],
            theme: 'grid',
            styles: { fontSize: 11 },
            columnStyles: {
                0: { cellWidth: 130, fontStyle: 'bold' },
                1: { halign: 'right', cellWidth: 60, fontStyle: 'bold' }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Financial Report - ${monthName} ${report.year}`, 14, 285);
        }

        doc.save(`Financial_Report_${monthName}_${report.year}.pdf`);
    };

    const { totalIncome, totalExpense, balance } = calculateTotals();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {id ? 'Edit Financial Report' : 'New Financial Report'}
                        </h1>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Back
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Month and Year */}
                        <div className="grid md:grid-cols-2 gap-4 border-b pb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                                <select
                                    value={report.month}
                                    onChange={(e) => setReport({ ...report, month: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                                <input
                                    type="number"
                                    value={report.year}
                                    onChange={(e) => setReport({ ...report, year: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Income Entries */}
                        <div className="border-b pb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">Income</h2>
                                <button
                                    type="button"
                                    onClick={() => addEntry('income')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    + Add Income
                                </button>
                            </div>
                            <div className="space-y-3">
                                {report.incomeEntries.map((entry, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={entry.description}
                                            onChange={(e) => updateEntry('income', index, 'description', e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Amount"
                                            value={entry.amount}
                                            onChange={(e) => updateEntry('income', index, 'amount', e.target.value)}
                                            className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEntry('income', index)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {report.incomeEntries.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No income entries yet</p>
                                )}
                            </div>
                        </div>

                        {/* Expense Entries */}
                        <div className="border-b pb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">Expenses</h2>
                                <button
                                    type="button"
                                    onClick={() => addEntry('expense')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                >
                                    + Add Expense
                                </button>
                            </div>
                            <div className="space-y-3">
                                {report.expenseEntries.map((entry, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={entry.description}
                                            onChange={(e) => updateEntry('expense', index, 'description', e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Amount"
                                            value={entry.amount}
                                            onChange={(e) => updateEntry('expense', index, 'amount', e.target.value)}
                                            className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEntry('expense', index)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {report.expenseEntries.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No expense entries yet</p>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Total Income:</span>
                                    <span className="font-semibold text-green-600">${totalIncome.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Total Expenses:</span>
                                    <span className="font-semibold text-red-600">${totalExpense.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg border-t pt-2">
                                    <span className="font-bold text-gray-800">Balance:</span>
                                    <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${balance.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Report'}
                            </button>
                            {id && (
                                <button
                                    type="button"
                                    onClick={generatePDF}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                                >
                                    Download PDF
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default FinancialForm;
