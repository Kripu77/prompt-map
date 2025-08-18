"use client"
import { useMemo } from 'react';
import { parseMarkdownToTree, treeToReactFlow } from '../lib/parsers/markdown-to-reactflow';


export function useMindmapData(mindmapData: string | null) {
  return useMemo(() => {
    if (!mindmapData) {
      return { parsedTree: null, reactFlowData: { nodes: [], edges: [] } };
    }
    
    const tree = parseMarkdownToTree(mindmapData);
    const flowData = treeToReactFlow(tree);

  
    
    return { parsedTree: tree, reactFlowData: flowData };
  }, [mindmapData]);
}