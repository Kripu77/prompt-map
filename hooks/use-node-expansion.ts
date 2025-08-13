"use client"
import { useState, useEffect, useCallback } from 'react';
import { collectAllNodeIds } from '../lib/utils/tree-utils';

export function useNodeExpansion(parsedTree: any) {
  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [isInitialized, setIsInitialized] = useState(false);

  const onToggle = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Auto-expand all nodes on initial load
  useEffect(() => {
    if (parsedTree && !isInitialized) {
      const allNodeIds = collectAllNodeIds(parsedTree);
      console.log("Setting expanded nodes:", Array.from(allNodeIds));
      setExpandedNodes(allNodeIds);
      setIsInitialized(true);
    }
  }, [parsedTree, isInitialized]);

  return { expandedNodes, onToggle };
}