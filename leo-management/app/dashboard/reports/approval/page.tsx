'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function ApprovalDocsPage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [documentType, setDocumentType] = useState('');
    const [formData, setFormData] = useState({
        clubName: '',
        districtName: '',
        projectName: '',
        date: new Date().toISOString().split('T')[0],

        // Specific fields
        externalOrgName: '',
        interDistrictClubName: '',
        multipleDistrictDetails: '',

        // Common fields likely needed
        projectChairperson: '',
        presidentName: '',
        secretaryName: '',

        // Extended fields for External Org
        externalOrgAddress: '',
        personInChargeName: '',
        personInChargeDesignation: '',
        personInChargeContact: '',
        personInChargeEmail: '',
        leoAdvisorName: '',
        leoAdvisorLionsClub: '',
        projectDescription: '',
        leoClubContribution: '',
        externalOrgContribution: '',
        leoLogoUsed: 'NO',
        leoLogoUsageDescription: '',
        otherOrganizations: '',
        otherLeoClubs: '',
        presidentMylciId: '',
        projectChairmanMylciId: '',
        projectChairmanContact: '',
        projectChairmanEmail: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'documentType') {
            setDocumentType(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleGenerate = async () => {
        if (!documentType) return;

        setIsGenerating(true);

        try {
            const response = await fetch('/api/reports/approval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentType,
                    ...formData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.explanation || errorData.details || 'Failed to generate document');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${documentType}_approval_${formData.date}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error generating document:', error);
            alert('Failed to generate document. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

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
                            <h1 className="text-2xl font-bold text-gradient-leo">Approval Documents</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Approval Form</h2>
                        <p className="text-gray-600">Select the type of approval document you need and fill in the details.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Document Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                            <select
                                name="documentType"
                                value={documentType}
                                onChange={handleInputChange}
                                className="input"
                                required
                            >
                                <option value="">Select Document Type</option>
                                <option value="external-org">Projects with Outside Organization</option>
                                <option value="inter-district">Projects with Inter-District Leo Clubs</option>
                                <option value="multiple-district">Projects on Behalf of Multiple District</option>
                            </select>
                        </div>

                        {documentType && (
                            <div className="space-y-6 animate-slide-down">
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">District Name *</label>
                                            <input
                                                type="text"
                                                name="districtName"
                                                value={formData.districtName}
                                                onChange={handleInputChange}
                                                className="input"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                                            <input
                                                type="text"
                                                name="projectName"
                                                value={formData.projectName}
                                                onChange={handleInputChange}
                                                className="input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
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

                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> After downloading, you can rename the file to your preferred name and ensure it has the <code className="bg-blue-100 px-1 rounded">.docx</code> extension.
                                        </p>
                                    </div>
                                </div>

                                {/* Conditional Fields */}
                                {documentType === 'external-org' && (
                                    <>
                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">External Organization Name *</label>
                                                    <input
                                                        type="text"
                                                        name="externalOrgName"
                                                        value={formData.externalOrgName}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                        placeholder="e.g. Red Cross, Local School"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Address</label>
                                                    <input
                                                        type="text"
                                                        name="externalOrgAddress"
                                                        value={formData.externalOrgAddress}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                        placeholder="Full address"
                                                    />
                                                </div>
                                            </div>

                                            <h4 className="text-md font-medium text-gray-800 mt-4 mb-3">Person in Charge</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        name="personInChargeName"
                                                        value={formData.personInChargeName}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                                    <input
                                                        type="text"
                                                        name="personInChargeDesignation"
                                                        value={formData.personInChargeDesignation}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                                    <input
                                                        type="text"
                                                        name="personInChargeContact"
                                                        value={formData.personInChargeContact}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="personInChargeEmail"
                                                        value={formData.personInChargeEmail}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Project Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
                                                    <textarea
                                                        name="projectDescription"
                                                        value={formData.projectDescription}
                                                        onChange={handleInputChange}
                                                        className="input min-h-[100px]"
                                                        placeholder="Brief description of the project..."
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Leo Club Contribution/Work Expected *</label>
                                                    <textarea
                                                        name="leoClubContribution"
                                                        value={formData.leoClubContribution}
                                                        onChange={handleInputChange}
                                                        className="input min-h-[100px]"
                                                        placeholder="Describe the work expected to be delivered by the Leo club..."
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Will Leo Logo be used? *</label>
                                                        <select
                                                            name="leoLogoUsed"
                                                            value={formData.leoLogoUsed}
                                                            onChange={handleInputChange}
                                                            className="input"
                                                        >
                                                            <option value="NO">NO</option>
                                                            <option value="YES">YES</option>
                                                        </select>
                                                    </div>
                                                    {formData.leoLogoUsed === 'YES' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Usage Description *</label>
                                                            <input
                                                                type="text"
                                                                name="leoLogoUsageDescription"
                                                                value={formData.leoLogoUsageDescription}
                                                                onChange={handleInputChange}
                                                                className="input"
                                                                placeholder="How will the logo be used?"
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contribution/Work Expected by Outside Organization *</label>
                                                    <textarea
                                                        name="externalOrgContribution"
                                                        value={formData.externalOrgContribution}
                                                        onChange={handleInputChange}
                                                        className="input min-h-[100px]"
                                                        placeholder="Describe the work expected to be delivered by the outside organization..."
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Other Outside Organizations (if any)</label>
                                                        <input
                                                            type="text"
                                                            name="otherOrganizations"
                                                            value={formData.otherOrganizations}
                                                            onChange={handleInputChange}
                                                            className="input"
                                                            placeholder="Names of other organizations"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Other Leo Clubs (if any)</label>
                                                        <input
                                                            type="text"
                                                            name="otherLeoClubs"
                                                            value={formData.otherLeoClubs}
                                                            onChange={handleInputChange}
                                                            className="input"
                                                            placeholder="Names of other organizing clubs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leo Advisor Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Leo Advisor Name</label>
                                                    <input
                                                        type="text"
                                                        name="leoAdvisorName"
                                                        value={formData.leoAdvisorName}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lions Club of Leo Advisor</label>
                                                    <input
                                                        type="text"
                                                        name="leoAdvisorLionsClub"
                                                        value={formData.leoAdvisorLionsClub}
                                                        onChange={handleInputChange}
                                                        className="input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {documentType === 'inter-district' && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inter-District Details</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Leo Club Name *</label>
                                            <input
                                                type="text"
                                                name="interDistrictClubName"
                                                value={formData.interDistrictClubName}
                                                onChange={handleInputChange}
                                                className="input"
                                                placeholder="e.g. Leo Club of Colombo"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {documentType === 'multiple-district' && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Multiple District Details</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Details/Context *</label>
                                            <input
                                                type="text"
                                                name="multipleDistrictDetails"
                                                value={formData.multipleDistrictDetails}
                                                onChange={handleInputChange}
                                                className="input"
                                                placeholder="Specific details about the MD project..."
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Signatories */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Signatories & IDs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Chairperson</label>
                                            <input
                                                type="text"
                                                name="projectChairperson"
                                                value={formData.projectChairperson}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson MYLCI ID</label>
                                            <input
                                                type="text"
                                                name="projectChairmanMylciId"
                                                value={formData.projectChairmanMylciId}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson Contact</label>
                                            <input
                                                type="text"
                                                name="projectChairmanContact"
                                                value={formData.projectChairmanContact}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson Email</label>
                                            <input
                                                type="email"
                                                name="projectChairmanEmail"
                                                value={formData.projectChairmanEmail}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Club President</label>
                                            <input
                                                type="text"
                                                name="presidentName"
                                                value={formData.presidentName}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">President MYLCI ID</label>
                                            <input
                                                type="text"
                                                name="presidentMylciId"
                                                value={formData.presidentMylciId}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Club Secretary</label>
                                            <input
                                                type="text"
                                                name="secretaryName"
                                                value={formData.secretaryName}
                                                onChange={handleInputChange}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <div className="border-t pt-6 flex justify-end">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !formData.clubName || !formData.projectName}
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
                                                Generate Document
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
