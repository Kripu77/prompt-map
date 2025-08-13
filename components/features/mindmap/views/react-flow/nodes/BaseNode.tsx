"use client";

import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { NodeData } from '@/components/features/mindmap/types';
import { calculateNodeDimensions } from '@/lib/utils/node-dimensions';

interface BaseNodeProps {
  data: NodeData;
  id: string;
  nodeType: 'root' | 'branch' | 'leaf';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationConfig?: any;
  className: string;
  contentClassName: string;
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
}

export function BaseNode({
  data,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  nodeType,
  animationConfig,
  className,
  contentClassName,
  showTargetHandle = true,
  showSourceHandle = true,
}: BaseNodeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [actualDimensions, setActualDimensions] = useState<{width: number, height: number} | null>(null);
  const { width: calculatedWidth, height: calculatedHeight } = calculateNodeDimensions(data.content, nodeType);
  
// Calculate dimensions with fixed width and dynamic height
  useLayoutEffect(() => {
    if (contentRef.current) {
      const contentElement = contentRef.current;
      
      // Create a temporary div with the same fixed width to measure wrapped text height
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = `${calculatedWidth - 10}px`; // Account for padding
      tempDiv.style.whiteSpace = 'normal'; // Allow text wrapping
      tempDiv.style.wordWrap = 'break-word';
      tempDiv.style.overflowWrap = 'break-word';
      tempDiv.innerHTML = contentElement.innerHTML;
      document.body.appendChild(tempDiv);
      
      const actualHeight = tempDiv.scrollHeight;
      
      document.body.removeChild(tempDiv);
      
      // Use fixed width and calculate height based on wrapped content
      const finalWidth = calculatedWidth; // Use the fixed width from constants
      const finalHeight = Math.max(calculatedHeight, actualHeight + 60); // Add padding for height
      
      setActualDimensions({ width: finalWidth, height: finalHeight });
    }
  }, [data.content, calculatedWidth, calculatedHeight]);
  
  const finalWidth = actualDimensions?.width || calculatedWidth;
  const finalHeight = actualDimensions?.height || calculatedHeight;
  
  const handleStyle = {
    transform: 'translateY(-50%)',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    border: '2px solid white',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    width: '12px',
    height: '12px',
  };

  if (nodeType === 'root') {
    return (
      <div
        className={className}
        style={{ 
          width: finalWidth, 
          height: finalHeight,
          minWidth: finalWidth,
          minHeight: finalHeight
        }}
      >
        {showSourceHandle && (
          <Handle 
            type="source" 
            position={Position.Right} 
            style={{ right: -8, top: '50%', ...handleStyle }} 
          />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full h-full flex items-center justify-center">
            <div ref={contentRef} className="w-full h-full flex items-center justify-center text-center break-words overflow-hidden">
              <MarkdownRenderer 
                content={data.content} 
                className={contentClassName}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, x: nodeType === 'leaf' ? -30 : -50 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      transition={animationConfig}
      className={className}
      style={{ 
        width: finalWidth, 
        height: finalHeight,
        minWidth: finalWidth,
        minHeight: finalHeight
      }}
    >
      {showTargetHandle && (
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ left: -6, top: '50%', ...handleStyle }} 
        />
      )}
      
      {showSourceHandle && (
        <Handle 
          type="source" 
          position={Position.Right} 
          style={{ right: -6, top: '50%', ...handleStyle }} 
        />
      )}
      
      <div className="absolute inset-0 flex items-center justify-center p-3 ">
        <div className="w-full h-full flex items-center justify-center">
          <div ref={contentRef} className="w-full h-full flex items-center justify-center text-center break-words overflow-hidden">
            <MarkdownRenderer 
              content={data.content} 
              className={contentClassName}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}