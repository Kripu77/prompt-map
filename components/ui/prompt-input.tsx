"use client"

import { useState, useRef, KeyboardEvent } from "react";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Loader2, ArrowRightCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PromptInputProps {
  onSubmit: (value: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function PromptInput({ onSubmit, loading = false, error = null }: PromptInputProps) {
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
          "backdrop-blur-lg shadow-xl",
          "before:pointer-events-none before:absolute before:-inset-0.5 before:rounded-[calc(1rem+2px)] before:border before:border-transparent",
          "before:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_0_4px_rgba(255,255,255,0.05),0_0_0_8px_rgba(255,255,255,0.03)]",
          "dark:before:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_0_0_3px_rgba(0,0,0,0.1),0_0_0_6px_rgba(0,0,0,0.05)]",
          "transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10",
          "group"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a topic or concept..."
          className={cn(
            "min-h-[56px] max-h-[100px] text-sm sm:text-base py-3 px-3 sm:px-4 border-0 shadow-none resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/70",
            "transition-all duration-300",
            loading && "opacity-50 cursor-not-allowed"
          )}
          disabled={loading}
        />
        <div className="pl-2">
          <Button
            type="submit"
            size="icon"
            className={cn(
              "h-8 w-8 sm:h-10 sm:w-10 rounded-xl shrink-0",
              "bg-primary/10 text-primary hover:bg-primary/20",
              "transition-all duration-300 ease-out",
              "overflow-hidden relative",
              "group-hover:shadow-lg group-hover:shadow-primary/20",
              loading && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <span className="absolute inset-0 bg-primary/10 blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                  <ArrowRightCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs sm:text-sm text-destructive mt-2 text-center flex items-center justify-center gap-1"
          >
            <span className="inline-block w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
            {error}
          </motion.p>
        )}
        
        {loading && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs sm:text-sm text-primary mt-2 text-center flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            Generating your mind map...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}