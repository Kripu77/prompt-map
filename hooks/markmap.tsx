"use client"

import { useRef, useState, useEffect } from 'react';
import { useMindmapStore } from '@/lib/store';
import { MindmapView } from '@/components/ui/mindmap-view';
import { PromptInput } from '@/components/ui/prompt-input';
import { LoaderCircle, Sparkles, CornerDownLeft, AlertCircle } from 'lucide-react';
import { generateTitleFromPrompt } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OnboardingGuide } from '@/components/ui/onboarding-guide';

// Interface for prompt history
interface PromptHistoryItem {
  prompt: string;
  timestamp: number;
  isFollowUp: boolean;
}

export default function MarkmapHooks() {
  const { 
    isLoading, setIsLoading, 
    mindmapData, setMindmapData,
    prompt, setPrompt
  } = useMindmapStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [isFollowUpMode, setIsFollowUpMode] = useState<boolean>(false);
  const [isUserGenerated, setIsUserGenerated] = useState<boolean>(false);
  
  // New state for topic shift detection
  const [topicShiftDetected, setTopicShiftDetected] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState<boolean>(false);

  // Get the title to display - use the improved title generation function that extracts title from mindmap content
  const mapTitle = mindmapData 
    ? generateTitleFromPrompt(prompt, mindmapData) 
    : "Generate a Mind Map";

  // Set follow-up mode when we have a user-generated mindmap
  useEffect(() => {
    if (mindmapData && isUserGenerated) {
      setIsFollowUpMode(true);
    }
  }, [mindmapData, isUserGenerated]);

  // Function to generate API payload based on prompt history
  const generatePromptPayload = (newPrompt: string, isFollowUp: boolean, checkTopicShift: boolean = false) => {
    if (!isFollowUp) {
      // Initial prompt - just send the prompt directly
      return { prompt: newPrompt };
    } else {
      // Follow-up prompt - include context from previous prompts
      const initialPrompt = promptHistory.length > 0 ? 
        promptHistory.find(p => !p.isFollowUp)?.prompt : prompt;
      
      // Construct context with original prompt and follow-up question
      return { 
        prompt: newPrompt,
        context: {
          originalPrompt: initialPrompt || prompt,
          existingMindmap: mindmapData,
          previousPrompts: promptHistory.map(p => p.prompt),
          isFollowUp: true,
          checkTopicShift // Flag to check for topic shift
        }
      };
    }
  };

  // Function to handle a detected topic shift
  const handleTopicShift = () => {
    setTopicShiftDetected(false);
    
    if (pendingPrompt) {
      // Reset follow-up mode and history
      setIsFollowUpMode(false); 
      setPromptHistory([]);
      
      // Process as a new, unrelated prompt
      processPrompt(pendingPrompt, false);
      
      // Clear pending prompt
      setPendingPrompt(null);
    }
  };

  // Function to continue with existing mindmap despite topic shift
  const continueDespiteShift = () => {
    setTopicShiftDetected(false);
    
    if (pendingPrompt) {
      // Process as normal follow-up
      processPrompt(pendingPrompt, true);
      setPendingPrompt(null);
    }
  };

  // Function to process a prompt
  const processPrompt = async (value: string, isFollowUp: boolean) => {
    setIsLoading(true);
    setError(null);
    
    // Add to prompt history
    const newPromptItem: PromptHistoryItem = {
      prompt: value,
      timestamp: Date.now(),
      isFollowUp: isFollowUp
    };
    
    setPromptHistory(prev => [...prev, newPromptItem]);
    setPrompt(value); // Store the prompt in state
    
    try {
      // First check if this is a follow-up and we should check for topic shift
      if (isFollowUp && isUserGenerated) {
        const shiftCheckPayload = generatePromptPayload(value, true, true);
        
        const shiftCheckResponse = await fetch('/api/check-topic-shift', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shiftCheckPayload),
        });
        
        if (shiftCheckResponse.ok) {
          const shiftCheckData = await shiftCheckResponse.json();
          
          if (shiftCheckData.isTopicShift) {
            // Store the prompt for later use
            setPendingPrompt(value);
            setPendingFollowUp(isFollowUp);
            setTopicShiftDetected(true);
            setIsLoading(false);
            return;
          }
        }
      }
      
      // No topic shift detected, proceed with normal processing
      const payload = generatePromptPayload(value, isFollowUp);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }
      
      const data = await response.json();
      
      if (data.content) {
        setMindmapData(data.content);
        // Mark as user-generated since this was created in response to user input
        setIsUserGenerated(true);
        // Enable follow-up mode for user-generated content
        setIsFollowUpMode(true);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background w-full h-full relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/20 pointer-events-none z-0" />
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.1)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      {/* Onboarding Guide */}
      <OnboardingGuide isFirstVisit={!isUserGenerated} />

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

      <div className="w-full h-[calc(100vh-5rem)] flex items-center justify-center pt-12 pb-24 sm:pt-16 sm:pb-28 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center max-w-[95%] sm:max-w-[90%] md:max-w-[85%] mx-auto relative z-10">
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

      {/* Topic shift alert */}
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

      <motion.div 
        className="prompt-input-container fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[95%] sm:max-w-2xl px-2 sm:px-4 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 90, delay: 0.3 }}
      >
        <PromptInput
          onSubmit={async (value) => {
            // Reset follow-up mode if this is the first user prompt
            if (!isUserGenerated) {
              setIsFollowUpMode(false);
              // Clear any existing prompt history as we're starting fresh
              setPromptHistory([]);
              // Process as a new prompt
              processPrompt(value, false);
            } else {
              // Process as a follow-up prompt 
              // (topic shift detection happens inside processPrompt function)
              processPrompt(value, true);
            }
          }}
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
