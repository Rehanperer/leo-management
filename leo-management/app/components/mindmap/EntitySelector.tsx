'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Users, Calendar, X } from 'lucide-react';

interface Entity {
    id: string;
    title: string;
    type: 'project' | 'meeting' | 'event';
    date: string;
    status: string;
}

interface EntitySelectorProps {
    onSelect: (entity: Entity | null) => void;
    selectedEntity?: Entity | null;
}

export default function EntitySelector({ onSelect, selectedEntity }: EntitySelectorProps) {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEntities();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = entities.filter(e =>
                e.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEntities(filtered);
        } else {
            setFilteredEntities(entities);
        }
    }, [searchTerm, entities]);

    const fetchEntities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/mindmaps/entities', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                const allEntities = [
                    ...data.entities.projects,
                    ...data.entities.meetings,
                    ...data.entities.events,
                ];
                setEntities(allEntities);
                setFilteredEntities(allEntities);
            }
        } catch (error) {
            console.error('Error fetching entities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'project':
                return <FileText className="w-5 h-5 text-leo-600" />;
            case 'meeting':
                return <Users className="w-5 h-5 text-purple-600" />;
            case 'event':
                return <Calendar className="w-5 h-5 text-green-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="relative">
            {/* Selected Entity Display or Selector Button */}
            {selectedEntity ? (
                <div className="flex items-center justify-between bg-white border-2 border-leo-500 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                        {getIcon(selectedEntity.type)}
                        <div>
                            <div className="text-sm text-gray-600 capitalize">{selectedEntity.type}</div>
                            <div className="font-medium text-gray-900">{selectedEntity.title}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:border-leo-500 hover:bg-leo-50 transition-all"
                >
                    <Search className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">
                        Link to Project, Meeting, or Event (Optional)
                    </span>
                </button>
            )}

            {/* Dropdown */}
            {isOpen && !selectedEntity && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Entities List */}
                    <div className="overflow-y-auto max-h-80">
                        {loading ? (
                            <div className="p-8 text-center text-gray-600">Loading...</div>
                        ) : filteredEntities.length === 0 ? (
                            <div className="p-8 text-center text-gray-600">
                                No entities found
                            </div>
                        ) : (
                            <div className="p-2">
                                {filteredEntities.map((entity) => (
                                    <button
                                        key={`${entity.type}-${entity.id}`}
                                        onClick={() => {
                                            onSelect(entity);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                                    >
                                        {getIcon(entity.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">
                                                {entity.title}
                                            </div>
                                            <div className="text-sm text-gray-600 capitalize">
                                                {entity.type} • {new Date(entity.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cancel */}
                    <div className="p-2 border-t border-gray-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
