
"use client";

import { useRef } from 'react';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useMindmapGeneration } from '@/hooks/use-mindmap-generation';
import { MindmapView, PromptInput } from '@/components/features/mindmap';
import { LoaderCircle, Sparkles, CornerDownLeft, AlertCircle } from 'lucide-react';
import { generateTitleFromPrompt } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';


export function MindmapContainer() {

  const { mindmapData, isLoading, prompt } = useMindmapStore();
  const {
    error,
    promptHistory,
    isFollowUpMode,
    isUserGenerated,
    topicShiftDetected,
    processPrompt,
    handleTopicShift,
    continueDespiteShift,
  } = useMindmapGeneration();
  
  const svgRef = useRef<SVGSVGElement>(null);


  const mapTitle = mindmapData 
    ? generateTitleFromPrompt(prompt, mindmapData) 
    : "Generate a Mind Map";


  const handlePromptSubmit = async (value: string) => {
    if (!isUserGenerated) {
      // First prompt - start fresh
      await processPrompt(value, false);
    } else {
      // Follow-up prompt
      await processPrompt(value, true);
    }
  };

  
  return (
    <div className="bg-background w-full h-full relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/20 pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.1)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-full px-3 sm:px-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-xl sm:text-3xl font-bold text-foreground drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {mapTitle}
          </h1>
          
          {isFollowUpMode && promptHistory.length > 0 && (
            <div className="flex items-center justify-center mt-2 space-x-1 text-xs text-muted-foreground/70">
              <CornerDownLeft className="h-3 w-3" />
              <span>Follow-up mode: Refine your mindmap with additional questions</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="w-full h-[calc(100vh-5rem)] flex items-center justify-center pt-12 pb-24 sm:pt-16 sm:pb-28 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center max-w-[100%] sm:max-w-[90%] md:max-w-[85%] mx-auto relative z-10">
          
          {/* Mobile Usage Tip */}
          {mindmapData && (
            <motion.div
              className="absolute top-0 left-0 right-0 z-10 px-4 py-2 text-xs text-center bg-background/80 backdrop-blur-sm rounded-md shadow-sm md:hidden mobile-tip transition-all duration-300"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              exit={{ opacity: 0, y: -20 }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  const element = document.querySelector('.mobile-tip');
                  if (element) {
                    element.classList.add('opacity-0', '-translate-y-5');
                    setTimeout(() => {
                      element.classList.add('hidden');
                    }, 300);
                  }
                }, 5000);
              }}
            >
              <p>Pinch to zoom and drag to move around the mindmap</p>
            </motion.div>
          )}

          {/* Content States */}
          <AnimatePresence mode="wait">
            {!mindmapData && !isLoading ? (
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
                  Enter a topic in the input below to generate a beautiful, interactive mind map
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Powered by AI to organize your thoughts
                </p>
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                className="h-full flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <LoaderCircle className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary" />
                </motion.div>
                <p className="text-center text-muted-foreground mt-3 text-sm sm:text-base">
                  {isFollowUpMode ? "Refining your mind map..." : "Generating your mind map..."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MindmapView ref={svgRef} />
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

      {/* Prompt Input */}
      <motion.div 
        className="prompt-input-container fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[95%] sm:max-w-2xl px-2 sm:px-4 z-[200]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 90, delay: 0.3 }}
        style={{ 
          transform: "translateX(-50%)",
          transformOrigin: "bottom center",
          willChange: "transform"
        }}
      >
        <PromptInput
          onSubmit={handlePromptSubmit}
          loading={isLoading || topicShiftDetected}
          error={error}
          isFollowUpMode={isFollowUpMode}
          placeholder={isFollowUpMode ? "Ask a follow-up question to refine the mindmap..." : "Core concepts of Atomic Habits, Clean Code, etc."}
          disabled={topicShiftDetected}
        />
      </motion.div>
    </div>
  );
}