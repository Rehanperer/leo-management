import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState({
        projectTitle: '',
        projectCategories: '',
        venue: '',
        date: '',
        benefitingCommunity: '',
        identifiedNeed: '',
        serviceOpportunity: '',
        modeOfDataCollection: '',
        chairman: '',
        secretary: '',
        treasurer: '',
        beneficiariesCount: '',
        projectValue: '',
        modeOfFundsRaised: '',
        participants: '',
        serviceHours: '',
        objective: '',
        description: '',
        financialDetails: { income: [], expenses: [] }
    });

    const [files, setFiles] = useState({
        projectImages: [],
        projectFlyers: [],
        attendanceProof: [],
        prProof: [],
        expenseProof: []
    });

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await projects.getOne(id);
            setProject(response.data);
        } catch (error) {
            console.error('Failed to fetch project:', error);
        }
    };

    const handleChange = (e) => {
        setProject({ ...project, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, fieldName) => {
        setFiles({ ...files, [fieldName]: Array.from(e.target.files) });
    };

    const addFinancialEntry = (type) => {
        const newEntry = { description: '', amount: 0 };
        setProject({
            ...project,
            financialDetails: {
                ...project.financialDetails,
                [type]: [...project.financialDetails[type], newEntry]
            }
        });
    };

    const updateFinancialEntry = (type, index, field, value) => {
        const updated = [...project.financialDetails[type]];
        updated[index][field] = value;
        setProject({
            ...project,
            financialDetails: {
                ...project.financialDetails,
                [type]: updated
            }
        });
    };

    const removeFinancialEntry = (type, index) => {
        const updated = project.financialDetails[type].filter((_, i) => i !== index);
        setProject({
            ...project,
            financialDetails: {
                ...project.financialDetails,
                [type]: updated
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            // Append project data
            Object.keys(project).forEach((key) => {
                if (key === 'financialDetails') {
                    formData.append(key, JSON.stringify(project[key]));
                } else {
                    formData.append(key, project[key]);
                }
            });

            // Append files
            Object.keys(files).forEach((key) => {
                files[key].forEach((file) => {
                    formData.append(key, file);
                });
            });

            if (id) {
                await projects.update(id, formData);
            } else {
                await projects.create(formData);
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to save project:', error);
            alert('Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT REPORT', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

        let yPos = 38;

        // Project Information Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Information', 14, yPos);
        yPos += 2;

        doc.autoTable({
            startY: yPos,
            head: [['Field', 'Details']],
            body: [
                ['Project Title', project.projectTitle || 'N/A'],
                ['Categories', project.projectCategories || 'N/A'],
                ['Venue', project.venue || 'N/A'],
                ['Date', project.date || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Community Details Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Community Details', 14, yPos);
        yPos += 2;

        doc.autoTable({
            startY: yPos,
            head: [['Aspect', 'Description']],
            body: [
                ['Benefiting Community', project.benefitingCommunity || 'N/A'],
                ['Identified Need', project.identifiedNeed || 'N/A'],
                ['Service Opportunity', project.serviceOpportunity || 'N/A'],
                ['Mode of Data Collection', project.modeOfDataCollection || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Project Leaders Table  
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Leadership', 14, yPos);
        yPos += 2;

        doc.autoTable({
            startY: yPos,
            head: [['Position', 'Name']],
            body: [
                ['Project Chairman', project.chairman || 'N/A'],
                ['Project Secretary', project.secretary || 'N/A'],
                ['Project Treasurer', project.treasurer || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [46, 204, 113], fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Project Metrics Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Metrics', 14, yPos);
        yPos += 2;

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['No. of Beneficiaries', project.beneficiariesCount || 'N/A'],
                ['Project Value', project.projectValue ? `$${project.projectValue}` : 'N/A'],
                ['Mode of Funds Raised', project.modeOfFundsRaised || 'N/A'],
                ['Participants', project.participants || 'N/A'],
                ['Service Hours', project.serviceHours || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [155, 89, 182], fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Project Description
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Objective & Description', 14, yPos);
        yPos += 2;

        doc.autoTable({
            startY: yPos,
            head: [['Section', 'Content']],
            body: [
                ['Objective', project.objective || 'N/A'],
                ['Description', project.description || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [230, 126, 34], fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                1: { cellWidth: 142 }
            }
        });

        // Financial Details
        if (project.financialDetails.income.length > 0 || project.financialDetails.expenses.length > 0) {
            yPos = doc.lastAutoTable.finalY + 10;

            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Financial Report', 14, yPos);
            yPos += 2;

            // Income Table
            if (project.financialDetails.income.length > 0) {
                const incomeRows = project.financialDetails.income.map(entry => [
                    entry.description,
                    `$${parseFloat(entry.amount || 0).toFixed(2)}`
                ]);
                const totalIncome = project.financialDetails.income.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                incomeRows.push(['TOTAL INCOME', `$${totalIncome.toFixed(2)}`]);

                doc.autoTable({
                    startY: yPos,
                    head: [['Income Description', 'Amount']],
                    body: incomeRows,
                    theme: 'striped',
                    headStyles: { fillColor: [39, 174, 96], fontStyle: 'bold' },
                    styles: { fontSize: 10 },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    footStyles: { fillColor: [39, 174, 96], fontStyle: 'bold' }
                });

                yPos = doc.lastAutoTable.finalY + 8;
            }

            // Expenses Table
            if (project.financialDetails.expenses.length > 0) {
                if (yPos > 220) {
                    doc.addPage();
                    yPos = 20;
                }

                const expenseRows = project.financialDetails.expenses.map(entry => [
                    entry.description,
                    `$${parseFloat(entry.amount || 0).toFixed(2)}`
                ]);
                const totalExpense = project.financialDetails.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                expenseRows.push(['TOTAL EXPENSES', `$${totalExpense.toFixed(2)}`]);

                doc.autoTable({
                    startY: yPos,
                    head: [['Expense Description', 'Amount']],
                    body: expenseRows,
                    theme: 'striped',
                    headStyles: { fillColor: [231, 76, 60], fontStyle: 'bold' },
                    styles: { fontSize: 10 },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    footStyles: { fillColor: [231, 76, 60], fontStyle: 'bold' }
                });
            }
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`${project.projectTitle || 'Project Report'}`, 14, 285);
        }

        doc.save(`${project.projectTitle || 'Project'}_Report.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {id ? 'Edit Project Report' : 'New Project Report'}
                        </h1>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Back
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                                    <input
                                        type="text"
                                        name="projectTitle"
                                        value={project.projectTitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                                    <input
                                        type="text"
                                        name="projectCategories"
                                        value={project.projectCategories}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                                    <input
                                        type="text"
                                        name="venue"
                                        value={project.venue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={project.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Community Details */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Community Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Benefiting Community</label>
                                    <textarea
                                        name="benefitingCommunity"
                                        value={project.benefitingCommunity}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Identified Need</label>
                                    <textarea
                                        name="identifiedNeed"
                                        value={project.identifiedNeed}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Opportunity</label>
                                    <textarea
                                        name="serviceOpportunity"
                                        value={project.serviceOpportunity}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Data Collection</label>
                                    <input
                                        type="text"
                                        name="modeOfDataCollection"
                                        value={project.modeOfDataCollection}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Leaders */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Project Leaders</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chairman</label>
                                    <input
                                        type="text"
                                        name="chairman"
                                        value={project.chairman}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Secretary</label>
                                    <input
                                        type="text"
                                        name="secretary"
                                        value={project.secretary}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Treasurer</label>
                                    <input
                                        type="text"
                                        name="treasurer"
                                        value={project.treasurer}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Metrics */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Project Metrics</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiaries Count</label>
                                    <input
                                        type="number"
                                        name="beneficiariesCount"
                                        value={project.beneficiariesCount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Value ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="projectValue"
                                        value={project.projectValue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Funds Raised</label>
                                    <input
                                        type="text"
                                        name="modeOfFundsRaised"
                                        value={project.modeOfFundsRaised}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                                    <input
                                        type="number"
                                        name="participants"
                                        value={project.participants}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Hours</label>
                                    <input
                                        type="number"
                                        name="serviceHours"
                                        value={project.serviceHours}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Project Description</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
                                    <textarea
                                        name="objective"
                                        value={project.objective}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={project.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financial Details */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Details</h2>

                            {/* Income */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">Income</label>
                                    <button
                                        type="button"
                                        onClick={() => addFinancialEntry('income')}
                                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                    >
                                        + Add Income
                                    </button>
                                </div>
                                {project.financialDetails.income.map((entry, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={entry.description}
                                            onChange={(e) => updateFinancialEntry('income', index, 'description', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Amount"
                                            value={entry.amount}
                                            onChange={(e) => updateFinancialEntry('income', index, 'amount', e.target.value)}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFinancialEntry('income', index)}
                                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Expenses */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">Expenses</label>
                                    <button
                                        type="button"
                                        onClick={() => addFinancialEntry('expenses')}
                                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        + Add Expense
                                    </button>
                                </div>
                                {project.financialDetails.expenses.map((entry, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={entry.description}
                                            onChange={(e) => updateFinancialEntry('expenses', index, 'description', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Amount"
                                            value={entry.amount}
                                            onChange={(e) => updateFinancialEntry('expenses', index, 'amount', e.target.value)}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFinancialEntry('expenses', index)}
                                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">File Uploads</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'projectImages')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Flyers</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileChange(e, 'projectFlyers')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Proof</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileChange(e, 'attendanceProof')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PR Proof (Social Media Posts)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'prProof')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expense/Income Proof (Receipts)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileChange(e, 'expenseProof')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Project'}
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

export default ProjectForm;
