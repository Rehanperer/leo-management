// Mindmap utility functions

export interface MindmapNodeData {
    id: string;
    label: string;
    description?: string;
    comments?: string;
    nodeType: 'task' | 'idea' | 'note' | 'deadline' | 'subtask';
    color?: string;
    icon?: string;
    isCompleted: boolean;
    deadline?: Date | null;
    positionX: number;
    positionY: number;
    parentId?: string | null;
    isExpanded: boolean;
    width?: number;
    height?: number;
}

export interface MindmapData {
    id: string;
    title: string;
    description?: string;
    entityType?: string;
    entityId?: string;
    viewportX: number;
    viewportY: number;
    viewportZoom: number;
    nodes: MindmapNodeData[];
}

// Node type configurations
export const NODE_TYPES = {
    task: {
        color: '#3b82f6', // blue
        icon: '✓',
        label: 'Task',
    },
    idea: {
        color: '#8b5cf6', // purple
        icon: '💡',
        label: 'Idea',
    },
    note: {
        color: '#f59e0b', // amber
        icon: '📝',
        label: 'Note',
    },
    deadline: {
        color: '#ef4444', // red
        icon: '⏰',
        label: 'Deadline',
    },
    subtask: {
        color: '#10b981', // green
        icon: '○',
        label: 'Subtask',
    },
};

// Calculate statistics from mindmap nodes
export function calculateStats(nodes: MindmapNodeData[]) {
    const totalNodes = nodes.length;
    const taskNodes = nodes.filter(n => n.nodeType === 'task' || n.nodeType === 'subtask');
    const completedTasks = taskNodes.filter(n => n.isCompleted).length;
    const pendingTasks = taskNodes.length - completedTasks;
    const notes = nodes.filter(n => n.nodeType === 'note').length;
    const deadlines = nodes.filter(n => n.nodeType === 'deadline').length;

    return {
        totalNodes,
        completedTasks,
        pendingTasks,
        notes,
        deadlines,
    };
}

// Auto-layout helper - arrange nodes in a radial pattern
export function autoLayoutNodes(
    centerX: number,
    centerY: number,
    nodes: Partial<MindmapNodeData>[],
    radius: number = 250
): Partial<MindmapNodeData>[] {
    const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);

    return nodes.map((node, index) => ({
        ...node,
        positionX: centerX + radius * Math.cos(angleStep * index),
        positionY: centerY + radius * Math.sin(angleStep * index),
    }));
}

// Export mindmap as JSON
export function exportAsJSON(mindmap: MindmapData): string {
    return JSON.stringify(mindmap, null, 2);
}

// Export mindmap as structured summary
export function exportAsSummary(mindmap: MindmapData): string {
    let summary = `# ${mindmap.title}\n\n`;

    if (mindmap.description) {
        summary += `${mindmap.description}\n\n`;
    }

    const stats = calculateStats(mindmap.nodes);
    summary += `## Statistics\n`;
    summary += `- Total Nodes: ${stats.totalNodes}\n`;
    summary += `- Tasks: ${stats.completedTasks} completed, ${stats.pendingTasks} pending\n`;
    summary += `- Notes: ${stats.notes}\n`;
    summary += `- Deadlines: ${stats.deadlines}\n\n`;

    // Group nodes by type
    const nodesByType: Record<string, MindmapNodeData[]> = {};
    mindmap.nodes.forEach(node => {
        if (!nodesByType[node.nodeType]) {
            nodesByType[node.nodeType] = [];
        }
        nodesByType[node.nodeType].push(node);
    });

    // Output nodes by type
    Object.entries(nodesByType).forEach(([type, nodes]) => {
        const typeLabel = NODE_TYPES[type as keyof typeof NODE_TYPES]?.label || type;
        summary += `## ${typeLabel}s\n\n`;

        nodes.forEach(node => {
            const checkbox = (type === 'task' || type === 'subtask')
                ? (node.isCompleted ? '[x]' : '[ ]')
                : '-';

            summary += `${checkbox} **${node.label}**\n`;

            if (node.description) {
                summary += `  ${node.description}\n`;
            }

            if (node.deadline) {
                const deadlineStr = new Date(node.deadline).toLocaleDateString();
                summary += `  📅 Deadline: ${deadlineStr}\n`;
            }

            if (node.comments) {
                try {
                    const comments = JSON.parse(node.comments);
                    if (Array.isArray(comments) && comments.length > 0) {
                        summary += `  💬 Comments: ${comments.length}\n`;
                    }
                } catch {
                    // Ignore parsing errors
                }
            }

            summary += '\n';
        });
    });

    return summary;
}

// Build hierarchical structure from flat nodes
export interface HierarchicalNode extends MindmapNodeData {
    children: HierarchicalNode[];
}

export function buildHierarchy(nodes: MindmapNodeData[]): HierarchicalNode[] {
    const nodeMap = new Map<string, HierarchicalNode>(
        nodes.map(n => [n.id, { ...n, children: [] }])
    );
    const roots: HierarchicalNode[] = [];

    nodes.forEach(node => {
        const nodeWithChildren = nodeMap.get(node.id);
        if (!nodeWithChildren) return;

        if (node.parentId) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                parent.children.push(nodeWithChildren);
            } else {
                roots.push(nodeWithChildren);
            }
        } else {
            roots.push(nodeWithChildren);
        }
    });

    return roots;
}

// Search nodes by keyword
export function searchNodes(nodes: MindmapNodeData[], keyword: string): MindmapNodeData[] {
    const lowerKeyword = keyword.toLowerCase();
    return nodes.filter(node =>
        node.label.toLowerCase().includes(lowerKeyword) ||
        node.description?.toLowerCase().includes(lowerKeyword) ||
        node.comments?.toLowerCase().includes(lowerKeyword)
    );
}

// Filter nodes by type
export function filterNodesByType(nodes: MindmapNodeData[], type: string): MindmapNodeData[] {
    return nodes.filter(node => node.nodeType === type);
}
