"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { ReactFlowMindmapViewProps, MindmapNode } from '@/components/features/mindmap/types';
import { REACT_FLOW_OPTIONS } from '@/components/features/mindmap/constants';
import { nodeTypes } from './nodes';
import { useMindmapData } from '@/hooks/use-mindmap-data';
import { useNodeAnimation } from '@/hooks/use-node-animation';
import { useNodeExpansion } from '@/hooks/use-node-expansion';
import { layoutGraph } from '@/lib/utils/layout';
import { generateVisibleNodesAndEdges } from '@/lib/utils/node-edge-generator';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { MindmapControls } from '@/components/features/mindmap/controls';
import { exportMindmap } from '@/lib/mindmap-utils';
import { useTheme } from 'next-themes';

interface AutoZoomHandlerProps {
  nodes: MindmapNode[];
  mindmapData: string;
}

function AutoZoomHandler({ nodes, mindmapData }: AutoZoomHandlerProps) {
  const { fitView } = useReactFlow();
  const hasAutoZoomedRef = useRef<boolean>(false);
  const previousNodesLengthRef = useRef<number>(0);
  const previousMindmapDataRef = useRef<string>('');

  const autoZoomToRoot = useCallback(() => {
    if (nodes.length === 0) return;

    // Show all nodes for better initial view with minimal padding
    fitView(REACT_FLOW_OPTIONS.FIT_VIEW_OPTIONS.AUTO_ZOOM);
  }, [nodes, fitView]);

  useEffect(() => {
    if (nodes.length > 0 && previousNodesLengthRef.current === 0 && !hasAutoZoomedRef.current) {
      const timeoutId = setTimeout(() => {
        autoZoomToRoot();
        hasAutoZoomedRef.current = true;
      }, REACT_FLOW_OPTIONS.TIMING.AUTO_ZOOM_DELAY);
      
      return () => clearTimeout(timeoutId);
    }
    
    previousNodesLengthRef.current = nodes.length;
  }, [nodes, autoZoomToRoot]);

  useEffect(() => {
    if (mindmapData && mindmapData !== previousMindmapDataRef.current && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        autoZoomToRoot();
      }, REACT_FLOW_OPTIONS.TIMING.AUTO_ZOOM_DELAY);
      
      previousMindmapDataRef.current = mindmapData;
      return () => clearTimeout(timeoutId);
    }
    
    if (!mindmapData) {
      previousMindmapDataRef.current = '';
    }
  }, [mindmapData, nodes, autoZoomToRoot]);

  useEffect(() => {
    if (nodes.length === 0) {
      hasAutoZoomedRef.current = false;
    }
  }, [nodes.length]);

  return null;
}

interface ReactFlowInnerProps {
  mindmapData: string;
  nodes: MindmapNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<MindmapNode>;
  onEdgesChange: OnEdgesChange<Edge>;
}

function ReactFlowInner({ mindmapData, nodes, edges, onNodesChange, onEdgesChange }: ReactFlowInnerProps) {
  const { setMindmapRef } = useMindmapStore();
  const reactFlowInstance = useReactFlow();
  const { theme } = useTheme();
  const mindmapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reactFlowInstance) {
      setMindmapRef(reactFlowInstance);
    }
  }, [reactFlowInstance, setMindmapRef]);

  const handleExport = () => {
    exportMindmap(reactFlowInstance, theme);
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (mindmapContainerRef.current) {
      mindmapContainerRef.current.requestFullscreen();
    }
  };

  const handleRefresh = () => {
    reactFlowInstance?.fitView(REACT_FLOW_OPTIONS.FIT_VIEW_OPTIONS.REFRESH);
  };

  return (
    <>
      <div ref={mindmapContainerRef} className="w-full h-full bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={REACT_FLOW_OPTIONS.FIT_VIEW_OPTIONS.DEFAULT}
          defaultViewport={REACT_FLOW_OPTIONS.DEFAULT_VIEWPORT}
          defaultEdgeOptions={REACT_FLOW_OPTIONS.DEFAULT_EDGE_OPTIONS}
          minZoom={REACT_FLOW_OPTIONS.MIN_ZOOM}
          maxZoom={REACT_FLOW_OPTIONS.MAX_ZOOM_LIMIT}
        >
          <Background 
            color={theme === 'dark' ? REACT_FLOW_OPTIONS.BACKGROUND_COLOR_DARK : REACT_FLOW_OPTIONS.BACKGROUND_COLOR_LIGHT}
            gap={REACT_FLOW_OPTIONS.BACKGROUND_GAP} 
            size={REACT_FLOW_OPTIONS.BACKGROUND_SIZE}
          />
          <AutoZoomHandler nodes={nodes} mindmapData={mindmapData} />
        </ReactFlow>
      </div>
      
      <MindmapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
        onExport={handleExport}
        onRefresh={handleRefresh}
        className="absolute bottom-2 right-6 z-10"
      />
    </>
  );
}

export function ReactFlowMindmapView({ mindmapData, className }: ReactFlowMindmapViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<MindmapNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { theme } = useTheme();

  const { parsedTree } = useMindmapData(mindmapData);
  const { renderedNodeIds } = useNodeAnimation(parsedTree, mindmapData);
  const { onToggle } = useNodeExpansion(parsedTree);

  useEffect(() => {
    if (mindmapData) {
      setNodes([]);
      setEdges([]);
    }
  }, [mindmapData, setNodes, setEdges]);

  useEffect(() => {
    if (!parsedTree) return;

    const { nodes: visibleNodes, edges: visibleEdges } = generateVisibleNodesAndEdges(
      parsedTree,
      renderedNodeIds,
      onToggle
    );

   

    if (visibleNodes.length > 0) {
      const timeoutId = setTimeout(() => {
        layoutGraph(visibleNodes, visibleEdges).then((laidOutNodes) => {
          setNodes(laidOutNodes as MindmapNode[]);
          setEdges(visibleEdges as Edge[]);
        });
      }, REACT_FLOW_OPTIONS.TIMING.LAYOUT_RENDER_DELAY);
      
      return () => clearTimeout(timeoutId);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [parsedTree, renderedNodeIds, onToggle, setNodes, setEdges, theme]);

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
        <ReactFlowInner 
          mindmapData={mindmapData}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
      </ReactFlowProvider>
    </div>
  );
}