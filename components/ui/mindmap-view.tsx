"use client"

import React, { useRef, forwardRef, useEffect, useState } from 'react';
import { useMindmapStore, useSidebarStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import '@/lib/markmap-defaults';
import { setupFullscreenStyles } from '@/lib/theme-utils';
import { useMindmap } from '@/hooks/use-mindmap';
import { useDraggableToolbar } from '@/hooks/use-draggable-toolbar';
import { MindmapToolbar } from './mindmap-toolbar';
import {  fitContent } from '@/lib/mindmap-utils';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, RefreshCw, Undo2 } from 'lucide-react';
import { Button } from './button';
import * as d3 from 'd3';
import { applyTextStyles } from '@/lib/theme-utils';
import { initializeMarkmap } from '@/lib/mindmap-utils';
import { Markmap } from 'markmap-view';

// Define a type for Hammer
interface HammerManager {
  get(name: string): { set(options: Record<string, unknown>): void };
  on(event: string, handler: (event: { scale: number; deltaX: number; deltaY: number }) => void): void;
  destroy(): void;
}

// Import Hammer dynamically to avoid type issues
let Hammer: { new(element: HTMLElement): HammerManager; DIRECTION_ALL: number } | undefined;
if (typeof window !== 'undefined') {
  import('hammerjs').then(module => {
    Hammer = module.default;
  });
}

