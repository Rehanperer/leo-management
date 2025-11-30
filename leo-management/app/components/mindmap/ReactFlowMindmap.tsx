
'use client';

import { useEffect, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    Position,
    MarkerType,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ErrorBoundary from '../ErrorBoundary';

interface ReactFlowMindmapProps {
    content: string;
    editable?: boolean;
}

// Helper to parse markdown into nodes and edges
const parseContent = (content: string) => {
    if (!content) return { nodes: [], edges: [] };

    const lines = content.split('\n');
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Stack to keep track of the last node at each level
    // level -> nodeId
    const levelMap: { [key: number]: string } = {};

    let yCounter = 0;
    const X_SPACING = 250;
    const Y_SPACING = 60;

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let level = 0;
        let label = '';
        let type = 'default';

        // Determine level and label
        if (trimmed.startsWith('#')) {
            const match = trimmed.match(/^(#+)\s+(.*)/);
            if (match) {
                level = match[1].length - 1; // # is level 0
                label = match[2];
                type = level === 0 ? 'input' : 'default';
            } else {
                label = trimmed;
            }
        } else if (trimmed.startsWith('-')) {
            const indentMatch = line.match(/^(\s*)-/);
            const indent = indentMatch ? indentMatch[1].length : 0;
            // Simple heuristic for list items
            // Find the last header level
            let lastHeaderLevel = 0;
            for (let l = 5; l >= 0; l--) {
                if (levelMap[l] && !nodes.find(n => n.id === levelMap[l])?.data.label.startsWith('-')) {
                    lastHeaderLevel = l;
                    break;
                }
            }
            level = lastHeaderLevel + 1 + Math.floor(indent / 2);
            label = trimmed.replace(/^-\s+/, '');
        } else {
            return;
        }

        const id = `node - ${index} `;
        levelMap[level] = id;

        // Clear deeper levels
        for (let l = level + 1; l < 10; l++) {
            delete levelMap[l];
        }

        // Create Node
        nodes.push({
            id,
            type,
            data: { label },
            position: { x: level * X_SPACING, y: yCounter * Y_SPACING },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px',
                minWidth: '150px',
                fontSize: level === 0 ? '16px' : '14px',
                fontWeight: level === 0 ? 'bold' : 'normal',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            },
        });

        // Create Edge
        if (level > 0) {
            const parentId = levelMap[level - 1];
            if (parentId) {
                edges.push({
                    id: `edge - ${parentId} -${id} `,
                    source: parentId,
                    target: id,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#94a3b8' },
                });
            }
        }
        yCounter++;
    });

    return { nodes, edges };
};

function MindmapFlow({ content }: { content: string }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [debugInfo, setDebugInfo] = useState<any>({});

    // Parse content when it changes
    useEffect(() => {
        try {
            const { nodes: newNodes, edges: newEdges } = parseContent(content);
            setNodes(newNodes);
            setEdges(newEdges);
            setDebugInfo({
                contentLength: content?.length,
                nodeCount: newNodes.length,
                edgeCount: newEdges.length,
                timestamp: new Date().toLocaleTimeString()
            });
        } catch (e: any) {
            console.error("Parsing error:", e);
            setDebugInfo({ error: e.message });
        }
    }, [content, setNodes, setEdges]);

    if (nodes.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                No nodes to display
            </div>
        );
    }

    return (
        <>
            {/* Debug Overlay */}
            <div className="absolute top-4 right-4 z-50 bg-black/80 text-white p-4 rounded text-xs font-mono pointer-events-none">
                <h3 className="font-bold border-b border-gray-600 mb-2 pb-1">Debug Overlay</h3>
                <div>Content Len: {debugInfo.contentLength}</div>
                <div>Nodes: {debugInfo.nodeCount}</div>
                <div>Edges: {debugInfo.edgeCount}</div>
                <div>Last Update: {debugInfo.timestamp}</div>
                {debugInfo.error && <div className="text-red-400 font-bold">Error: {debugInfo.error}</div>}
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                attributionPosition="bottom-right"
                minZoom={0.1}
                maxZoom={4}
                fitView
            >
                <Background color="#94a3b8" gap={16} size={1} />
                <Controls />
            </ReactFlow>
        </>
    );
}

export default function ReactFlowMindmap({ content, editable }: ReactFlowMindmapProps) {
    return (
        <div className="w-full h-full bg-gray-50 relative">
            <ErrorBoundary>
                <ReactFlowProvider>
                    <MindmapFlow content={content} />
                </ReactFlowProvider>
            </ErrorBoundary>
        </div>
    );
}

