'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle2, Circle, Lightbulb, StickyNote, Clock, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { NODE_TYPES } from '@/lib/mindmap-utils';

interface MindmapNodeProps {
    data: {
        label: string;
        nodeType: 'task' | 'idea' | 'note' | 'deadline' | 'subtask';
        isCompleted: boolean;
        color?: string;
        hasComments?: boolean;
        isExpanded?: boolean;
        hasChildren?: boolean;
        onToggleExpand?: () => void;
        onToggleComplete?: () => void;
    };
    selected?: boolean;
}

const getNodeIcon = (type: string, isCompleted: boolean) => {
    switch (type) {
        case 'task':
        case 'subtask':
            return isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
                <Circle className="w-5 h-5 text-gray-400" />
            );
        case 'idea':
            return <Lightbulb className="w-5 h-5 text-yellow-500" />;
        case 'note':
            return <StickyNote className="w-5 h-5 text-amber-500" />;
        case 'deadline':
            return <Clock className="w-5 h-5 text-red-500" />;
        default:
            return <Circle className="w-5 h-5 text-gray-400" />;
    }
};

function MindmapNode({ data, selected }: MindmapNodeProps) {
    const nodeConfig = NODE_TYPES[data.nodeType] || NODE_TYPES.idea;
    const bgColor = data.color || nodeConfig.color;

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 shadow-md bg-white min-w-[180px] transition-all duration-200 ${selected
                    ? 'border-leo-500 shadow-lg ring-2 ring-leo-200'
                    : 'border-gray-300 hover:shadow-lg'
                }`}
            style={{
                borderLeftWidth: '4px',
                borderLeftColor: bgColor,
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-gray-400 border-2 border-white"
            />

            <div className="flex items-start gap-2">
                {/* Icon/Checkbox */}
                <div
                    className="flex-shrink-0 mt-0.5 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (data.nodeType === 'task' || data.nodeType === 'subtask') {
                            data.onToggleComplete?.();
                        }
                    }}
                >
                    {getNodeIcon(data.nodeType, data.isCompleted)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${data.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {data.label}
                    </div>
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {data.hasComments && (
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                    )}
                    {data.hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onToggleExpand?.();
                            }}
                            className="p-0.5 hover:bg-gray-100 rounded"
                        >
                            {data.isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-gray-400 border-2 border-white"
            />
        </div>
    );
}

export default memo(MindmapNode);
