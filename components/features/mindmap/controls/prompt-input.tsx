"use client"

import { useState, useEffect, FormEvent } from "react";
import { Brain, ChevronDown, CornerDownLeft, Loader2, ArrowRightCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MindmapMode } from "@/lib/api/llm/prompts/mindmap-prompts";
import type { ChatStatus } from "ai";

interface PromptInputProps {
  onSubmit: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  isFollowUpMode?: boolean;
  placeholder?: string;
  disabled?: boolean;
  mode?: MindmapMode;
  onModeChange?: (mode: MindmapMode) => void;
  status?: ChatStatus;
}

export function PromptInput({ 
  onSubmit, 
  loading = false, 
  error = null, 
  isFollowUpMode = false,
  placeholder = "Enter a prompt...",
  disabled = false,
  mode = 'comprehensive',
  onModeChange,
  status = 'ready'
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [localMode, setLocalMode] = useState<MindmapMode>(mode);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Show toolbar when hovered, focused, or has content
  const shouldShowToolbar = isHovered || isFocused || value.trim().length > 0;

  // Sync localMode when parent updates settings
  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    if (trimmedValue && !loading) {
      onSubmit(trimmedValue);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleModeSelect = (newMode: MindmapMode) => {
    setLocalMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const getSubmitIcon = () => {
    if (status === 'submitted' || loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    } else if (status === 'error') {
      return <ArrowRightCircle className="h-4 w-4" />;
    } else if (isFollowUpMode) {
      return <CornerDownLeft className="h-4 w-4" />;
    } else {
      return <ArrowRightCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full relative z-10">
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
          "relative rounded-2xl border border-input/40 bg-background/70",
          "backdrop-blur-lg shadow-xl transform-none overflow-visible",
          isFollowUpMode && "border-primary/40"
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

        <form onSubmit={handleSubmit} className="p-3">
          {/* Main input area */}
          <div className="flex items-end gap-3">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={localMode === 'lite' ? "Quick: 3-5 main branches, 2 subtopics each" : placeholder}
              disabled={loading || disabled}
              className={cn(
                "min-h-[32px] max-h-32 focus-visible:ring-0 border-0 shadow-none resize-none",
                "text-foreground placeholder:text-muted-foreground/60 text-base",
                "bg-transparent flex-1 p-0"
              )}
            />
            
            <Button
              type="submit"
              disabled={!value.trim() || loading || disabled}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg shrink-0 mb-1",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {getSubmitIcon()}
            </Button>
          </div>

          {/* Bottom toolbar with mode selection */}
          <AnimatePresence>
            {shouldShowToolbar && (
              <motion.div 
                 initial={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
                 animate={{ opacity: 1, height: "auto", marginTop: 12, paddingTop: 12 }}
                 exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
                 transition={{ 
                   duration: 0.3, 
                   ease: [0.4, 0.0, 0.2, 1],
                   opacity: { duration: 0.2 },
                   height: { duration: 0.3 }
                 }}
                 className="flex items-center justify-between border-t border-border/30"
               >
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 text-xs font-medium rounded-md transition-all duration-200",
                          "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        )}
                        disabled={loading || disabled}
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
                
                <div className="text-xs text-muted-foreground">
                  {loading ? "Generating..." : "Press Enter to send"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500 px-3"
          >
            <p className="flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}