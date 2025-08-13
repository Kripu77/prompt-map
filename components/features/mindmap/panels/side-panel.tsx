"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useSidePanelStore } from '@/lib/stores/side-panel-store';
import { useMindmapEditor } from '@/hooks/use-mindmap-editor';
import { useStreamingMindmap } from '@/hooks/use-streaming-mindmap';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useReasoningPanelStore } from '@/lib/stores/reasoning-panel-store';
import { RichTextEditor } from '../editors/rich-text-editor';
import { PromptInput } from '../controls/prompt-input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, FileText, Save, Brain } from 'lucide-react';
import { generateTitleFromPrompt } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { MindmapMode } from '@/lib/api/llm/prompts/mindmap-prompts';



export function SidePanel() {
  const { isOpen, setIsOpen, width, setWidth } = useSidePanelStore();
  const { saveChanges, isSaving, canSave } = useMindmapEditor();
  const { mindmapData, isLoading: storeLoading } = useMindmapStore();
  const { settings, setMindmapMode } = useUserSettings();
  const {
    streamingContent,
    reasoningContent: streamingReasoningContent,
    isStreaming,
    isComplete,
    error,
    progress,
    generateMindmap,
    generateFollowUp,
    stopGeneration,
    resetStream,
  } = useStreamingMindmap();
  const { reasoningContent: savedReasoningContent, reasoningDuration: savedReasoningDuration } = useReasoningPanelStore();
  
  // Combine reasoning content from streaming and saved sources
  const reasoningContent = streamingReasoningContent || savedReasoningContent;
  const reasoningDuration = savedReasoningDuration; // Use saved duration for past threads
  
  const [isResizing, setIsResizing] = useState(false);
  const [isFollowUpMode, setIsFollowUpMode] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [topicShiftDetected, setTopicShiftDetected] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const displayContent = streamingContent || mindmapData;
  const isGenerating = isStreaming || storeLoading;

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleSave = useCallback(async () => {
    await saveChanges();
  }, [saveChanges]);

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

  const handleModeChange = (mode: MindmapMode) => {
    setMindmapMode(mode);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    e.preventDefault();
    
    const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
    const clampedWidth = Math.min(Math.max(newWidth, 20), 80); // 20% to 80% of screen width
    setWidth(clampedWidth);
  }, [isResizing, setWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="p-0 border-l overflow-hidden"
        style={{ 
          width: `${width}vw`,
          maxWidth: 'none',
          minWidth: '300px'
        }}
        hideCloseButton
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="absolute left-0 top-0 bottom-0 w-3 bg-transparent hover:bg-slate-200/30 cursor-col-resize z-50 group flex items-center justify-center"
          onMouseDown={handleMouseDown}
          style={{ left: '-1px' }}
        >
          <div className="w-1 h-12  transition-colors rounded-full opacity-60 group-hover:opacity-100"></div>
        </div>
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <SheetTitle className="text-lg font-semibold">
                Mindmap Editor
              </SheetTitle>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="h-8 px-3"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="text-sm text-left">
            Edit your mind map content in rich text format. Changes update the visualization in real-time. Click Save to persist changes to your knowledge base.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Lexical Editor Section */}
          <div className="flex-1 overflow-hidden min-h-0">
            <RichTextEditor className="h-full" streamingContent={streamingContent} isStreaming={isStreaming} />
          </div>
          
          {/* Enhanced Prompt Input Section */}
          <div className="bg-background/60 backdrop-blur-sm border-t border-border/20">
            <div className="px-6 py-4">
              {/* AI Reasoning Section - shown in place of Prompt Map label */}
              <AnimatePresence>
                {reasoningContent ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mb-3"
                  >
            
                    <Reasoning 
                      className="w-full bg-background/50 border border-border/30 rounded-md" 
                      isStreaming={isStreaming}
                      defaultOpen={isStreaming && !streamingContent}
                      duration={reasoningDuration}
                    >
                      <ReasoningTrigger className="text-muted-foreground/80 font-light text-xs" />
                      <ReasoningContent className="mt-2 max-h-24 overflow-y-auto text-xs font-light text-muted-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
                        {reasoningContent}
                      </ReasoningContent>
                    </Reasoning>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground/80">Prompt Map</span>
                  </div>
                )}
              </AnimatePresence>

              <PromptInput
                onSubmit={handlePromptSubmit}
                loading={isGenerating || topicShiftDetected}
                error={error}
                isFollowUpMode={isFollowUpMode}
                mode={settings?.mindmapMode || 'comprehensive'}
                onModeChange={handleModeChange}
                placeholder={
                  isFollowUpMode 
                    ? "Type anything, watch it branch out 🌿" 
                    : "Enter a topic to generate a mindmap..."
                }
                disabled={topicShiftDetected}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}