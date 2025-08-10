"use client"

import React, { forwardRef, useState, useEffect } from 'react';
import { Button } from '../../ui/button';
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
    isFirstVisit = false,
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
        className={cn(
          "fixed rounded-xl border shadow-lg",
          "bg-background/95 backdrop-blur-lg",
          "cursor-grab active:cursor-grabbing z-50",
          "draggable-mindmap-toolbar",
          "w-64 min-h-[80px]",
          "transform-gpu transition-all duration-300",
          "dark:border-slate-700/80 border-slate-200/80",
          "dark:shadow-black/30 shadow-black/10",
          "overflow-visible select-none"
        )}
        style={{
          position: 'absolute',
          top: `${toolbarPosition.y}px`,
          left: `${toolbarPosition.x}px`,
          touchAction: 'none',
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translate3d(0,0,0)',
          isolation: 'isolate',
        }}
        onMouseEnter={() => setShowDragHint(true)}
        onMouseLeave={() => setShowDragHint(false)}
      >
        {/* First-time user welcome hint */}
        {showWelcomeHint && (
          <div className={cn(
            "absolute -top-16 right-0",
            "px-3 py-2 rounded-lg text-sm",
            "bg-primary/90 text-primary-foreground",
            "border border-primary/20 shadow-lg",
            "flex items-center gap-2 z-50",
            "animate-pulse-slow",
            "pointer-events-none"
          )}>
            <GripHorizontal className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Toolbar is draggable!</p>
              <p className="text-xs opacity-90 mt-0.5">Position it anywhere</p>
            </div>
            <div className="absolute -bottom-1.5 right-8 h-3 w-3 bg-primary/90 
              transform rotate-45" />
          </div>
        )}
        
        {/* Header with title and grip */}
        <div className="p-3 flex items-center justify-between border-b dark:border-slate-700 border-slate-200">
          <Button 
            size="sm" 
            variant="ghost"
            className="h-6 w-6 p-0 rounded-md opacity-60 hover:opacity-100"
            onClick={onResetPosition}
            title="Reset Toolbar Position"
          >
            <MoveIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Reset Position</span>
          </Button>
          
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-md 
              hover:bg-foreground/5 opacity-70 hover:opacity-100 transition-all"
            aria-label="Drag to move toolbar"
            title="Drag to move toolbar"
          >
            <GripHorizontal className="h-4 w-4" />
            
            {showDragHint && (
              <div className="absolute -top-9 left-1/2 transform -translate-x-1/2
                px-2.5 py-1.5 rounded-lg text-xs font-medium 
                bg-foreground text-background shadow-md
                pointer-events-none">
                Drag to move
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 bg-foreground 
                  transform -translate-x-1/2 rotate-45" />
              </div>
            )}
          </div>
        </div>
        
        {/* Main buttons container */}
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
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
        </div>

        {/* Export button in a separate area */}
        <div className="p-3 pt-0">
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) {
                const title = generateTitleFromPrompt(prompt);
                exportMindmap(svgRef.current, theme, title);
              }
            }}
            className={cn(
              "w-full h-9 rounded-lg",
              "text-sm font-medium",
              "flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground",
              "shadow-sm hover:shadow-md hover:shadow-primary/15",
              "border border-primary/20",
              "transform-gpu hover:scale-[1.02] active:scale-[0.98]",
              "transition-all duration-200"
            )}
            title="Export as PNG"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Resize handle */}
        {/* <div 
          className={cn(
            "absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize",
            "opacity-60 hover:opacity-100 transition-opacity",
            "flex items-center justify-center",
            "rounded-bl-md rounded-tr-lg overflow-hidden",
            "hover:bg-foreground/10 active:bg-foreground/20",
            "z-50"
          )}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          title="Resize toolbar"
        >
          <CornerRightDown className="h-3.5 w-3.5 text-foreground/70" />
        </div> */}
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
      "h-9 w-full rounded-lg",
      "flex items-center justify-center",
      "text-foreground/80 hover:text-foreground",
      "bg-foreground/5 hover:bg-foreground/10",
      "border border-foreground/5 hover:border-foreground/10",
      "transform-gpu hover:scale-[1.05] active:scale-95",
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