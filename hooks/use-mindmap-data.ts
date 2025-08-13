"use client"
import { useMemo } from 'react';
import { parseMarkdownToTree, treeToReactFlow } from '../lib/parsers/markdown-to-reactflow';
import { MindmapNode } from '../components/features/mindmap/types';

export function useMindmapData(mindmapData: string | null) {
  return useMemo(() => {
    if (!mindmapData) {
      return { parsedTree: null, reactFlowData: { nodes: [], edges: [] } };
    }
    
    const tree = parseMarkdownToTree(mindmapData);
    const flowData = treeToReactFlow(tree);
    
    // Debug logging (can be removed in production)
    console.log("The tree", tree);
    console.log("The flow data", flowData);
    console.log("Flow data nodes:", flowData.nodes.length);
    console.log("Flow data edges:", flowData.edges.length);
    
    return { parsedTree: tree, reactFlowData: flowData };
  }, [mindmapData]);
}