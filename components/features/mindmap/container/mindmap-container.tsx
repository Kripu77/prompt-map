"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamingMindmap } from '@/hooks/use-streaming-mindmap';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useSidePanelStore } from '@/lib/stores/side-panel-store';
import { StreamingMindmapView } from '../views/streaming-mindmap-view';
import { PromptInput } from '../controls/prompt-input';
import { ReactFlowMindmapView } from '../views/react-flow/ReactFlowMindmapView';
import { Button } from '@/components/ui/button';
import { Sparkles, CornerDownLeft, AlertCircle, Zap, Clock, Brain } from 'lucide-react';
import { generateTitleFromPrompt } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserSettings } from '@/hooks/use-user-settings';
import type { MindmapMode } from '@/lib/api/llm/prompts/mindmap-prompts';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';

export function MindmapContainer() {
  const { mindmapData, isLoading: storeLoading } = useMindmapStore();
  const { settings, setMindmapMode } = useUserSettings();
  const { isOpen: isSidePanelOpen } = useSidePanelStore();
  const {
    streamingContent,
    reasoningContent,
    isStreaming,
    isComplete,
    error,
    progress,
    generateMindmap,
    generateFollowUp,
    stopGeneration,
    resetStream,
  } = useStreamingMindmap();
  
  const [isFollowUpMode, setIsFollowUpMode] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [topicShiftDetected, setTopicShiftDetected] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const displayContent = streamingContent || mindmapData;
  const isGenerating = isStreaming || storeLoading;
  
  const mapTitle = displayContent 
    ? generateTitleFromPrompt(promptHistory[promptHistory.length - 1] || "Mindmap", displayContent) 
    : "Generate a Mind Map";

  const handlePromptSubmit = async (value: string) => {
    try {
      resetStream();
      
      if (!isFollowUpMode || promptHistory.length === 0) {
        setPromptHistory([value]);
        setIsFollowUpMode(false);
        
        generateMindmap(value, {
          useChainOfThought: true,
          format: 'practical',
        });
      } else {
        const shouldCheckTopicShift = await checkTopicShift();
        
        if (shouldCheckTopicShift) {
          setPendingPrompt(value);
          setTopicShiftDetected(true);
          return;
        }
        
        setPromptHistory(prev => [...prev, value]);
        generateFollowUp(value, {
          originalPrompt: promptHistory[0],
          existingMindmap: displayContent,
          previousPrompts: promptHistory,
          isFollowUp: true,
        });
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Failed to process prompt. Please try again.');
    }
  };

  const checkTopicShift = async (): Promise<boolean> => {
    if (!displayContent || promptHistory.length === 0) return false;
    return false;
  };

  const handleTopicShift = () => {
    if (pendingPrompt) {
      setTopicShiftDetected(false);
      setIsFollowUpMode(false);
      setPromptHistory([pendingPrompt]);
      resetStream();
      
      generateMindmap(pendingPrompt, {
        useChainOfThought: true,
        format: 'practical',
      });
      
      setPendingPrompt(null);
    }
  };

  const continueDespiteShift = () => {
    if (pendingPrompt) {
      setTopicShiftDetected(false);
      setPromptHistory(prev => [...prev, pendingPrompt]);
      
      generateFollowUp(pendingPrompt, {
        originalPrompt: promptHistory[0],
        existingMindmap: displayContent,
        previousPrompts: promptHistory,
        isFollowUp: true,
      });
      
      setPendingPrompt(null);
    }
  };

  const handleSavePartial = () => {
    if (streamingContent) {
      toast.success('Partial mindmap saved!');
    }
  };

  const handleModeChange = async (newMode: MindmapMode) => {
    try {
      await setMindmapMode(newMode);
      toast.success(`✨ Switched to ${newMode} mode`);
    } catch {
      toast.error('Failed to update mindmap mode');
    }
  };

  return (
    <div className="bg-background w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/20 pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.1)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />
      
      <motion.div 
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-full px-3 sm:px-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-center text-xl sm:text-3xl font-bold drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {mapTitle}
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
          
          {isFollowUpMode && promptHistory.length > 0 && (
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

      <div className="w-full h-[calc(100vh-5rem)] flex items-center justify-center pt-12 pb-24 sm:pt-16 sm:pb-28 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center max-w-[100%] sm:max-w-[90%] md:max-w-[85%] mx-auto relative z-10">

          <AnimatePresence mode="wait">
            {!displayContent && !isGenerating ? (

              <motion.div 
                className="h-full flex flex-col items-center justify-center max-w-md text-center px-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="mb-3"
                >
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary opacity-80" />
                </motion.div>
                <p className="text-center text-muted-foreground/90 text-sm sm:text-base mb-1 leading-relaxed">
                  Enter a topic in the input below to generate a beautiful, interactive mind map with real-time streaming
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Powered by AI with instant streaming for the best experience
                </p>
              </motion.div>
            ) : isGenerating && !streamingContent && reasoningContent ? (

              <motion.div 
                className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto px-4 pb-32"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {/* Simple Brain Icon */}
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

                {/* Fixed Height Reasoning Component */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="w-full max-w-2xl"
                >
                  <Reasoning 
                    className="w-full bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-4" 
                    isStreaming={isStreaming && !isComplete}
                    defaultOpen={true}
                  >
                    <ReasoningTrigger className="text-muted-foreground/80 font-light" />
                    <ReasoningContent className="mt-3 h-32 overflow-y-auto text-sm font-light text-muted-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
                      {reasoningContent}
                    </ReasoningContent>
                  </Reasoning>
                </motion.div>

                {/* Simple Progress indicator - only show when there's actual progress */}
                {isStreaming && progress.wordCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 mt-8 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{progress.wordCount} words</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>{Math.round(progress.estimatedProgress)}% complete</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {streamingContent ? (
                  <StreamingMindmapView
                    streamingContent={streamingContent}
                    isStreaming={isStreaming}
                    isComplete={isComplete}
                    progress={progress}
                    onStop={stopGeneration}
                    onSave={handleSavePartial}
                  />
                ) : (
                  <ReactFlowMindmapView mindmapData={mindmapData || ''} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Topic Shift Dialog */}
      <AnimatePresence>
        {topicShiftDetected && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-background rounded-xl p-6 shadow-xl max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-semibold">Topic Change Detected</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Your question appears to be about a different topic than your current mindmap. 
                Would you like to create a new mindmap for this topic instead of modifying the current one?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={continueDespiteShift}
                >
                  Modify Current Mindmap
                </Button>
                <Button
                  onClick={handleTopicShift}
                >
                  Create New Mindmap
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isSidePanelOpen && (
          <motion.div 
            className="prompt-input-container fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[95%] sm:max-w-2xl px-2 sm:px-4 z-[200]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 90, delay: 0.1 }}
            style={{ 
              transform: "translateX(-50%)",
              transformOrigin: "bottom center",
              willChange: "transform"
            }}
          >
            <PromptInput
              onSubmit={handlePromptSubmit}
              loading={isGenerating || topicShiftDetected}
              error={error}
              isFollowUpMode={isFollowUpMode}
              mode={settings?.mindmapMode || 'comprehensive'}
              onModeChange={handleModeChange}
              placeholder={
                isFollowUpMode 
                  ? "Ask a follow-up question to refine the mindmap..." 
                  : "Core concepts of Atomic Habits, Clean Code, etc."
              }
              disabled={topicShiftDetected}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}