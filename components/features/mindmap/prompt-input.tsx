"use client"

import { useState, useRef, KeyboardEvent } from "react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Loader2, ArrowRightCircle, CornerDownLeft, Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import type { MindmapMode } from "@/lib/api/llm/prompts/mindmap-prompts";


interface PromptInputProps {
  onSubmit: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  isFollowUpMode?: boolean;
  placeholder?: string;
  disabled?: boolean;
  mode?: MindmapMode;
  onModeChange?: (mode: MindmapMode) => void;
}

export function PromptInput({ 
  onSubmit, 
  loading = false, 
  error = null, 
  isFollowUpMode = false,
  placeholder = "Enter a prompt...",
  disabled = false,
  mode = 'comprehensive',
  onModeChange
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !loading) {
      onSubmit(trimmedValue);
      setValue("");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };


  const handleModeSelect = (newMode: MindmapMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    }
  };


  return (
    <div className="w-full">
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
          "relative flex items-center rounded-2xl border border-input/40 bg-background/70 p-1 sm:p-2",
          "backdrop-blur-lg shadow-xl transform-none",
          isFollowUpMode && "border-primary/40"
        )}
      >
        {/* Small indicator for follow-up mode */}
        {isFollowUpMode && (
          <span className="absolute -top-8 left-2 flex items-center text-xs text-primary/80 animate-pulse-slow">
            <CornerDownLeft className="h-3 w-3 mr-1" />
            <span>Follow-up prompt</span>
          </span>
        )}

        {/* Mode Selector Dropdown */}
        <div className="flex items-center pl-2 pr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-xs font-medium rounded-lg border transition-all duration-200",
                  "hover:bg-background/80 focus:ring-1 focus:ring-primary/30",
                  mode === 'comprehensive' 
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15" 
                    : "bg-muted/50 text-muted-foreground border-muted/30 hover:bg-muted/70"
                )}
                disabled={loading || disabled}
              >
                <Brain className="h-3 w-3 mr-1" />
                <span>{mode === 'comprehensive' ? 'Comprehensive' : 'Lite'}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem 
                onClick={() => handleModeSelect('comprehensive')}
                className={cn(
                  "cursor-pointer",
                  mode === 'comprehensive' && "bg-primary/10 text-primary"
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
                  mode === 'lite' && "bg-primary/10 text-primary"
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

        {/* Separator */}
        <div className="w-px h-6 bg-border/50 mx-2" />

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading || disabled}
          className={cn(
            "min-h-[50px] h-12 focus-visible:ring-0 border-0 shadow-none resize-none",
            "text-foreground placeholder:text-muted-foreground/60 sm:text-base text-sm",
            "bg-transparent flex-1",
            isFollowUpMode && "pl-4"
          )}
        />

        <div className="flex gap-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                key="loading"
              >
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 sm:h-10 sm:w-10 rounded-xl opacity-80"
                  disabled
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                key="submit"
              >
                <Button 
                  onClick={handleSubmit}
                  disabled={!value.trim() || loading || disabled}
                  size="icon"
                  className={cn(
                    "h-10 w-10 sm:h-10 sm:w-10 rounded-xl",
                    "bg-primary/10 hover:bg-primary/20 text-foreground",
                    isFollowUpMode && "bg-primary/20 hover:bg-primary/30"
                  )}
                >
                  {isFollowUpMode ? (
                    <CornerDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowRightCircle className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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