"use client";

import { motion } from 'framer-motion';
import { Brain, Clock } from 'lucide-react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';

interface LoadingStateProps {
  isStreaming: boolean;
  isComplete: boolean;
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
}

// Helper function to map tool call states to Tool component states
const mapToolCallState = (state: 'pending' | 'running' | 'completed' | 'error') => {
  switch (state) {
    case 'pending':
      return 'input-streaming' as const;
    case 'running':
      return 'input-available' as const;
    case 'completed':
      return 'output-available' as const;
    case 'error':
      return 'output-error' as const;
    default:
      return 'input-streaming' as const;
  }
};

export function LoadingState({
  isStreaming,
  isComplete,
  reasoningContent,
  reasoningDuration,
  toolCalls,
  sources,
  progress,
}: LoadingStateProps) {
  return (
    <motion.div 
      className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto px-4 pb-32"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      {/* Brain Icon */}
      <motion.div className="relative flex items-center justify-center mb-8">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg"
        >
          <Brain className="h-8 w-8 text-primary" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div className="text-center space-y-4 mb-8">
        <motion.h3 
          className="text-2xl font-bold text-foreground"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          AI is thinking...
        </motion.h3>
        <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Analyzing your request and preparing the mindmap
        </p>
      </motion.div>

      {/* Reasoning Component */}
      {reasoningContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Reasoning 
            className="w-full bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-" 
            isStreaming={isStreaming && !isComplete}
            defaultOpen={true}
            duration={reasoningDuration}
          >
            <ReasoningTrigger className="text-muted-foreground/80 font-light" />
            <ReasoningContent className="mt-3 h-32 overflow-y-auto text-sm font-light text-muted-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
              {reasoningContent}
            </ReasoningContent>
          </Reasoning>
        </motion.div>
      )}

      {/* Tool Calls Display */}
      {toolCalls.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-2xl mt-6 space-y-3 mb-4"
        >
          {toolCalls.map((toolCall) => (
            <Tool key={toolCall.id} defaultOpen={true}>
              <ToolHeader
                type={toolCall.type}
                state={mapToolCallState(toolCall.state)}
              />
              <ToolContent>
                <ToolInput input={toolCall.input} />
                {toolCall.output && (
                  <ToolOutput
                    output={typeof toolCall.output === 'string' ? toolCall.output : JSON.stringify(toolCall.output, null, 2)}
                    errorText={toolCall.state === 'error' ? 'Tool execution failed' : undefined}
                  />
                )}
              </ToolContent>
            </Tool>
          ))}
        </motion.div>
      )}

      {/* Sources Display */}
      {sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-2xl mt-6"
        >
          <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Sources</h4>
            <div className="space-y-2">
              {sources.map((source, index) => (
                <div key={index} className="text-xs text-muted-foreground/80">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {source.title || source.url}
                  </a>
                  {source.description && (
                    <p className="mt-1 text-muted-foreground/60">{source.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress indicator */}
      {isStreaming && progress.wordCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 mt-8 text-sm text-muted-foreground"
        >
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{Math.round(progress.estimatedProgress)}% complete</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}