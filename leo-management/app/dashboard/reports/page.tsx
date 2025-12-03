'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Clock, DollarSign } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-leo-50/30 to-purple-50/30 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-leo-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-600 mt-2">Generate and manage club reports</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Treasurer's Report Card */}
                    <Link
                        href="/dashboard/reports/treasurer"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center group-hover:from-gold-200 group-hover:to-gold-300 transition-all duration-300">
                                <FileText className="w-7 h-7 text-gold-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Treasurer's Report</h3>
                                <p className="text-sm text-gray-600">
                                    Generate monthly financial reports with balance sheet
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Approval Documents Card */}
                    <Link
                        href="/dashboard/reports/approval"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                                <FileText className="w-7 h-7 text-blue-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Approval Documents</h3>
                                <p className="text-sm text-gray-600">
                                    Generate project approval forms for external collaborations
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Activity Report Card */}
                    <Link
                        href="/dashboard/reports/activity"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                                <FileText className="w-7 h-7 text-purple-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Activity Report</h3>
                                <p className="text-sm text-gray-600">
                                    Generate monthly activity reports with project photos
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Agenda Report Card */}
                    <Link
                        href="/dashboard/reports/agenda"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                                <Clock className="w-7 h-7 text-green-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">General Meeting Agenda</h3>
                                <p className="text-sm text-gray-600">
                                    Generate structured meeting agendas with automatic timing
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Script Report Card */}
                    <Link
                        href="/dashboard/reports/script"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                                <FileText className="w-7 h-7 text-indigo-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">General Meeting Script</h3>
                                <p className="text-sm text-gray-600">
                                    Generate meeting scripts with assigned roles
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Treasurer Report Card */}
                    <Link
                        href="/dashboard/reports/treasurer"
                        className="card-interactive stagger-item"
                    >
                        <div className="flex items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                                <DollarSign className="w-7 h-7 text-green-600 icon-hover-scale" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Project Treasurer Report</h3>
                                <p className="text-sm text-gray-600">
                                    Generate financial reports with receipts
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div >
        </div >
    );
}
