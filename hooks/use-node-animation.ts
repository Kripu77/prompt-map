"use client"
import { useState, useEffect, useCallback } from 'react';
import { collectAllNodeIds, sortNodesByLevel } from '../lib/utils/tree-utils';
export const ANIMATION_DELAYS = {
  QUEUE_PROCESSING: 200,
} as const;

export function useNodeAnimation(parsedTree: any, mindmapData: string | null) {
  const [renderedNodeIds, setRenderedNodeIds] = useState(new Set<string>());
  const [animationQueue, setAnimationQueue] = useState<string[]>([]);

  // Reset animation states when new mindmap data arrives
  useEffect(() => {
    if (mindmapData) {
      setRenderedNodeIds(new Set<string>());
      setAnimationQueue([]);
    }
  }, [mindmapData]);

  // Progressive rendering: detect new nodes and queue them for animation
  useEffect(() => {
    if (!parsedTree) return;

    const allNodeIds = collectAllNodeIds(parsedTree);
    const newNodeIds = Array.from(allNodeIds).filter(id => !renderedNodeIds.has(id));
    
    if (newNodeIds.length > 0) {
      const sortedNewNodes = sortNodesByLevel(parsedTree, newNodeIds);
      
      // Add all nodes immediately to ensure edges are created
      setRenderedNodeIds(new Set(allNodeIds));
      setAnimationQueue(sortedNewNodes);
    }
  }, [parsedTree, renderedNodeIds]);

  // Process animation queue with delays
  useEffect(() => {
    if (animationQueue.length === 0) return;

    const processQueue = async () => {
      // Animation queue is now just for visual effects, not for controlling node rendering
      for (let i = 0; i < animationQueue.length; i++) {
        // Wait before showing next node animation
        if (i < animationQueue.length - 1) {
          await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.QUEUE_PROCESSING));
        }
      }
      
      // Clear the queue
      setAnimationQueue([]);
    };

    processQueue();
  }, [animationQueue]);

  return { renderedNodeIds };
}