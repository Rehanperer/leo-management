'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Download,
    FileText,
    Folder,
    Search,
    ArrowLeft,
    GraduationCap,
    Award,
    FileCheck,
    DollarSign,
    Users
} from 'lucide-react';

// Actual D2 Resources documents
const categories = [
    {
        id: 'exco-district',
        title: 'Exco: District Information',
        icon: Users,
        color: 'leo',
        description: 'District council details and directory',
        docs: [
            { title: 'D2 Council Details', size: 'XLSX', type: 'Excel', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/D2 District Information/D2 Council Details.xlsx' },
            { title: 'Leo Club Details', size: 'XLSX', type: 'Excel', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/D2 District Information/Leo Club Details.xlsx' },
        ]
    },
    {
        id: 'exco-approvals',
        title: 'Exco: Approval Documents',
        icon: FileCheck,
        color: 'blue',
        description: 'Project approval forms and requests',
        docs: [
            { title: 'Project Approval Form (Inter-District)', size: 'DOCX', type: 'Word', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/Approval Documents/Copy of Project Approval Form 2025-2026 - Projects Done With Inter District Leo Clubs - (Club Name) - (District Name).docx' },
            { title: 'Project Approval Form (Multiple District)', size: 'DOCX', type: 'Word', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/Approval Documents/Copy of Project Approval Form 2025-2026 - Projects Done on Behalf of the Multiple District - (Club Name) - (District Name).docx' },
            { title: 'Project Approval Form (Outside Org)', size: 'DOCX', type: 'Word', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/Approval Documents/Copy of Project Approval form 2025_2026-Projects done with Out Side Organisation- Club Name-District Name.docx' },
            { title: 'Official Request Form', size: 'DOCX', type: 'Word', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/Approval Documents/Copy of Official Request Form for Projects on behalf of Leo District.docx' },
        ]
    },
    {
        id: 'exco-installation',
        title: 'Exco: Installation Docs',
        icon: GraduationCap,
        color: 'indigo',
        description: 'Guides and scripts for club installation',
        docs: [
            { title: 'Leo Club Installation Guide', size: 'PDF', type: 'PDF', date: 'LMD 306', url: '/d2-classroom/Club Exco Essential Pack/Club Installation Documents/6. Leo Club Installation Guide - LMD 306.pdf' },
            { title: 'New Members & Officers Guide', size: 'PDF', type: 'PDF', date: 'Guide', url: '/d2-classroom/Club Exco Essential Pack/Club Installation Documents/7. Leo New Members & Officers Installation Guide.pdf' },
            { title: 'Leo Hierarchy Protocol', size: 'PDF', type: 'PDF', date: 'Protocol', url: '/d2-classroom/Club Exco Essential Pack/Club Installation Documents/Leo Hierarchy Protocol LMD 306.pdf' },
            { title: 'National Anthem of Sri Lanka', size: 'MP3', type: 'Audio', date: 'Audio', url: '/d2-classroom/Club Exco Essential Pack/Club Installation Documents/3. National Anthem of Sri Lanka.mp3' },
        ]
    },
    {
        id: 'exco-logos',
        title: 'Exco: Logos & Emblems',
        icon: Award,
        color: 'orange',
        description: 'Official branding assets',
        docs: [
            { title: 'Leos of Sri Lanka & Maldives', size: 'PNG', type: 'Image', date: 'Logo', url: '/d2-classroom/Club Exco Essential Pack/Official Logos & Emblems/Leos of Sri Lanka & Maldives.png' },
            { title: 'LMD Logo 2025-2026', size: 'PNG', type: 'Image', date: 'Logo', url: '/d2-classroom/Club Exco Essential Pack/Official Logos & Emblems/LMD Logo 2025-2026.png' },
            { title: 'Leo Emblem', size: 'PNG', type: 'Image', date: 'Logo', url: '/d2-classroom/Club Exco Essential Pack/Official Logos & Emblems/Leo Emblem.png' },
            { title: 'Lions Emblem', size: 'PNG', type: 'Image', date: 'Logo', url: '/d2-classroom/Club Exco Essential Pack/Official Logos & Emblems/Lions Emblem.png' },
            { title: 'DP Logo 2025-2026', size: 'PNG', type: 'Image', date: 'Logo', url: '/d2-classroom/Club Exco Essential Pack/Official Logos & Emblems/DP logo - 20252026.png' },
        ]
    },
    {
        id: 'exco-other',
        title: 'Exco: Other Docs',
        icon: Folder,
        color: 'teal',
        description: 'Other essential forms',
        docs: [
            { title: 'Leo Club Officers Report (72 Form)', size: 'PDF', type: 'PDF', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/Other Documents & Applications/Leo Club Officers Report - 72 Form.pdf' },
            { title: 'Serving Together Banner Patch', size: 'PDF', type: 'PDF', date: '2025-2026', url: '/d2-classroom/Club Exco Essential Pack/Other Documents & Applications/Serving Together Banner Patch Application.pdf' },
        ]
    },
    {
        id: 'president',
        title: 'Club Presidents',
        icon: GraduationCap,
        color: 'gold',
        description: 'Resources for Club Presidents',
        docs: [
            { title: 'Awards Attributes 2025-2026', size: 'PDF', type: 'PDF', date: '2025-2026', url: '/d2-classroom/Club Presidents/Awards Attributes of the Leo District 306 D2 2025-2026.pdf' },
        ]
    },
    {
        id: 'secretary',
        title: 'Club Secretaries',
        icon: FileText,
        color: 'purple',
        description: 'Reporting and administrative documents',
        docs: [
            { title: 'Club Activity Report', size: 'DOCX', type: 'Word', date: 'Monthly', url: '/d2-classroom/Club Secretaries /Club Activity Report.docx' },
            { title: 'Project Report Template', size: 'DOCX', type: 'Word', date: 'Per Project', url: '/d2-classroom/Club Secretaries /Project Report.docx' },
            { title: 'District Contest Guidelines', size: 'PDF', type: 'PDF', date: '2025-2026', url: '/d2-classroom/Club Secretaries /District Contest Guideline 2025-2026.pdf' },
            { title: 'Membership Database Template', size: 'XLSX', type: 'Excel', date: 'Monthly', url: '/d2-classroom/Club Secretaries /(Leo Club Name)_Membership Database_(Month-Year).xlsx' },
            { title: 'Secretary Session Handout', size: 'PDF', type: 'PDF', date: 'Training', url: '/d2-classroom/Club Secretaries /Secretary Session Handout.pdf' },
        ]
    },
    {
        id: 'treasurer',
        title: 'Club Treasurers',
        icon: DollarSign,
        color: 'green',
        description: 'Financial reporting and management',
        docs: [
            { title: 'Sample Treasurer Report', size: 'DOCX', type: 'Word', date: 'Monthly', url: '/d2-classroom/Club Treasurers /Sample Treasurer_s Report (D2).docx' },
            { title: 'Sample Treasurer Report (PDF)', size: 'PDF', type: 'PDF', date: 'Reference', url: '/d2-classroom/Club Treasurers /Sample Treasurer_s Report (D2).pdf' },
        ]
    },
    {
        id: 'admin',
        title: 'General Administration',
        icon: Folder,
        color: 'coral',
        description: 'General club administration files',
        docs: [
            { title: 'General Admin Docs', size: 'Folder', type: 'Misc', date: '2025', url: '#' },
        ]
    }
];

export default function ClassroomPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter documents based on search query
    const filteredCategories = categories.map(category => ({
        ...category,
        docs: category.docs.filter(doc =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.docs.length > 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="sticky top-0 z-30 glass border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-leo-500 to-purple-600 rounded-lg shadow-lg animate-scale-in">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-leo-700 to-purple-700 animate-fade-in">
                                D2 Resources
                            </h1>
                        </div>
                    </div>

                    <div className="relative hidden md:block w-64 animate-fade-in">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="input pl-10 bg-white/50 focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-10 animate-slide-up">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">District Resources</h2>
                    <p className="text-gray-600 max-w-2xl">
                        Access comprehensive district resources, essential documents, templates, and official materials for all club positions and activities.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="space-y-12">
                    {filteredCategories.map((category, categoryIndex) => (
                        <section key={category.id} className="animate-slide-up" style={{ animationDelay: `${categoryIndex * 0.1}s` }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg bg-${category.color}-100 text-${category.color}-600`}>
                                    <category.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                                    <p className="text-sm text-gray-500">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.docs.map((doc, docIndex) => (
                                    <div
                                        key={docIndex}
                                        className="card-interactive group bg-white hover:border-leo-300 relative overflow-hidden"
                                    >
                                        {/* Decorative gradient blob */}
                                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${category.color}-50 rounded-full blur-2xl group-hover:bg-${category.color}-100 transition-colors duration-500`} />

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl bg-${category.color}-50 text-${category.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 group-hover:text-leo-700 transition-colors line-clamp-1">
                                                        {doc.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                            {doc.type}
                                                        </span>
                                                        <span>{doc.size}</span>
                                                        <span>• {doc.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between relative z-10">
                                            <button className="text-sm font-medium text-gray-500 group-hover:text-leo-600 transition-colors flex items-center gap-1">
                                                Preview
                                            </button>
                                            <a
                                                href={doc.url}
                                                download
                                                className={`p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-${category.color}-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group/btn`}
                                            >
                                                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
