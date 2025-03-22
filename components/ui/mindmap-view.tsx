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
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Button } from './button';
import * as d3 from 'd3';

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
    isFirstVisit
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
        isMobile && "touch-manipulation"
      )}
      style={{ 
        transformOrigin: "center center",
      }}
      ref={containerRef}
    >
      <svg
        ref={ref}
        className="w-full h-full markmap"
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
          markmapInstance={markmapInstance}
          toolbarPosition={toolbarPosition}
          isFullscreen={isFullscreen}
          theme={theme}
          prompt={prompt}
          onZoom={handleZoom}
          onFullscreenToggle={handleFullscreenToggle}
          onResetPosition={resetPosition}
          isFirstVisit={isFirstVisit}
        />
      )}
    </div>
  );
});

MindmapView.displayName = 'MindmapView';