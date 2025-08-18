"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Send, Square, CornerDownLeft, Brain, ChevronDown, ArrowRightCircle } from 'lucide-react';
import { Loader } from '@/components/ai-elements/loader';
import { cn } from '@/lib/utils';
import type { MindmapMode } from '@/lib/api/llm/prompts';

// Define ChatStatus type locally since it's not exported from ai package
type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'error' | 'ready';

interface PromptControlsProps {
  onSubmit: (prompt: string) => void;
  onStop: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  isFollowUpMode: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  mode?: MindmapMode;
  onModeChange?: (mode: MindmapMode) => void;
  status?: ChatStatus;
}

export function PromptControls({
  onSubmit,
  onStop,
  isLoading,
  isStreaming,
  isFollowUpMode,
  disabled = false,
  placeholder = "Enter a topic to generate a mindmap...",
  className,
  mode = 'comprehensive',
  onModeChange,
  status = 'ready',
}: PromptControlsProps) {
  const [prompt, setPrompt] = useState('');
  const [localMode, setLocalMode] = useState<MindmapMode>(mode);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show toolbar when hovered, focused, has content, or dropdown is open
  const shouldShowToolbar = isHovered || isFocused || prompt.trim().length > 0 || isDropdownOpen;

  // Sync localMode when parent updates settings
  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  const handleSubmit = useCallback(() => {
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  }, [prompt, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleStop = useCallback(() => {
    onStop();
  }, [onStop]);

  const handleModeSelect = useCallback((newMode: MindmapMode) => {
    setLocalMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  }, [onModeChange]);

  const submitIcon = useMemo(() => {
    if (status === 'submitted' || isLoading) {
      return <Loader size={16} />;
    } else if (status === 'error') {
      return <ArrowRightCircle className="h-4 w-4" />;
    } else if (isFollowUpMode) {
      return <CornerDownLeft className="h-4 w-4" />;
    } else {
      return <ArrowRightCircle className="h-4 w-4" />;
    }
  }, [status, isLoading, isFollowUpMode]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // Focus textarea when not loading
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className={cn("w-full relative z-10", className)}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 200,
            delay: 0.1
          }}
          className={cn(
            "relative rounded-lg border-2 border-border/50 bg-background/95",
            "backdrop-blur-sm shadow-md transform-none overflow-visible",
            "ring-1 ring-primary/10 hover:border-primary/40 transition-all duration-200",
            "hover:bg-background hover:shadow-lg hover:ring-primary/20",
            isFollowUpMode && "border-primary/60 bg-primary/10 ring-primary/30",
            isFocused && "border-primary/70 bg-background ring-primary/40 shadow-lg"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Small indicator for follow-up mode */}
          {isFollowUpMode && (
            <span className="absolute -top-8 left-2 flex items-center text-xs text-primary/80 animate-pulse-slow">
              <CornerDownLeft className="h-3 w-3 mr-1" />
              <span>Follow-up prompt</span>
            </span>
          )}

          <div className="p-2">
            {/* Main input area */}
            <div className="flex items-end gap-3">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={localMode === 'lite' ? "Quick: 3-5 main branches, 2 subtopics each" : placeholder}
                disabled={disabled || isLoading}
                className={cn(
                  "min-h-[32px] max-h-32 focus-visible:ring-0 border-0 shadow-none resize-none",
                  "text-foreground placeholder:text-muted-foreground/70 text-sm font-medium",
                  "bg-transparent flex-1 p-0 leading-relaxed",
                  "placeholder:font-normal"
                )}
              />
              
              {/* Submit/Stop Button */}
              {isStreaming ? (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-md shrink-0 mb-0.5"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading || disabled}
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-md shrink-0 mb-0.5",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {submitIcon}
                </Button>
              )}
            </div>

            {/* Bottom toolbar with mode selection */}
            <AnimatePresence>
              {shouldShowToolbar && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8, paddingTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
                  transition={{ 
                    duration: 0.25, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    opacity: { duration: 0.15 },
                    height: { duration: 0.25 }
                  }}
                  className="flex items-center justify-between border-t border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <DropdownMenu onOpenChange={setIsDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs font-medium rounded-md transition-all duration-150",
                            "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          )}
                          disabled={isLoading || disabled}
                          type="button"
                        >
                          <Brain className="h-3 w-3 mr-1" />
                          <span>{localMode === 'comprehensive' ? 'Comprehensive' : 'Lite'}</span>
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="bottom" sideOffset={8} className="w-44 z-[9999]">
                        <DropdownMenuItem 
                          onClick={() => handleModeSelect('comprehensive')}
                          className={cn(
                            "cursor-pointer",
                            localMode === 'comprehensive' && "bg-primary/10 text-primary"
                          )}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          <div className="flex flex-col">
                            <span className="font-medium">Comprehensive</span>
                            <span className="text-xs text-muted-foreground">Detailed analysis</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleModeSelect('lite')}
                          className={cn(
                            "cursor-pointer",
                            localMode === 'lite' && "bg-primary/10 text-primary"
                          )}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          <div className="flex flex-col">
                            <span className="font-medium">Lite</span>
                            <span className="text-xs text-muted-foreground">Quick overview</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    {isStreaming && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Generating...
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
    </div>
  );
}