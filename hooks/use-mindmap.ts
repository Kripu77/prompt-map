import { useState, useEffect, RefObject, useCallback, useMemo } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { applyTextStyles } from '@/lib/theme-utils';
import { toggleFullscreen } from '@/lib/mindmap-utils';
import { addNodeBoxes } from '@/lib/mindmap-node-boxes';
import { debounce } from 'lodash';
import { ZoomBehavior } from 'd3';
import { INode } from 'markmap-common';

// Create a transformer instance once, not on each render
const transformer = new Transformer();

// Better typing for Markmap instance with proper d3 zoom behavior
interface MarkmapWithMethods {
  // Include all standard Markmap methods we need
  setData: (data: any) => void;
  fit: () => void;
  
  // Extended properties and methods for our specific usage
  svg: any; 
  zoom?: ZoomBehavior<SVGElement, INode> & { 
    scaleBy?: (element: any, scale: number) => void;
    transform?: (element: any, transform: any) => void;
  };
  computeFitTransform?: () => any;
  initialTransform?: any;
  rescale?: (scale: number) => void;
}

// Type assertion helper function
export function asMarkmapWithMethods(markmap: Markmap): MarkmapWithMethods {
  return markmap as unknown as MarkmapWithMethods;
}

/**
 * Hook to initialize the markmap
 */
export const useMarkmapInit = (
  svgRef: RefObject<SVGSVGElement | null>,
  setMindmapRef: (ref: SVGSVGElement) => void
) => {
  const [markmapInstance, setMarkmapInstance] = useState<MarkmapWithMethods | null>(null);

  useEffect(() => {
    if (svgRef.current && !markmapInstance) {
      try {
        const mm = asMarkmapWithMethods(Markmap.create(svgRef.current));
        setMarkmapInstance(mm);
        setMindmapRef(svgRef.current);
      } catch (error) {
        console.error('Error initializing markmap:', error);
      }
    }

    // Cleanup function
    return () => {
      // Any cleanup needed for markmap instance
    };
  }, [svgRef, markmapInstance, setMindmapRef]);

  return markmapInstance;
};

/**
 * Hook to handle markmap data updates
 */
export const useMarkmapData = (
  markmapInstance: MarkmapWithMethods | null,
  svgRef: RefObject<SVGSVGElement | null>,
  mindmapData: string | null,
  theme?: string
) => {
  // Memoize the root data to prevent unnecessary updates
  const rootData = useMemo(() => {
    if (!mindmapData) return null;
    try {
      const { root } = transformer.transform(mindmapData);
      return root;
    } catch (error) {
      console.error('Error transforming mindmap data:', error);
      return null;
    }
  }, [mindmapData]);

  // Apply styling with debouncing to prevent excessive updates
  const applyStyles = useCallback(
    debounce(() => {
      if (svgRef.current) {
        applyTextStyles(svgRef.current, theme);
        addNodeBoxes(svgRef.current, theme);
      }
    }, 100),
    [svgRef, theme]
  );

  // Update markmap when data changes
  useEffect(() => {
    if (markmapInstance && rootData) {
      try {
        markmapInstance.setData(rootData);
        
        // Use a proper timing mechanism for the fit and styling
        const fitTimer = setTimeout(() => {
          markmapInstance.fit();
          applyStyles();
          
          // Apply styles once more after animation completes
          const styleTimer = setTimeout(applyStyles, 500);
          return () => clearTimeout(styleTimer);
        }, 100);
        
        return () => clearTimeout(fitTimer);
      } catch (error) {
        console.error('Error updating mindmap data:', error);
      }
    }
  }, [markmapInstance, rootData, applyStyles]);

  // Apply text styles when theme changes
  useEffect(() => {
    if (svgRef.current) {
      applyStyles();
      document.documentElement.setAttribute('data-theme', theme || 'dark');
    }
  }, [theme, svgRef, applyStyles]);

  return { updateSuccess: !!rootData };
};

/**
 * Hook to handle fullscreen functionality
 */
