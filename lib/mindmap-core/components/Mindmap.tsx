"use client"
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { HierarchicalNode, BranchColors } from '../types';
import { createD3TreeLayout } from '../layouts';
import { nodeTypes } from './index';
import { DEFAULT_HIERARCHICAL_DATA, DEFAULT_BRANCH_COLORS } from '../constants';

export interface MindmapProps {
  data?: HierarchicalNode;
  branchColors?: BranchColors;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  showMiniMap?: boolean;
  showBackground?: boolean;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
}

/**
 * Internal Flow component that uses ReactFlow hooks
 */
const Flow: React.FC<MindmapProps> = ({
  data = DEFAULT_HIERARCHICAL_DATA,
  branchColors = DEFAULT_BRANCH_COLORS,
  showControls = true,
  showMiniMap = true,
  showBackground = true,
  onNodeClick,
  onEdgeClick
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [tempEdge, setTempEdge] = useState<Edge | null>(null);
  const { fitView } = useReactFlow();

  // Initialize layout
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = createD3TreeLayout({
      data,
      branchColors
    });
    setNodes(layoutNodes);
    setEdges(layoutEdges);
    
    // Fit view after a short delay to ensure nodes are rendered
    setTimeout(() => fitView(), 100);
  }, [data, branchColors, setNodes, setEdges, fitView]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Refresh layout
  const onLayout = useCallback(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = createD3TreeLayout({
      data,
      branchColors
    });
    setNodes(layoutNodes);
    setEdges(layoutEdges);
    setTimeout(() => fitView(), 100);
  }, [data, branchColors, setNodes, setEdges, fitView]);

  // Find closest edge for drag operations
  const getClosestEdge = useCallback((node: Node): Edge | null => {
    const centerX = node.position.x + (node.width || 0) / 2;
    const centerY = node.position.y + (node.height || 0) / 2;

    const closestNode = nodes.reduce(
      (closest, n) => {
        if (n.id === node.id) return closest;

        const distance = Math.sqrt(
          (centerX - (n.position.x + (n.width || 0) / 2)) ** 2 +
          (centerY - (n.position.y + (n.height || 0) / 2)) ** 2
        );

        if (distance < closest.distance) {
          return { distance, node: n };
        }

        return closest;
      },
      {
        distance: Number.MAX_VALUE,
        node: null as Node | null,
      }
    );

    if (closestNode.node && closestNode.distance < 250) {
      return {
        id: `temp-${node.id}-${closestNode.node.id}`,
        source: node.id,
        target: closestNode.node.id,
        type: 'smoothstep',
        style: { stroke: '#ddd', strokeDasharray: '5,5' },
      } as Edge;
    }

    return null;
  }, [nodes]);

  // Handle node drag
  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const closeEdge = getClosestEdge(node);
      setTempEdge(closeEdge);
    },
    [getClosestEdge]
  );

  // Handle node drag stop
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (tempEdge) {
        setEdges((eds) => [...eds, tempEdge]);
      }
      setTempEdge(null);
    },
    [tempEdge, setEdges]
  );

  const allEdges = tempEdge ? [...edges, tempEdge] : edges;

  return (
    <ReactFlow<Node, Edge>
      nodes={nodes}
      edges={allEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="top-right"
    >
      {showControls && <Controls />}
      {showMiniMap && (
        <MiniMap
          zoomable
          pannable
          nodeStrokeColor={(n) => {
            if (n.style?.background) {
              return n.style.background as string;
            }
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.style?.background) {
              return n.style.background as string;
            }
            return '#fff';
          }}
          nodeBorderRadius={2}
        />
      )}
      {showBackground && <Background color="#aaa" gap={16} />}
      <Panel position="top-left">
        <div className="mb-2.5 font-bold">D3 Tree Layout</div>
        <button
          onClick={onLayout}
          className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer text-sm hover:bg-blue-600 transition-colors"
        >
          Refresh Layout
        </button>
      </Panel>
    </ReactFlow>
  );
};

/**
 * Main Mindmap component with ReactFlowProvider wrapper
 */
export const Mindmap: React.FC<MindmapProps> = (props) => {
  const { className, style, ...flowProps } = props;
  
  return (
    <div className={`w-full h-screen ${className || ''}`} style={style}>
      <ReactFlowProvider children={<Flow {...flowProps} />} />
    </div>
  );
};

export default Mindmap;