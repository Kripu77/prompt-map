"use client"

import React, { useRef, forwardRef, useEffect, useState, useCallback } from 'react';
import { useMindmapStore, useSidebarStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import '@/lib/markmap-defaults';
import { setupFullscreenStyles } from '@/lib/theme-utils';
import { useMindmap } from '@/hooks/use-mindmap';
import { useDraggableToolbar } from '@/hooks/use-draggable-toolbar';
import { MindmapToolbar } from './mindmap-toolbar';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, RefreshCw, Undo2, Maximize, Minimize } from 'lucide-react';
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
  const { resolvedTheme } = useTheme();
  const { mindmapData, setMindmapRef, prompt } = useMindmapStore();
  const { isOpen } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hammerRef = useRef<HammerManager | null>(null);
  const lastPinchScaleRef = useRef(1); // To track the last pinch scale
  const [toolbarOffscreen, setToolbarOffscreen] = useState(false);
  
  // Setup fullscreen styles
  useEffect(() => {
    return setupFullscreenStyles();
  }, []);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Set initial scale for mobile when component first loads
      if (isMobileDevice && scale === 1) {
        setScale(0.75);
      }
    };
    
    // Check on mount
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [scale]);
  
  // Initialize the mindmap with hooks
  const { 
    markmapInstance, 
    isFullscreen, 
    handleZoom: baseHandleZoom, 
    handleFullscreenToggle,
  } = useMindmap(
    ref as React.RefObject<SVGSVGElement | null>,
    containerRef,
    mindmapData,
    resolvedTheme,
    setMindmapRef
  );
  
  // Create a custom zoom handler that updates our scale state
  const handleZoom = useCallback((scaleFactor: number) => {
    setScale(prevScale => {
      const newScale = Math.max(0.5, Math.min(3, prevScale * scaleFactor));
      // Call the base zoom handler with the same factor
      baseHandleZoom(scaleFactor);
      return newScale;
    });
  }, [baseHandleZoom]);
  
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

  // Better handling of scale updates for pinch gestures
  const handlePinchUpdate = useCallback((e: { scale: number }) => {
    if (!markmapInstance || !ref || !('current' in ref) || !ref.current) return;
    
    // Calculate scale change relative to the last pinch event
    const scaleFactor = e.scale / lastPinchScaleRef.current;
    lastPinchScaleRef.current = e.scale;
    
    if (Math.abs(scaleFactor - 1) > 0.01) { // Only update if change is significant
      setScale(prevScale => {
        const newScale = Math.max(0.5, Math.min(3, prevScale * scaleFactor));
        
        // Apply zoom to the markmap through d3
        const svg = d3.select(ref.current as SVGSVGElement);
        const g = svg.select('g');
        
        // Extract current transform
        const transform = g.attr('transform') || '';
        const translateMatch = /translate\(([-\d.]+),\s*([-\d.]+)\)/.exec(transform);

        
        const currentX = translateMatch ? parseFloat(translateMatch[1]) : 0;
        const currentY = translateMatch ? parseFloat(translateMatch[2]) : 0;
        
        // Apply updated transform
        g.attr('transform', `translate(${currentX},${currentY}) scale(${newScale})`);
        
        return newScale;
      });
    }
  }, [markmapInstance, ref]);

  // Setup touch gestures for mobile with improved scale tracking
  useEffect(() => {
    if (isMobile && containerRef.current && ref && 'current' in ref && Hammer) {
      // Setup hammer.js for touch gestures
      const hammer = new Hammer(containerRef.current);
      
      // Enable pinch and pan
      hammer.get('pinch').set({ enable: true });
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
      
      // Reset the pinch scale reference when starting a new pinch
      hammer.on('pinchstart', () => {
        lastPinchScaleRef.current = 1;
      });
      
      // Handle pinch to zoom with improved scale tracking
      hammer.on('pinch', handlePinchUpdate);
      
      // Handle pan/drag with improved state tracking
      hammer.on('pan', (e: { deltaX: number; deltaY: number }) => {
        if (!markmapInstance || !ref || !('current' in ref) || !ref.current) return;
        
        const newPanOffset = {
          x: panOffset.x + e.deltaX / scale,
          y: panOffset.y + e.deltaY / scale
        };
        
        setPanOffset(newPanOffset);
        
        // Apply pan through d3
        const svg = d3.select(ref.current as SVGSVGElement);
        const g = svg.select('g');
        g.attr('transform', `translate(${newPanOffset.x},${newPanOffset.y}) scale(${scale})`);
      });
      
      hammerRef.current = hammer;
      
      return () => {
        hammer.destroy();
      };
    }
  }, [isMobile, markmapInstance, ref, scale, panOffset, handlePinchUpdate]);

  // Improved auto-fit for mobile that properly sets the scale state
  useEffect(() => {
    if (isMobile && markmapInstance && ref && mindmapData) {
      // When mindmap data changes, wait for rendering to complete
      const timer = setTimeout(() => {
        const svgElement = ref as React.RefObject<SVGSVGElement>;
        if (!svgElement.current) return;
        
        try {
          // First run the built-in fit method
          markmapInstance.fit();
          
          // Apply mobile-friendly scale with a short delay
          setTimeout(() => {
            // Set mobile scale
            const mobileScale = 0.75;
            setScale(mobileScale); // Update state to match visual scale
            
            // Apply the scale transformation
            const svg = d3.select(svgElement.current);
            const g = svg.select('g');
            
            // Get current transform values after fitting
            const transform = g.attr('transform') || '';
            const match = /translate\(([-\d.]+),\s*([-\d.]+)\)/.exec(transform);
            
            if (match) {
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              
              // Apply new transform with scale
              g.transition()
                .duration(300)
                .attr('transform', `translate(${x},${y}) scale(${mobileScale})`);
              
              // Update pan offset to match the current position
              setPanOffset({ x, y });
            }
          }, 300);
        } catch (error) {
          console.error("Mobile initialization error:", error);
          
          // Use fallback approach
          try {
            markmapInstance.fit();
            setScale(0.75);
            setPanOffset({ x: 0, y: 0 });
          } catch (e) {
            console.error("Fallback fit failed:", e);
          }
        }
      }, 800); 
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, markmapInstance, mindmapData, ref]);
  
  // Check if toolbar is mostly offscreen
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
  
  // Handlers for mindmap controls with improved scale tracking
  const handleZoomIn = useCallback(() => {
    const scaleFactor = 1.25;
    setScale(prevScale => {
      const newScale = Math.min(3, prevScale * scaleFactor);
      handleZoom(scaleFactor);
      return newScale;
    });
  }, [handleZoom]);
  
  const handleZoomOut = useCallback(() => {
    const scaleFactor = 0.8;
    setScale(prevScale => {
      const newScale = Math.max(0.5, prevScale * scaleFactor);
      handleZoom(scaleFactor);
      return newScale;
    });
  }, [handleZoom]);
  
  // Improved refit function that properly updates scale state
  const handleRefit = useCallback(() => {
    if (!ref || !('current' in ref) || !ref.current || !markmapInstance) {
      return;
    }
    
    try {
      if (isMobile) {
        // For mobile, use a sequence of operations
        markmapInstance.fit();
        
        // Apply mobile scale
        setTimeout(() => {
          const mobileScale = 0.75;
          setScale(mobileScale);
          
          const svg = d3.select(ref.current as SVGSVGElement);
          const g = svg.select('g');
          
          // Get current transform after fit
          const transform = g.attr('transform') || '';
          const match = /translate\(([-\d.]+),\s*([-\d.]+)\)/.exec(transform);
          
          if (match) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            
            // Apply with transition
            g.transition()
              .duration(300)
              .attr('transform', `translate(${x},${y}) scale(${mobileScale})`);
            
            // Reset pan offset to the new position
            setPanOffset({ x, y });
          }
        }, 300);
      } else {
        // Desktop approach
        markmapInstance.fit();
        setScale(1);
        setPanOffset({ x: 0, y: 0 });
      }
      
      // Reset pinch tracking
      lastPinchScaleRef.current = 1;
    } catch (error) {
      console.error("Error in handleRefit:", error);
      // Fallback
      try {
        markmapInstance.fit();
        setScale(isMobile ? 0.75 : 1);
        setPanOffset({ x: 0, y: 0 });
      } catch (e) {
        console.error("Final fallback fit failed:", e);
      }
    }
  }, [isMobile, markmapInstance, ref]);

  // Reapply styles when theme changes
  useEffect(() => {
    if (markmapInstance && ref && 'current' in ref && ref.current) {
      // Reapply styling when theme changes
      applyTextStyles(ref.current, resolvedTheme);
      
      // Delay adding node boxes
      setTimeout(() => {
        if (ref && 'current' in ref && ref.current) {
          initializeMarkmap(
            mindmapData || '', 
            ref, 
            { current: markmapInstance as unknown as Markmap },
            containerRef, 
            resolvedTheme
          );
        }
      }, 100);
    }
  }, [resolvedTheme, markmapInstance, mindmapData, ref, containerRef]);

  if (!mindmapData) {
    return null;
  }

  return (
    <div 
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        isFullscreen ? "fullscreen-mindmap" : "",
        !isMobile && isOpen && "md:scale-[0.85] md:transform-gpu transition-transform duration-300 ease-in-out",
        isMobile && "touch-manipulation",
        "overflow-visible isolate"
      )}
      ref={containerRef}
    >
      <svg
        ref={ref}
        className={cn(
          "w-full h-full markmap dark:text-black",
          isMobile && "mobile-markmap"
        )}
      />
      
      {/* Mobile-friendly controls */}
      {isMobile && (
        <div className="absolute bottom-0 right-4 flex flex-col gap-2 z-20 mindmap-controls">
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
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRefit();
            }}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={handleFullscreenToggle}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFullscreenToggle();
            }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
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
          theme={resolvedTheme}
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