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
  animationConfig?: any;
  className: string;
  contentClassName: string;
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
}

export function BaseNode({
  data,
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
  
  // Measure actual content dimensions after render
  useLayoutEffect(() => {
    if (contentRef.current) {
      const contentElement = contentRef.current;
      
      // Temporarily make the content visible and measure it
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.whiteSpace = 'nowrap';
      tempDiv.style.maxWidth = 'none';
      tempDiv.innerHTML = contentElement.innerHTML;
      document.body.appendChild(tempDiv);
      
      const actualWidth = tempDiv.scrollWidth;
      const actualHeight = tempDiv.scrollHeight;
      
      document.body.removeChild(tempDiv);
      
      // Add padding and ensure minimum dimensions
      const finalWidth = Math.max(calculatedWidth, actualWidth + 60);
      const finalHeight = Math.max(calculatedHeight, actualHeight + 40);
      
      setActualDimensions({ width: finalWidth, height: finalHeight });
    }
  }, [data.content, calculatedWidth, calculatedHeight]);
  
  const finalWidth = actualDimensions?.width || calculatedWidth;
  const finalHeight = actualDimensions?.height || calculatedHeight;
  
  const handleStyle = {
    transform: 'translateY(-50%)',
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
          <div className="text-center w-full h-full flex items-center justify-center">
            <div ref={contentRef} className="w-full h-full flex items-center justify-center">
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
          style={{ left: -8, top: '50%', ...handleStyle }} 
        />
      )}
      
      {showSourceHandle && (
        <Handle 
          type="source" 
          position={Position.Right} 
          style={{ right: -8, top: '50%', ...handleStyle }} 
        />
      )}
      
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="text-center w-full h-full flex items-center justify-center">
          <div ref={contentRef} className="w-full h-full flex items-center justify-center">
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