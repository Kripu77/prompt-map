"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowMindmapView, StreamingMindmapView } from '@/components/features/mindmap/views';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';
import { MindmapHeader } from './mindmap-header';

interface ContentDisplayProps {
  // Content state
  isEmpty: boolean;
  isStreaming: boolean;
  isComplete: boolean;
  content: string;
  title: string;
  
  // Loading state data
  reasoningContent: string;
  reasoningDuration?: number;
  toolCalls: Array<{
    id: string;
    type: string;
    state: 'pending' | 'running' | 'completed' | 'error';
    input: any;
    output?: any;
    errorText?: string;
  }>;
  sources: Array<{
    title?: string;
    url: string;
    description?: string;
  }>;
  progress: {
    wordCount: number;
    estimatedProgress: number;
  };
  
  // Header props
  isFollowUpMode: boolean;
  promptHistoryLength: number;
  
  // Mindmap props
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  onNodeHover?: (nodeId: string | null, nodeData: any) => void;
}

export function ContentDisplay({
  isEmpty,
  isStreaming,
  isComplete,
  content,
  title,
  reasoningContent,
  reasoningDuration,
  toolCalls,
  sources,
  progress,
  isFollowUpMode,
  promptHistoryLength,
  onNodeClick,
  onNodeHover,
}: ContentDisplayProps) {
  // Show empty state when no content
  if (isEmpty) {
    return (
      <AnimatePresence mode="wait">
        <EmptyState />
      </AnimatePresence>
    );
  }

  // Show streaming view when streaming with content, or loading state when no content yet
  if (isStreaming) {
    return (
      <AnimatePresence mode="wait">
        <div className="relative h-full">
          {/* Header for streaming state */}
          {title && (
            <MindmapHeader
              title={title}
              isStreaming={isStreaming}
              isFollowUpMode={isFollowUpMode}
              promptHistoryLength={promptHistoryLength}
              progress={progress}
            />
          )}
          
          {/* Show streaming mindmap if we have content, otherwise show loading state */}
          {content ? (
            <div className="h-full">
              <StreamingMindmapView
                streamingContent={content}
                isStreaming={isStreaming}
                isComplete={isComplete}
                progress={progress}
                className="h-full"
              />
            </div>
          ) : (
            <LoadingState
              isStreaming={isStreaming}
              isComplete={isComplete}
              reasoningContent={reasoningContent}
              reasoningDuration={reasoningDuration}
              toolCalls={toolCalls}
              sources={sources}
              progress={progress}
            />
          )}
        </div>
      </AnimatePresence>
    );
  }

  // Show loading state when no complete content yet
  if (!isComplete && !content) {
    return (
      <AnimatePresence mode="wait">
        <div className="relative h-full">
          <LoadingState
            isStreaming={isStreaming}
            isComplete={isComplete}
            reasoningContent={reasoningContent}
            reasoningDuration={reasoningDuration}
            toolCalls={toolCalls}
            sources={sources}
            progress={progress}
          />
        </div>
      </AnimatePresence>
    );
  }

  // Show mindmap visualization when content is available
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="relative h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <MindmapHeader
          title={title}
          isStreaming={isStreaming}
          isFollowUpMode={isFollowUpMode}
          promptHistoryLength={promptHistoryLength}
          progress={progress}
        />
        
        {/* Mindmap Visualization */}
        <motion.div
          className="h-full"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ReactFlowMindmapView
            mindmapData={content}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}