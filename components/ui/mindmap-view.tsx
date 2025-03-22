"use client"

import React, { useRef, forwardRef } from 'react';
import { useMindmapStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import '@/lib/markmap-defaults';
import { setupFullscreenStyles } from '@/lib/theme-utils';
import { useMindmap } from '@/hooks/use-mindmap';
import { useDraggableToolbar } from '@/hooks/use-draggable-toolbar';
import { MindmapToolbar } from './mindmap-toolbar';
import { useEffect } from 'react';
import { MindmapControls } from './mindmap-controls';
import { exportMindmap, fitContent } from '@/lib/mindmap-utils';

export const MindmapView = forwardRef<SVGSVGElement>((props, ref) => {
  const { theme } = useTheme();
  const { mindmapData, setMindmapRef, prompt } = useMindmapStore();
  // Explicitly define types for refs to fix the TypeScript issue
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Setup fullscreen styles
  useEffect(() => {
    return setupFullscreenStyles();
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

  // Handlers for mindmap controls
  const handleZoomIn = () => handleZoom(1.25);
  const handleZoomOut = () => handleZoom(0.8);
  const handleExport = () => {
    const svgElement = ref as React.RefObject<SVGSVGElement>;
    if (svgElement.current) {
      exportMindmap(svgElement.current, theme, prompt);
    }
  };
  const handleRefresh = () => {
    const svgElement = ref as React.RefObject<SVGSVGElement>;
    if (svgElement.current && markmapInstance) {
      fitContent(svgElement.current);
    }
  };

  if (!mindmapData) {
    return null;
  }

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center ${isFullscreen ? 'fullscreen-mindmap' : ''}`} 
      ref={containerRef}
    >
      <svg
        ref={ref}
        className="w-full h-full markmap"
      />
      
      {/* Legacy toolbar - can be removed or kept based on preference */}
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
      
      {/* New modern floating controls */}
      <MindmapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreenToggle}
        onExport={handleExport}
        onRefresh={handleRefresh}
        className="right-6 top-6"
      />
    </div>
  );
});

MindmapView.displayName = 'MindmapView';