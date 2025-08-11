"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { MindmapNode, ReactFlowMindmapViewProps } from '@/components/features/mindmap/types';
import { REACT_FLOW_OPTIONS, EDGE_STYLES } from '@/components/features/mindmap/constants';
import { nodeTypes } from './nodes';
import { useMindmapData } from '@/hooks/use-mindmap-data';
import { useNodeAnimation } from '@/hooks/use-node-animation';
import { useNodeExpansion } from '@/hooks/use-node-expansion';
import { layoutGraph } from '@/lib/utils/layout';
import { generateVisibleNodesAndEdges } from '@/lib/utils/node-edge-generator';

// Auto-zoom component that handles focusing on root node
function AutoZoomHandler({ nodes, mindmapData }: { nodes: any[], mindmapData: string }) {
  const { fitView, getNode } = useReactFlow();
  const hasAutoZoomedRef = useRef(false);
  const previousNodesLengthRef = useRef(0);
  const previousMindmapDataRef = useRef('');

  const autoZoomToRoot = useCallback(() => {
    if (nodes.length === 0) return;

    // Find the root node (assuming it has type 'root' or is the first node)
    const rootNode = nodes.find(node => node.type === 'root') || nodes[0];
    
    if (rootNode) {
      // Focus on the root node with custom zoom settings
      fitView({
        nodes: [rootNode],
        padding: 0.1, // Closer padding for root node focus
        maxZoom: 0.4, // Higher zoom for better readability
        duration: 800, // Smooth animation
      });
    }
  }, [nodes, fitView]);

  useEffect(() => {
    // Auto-zoom when new mindmap is generated (nodes appear for first time)
    if (nodes.length > 0 && previousNodesLengthRef.current === 0 && !hasAutoZoomedRef.current) {
      const timeoutId = setTimeout(() => {
        autoZoomToRoot();
        hasAutoZoomedRef.current = true;
      }, 300); // Small delay to ensure layout is complete
      
      return () => clearTimeout(timeoutId);
    }
    
    previousNodesLengthRef.current = nodes.length;
  }, [nodes, autoZoomToRoot]);

  // Auto-zoom when a thread is loaded (mindmapData changes)
  useEffect(() => {
    if (mindmapData && mindmapData !== previousMindmapDataRef.current && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        autoZoomToRoot();
      }, 200); // Slightly longer delay for thread loading
      
      previousMindmapDataRef.current = mindmapData;
      return () => clearTimeout(timeoutId);
    }
    
    if (!mindmapData) {
      previousMindmapDataRef.current = '';
    }
  }, [mindmapData, nodes, autoZoomToRoot]);

  // Reset auto-zoom flag when nodes are cleared (new mindmap starts)
  useEffect(() => {
    if (nodes.length === 0) {
      hasAutoZoomedRef.current = false;
    }
  }, [nodes.length]);

  return null;
}

export function ReactFlowMindmapView({ mindmapData, className }: ReactFlowMindmapViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Custom hooks for data processing and state management
  const { parsedTree } = useMindmapData(mindmapData);
  const { renderedNodeIds } = useNodeAnimation(parsedTree, mindmapData);
  const { onToggle } = useNodeExpansion(parsedTree);

  // Reset nodes and edges when new mindmap data arrives
  useEffect(() => {
    if (mindmapData) {
      setNodes([]);
      setEdges([]);
    }
  }, [mindmapData, setNodes, setEdges]);

  // Generate and layout nodes and edges
  useEffect(() => {
    if (!parsedTree) return;

    const { nodes: visibleNodes, edges: visibleEdges } = generateVisibleNodesAndEdges(
      parsedTree,
      renderedNodeIds,
      onToggle
    );

    console.log("Visible nodes:", visibleNodes.length);
    console.log("Visible edges:", visibleEdges.length);

    if (visibleNodes.length > 0) {
      // Add a small delay to prevent rapid re-layouts during streaming
      const timeoutId = setTimeout(() => {
        layoutGraph(visibleNodes, visibleEdges).then((laidOutNodes) => {
          console.log("Laid out nodes:", laidOutNodes.map(n => ({ id: n.id, position: n.position })));
          setNodes(laidOutNodes as any);
          setEdges(visibleEdges as any);
        });
      }, 50);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Clear nodes and edges when no visible nodes
      setNodes([]);
      setEdges([]);
    }
  }, [parsedTree, renderedNodeIds, onToggle, setNodes, setEdges]);

  if (!mindmapData) {
    return (
      <div className={`flex items-center justify-center h-full ${className || ''}`}>
        <div className="text-muted-foreground">No mindmap data available</div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-background ${className || ''}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ 
            padding: REACT_FLOW_OPTIONS.FIT_VIEW_PADDING, 
            maxZoom: REACT_FLOW_OPTIONS.MAX_ZOOM,
            includeHiddenNodes: true
          }}
          defaultEdgeOptions={{
            type: 'bezier',
            animated: true,
            style: EDGE_STYLES.DEFAULT,
          }}
          minZoom={REACT_FLOW_OPTIONS.MIN_ZOOM}
          maxZoom={REACT_FLOW_OPTIONS.MAX_ZOOM_LIMIT}
        >
          <Background 
            color={REACT_FLOW_OPTIONS.BACKGROUND_COLOR} 
            gap={REACT_FLOW_OPTIONS.BACKGROUND_GAP} 
            size={REACT_FLOW_OPTIONS.BACKGROUND_SIZE} 
          />
          <AutoZoomHandler nodes={nodes} mindmapData={mindmapData} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}