export const MindmapView = forwardRef<SVGSVGElement>((props, ref) => {
  const { theme } = useTheme();
  const { mindmapData, setMindmapRef, prompt } = useMindmapStore();
  const { isOpen } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  // Explicitly define types for refs to fix the TypeScript issue
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hammerRef = useRef<HammerManager | null>(null);
  const [toolbarOffscreen, setToolbarOffscreen] = useState(false);
  
  // Setup fullscreen styles
  useEffect(() => {
    return setupFullscreenStyles();
  }, []);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize the mindmap with hooks
  const { 
    markmapInstance, 
    isFullscreen, 
    handleZoom, 
    handleFullscreenToggle 
  } = useMindmap(
    ref as React.RefObject<SVGSVGElement | null>,
    containerRef,
    mindmapData,
    theme,
    setMindmapRef
  );
  
  // Setup draggable toolbar
  const { 
    position: toolbarPosition, 
    resetPosition,
    isFirstVisit,
    handleResizeStart
  } = useDraggableToolbar(
    toolbarRef,
    containerRef
  );

  // Setup touch gestures for mobile
  useEffect(() => {
    if (isMobile && containerRef.current && ref && Hammer) {
      // Setup hammer.js for touch gestures
      const hammer = new Hammer(containerRef.current);
      
      // Enable pinch recognition
      hammer.get('pinch').set({ enable: true });
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
      
      // Handle pinch to zoom
      hammer.on('pinch', (e: { scale: number }) => {
        if (markmapInstance) {
          // Calculate new scale from pinch gesture
          const newScale = Math.max(0.5, Math.min(3, scale * e.scale));
          setScale(newScale);
          
          // Apply zoom to the markmap
          const svgElement = ref as React.RefObject<SVGSVGElement>;
          if (svgElement.current) {
            const svg = d3.select(svgElement.current);
            const g = svg.select('g');
            
            g.attr('transform', `translate(${panOffset.x},${panOffset.y}) scale(${newScale})`);
          }
        }
      });
      
      // Handle pan/drag to move
      hammer.on('pan', (e: { deltaX: number; deltaY: number }) => {
        if (markmapInstance) {
          // Update pan offset based on gesture
          setPanOffset({
            x: panOffset.x + e.deltaX / scale,
            y: panOffset.y + e.deltaY / scale
          });
          
          // Apply pan to the markmap
          const svgElement = ref as React.RefObject<SVGSVGElement>;
          if (svgElement.current) {
            const svg = d3.select(svgElement.current);
            const g = svg.select('g');
            
            g.attr('transform', `translate(${panOffset.x},${panOffset.y}) scale(${scale})`);
          }
        }
      });
      
      hammerRef.current = hammer;
      
      return () => {
        hammer.destroy();
      };
    }
  }, [isMobile, markmapInstance, ref, scale, panOffset]);

  // Auto-fit the content on mobile when mindmap loads
  useEffect(() => {
    if (isMobile && markmapInstance && ref) {
      const svgElement = ref as React.RefObject<SVGSVGElement>;
      if (svgElement.current) {
        // Small delay to ensure mindmap is rendered
        setTimeout(() => {
          fitContent(svgElement.current);
          // Reset scale and offset after fitting
          setScale(1);
          setPanOffset({ x: 0, y: 0 });
        }, 500);
      }
    }
  }, [isMobile, markmapInstance, mindmapData, ref]);
  
  // Check if toolbar is mostly offscreen and show recovery button
  useEffect(() => {
    if (!isMobile && toolbarRef.current && containerRef.current) {
      const checkToolbarPosition = () => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        const toolbarRect = toolbarRef.current?.getBoundingClientRect();
        
        if (containerRect && toolbarRect) {
          // Check if toolbar is mostly outside viewport or container
          const isMostlyOffscreen = 
            toolbarRect.left > containerRect.right - 40 ||
            toolbarRect.right < containerRect.left + 40 ||
            toolbarRect.top > containerRect.bottom - 40 ||
            toolbarRect.bottom < containerRect.top + 40;
            
          setToolbarOffscreen(isMostlyOffscreen);
        }
      };
      
      // Check initial position
      checkToolbarPosition();
      
      // Create a mutation observer to detect toolbar position changes
      const observer = new MutationObserver(checkToolbarPosition);
      observer.observe(toolbarRef.current, { attributes: true, attributeFilter: ['style'] });
      
      return () => observer.disconnect();
    }
  }, [isMobile]);
  
  // Handlers for mindmap controls
  const handleZoomIn = () => {
    const newScale = Math.min(3, scale * 1.25);
    setScale(newScale);
    handleZoom(1.25);
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(0.5, scale * 0.8);
    setScale(newScale);
    handleZoom(0.8);
  };
  
  const handleRefit = () => {
    const svgElement = ref as React.RefObject<SVGSVGElement>;
    if (svgElement.current && markmapInstance) {
      fitContent(svgElement.current);
      // Reset scale and offset after fitting
      setScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Add this effect to reapply styles when theme changes
 // Add this effect to reapply styles when theme changes
 useEffect(() => {
  if (markmapInstance && ref && 'current' in ref && ref.current) {
    // Reapply all styling when theme changes
    applyTextStyles(ref.current, theme);
    
    // Slightly delay adding node boxes to ensure theme is properly applied
    setTimeout(() => {
      if (ref && 'current' in ref && ref.current) {
        initializeMarkmap(
          mindmapData || '', 
          ref, 
          { current: markmapInstance as unknown as Markmap }, // Cast to expected type
          containerRef, 
          theme
        );
      }
    }, 100);
  }
}, [theme, markmapInstance, mindmapData, ref, containerRef]);

  if (!mindmapData) {
    return null;
  }

  return (
    <div 
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        isFullscreen ? "fullscreen-mindmap" : "",
        // Only apply scaling on desktop when sidebar is open
        !isMobile && isOpen && "md:scale-[0.85] md:transform-gpu transition-transform duration-300 ease-in-out",
        // Make container touchable on mobile
        isMobile && "touch-manipulation",
        // Add overflow visible to allow toolbar to move outside
        "overflow-visible isolate"
      )}
      style={{ 
        transformOrigin: "center center",
        position: "relative", // Ensure proper positioning context
        zIndex: 10, // Create stacking context
        padding: "30px", // Add padding to make it easier to grab toolbar when positioned outside
      }}
      ref={containerRef}
    >
      <svg
        ref={ref}
        className="w-full h-full markmap dark:text-black"
      />
      
      {/* Mobile-friendly controls */}
      {isMobile && (
        <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20 mindmap-controls">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={handleRefit}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Only show draggable toolbar on non-mobile */}
      {!isMobile && (
        <MindmapToolbar
          ref={toolbarRef}
          svgRef={ref as React.RefObject<SVGSVGElement | null>}
          markmapInstance={markmapInstance as Markmap | null}
          toolbarPosition={toolbarPosition}
          isFullscreen={isFullscreen}
          theme={theme}
          prompt={prompt}
          onZoom={handleZoom}
          onFullscreenToggle={handleFullscreenToggle}
          onResetPosition={resetPosition}
          isFirstVisit={isFirstVisit}
          handleResizeStart={handleResizeStart}
        />
      )}
      
      {/* Reset button for offscreen toolbar */}
      {!isMobile && toolbarOffscreen && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-lg bg-primary text-primary-foreground z-50 animate-pulse"
          onClick={resetPosition}
          title="Reset toolbar position"
        >
          <Undo2 className="h-4 w-4" />
          <span className="sr-only">Reset toolbar position</span>
        </Button>
      )}
    </div>
  );
});

MindmapView.displayName = 'MindmapView';