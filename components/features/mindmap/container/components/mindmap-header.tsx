"use client";

import { motion } from 'framer-motion';
import { CornerDownLeft, Zap, Clock } from 'lucide-react';

interface MindmapHeaderProps {
  title: string;
  isStreaming: boolean;
  isFollowUpMode: boolean;
  promptHistoryLength: number;
  progress: {
    wordCount: number;
    estimatedProgress: number;
  };
}

export function MindmapHeader({
  title,
  isStreaming,
  isFollowUpMode,
  promptHistoryLength,
  progress,
}: MindmapHeaderProps) {
  return (
    <motion.div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-full px-3 sm:px-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-center text-xl sm:text-3xl font-bold drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          {isStreaming && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Zap className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </div>
        
        {isFollowUpMode && promptHistoryLength > 0 && (
          <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground/70">
            <CornerDownLeft className="h-3 w-3" />
            <span>Follow-up mode: Refine your mindmap with additional questions</span>
          </div>
        )}

        {isStreaming && progress.wordCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 mt-2 text-xs text-muted-foreground bg-background/50 backdrop-blur-sm rounded-full px-3 py-1"
          >
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{progress.wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{Math.round(progress.estimatedProgress)}% complete</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}