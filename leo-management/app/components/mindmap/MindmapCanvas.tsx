'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    Connection,
    Edge,
    Node,
    NodeChange,
    EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NODE_TYPES } from '@/lib/mindmap-utils';

interface MindmapCanvasProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
    onPaneClick: () => void;
    nodeTypes?: any;
}

export default function MindmapCanvas({
    initialNodes,
    initialEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    nodeTypes,
}: MindmapCanvasProps) {
    const [nodes, setNodes, _onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, _onEdgesChange] = useEdgesState(initialEdges);

    // Sync with parent component
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        _onNodesChange(changes);
        onNodesChange(changes);
    }, [_onNodesChange, onNodesChange]);

    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
        _onEdgesChange(changes);
        onEdgesChange(changes);
    }, [_onEdgesChange, onEdgesChange]);

    const handleConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge(connection, eds));
        onConnect(connection);
    }, [setEdges, onConnect]);

    return (
        <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <ReactFlow
                nodes={initialNodes}
                edges={initialEdges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                }}
            >
                <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
                <MiniMap
                    className="bg-white border border-gray-200 rounded-lg shadow-sm"
                    nodeColor={(node) => {
                        const nodeType = node.data?.nodeType || 'idea';
                        return NODE_TYPES[nodeType as keyof typeof NODE_TYPES]?.color || '#8b5cf6';
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                />
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    color="#e5e7eb"
                />
            </ReactFlow>
        </div>
    );
}
