"use client"

import { useRef, useState } from 'react';
import { useMindmapStore } from '@/lib/store';
import { MindmapView } from '@/components/ui/mindmap-view';
import { PromptInput } from '@/components/ui/prompt-input';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { generateTitleFromPrompt } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarkmapHooks() {
  const { 
    isLoading, setIsLoading, 
    mindmapData, setMindmapData,
    prompt, setPrompt
  } = useMindmapStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the title to display
  const mapTitle = mindmapData ? generateTitleFromPrompt(prompt) : "Generate a Mind Map";

  return (
    <div className="bg-background w-full h-full relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/20 pointer-events-none z-0" />
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.1)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      <motion.div 
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-full px-3 sm:px-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h1 className="text-center text-lg sm:text-2xl font-semibold text-foreground line-clamp-1 drop-shadow-sm">
          {mapTitle}
        </h1>
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
                  Generating your mind map...
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

      <motion.div 
        className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[95%] sm:max-w-2xl px-2 sm:px-4 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 90, delay: 0.3 }}
      >
        <PromptInput
          onSubmit={async (value) => {
            setIsLoading(true);
            setError(null);
            setPrompt(value); // Store the prompt in state
            
            try {
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: value }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to generate mind map');
              }
              
              const data = await response.json();
              
              if (data.content) {
                setMindmapData(data.content);
              }
            } catch (err) {
              console.error(err);
              setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
              setIsLoading(false);
            }
          }}
          loading={isLoading}
          error={error}
        />
      </motion.div>
    </div>
  );
}
