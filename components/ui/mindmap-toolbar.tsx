"use client"

import React, { forwardRef, useState, useEffect } from 'react';
import { Button } from './button';
import { ZoomIn, ZoomOut, Maximize, Minimize, Download, GripHorizontal, MoveIcon } from 'lucide-react';
import { Markmap } from 'markmap-view';
import { exportMindmap } from '@/lib/mindmap-utils';
import { generateTitleFromPrompt } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MindmapToolbarProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  markmapInstance: Markmap | null;
  toolbarPosition: { x: number; y: number };
  isFullscreen: boolean;
  theme?: string;
  prompt: string;
  onZoom: (scale: number) => void;
  onFullscreenToggle: () => void;
  onResetPosition?: () => void;
  isFirstVisit?: boolean;
}

export const MindmapToolbar = forwardRef<HTMLDivElement, MindmapToolbarProps>(
  ({ 
    svgRef, 
    markmapInstance, 
    toolbarPosition, 
    isFullscreen, 
    theme, 
    prompt, 
    onZoom, 
    onFullscreenToggle,
    onResetPosition,
    isFirstVisit = false
  }, ref) => {
    const [showDragHint, setShowDragHint] = useState(false);
    const [showWelcomeHint, setShowWelcomeHint] = useState(isFirstVisit);
    
    // Handle first visit hint
    useEffect(() => {
      setShowWelcomeHint(isFirstVisit);
    }, [isFirstVisit]);
    
    return (
      <div 
        ref={ref}
        style={{
          position: 'absolute',
          top: `${toolbarPosition.y}px`,
          left: `${toolbarPosition.x}px`,
          touchAction: 'none', // Prevents scrolling during touch on mobile
        }}
        className={cn(
          "flex flex-wrap justify-end gap-1.5 p-2 sm:p-2.5 rounded-2xl shadow-lg",
          "border border-white/10 dark:border-white/5",
          "bg-background/60 backdrop-blur-xl",
          "transition-all duration-300",
          "cursor-grab active:cursor-grabbing z-40 group",
          "hover:bg-background/70 hover:border-white/20 dark:hover:border-white/10",
          "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5",
          "draggable-mindmap-toolbar",
          // More compact on mobile
          "max-w-[98vw] sm:max-w-none",
          // Add a subtle animation on hover
          "transform-gpu hover:scale-[1.02] transition-transform duration-200"
        )}
        onMouseEnter={() => setShowDragHint(true)}
        onMouseLeave={() => setShowDragHint(false)}
      >
        {/* First-time user welcome hint - more responsive for small screens */}
        {showWelcomeHint && (
          <div className={cn(
            // Improve positioning for better mobile experience
            "absolute -top-16 sm:-top-20 right-2 sm:right-0",
            "px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm",
            "bg-primary/90 text-primary-foreground",
            "border border-primary/20 shadow-lg shadow-primary/10",
            "flex items-center gap-1.5 sm:gap-2 z-50",
            "animate-pulse-slow animate-duration-[3s]",
            // On very small screens, make it more compact
            "max-w-[200px] sm:max-w-[240px] whitespace-normal pointer-events-none"
          )}>
            <GripHorizontal className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm">Toolbar is draggable!</p>
              <p className="text-xs opacity-90 mt-0.5 hidden sm:block">Grab and position it anywhere</p>
            </div>
            {/* Create a triangle pointing down - slightly smaller for better appearance */}
            <div className="absolute -bottom-1.5 right-8 h-3 w-3 bg-primary/90 
              transform rotate-45" />
          </div>
        )}
        
        {/* Header with drag handle and reset button */}
        <div className="w-full flex items-center justify-between mb-1 sm:mb-2 relative">
          <Button 
            size="sm" 
            variant="ghost" 
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 p-0 rounded-lg",
              "opacity-60 hover:opacity-100 transition-opacity",
              "bg-foreground/5 hover:bg-foreground/10",
              "hover:shadow hover:scale-110 transition-all duration-200"
            )}
            onClick={onResetPosition}
            title="Reset Toolbar Position"
          >
            <MoveIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-foreground/70" />
            <span className="sr-only">Reset Position</span>
          </Button>
          
          <div 
            className={cn(
              "opacity-70 group-hover:opacity-100 transition-all duration-300", 
              "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg",
              "group-hover:bg-foreground/10 group-hover:scale-105",
              "relative"
            )}
            aria-label="Drag to move toolbar"
            title="Drag to move toolbar"
          >
            <GripHorizontal className={cn(
              "h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/70 group-hover:text-foreground",
              "transition-all duration-300",
              "group-hover:animate-pulse"
            )} />
            
            {/* Tooltip that appears on hover - hide on mobile */}
            <div className={cn(
              "absolute -top-9 left-1/2 transform -translate-x-1/2",
              "px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none",
              "bg-foreground text-background",
              "shadow-md",
              "transition-all duration-200",
              "opacity-0 translate-y-1",
              showDragHint ? "opacity-100 translate-y-0" : "opacity-0",
              "hidden sm:block" // Hide on small screens
            )}>
              Drag to move toolbar
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 bg-foreground 
                transform -translate-x-1/2 rotate-45" />
            </div>
          </div>
        </div>
        
        {/* Main buttons container - improve spacing for small screens */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 justify-end">
          <ToolbarButton 
            onClick={() => onZoom(1.25)} 
            title="Zoom In"
            aria="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => onZoom(0.8)} 
            title="Zoom Out"
            aria="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => {
              if (markmapInstance) {
                markmapInstance.fit();
              }
            }} 
            title="Center Map"
            aria="Center Map"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            >
              <path d="M21 3 3 21" />
              <path d="M21 21 3 3" />
            </svg>
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={onFullscreenToggle} 
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </ToolbarButton>
          
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) {
                const title = generateTitleFromPrompt(prompt);
                exportMindmap(svgRef.current, theme, title);
              }
            }}
            className={cn(
              "h-7 sm:h-8 md:h-9 rounded-xl",
              "px-2 sm:px-2.5 ml-1",
              "text-xs sm:text-sm font-medium",
              "inline-flex items-center justify-center gap-1 sm:gap-1.5",
              "bg-gradient-to-r from-primary/90 to-primary/80 dark:from-primary/80 dark:to-primary/70",
              "text-primary-foreground dark:text-primary-foreground",
              "shadow-sm hover:shadow-md hover:shadow-primary/15",
              "border border-primary/20 dark:border-primary/30",
              "hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 dark:hover:from-primary/90 dark:hover:to-primary/80",
              "transform-gpu hover:scale-105 active:scale-95",
              "transition-all duration-200",
              "whitespace-nowrap"
            )}
            title="Export as PNG"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    );
  }
);

// Helper component for toolbar buttons
const ToolbarButton = ({ 
  children, 
  onClick, 
  title,
  aria
}: { 
  children: React.ReactNode, 
  onClick: () => void, 
  title: string,
  aria: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-xl",
      "flex items-center justify-center",
      "text-foreground/80 hover:text-foreground",
      "bg-background/40 hover:bg-background/70",
      "shadow-sm hover:shadow-md",
      "border border-foreground/5 hover:border-foreground/10",
      "transform-gpu hover:scale-110 active:scale-95",
      "transition-all duration-200"
    )}
    title={title}
    aria-label={aria}
  >
    {children}
    <span className="sr-only">{aria}</span>
  </button>
);

MindmapToolbar.displayName = 'MindmapToolbar'; 