'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Users, DollarSign, Sparkles, X } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    structure: string;
}

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: Template) => void;
}

const TEMPLATE_ICONS: Record<string, any> = {
    project: FileText,
    event: Calendar,
    meeting: Users,
    fundraising: DollarSign,
    custom: Sparkles,
};

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/mindmaps/templates', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Choose a Template</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-leo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading templates...</p>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12">
                            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No templates available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template) => {
                                const Icon = TEMPLATE_ICONS[template.category] || Sparkles;
                                return (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            onSelect(template);
                                            onClose();
                                        }}
                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-leo-500 hover:bg-leo-50 transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-leo-100 to-leo-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-leo-200 group-hover:to-leo-300 transition-all">
                                                <Icon className="w-6 h-6 text-leo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {template.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {template.description}
                                                </p>
                                                <div className="mt-2">
                                                    <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                                                        {template.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                    <button onClick={onClose} className="btn btn-secondary w-full">
                        Skip & Start Blank
                    </button>
                </div>
            </div>
        </div>
    );
}
