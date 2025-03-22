"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "./button";
import { Download, Sparkles } from "lucide-react";
import { useMindmapStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { exportMindmap } from "@/lib/mindmap-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Header() {
  const { theme } = useTheme();
  const { mindmapRef, mindmapData } = useMindmapStore();

  const handleExport = () => {
    if (mindmapData && mindmapRef) {
      exportMindmap(mindmapRef, theme);
    }
  };
 
  return (
    <header className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="px-3 sm:px-5 md:px-8 py-3 sm:py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "loop", 
                duration: 5,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            </motion.div>
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-amber-500/20 blur-xl rounded-full -z-10" />
          </div>
          
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 line-clamp-1">
              Mind Map Generator
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block max-w-md">
              Enter a topic or concept to generate a visual mind map
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2 sm:gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {mindmapData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 h-8 sm:h-9 rounded-full",
                "border-transparent bg-foreground/5 hover:bg-foreground/10",
                "hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              )}
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Export</span>
            </Button>
          )}
          <ThemeToggle />
        </motion.div>
      </div>
    </header>
  );
}