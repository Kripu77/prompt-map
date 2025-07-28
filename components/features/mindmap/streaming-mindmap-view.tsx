"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Square, Pause, Play, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindmapStore } from '@/lib/stores/mindmap-store';

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
      <AnimatePresence>
        {(isStreaming || !isComplete) && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-80 max-w-sm"
          >
            <div className="bg-background/95 backdrop-blur-xl rounded-lg border border-border shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-primary-foreground text-xs font-semibold"
                      >
                        AI
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-primary"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <motion.div
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="text-sm font-medium text-foreground truncate"
                    >
                      AI is thinking
                    </motion.div>
                    <div className="text-xs text-muted-foreground truncate">
                      Creating your mindmap
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="px-2 py-1 bg-secondary rounded-md text-xs text-secondary-foreground font-medium"
                  >
                    {progress.wordCount}w
                  </motion.div>
                </div>
              </div>
              
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [0.6, 1, 0.6],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-xs text-muted-foreground flex-1 truncate"
                  >
                    Processing concepts
                  </motion.span>
                </div>
                
                <div className="space-y-2">
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      animate={{ 
                        x: ["-100%", "100%"],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.max(progress.estimatedProgress, 15)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress.estimatedProgress)}%</span>
                    <span>Complete</span>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-secondary/30 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {isStreaming ? "Streaming..." : "Processing"}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isStreaming && (
                      <>
                        <Button
                          onClick={togglePause}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-secondary text-foreground"
                        >
                          {isPaused ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            <Pause className="h-3 w-3" />
                          )}
                        </Button>
                        
                        <Button
                          onClick={onStop}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    
                    {!isStreaming && displayContent && (
                      <Button
                        onClick={handleSave}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-secondary text-foreground"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full relative overflow-hidden">
        {displayContent ? (
          <StreamingMindmapRenderer
            content={displayContent}
            isStreaming={isStreaming}
            ref={svgRef}
          />
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

interface StreamingMindmapRendererProps {
  content: string;
  isStreaming: boolean;
}

const StreamingMindmapRenderer = React.forwardRef<
  SVGSVGElement,
  StreamingMindmapRendererProps
>(({ content, isStreaming }, ref) => {
  const [markmap, setMarkmap] = useState<{ setData: (data: unknown) => void; fit: () => void } | null>(null);
  const [lastValidContent, setLastValidContent] = useState<string>('');

  useEffect(() => {
    if (!content || !ref || !('current' in ref) || !ref.current) return;

    const initializeOrUpdateMarkmap = async () => {
      try {
        const { Markmap } = await import('markmap-view');
        const { Transformer } = await import('markmap-lib');
        
        const transformer = new Transformer();
        
        let transformedData;
        let contentToUse = content;
        
        try {
          if (isStreaming && content.trim().length < 10) {
            contentToUse = '# Generating...\n## Building your mind map';
          }
          transformedData = transformer.transform(contentToUse);
          setLastValidContent(contentToUse);
        } catch (transformError) {
          console.warn('Transform error, using fallback:', transformError);
          if (lastValidContent) {
            try {
              transformedData = transformer.transform(lastValidContent);
              contentToUse = lastValidContent;
            } catch {
              transformedData = transformer.transform('# Generating...\n## Please wait');
            }
          } else {
            transformedData = transformer.transform('# Generating...\n## Please wait');
          }
        }
        
        const { root } = transformedData;
        
        if (!markmap) {
          const mm = Markmap.create(ref.current!, {
            autoFit: true,
            duration: isStreaming ? 50 : 300,
            zoom: true,
            pan: true,
            maxWidth: 300,
            spacingVertical: 5,
            spacingHorizontal: 80,
          });
          setMarkmap(mm as { setData: (data: unknown) => void; fit: () => void });
          mm.setData(root);
        } else {
          markmap.setData(root);
          
          if (!isStreaming) {
            setTimeout(() => {
              markmap.fit();
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error updating markmap:', error);
      }
    };

    const timeoutId = setTimeout(initializeOrUpdateMarkmap, isStreaming ? 50 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [content, ref, markmap, isStreaming, lastValidContent]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={ref}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          filter: isStreaming ? 'brightness(0.9)' : 'brightness(1)',
          transition: 'filter 0.3s ease',
        }}
      />
      
      {isStreaming && (
        <div className="absolute bottom-4 right-4 bg-primary/10 backdrop-blur-sm rounded-full p-2 border border-primary/20">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        </div>
      )}
    </div>
  );
});

StreamingMindmapRenderer.displayName = 'StreamingMindmapRenderer';