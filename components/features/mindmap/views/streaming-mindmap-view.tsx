"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Square, Pause, Play, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { ReactFlowMindmapView } from './react-flow/ReactFlowMindmapView';

interface StreamingMindmapViewProps {
  streamingContent: string;
  isStreaming: boolean;
  isComplete: boolean;
  progress: {
    wordCount: number;
    estimatedProgress: number;
  };
  onStop: () => void;
  onSave?: () => void;
  className?: string;
}

export function StreamingMindmapView({
  streamingContent,
  isStreaming,
  isComplete,
  progress,
  onStop,
  onSave,
  className,
}: StreamingMindmapViewProps) {
  const { setMindmapRef } = useMindmapStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [displayContent, setDisplayContent] = useState('');


  useEffect(() => {
    if (!streamingContent) {
      setDisplayContent('');
      return;
    }
    
    setDisplayContent(streamingContent);
  }, [streamingContent]);

  useEffect(() => {
    if (svgRef.current) {
      setMindmapRef(svgRef.current);
    }
  }, [setMindmapRef]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className={cn("relative w-full h-full", className)}>

      <div className="w-full h-full relative overflow-hidden">
        {displayContent ? (
          <ReactFlowMindmapView mindmapData={displayContent} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="relative mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-16 h-16 mx-auto mb-4 relative"
                >
                  <div className="w-full h-full bg-sidebar-primary rounded-full flex items-center justify-center shadow-lg">
                    <motion.div
                      animate={{ 
                        opacity: [0.7, 1, 0.7],
                        scale: [0.95, 1.05, 0.95]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="text-sidebar-primary-foreground text-xl font-semibold"
                    >
                      AI
                    </motion.div>
                  </div>
                  
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        rotate: [0, 360],
                        scale: [0.6, 1, 0.6],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "linear"
                      }}
                      className="absolute w-2 h-2 bg-sidebar-primary/60 rounded-full"
                      style={{
                        top: "50%",
                        left: "50%",
                        transformOrigin: `${25 + i * 3}px 0px`,
                        transform: `translate(-50%, -50%) rotate(${i * 90}deg)`
                      }}
                    />
                  ))}
                  
                  <motion.div
                    animate={{
                      scale: [1, 2],
                      opacity: [0.3, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 rounded-full border border-sidebar-primary/40"
                  />
                </motion.div>
              </div>
              
              <motion.div
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="space-y-2"
              >
                <h3 className="text-lg font-medium text-foreground">
                  AI is crafting your mindmap
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Analyzing your topic and structuring key concepts into an interactive mindmap
                </p>
              </motion.div>
              
              <div className="flex justify-center gap-1.5 mt-6">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 bg-sidebar-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}