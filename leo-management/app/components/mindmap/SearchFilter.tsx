'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { NODE_TYPES } from '@/lib/mindmap-utils';

interface SearchFilterProps {
    onSearch: (keyword: string) => void;
    onFilter: (type: string | null) => void;
}

export default function SearchFilter({ onSearch, onFilter }: SearchFilterProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onSearch(value);
    };

    const handleFilterClick = (type: string | null) => {
        setActiveFilter(type);
        onFilter(type);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Search & Filter</h3>

            {/* Search Input */}
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leo-500 focus:border-transparent text-sm"
                />
                {searchTerm && (
                    <button
                        onClick={() => handleSearchChange('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter Toggle */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-leo-600 hover:text-leo-700 font-medium mb-2"
            >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Filter Options */}
            {showFilters && (
                <div className="space-y-2">
                    <button
                        onClick={() => handleFilterClick(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeFilter === null
                                ? 'bg-leo-100 text-leo-700 font-medium'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                    >
                        All Types
                    </button>
                    {Object.entries(NODE_TYPES).map(([type, config]) => (
                        <button
                            key={type}
                            onClick={() => handleFilterClick(type)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeFilter === type
                                    ? 'bg-leo-100 text-leo-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: config.color }}
                            />
                            {config.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
