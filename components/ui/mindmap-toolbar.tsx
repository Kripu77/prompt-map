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
          // Add a subtle animation on hover
          "transform-gpu hover:scale-[1.02] transition-transform duration-200"
        )}
        onMouseEnter={() => setShowDragHint(true)}
        onMouseLeave={() => setShowDragHint(false)}
      >
        {/* First-time user welcome hint */}
        {showWelcomeHint && (
          <div className={cn(
            "absolute -top-20 right-0 transform translate-x-1/4",
            "px-4 py-2.5 rounded-xl text-sm whitespace-nowrap pointer-events-none",
            "bg-primary text-primary-foreground",
            "border border-primary/20 shadow-lg shadow-primary/10",
            "flex items-center gap-2.5 z-50",
            "animate-pulse-slow"
          )}>
            <GripHorizontal className="h-4 w-4" />
            <div>
              <p className="font-semibold">Toolbar is draggable!</p>
              <p className="text-xs opacity-90 mt-0.5">Grab and position it anywhere</p>
            </div>
            {/* Create a triangle pointing down */}
            <div className="absolute -bottom-2 right-8 h-4 w-4 bg-primary 
              transform rotate-45" />
          </div>
        )}
        
        {/* Header with drag handle and reset button */}
        <div className="w-full flex items-center justify-between mb-2 relative">
          <Button 
            size="sm" 
            variant="ghost" 
            className={cn(
              "h-6 w-6 p-0 rounded-lg",
              "opacity-60 hover:opacity-100 transition-opacity",
              "bg-foreground/5 hover:bg-foreground/10",
              "hover:shadow hover:scale-110 transition-all duration-200"
            )}
            onClick={onResetPosition}
            title="Reset Toolbar Position"
          >
            <MoveIcon className="h-3.5 w-3.5 text-foreground/70" />
            <span className="sr-only">Reset Position</span>
          </Button>
          
          <div 
            className={cn(
              "opacity-70 group-hover:opacity-100 transition-all duration-300", 
              "flex items-center gap-1.5 px-2 py-0.5 rounded-lg",
              "group-hover:bg-foreground/10 group-hover:scale-105",
              "relative"
            )}
            aria-label="Drag to move toolbar"
            title="Drag to move toolbar"
          >
            <GripHorizontal className={cn(
              "h-4 w-4 text-foreground/70 group-hover:text-foreground",
              "transition-all duration-300",
              "group-hover:animate-pulse"
            )} />
            
            {/* Tooltip that appears on hover */}
            <div className={cn(
              "absolute -top-9 left-1/2 transform -translate-x-1/2",
              "px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none",
              "bg-foreground text-background",
              "shadow-md",
              "transition-all duration-200",
              "opacity-0 translate-y-1",
              showDragHint ? "opacity-100 translate-y-0" : "opacity-0"
            )}>
              Drag to move toolbar
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 bg-foreground 
                transform -translate-x-1/2 rotate-45" />
            </div>
          </div>
        </div>
        
        {/* Main buttons container */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <ToolbarButton 
            onClick={() => onZoom(1.25)} 
            title="Zoom In"
            aria="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => onZoom(0.8)} 
            title="Zoom Out"
            aria="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
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
              className="h-4 w-4"
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
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
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
              "h-8 sm:h-9 px-3 sm:px-4 ml-1 rounded-xl",
              "text-xs sm:text-sm font-medium",
              "flex items-center gap-1.5",
              "bg-gradient-to-r from-primary/90 to-primary/80 dark:from-primary/80 dark:to-primary/70",
              "text-primary-foreground dark:text-primary-foreground",
              "shadow-sm hover:shadow-md hover:shadow-primary/15",
              "border border-primary/20 dark:border-primary/30",
              "hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 dark:hover:from-primary/90 dark:hover:to-primary/80",
              "transform-gpu hover:scale-105 active:scale-95",
              "transition-all duration-200"
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
      "h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl flex items-center justify-center",
      "text-foreground/80 hover:text-foreground",
      "bg-background/40 hover:bg-background/70",
      "shadow-sm hover:shadow-md",
      "border border-foreground/5 hover:border-foreground/10",
      "transform-gpu hover:scale-110 active:scale-95",
      "transition-all duration-200"
    )}
    title={title}
  >
    {children}
    <span className="sr-only">{aria}</span>
  </button>
);

MindmapToolbar.displayName = 'MindmapToolbar'; 