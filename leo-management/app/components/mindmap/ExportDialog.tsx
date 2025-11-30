'use client';

import { useState } from 'react';
import { Download, FileImage, FileText, FileJson, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportAsJSON, exportAsSummary } from '@/lib/mindmap-utils';

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mindmap: any;
    canvasRef: React.RefObject<HTMLElement>;
}

export default function ExportDialog({ isOpen, onClose, mindmap, canvasRef }: ExportDialogProps) {
    const [exporting, setExporting] = useState(false);
    const [format, setFormat] = useState<'png' | 'pdf' | 'json' | 'summary'>('png');

    if (!isOpen) return null;

    const handleExport = async () => {
        setExporting(true);
        try {
            switch (format) {
                case 'png':
                    await exportAsPNG();
                    break;
                case 'pdf':
                    await exportAsPDF();
                    break;
                case 'json':
                    exportAsJSONFile();
                    break;
                case 'summary':
                    exportAsSummaryFile();
                    break;
            }
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const exportAsPNG = async () => {
        if (!canvasRef.current) return;

        const canvas = await html2canvas(canvasRef.current, {
            background: '#ffffff',
        });

        const link = document.createElement('a');
        link.download = `${mindmap.title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const exportAsPDF = async () => {
        if (!canvasRef.current) return;

        const canvas = await html2canvas(canvasRef.current, {
            background: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${mindmap.title.replace(/\s+/g, '_')}.pdf`);
    };

    const exportAsJSONFile = () => {
        const json = exportAsJSON(mindmap);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `${mindmap.title.replace(/\s+/g, '_')}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    const exportAsSummaryFile = () => {
        const summary = exportAsSummary(mindmap);
        const blob = new Blob([summary], { type: 'text/markdown' });
        const link = document.createElement('a');
        link.download = `${mindmap.title.replace(/\s+/g, '_')}_summary.md`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Export Mindmap</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Choose a format to export your mindmap:
                    </p>

                    <div className="space-y-3">
                        {/* PNG Option */}
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${format === 'png' ? 'border-leo-500 bg-leo-50' : 'border-gray-200 hover:border-leo-300'
                            }`}>
                            <input
                                type="radio"
                                name="format"
                                value="png"
                                checked={format === 'png'}
                                onChange={(e) => setFormat(e.target.value as any)}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <FileImage className="w-6 h-6 text-leo-600" />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">PNG Image</div>
                                    <div className="text-sm text-gray-600">High-quality image file</div>
                                </div>
                            </div>
                        </label>

                        {/* PDF Option */}
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${format === 'pdf' ? 'border-leo-500 bg-leo-50' : 'border-gray-200 hover:border-leo-300'
                            }`}>
                            <input
                                type="radio"
                                name="format"
                                value="pdf"
                                checked={format === 'pdf'}
                                onChange={(e) => setFormat(e.target.value as any)}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-red-600" />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">PDF Document</div>
                                    <div className="text-sm text-gray-600">Portable document format</div>
                                </div>
                            </div>
                        </label>

                        {/* JSON Option */}
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${format === 'json' ? 'border-leo-500 bg-leo-50' : 'border-gray-200 hover:border-leo-300'
                            }`}>
                            <input
                                type="radio"
                                name="format"
                                value="json"
                                checked={format === 'json'}
                                onChange={(e) => setFormat(e.target.value as any)}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <FileJson className="w-6 h-6 text-blue-600" />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">JSON Data</div>
                                    <div className="text-sm text-gray-600">Machine-readable format</div>
                                </div>
                            </div>
                        </label>

                        {/* Summary Option */}
                        <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${format === 'summary' ? 'border-leo-500 bg-leo-50' : 'border-gray-200 hover:border-leo-300'
                            }`}>
                            <input
                                type="radio"
                                name="format"
                                value="summary"
                                checked={format === 'summary'}
                                onChange={(e) => setFormat(e.target.value as any)}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-purple-600" />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">Summary Report</div>
                                    <div className="text-sm text-gray-600">Structured markdown summary</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary flex-1"
                        disabled={exporting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn btn-primary flex-1"
                        disabled={exporting}
                    >
                        {exporting ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
