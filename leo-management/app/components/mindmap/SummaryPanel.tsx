'use client';

import { Circle, CheckCircle, StickyNote, Clock } from 'lucide-react';
import { calculateStats } from '@/lib/mindmap-utils';

interface SummaryPanelProps {
    nodes: any[];
}

export default function SummaryPanel({ nodes }: SummaryPanelProps) {
    const stats = calculateStats(nodes);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>

            <div className="space-y-3">
                {/* Total Nodes */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Total Nodes</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.totalNodes}</span>
                </div>

                {/* Tasks */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                    </div>
                    <span className="font-semibold text-green-600">{stats.completedTasks}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Tasks Pending</span>
                    </div>
                    <span className="font-semibold text-blue-600">{stats.pendingTasks}</span>
                </div>

                {/* Notes */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-600">Notes</span>
                    </div>
                    <span className="font-semibold text-amber-600">{stats.notes}</span>
                </div>

                {/* Deadlines */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">Deadlines</span>
                    </div>
                    <span className="font-semibold text-red-600">{stats.deadlines}</span>
                </div>
            </div>

            {/* Progress Bar */}
            {(stats.completedTasks + stats.pendingTasks) > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs font-semibold text-gray-900">
                            {Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${(stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
