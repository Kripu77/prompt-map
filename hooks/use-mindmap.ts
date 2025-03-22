import { useState, useEffect, RefObject } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { applyTextStyles } from '@/lib/theme-utils';
import { toggleFullscreen } from '@/lib/mindmap-utils';
import { addNodeBoxes } from '@/lib/mindmap-node-boxes';

const transformer = new Transformer();

/**
 * Custom hook to manage markmap functionality
 */
export const useMindmap = (
  svgRef: RefObject<SVGSVGElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  mindmapData: string | null,
  theme: string | undefined,
  setMindmapRef: (ref: SVGSVGElement) => void
) => {
  const [markmapInstance, setMarkmapInstance] = useState<Markmap | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Initialize markmap when ref changes
  useEffect(() => {
    if (svgRef.current && !markmapInstance) {
      const mm = Markmap.create(svgRef.current);
      setMarkmapInstance(mm);
      
      // Store the svg element in the store for external access
      setMindmapRef(svgRef.current);
    }
  }, [svgRef, markmapInstance, setMindmapRef]);

  // Update markmap data when mindmapData changes
  useEffect(() => {
    if (markmapInstance && mindmapData) {
      try {
        const { root } = transformer.transform(mindmapData);
        markmapInstance.setData(root);
        setTimeout(() => {
          markmapInstance.fit();
          
          // Apply text styles and node boxes after rendering
          if (svgRef.current) {
            applyTextStyles(svgRef.current, theme);
            addNodeBoxes(svgRef.current, theme);
          }
          
          // Apply again after a slight delay to ensure proper rendering
          setTimeout(() => {
            if (svgRef.current) {
              addNodeBoxes(svgRef.current, theme);
            }
          }, 500);
        }, 100);
      } catch (error) {
        console.error('Error transforming mindmap data:', error);
      }
    }
  }, [markmapInstance, mindmapData, theme, svgRef]);

  // Apply text styles when theme changes
  useEffect(() => {
    if (svgRef.current) {
      applyTextStyles(svgRef.current, theme);
      
      // Also apply again after a short delay to ensure changes take effect
      const timer = setTimeout(() => {
        if (svgRef.current) {
          applyTextStyles(svgRef.current, theme);
        }
      }, 150);
      
      // Ensure the HTML element has the data-theme attribute
      document.documentElement.setAttribute('data-theme', theme || 'dark');
      
      return () => clearTimeout(timer);
    }
  }, [theme, svgRef]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // Center the mindmap both on entering and exiting fullscreen
      if (markmapInstance && svgRef.current) {
        // Give time for the browser to adjust to fullscreen change
        setTimeout(() => {
          try {
            // Try to use smooth transition for centering
            const markmapAny = markmapInstance as any;
            if (markmapAny.svg && markmapAny.zoom) {
              // Get the target transform for centering
              const targetTransform = markmapAny.computeFitTransform?.() || markmapAny.initialTransform;
              
              if (targetTransform) {
                // Apply smooth transition to center
                markmapAny.svg
                  .transition()
                  .duration(400)
                  .ease((_: any) => (t: number) => {
                    return 1 - Math.pow(1 - t, 3);
                  })
                  .call(markmapAny.zoom.transform, targetTransform);
              } else {
                // Fallback to standard fit
                markmapInstance.fit();
              }
            } else {
              // Fallback to standard fit
              markmapInstance.fit();
            }
            
            // Re-apply text styles
            setTimeout(() => {
              if (svgRef.current) {
                applyTextStyles(svgRef.current, theme);
              }
            }, 450);
          } catch (error) {
            console.error('Error centering after fullscreen change:', error);
            // Fallback
            markmapInstance.fit();
          }
        }, isNowFullscreen ? 200 : 100); // Shorter delay when exiting fullscreen
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [markmapInstance, svgRef, theme]);

  /**
   * Handle zooming of the mindmap
   */
  const handleZoom = (scale: number) => {
    if (!markmapInstance || !svgRef.current) return;
    
    try {
      // Different markmap versions have different ways to handle zooming
      // First method - direct zoom control
      const markmapAny = markmapInstance as any;
      if (markmapAny.zoom && typeof markmapAny.zoom.scaleBy === 'function' && markmapAny.svg) {
        markmapAny.zoom.scaleBy(markmapAny.svg, scale);
      } 
      // Second method - rescale method
      else if (typeof markmapAny.rescale === 'function') {
        markmapAny.rescale(scale);
      }
      // Third method - try getting zoom from __data__
      else {
        const svgAny = svgRef.current as any;
        if (svgAny.__data__ && svgAny.__data__.zoom && typeof svgAny.__data__.zoom.scaleBy === 'function') {
          svgAny.__data__.zoom.scaleBy(svgAny.__data__.svg || markmapAny.svg || svgRef.current, scale);
        }
      }
      
      // Re-apply text styles and node boxes after zooming
      setTimeout(() => {
        if (svgRef.current) {
          applyTextStyles(svgRef.current, theme);
          addNodeBoxes(svgRef.current, theme);
          
          // Also reapply at progressive intervals to ensure styling sticks
          setTimeout(() => {
            if (svgRef.current) {
              addNodeBoxes(svgRef.current, theme);
            }
          }, 200);
          
          setTimeout(() => {
            if (svgRef.current) {
              addNodeBoxes(svgRef.current, theme);
            }
          }, 500);
        }
      }, 350);
    } catch (error) {
      console.error('Error during zoom operation:', error);
    }
  };

  /**
   * Handle fullscreen toggling with animation
   */
  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    
    // Store current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Apply a subtle scale animation before toggling fullscreen
    containerRef.current.style.transition = 'transform 0.2s ease-in-out';
    
    // Different scale effect based on direction
    if (isFullscreen) {
      // Exiting fullscreen - scale down slightly
      containerRef.current.style.transform = 'scale(0.95)';
    } else {
      // Entering fullscreen - scale down slightly
      containerRef.current.style.transform = 'scale(0.95)';
      
      // Ensure theme class is applied before entering fullscreen
      const isDarkTheme = document.documentElement.classList.contains('dark');
      containerRef.current.classList.remove('light-theme', 'dark-theme');
      containerRef.current.classList.add(isDarkTheme ? 'dark-theme' : 'light-theme');
    }
    
    // After a short delay, toggle fullscreen
    setTimeout(() => {
      toggleFullscreen(containerRef.current);
      
      // Reset the transform with a smoother transition
      if (containerRef.current) {
        // Adjust the transition timing
        containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        containerRef.current.style.transform = 'scale(1)';
        
        // Restore scroll position after exiting fullscreen
        if (isFullscreen) {
          setTimeout(() => {
            window.scrollTo(scrollX, scrollY);
          }, 50);
        }
      }
    }, 100);
  };

  return {
    markmapInstance,
    isFullscreen,
    handleZoom,
    handleFullscreenToggle
  };
}; 