export const useMarkmapFullscreen = (
  markmapInstance: MarkmapWithMethods | null,
  svgRef: RefObject<SVGSVGElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  theme?: string
) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Centralize the logic to fit the mindmap with transition
  const fitWithTransition = useCallback(() => {
    if (!markmapInstance || !svgRef.current) return;
    
    try {
      if (markmapInstance.svg && markmapInstance.zoom) {
        const targetTransform = markmapInstance.computeFitTransform?.() || 
                               markmapInstance.initialTransform;
        
        if (targetTransform) {
          markmapInstance.svg
            .transition()
            .duration(400)
            .ease((_: any) => (t: number) => 1 - Math.pow(1 - t, 3))
            .call(markmapInstance.zoom.transform, targetTransform);
        } else {
          markmapInstance.fit();
        }
      } else {
        markmapInstance.fit();
      }
      
      // Apply styles after transition
      setTimeout(() => {
        if (svgRef.current) {
          applyTextStyles(svgRef.current, theme);
        }
      }, 450);
    } catch (error) {
      console.error('Error fitting mindmap:', error);
      // Fallback
      markmapInstance.fit();
    }
  }, [markmapInstance, svgRef, theme]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      if (markmapInstance && svgRef.current) {
        // Give time for the browser to adjust to fullscreen change
        setTimeout(fitWithTransition, isNowFullscreen ? 200 : 100);
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [markmapInstance, svgRef, fitWithTransition]);

  // Toggle fullscreen with animation
  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    
    // Store current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Use CSS classes instead of inline styles for animations
    containerRef.current.classList.add('transition-transform', 'duration-200', 'scale-95');
    
    // Ensure theme class is applied before entering fullscreen
    if (!isFullscreen) {
      const isDarkTheme = document.documentElement.classList.contains('dark');
      containerRef.current.classList.remove('light-theme', 'dark-theme');
      containerRef.current.classList.add(isDarkTheme ? 'dark-theme' : 'light-theme');
    }
    
    // Toggle fullscreen after animation
    setTimeout(() => {
      toggleFullscreen(containerRef.current);
      
      if (containerRef.current) {
        containerRef.current.classList.remove('scale-95');
        containerRef.current.classList.add('scale-100', 'duration-300');
        
        // Restore scroll position after exiting fullscreen
        if (isFullscreen) {
          setTimeout(() => window.scrollTo(scrollX, scrollY), 50);
        }
        
        // Clean up animation classes
        setTimeout(() => {
          containerRef.current?.classList.remove('transition-transform', 'duration-300', 'scale-100');
        }, 350);
      }
    }, 100);
  }, [isFullscreen, containerRef]);

  return {
    isFullscreen,
    handleFullscreenToggle,
    fitWithTransition
  };
};

/**
 * Hook to handle zoom controls
 */
export const useMarkmapZoom = (
  markmapInstance: MarkmapWithMethods | null,
  svgRef: RefObject<SVGSVGElement | null>,
  theme?: string
) => {
  // Improved zoom with more robust approach and better typing
  const handleZoom = useCallback((scale: number) => {
    if (!markmapInstance || !svgRef.current) return;
    
    try {
      const mm = markmapInstance;
      
      // Try each zoom method in order of preference
      if (mm.zoom?.scaleBy && mm.svg) {
        mm.zoom.scaleBy(mm.svg, scale);
      } 
      else if (typeof mm.rescale === 'function') {
        mm.rescale(scale);
      }
      else {
        const svg = svgRef.current as any;
        if (svg.__data__?.zoom?.scaleBy) {
          svg.__data__.zoom.scaleBy(svg.__data__.svg || mm.svg || svgRef.current, scale);
        } else {
          throw new Error('No zoom method available');
        }
      }
      
      // Apply styles after zoom with debounce
      const applyStylesDebounced = debounce(() => {
        if (svgRef.current) {
          applyTextStyles(svgRef.current, theme);
          addNodeBoxes(svgRef.current, theme);
        }
      }, 200);
      
      applyStylesDebounced();
      
    } catch (error) {
      console.error('Error during zoom operation:', error);
    }
  }, [markmapInstance, svgRef, theme]);

  return { handleZoom };
};

/**
 * Main hook that composes all the specialized hooks
 */
export const useMindmap = (
  svgRef: RefObject<SVGSVGElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  mindmapData: string | null,
  theme: string | undefined,
  setMindmapRef: (ref: SVGSVGElement) => void
) => {
  // Initialize markmap
  const markmapInstance = useMarkmapInit(svgRef, setMindmapRef);
  
  // Handle data updates
  const { updateSuccess } = useMarkmapData(markmapInstance, svgRef, mindmapData, theme);
  
  // Handle fullscreen
  const { isFullscreen, handleFullscreenToggle, fitWithTransition } = 
    useMarkmapFullscreen(markmapInstance, svgRef, containerRef, theme);
  
  // Handle zoom
  const { handleZoom } = useMarkmapZoom(markmapInstance, svgRef, theme);

  return {
    markmapInstance,
    isFullscreen,
    handleZoom,
    handleFullscreenToggle,
    fitMindmap: fitWithTransition,
    updateSuccess
  };
};