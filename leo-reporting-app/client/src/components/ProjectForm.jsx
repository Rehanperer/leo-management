import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        financialDetails: {
            income: [],
            expenses: []
        }
    });
    const [files, setFiles] = useState({
        projectImages: [],
        dulyFilledProjectReport: null
    });
    const [receipts, setReceipts] = useState({}); // Map of key (e.g., income_0) to File
    const [pdfTheme, setPdfTheme] = useState({
        headerColor: '#2980b9',
        textColor: '#000000',
        backgroundColor: '#ffffff'
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
        if (fieldName === 'dulyFilledProjectReport') {
            setFiles({ ...files, [fieldName]: e.target.files[0] });
        } else {
            setFiles({ ...files, [fieldName]: Array.from(e.target.files) });
        }
    };

    const addFinancialEntry = (type) => {
        const newEntry = { description: '', amount: 0, receiptPath: '' };
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

    const handleReceiptChange = (type, index, file) => {
        setReceipts(prev => ({
            ...prev,
            [`${type}_${index}`]: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();

        // Append all text fields
        Object.keys(project).forEach(key => {
            if (key === 'financialDetails') {
                formData.append(key, JSON.stringify(project[key]));
            } else {
                formData.append(key, project[key]);
            }
        });

        // Append project files
        if (files.projectImages) {
            Array.from(files.projectImages).forEach(file => {
                formData.append('projectImages', file);
            });
        }
        if (files.dulyFilledProjectReport) {
            formData.append('dulyFilledProjectReport', files.dulyFilledProjectReport);
        }

        // Append receipts
        Object.keys(receipts).forEach(key => {
            if (receipts[key]) {
                formData.append(`receipt_${key}`, receipts[key]);
            }
        });

        try {
            if (id) {
                await projects.update(id, formData);
            } else {
                await projects.create(formData);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project');
        } finally {
            setLoading(false);
        }
    };


    const testPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text("Hello World", 10, 10);
            doc.save("test.pdf");
            alert("Test PDF generated!");
        } catch (error) {
            alert("Test PDF failed: " + error.message);
        }
    };

    const generatePDF = async () => {
        try {
            // alert('Starting PDF generation...');
            const doc = new jsPDF();
            // alert('Document created');

            // Set background color if not white
            if (pdfTheme.backgroundColor !== '#ffffff') {
                doc.setFillColor(pdfTheme.backgroundColor);
                doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
            }

            // Header
            doc.setFontSize(20);
            doc.setTextColor(pdfTheme.textColor);
            doc.setFont('helvetica', 'bold');
            doc.text('PROJECT REPORT', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

            let yPos = 38;

            // Helper for hex to rgb
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? [
                    parseInt(result[1], 16),
                    parseInt(result[2], 16),
                    parseInt(result[3], 16)
                ] : [0, 0, 0];
            };

            const headerColor = hexToRgb(pdfTheme.headerColor);
            const textColor = hexToRgb(pdfTheme.textColor);

            // Project Information Table
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(pdfTheme.textColor);
            doc.text('Project Information', 14, yPos);
            yPos += 2;

            autoTable(doc, {
                startY: yPos,
                head: [['Field', 'Details']],
                body: [
                    ['Project Title', project.projectTitle || 'N/A'],
                    ['Categories', project.projectCategories || 'N/A'],
                    ['Venue', project.venue || 'N/A'],
                    ['Date', project.date || 'N/A'],
                ],
                theme: 'grid',
                headStyles: { fillColor: headerColor, fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: textColor },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            // Community Details Table
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Community Details', 14, yPos);
            yPos += 2;

            autoTable(doc, {
                startY: yPos,
                head: [['Aspect', 'Description']],
                body: [
                    ['Benefiting Community', project.benefitingCommunity || 'N/A'],
                    ['Identified Need', project.identifiedNeed || 'N/A'],
                    ['Service Opportunity', project.serviceOpportunity || 'N/A'],
                    ['Mode of Data Collection', project.modeOfDataCollection || 'N/A'],
                ],
                theme: 'grid',
                headStyles: { fillColor: headerColor, fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: textColor },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            // Project Leaders Table  
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Project Leadership', 14, yPos);
            yPos += 2;

            autoTable(doc, {
                startY: yPos,
                head: [['Position', 'Name']],
                body: [
                    ['Project Chairman', project.chairman || 'N/A'],
                    ['Project Secretary', project.secretary || 'N/A'],
                    ['Project Treasurer', project.treasurer || 'N/A'],
                ],
                theme: 'grid',
                headStyles: { fillColor: headerColor, fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: textColor },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            // Project Metrics Table
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Project Metrics', 14, yPos);
            yPos += 2;

            autoTable(doc, {
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
                headStyles: { fillColor: headerColor, fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: textColor },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            // Project Description
            if (yPos > 240) {
                doc.addPage();
                if (pdfTheme.backgroundColor !== '#ffffff') {
                    doc.setFillColor(pdfTheme.backgroundColor);
                    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                }
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Project Objective & Description', 14, yPos);
            yPos += 2;

            autoTable(doc, {
                startY: yPos,
                head: [['Section', 'Content']],
                body: [
                    ['Objective', project.objective || 'N/A'],
                    ['Description', project.description || 'N/A'],
                ],
                theme: 'grid',
                headStyles: { fillColor: headerColor, fontStyle: 'bold' },
                styles: { fontSize: 10, textColor: textColor },
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
                    if (pdfTheme.backgroundColor !== '#ffffff') {
                        doc.setFillColor(pdfTheme.backgroundColor);
                        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                    }
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

                    autoTable(doc, {
                        startY: yPos,
                        head: [['Income Description', 'Amount']],
                        body: incomeRows,
                        theme: 'striped',
                        headStyles: { fillColor: [39, 174, 96], fontStyle: 'bold' },
                        styles: { fontSize: 10, textColor: textColor },
                        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                        footStyles: { fillColor: [39, 174, 96], fontStyle: 'bold' }
                    });

                    yPos = doc.lastAutoTable.finalY + 8;
                }

                // Expenses Table
                if (project.financialDetails.expenses.length > 0) {
                    if (yPos > 220) {
                        doc.addPage();
                        if (pdfTheme.backgroundColor !== '#ffffff') {
                            doc.setFillColor(pdfTheme.backgroundColor);
                            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                        }
                        yPos = 20;
                    }

                    const expenseRows = project.financialDetails.expenses.map(entry => [
                        entry.description,
                        `$${parseFloat(entry.amount || 0).toFixed(2)}`
                    ]);
                    const totalExpense = project.financialDetails.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                    expenseRows.push(['TOTAL EXPENSES', `$${totalExpense.toFixed(2)}`]);

                    autoTable(doc, {
                        startY: yPos,
                        head: [['Expense Description', 'Amount']],
                        body: expenseRows,
                        theme: 'striped',
                        headStyles: { fillColor: [231, 76, 60], fontStyle: 'bold' },
                        styles: { fontSize: 10, textColor: textColor },
                        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                        footStyles: { fillColor: [231, 76, 60], fontStyle: 'bold' }
                    });
                }
            }

            // Embed Project Photos
            if (project.projectImages && project.projectImages.length > 0) {
                doc.addPage();
                if (pdfTheme.backgroundColor !== '#ffffff') {
                    doc.setFillColor(pdfTheme.backgroundColor);
                    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                }
                yPos = 20;
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Project Photos', 14, yPos);
                yPos += 10;

                for (const imgName of project.projectImages) {
                    if (yPos > 200) {
                        doc.addPage();
                        if (pdfTheme.backgroundColor !== '#ffffff') {
                            doc.setFillColor(pdfTheme.backgroundColor);
                            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                        }
                        yPos = 20;
                    }
                    try {
                        const imgUrl = `http://localhost:5001/uploads/${imgName}`;
                        // Fetch image and convert to base64
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        const base64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });

                        doc.addImage(base64, 'JPEG', 15, yPos, 80, 60);
                        yPos += 70;
                    } catch (e) {
                        console.error('Error adding image:', e);
                    }
                }
            }

            // Embed Financial Receipts
            const receiptsToPrint = [];

            project.financialDetails.income.forEach((item, idx) => {
                if (item.receiptPath) receiptsToPrint.push({ type: 'Income', desc: item.description, path: item.receiptPath });
            });
            project.financialDetails.expenses.forEach((item, idx) => {
                if (item.receiptPath) receiptsToPrint.push({ type: 'Expense', desc: item.description, path: item.receiptPath });
            });

            if (receiptsToPrint.length > 0) {
                doc.addPage();
                if (pdfTheme.backgroundColor !== '#ffffff') {
                    doc.setFillColor(pdfTheme.backgroundColor);
                    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                }
                yPos = 20;
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Financial Receipts', 14, yPos);
                yPos += 10;

                for (const receipt of receiptsToPrint) {
                    if (yPos > 200) {
                        doc.addPage();
                        if (pdfTheme.backgroundColor !== '#ffffff') {
                            doc.setFillColor(pdfTheme.backgroundColor);
                            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                        }
                        yPos = 20;
                    }
                    try {
                        doc.setFontSize(10);
                        doc.text(`${receipt.type}: ${receipt.desc}`, 15, yPos - 2);

                        const imgUrl = `http://localhost:5001/uploads/${receipt.path}`;
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        const base64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });

                        doc.addImage(base64, 'JPEG', 15, yPos, 80, 60);
                        yPos += 75;
                    } catch (e) {
                        console.error('Error adding receipt:', e);
                    }
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
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        }
    };

    const renderFinancialInputs = (type) => (
        <div className="space-y-2">
            <h3 className="font-semibold capitalize">{type}</h3>
            {project.financialDetails[type].map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                    <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateFinancialEntry(type, index, 'description', e.target.value)}
                        className="flex-1 p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateFinancialEntry(type, index, 'amount', e.target.value)}
                        className="w-32 p-2 border rounded"
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Receipt</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleReceiptChange(type, index, e.target.files[0])}
                            className="w-48 text-sm"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => removeFinancialEntry(type, index)}
                        className="p-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addFinancialEntry(type)}
                className="text-sm text-blue-600 hover:text-blue-800"
            >
                + Add {type}
            </button>
        </div>
    );

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
                                {renderFinancialInputs('income')}
                            </div>

                            {/* Expenses */}
                            <div className="mb-6">
                                {renderFinancialInputs('expenses')}
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

                        {/* PDF Customization */}
                        <div className="border-t pt-4 mt-6">
                            <h3 className="text-lg font-semibold mb-4">PDF Customization</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={pdfTheme.headerColor}
                                            onChange={(e) => setPdfTheme({ ...pdfTheme, headerColor: e.target.value })}
                                            className="h-8 w-16 cursor-pointer border rounded"
                                        />
                                        <span className="text-sm text-gray-500">{pdfTheme.headerColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={pdfTheme.textColor}
                                            onChange={(e) => setPdfTheme({ ...pdfTheme, textColor: e.target.value })}
                                            className="h-8 w-16 cursor-pointer border rounded"
                                        />
                                        <span className="text-sm text-gray-500">{pdfTheme.textColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={pdfTheme.backgroundColor}
                                            onChange={(e) => setPdfTheme({ ...pdfTheme, backgroundColor: e.target.value })}
                                            className="h-8 w-16 cursor-pointer border rounded"
                                        />
                                        <span className="text-sm text-gray-500">{pdfTheme.backgroundColor}</span>
                                    </div>
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
                            <button
                                type="button"
                                onClick={testPDF}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Test PDF
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProjectForm;
