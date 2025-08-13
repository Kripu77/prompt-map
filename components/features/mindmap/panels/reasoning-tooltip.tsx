"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReasoningPanelStore } from "@/lib/stores/reasoning-panel-store";
import { cn } from "@/lib/utils";

interface ReasoningTooltipProps {
  hasReasoning: boolean;
  className?: string;
  onShow?: () => void;
}

export function ReasoningTooltip({ hasReasoning, className, onShow }: ReasoningTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const { toggleVisibility } = useReasoningPanelStore();

  // Auto-show tooltip for a few seconds when reasoning is available
  useEffect(() => {
    if (hasReasoning && !hasBeenShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
        
        // Auto-hide after 4 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 4000);
        
        return () => clearTimeout(hideTimer);
      }, 1000); // Show after 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [hasReasoning, hasBeenShown]);

  const handleClick = () => {
    toggleVisibility();
    setIsVisible(false);
    onShow?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!hasReasoning) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.4
          }}
          className={cn(
            "fixed bottom-6 right-6 z-50 max-w-sm",
            "bg-gradient-to-br from-primary/10 via-background to-primary/5",
            "backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl",
            "p-4 cursor-pointer group hover:shadow-3xl transition-all duration-300",
            "hover:border-primary/30 hover:scale-105",
            className
          )}
          onClick={handleClick}
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            ×
          </button>
          
          <div className="relative z-10">
            {/* Icon with animation */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Brain className="h-4 w-4 text-primary" />
                </motion.div>
                
                {/* Sparkle animation */}
                <motion.div
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: 0.5,
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-3 w-3 text-primary/60" />
                </motion.div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  💭 AI Thought Process Available
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click here to view how AI analyzed and structured this mindmap
                </p>
              </div>
            </div>
            
            {/* Action hint */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  👆
                </motion.div>
                <span>Click to explore</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                View
              </Button>
            </div>
          </div>
          
          {/* Subtle pulse border */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 rounded-2xl border border-primary/30 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}