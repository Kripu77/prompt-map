"use client"

import React, { useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { useMindmapStore } from '@/lib/store';
import { ZoomControls } from './zoom-controls';
import { transformer } from '@/lib';
import { Button } from './button';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from "sonner";


interface MindmapViewProps {
  data: string;
}

export function MindmapView({ data }: MindmapViewProps) {
  const refSvg = useRef<SVGSVGElement>(null);
  const refMm = useRef<Markmap | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setMindmapRef } = useMindmapStore();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { mindmapData, mindmapRef } = useMindmapStore();
  const { theme } = useTheme();

  // Store the container reference in the global state
  useEffect(() => {
    if (containerRef.current) {
      //@ts-ignore
      setMindmapRef(containerRef);
    }
  }, [containerRef, setMindmapRef]);

  useEffect(() => {
    if (refMm.current) return;
    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
  }, [refSvg.current]);

  useEffect(() => {
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(data);
    mm.setData(root).then(() => {
     mm.fit();
    });
  }, [refMm.current, data]);

  const handleZoomIn = () => {
    if (refMm.current) {
      refMm.current.rescale(1.25);
    }
  };

  const handleZoomOut = () => {
    if (refMm.current) {
      refMm.current.rescale(0.8);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleExport = async () => {
    if (mindmapRef?.current) {
      try {
        const container = mindmapRef.current;
        const svg = container.querySelector('svg');
        if (!svg) return;

        // Store original scroll position and fullscreen state
        const originalScroll = {
          x: container.scrollLeft,
          y: container.scrollTop
        };
        const wasFullscreen = !!document.fullscreenElement;

        // Enter fullscreen for capture if not already in fullscreen
        if (!wasFullscreen) {
          await container.requestFullscreen();
        }

        // Store original dimensions and styles
        const originalStyle = {
          width: container.style.width,
          height: container.style.height,
          overflow: container.style.overflow,
          background: container.style.background
        };

        const originalSvgStyle = {
          background: svg.style.background
        };

        // Set container to match SVG dimensions with proper padding
        const svgBBox = svg.getBBox();
        const padding = 200;
        container.style.width = `${svgBBox.width + padding}px`;
        container.style.height = `${svgBBox.height + padding}px`;
        container.style.overflow = 'visible';
        
        // Ensure SVG is centered within the container
        svg.style.margin = `${padding/2}px`;
        svg.style.display = 'block';

        // Apply theme-based background
        const bgColor = theme === 'dark' ? '#000' : '#fff';
        container.style.background = bgColor;
        svg.style.background = bgColor;
      

        // Wait a moment for the fullscreen transition
        await new Promise(resolve => setTimeout(resolve, 100));

        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(container, { quality: 1, pixelRatio: 2 })

        // Restore original dimensions and styles
        container.style.width = originalStyle.width;
        container.style.height = originalStyle.height;
        container.style.overflow = originalStyle.overflow;
        container.style.background = originalStyle.background;
        svg.style.background = originalSvgStyle.background;

        // Exit fullscreen if we entered it for capture
        if (!wasFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        }

        // Restore original scroll position
        container.scrollLeft = originalScroll.x;
        container.scrollTop = originalScroll.y;

        const link = document.createElement("a")
        link.download = "mindmap.png"
        link.href = dataUrl
        link.click()
        toast("Mind map exported successfully!");
      } catch (err) {
        toast.error("Error exporting mind map")
        // Ensure we exit fullscreen on error if we entered it
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      }
    }
  }
  

  return (
    <div className="w-full h-full" ref={containerRef}>
      <svg className="w-full h-full [&_g]:text-black dark:[&_g]:text-white" style={{ transform: 'scale(1)', transformOrigin: 'center' }} ref={refSvg} />
      <div className="fixed bottom-44 right-4 p-2 bg-gray-800 rounded-md shadow-lg z-20 flex gap-2">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600">
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom In</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600">
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
        </Button>
        {mindmapData && (
              <Button onClick={handleExport} variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Export Mind Map</span>
              </Button>
            )}
      </div>
    </div>
  );
}